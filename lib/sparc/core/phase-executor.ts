import {
  SparcConfig,
  SparcOptions,
  PhaseResult,
  AgentTask,
  AgentTaskResult,
  TaskResult,
  TaskStatus
} from '../types';
import {
  SparcPhase,
  TaskStatus as TaskStatusEnum,
  EventType,
  PROMPTS
} from '../constants';
import { AgentCoordinator } from '../agents/coordinator';
import { TaskQueueManager } from '../execution/task-queue';
import { ArtifactStore } from '../storage/artifact-store';
import { MetricsCollector } from '../monitoring/metrics-collector';
import { SparcEventEmitter } from '@/lib/sparc';
import { Logger } from '../utils/logger';

export class PhaseExecutor {
  private logger: Logger;
  private phaseStates: Map<SparcPhase, PhaseResult> = new Map();

  constructor(
    private config: SparcConfig,
    private agentCoordinator: AgentCoordinator,
    private taskQueue: TaskQueueManager,
    private artifactStore: ArtifactStore,
    private metricsCollector: MetricsCollector,
    private eventEmitter: SparcEventEmitter
  ) {
    this.logger = new Logger('PhaseExecutor');
  }

  async executePhase(
    phase: SparcPhase,
    options: SparcOptions,
    previousResults: PhaseResult[]
  ): Promise<PhaseResult> {
    const startTime = Date.now();
    this.logger.info(`Starting ${phase} phase`);

    const phaseResult: PhaseResult = {
      name: phase,
      status: TaskStatusEnum.RUNNING,
      startTime: new Date(),
      tasks: []
    };

    try {
      // Store phase state
      this.phaseStates.set(phase, phaseResult);

      // Generate tasks for this phase
      const tasks = await this.generatePhaseTasks(phase, options, previousResults);
      
      // Enqueue all tasks
      for (const task of tasks) {
        await this.taskQueue.enqueue(task);
      }

      // Execute tasks based on configuration
      const taskResults = options.options?.parallel
        ? await this.executeTasksParallel(tasks)
        : await this.executeTasksSequential(tasks);

      // Process results
      phaseResult.tasks = taskResults;
      phaseResult.status = this.determinePhaseStatus(taskResults);
      phaseResult.endTime = new Date();
      phaseResult.duration = Date.now() - startTime;

      // Store artifacts
      const artifacts = this.extractArtifacts(phase, taskResults);
      if (artifacts) {
        await this.artifactStore.store(phase, artifacts);
        phaseResult.artifacts = artifacts;
      }

      // Record metrics
      await this.metricsCollector.recordPhaseMetrics(phase, phaseResult);

      // Validate phase completion
      if (phaseResult.status === TaskStatusEnum.COMPLETED) {
        const validation = await this.validatePhase(phase, phaseResult, options);
        if (!validation.passed) {
          phaseResult.status = TaskStatusEnum.FAILED;
          phaseResult.error = new Error(`Phase validation failed: ${validation.reason}`);
        }
      }

      this.logger.info(`Completed ${phase} phase in ${phaseResult.duration}ms`);
      return phaseResult;

    } catch (error) {
      this.logger.error(`Phase ${phase} failed`, error);
      phaseResult.status = TaskStatusEnum.FAILED;
      phaseResult.error = error as Error;
      phaseResult.endTime = new Date();
      phaseResult.duration = Date.now() - startTime;
      return phaseResult;
    }
  }

  private async generatePhaseTasks(
    phase: SparcPhase,
    options: SparcOptions,
    previousResults: PhaseResult[]
  ): Promise<AgentTask[]> {
    const tasks: AgentTask[] = [];
    const context = this.buildPhaseContext(previousResults);

    switch (phase) {
      case SparcPhase.SPECIFICATION:
        tasks.push(...this.generateSpecificationTasks(options, context));
        break;
      
      case SparcPhase.PSEUDOCODE:
        tasks.push(...this.generatePseudocodeTasks(options, context));
        break;
      
      case SparcPhase.ARCHITECTURE:
        tasks.push(...this.generateArchitectureTasks(options, context));
        break;
      
      case SparcPhase.REFINEMENT:
        tasks.push(...this.generateRefinementTasks(options, context));
        break;
      
      case SparcPhase.COMPLETION:
        tasks.push(...this.generateCompletionTasks(options, context));
        break;
    }

    return tasks;
  }

