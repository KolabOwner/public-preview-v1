/**
 * Resume Processing Worker
 * Production cloud function that integrates with existing resume processing pipeline
 * PRESERVES: RMS metadata, custom fonts, ExifTool integration
 */

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { FUNCTION_CONFIGS } from '../shared/config';
import { storageService } from '../shared/storage';
import { logger } from '../shared/monitoring';

// Import existing resume processing functions
// These paths need to be adjusted based on your build setup
import { parseResumeText } from '../../../lib/features/pdf/parsing/parser';
import { formatResumeDataToRMS } from '../../../lib/features/pdf/metadata/rms-formatter';
import { generateResumePDFWithRMS } from '../../../lib/features/pdf/generator/with-rms';

// Import enterprise components
import { ValidationPipeline } from '../../../lib/enterprise/security/validators';
import { DLPScanner } from '../../../lib/enterprise/security/dlp';
import { performanceAnalytics } from '../../../lib/enterprise/monitoring/analytics';
import { auditService, AuditEventType } from '../../../lib/enterprise/compliance/audit';

const db = getFirestore();

// Input validation schema
const ProcessResumeSchema = z.object({
  jobId: z.string(),
  fileUrl: z.string().url(),
  filePath: z.string(),
  fileName: z.string(),
  fileSize: z.number().optional(),
  fileType: z.string(),
  userId: z.string(),
  resumeId: z.string().optional(),
  options: z.object({
    enableValidation: z.boolean().default(true),
    enableDLP: z.boolean().default(true),
    enableAuditLogging: z.boolean().default(true),
    enableRealTimeUpdates: z.boolean().default(true),
    priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal')
  }).default({})
});

// Initialize enterprise components
const validationPipeline = new ValidationPipeline();
const dlpScanner = new DLPScanner();

/**
 * Production resume processing worker
 * Integrates with existing RMS pipeline and enterprise features
 */
