import {
  Agent,
  AgentTask,
  AgentTaskResult,
  AgentMessage,
  AgentResponse,
  Decision,
  SparcConfig,
  AIProvider
} from '../types';
import {
  AgentRole,
  EventType,
  MessageType,
  AGENT_PRIORITIES,
  TIMEOUTS
} from '../constants';
import { SecurityAgent } from './security-agent';
import { ArchitectureAgent } from './architecture-agent';
import { FrontendAgent } from './frontend-agent';
import { BackendAgent } from './backend-agent';
import { TestingAgent } from './testing-agent';
import { DevOpsAgent } from './devops-agent';
import { TaskQueueManager } from '../execution/task-queue';
import { SparcEventEmitter } from '../core/event-emitter';
import { Logger } from '../utils/logger';

export class AgentCoordinator {
  private agents: Map<AgentRole, Agent> = new Map();
  private messageQueue: Map<string, AgentMessage[]> = new Map();
  private consensusResults: Map<string, Map<string, any>> = new Map();
  private logger: Logger;

  constructor(
    private config: SparcConfig,
    private aiProvider: AIProvider,
    private taskQueue: TaskQueueManager,
    private eventEmitter: SparcEventEmitter
  ) {
    this.logger = new Logger('AgentCoordinator');
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing agents...');

    const agentConfig = this.config.agents?.coordination;
    if (!agentConfig?.enabled) {
      this.logger.warn('Agent coordination is disabled');
      return;
    }

    // Initialize all agents
    await this.initializeAgent(
      AgentRole.SECURITY,
      new SecurityAgent(this.config, this.aiProvider)
    );

    await this.initializeAgent(
      AgentRole.ARCHITECTURE,
      new ArchitectureAgent(this.config, this.aiProvider)
    );

    await this.initializeAgent(
      AgentRole.FRONTEND,
      new FrontendAgent(this.config, this.aiProvider)
    );

    await this.initializeAgent(
      AgentRole.BACKEND,
      new BackendAgent(this.config, this.aiProvider)
    );

    await this.initializeAgent(
      AgentRole.TESTING,
      new TestingAgent(this.config, this.aiProvider)
    );

    await this.initializeAgent(
      AgentRole.DEVOPS,
      new DevOpsAgent(this.config, this.aiProvider)
    );

    this.logger.info(`Initialized ${this.agents.size} agents`);
  }

  private async initializeAgent(role: AgentRole, agent: Agent): Promise<void> {
    const roleConfig = this.config.agents?.coordination.roles[role];
    if (roleConfig) {
      this.agents.set(role, agent);
      this.logger.debug(`Initialized ${role} agent`);
    }
  }

  async executeTask(task: AgentTask): Promise<AgentTaskResult> {
    const agent = this.selectAgentForTask(task);
    if (!agent) {
      throw new Error(`No agent available for task type: ${task.type}`);
    }

    this.logger.info(`Assigning task ${task.id} to ${agent.role} agent`);
    
    try {
      // Execute task
      const result = await agent.execute(task);

      // If agent has veto rights and critical decisions, check for consensus
      if (agent.vetoRights && result.decisions?.some(d => d.impact === 'high')) {
        const consensus = await this.seekConsensus(agent, task, result);
        if (!consensus.approved) {
          this.eventEmitter.emit(EventType.AGENT_VETO, {
            agent: agent.role,
            task: task.id,
            reason: consensus.reason
          });
          
          result.success = false;
          result.error = new Error(`Vetoed by consensus: ${consensus.reason}`);
        }
      }

      // Emit decision events
      result.decisions?.forEach(decision => {
        this.eventEmitter.emit(EventType.AGENT_DECISION, {
          agent: agent.role,
          decision,
          taskId: task.id
        });
      });

      return result;

    } catch (error) {
      this.logger.error(`Task ${task.id} failed in ${agent.role} agent`, error);
      throw error;
    }
  }

  private selectAgentForTask(task: AgentTask): Agent | null {
    // Select agent based on task type and responsibilities
    for (const [role, agent] of this.agents.entries()) {
      if (agent.responsibilities.some(r => 
        task.type.toLowerCase().includes(r.toLowerCase()) ||
        task.description.toLowerCase().includes(r.toLowerCase())
      )) {
        return agent;
      }
    }

    // Default to architecture agent for general tasks
    return this.agents.get(AgentRole.ARCHITECTURE) || null;
  }

