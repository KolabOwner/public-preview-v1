/**
 * Enterprise Wrapper for Resume Processing
 * Preserves existing RMS metadata pipeline and custom font generation
 * while adding enterprise security, monitoring, and resilience features
 */

import { ValidationPipeline } from '@/lib/enterprise/security/validators';
import { DLPScanner } from '@/lib/enterprise/security/dlp';
import { logger } from '@/lib/enterprise/monitoring/logging';
import { performanceAnalytics } from '@/lib/enterprise/monitoring/analytics';
import { MetricType } from '@/lib/enterprise/monitoring/metrics';
import { recoveryOrchestrator } from '@/lib/enterprise/resilience/recovery';
import { jobQueue, JobPriority, JobStatus } from '@/lib/enterprise/infrastructure/queue';
import { realtimeService, UpdateType, ResourceType } from '@/lib/enterprise/infrastructure/realtime';
import { auditService, AuditEventType } from '@/lib/enterprise/compliance/audit';

// Import enterprise integrations
import { createPDFGenerator, createRMSProcessor } from '@/lib/enterprise/core/integrations';
import { IPDFGenerator, IRMSProcessor } from '@/lib/enterprise/core/interfaces';
import { FileStatus } from '@/lib/enterprise/core/types';

// Import storage service
import { storageService, FirebaseStorageAdapter } from '@/lib/enterprise/infrastructure/storage';

// Import the original functions to pass to the enterprise integrations
import { generateResumePDFWithRMS } from '../generator/with-rms';
import { generateResumePDFWithCustomFonts } from '../generator/custom-fonts';
import { generateResumePDFWithVectorFonts } from '../generator/vector-fonts';
import { generateResumePDFWithStyling } from '../generator/html-renderer';
import { formatResumeDataToRMS } from '../metadata/rms-formatter';

export interface EnterpriseOptions {
  enableValidation?: boolean;
  enableDLP?: boolean;
  enableRealTimeUpdates?: boolean;
  enableAuditLogging?: boolean;
  priority?: JobPriority;
}

/**
 * Wraps existing PDF processing with enterprise features
 * PRESERVES: RMS metadata embedding, custom fonts, ExifTool integration
 * ADDS: Security validation, monitoring, error recovery
 */
export class EnterpriseWrapper {
  private validationPipeline: ValidationPipeline;
  private dlpScanner: DLPScanner;
  private pdfGenerator: IPDFGenerator;
  private rmsProcessor: IRMSProcessor;
  private storageInitialized = false;

  constructor() {
    this.validationPipeline = new ValidationPipeline();
    this.dlpScanner = new DLPScanner();
    
    // Initialize storage service with Firebase adapter
    this.initializeStorage();
    
    // Initialize enterprise integrations with existing functionality
    // Wrap functions to ensure they return promises
    this.pdfGenerator = createPDFGenerator(
      async (resumeData: any) => generateResumePDFWithRMS(resumeData),
      async (resumeData: any) => generateResumePDFWithCustomFonts(resumeData),
      async (resumeData: any) => generateResumePDFWithVectorFonts(resumeData),
      async (resumeData: any) => generateResumePDFWithStyling(resumeData)
    );
    
    this.rmsProcessor = createRMSProcessor(
      formatResumeDataToRMS
    );
  }

  /**
   * Initialize storage service
   */
  private initializeStorage(): void {
    if (!this.storageInitialized) {
      const firebaseAdapter = new FirebaseStorageAdapter({
        basePath: 'resume-processing',
        enableTemporaryAccess: true,
        defaultTempAccessDuration: 3600 // 1 hour
      });
      
      storageService.registerAdapter('firebase', firebaseAdapter);
      this.storageInitialized = true;
      
      logger.info('Storage service initialized with Firebase adapter');
    }
  }

