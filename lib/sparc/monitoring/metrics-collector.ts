import Redis from 'ioredis';
import {
  ExecutionMetrics,
  PhaseMetrics,
  AgentMetrics,
  ResourceMetrics,
  PhaseResult
} from '../types';
import { REDIS_KEYS, SparcPhase, AgentRole } from '../constants';
import { Logger } from '../utils/logger';

interface MetricEntry {
  timestamp: Date;
  name: string;
  value: number;
  labels?: Record<string, string>;
}

export class MetricsCollector {
  private redis: Redis;
  private logger: Logger;
  private isInitialized: boolean = false;
  private metrics: Map<string, MetricEntry[]> = new Map();
  private startTime: number;

  constructor(private config?: {
    host?: string;
    port?: number;
    password?: string;
  }) {
    this.logger = new Logger('MetricsCollector');
    this.startTime = Date.now();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize Redis connection
      this.redis = new Redis({
        host: this.config?.host || 'localhost',
        port: this.config?.port || 6379,
        password: this.config?.password,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });

      // Test connection
      await this.redis.ping();

      this.isInitialized = true;
      this.logger.info('MetricsCollector initialized');

    } catch (error) {
      this.logger.error('Failed to initialize MetricsCollector', error);
      throw error;
    }
  }

  async recordPhaseMetrics(phase: SparcPhase, result: PhaseResult): Promise<void> {
    this.ensureInitialized();

    try {
      const metrics: PhaseMetrics = {
        duration: result.duration || 0,
        taskCount: result.tasks.length,
        successRate: this.calculateSuccessRate(result),
        retryCount: this.countRetries(result)
      };

      // Store in Redis
      const key = `${REDIS_KEYS.METRICS}:phase:${phase}`;
      await this.redis.hset(key, {
        duration: metrics.duration,
        taskCount: metrics.taskCount,
        successRate: metrics.successRate,
        retryCount: metrics.retryCount,
        lastUpdated: new Date().toISOString()
      });

      // Store in memory
      this.recordMetric(`phase.${phase}.duration`, metrics.duration, {
        phase,
        status: result.status
      });

      this.recordMetric(`phase.${phase}.tasks`, metrics.taskCount, { phase });
      this.recordMetric(`phase.${phase}.success_rate`, metrics.successRate, { phase });

      this.logger.debug(`Recorded metrics for phase: ${phase}`, metrics);

    } catch (error) {
      this.logger.error(`Failed to record phase metrics for ${phase}`, error);
      throw error;
    }
  }

  async recordAgentMetrics(
    agent: string,
    taskCount: number,
    successCount: number,
    totalDuration: number,
    decisions: number
  ): Promise<void> {
    this.ensureInitialized();

    try {
      const metrics: AgentMetrics = {
        tasksExecuted: taskCount,
        successRate: taskCount > 0 ? successCount / taskCount : 0,
        averageExecutionTime: taskCount > 0 ? totalDuration / taskCount : 0,
        decisionsPerformed: decisions
      };

      // Store in Redis
      const key = `${REDIS_KEYS.METRICS}:agent:${agent}`;
      await this.redis.hset(key, {
        tasksExecuted: metrics.tasksExecuted,
        successRate: metrics.successRate,
        averageExecutionTime: metrics.averageExecutionTime,
        decisionsPerformed: metrics.decisionsPerformed,
        lastUpdated: new Date().toISOString()
      });

      // Store in memory
      this.recordMetric(`agent.${agent}.tasks`, metrics.tasksExecuted, { agent });
      this.recordMetric(`agent.${agent}.success_rate`, metrics.successRate, { agent });
      this.recordMetric(`agent.${agent}.avg_duration`, metrics.averageExecutionTime, { agent });
      this.recordMetric(`agent.${agent}.decisions`, metrics.decisionsPerformed, { agent });

      this.logger.debug(`Recorded metrics for agent: ${agent}`, metrics);

    } catch (error) {
      this.logger.error(`Failed to record agent metrics for ${agent}`, error);
      throw error;
    }
  }

  async recordResourceMetrics(
    apiCalls: number,
    tokensUsed: number,
    cacheHits: number,
    cacheMisses: number
  ): Promise<void> {
    this.ensureInitialized();

    try {
      const metrics: ResourceMetrics = {
        apiCalls,
        tokensUsed,
        cacheHits,
        cacheMisses
      };

      // Store in Redis
      const key = `${REDIS_KEYS.METRICS}:resources`;
      await this.redis.hset(key, {
        apiCalls: metrics.apiCalls,
        tokensUsed: metrics.tokensUsed,
        cacheHits: metrics.cacheHits,
        cacheMisses: metrics.cacheMisses,
        lastUpdated: new Date().toISOString()
      });

      // Store in memory
      this.recordMetric('resources.api_calls', metrics.apiCalls);
      this.recordMetric('resources.tokens_used', metrics.tokensUsed);
      this.recordMetric('resources.cache_hits', metrics.cacheHits);
      this.recordMetric('resources.cache_misses', metrics.cacheMisses);

      const cacheHitRate = metrics.cacheHits + metrics.cacheMisses > 0
        ? metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)
        : 0;
      this.recordMetric('resources.cache_hit_rate', cacheHitRate);

      this.logger.debug('Recorded resource metrics', metrics);

    } catch (error) {
      this.logger.error('Failed to record resource metrics', error);
      throw error;
    }
  }

  async getExecutionMetrics(): Promise<ExecutionMetrics> {
    this.ensureInitialized();

    try {
      const phaseMetrics: Record<string, PhaseMetrics> = {};
      const agentMetrics: Record<string, AgentMetrics> = {};
      
      // Get phase metrics
      for (const phase of Object.values(SparcPhase)) {
        const key = `${REDIS_KEYS.METRICS}:phase:${phase}`;
        const data = await this.redis.hgetall(key);
        
        if (data && Object.keys(data).length > 0) {
          phaseMetrics[phase] = {
            duration: parseInt(data.duration) || 0,
            taskCount: parseInt(data.taskCount) || 0,
            successRate: parseFloat(data.successRate) || 0,
            retryCount: parseInt(data.retryCount) || 0
          };
        }
      }

      // Get agent metrics
      const agentRoles = [...Object.values(AgentRole), 'gcp'];
      for (const agent of agentRoles) {
        const key = `${REDIS_KEYS.METRICS}:agent:${agent}`;
        const data = await this.redis.hgetall(key);
        
        if (data && Object.keys(data).length > 0) {
          agentMetrics[agent] = {
            tasksExecuted: parseInt(data.tasksExecuted) || 0,
            successRate: parseFloat(data.successRate) || 0,
            averageExecutionTime: parseFloat(data.averageExecutionTime) || 0,
            decisionsPerformed: parseInt(data.decisionsPerformed) || 0
          };
        }
      }

      // Get resource metrics
      const resourceKey = `${REDIS_KEYS.METRICS}:resources`;
      const resourceData = await this.redis.hgetall(resourceKey);
      
      const resourceMetrics: ResourceMetrics = {
        apiCalls: parseInt(resourceData.apiCalls) || 0,
        tokensUsed: parseInt(resourceData.tokensUsed) || 0,
        cacheHits: parseInt(resourceData.cacheHits) || 0,
        cacheMisses: parseInt(resourceData.cacheMisses) || 0
      };

      return {
        totalDuration: Date.now() - this.startTime,
        phaseMetrics,
        agentMetrics,
        resourceUsage: resourceMetrics
      };

    } catch (error) {
      this.logger.error('Failed to get execution metrics', error);
      throw error;
    }
  }

  async getMetricHistory(
    metricName: string,
    since?: Date,
    until?: Date
  ): Promise<MetricEntry[]> {
    const entries = this.metrics.get(metricName) || [];
    
    return entries.filter(entry => {
      if (since && entry.timestamp < since) return false;
      if (until && entry.timestamp > until) return false;
      return true;
    });
  }

  async getAggregatedMetrics(
    metricName: string,
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count'
  ): Promise<number> {
    const entries = this.metrics.get(metricName) || [];
    
    if (entries.length === 0) return 0;

    switch (aggregation) {
      case 'sum':
        return entries.reduce((sum, entry) => sum + entry.value, 0);
      
      case 'avg':
        return entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length;
      
      case 'min':
        return Math.min(...entries.map(e => e.value));
      
      case 'max':
        return Math.max(...entries.map(e => e.value));
      
      case 'count':
        return entries.length;
      
      default:
        return 0;
    }
  }

  async clear(): Promise<void> {
    this.ensureInitialized();

    try {
      // Clear Redis metrics
      const pattern = `${REDIS_KEYS.METRICS}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      // Clear memory metrics
      this.metrics.clear();
      this.startTime = Date.now();

      this.logger.info('All metrics cleared');

    } catch (error) {
      this.logger.error('Failed to clear metrics', error);
      throw error;
    }
  }

  async exportMetrics(): Promise<{
    timestamp: Date;
    duration: number;
    execution: ExecutionMetrics;
    history: Record<string, MetricEntry[]>;
  }> {
    const executionMetrics = await this.getExecutionMetrics();
    const history: Record<string, MetricEntry[]> = {};

    // Export all metric history
    for (const [name, entries] of this.metrics.entries()) {
      history[name] = entries;
    }

    return {
      timestamp: new Date(),
      duration: Date.now() - this.startTime,
      execution: executionMetrics,
      history
    };
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await this.redis.quit();
      this.metrics.clear();
      this.isInitialized = false;
      this.logger.info('MetricsCollector shut down');
    } catch (error) {
      this.logger.error('Error shutting down MetricsCollector', error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('MetricsCollector not initialized. Call initialize() first.');
    }
  }

  private recordMetric(
    name: string,
    value: number,
    labels?: Record<string, string>
  ): void {
    const entry: MetricEntry = {
      timestamp: new Date(),
      name,
      value,
      labels
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(entry);

    // Keep only last 1000 entries per metric
    const entries = this.metrics.get(name)!;
    if (entries.length > 1000) {
      this.metrics.set(name, entries.slice(-1000));
    }
  }

  private calculateSuccessRate(result: PhaseResult): number {
    if (result.tasks.length === 0) return 0;
    
    const successCount = result.tasks.filter(t => t.status === 'completed').length;
    return successCount / result.tasks.length;
  }

  private countRetries(result: PhaseResult): number {
    // This would need to be tracked during execution
    // For now, return 0
    return 0;
  }

  // Convenience methods
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const current = this.metrics.get(name)?.slice(-1)?.[0]?.value || 0;
    this.recordMetric(name, current + value, labels);
  }

  recordDuration(name: string, duration: number, labels?: Record<string, string>): void {
    this.recordMetric(name, duration, labels);
  }

  recordGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric(name, value, labels);
  }
}