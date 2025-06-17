/**
 * Firebase-based Job Queue
 * Implements job queue using Firestore for persistence
 */

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
const db = getFirestore();
import { logger } from '../../monitoring/logging';
import { metrics } from '../../monitoring/metrics';

export enum JobPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying'
}

export interface Job<T = any> {
  id: string;
  type: string;
  data: T;
  priority: JobPriority;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: any;
  startedAt?: any;
  completedAt?: any;
  scheduledFor?: any;
  error?: any;
  result?: any;
  progress?: number;
  workerId?: string;
  metadata?: Record<string, any>;
}

export interface JobProcessor<T = any, R = any> {
  process(job: Job<T>): Promise<R>;
  onProgress?: (job: Job<T>, progress: number) => void;
}

export class JobQueue {
  private readonly COLLECTION_NAME = 'job_queue';
  private processors = new Map<string, JobProcessor>();
  private activeJobs = new Map<string, Job>();
  private isProcessing = false;
  private workerId = this.generateWorkerId();
  private processInterval?: NodeJS.Timeout;
  private unsubscribers: (() => void)[] = [];

  constructor(private concurrency: number = 5) {}

  /**
   * Registers a job processor
   */
  registerProcessor<T, R>(type: string, processor: JobProcessor<T, R>): void {
    this.processors.set(type, processor);
    logger.info(`Registered Firebase job processor: ${type}`);
  }

  /**
   * Adds a job to the queue
   */
  async addJob<T>(
    type: string, 
    data: T, 
    options: {
      priority?: JobPriority;
      maxAttempts?: number;
      delay?: number;
      scheduledFor?: Date;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<Job<T>> {
    const job: Job<T> = {
      id: this.generateJobId(),
      type,
      data,
      priority: options.priority || JobPriority.NORMAL,
      status: JobStatus.PENDING,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: serverTimestamp(),
      metadata: options.metadata || {}
    };

    // Handle scheduling
    if (options.delay) {
      job.scheduledFor = Timestamp.fromDate(new Date(Date.now() + options.delay));
    } else if (options.scheduledFor) {
      job.scheduledFor = Timestamp.fromDate(options.scheduledFor);
    }

    // Save to Firestore
    await setDoc(doc(collection(db, this.COLLECTION_NAME)), job);

    logger.info(`Job added to Firebase queue: ${job.id}`, { 
      type, 
      priority: JobPriority[job.priority] 
    });

    metrics.increment('firebase.job.added', 1, { type, priority: JobPriority[job.priority] });

    return job;
  }

  /**
   * Gets a job by ID
   */
  async getJob(jobId: string): Promise<Job | null> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('id', '==', jobId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return snapshot.docs[0].data() as Job;
  }

  /**
   * Updates job progress
   */
  async updateProgress(jobId: string, progress: number): Promise<void> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('id', '==', jobId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, { progress });
    }
  }

  /**
   * Cancels a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('id', '==', jobId),
      where('status', 'in', [JobStatus.PENDING, JobStatus.RETRYING]),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;

    await updateDoc(snapshot.docs[0].ref, {
      status: JobStatus.CANCELLED,
      completedAt: serverTimestamp()
    });

    metrics.increment('firebase.job.cancelled');
    return true;
  }

  /**
   * Public method to complete a job by ID
   */
  async completeJob(jobId: string, result?: any): Promise<void> {
    const job = { id: jobId } as Job;
    await this.completeJobInternal(job, result || {});
  }

  /**
   * Public method to fail a job by ID
   */
  async failJob(jobId: string, error: string): Promise<void> {
    const job = { id: jobId } as Job;
    await this.failJobInternal(job, new Error(error));
  }

  /**
   * Starts processing jobs
   */
  startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    logger.info('Firebase job processing started', { workerId: this.workerId });

    // Set up real-time listener for new jobs
    this.setupJobListener();

