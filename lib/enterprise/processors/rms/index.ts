/**
 * Enterprise RMS Processor Integration
 * Integrates the enterprise-grade RMS processor from rms-processor.js
 * with the existing enterprise infrastructure
 */

import { EventEmitter } from 'events';
import { 
  ProcessingResult, 
  ProcessingMetrics, 
  ProcessingError,
  ExifToolConfig
} from '../../core/types';
import { 
  IRMSProcessor,
  IEnterpriseOptions,
  RMSMetadata,
  ParsedRMSData
} from '../../core/interfaces';
import { logger } from '../../monitoring/logging';
import { performanceAnalytics } from '../../monitoring/analytics';
import { circuitBreakerManager } from '../../resilience/circuit-breaker';
import { recoveryOrchestrator } from '../../resilience/recovery';
import { ValidationPipeline } from '../../security/validators';
import { auditLogger } from '../../compliance/audit';

/**
 * Configuration for RMS Processor
 */
export interface RMSProcessorConfig {
  exiftoolPath?: string;
  parserPath?: string;
  tempDir?: string;
  cacheDir?: string;
  maxFileSize?: number;
  timeout?: number;
  validation?: {
    strict?: boolean;
    requiredFields?: boolean;
    allowUnknownFields?: boolean;
  };
  logging?: {
    level?: string;
    file?: string;
  };
}

/**
 * Enterprise RMS Processor
 * Wraps the native RMS processor with enterprise features
 */
export class EnterpriseRMSProcessor extends EventEmitter implements IRMSProcessor {
  private nativeProcessor: any;
  private config: RMSProcessorConfig;
  private validationPipeline: ValidationPipeline;
  private processingCount: number = 0;

  constructor(config: RMSProcessorConfig = {}) {
    super();
    
    this.config = {
      exiftoolPath: config.exiftoolPath || process.env.EXIFTOOL_PATH || 'exiftool',
      parserPath: config.parserPath || './parser/lib/rms-parser',
      tempDir: config.tempDir || './temp',
      cacheDir: config.cacheDir || './cache',
      maxFileSize: config.maxFileSize || 50 * 1024 * 1024,
      timeout: config.timeout || 30000,
      validation: {
        strict: config.validation?.strict !== false,
        requiredFields: config.validation?.requiredFields !== false,
        allowUnknownFields: config.validation?.allowUnknownFields || false
      },
      logging: {
        level: config.logging?.level || 'info',
        file: config.logging?.file
      }
    };

    this.validationPipeline = new ValidationPipeline();
    this.initializeNativeProcessor();
  }

  /**
   * Initialize the native RMS processor
   */
  private async initializeNativeProcessor(): Promise<void> {
    try {
      // Dynamic import of the RMS processor
      const RMSProcessorModule = await import('/mnt/c/Users/ashto/PycharmProjects/resume-standard-public-preview-v1/rms-processor.js');
      const RMSProcessor = RMSProcessorModule.RMSProcessor || RMSProcessorModule.default;
      
      this.nativeProcessor = new RMSProcessor(this.config);
      
      // Forward events from native processor
      this.nativeProcessor.on('start', (data: any) => {
        logger.info('RMS processing started', data);
        this.emit('start', data);
      });
      
      this.nativeProcessor.on('cached', (data: any) => {
        logger.debug('RMS cache hit', data);
        this.emit('cached', data);
      });
      
      this.nativeProcessor.on('compliant', (result: any) => {
        logger.info('RMS compliant document detected', { status: result.status });
        this.emit('compliant', result);
      });
      
      this.nativeProcessor.on('complete', (result: any) => {
        logger.info('RMS processing completed', {
          processingTime: result.stats.processingTime,
          fieldsGenerated: result.stats.fieldsGenerated
        });
        this.emit('complete', result);
      });
      
      this.nativeProcessor.on('error', (error: any) => {
        logger.error('RMS processing error', error);
        this.emit('error', error);
      });
      
    } catch (error) {
      logger.error('Failed to initialize RMS processor', { error });
      throw new Error(`Failed to initialize RMS processor: ${error.message}`);
    }
  }

