/**
 * RMS Processor Service
 * High-level service for RMS processing operations
 */

import { 
  RMSMetadata, 
  ParsedRMSData,
  RMSProcessingResult,
  RMSBatchResult,
  IEnterpriseOptions
} from '../../core/interfaces';
import { enterpriseRMSProcessor } from './index';
import { jobQueue, JobPriority } from '../../infrastructure/queue';
import { realtimeService } from '../../infrastructure/realtime';
import { logger } from '../../monitoring/logging';
import { performanceAnalytics } from '../../monitoring/analytics';

export interface RMSServiceOptions extends IEnterpriseOptions {
  async?: boolean;
  webhook?: string;
  outputPath?: string;
  force?: boolean;
}

/**
 * RMS Processor Service
 * Provides high-level API for RMS processing operations
 */
export class RMSProcessorService {
  /**
   * Process a PDF file with RMS metadata
   */
  async processPDF(
    filePath: string,
    userId: string,
    options: RMSServiceOptions = {}
  ): Promise<RMSProcessingResult | { jobId: string; status: string }> {
    
    // If async processing is requested, queue the job
    if (options.async) {
      return await this.queueProcessing(filePath, userId, options);
    }

    // Otherwise, process synchronously
    return await this.processSync(filePath, userId, options);
  }

