/**
 * Job Monitor Worker
 * Monitors job queue and processes pending jobs
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getFunctions } from 'firebase-admin/functions';
import { logger } from '../shared/monitoring';

const db = getFirestore();
const functions = getFunctions();

/**
 * Scheduled function to process pending jobs
 * Runs every minute to check for new jobs
 */
export const processJobQueue = onSchedule({
  schedule: 'every 1 minutes',
  timeoutSeconds: 540,
  memory: '512MiB',
  region: 'us-central1'
}, async (event) => {
  const startTime = Date.now();
  logger.info('Job queue processor started');
  
  try {
    // Query for pending jobs
    const pendingJobs = await db.collection('job_queue')
      .where('status', '==', 'pending')
      .orderBy('priority', 'desc')
      .orderBy('createdAt', 'asc')
      .limit(10) // Process up to 10 jobs per run
      .get();
    
    if (pendingJobs.empty) {
      logger.info('No pending jobs found');
      return;
    }
    
    logger.info(`Found ${pendingJobs.size} pending jobs`);
    
    // Process jobs in parallel (with concurrency limit)
    const maxConcurrent = 3;
    const jobPromises: Promise<void>[] = [];
    
    for (const jobDoc of pendingJobs.docs) {
      const job = jobDoc.data();
      const jobId = jobDoc.id;
      
      // Skip if job is too old (more than 1 hour)
      const createdAt = job.createdAt?.toDate();
      if (createdAt && Date.now() - createdAt.getTime() > 3600000) {
        logger.warn('Skipping stale job', { jobId, createdAt });
        await updateJobStatus(jobId, 'expired');
        continue;
      }
      
      // Check job type and dispatch
      if (job.type === 'resume_parse') {
        jobPromises.push(processResumeJob(jobId, job));
        
        // Limit concurrency
        if (jobPromises.length >= maxConcurrent) {
          await Promise.race(jobPromises);
          jobPromises.splice(0, 1);
        }
      }
    }
    
    // Wait for remaining jobs
    await Promise.all(jobPromises);
    
    const processingTime = Date.now() - startTime;
    logger.info('Job queue processing completed', {
      jobsProcessed: pendingJobs.size,
      processingTime
    });
    
  } catch (error) {
    logger.error('Job queue processor failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

/**
 * Process a resume parsing job
 */
async function processResumeJob(jobId: string, jobData: any): Promise<void> {
  try {
    logger.info('Processing resume job', { jobId, userId: jobData.userId });
    
    // Mark job as processing to prevent double processing
    await updateJobStatus(jobId, 'processing');
    
    // Call the resume processor function
    const processResume = functions.taskQueue('processResume');
    await processResume({
      jobId,
      ...jobData.data,
      options: jobData.options || {}
    });
    
  } catch (error) {
    logger.error('Failed to process resume job', {
      jobId,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Update job as failed
    await updateJobStatus(jobId, 'failed', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Clean up old completed/failed jobs
 */
export const cleanupOldJobs = onSchedule({
  schedule: '0 2 * * *', // Daily at 2 AM
  timeoutSeconds: 300,
  memory: '256MiB',
  region: 'us-central1'
}, async (event) => {
  logger.info('Starting job cleanup');
  
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days retention
    
    // Query old completed/failed jobs
    const oldJobs = await db.collection('job_queue')
      .where('status', 'in', ['completed', 'failed', 'expired'])
      .where('updatedAt', '<', cutoffDate)
      .limit(500)
      .get();
    
    if (oldJobs.empty) {
      logger.info('No old jobs to clean up');
      return;
    }
    
    // Delete in batches
    const batch = db.batch();
    let batchCount = 0;
    
    for (const doc of oldJobs.docs) {
      batch.delete(doc.ref);
      batchCount++;
      
      // Firestore batch limit is 500
      if (batchCount === 500) {
        await batch.commit();
        batchCount = 0;
      }
    }
    
    if (batchCount > 0) {
      await batch.commit();
    }
    
    logger.info(`Cleaned up ${oldJobs.size} old jobs`);
    
  } catch (error) {
    logger.error('Job cleanup failed', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Monitor job health and alert on issues
 */
export const monitorJobHealth = onSchedule({
  schedule: 'every 5 minutes',
  timeoutSeconds: 60,
  memory: '256MiB',
  region: 'us-central1'
}, async (event) => {
  try {
    // Check for stuck jobs (processing for more than 10 minutes)
    const stuckThreshold = new Date();
    stuckThreshold.setMinutes(stuckThreshold.getMinutes() - 10);
    
    const stuckJobs = await db.collection('job_queue')
      .where('status', '==', 'processing')
      .where('updatedAt', '<', stuckThreshold)
      .get();
    
    if (!stuckJobs.empty) {
      logger.error(`Found ${stuckJobs.size} stuck jobs`);
      
      // Reset stuck jobs to pending
      const batch = db.batch();
      stuckJobs.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'pending',
          retryCount: FieldValue.increment(1),
          lastError: 'Job stuck in processing state',
          updatedAt: FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
    }
    
    // Check queue depth
    const pendingCount = await db.collection('job_queue')
      .where('status', '==', 'pending')
      .count()
      .get();
    
    if (pendingCount.data().count > 100) {
      logger.warn('High job queue depth', { 
        pendingJobs: pendingCount.data().count 
      });
    }
    
  } catch (error) {
    logger.error('Job health monitor failed', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Update job status helper
 */
async function updateJobStatus(
  jobId: string, 
  status: string,
  additionalData: any = {}
): Promise<void> {
  await db.collection('job_queue').doc(jobId).update({
    status,
    ...additionalData,
    updatedAt: FieldValue.serverTimestamp()
  });
}