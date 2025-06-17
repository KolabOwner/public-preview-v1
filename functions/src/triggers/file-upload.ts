/**
 * File Upload Trigger
 * Automatically processes files uploaded to storage
 */

import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from '../shared/monitoring';

const db = getFirestore();

/**
 * Trigger function when a file is uploaded to the uploads directory
 */
export const onResumeUploaded = onObjectFinalized({
  bucket: process.env.STORAGE_BUCKET,
  region: 'us-central1'
}, async (event) => {
  const filePath = event.data.name;
  const contentType = event.data.contentType;
  const fileSize = parseInt(event.data.size);
  
  logger.info('File uploaded', {
    filePath,
    contentType,
    fileSize
  });
  
  // Only process files in the uploads directory
  if (!filePath.startsWith('resume-processing/uploads/')) {
    logger.info('Ignoring file outside uploads directory', { filePath });
    return;
  }
  
  // Extract user ID and file info from path
  // Path format: resume-processing/uploads/{userId}/{jobId}/{fileName}
  const pathParts = filePath.split('/');
  if (pathParts.length < 5) {
    logger.error('Invalid file path structure', { filePath });
    return;
  }
  
  const userId = pathParts[2];
  const jobId = pathParts[3];
  const fileName = pathParts[4];
  
  // Only process PDF and text files
  const allowedTypes = ['application/pdf', 'text/plain', 'text/csv'];
  if (!allowedTypes.includes(contentType || '')) {
    logger.warn('Unsupported file type', { 
      contentType, 
      fileName,
      userId 
    });
    return;
  }
  
  try {
    // Check if job already exists
    const jobDoc = await db.collection('job_queue').doc(jobId).get();
    
    if (jobDoc.exists) {
      logger.info('Job already exists, skipping', { jobId });
      return;
    }
    
    // Create job entry for processing
    const job = {
      id: jobId,
      type: 'resume_parse',
      status: 'pending',
      priority: 'normal',
      userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      data: {
        fileUrl: `gs://${event.data.bucket}/${filePath}`,
        filePath,
        fileName,
        fileSize,
        fileType: contentType,
        userId,
        uploadedAt: event.data.timeCreated
      },
      metadata: {
        bucket: event.data.bucket,
        generation: event.data.generation,
        metageneration: event.data.metageneration,
        md5Hash: event.data.md5Hash
      },
      options: {
        enableValidation: true,
        enableDLP: true,
        enableAuditLogging: true,
        enableRealTimeUpdates: true
      }
    };
    
    await db.collection('job_queue').doc(jobId).set(job);
    
    // Send real-time update
    await db.collection('job_status').doc(jobId).set({
      jobId,
      userId,
      status: 'queued',
      fileName,
      fileSize,
      createdAt: FieldValue.serverTimestamp(),
      message: 'File uploaded and queued for processing'
    });
    
    logger.info('Job created for uploaded file', {
      jobId,
      userId,
      fileName,
      fileSize
    });
    
    // Optionally trigger immediate processing for high-priority files
    if (fileSize < 1024 * 1024) { // Less than 1MB
      // Small files can be processed immediately
      logger.info('Triggering immediate processing for small file', {
        jobId,
        fileSize
      });
      
      // You could invoke the processor directly here if needed
      // await processResume({ data: { jobId, ...job.data, options: job.options } });
    }
    
  } catch (error) {
    logger.error('Failed to create job for uploaded file', {
      filePath,
      jobId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

/**
 * Clean up temporary files older than 24 hours
 */
export const cleanupTempFiles = onObjectFinalized({
  bucket: process.env.STORAGE_BUCKET,
  region: 'us-central1'
}, async (event) => {
  const filePath = event.data.name;
  
  // Only process files in staging directory
  if (!filePath.startsWith('resume-processing/staging/')) {
    return;
  }
  
  const fileCreated = new Date(event.data.timeCreated);
  const now = new Date();
  const ageInHours = (now.getTime() - fileCreated.getTime()) / (1000 * 60 * 60);
  
  // Delete files older than 24 hours
  if (ageInHours > 24) {
    logger.info('Scheduling old staging file for deletion', {
      filePath,
      ageInHours
    });
    
    // Schedule deletion (you might want to batch these)
    await db.collection('cleanup_tasks').add({
      type: 'delete_file',
      bucket: event.data.bucket,
      filePath,
      scheduledFor: FieldValue.serverTimestamp(),
      reason: 'staging_file_expired'
    });
  }
});