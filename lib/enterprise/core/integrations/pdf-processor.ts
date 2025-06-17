/**
 * PDF Processor Integration
 * Wraps existing PDF processing pipeline with enterprise features
 * Manages the complete workflow from upload to final PDF with RMS
 */

import { 
  IPDFProcessor, 
  CreateResumeData,
  Resume
} from '../interfaces';
import { FileStatus } from '../types';
import { ComponentLogger } from '../../monitoring/logging';
import { ComponentMetricsCollector } from '../../monitoring/metrics';
import { JobQueue, JobPriority } from '../../infrastructure/queue';
import { RealtimeService, UpdateType, ResourceType } from '../../infrastructure/realtime';
import { AuditLogger, AuditEventType } from '../../compliance/audit';
import { getFirestore } from 'firebase/firestore';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * PDF Processor that integrates with existing processing pipeline
 * Adds job queuing, real-time updates, and audit logging
 */
export class PDFProcessorIntegration implements IPDFProcessor {
  private logger = new ComponentLogger('PDFProcessor');
  private metrics = new ComponentMetricsCollector('pdf_processing');
  private jobQueue = new JobQueue();
  private realtimeService: RealtimeService;
  private auditLogger: AuditLogger;
  private db = getFirestore();
  
  constructor(
    private existingProcessPDF: (file: File, metadata: any) => Promise<any>
  ) {
    // Get singleton instances
    this.realtimeService = (RealtimeService as any).getInstance();
    this.auditLogger = (AuditLogger as any).getInstance();
  }