  /**
   * Wrap existing RMS PDF generation with enterprise features
   */
  async generatePDFWithEnterprise(
    resumeData: any,
    userId: string,
    options: EnterpriseOptions = {}
  ): Promise<Blob> {
    const timer = performanceAnalytics.startTimer('enterprise.pdf.generation', {
      userId,
      hasCustomFont: String(!!resumeData.fontStyle)
    });

    try {
      // Step 1: Pre-validation if enabled
      if (options.enableValidation) {
        await this.validateResumeData(resumeData, userId);
      }

      // Step 2: DLP scanning if enabled
      if (options.enableDLP) {
        await this.scanForSensitiveData(resumeData, userId);
      }

      // Step 3: Audit logging
      if (options.enableAuditLogging) {
        await auditService.log({
          action: 'pdf_generation_started',
          eventType: AuditEventType.DATA_CREATE,
          resourceType: 'resume_pdf',
          userId,
          result: 'success',
          metadata: {
            hasRMS: true,
            fontStyle: resumeData.fontStyle || 'default',
            template: resumeData.template || 'default'
          }
        });
      }

      // Step 4: Real-time updates
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate({
          type: UpdateType.RESUME_PROCESSING_STARTED,
          userId,
          resourceId: resumeData.resumeId || 'unknown',
          resourceType: ResourceType.RESUME,
          status: 'processing',
          data: { fontStyle: resumeData.fontStyle },
          message: 'PDF generation started'
        });
      }

      // Step 5: Use enterprise PDF generator (includes circuit breaker)
      // This preserves:
      // - Custom font downloading (Merriweather Light)
      // - RMS metadata formatting
      // - ExifTool integration for embedding metadata
      // While adding enterprise features:
      // - Built-in circuit breaker
      // - Additional validation
      // - Metrics collection
      const pdfBlob = await this.pdfGenerator.generateWithRMS(resumeData);

      // Step 6: Record success metrics
      // Metrics are now recorded by the enterprise PDF generator
      // Record additional success metric for wrapper
      await performanceAnalytics.recordMetric(
        'enterprise.wrapper.success',
        1,
        MetricType.COUNTER,
        { fontStyle: resumeData.fontStyle || 'default' }
      );

      // Step 7: Audit success
      if (options.enableAuditLogging) {
        await auditService.log({
          action: 'pdf_generation_completed',
          eventType: AuditEventType.DATA_CREATE,
          resourceType: 'resume_pdf',
          userId,
          result: 'success',
          metadata: {
            pdfSize: pdfBlob.size,
            rmsFieldsCount: Object.keys(await this.rmsProcessor.formatToRMS(resumeData)).length
          }
        });
      }

      // Step 8: Send completion update
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate({
          type: UpdateType.RESUME_PROCESSING_COMPLETED,
          userId,
          resourceId: resumeData.resumeId || 'unknown',
          resourceType: ResourceType.RESUME,
          status: 'completed',
          data: { 
            pdfSize: pdfBlob.size,
            hasRMS: true 
          }
        });
      }

