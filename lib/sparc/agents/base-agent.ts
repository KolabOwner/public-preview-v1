import {
  Agent,
  AgentTask,
  AgentTaskResult,
  AgentMessage,
  AgentResponse,
  ReviewResult,
  Decision,
  SparcConfig,
  AIProvider,
  AIExecutionOptions
} from '../types';
import { Logger } from '../utils/logger';

export abstract class BaseAgent implements Agent {
  abstract role: string;
  abstract priority: 'low' | 'medium' | 'high' | 'critical';
  abstract vetoRights: boolean;
  abstract responsibilities: string[];
  
  protected logger: Logger;
  protected systemPrompt: string;

  constructor(
    protected config: SparcConfig,
    protected aiProvider: AIProvider
  ) {
    this.logger = new Logger(`${this.role}Agent`);
    this.systemPrompt = this.buildSystemPrompt();
  }

  protected abstract buildSystemPrompt(): string;

  async execute(task: AgentTask): Promise<AgentTaskResult> {
    this.logger.info(`Executing task: ${task.id} - ${task.description}`);
    
    try {
      const prompt = this.buildTaskPrompt(task);
      const options: AIExecutionOptions = {
        systemPrompt: this.systemPrompt,
        temperature: 0.7,
        maxTokens: 4096
      };

      const response = await this.aiProvider.execute(prompt, options);
      const result = this.parseTaskResponse(response.content, task);

      this.logger.info(`Task ${task.id} completed successfully`);
      return result;

    } catch (error) {
      this.logger.error(`Task ${task.id} failed`, error);
      return {
        taskId: task.id,
        success: false,
        error: error as Error
      };
    }
  }

  async review(artifact: any): Promise<ReviewResult> {
    const prompt = this.buildReviewPrompt(artifact);
    const options: AIExecutionOptions = {
      systemPrompt: this.systemPrompt,
      temperature: 0.3, // Lower temperature for more consistent reviews
      maxTokens: 2048
    };

    try {
      const response = await this.aiProvider.execute(prompt, options);
      return this.parseReviewResponse(response.content);
    } catch (error) {
      this.logger.error('Review failed', error);
      return {
        approved: false,
        feedback: ['Review failed due to error'],
        requiredChanges: [],
        vetoReason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async collaborate(message: AgentMessage): Promise<AgentResponse> {
    const prompt = this.buildCollaborationPrompt(message);
    const options: AIExecutionOptions = {
      systemPrompt: this.systemPrompt,
      temperature: 0.5,
      maxTokens: 2048
    };

    try {
      const response = await this.aiProvider.execute(prompt, options);
      return {
        from: this.role,
        content: this.parseCollaborationResponse(response.content),
        consensus: true
      };
    } catch (error) {
      this.logger.error('Collaboration failed', error);
      return {
        from: this.role,
        content: { error: error instanceof Error ? error.message : 'Unknown error' },
        consensus: false
      };
    }
  }

  protected buildTaskPrompt(task: AgentTask): string {
    return `
Task ID: ${task.id}
Type: ${task.type}
Phase: ${task.phase}
Description: ${task.description}

Input:
${JSON.stringify(task.input, null, 2)}

Dependencies: ${task.dependencies?.join(', ') || 'None'}
Priority: ${task.priority || 'Normal'}

Please complete this task according to your role and responsibilities.
Provide your output in a structured format with clear decisions and recommendations.
`;
  }

  protected buildReviewPrompt(artifact: any): string {
    return `
Please review the following artifact:

${JSON.stringify(artifact, null, 2)}

Evaluate it based on your expertise and responsibilities.
Provide:
1. Approval status (approved/not approved)
2. Feedback points
3. Required changes (if any)
4. Veto reason (if applicable)

Format your response as a structured review.
`;
  }

  protected buildCollaborationPrompt(message: AgentMessage): string {
    return `
Message from: ${message.from}
Type: ${message.type}
${message.replyTo ? `In reply to: ${message.replyTo}` : ''}

Content:
${JSON.stringify(message.content, null, 2)}

Please respond according to your role and expertise.
Consider the collaborative nature of this request.
`;
  }

  protected parseTaskResponse(content: string, task: AgentTask): AgentTaskResult {
    // Basic parsing - agents can override for specific parsing
    try {
      // Try to extract structured data
      const decisions: Decision[] = [];
      const recommendations: string[] = [];
      
      // Extract decisions (looking for patterns like "Decision:" or "Decided to")
      const decisionMatches = content.match(/(?:Decision|Decided):\s*([^\n]+)/gi);
      if (decisionMatches) {
        decisionMatches.forEach(match => {
          const description = match.replace(/(?:Decision|Decided):\s*/i, '');
          decisions.push({
            type: 'implementation',
            description,
            rationale: 'Based on analysis',
            impact: 'medium'
          });
        });
      }

      // Extract recommendations
      const recommendationMatches = content.match(/(?:Recommend|Suggestion):\s*([^\n]+)/gi);
      if (recommendationMatches) {
        recommendationMatches.forEach(match => {
          recommendations.push(match.replace(/(?:Recommend|Suggestion):\s*/i, ''));
        });
      }

      return {
        taskId: task.id,
        success: true,
        output: content,
        decisions: decisions.length > 0 ? decisions : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined
      };

    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        error: new Error('Failed to parse response')
      };
    }
  }

  protected parseReviewResponse(content: string): ReviewResult {
    // Basic parsing - agents can override for specific parsing
    const approved = content.toLowerCase().includes('approved') && 
                    !content.toLowerCase().includes('not approved');
    
    const feedback: string[] = [];
    const requiredChanges: string[] = [];
    
    // Extract feedback
    const feedbackMatches = content.match(/(?:Feedback|Issue|Concern):\s*([^\n]+)/gi);
    if (feedbackMatches) {
      feedbackMatches.forEach(match => {
        feedback.push(match.replace(/(?:Feedback|Issue|Concern):\s*/i, ''));
      });
    }

    // Extract required changes
    const changeMatches = content.match(/(?:Required change|Must|Should):\s*([^\n]+)/gi);
    if (changeMatches) {
      changeMatches.forEach(match => {
        requiredChanges.push(match.replace(/(?:Required change|Must|Should):\s*/i, ''));
      });
    }

    // Check for veto
    let vetoReason: string | undefined;
    if (content.toLowerCase().includes('veto')) {
      const vetoMatch = content.match(/(?:Veto|Reject)(?:ed)?.*?(?:because|reason|due to):\s*([^\n]+)/i);
      vetoReason = vetoMatch ? vetoMatch[1] : 'Security or compliance concerns';
    }

    return {
      approved,
      feedback: feedback.length > 0 ? feedback : undefined,
      requiredChanges: requiredChanges.length > 0 ? requiredChanges : undefined,
      vetoReason
    };
  }

  protected parseCollaborationResponse(content: string): any {
    // Try to parse as JSON first
    try {
      return JSON.parse(content);
    } catch {
      // Return as structured object
      return {
        message: content,
        timestamp: new Date().toISOString()
      };
    }
  }
}