export const processResume = onCall(
  FUNCTION_CONFIGS.worker,
  async (request) => {
    const timer = performanceAnalytics.startTimer('worker.resume.processing');
    const startTime = Date.now();
    
    // Validate input
    const input = ProcessResumeSchema.parse(request.data);
    const { jobId, fileUrl, filePath, fileName, userId, options } = input;
    
    // Require authentication
    if (!request.auth || request.auth.uid !== userId) {
      throw new Error('Unauthorized');
    }
    
    logger.info('Starting resume processing', {
      jobId,
      fileName,
      userId,
      fileSize: input.fileSize,
      options
    });
    
    try {
      // Update job status
      await updateJobStatus(jobId, 'processing', {
        startedAt: FieldValue.serverTimestamp(),
        worker: process.env.K_SERVICE || 'local',
        progress: 0
      });
      
      // Step 1: Download file from storage
      await updateJobProgress(jobId, 10, 'Downloading file from storage');
      const fileData = await storageService.downloadFile(filePath);
      
      // Convert Buffer to File object for existing processors
      const file = new File([fileData.data], fileName, { 
        type: fileData.contentType 
      });
      
      // Step 2: Enterprise validation
      if (options.enableValidation) {
        await updateJobProgress(jobId, 20, 'Validating file security');
        const validationResult = await validationPipeline.validate(file);
        
        if (!validationResult.valid) {
          throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
        }
        
        await performanceAnalytics.recordMetric(
          'worker.validation.passed',
          1,
          'counter',
          { fileType: file.type }
        );
      }
      
      // Step 3: DLP scanning
      if (options.enableDLP) {
        await updateJobProgress(jobId, 30, 'Scanning for sensitive data');
        const fileText = await file.text();
        const dlpResult = await dlpScanner.scan(fileText);
        
        if (!dlpResult.clean && dlpResult.violations.some(v => v.severity === 'high')) {
          throw new Error('File contains high-risk sensitive data');
        }
        
        if (dlpResult.violations.length > 0) {
          logger.warn('DLP violations found', {
            jobId,
            violations: dlpResult.violations
          });
        }
      }
      
      // Step 4: Extract text from PDF and parse using EXISTING parser
      await updateJobProgress(jobId, 40, 'Extracting text from PDF');
      
      let resumeText: string;
      
      if (file.type === 'application/pdf') {
        // For PDFs, we need to extract text first
        // You might have a PDF text extraction utility, or we can use pdf-parse
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(fileData.data);
        resumeText = pdfData.text;
        
        logger.info('PDF text extracted', {
          jobId,
          textLength: resumeText.length,
          numPages: pdfData.numpages
        });
      } else {
        // For text files, just convert to string
        resumeText = fileData.data.toString('utf-8');
      }
      
      if (!resumeText || resumeText.trim().length === 0) {
        throw new Error('No text content found in file');
      }
      
      // Parse the resume text using EXISTING parser
      await updateJobProgress(jobId, 50, 'Parsing resume content');
      const parseResult = await parseResumeText(resumeText, userId, false);
      
      if (!parseResult.success || !parseResult.data) {
        throw new Error(parseResult.error || 'Failed to parse resume');
      }
      
      const parsedData = parseResult.data;
      
      // Step 5: Format to RMS metadata using EXISTING formatter
      await updateJobProgress(jobId, 60, 'Formatting RMS metadata');
      const resumeDataWithRMS = {
        ...parsedData,
        parsedData: parsedData.sections || parsedData
      };
      const rmsMetadata = await formatResumeDataToRMS(resumeDataWithRMS);
      
      // Log RMS field count for monitoring
      const rmsFieldCount = Object.keys(rmsMetadata).filter(key => key.startsWith('rms_')).length;
      logger.info('RMS metadata generated', {
        jobId,
        rmsFieldCount,
        hasContactInfo: !!rmsMetadata.rms_contact_fullName
      });
      
      // Step 6: Generate PDF with RMS metadata using EXISTING generator
      await updateJobProgress(jobId, 80, 'Generating PDF with embedded metadata');
      
      // Prepare data for PDF generator
      const pdfData = {
        parsedData: parsedData.sections || parsedData,
        rmsRawData: rmsMetadata,
        fontStyle: 'merriweather', // Use custom font as per existing system
        template: 'default'
      };
      
      // Generate PDF with RMS metadata embedded via ExifTool
      const pdfBlob = await generateResumePDFWithRMS(pdfData);
      
      // Convert Blob to Buffer for storage
      const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());
      
      // Step 7: Upload processed PDF to storage
      await updateJobProgress(jobId, 90, 'Saving processed resume');
      const resultPath = `results/${userId}/${jobId}/resume-with-rms.pdf`;
      
      const uploadResult = await storageService.uploadFile(
        pdfBuffer,
        resultPath,
        {
          contentType: 'application/pdf',
          metadata: {
            jobId,
            userId,
            originalFileName: fileName,
            processedAt: new Date().toISOString(),
            rmsFieldCount: rmsFieldCount.toString(),
            hasCustomFont: 'true',
            fontFamily: 'Merriweather Light',
            exifToolProcessed: 'true'
          }
        }
      );
      
      // Generate temporary access URL
      const accessUrl = await storageService.getAdapter().getSignedUrl(
        resultPath.replace('resume-processing/', ''),
        3600 * 24 // 24 hours
      );
      
      // Step 8: Update Firestore with results
      const processingTime = Date.now() - startTime;
      
      // Update job as completed
      await updateJobStatus(jobId, 'completed', {
        completedAt: FieldValue.serverTimestamp(),
        resultUrl: accessUrl,
        resultPath: uploadResult.path,
        processingTime,
        progress: 100,
        metrics: {
          rmsFieldCount,
          fileSize: input.fileSize,
          processingTimeMs: processingTime
        }
      });
      
      // Update resume document if ID provided
      if (input.resumeId) {
        await db.collection('resumes').doc(input.resumeId).update({
          status: 'processed',
          parsedData: parsedData.sections || parsedData,
          rmsMetadata,
          pdfUrl: accessUrl,
          pdfPath: uploadResult.path,
          processedAt: FieldValue.serverTimestamp(),
          processingTime,
          metadata: {
            rmsFieldCount,
            hasCustomFont: true,
            fontFamily: 'Merriweather Light',
            exifToolVersion: '12.76' // Your ExifTool version
          }
        });
      }
      
      // Step 9: Audit logging
      if (options.enableAuditLogging) {
        await auditService.log({
          action: 'resume_processed',
          eventType: AuditEventType.DATA_CREATE,
          resourceType: 'resume',
          resourceId: input.resumeId || jobId,
          userId,
          result: 'success',
          metadata: {
            jobId,
            fileName,
            processingTime,
            rmsFieldCount,
            fileSize: input.fileSize
          }
        });
      }
      
      // Record success metrics
      await performanceAnalytics.recordMetric(
        'worker.resume.success',
        1,
        'counter',
        { priority: options.priority }
      );
      
      await performanceAnalytics.recordMetric(
        'worker.resume.processing_time',
        processingTime,
        'histogram',
        { fileType: input.fileType }
      );
      
      logger.info('Resume processing completed successfully', {
        jobId,
        userId,
        processingTime,
        rmsFieldCount,
        resultUrl: accessUrl
      });
      
      return {
        success: true,
        jobId,
        resultUrl: accessUrl,
        resultPath: uploadResult.path,
        processingTime,
        metadata: {
          rmsFieldCount,
          parsedSections: Object.keys(parsedData.sections || {}).length,
          hasContactInfo: !!rmsMetadata.rms_contact_fullName,
          hasExperience: !!rmsMetadata.rms_experience_count,
          hasEducation: !!rmsMetadata.rms_education_count
        }
      };
      
    } catch (error) {
      // Record failure metrics
      await performanceAnalytics.recordMetric(
        'worker.resume.error',
        1,
        'counter',
        { 
          error: error instanceof Error ? error.message : 'unknown',
          priority: options.priority 
        }
      );
      
      logger.error('Resume processing failed', {
        jobId,
        userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Update job status to failed
      await updateJobStatus(jobId, 'failed', {
        failedAt: FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        progress: -1
      });
      
      // Audit log the failure
      if (options.enableAuditLogging) {
        await auditService.log({
          action: 'resume_processing_failed',
          eventType: AuditEventType.SYSTEM_ERROR,
          resourceType: 'resume',
          resourceId: input.resumeId || jobId,
          userId,
          result: 'failure',
          metadata: {
            jobId,
            fileName,
            error: error instanceof Error ? error.message : String(error)
          }
        });
      }
      
      throw error;
      
    } finally {
      await timer();
    }
  }
);

/**
 * Update job status in Firestore with real-time sync
 */
async function updateJobStatus(
  jobId: string, 
  status: string, 
  additionalData: any = {}
): Promise<void> {
  try {
    const updateData = {
      status,
      ...additionalData,
      updatedAt: FieldValue.serverTimestamp()
    };
    
    await db.collection('job_queue').doc(jobId).update(updateData);
    
    // Also update job_status collection for real-time monitoring
    await db.collection('job_status').doc(jobId).set(
      updateData,
      { merge: true }
    );
  } catch (error) {
    logger.error('Failed to update job status', {
      jobId,
      status,
      error: error instanceof Error ? error.message : String(error)
    });
    // Don't throw - job processing should continue even if status update fails
  }
}

/**
 * Update job progress for real-time tracking
 */
async function updateJobProgress(
  jobId: string,
  progress: number,
  message: string
): Promise<void> {
  try {
    const progressData = {
      progress,
      progressMessage: message,
      lastProgressUpdate: FieldValue.serverTimestamp()
    };
    
    // Update both collections for redundancy
    const batch = db.batch();
    
    batch.update(db.collection('job_queue').doc(jobId), progressData);
    batch.set(
      db.collection('job_progress').doc(jobId), 
      { ...progressData, jobId },
      { merge: true }
    );
    
    await batch.commit();
  } catch (error) {
    logger.warn('Failed to update job progress', {
      jobId,
      progress,
      message,
      error: error instanceof Error ? error.message : String(error)
    });
    // Don't throw - progress updates are non-critical
  }
}