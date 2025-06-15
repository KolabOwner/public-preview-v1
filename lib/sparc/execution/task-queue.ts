import Redis from 'ioredis';
import { AgentTask, TaskQueue } from '../types';
import { REDIS_KEYS, TIMEOUTS } from '../constants';
import { Logger } from '../utils/logger';

export class TaskQueueManager implements TaskQueue {
  private redis: Redis;
  private subscriber: Redis;
  private logger: Logger;
  private isConnected: boolean = false;
  private processingTasks: Map<string, AgentTask> = new Map();

  constructor(private config?: {
    host?: string;
    port?: number;
    password?: string;
  }) {
    this.logger = new Logger('TaskQueueManager');
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // Create Redis client
      this.redis = new Redis({
        host: this.config?.host || 'localhost',
        port: this.config?.port || 6379,
        password: this.config?.password,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });

      // Create subscriber for pub/sub
      this.subscriber = this.redis.duplicate();

      // Test connection
      await this.redis.ping();
      
      this.isConnected = true;
      this.logger.info('Connected to Redis');

      // Set up error handlers
      this.redis.on('error', (error) => {
        this.logger.error('Redis error', error);
      });

      this.subscriber.on('error', (error) => {
        this.logger.error('Redis subscriber error', error);
      });

    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  async enqueue(task: AgentTask): Promise<void> {
    this.ensureConnected();
    
    try {
      const taskData = JSON.stringify(task);
      
      // Add to priority queue based on task priority
      const priority = task.priority || 5;
      const score = Date.now() / priority; // Lower score = higher priority
      
      await this.redis.zadd(REDIS_KEYS.TASK_QUEUE, score, taskData);
      
      // Publish task event
      await this.redis.publish(`${REDIS_KEYS.TASK_QUEUE}:new`, task.id);
      
      this.logger.debug(`Enqueued task ${task.id} with priority ${priority}`);
      
    } catch (error) {
      this.logger.error(`Failed to enqueue task ${task.id}`, error);
      throw error;
    }
  }

  async dequeue(): Promise<AgentTask | null> {
    this.ensureConnected();
    
    try {
      // Get highest priority task (lowest score)
      const results = await this.redis.zpopmin(REDIS_KEYS.TASK_QUEUE, 1);
      
      if (!results || results.length === 0) {
        return null;
      }

      const [taskData] = results;
      const task = JSON.parse(taskData) as AgentTask;
      
      // Track processing task
      this.processingTasks.set(task.id, task);
      
      // Set processing timeout
      setTimeout(() => {
        if (this.processingTasks.has(task.id)) {
          this.logger.warn(`Task ${task.id} processing timeout`);
          this.requeueTask(task);
        }
      }, TIMEOUTS.TASK_EXECUTION);
      
      this.logger.debug(`Dequeued task ${task.id}`);
      return task;
      
    } catch (error) {
      this.logger.error('Failed to dequeue task', error);
      throw error;
    }
  }

  async peek(): Promise<AgentTask | null> {
    this.ensureConnected();
    
    try {
      // Get highest priority task without removing it
      const results = await this.redis.zrange(REDIS_KEYS.TASK_QUEUE, 0, 0);
      
      if (!results || results.length === 0) {
        return null;
      }

      const [taskData] = results;
      return JSON.parse(taskData) as AgentTask;
      
    } catch (error) {
      this.logger.error('Failed to peek task', error);
      throw error;
    }
  }

  async size(): Promise<number> {
    this.ensureConnected();
    
    try {
      return await this.redis.zcard(REDIS_KEYS.TASK_QUEUE);
    } catch (error) {
      this.logger.error('Failed to get queue size', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.ensureConnected();
    
    try {
      await this.redis.del(REDIS_KEYS.TASK_QUEUE);
      this.processingTasks.clear();
      this.logger.info('Task queue cleared');
    } catch (error) {
      this.logger.error('Failed to clear queue', error);
      throw error;
    }
  }

  async completeTask(taskId: string): Promise<void> {
    this.processingTasks.delete(taskId);
    this.logger.debug(`Task ${taskId} completed`);
  }

  async requeueTask(task: AgentTask): Promise<void> {
    this.processingTasks.delete(task.id);
    
    // Increase priority slightly for requeued tasks
    task.priority = Math.max(1, (task.priority || 5) - 1);
    
    await this.enqueue(task);
    this.logger.info(`Requeued task ${task.id} with priority ${task.priority}`);
  }

  async getProcessingTasks(): Promise<AgentTask[]> {
    return Array.from(this.processingTasks.values());
  }

  async getQueuedTasks(limit: number = 10): Promise<AgentTask[]> {
    this.ensureConnected();
    
    try {
      const results = await this.redis.zrange(REDIS_KEYS.TASK_QUEUE, 0, limit - 1);
      return results.map(data => JSON.parse(data) as AgentTask);
    } catch (error) {
      this.logger.error('Failed to get queued tasks', error);
      throw error;
    }
  }

  async subscribe(callback: (task: AgentTask) => void): Promise<void> {
    this.ensureConnected();
    
    await this.subscriber.subscribe(`${REDIS_KEYS.TASK_QUEUE}:new`);
    
    this.subscriber.on('message', async (channel, taskId) => {
      const task = await this.peek();
      if (task && task.id === taskId) {
        callback(task);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.subscriber.unsubscribe();
      await this.redis.quit();
      await this.subscriber.quit();
      
      this.isConnected = false;
      this.processingTasks.clear();
      
      this.logger.info('Disconnected from Redis');
    } catch (error) {
      this.logger.error('Error disconnecting from Redis', error);
      throw error;
    }
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to Redis. Call connect() first.');
    }
  }

  // Utility methods for task management
  async getTasksByPhase(phase: string): Promise<AgentTask[]> {
    this.ensureConnected();
    
    try {
      const allTasks = await this.redis.zrange(REDIS_KEYS.TASK_QUEUE, 0, -1);
      const tasks = allTasks.map(data => JSON.parse(data) as AgentTask);
      return tasks.filter(task => task.phase === phase);
    } catch (error) {
      this.logger.error(`Failed to get tasks for phase ${phase}`, error);
      throw error;
    }
  }

  async getTasksByType(type: string): Promise<AgentTask[]> {
    this.ensureConnected();
    
    try {
      const allTasks = await this.redis.zrange(REDIS_KEYS.TASK_QUEUE, 0, -1);
      const tasks = allTasks.map(data => JSON.parse(data) as AgentTask);
      return tasks.filter(task => task.type === type);
    } catch (error) {
      this.logger.error(`Failed to get tasks for type ${type}`, error);
      throw error;
    }
  }

  async prioritizeTask(taskId: string, newPriority: number): Promise<void> {
    this.ensureConnected();
    
    try {
      // Find and update task priority
      const allTasks = await this.redis.zrange(REDIS_KEYS.TASK_QUEUE, 0, -1, 'WITHSCORES');
      
      for (let i = 0; i < allTasks.length; i += 2) {
        const taskData = allTasks[i];
        const task = JSON.parse(taskData) as AgentTask;
        
        if (task.id === taskId) {
          // Remove old entry
          await this.redis.zrem(REDIS_KEYS.TASK_QUEUE, taskData);
          
          // Re-add with new priority
          task.priority = newPriority;
          await this.enqueue(task);
          
          this.logger.info(`Updated priority for task ${taskId} to ${newPriority}`);
          return;
        }
      }
      
      this.logger.warn(`Task ${taskId} not found in queue`);
    } catch (error) {
      this.logger.error(`Failed to prioritize task ${taskId}`, error);
      throw error;
    }
  }
}