  /**
   * Process PDF synchronously
   */
  private async processSync(
    filePath: string,
    userId: string,
    options: RMSServiceOptions
  ): Promise<RMSProcessingResult> {
    try {
      logger.info('Processing PDF with RMS', { filePath, userId });

      // Process with enterprise features
      const result = await enterpriseRMSProcessor.process(filePath, {
        ...options,
        userId,
        output: options.outputPath,
        force: options.force
      });

      // Transform result to RMSProcessingResult
      const rmsResult: RMSProcessingResult = {
        status: result.success ? 'success' : 'error',
        inputPath: filePath,
        outputPath: options.outputPath || filePath,
        metadata: result.data as RMSMetadata,
        stats: {
          processingTime: result.metrics?.processingTime || 0,
          sectionsFound: result.metrics?.sectionsFound || 0,
          fieldsGenerated: result.metrics?.fieldsGenerated || 0,
          fileSize: result.metrics?.fileSize || 0
        },
        error: result.errors?.[0]?.message
      };

      // Send real-time update if enabled
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'rms_processing_complete',
          timestamp: new Date(),
          data: {
            filePath,
            status: rmsResult.status,
            fieldsGenerated: rmsResult.stats.fieldsGenerated
          }
        });
      }

      // Call webhook if provided
      if (options.webhook && result.success) {
        await this.callWebhook(options.webhook, rmsResult);
      }

      return rmsResult;

    } catch (error) {
      logger.error('RMS processing failed', { filePath, userId, error });
      throw error;
    }
  }

  /**
   * Queue PDF for async processing
   */
  private async queueProcessing(
    filePath: string,
    userId: string,
    options: RMSServiceOptions
  ): Promise<{ jobId: string; status: string }> {
    try {
      const job = await jobQueue.addJob(
        'rms_processing',
        {
          filePath,
          userId,
          options: {
            outputPath: options.outputPath,
            force: options.force,
            enableValidation: options.enableValidation,
            enableDLP: options.enableDLP,
            enableAuditLog: options.enableAuditLog,
            webhook: options.webhook
          }
        },
        {
          priority: options.priority || JobPriority.NORMAL,
          metadata: { userId, filePath }
        }
      );

      logger.info('RMS processing job queued', { 
        jobId: job.id, 
        filePath, 
        userId 
      });

      // Send real-time update
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'rms_processing_queued',
          timestamp: new Date(),
          data: {
            jobId: job.id,
            filePath
          }
        });
      }

      return {
        jobId: job.id,
        status: 'queued'
      };

    } catch (error) {
      logger.error('Failed to queue RMS processing', { 
        filePath, 
        userId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Process multiple PDFs in batch
   */
  async processBatch(
    filePaths: string[],
    userId: string,
    options: RMSServiceOptions & { concurrency?: number } = {}
  ): Promise<RMSBatchResult> {
    const batchId = `rms_batch_${Date.now()}`;
    
    logger.info('Starting batch RMS processing', {
      batchId,
      fileCount: filePaths.length,
      userId
    });

    const timer = performanceAnalytics.startTimer('rms.batch.processing', {
      userId,
      fileCount: filePaths.length
    });

    try {
      // Process files
      const results = await enterpriseRMSProcessor.processBatch(
        filePaths,
        {
          ...options,
          userId,
          concurrency: options.concurrency || 3
        }
      );

      // Calculate statistics
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const skipped = 0; // Can be determined from results if needed

      const batchResult: RMSBatchResult = {
        total: filePaths.length,
        successful,
        failed,
        skipped,
        files: filePaths.map((file, index) => {
          const result = results[index];
          return {
            file,
            status: result.success ? 'success' : 'error',
            metadata: result.data as RMSMetadata,
            error: result.errors?.[0]?.message
          };
        })
      };

      // Record metrics
      await performanceAnalytics.recordMetric(
        'rms.batch.success_rate',
        successful / filePaths.length,
        'gauge' as any,
        { batchId, userId }
      );

      // Send real-time update
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'rms_batch_complete',
          timestamp: new Date(),
          data: {
            batchId,
            total: filePaths.length,
            successful,
            failed
          }
        });
      }

      return batchResult;

    } finally {
      await timer();
    }
  }

  /**
   * Extract RMS metadata from PDF
   */
  async extractMetadata(
    filePath: string,
    userId: string
  ): Promise<RMSMetadata | null> {
    try {
      logger.info('Extracting RMS metadata', { filePath, userId });

      // Create a temporary processor instance for extraction
      const result = await enterpriseRMSProcessor.process(filePath, {
        userId,
        force: false,
        enableValidation: false
      });

      if (result.success && result.data) {
        return result.data as RMSMetadata;
      }

      return null;

    } catch (error) {
      logger.error('Failed to extract RMS metadata', { 
        filePath, 
        userId, 
        error 
      });
      return null;
    }
  }

  /**
   * Validate RMS metadata
   */
  async validateMetadata(
    metadata: unknown,
    userId: string
  ): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const validation = enterpriseRMSProcessor.validateRMSCompliance(metadata);
      
      // Log validation result
      logger.info('RMS metadata validation', {
        userId,
        valid: validation.valid,
        errorCount: validation.errors?.length || 0
      });

      return validation;

    } catch (error) {
      logger.error('Failed to validate RMS metadata', { userId, error });
      return {
        valid: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Export metadata in different formats
   */
  async exportMetadata(
    metadata: RMSMetadata,
    format: 'json' | 'csv' | 'xml',
    userId: string
  ): Promise<string> {
    try {
      logger.info('Exporting RMS metadata', { format, userId });
      
      const exported = await enterpriseRMSProcessor.export(metadata, format);
      
      // Record metric
      await performanceAnalytics.recordMetric(
        'rms.export',
        1,
        'counter' as any,
        { format, userId }
      );

      return exported;

    } catch (error) {
      logger.error('Failed to export RMS metadata', { 
        format, 
        userId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Get processor statistics
   */
  async getStats(): Promise<any> {
    return enterpriseRMSProcessor.getStats();
  }

  /**
   * Clear processor cache
   */
  async clearCache(): Promise<void> {
    enterpriseRMSProcessor.clearCache();
    logger.info('RMS processor cache cleared');
  }

  /**
   * Call webhook with processing result
   */
  private async callWebhook(
    webhookUrl: string,
    result: RMSProcessingResult
  ): Promise<void> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'rms_processing_complete',
          timestamp: new Date().toISOString(),
          result
        })
      });

      if (!response.ok) {
        logger.warn('Webhook call failed', {
          webhookUrl,
          status: response.status
        });
      }

    } catch (error) {
      logger.error('Failed to call webhook', {
        webhookUrl,
        error: error.message
      });
    }
  }
}

// Export singleton instance
export const rmsProcessorService = new RMSProcessorService();