  /**
   * Create resume document in Firestore
   */
  async createResume(data: CreateResumeData): Promise<string> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Creating resume document', {
        userId: data.userId,
        title: data.title
      });
      
      // Generate resume ID
      const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create resume document
      const resumeData: Resume = {
        id: resumeId,
        userId: data.userId,
        title: data.title,
        status: data.initialStatus,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to Firestore
      await setDoc(doc(this.db, 'resumes', resumeId), {
        ...resumeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Send real-time update
      await this.realtimeService.sendUpdate({
        type: UpdateType.RESUME_PROCESSING_STARTED,
        userId: data.userId,
        resourceId: resumeId,
        resourceType: ResourceType.RESUME,
        status: data.initialStatus,
        data: {
          title: data.title
        },
        message: `Resume "${data.title}" created`
      });
      
      // Audit log
      await this.auditLogger.log({
        action: 'resume_created',
        eventType: AuditEventType.DATA_CREATE,
        userId: data.userId,
        resourceId: resumeId,
        resourceType: 'resume',
        result: 'success',
        metadata: {
          title: data.title,
          initialStatus: data.initialStatus
        }
      });
      
      // Record metrics
      const createTime = Date.now() - startTime;
      await this.metrics.recordMetric('resume_create_duration', createTime);
      await this.metrics.recordMetric('resume_create_success', 1);
      
      await this.logger.info('Resume document created', {
        resumeId,
        createTime
      });
      
      return resumeId;
      
    } catch (error) {
      const createTime = Date.now() - startTime;
      await this.metrics.recordMetric('resume_create_duration', createTime);
      await this.metrics.recordMetric('resume_create_error', 1);
      
      await this.logger.error('Failed to create resume document', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Process PDF file (background job)
   * This includes parsing, RMS formatting, and metadata embedding
   */
  async processPDF(file: File, resumeId: string, metadata: any): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Queueing PDF processing job', {
        resumeId,
        fileSize: file.size,
        fileName: file.name
      });
      
      // Update status to processing
      await this.updateStatus(resumeId, FileStatus.PROCESSING);
      
      // Queue the processing job
      const job = await this.jobQueue.addJob(
        'pdf_processing',
        {
          resumeId,
          fileName: file.name,
          fileSize: file.size,
          metadata,
          fileData: await file.arrayBuffer() // Store file data for processing
        },
        {
          priority: metadata.priority || JobPriority.NORMAL,
          maxAttempts: 3
        }
      );
      
      // Set up job processor
      const processJob = async () => {
        try {
          // Call existing processing logic
          const result = await this.existingProcessPDF(file, metadata);
          
          // Update resume with results
          await updateDoc(doc(this.db, 'resumes', resumeId), {
            status: FileStatus.PROCESSED,
            metadata: result.metadata,
            pdfUrl: result.pdfUrl,
            updatedAt: serverTimestamp()
          });
          
          // Send real-time update
          await this.realtimeService.sendUpdate({
            type: UpdateType.RESUME_PROCESSING_COMPLETED,
            userId: metadata.userId,
            resourceId: resumeId,
            resourceType: ResourceType.RESUME,
            status: 'processed',
            data: {
              pdfUrl: result.pdfUrl
            },
            message: 'Resume processing completed successfully'
          });
          
          // Complete the job
          await this.jobQueue.completeJob(job.id);
          
          // Audit log
          await this.auditLogger.log({
            action: 'pdf_processed',
            eventType: AuditEventType.DATA_UPDATE,
            userId: metadata.userId,
            resourceId: resumeId,
            resourceType: 'resume',
            result: 'success',
            metadata: {
              processingTime: Date.now() - startTime,
              fileSize: file.size
            }
          });
          
        } catch (error) {
          // Update status to error
          await this.updateStatus(resumeId, FileStatus.ERROR, 
            error instanceof Error ? error.message : 'Processing failed'
          );
          
          // Fail the job
          await this.jobQueue.failJob(job.id, 
            error instanceof Error ? error.message : 'Unknown error'
          );
          
          throw error;
        }
      };
      
      // Process the job (could be async in background)
      processJob().catch(error => {
        this.logger.error('Background job processing failed', {
          jobId: job.id,
          resumeId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      });
      
      // Record metrics
      await this.metrics.recordMetric('pdf_process_queued', 1);
      
      await this.logger.info('PDF processing job queued', {
        jobId: job.id,
        resumeId
      });
      
    } catch (error) {
      await this.metrics.recordMetric('pdf_process_queue_error', 1);
      
      await this.logger.error('Failed to queue PDF processing', {
        resumeId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Get resume by ID
   */
  async getResume(resumeId: string): Promise<Resume | null> {
    try {
      const docRef = doc(this.db, 'resumes', resumeId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      return {
        id: resumeId,
        userId: data.userId,
        title: data.title,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        error: data.error,
        metadata: data.metadata
      };
      
    } catch (error) {
      await this.logger.error('Failed to get resume', {
        resumeId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return null;
    }
  }
  
  /**
   * Update resume status
   */
  async updateStatus(resumeId: string, status: FileStatus, error?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };
      
      if (error) {
        updateData.error = error;
      }
      
      await updateDoc(doc(this.db, 'resumes', resumeId), updateData);
      
      // Get resume to send update
      const resume = await this.getResume(resumeId);
      if (resume) {
        await this.realtimeService.sendUpdate({
          type: UpdateType.RESUME_PROCESSING_PROGRESS,
          userId: resume.userId,
          resourceId: resumeId,
          resourceType: ResourceType.RESUME,
          status: status,
          data: {
            previousStatus: resume.status
          },
          error,
          message: error ? `Status update: ${error}` : `Status changed to ${status}`
        });
      }
      
      await this.logger.info('Resume status updated', {
        resumeId,
        status,
        hasError: !!error
      });
      
    } catch (error) {
      await this.logger.error('Failed to update resume status', {
        resumeId,
        status,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
}

/**
 * Factory function to create PDF processor with existing functionality
 */
export function createPDFProcessor(
  existingProcessPDF: (file: File, metadata: any) => Promise<any>
): IPDFProcessor {
  return new PDFProcessorIntegration(existingProcessPDF);
}