      return pdfBlob;

    } catch (error) {
      // Record error
      await performanceAnalytics.recordMetric(
        'pdf.generation.error',
        1,
        MetricType.COUNTER,
        { error: error instanceof Error ? error.message : String(error) }
      );

      // Attempt recovery
      const recoveryResult = await recoveryOrchestrator.recover(
        error,
        'pdf_generation',
        {
          userId,
          operationFn: () => this.generatePDFWithEnterprise(resumeData, userId, options),
          cacheKey: `pdf_${userId}_${resumeData.title}`
        }
      );

      if (recoveryResult.success) {
        return recoveryResult.result;
      }

      // Log failure
      logger.error('PDF generation failed', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        fontStyle: resumeData.fontStyle
      });

      throw error;

    } finally {
      await timer();
    }
  }

  /**
   * Wrap existing resume parsing with enterprise features
   * Now uses cloud storage for file handling
   */
  async parseResumeWithEnterprise(
    file: File | string,
    userId: string,
    options: EnterpriseOptions = {}
  ): Promise<any> {
    const jobId = `parse_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      let fileUrl: string;
      let filePath: string;
      
      // Handle file uploads with cloud storage
      if (file instanceof File) {
        logger.info('Uploading file to cloud storage', { 
          fileName: file.name, 
          size: file.size,
          userId 
        });
        
        // Upload file to cloud storage with temporary access
        const storageResult = await storageService.uploadFile(file, {
          path: `uploads/${userId}/${jobId}/${file.name}`,
          metadata: {
            userId,
            jobId,
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        });
        
        fileUrl = storageResult.url;
        filePath = storageResult.path;
        
        // Generate temporary access URL if needed
        if (options.enableTemporaryAccess !== false) {
          const signedUrl = await storageService.getAdapter().getSignedUrl(
            storageResult.path.replace('resume-processing/', ''), 
            3600 // 1 hour
          );
          fileUrl = signedUrl;
        }
      } else {
        // For text content, create a text file and upload
        const textBlob = new Blob([file], { type: 'text/plain' });
        const textFile = new File([textBlob], 'resume.txt', { type: 'text/plain' });
        
        const storageResult = await storageService.uploadFile(textFile, {
          path: `uploads/${userId}/${jobId}/resume.txt`,
          metadata: {
            userId,
            jobId,
            type: 'text',
            uploadedAt: new Date().toISOString()
          }
        });
        
        fileUrl = storageResult.url;
        filePath = storageResult.path;
      }
      
      // Queue the parsing job with file reference
      const job = await jobQueue.addJob(
        'resume_parse',
        {
          fileUrl,
          filePath,
          fileName: file instanceof File ? file.name : 'resume.txt',
          fileSize: file instanceof File ? file.size : undefined,
          fileType: file instanceof File ? file.type : 'text/plain',
          userId
        },
        {
          priority: options.priority || JobPriority.NORMAL,
          metadata: { userId, jobId }
        }
      );

      // Send real-time updates
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate({
          type: UpdateType.JOB_CREATED,
          userId,
          resourceId: job.id,
          resourceType: ResourceType.JOB,
          status: 'queued',
          data: {
            timestamp: new Date()
          },
          message: 'Parse job queued'
        });
      }

      // Return job ID for tracking
      return {
        jobId: job.id,
        status: JobStatus.PENDING,
        message: 'Resume parsing queued'
      };

    } catch (error) {
      logger.error('Failed to queue resume parsing', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Validate resume data
   */
  private async validateResumeData(resumeData: any, userId: string): Promise<void> {
    logger.debug('Validating resume data', { userId });

    // Basic validation
    if (!resumeData.parsedData && !resumeData.rmsRawData) {
      throw new Error('Resume data must contain parsedData or rmsRawData');
    }

    // Validate required fields for RMS using enterprise processor
    const rmsData = await this.rmsProcessor.formatToRMS(resumeData);
    if (!rmsData.rms_contact_fullName && !rmsData.rms_contact_email) {
      logger.warn('Resume missing contact information', { userId });
    }
  }

  /**
   * Scan resume data for sensitive information
   */
  private async scanForSensitiveData(resumeData: any, userId: string): Promise<void> {
    logger.debug('Scanning resume for sensitive data', { userId });

    // Convert resume data to text for scanning
    const textContent = JSON.stringify(resumeData.parsedData || resumeData);
    
    const dlpResult = await this.dlpScanner.scan(textContent);

    if (!dlpResult.clean) {
      logger.warn('DLP violations found in resume', {
        userId,
        violations: dlpResult.violations
      });

      // Could optionally redact or reject based on violations
      if (dlpResult.violations.some(v => v.severity === 'high')) {
        throw new Error('Resume contains high-risk sensitive data');
      }
    }
  }
}

// Export singleton instance
export const enterpriseWrapper = new EnterpriseWrapper();

// Re-export FileStatus from core types
export { FileStatus } from '@/lib/enterprise/core/types';

/**
 * Middleware to add enterprise features to existing routes
 * Preserves all existing functionality while adding monitoring
 */
export function withEnterpriseFeatures(
  handler: (req: any, res: any) => Promise<any>,
  options: EnterpriseOptions = {}
) {
  return async (req: any, res: any) => {
    const requestId = Math.random().toString(36).substring(7);
    const timer = performanceAnalytics.startTimer('api.request', {
      method: req.method,
      path: req.url
    });

    try {
      // Log request
      logger.info('API request', {
        requestId,
        method: req.method,
        path: req.url,
        userId: req.headers.get('x-user-id')
      });

      // Execute original handler
      const result = await handler(req, res);

      // Record success
      await performanceAnalytics.recordMetric(
        'api.request.success',
        1,
        MetricType.COUNTER,
        { path: req.url }
      );

      return result;

    } catch (error) {
      // Record error
      await performanceAnalytics.recordMetric(
        'api.request.error',
        1,
        MetricType.COUNTER,
        { path: req.url, error: error instanceof Error ? error.message : String(error) }
      );

      logger.error('API request failed', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      throw error;

    } finally {
      await timer();
    }
  };
}