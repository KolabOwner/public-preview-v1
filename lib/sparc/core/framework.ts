import { EventEmitter } from 'events';
import {
  SparcConfig,
  SparcOptions,
  SparcResult,
  PhaseResult,
  ExecutionMetrics,
  TaskStatus
} from '../types';
import {
  SparcPhase,
  PHASE_ORDER,
  EventType,
  DEFAULT_CONFIG
} from '../constants';
import { ConfigLoader } from './config-loader';
import { PhaseExecutor } from './phase-executor';
import { AgentCoordinator } from '../agents/coordinator';
import { AIProviderFactory } from '../providers/factory';
import { TaskQueueManager } from '../execution/task-queue';
import { MetricsCollector } from '../monitoring/metrics-collector';
import { ArtifactStore } from '../storage/artifact-store';
import { SparcEventEmitter } from './event-emitter';
import { Logger } from '../utils/logger';

export interface SparcFrameworkOptions {
  configPath: string;
  aiProvider: string;
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  logger?: Logger;
}

export class SparcFramework extends EventEmitter {
  private config: SparcConfig;
  private configLoader: ConfigLoader;
  private phaseExecutor: PhaseExecutor;
  private agentCoordinator: AgentCoordinator;
  private taskQueue: TaskQueueManager;
  private metricsCollector: MetricsCollector;
  private artifactStore: ArtifactStore;
  private eventEmitter: SparcEventEmitter;
  private logger: Logger;
  private isInitialized: boolean = false;

  constructor(private options: SparcFrameworkOptions) {
    super();
    this.logger = options.logger || new Logger('SparcFramework');
    this.eventEmitter = new SparcEventEmitter();
    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    // Forward all internal events to external EventEmitter
    this.eventEmitter.onAny((event, data) => {
      this.emit(event, data);
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.logger.info('Initializing SPARC Framework...');

      // Load and validate configuration
      this.configLoader = new ConfigLoader();
      this.config = await this.configLoader.load(this.options.configPath);
      
      // Initialize AI provider
      const aiProvider = await AIProviderFactory.create(
        this.options.aiProvider,
        this.config
      );

      // Initialize Redis-based components
      this.taskQueue = new TaskQueueManager(this.options.redis);
      await this.taskQueue.connect();

      this.metricsCollector = new MetricsCollector(this.options.redis);
      await this.metricsCollector.initialize();

      this.artifactStore = new ArtifactStore(this.options.redis);
      await this.artifactStore.initialize();

      // Initialize agent coordinator
      this.agentCoordinator = new AgentCoordinator(
        this.config,
        aiProvider,
        this.taskQueue,
        this.eventEmitter
      );
      await this.agentCoordinator.initialize();

      // Initialize phase executor
      this.phaseExecutor = new PhaseExecutor(
        this.config,
        this.agentCoordinator,
        this.taskQueue,
        this.artifactStore,
        this.metricsCollector,
        this.eventEmitter
      );

      this.isInitialized = true;
      this.logger.info('SPARC Framework initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SPARC Framework', error);
      throw error;
    }
  }

  async execute(options: SparcOptions): Promise<SparcResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const phaseResults: PhaseResult[] = [];
    const errors: Error[] = [];

    try {
      this.logger.info(`Starting SPARC execution for project: ${options.projectName}`);
      this.eventEmitter.emit(EventType.PROGRESS_UPDATE, {
        message: 'Starting SPARC execution',
        progress: 0
      });

      // Merge options with config defaults
      const executionConfig = this.mergeOptions(options);

      // Execute phases in order
      for (let i = 0; i < PHASE_ORDER.length; i++) {
        const phase = PHASE_ORDER[i];
        const progress = (i / PHASE_ORDER.length) * 100;

        if (!this.isPhaseEnabled(phase)) {
          this.logger.info(`Skipping disabled phase: ${phase}`);
          continue;
        }

        this.eventEmitter.emit(EventType.PHASE_START, { phase, progress });

        try {
          const phaseResult = await this.phaseExecutor.executePhase(
            phase,
            executionConfig,
            phaseResults
          );

          phaseResults.push(phaseResult);

          if (phaseResult.status === TaskStatus.FAILED) {
            throw new Error(`Phase ${phase} failed: ${phaseResult.error?.message}`);
          }

          this.eventEmitter.emit(EventType.PHASE_COMPLETE, {
            phase,
            result: phaseResult,
            progress: ((i + 1) / PHASE_ORDER.length) * 100
          });

          // Commit if needed
          if (executionConfig.options?.commitFrequency === 'phase') {
            await this.createCommit(phase, phaseResult);
          }

        } catch (error) {
          this.logger.error(`Phase ${phase} failed`, error);
          errors.push(error as Error);
          
          this.eventEmitter.emit(EventType.PHASE_FAILED, {
            phase,
            error,
            progress
          });

          // Decide whether to continue or abort
          if (this.config.sparc.automation.retryPolicy.attempts > 0) {
            // Retry logic would go here
          } else {
            break;
          }
        }
      }

      // Collect final metrics
      const metrics = await this.metricsCollector.getExecutionMetrics();
      const artifacts = await this.artifactStore.getAllArtifacts();

      const result: SparcResult = {
        success: errors.length === 0,
        phases: phaseResults,
        metrics: {
          ...metrics,
          totalDuration: Date.now() - startTime
        },
        artifacts,
        errors: errors.length > 0 ? errors : undefined
      };

      this.eventEmitter.emit(EventType.PROGRESS_UPDATE, {
        message: 'SPARC execution completed',
        progress: 100,
        result
      });

      return result;

    } catch (error) {
      this.logger.error('SPARC execution failed', error);
      throw error;
    }
  }

  private mergeOptions(options: SparcOptions): SparcOptions {
    return {
      ...options,
      options: {
        parallel: options.options?.parallel ?? this.config.sparc.automation.parallelTasks,
        testCoverage: options.options?.testCoverage ?? this.config.sparc.testDrivenDevelopment.coverage.target,
        commitFrequency: options.options?.commitFrequency ?? 'phase',
        skipResearch: options.options?.skipResearch ?? false,
        skipTests: options.options?.skipTests ?? !this.config.sparc.testDrivenDevelopment.enabled,
        verbose: options.options?.verbose ?? false,
        dryRun: options.options?.dryRun ?? false
      }
    };
  }

  private isPhaseEnabled(phase: SparcPhase): boolean {
    const phaseConfig = this.config.sparc.phases[phase];
    return phaseConfig?.enabled ?? true;
  }

  private async createCommit(phase: SparcPhase, result: PhaseResult): Promise<void> {
    // Commit implementation would go here
    this.eventEmitter.emit(EventType.COMMIT_CREATED, {
      phase,
      message: `Complete ${phase} phase`,
      artifacts: result.artifacts
    });
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down SPARC Framework...');
    
    await this.agentCoordinator?.shutdown();
    await this.taskQueue?.disconnect();
    await this.metricsCollector?.shutdown();
    await this.artifactStore?.shutdown();
    
    this.isInitialized = false;
    this.logger.info('SPARC Framework shut down successfully');
  }

  // Utility methods for external access
  getConfig(): SparcConfig {
    return this.config;
  }

  getMetrics(): Promise<ExecutionMetrics> {
    return this.metricsCollector.getExecutionMetrics();
  }

  getArtifacts(): Promise<Record<string, any>> {
    return this.artifactStore.getAllArtifacts();
  }

  getPhaseStatus(phase: SparcPhase): Promise<PhaseResult | null> {
    return this.phaseExecutor.getPhaseStatus(phase);
  }
}