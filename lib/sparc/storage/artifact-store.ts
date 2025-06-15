import Redis from 'ioredis';
import { REDIS_KEYS } from '../constants';
import { Logger } from '../utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StoredArtifact {
  id: string;
  phase: string;
  type: string;
  timestamp: Date;
  size: number;
  metadata?: Record<string, any>;
  data: any;
}

export class ArtifactStore {
  private redis: Redis;
  private logger: Logger;
  private isInitialized: boolean = false;
  private localStoragePath: string;

  constructor(private config?: {
    host?: string;
    port?: number;
    password?: string;
  }) {
    this.logger = new Logger('ArtifactStore');
    this.localStoragePath = path.join(process.cwd(), '.sparc', 'artifacts');
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

      // Create local storage directory
      await fs.mkdir(this.localStoragePath, { recursive: true });

      this.isInitialized = true;
      this.logger.info('ArtifactStore initialized');

    } catch (error) {
      this.logger.error('Failed to initialize ArtifactStore', error);
      throw error;
    }
  }

  async store(phase: string, artifacts: Record<string, any>): Promise<string[]> {
    this.ensureInitialized();

    const storedIds: string[] = [];

    try {
      for (const [key, data] of Object.entries(artifacts)) {
        const artifactId = this.generateArtifactId(phase, key);
        const artifact: StoredArtifact = {
          id: artifactId,
          phase,
          type: this.inferType(key, data),
          timestamp: new Date(),
          size: this.calculateSize(data),
          data
        };

        // Store in Redis
        await this.storeInRedis(artifact);

        // Store large artifacts locally
        if (artifact.size > 1024 * 1024) { // > 1MB
          await this.storeLocally(artifact);
        }

        storedIds.push(artifactId);
        this.logger.debug(`Stored artifact: ${artifactId} (${artifact.size} bytes)`);
      }

      return storedIds;

    } catch (error) {
      this.logger.error('Failed to store artifacts', error);
      throw error;
    }
  }

  async retrieve(artifactId: string): Promise<StoredArtifact | null> {
    this.ensureInitialized();

    try {
      // Try Redis first
      const redisData = await this.redis.get(this.getRedisKey(artifactId));
      if (redisData) {
        return JSON.parse(redisData);
      }

      // Try local storage
      const localPath = this.getLocalPath(artifactId);
      try {
        const localData = await fs.readFile(localPath, 'utf-8');
        return JSON.parse(localData);
      } catch {
        // File doesn't exist
      }

      return null;

    } catch (error) {
      this.logger.error(`Failed to retrieve artifact: ${artifactId}`, error);
      throw error;
    }
  }

  async getByPhase(phase: string): Promise<StoredArtifact[]> {
    this.ensureInitialized();

    try {
      const pattern = `${REDIS_KEYS.ARTIFACTS}:${phase}:*`;
      const keys = await this.redis.keys(pattern);
      
      const artifacts: StoredArtifact[] = [];
      
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          artifacts.push(JSON.parse(data));
        }
      }

      // Also check local storage
      const localArtifacts = await this.getLocalArtifactsByPhase(phase);
      artifacts.push(...localArtifacts);

      return artifacts;

    } catch (error) {
      this.logger.error(`Failed to get artifacts for phase: ${phase}`, error);
      throw error;
    }
  }

  async getAllArtifacts(): Promise<Record<string, any>> {
    this.ensureInitialized();

    try {
      const pattern = `${REDIS_KEYS.ARTIFACTS}:*`;
      const keys = await this.redis.keys(pattern);
      
      const artifacts: Record<string, any> = {};
      
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const artifact = JSON.parse(data) as StoredArtifact;
          artifacts[artifact.id] = artifact.data;
        }
      }

      // Also include local artifacts
      const localArtifacts = await this.getAllLocalArtifacts();
      Object.assign(artifacts, localArtifacts);

      return artifacts;

    } catch (error) {
      this.logger.error('Failed to get all artifacts', error);
      throw error;
    }
  }

  async delete(artifactId: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      // Delete from Redis
      const redisKey = this.getRedisKey(artifactId);
      const deleted = await this.redis.del(redisKey);

      // Delete from local storage
      const localPath = this.getLocalPath(artifactId);
      try {
        await fs.unlink(localPath);
      } catch {
        // File might not exist
      }

      return deleted > 0;

    } catch (error) {
      this.logger.error(`Failed to delete artifact: ${artifactId}`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.ensureInitialized();

    try {
      // Clear Redis artifacts
      const pattern = `${REDIS_KEYS.ARTIFACTS}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      // Clear local storage
      await fs.rm(this.localStoragePath, { recursive: true, force: true });
      await fs.mkdir(this.localStoragePath, { recursive: true });

      this.logger.info('All artifacts cleared');

    } catch (error) {
      this.logger.error('Failed to clear artifacts', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    totalCount: number;
    totalSize: number;
    byPhase: Record<string, number>;
    byType: Record<string, number>;
  }> {
    this.ensureInitialized();

    try {
      const artifacts = await this.getAllArtifacts();
      const stats = {
        totalCount: 0,
        totalSize: 0,
        byPhase: {} as Record<string, number>,
        byType: {} as Record<string, number>
      };

      const pattern = `${REDIS_KEYS.ARTIFACTS}:*`;
      const keys = await this.redis.keys(pattern);

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const artifact = JSON.parse(data) as StoredArtifact;
          stats.totalCount++;
          stats.totalSize += artifact.size;
          
          // Count by phase
          stats.byPhase[artifact.phase] = (stats.byPhase[artifact.phase] || 0) + 1;
          
          // Count by type
          stats.byType[artifact.type] = (stats.byType[artifact.type] || 0) + 1;
        }
      }

      return stats;

    } catch (error) {
      this.logger.error('Failed to get artifact stats', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      await this.redis.quit();
      this.isInitialized = false;
      this.logger.info('ArtifactStore shut down');
    } catch (error) {
      this.logger.error('Error shutting down ArtifactStore', error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('ArtifactStore not initialized. Call initialize() first.');
    }
  }

  private generateArtifactId(phase: string, key: string): string {
    const timestamp = Date.now();
    const cleanKey = key.replace(/[^a-zA-Z0-9-_]/g, '_');
    return `${phase}_${cleanKey}_${timestamp}`;
  }

  private inferType(key: string, data: any): string {
    if (key.includes('test')) return 'test';
    if (key.includes('doc')) return 'documentation';
    if (key.includes('api')) return 'api';
    if (key.includes('component')) return 'component';
    if (key.includes('schema')) return 'schema';
    if (key.includes('config')) return 'configuration';
    if (typeof data === 'string') return 'text';
    if (Array.isArray(data)) return 'array';
    return 'object';
  }

  private calculateSize(data: any): number {
    const str = JSON.stringify(data);
    return Buffer.byteLength(str, 'utf8');
  }

  private getRedisKey(artifactId: string): string {
    const parts = artifactId.split('_');
    const phase = parts[0];
    return `${REDIS_KEYS.ARTIFACTS}:${phase}:${artifactId}`;
  }

  private getLocalPath(artifactId: string): string {
    const parts = artifactId.split('_');
    const phase = parts[0];
    return path.join(this.localStoragePath, phase, `${artifactId}.json`);
  }

  private async storeInRedis(artifact: StoredArtifact): Promise<void> {
    const key = this.getRedisKey(artifact.id);
    const ttl = 86400 * 7; // 7 days
    
    await this.redis.setex(key, ttl, JSON.stringify(artifact));
  }

  private async storeLocally(artifact: StoredArtifact): Promise<void> {
    const filePath = this.getLocalPath(artifact.id);
    const dir = path.dirname(filePath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(artifact, null, 2));
  }

  private async getLocalArtifactsByPhase(phase: string): Promise<StoredArtifact[]> {
    const artifacts: StoredArtifact[] = [];
    const phaseDir = path.join(this.localStoragePath, phase);

    try {
      const files = await fs.readdir(phaseDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(phaseDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          artifacts.push(JSON.parse(data));
        }
      }
    } catch {
      // Directory might not exist
    }

    return artifacts;
  }

  private async getAllLocalArtifacts(): Promise<Record<string, any>> {
    const artifacts: Record<string, any> = {};

    try {
      const phases = await fs.readdir(this.localStoragePath);
      
      for (const phase of phases) {
        const phaseArtifacts = await this.getLocalArtifactsByPhase(phase);
        phaseArtifacts.forEach(artifact => {
          artifacts[artifact.id] = artifact.data;
        });
      }
    } catch {
      // Directory might not exist
    }

    return artifacts;
  }
}