    // Process jobs periodically
    this.processInterval = setInterval(() => {
      this.processNextBatch();
    }, 1000); // Check every second
  }

  /**
   * Stops processing jobs
   */
  stopProcessing(): void {
    this.isProcessing = false;
    
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }

    // Unsubscribe from all listeners
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];

    logger.info('Firebase job processing stopped', { workerId: this.workerId });
  }

  /**
   * Sets up real-time listener for new jobs
   */
  private setupJobListener(): void {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('status', '==', JobStatus.PENDING),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty && this.activeJobs.size < this.concurrency) {
        this.processNextBatch();
      }
    });

    this.unsubscribers.push(unsubscribe);
  }

  /**
   * Processes the next batch of jobs
   */
  private async processNextBatch(): Promise<void> {
    if (!this.isProcessing) return;

    const availableSlots = this.concurrency - this.activeJobs.size;
    if (availableSlots <= 0) return;

    try {
      // Get next available jobs
      const jobs = await this.getAvailableJobs(availableSlots);
      
      // Process each job
      for (const job of jobs) {
        this.processJob(job);
      }
    } catch (error) {
      logger.error('Failed to process job batch', error);
    }
  }

  /**
   * Gets available jobs to process
   */
  private async getAvailableJobs(maxJobs: number): Promise<Job[]> {
    const now = Timestamp.now();
    
    // Query for available jobs
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('status', '==', JobStatus.PENDING),
      where('scheduledFor', '<=', now),
      orderBy('scheduledFor'),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'asc'),
      limit(maxJobs)
    );

    const snapshot = await getDocs(q);
    const jobs: Job[] = [];

    // Use transaction to claim jobs
    for (const docSnapshot of snapshot.docs) {
      try {
        const claimed = await runTransaction(db, async (transaction) => {
          const freshDoc = await transaction.get(docSnapshot.ref);
          
          if (freshDoc.exists() && freshDoc.data().status === JobStatus.PENDING) {
            transaction.update(docSnapshot.ref, {
              status: JobStatus.RUNNING,
              startedAt: serverTimestamp(),
              workerId: this.workerId,
              attempts: (freshDoc.data().attempts || 0) + 1
            });
            return true;
          }
          return false;
        });

        if (claimed) {
          jobs.push({ ...docSnapshot.data() as Job, id: docSnapshot.id });
        }
      } catch (error) {
        logger.error('Failed to claim job', error);
      }
    }

    return jobs;
  }

  /**
   * Processes a single job
   */
  private async processJob(job: Job): Promise<void> {
    const processor = this.processors.get(job.type);
    if (!processor) {
      logger.error(`No processor registered for job type: ${job.type}`);
      await this.failJobInternal(job, new Error(`No processor for type: ${job.type}`));
      return;
    }

    this.activeJobs.set(job.id, job);
    const timer = metrics.startTimer(`firebase.job.processing.duration`, { type: job.type });

    try {
      logger.debug(`Processing job: ${job.id}`, { type: job.type, attempt: job.attempts });

      // Set up progress callback
      if (processor.onProgress) {
        processor.onProgress = async (job, progress) => {
          await this.updateProgress(job.id, progress);
        };
      }

      // Process job
      const result = await processor.process(job);

      // Mark as completed
      await this.completeJobInternal(job, result);
      
      timer();
      metrics.increment('firebase.job.completed', 1, { type: job.type });

    } catch (error) {
      timer();
      
      if (job.attempts < job.maxAttempts) {
        await this.retryJob(job, error);
        metrics.increment('firebase.job.retry', 1, { type: job.type });
      } else {
        await this.failJobInternal(job, error);
        metrics.increment('firebase.job.failed', 1, { type: job.type });
      }
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  /**
   * Marks job as completed
   */
  private async completeJobInternal(job: Job, result: any): Promise<void> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('id', '==', job.id),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, {
        status: JobStatus.COMPLETED,
        completedAt: serverTimestamp(),
        result
      });
    }

    logger.info(`Job completed: ${job.id}`, { type: job.type });
  }

  /**
   * Retries a job
   */
  private async retryJob(job: Job, error: any): Promise<void> {
    const delay = Math.pow(2, job.attempts) * 1000; // Exponential backoff
    const scheduledFor = Timestamp.fromDate(new Date(Date.now() + delay));

    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('id', '==', job.id),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, {
        status: JobStatus.PENDING,
        scheduledFor,
        error: {
          message: error.message,
          stack: error.stack,
          attempt: job.attempts
        }
      });
    }

    logger.warn(`Job scheduled for retry: ${job.id}`, { 
      type: job.type, 
      attempt: job.attempts,
      delay 
    });
  }

  /**
   * Marks job as failed
   */
  private async failJobInternal(job: Job, error: any): Promise<void> {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('id', '==', job.id),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, {
        status: JobStatus.FAILED,
        completedAt: serverTimestamp(),
        error: {
          message: error.message,
          stack: error.stack,
          attempts: job.attempts
        }
      });
    }

    logger.error(`Job failed permanently: ${job.id}`, { 
      type: job.type, 
      attempts: job.attempts,
      error: error.message 
    });
  }

  /**
   * Gets queue statistics
   */
  async getStatistics(): Promise<any> {
    const stats: any = {
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      byPriority: {}
    };

    // Count by status
    for (const status of Object.values(JobStatus)) {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', status)
      );
      const snapshot = await getDocs(q);
      stats[status] = snapshot.size;
    }

    // Count by priority for pending jobs
    for (const priority of [JobPriority.LOW, JobPriority.NORMAL, JobPriority.HIGH, JobPriority.CRITICAL]) {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', JobStatus.PENDING),
        where('priority', '==', priority)
      );
      const snapshot = await getDocs(q);
      stats.byPriority[JobPriority[priority]] = snapshot.size;
    }

    stats.activeWorkers = this.activeJobs.size;
    stats.workerId = this.workerId;

    return stats;
  }

  /**
   * Cleans up old completed/failed jobs
   */
  async cleanup(olderThan: Date): Promise<number> {
    const batch = writeBatch(db);
    let count = 0;

    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('status', 'in', [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]),
      where('completedAt', '<', Timestamp.fromDate(olderThan))
    );

    const snapshot = await getDocs(q);
    
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
      count++;
    });

    if (count > 0) {
      await batch.commit();
      logger.info(`Cleaned up ${count} old jobs`);
    }

    return count;
  }

  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWorkerId(): string {
    return `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const jobQueue = new JobQueue();