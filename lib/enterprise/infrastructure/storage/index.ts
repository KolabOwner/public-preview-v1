/**
 * Storage Service for Enterprise Architecture
 * Provides unified storage abstraction that integrates with existing enterprise components
 */

import { 
  IStorageAdapter, 
  IStorageService, 
  StorageUploadResult, 
  StorageDownloadResult 
} from '@/lib/enterprise/core/interfaces';
import { logger } from '@/lib/enterprise/monitoring/logging';
import { performanceAnalytics } from '@/lib/enterprise/monitoring/analytics';
import { MetricType } from '@/lib/enterprise/monitoring/metrics';

export class StorageService implements IStorageService {
  private adapters = new Map<string, IStorageAdapter>();
  private defaultAdapter?: string;

  /**
   * Register a storage adapter
   */
  registerAdapter(name: string, adapter: IStorageAdapter): void {
    this.adapters.set(name, adapter);
    
    // Set first adapter as default if none set
    if (!this.defaultAdapter) {
      this.defaultAdapter = name;
    }

    logger.info('Storage adapter registered', { 
      adapter: name, 
      isDefault: this.defaultAdapter === name 
    });
  }

  /**
   * Get storage adapter by name (or default)
   */
  getAdapter(name?: string): IStorageAdapter {
    const adapterName = name || this.defaultAdapter;
    
    if (!adapterName) {
      throw new Error('No storage adapter configured');
    }

    const adapter = this.adapters.get(adapterName);
    if (!adapter) {
      throw new Error(`Storage adapter '${adapterName}' not found`);
    }

    return adapter;
  }

  /**
   * Upload file with enterprise monitoring and error handling
   */
  async uploadFile(file: File, options?: {
    adapter?: string;
    path?: string;
    metadata?: Record<string, string>;
  }): Promise<StorageUploadResult> {
    const timer = performanceAnalytics.startTimer('storage.upload', {
      adapter: options?.adapter || this.defaultAdapter || 'unknown',
      fileSize: file.size.toString()
    });

    try {
      const adapter = this.getAdapter(options?.adapter);
      
      // Generate path if not provided
      const path = options?.path || this.generateUploadPath(file.name);
      
      // Add enterprise metadata
      const metadata = {
        ...options?.metadata,
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        fileSize: file.size.toString(),
        contentType: file.type
      };

      logger.info('Starting file upload', {
        fileName: file.name,
        fileSize: file.size,
        path,
        adapter: options?.adapter || this.defaultAdapter
      });

      const result = await adapter.upload(file, path, {
        contentType: file.type,
        metadata
      });

      // Record success metrics
      await performanceAnalytics.recordMetric(
        'storage.upload.success',
        1,
        MetricType.COUNTER,
        { adapter: options?.adapter || this.defaultAdapter || 'unknown' }
      );

      await performanceAnalytics.recordMetric(
        'storage.upload.bytes',
        file.size,
        MetricType.COUNTER
      );

      logger.info('File upload completed', {
        fileName: file.name,
        fileSize: file.size,
        path: result.path,
        url: result.url
      });

      return result;

    } catch (error) {
      // Record error metrics
      await performanceAnalytics.recordMetric(
        'storage.upload.error',
        1,
        MetricType.COUNTER,
        { 
          adapter: options?.adapter || this.defaultAdapter || 'unknown',
          error: error instanceof Error ? error.message : 'unknown'
        }
      );

      logger.error('File upload failed', {
        fileName: file.name,
        fileSize: file.size,
        error: error instanceof Error ? error.message : String(error),
        adapter: options?.adapter || this.defaultAdapter
      });

      throw error;
    } finally {
      await timer();
    }
  }

  /**
   * Download file with enterprise monitoring
   */
  async downloadFile(path: string, adapter?: string): Promise<StorageDownloadResult> {
    const timer = performanceAnalytics.startTimer('storage.download', {
      adapter: adapter || this.defaultAdapter || 'unknown'
    });

    try {
      const storageAdapter = this.getAdapter(adapter);

      logger.info('Starting file download', {
        path,
        adapter: adapter || this.defaultAdapter
      });

      const result = await storageAdapter.download(path);

      // Record success metrics
      await performanceAnalytics.recordMetric(
        'storage.download.success',
        1,
        MetricType.COUNTER,
        { adapter: adapter || this.defaultAdapter || 'unknown' }
      );

      await performanceAnalytics.recordMetric(
        'storage.download.bytes',
        result.size,
        MetricType.COUNTER
      );

      logger.info('File download completed', {
        path,
        size: result.size,
        contentType: result.contentType
      });

      return result;

    } catch (error) {
      // Record error metrics
      await performanceAnalytics.recordMetric(
        'storage.download.error',
        1,
        MetricType.COUNTER,
        { 
          adapter: adapter || this.defaultAdapter || 'unknown',
          error: error instanceof Error ? error.message : 'unknown'
        }
      );

      logger.error('File download failed', {
        path,
        error: error instanceof Error ? error.message : String(error),
        adapter: adapter || this.defaultAdapter
      });

      throw error;
    } finally {
      await timer();
    }
  }

  /**
   * Delete file with enterprise monitoring
   */
  async deleteFile(path: string, adapter?: string): Promise<void> {
    const timer = performanceAnalytics.startTimer('storage.delete', {
      adapter: adapter || this.defaultAdapter || 'unknown'
    });

    try {
      const storageAdapter = this.getAdapter(adapter);

      logger.info('Starting file deletion', {
        path,
        adapter: adapter || this.defaultAdapter
      });

      await storageAdapter.delete(path);

      // Record success metrics
      await performanceAnalytics.recordMetric(
        'storage.delete.success',
        1,
        MetricType.COUNTER,
        { adapter: adapter || this.defaultAdapter || 'unknown' }
      );

      logger.info('File deletion completed', { path });

    } catch (error) {
      // Record error metrics
      await performanceAnalytics.recordMetric(
        'storage.delete.error',
        1,
        MetricType.COUNTER,
        { 
          adapter: adapter || this.defaultAdapter || 'unknown',
          error: error instanceof Error ? error.message : 'unknown'
        }
      );

      logger.error('File deletion failed', {
        path,
        error: error instanceof Error ? error.message : String(error),
        adapter: adapter || this.defaultAdapter
      });

      throw error;
    } finally {
      await timer();
    }
  }

  /**
   * Generate a unique upload path
   */
  private generateUploadPath(originalName: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || 'bin';
    return `uploads/${timestamp}-${randomId}.${extension}`;
  }

  /**
   * Get file URL from adapter
   */
  async getFileUrl(path: string, adapter?: string): Promise<string> {
    const storageAdapter = this.getAdapter(adapter);
    return storageAdapter.getDownloadUrl(path);
  }

  /**
   * Check if file exists
   */
  async fileExists(path: string, adapter?: string): Promise<boolean> {
    const storageAdapter = this.getAdapter(adapter);
    return storageAdapter.exists(path);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path: string, adapter?: string): Promise<Record<string, string>> {
    const storageAdapter = this.getAdapter(adapter);
    return storageAdapter.getMetadata(path);
  }
}

// Singleton instance
export const storageService = new StorageService();

// Re-export interfaces and types
export * from '@/lib/enterprise/core/interfaces';
export { FirebaseStorageAdapter } from './firebase-adapter';