  async distributeTask(task: AgentTask): Promise<AgentTaskResult[]> {
    const relevantAgents = this.getRelevantAgents(task);
    const results: AgentTaskResult[] = [];

    // Execute in parallel if enabled
    if (this.config.sparc.automation.parallelTasks) {
      const promises = relevantAgents.map(agent => 
        this.executeTask({ ...task, id: `${task.id}-${agent.role}` })
      );
      
      const parallelResults = await Promise.allSettled(promises);
      
      parallelResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          this.logger.error(
            `Agent ${relevantAgents[index].role} failed`,
            result.reason
          );
        }
      });
    } else {
      // Execute sequentially
      for (const agent of relevantAgents) {
        try {
          const result = await this.executeTask({
            ...task,
            id: `${task.id}-${agent.role}`
          });
          results.push(result);
        } catch (error) {
          this.logger.error(`Agent ${agent.role} failed`, error);
        }
      }
    }

    return results;
  }

  private getRelevantAgents(task: AgentTask): Agent[] {
    const agents: Agent[] = [];
    
    // Always include security agent for critical tasks
    if (task.priority && task.priority > 7) {
      const securityAgent = this.agents.get(AgentRole.SECURITY);
      if (securityAgent) agents.push(securityAgent);
    }

    // Add other relevant agents based on task type
    this.agents.forEach((agent, role) => {
      if (agent.responsibilities.some(r => 
        task.type.includes(r) || task.description.includes(r)
      )) {
        agents.push(agent);
      }
    });

    // Sort by priority
    return agents.sort((a, b) => {
      const aPriority = AGENT_PRIORITIES[a.role as AgentRole] || 'medium';
      const bPriority = AGENT_PRIORITIES[b.role as AgentRole] || 'medium';
      return this.comparePriority(bPriority, aPriority);
    });
  }

  private comparePriority(a: string, b: string): number {
    const priorities = ['low', 'medium', 'high', 'critical'];
    return priorities.indexOf(a) - priorities.indexOf(b);
  }

  async seekConsensus(
    initiator: Agent,
    task: AgentTask,
    result: AgentTaskResult
  ): Promise<{ approved: boolean; reason?: string }> {
    const consensusId = `${task.id}-consensus`;
    this.consensusResults.set(consensusId, new Map());

    // Get agents that need to review
    const reviewers = Array.from(this.agents.values()).filter(
      agent => agent.role !== initiator.role && 
               (agent.priority === 'critical' || agent.priority === 'high')
    );

    // Send review requests
    const reviewPromises = reviewers.map(async reviewer => {
      const message: AgentMessage = {
        from: initiator.role,
        to: reviewer.role,
        type: MessageType.REQUEST,
        content: {
          action: 'review',
          task,
          result,
          decisions: result.decisions
        }
      };

      const response = await this.sendMessage(message);
      this.consensusResults.get(consensusId)?.set(reviewer.role, response.content);
      return response;
    });

    // Wait for all reviews with timeout
    const reviews = await Promise.race([
      Promise.all(reviewPromises),
      new Promise<AgentResponse[]>((_, reject) => 
        setTimeout(() => reject(new Error('Consensus timeout')), TIMEOUTS.CONSENSUS)
      )
    ]);

    // Check for vetoes
    const veto = reviews.find(r => r.content.veto === true);
    if (veto) {
      return {
        approved: false,
        reason: veto.content.reason || 'Vetoed by ' + veto.from
      };
    }

    // Check for majority approval
    const approvals = reviews.filter(r => r.content.approved === true).length;
    const required = Math.ceil(reviewers.length * 0.6); // 60% approval required

    if (approvals >= required) {
      this.eventEmitter.emit(EventType.AGENT_CONSENSUS, {
        consensusId,
        approved: true,
        votes: this.consensusResults.get(consensusId)
      });
      
      return { approved: true };
    }

    return {
      approved: false,
      reason: `Insufficient approvals: ${approvals}/${required} required`
    };
  }

  async sendMessage(message: AgentMessage): Promise<AgentResponse> {
    this.eventEmitter.emit(EventType.AGENT_MESSAGE, message);

    if (message.type === MessageType.BROADCAST) {
      // Handle broadcast messages
      const responses: AgentResponse[] = [];
      
      for (const [role, agent] of this.agents.entries()) {
        if (role !== message.from) {
          const response = await agent.collaborate(message);
          responses.push(response);
        }
      }

      // Aggregate responses
      return {
        from: 'coordinator',
        content: { responses },
        consensus: true
      };
    } else {
      // Handle direct messages
      const targetAgent = this.agents.get(message.to as AgentRole);
      if (!targetAgent) {
        throw new Error(`Target agent not found: ${message.to}`);
      }

      return await targetAgent.collaborate(message);
    }
  }

  async coordinatePhase(
    phase: string,
    tasks: AgentTask[]
  ): Promise<AgentTaskResult[]> {
    this.logger.info(`Coordinating ${tasks.length} tasks for phase: ${phase}`);

    const results: AgentTaskResult[] = [];
    const taskGroups = this.groupTasksByDependencies(tasks);

    // Execute task groups in order
    for (const group of taskGroups) {
      const groupResults = await Promise.all(
        group.map(task => this.executeTask(task))
      );
      results.push(...groupResults);
    }

    return results;
  }

  private groupTasksByDependencies(tasks: AgentTask[]): AgentTask[][] {
    const groups: AgentTask[][] = [];
    const completed = new Set<string>();

    while (completed.size < tasks.length) {
      const group = tasks.filter(task => 
        !completed.has(task.id) &&
        (!task.dependencies || task.dependencies.every(dep => completed.has(dep)))
      );

      if (group.length === 0) {
        throw new Error('Circular dependency detected in tasks');
      }

      groups.push(group);
      group.forEach(task => completed.add(task.id));
    }

    return groups;
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down agent coordinator...');
    
    // Clear message queues
    this.messageQueue.clear();
    this.consensusResults.clear();
    
    // Shutdown agents if they have cleanup
    for (const agent of this.agents.values()) {
      if ('shutdown' in agent && typeof agent.shutdown === 'function') {
        await (agent as any).shutdown();
      }
    }
    
    this.agents.clear();
  }

  // Utility methods
  getAgent(role: AgentRole): Agent | undefined {
    return this.agents.get(role);
  }

  getActiveAgents(): AgentRole[] {
    return Array.from(this.agents.keys());
  }
}