  /**
   * Process a PDF file with enterprise features
   */
  async process(
    inputPath: string,
    options: IEnterpriseOptions & { output?: string; force?: boolean } = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const processId = `rms_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Start metrics
    const timer = performanceAnalytics.startTimer('rms.processing', {
      userId: options.userId,
      priority: options.priority
    });

    try {
      this.processingCount++;
      
      // Audit log
      if (options.enableAuditLog) {
        await auditLogger.log({
          action: 'rms_processing_started',
          resourceType: 'pdf_file',
          resourceId: inputPath,
          userId: options.userId,
          metadata: {
            processId,
            force: options.force,
            validation: options.enableValidation
          }
        });
      }

      // Pre-validation if enabled
      if (options.enableValidation) {
        const validationResult = await this.validationPipeline.validate(
          inputPath,
          'pdf'
        );
        
        if (!validationResult.isValid) {
          throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      // Use circuit breaker for processing
      const breaker = circuitBreakerManager.getBreaker('rms_processing');
      const result = await breaker.execute(async () => {
        return await this.nativeProcessor.process(inputPath, {
          output: options.output,
          force: options.force,
          validation: this.config.validation?.strict
        });
      });

      // Transform native result to enterprise format
      const processingResult: ProcessingResult = {
        success: result.status === 'success' || result.status === 'already_compliant',
        data: result.metadata,
        metrics: {
          totalTime: Date.now() - startTime,
          processingTime: result.stats.processingTime,
          validationTime: 0,
          parsingTime: 0,
          generationTime: 0,
          metadataTime: result.stats.processingTime,
          sectionsFound: result.stats.sectionsFound,
          fieldsGenerated: result.stats.fieldsGenerated,
          fileSize: result.stats.fileSize
        },
        errors: result.status === 'error' ? [{
          code: 'PROCESSING_ERROR',
          message: result.error,
          severity: 'critical'
        }] : undefined
      };

      // Record success metrics
      await performanceAnalytics.recordMetric(
        'rms.processing.success',
        1,
        'counter' as any,
        { 
          status: result.status,
          fieldsGenerated: result.stats.fieldsGenerated 
        }
      );

      // Audit success
      if (options.enableAuditLog) {
        await auditLogger.log({
          action: 'rms_processing_completed',
          resourceType: 'pdf_file',
          resourceId: inputPath,
          userId: options.userId,
          result: 'success',
          metadata: {
            processId,
            processingTime: result.stats.processingTime,
            fieldsGenerated: result.stats.fieldsGenerated,
            status: result.status
          }
        });
      }

      return processingResult;

    } catch (error) {
      // Record error metrics
      await performanceAnalytics.recordMetric(
        'rms.processing.error',
        1,
        'counter' as any,
        { error: error.message }
      );

      // Attempt recovery if enabled
      if (options.enableRecovery) {
        const recoveryResult = await recoveryOrchestrator.recover(
          error,
          'rms_processing',
          {
            userId: options.userId,
            operationFn: () => this.process(inputPath, options),
            cacheKey: `rms_${inputPath}`
          }
        );

        if (recoveryResult.success) {
          return recoveryResult.result;
        }
      }

      // Audit failure
      if (options.enableAuditLog) {
        await auditLogger.log({
          action: 'rms_processing_failed',
          resourceType: 'pdf_file',
          resourceId: inputPath,
          userId: options.userId,
          result: 'failure',
          metadata: {
            processId,
            error: error.message,
            stack: error.stack
          }
        });
      }

      logger.error('RMS processing failed', {
        processId,
        inputPath,
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        errors: [{
          code: 'PROCESSING_FAILED',
          message: error.message,
          severity: 'critical'
        }]
      };

    } finally {
      this.processingCount--;
      await timer();
    }
  }

  /**
   * Batch process multiple files
   */
  async processBatch(
    files: string[],
    options: IEnterpriseOptions & { concurrency?: number } = {}
  ): Promise<ProcessingResult[]> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    logger.info('Starting batch RMS processing', {
      batchId,
      fileCount: files.length,
      concurrency: options.concurrency || 3
    });

    try {
      // Use circuit breaker for batch processing
      const breaker = circuitBreakerManager.getBreaker('rms_batch_processing');
      const results = await breaker.execute(async () => {
        const batchResult = await this.nativeProcessor.processBatch(files, {
          concurrency: options.concurrency || 3,
          force: false
        });

        // Transform batch results
        return batchResult.files.map((fileResult: any) => ({
          success: fileResult.status === 'success',
          data: fileResult.metadata,
          metrics: {
            totalTime: fileResult.processingTime || 0
          },
          errors: fileResult.status === 'error' ? [{
            code: 'BATCH_PROCESSING_ERROR',
            message: fileResult.error,
            severity: 'high' as const
          }] : undefined
        }));
      });

      // Record batch metrics
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      await performanceAnalytics.recordMetric(
        'rms.batch.processed',
        files.length,
        'gauge' as any,
        { batchId }
      );

      await performanceAnalytics.recordMetric(
        'rms.batch.success_rate',
        successCount / files.length,
        'gauge' as any,
        { batchId }
      );

      logger.info('Batch RMS processing completed', {
        batchId,
        total: files.length,
        success: successCount,
        failure: failureCount
      });

      return results;

    } catch (error) {
      logger.error('Batch RMS processing failed', {
        batchId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Format resume data to RMS metadata
   */
  formatToRMS(resumeData: any): RMSMetadata {
    // This should use the existing RMS formatter
    // For now, we'll implement a basic version
    return this.nativeProcessor._generateRMSMetadata(resumeData, {});
  }

  /**
   * Parse RMS metadata to structured data
   */
  parseRMSToStructured(metadata: RMSMetadata): ParsedRMSData {
    return this.nativeProcessor._parseFromExistingRMS(metadata);
  }

  /**
   * Validate RMS compliance
   */
  validateRMSCompliance(metadata: unknown): { valid: boolean; errors?: string[] } {
    try {
      this.nativeProcessor._validateMetadata(metadata);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        errors: error.errors || [error.message]
      };
    }
  }

  /**
   * Validate RMS metadata
   */
  validateRMSMetadata(data: unknown): { success: boolean; data?: RMSMetadata; error?: any } {
    const validation = this.validateRMSCompliance(data);
    return {
      success: validation.valid,
      data: validation.valid ? data as RMSMetadata : undefined,
      error: validation.errors
    };
  }

  /**
   * Get RMS field name
   */
  getRMSField(section: string, index: number, field: string): string {
    return `rms_${section}_${index}_${field}`;
  }

  /**
   * Generate ExifTool fields
   */
  generateExifToolFields(resumeData: any): Record<string, string | number> {
    return this.formatToRMS(resumeData);
  }

  /**
   * Export metadata in various formats
   */
  async export(metadata: RMSMetadata, format: 'json' | 'csv' | 'xml' = 'json'): Promise<string> {
    return await this.nativeProcessor.export(metadata, format);
  }

  /**
   * Get processor statistics
   */
  getStats(): any {
    return {
      ...this.nativeProcessor.getStats(),
      activeProcessing: this.processingCount
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.nativeProcessor.clearCache();
    logger.info('RMS processor cache cleared');
  }

  /**
   * Get ExifTool configuration
   */
  getExifToolConfig(): ExifToolConfig {
    return {
      exifToolPath: this.config.exiftoolPath!,
      configPath: './config/exiftool/rms-config.pl'
    };
  }
}

// Export singleton instance
export const enterpriseRMSProcessor = new EnterpriseRMSProcessor();