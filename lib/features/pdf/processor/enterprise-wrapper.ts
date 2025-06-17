/**
 * Enterprise Wrapper for Resume Processing
 * Preserves existing RMS metadata pipeline and custom font generation
 * while adding enterprise security, monitoring, and resilience features
 */

import { ValidationPipeline } from '@/lib/enterprise/security/validators';
import { DLPScanner } from '@/lib/enterprise/security/dlp';
import { logger } from '@/lib/enterprise/monitoring/logging';
import { performanceAnalytics } from '@/lib/enterprise/monitoring/analytics';
import { circuitBreakerManager } from '@/lib/enterprise/resilience/circuit-breaker';
import { recoveryOrchestrator } from '@/lib/enterprise/resilience/recovery';
import { jobQueue, JobPriority, JobStatus } from '@/lib/enterprise/infrastructure/queue';
import { realtimeService } from '@/lib/enterprise/infrastructure/realtime';
import { auditLogger } from '@/lib/enterprise/compliance/audit';

// Import existing RMS and font functionality
import { generateResumePDFWithRMS } from '../generator/with-rms';
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

  constructor() {
    this.validationPipeline = new ValidationPipeline();
    this.dlpScanner = new DLPScanner();
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
      hasCustomFont: !!resumeData.fontStyle
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
        await auditLogger.log({
          action: 'pdf_generation_started',
          resourceType: 'resume_pdf',
          userId,
          metadata: {
            hasRMS: true,
            fontStyle: resumeData.fontStyle || 'default',
            template: resumeData.template || 'default'
          }
        });
      }

      // Step 4: Real-time updates
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'pdf_generation_started',
          timestamp: new Date(),
          metadata: { fontStyle: resumeData.fontStyle }
        });
      }

      // Step 5: Use circuit breaker for PDF generation
      const breaker = circuitBreakerManager.getBreaker('pdf_generation');
      const pdfBlob = await breaker.execute(async () => {
        // Call the EXISTING RMS PDF generator
        // This preserves:
        // - Custom font downloading (Merriweather Light)
        // - RMS metadata formatting
        // - ExifTool integration for embedding metadata
        return await generateResumePDFWithRMS(resumeData);
      });

      // Step 6: Record success metrics
      await performanceAnalytics.recordMetric(
        'pdf.generation.success',
        1,
        'counter' as any,
        { fontStyle: resumeData.fontStyle || 'default' }
      );

      // Step 7: Audit success
      if (options.enableAuditLogging) {
        await auditLogger.log({
          action: 'pdf_generation_completed',
          resourceType: 'resume_pdf',
          userId,
          result: 'success',
          metadata: {
            pdfSize: pdfBlob.size,
            rmsFieldsCount: Object.keys(formatResumeDataToRMS(resumeData)).length
          }
        });
      }

      // Step 8: Send completion update
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'pdf_generation_completed',
          timestamp: new Date(),
          metadata: { 
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
        'counter' as any,
        { error: error.message }
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
        error: error.message,
        fontStyle: resumeData.fontStyle
      });

      throw error;

    } finally {
      await timer();
    }
  }

  /**
   * Wrap existing ExifTool RMS writing with enterprise features
   */
  async writeRMSWithEnterprise(
    pdfBlob: Blob,
    metadata: any,
    userId: string,
    options: EnterpriseOptions = {}
  ): Promise<Response> {
    const timer = performanceAnalytics.startTimer('enterprise.rms.write', {
      userId,
      metadataFields: Object.keys(metadata).length
    });

    try {
      // Create FormData for existing API
      const formData = new FormData();
      formData.append('file', pdfBlob, 'resume.pdf');
      formData.append('metadata', JSON.stringify(metadata));

      // Use circuit breaker for ExifTool operation
      const breaker = circuitBreakerManager.getBreaker('exiftool_write');
      const response = await breaker.execute(async () => {
        // Call EXISTING write-rms API that uses local ExifTool
        return await fetch('/api/resume/write-rms', {
          method: 'POST',
          body: formData,
        });
      });

      if (!response.ok) {
        throw new Error(`RMS write failed: ${response.status}`);
      }

      // Record success
      const fieldsWritten = response.headers.get('X-RMS-Fields-Written');
      await performanceAnalytics.recordMetric(
        'rms.fields.written',
        parseInt(fieldsWritten || '0'),
        'gauge' as any
      );

      return response;

    } catch (error) {
      // Record error
      await performanceAnalytics.recordMetric(
        'rms.write.error',
        1,
        'counter' as any,
        { error: error.message }
      );

      throw error;

    } finally {
      await timer();
    }
  }

  /**
   * Wrap existing resume parsing with enterprise features
   */
  async parseResumeWithEnterprise(
    file: File | string,
    userId: string,
    options: EnterpriseOptions = {}
  ): Promise<any> {
    const jobId = `parse_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      // Queue the parsing job
      const job = await jobQueue.addJob(
        'resume_parse',
        {
          file: file instanceof File ? await file.arrayBuffer() : file,
          fileName: file instanceof File ? file.name : 'resume.txt',
          userId
        },
        {
          priority: options.priority || JobPriority.NORMAL,
          metadata: { userId, jobId }
        }
      );

      // Send real-time updates
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'parse_queued',
          jobId: job.id,
          timestamp: new Date()
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
        error: error.message
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

    // Validate required fields for RMS
    const rmsData = formatResumeDataToRMS(resumeData);
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
    
    const dlpResult = await this.dlpScanner.scan(textContent, {
      documentType: 'resume',
      userId
    });

    if (dlpResult.hasViolations) {
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
        'counter' as any,
        { path: req.url }
      );

      return result;

    } catch (error) {
      // Record error
      await performanceAnalytics.recordMetric(
        'api.request.error',
        1,
        'counter' as any,
        { path: req.url, error: error.message }
      );

      logger.error('API request failed', {
        requestId,
        error: error.message,
        stack: error.stack
      });

      throw error;

    } finally {
      await timer();
    }
  };
}