  private generateSpecificationTasks(options: SparcOptions, context: any): AgentTask[] {
    const tasks: AgentTask[] = [];

    // Research tasks
    if (!options.options?.skipResearch) {
      tasks.push({
        id: `spec-research-domain`,
        type: 'research',
        phase: SparcPhase.SPECIFICATION,
        description: 'Research domain and industry trends',
        input: {
          readme: options.readmePath,
          depth: this.config.sparc.phases.specification.research?.depth || 'standard'
        },
        priority: 9
      });

      tasks.push({
        id: `spec-research-tech`,
        type: 'research',
        phase: SparcPhase.SPECIFICATION,
        description: 'Research technology stack and best practices',
        input: {
          readme: options.readmePath,
          focus: 'technology'
        },
        priority: 8
      });
    }

    // Requirements analysis
    tasks.push({
      id: `spec-requirements`,
      type: 'requirements-analysis',
      phase: SparcPhase.SPECIFICATION,
      description: 'Analyze and document functional requirements',
      input: {
        readme: options.readmePath,
        mode: options.mode,
        context
      },
      dependencies: options.options?.skipResearch ? [] : ['spec-research-domain', 'spec-research-tech'],
      priority: 7
    });

    // Security requirements
    tasks.push({
      id: `spec-security`,
      type: 'security-review',
      phase: SparcPhase.SPECIFICATION,
      description: 'Define security requirements and compliance needs',
      input: {
        requirements: 'spec-requirements',
        standards: ['OWASP', 'GDPR']
      },
      dependencies: ['spec-requirements'],
      priority: 9
    });

    return tasks;
  }

  private generatePseudocodeTasks(options: SparcOptions, context: any): AgentTask[] {
    const tasks: AgentTask[] = [];

    tasks.push({
      id: `pseudo-architecture`,
      type: 'system-design',
      phase: SparcPhase.PSEUDOCODE,
      description: 'Design high-level system architecture',
      input: {
        specifications: context.specification,
        mode: options.mode
      },
      priority: 8
    });

    tasks.push({
      id: `pseudo-algorithms`,
      type: 'algorithm-design',
      phase: SparcPhase.PSEUDOCODE,
      description: 'Design core algorithms and business logic',
      input: {
        architecture: 'pseudo-architecture',
        requirements: context.specification
      },
      dependencies: ['pseudo-architecture'],
      priority: 7
    });

    if (!options.options?.skipTests) {
      tasks.push({
        id: `pseudo-test-strategy`,
        type: 'test-strategy',
        phase: SparcPhase.PSEUDOCODE,
        description: 'Define comprehensive test strategy',
        input: {
          coverage: options.options?.testCoverage || 90,
          architecture: 'pseudo-architecture'
        },
        dependencies: ['pseudo-architecture'],
        priority: 6
      });
    }

    return tasks;
  }

  private generateArchitectureTasks(options: SparcOptions, context: any): AgentTask[] {
    const tasks: AgentTask[] = [];

    tasks.push({
      id: `arch-components`,
      type: 'component-design',
      phase: SparcPhase.ARCHITECTURE,
      description: 'Design detailed component architecture',
      input: {
        pseudocode: context.pseudocode,
        mode: options.mode
      },
      priority: 8
    });

    tasks.push({
      id: `arch-data`,
      type: 'database-schema',
      phase: SparcPhase.ARCHITECTURE,
      description: 'Design database schema and data models',
      input: {
        components: 'arch-components',
        requirements: context.specification
      },
      dependencies: ['arch-components'],
      priority: 7
    });

    tasks.push({
      id: `arch-api`,
      type: 'api-contracts',
      phase: SparcPhase.ARCHITECTURE,
      description: 'Define API contracts and interfaces',
      input: {
        components: 'arch-components',
        dataModels: 'arch-data'
      },
      dependencies: ['arch-components', 'arch-data'],
      priority: 7
    });

    tasks.push({
      id: `arch-infrastructure`,
      type: 'infrastructure',
      phase: SparcPhase.ARCHITECTURE,
      description: 'Design infrastructure and deployment architecture',
      input: {
        components: 'arch-components',
        scalability: true,
        cloud: 'gcp'
      },
      dependencies: ['arch-components'],
      priority: 6
    });

    return tasks;
  }

