import Anthropic from '@anthropic-ai/sdk';
import {
  AIProvider,
  AIExecutionOptions,
  AIResponse,
  SparcConfig
} from '../types';
import { Logger } from '../utils/logger';

export class ClaudeProvider implements AIProvider {
  readonly name = 'claude';
  private client: Anthropic;
  private logger: Logger;
  private model: string;

  constructor(config: SparcConfig) {
    this.logger = new Logger('ClaudeProvider');
    
    // Initialize Anthropic client
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    // Use Claude 3.5 Sonnet by default
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  }

  async execute(prompt: string, options?: AIExecutionOptions): Promise<AIResponse> {
    try {
      const systemPrompt = options?.systemPrompt || this.buildSystemPrompt(options?.tools);
      
      const response = await this.client.messages.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: systemPrompt,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
      });

      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      return {
        content,
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
        },
        metadata: {
          model: this.model,
          stopReason: response.stop_reason
        }
      };

    } catch (error) {
      this.logger.error('Failed to execute Claude API call', error);
      throw error;
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Test API connection
      const response = await this.client.messages.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });

      return response.content.length > 0;
    } catch (error) {
      this.logger.error('Claude API validation failed', error);
      return false;
    }
  }

  private buildSystemPrompt(tools?: string[]): string {
    let prompt = `You are an expert software architect and developer executing SPARC methodology.
You have deep knowledge of software design patterns, best practices, and modern development techniques.
You write clean, maintainable, and well-tested code.`;

    if (tools && tools.length > 0) {
      prompt += `\n\nYou have access to the following tools: ${tools.join(', ')}.
Use these tools as needed to complete your tasks effectively.`;
    }

    return prompt;
  }
}