  private generateRefinementTasks(options: SparcOptions, context: any): AgentTask[] {
    const tasks: AgentTask[] = [];
    const components = context.architecture?.components || [];

    // Generate implementation tasks for each component
    components.forEach((component: any, index: number) => {
      const componentId = `impl-${component.name || index}`;
      
      if (!options.options?.skipTests) {
        // TDD: Test first
        tasks.push({
          id: `${componentId}-tests`,
          type: 'test-implementation',
          phase: SparcPhase.REFINEMENT,
          description: `Write tests for ${component.name}`,
          input: {
            component,
            coverage: options.options?.testCoverage || 90
          },
          priority: 8
        });
      }

      // Implementation
      tasks.push({
        id: componentId,
        type: 'implementation',
        phase: SparcPhase.REFINEMENT,
        description: `Implement ${component.name}`,
        input: {
          component,
          architecture: context.architecture,
          tests: !options.options?.skipTests ? `${componentId}-tests` : null
        },
        dependencies: !options.options?.skipTests ? [`${componentId}-tests`] : [],
        priority: 7
      });
    });

    // Integration tasks
    tasks.push({
      id: 'impl-integration',
      type: 'integration',
      phase: SparcPhase.REFINEMENT,
      description: 'Integrate all components',
      input: {
        components: components.map((c: any) => `impl-${c.name || components.indexOf(c)}`),
        architecture: context.architecture
      },
      dependencies: components.map((c: any, i: number) => `impl-${c.name || i}`),
      priority: 5
    });

    return tasks;
  }

  private generateCompletionTasks(options: SparcOptions, context: any): AgentTask[] {
    const tasks: AgentTask[] = [];

    // Validation tasks
    tasks.push({
      id: 'complete-validation',
      type: 'validation',
      phase: SparcPhase.COMPLETION,
      description: 'Validate system against requirements',
      input: {
        implementation: context.refinement,
        requirements: context.specification
      },
      priority: 9
    });

    // Security audit
    tasks.push({
      id: 'complete-security-audit',
      type: 'security-review',
      phase: SparcPhase.COMPLETION,
      description: 'Conduct final security audit',
      input: {
        system: context.refinement,
        securityRequirements: context.specification?.security
      },
      priority: 9
    });

    // Documentation
    tasks.push({
      id: 'complete-docs',
      type: 'documentation',
      phase: SparcPhase.COMPLETION,
      description: 'Generate comprehensive documentation',
      input: {
        architecture: context.architecture,
        implementation: context.refinement,
        apis: context.architecture?.api
      },
      priority: 6
    });

    // Deployment preparation
    tasks.push({
      id: 'complete-deployment',
      type: 'deployment',
      phase: SparcPhase.COMPLETION,
      description: 'Prepare deployment configuration',
      input: {
        infrastructure: context.architecture?.infrastructure,
        environments: ['development', 'staging', 'production']
      },
      dependencies: ['complete-validation', 'complete-security-audit'],
      priority: 5
    });

    return tasks;
  }

  private async executeTasksParallel(tasks: AgentTask[]): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    const taskGroups = this.groupTasksByDependencies(tasks);

    for (const group of taskGroups) {
      this.logger.info(`Executing ${group.length} tasks in parallel`);
      
      const groupPromises = group.map(async (task) => {
        this.eventEmitter.emit(EventType.TASK_START, { task });
        
        try {
          const agentResult = await this.agentCoordinator.executeTask(task);
          const taskResult = this.convertToTaskResult(task, agentResult);
          
          this.eventEmitter.emit(EventType.TASK_COMPLETE, { task, result: taskResult });
          return taskResult;
          
        } catch (error) {
          const taskResult: TaskResult = {
            id: task.id,
            name: task.description,
            status: TaskStatusEnum.FAILED,
            startTime: new Date(),
            endTime: new Date(),
            error: error as Error
          };
          
          this.eventEmitter.emit(EventType.TASK_FAILED, { task, error });
          return taskResult;
        }
      });

      const groupResults = await Promise.all(groupPromises);
      results.push(...groupResults);
    }

    return results;
  }

  private async executeTasksSequential(tasks: AgentTask[]): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    const sortedTasks = this.sortTasksByDependencies(tasks);

    for (const task of sortedTasks) {
      this.logger.info(`Executing task: ${task.id}`);
      this.eventEmitter.emit(EventType.TASK_START, { task });
      
      try {
        const agentResult = await this.agentCoordinator.executeTask(task);
        const taskResult = this.convertToTaskResult(task, agentResult);
        
        results.push(taskResult);
        this.eventEmitter.emit(EventType.TASK_COMPLETE, { task, result: taskResult });
        
      } catch (error) {
        const taskResult: TaskResult = {
          id: task.id,
          name: task.description,
          status: TaskStatusEnum.FAILED,
          startTime: new Date(),
          endTime: new Date(),
          error: error as Error
        };
        
        results.push(taskResult);
        this.eventEmitter.emit(EventType.TASK_FAILED, { task, error });
        
        // Decide whether to continue or stop
        if (task.priority && task.priority >= 8) {
          throw new Error(`Critical task ${task.id} failed: ${error}`);
        }
      }
    }

    return results;
  }

  private convertToTaskResult(task: AgentTask, agentResult: AgentTaskResult): TaskResult {
    return {
      id: task.id,
      name: task.description,
      agent: agentResult.taskId.split('-').pop(), // Extract agent name
      status: agentResult.success ? TaskStatusEnum.COMPLETED : TaskStatusEnum.FAILED,
      startTime: new Date(), // Should track actual start time
      endTime: new Date(),
      result: agentResult.output,
      error: agentResult.error
    };
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
        // Handle tasks with unresolved dependencies
        const remaining = tasks.filter(t => !completed.has(t.id));
        this.logger.warn(`Tasks with unresolved dependencies: ${remaining.map(t => t.id).join(', ')}`);
        groups.push(remaining);
        break;
      }

      groups.push(group);
      group.forEach(task => completed.add(task.id));
    }

    return groups;
  }

  private sortTasksByDependencies(tasks: AgentTask[]): AgentTask[] {
    const sorted: AgentTask[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (task: AgentTask) => {
      if (visited.has(task.id)) return;
      if (visiting.has(task.id)) {
        throw new Error(`Circular dependency detected: ${task.id}`);
      }

      visiting.add(task.id);

      if (task.dependencies) {
        for (const depId of task.dependencies) {
          const depTask = tasks.find(t => t.id === depId);
          if (depTask) visit(depTask);
        }
      }

      visiting.delete(task.id);
      visited.add(task.id);
      sorted.push(task);
    };

    tasks.forEach(task => visit(task));
    return sorted;
  }

  private buildPhaseContext(previousResults: PhaseResult[]): any {
    const context: any = {};
    
    previousResults.forEach(result => {
      context[result.name] = {
        artifacts: result.artifacts,
        tasks: result.tasks.map(t => ({
          id: t.id,
          name: t.name,
          result: t.result
        }))
      };
    });

    return context;
  }

  private determinePhaseStatus(tasks: TaskResult[]): TaskStatus {
    if (tasks.every(t => t.status === TaskStatusEnum.COMPLETED)) {
      return TaskStatusEnum.COMPLETED;
    }
    if (tasks.some(t => t.status === TaskStatusEnum.FAILED)) {
      return TaskStatusEnum.FAILED;
    }
    return TaskStatusEnum.RUNNING;
  }

  private extractArtifacts(phase: SparcPhase, tasks: TaskResult[]): any {
    const artifacts: any = {};
    
    tasks.forEach(task => {
      if (task.result) {
        artifacts[task.id] = task.result;
      }
    });

    return Object.keys(artifacts).length > 0 ? artifacts : null;
  }

  private async validatePhase(
    phase: SparcPhase,
    result: PhaseResult,
    options: SparcOptions
  ): Promise<{ passed: boolean; reason?: string }> {
    // Phase-specific validation
    switch (phase) {
      case SparcPhase.SPECIFICATION:
        return this.validateSpecification(result);
      
      case SparcPhase.REFINEMENT:
        return this.validateRefinement(result, options);
      
      case SparcPhase.COMPLETION:
        return this.validateCompletion(result);
      
      default:
        return { passed: true };
    }
  }

  private validateSpecification(result: PhaseResult): { passed: boolean; reason?: string } {
    const hasRequirements = result.tasks.some(t => 
      t.name.includes('requirements') && t.status === TaskStatusEnum.COMPLETED
    );
    
    if (!hasRequirements) {
      return { passed: false, reason: 'Requirements analysis not completed' };
    }

    return { passed: true };
  }

  private validateRefinement(
    result: PhaseResult,
    options: SparcOptions
  ): { passed: boolean; reason?: string } {
    if (!options.options?.skipTests) {
      const testTasks = result.tasks.filter(t => t.name.includes('test'));
      const testsPassed = testTasks.every(t => t.status === TaskStatusEnum.COMPLETED);
      
      if (!testsPassed) {
        return { passed: false, reason: 'Not all tests passed' };
      }
    }

    return { passed: true };
  }

  private validateCompletion(result: PhaseResult): { passed: boolean; reason?: string } {
    const validationTask = result.tasks.find(t => t.id === 'complete-validation');
    const securityTask = result.tasks.find(t => t.id === 'complete-security-audit');
    
    if (!validationTask || validationTask.status !== TaskStatusEnum.COMPLETED) {
      return { passed: false, reason: 'System validation not completed' };
    }
    
    if (!securityTask || securityTask.status !== TaskStatusEnum.COMPLETED) {
      return { passed: false, reason: 'Security audit not completed' };
    }

    return { passed: true };
  }

  async getPhaseStatus(phase: SparcPhase): Promise<PhaseResult | null> {
    return this.phaseStates.get(phase) || null;
  }
}