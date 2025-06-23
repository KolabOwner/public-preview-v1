/**
 * Firebase Real-time Updates System
 * Provides real-time communication using Firebase Firestore listeners
 */
import React from "react";
import { 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  Unsubscribe,
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import { db } from '@/lib/features/auth/firebase-config';
import { logger } from '../../monitoring/logging';
import { metrics } from '../../monitoring/metrics';

export interface RealtimeUpdate {
  id: string;
  type: UpdateType;
  userId: string;
  resourceId: string;
  resourceType: ResourceType;
  status: string;
  data: any;
  progress?: number;
  message?: string;
  error?: any;
  timestamp: any;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export enum UpdateType {
  // Resume Processing
  RESUME_PROCESSING_STARTED = 'resume.processing.started',
  RESUME_PROCESSING_PROGRESS = 'resume.processing.progress',
  RESUME_PROCESSING_COMPLETED = 'resume.processing.completed',
  RESUME_PROCESSING_FAILED = 'resume.processing.failed',
  
  // Job Queue
  JOB_CREATED = 'job.created',
  JOB_STARTED = 'job.started',
  JOB_PROGRESS = 'job.progress',
  JOB_COMPLETED = 'job.completed',
  JOB_FAILED = 'job.failed',
  
  // System
  SYSTEM_NOTIFICATION = 'system.notification',
  SYSTEM_ALERT = 'system.alert',
  
  // User
  USER_NOTIFICATION = 'user.notification',
  USER_ACTION_REQUIRED = 'user.action.required'
}

export enum ResourceType {
  RESUME = 'resume',
  JOB = 'job',
  USER = 'user',
  SYSTEM = 'system'
}

export class FirebaseRealtimeService {
  private static instance: FirebaseRealtimeService;
  private subscriptions = new Map<string, Unsubscribe>();
  private updateBuffer: RealtimeUpdate[] = [];
  private flushInterval?: NodeJS.Timeout;
  private readonly COLLECTION_NAME = 'realtime_updates';
  private readonly BUFFER_SIZE = 10;
  private readonly FLUSH_INTERVAL = 1000; // 1 second

  private constructor() {
    this.startFlushInterval();
  }

  static getInstance(): FirebaseRealtimeService {
    if (!this.instance) {
      this.instance = new FirebaseRealtimeService();
    }
    return this.instance;
  }

  /**
   * Sends a real-time update
   */
  async sendUpdate(update: Omit<RealtimeUpdate, 'id' | 'timestamp'>): Promise<void> {
    const fullUpdate: RealtimeUpdate = {
      ...update,
      id: this.generateUpdateId(),
      timestamp: serverTimestamp()
    };

    // Add to buffer for batch writing
    this.updateBuffer.push(fullUpdate);

    // Flush if buffer is full
    if (this.updateBuffer.length >= this.BUFFER_SIZE) {
      await this.flushBuffer();
    }

    // Log and track metrics
    logger.debug('Realtime update queued', {
      type: update.type,
      userId: update.userId,
      resourceId: update.resourceId
    });

    metrics.increment('realtime.updates.sent', 1, { type: update.type });
  }

  /**
   * Subscribes to updates for a specific user
   */
  subscribeToUserUpdates(
    userId: string,
    callback: (updates: RealtimeUpdate[]) => void,
    options?: {
      resourceTypes?: ResourceType[];
      updateTypes?: UpdateType[];
      limit?: number;
    }
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    
    let q = query(
      collection(db, this.COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    // Apply filters
    if (options?.resourceTypes?.length) {
      q = query(q, where('resourceType', 'in', options.resourceTypes));
    }

    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updates: RealtimeUpdate[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data() as RealtimeUpdate;
          
          // Apply update type filter if specified
          if (!options?.updateTypes?.length || options.updateTypes.includes(data.type)) {
            updates.push({
              ...data,
              id: doc.id
            });
          }
        });

        // Sort by timestamp (newest first)
        updates.sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeB - timeA;
        });

        callback(updates);

        logger.debug('Realtime updates delivered', {
          userId,
          count: updates.length,
          subscriptionId
        });
      },
      (error: FirestoreError) => {
        logger.error('Realtime subscription error', error, {
          userId,
          subscriptionId
        });
        
        metrics.increment('realtime.subscription.errors');
      }
    );

    this.subscriptions.set(subscriptionId, unsubscribe);
    
    logger.info('Realtime subscription created', {
      userId,
      subscriptionId,
      filters: options
    });

    metrics.increment('realtime.subscriptions.active');
    metrics.gauge('realtime.subscriptions.total', this.subscriptions.size);

    return subscriptionId;
  }

  /**
   * Subscribes to updates for a specific resource
   */
  subscribeToResourceUpdates(
    resourceType: ResourceType,
    resourceId: string,
    callback: (update: RealtimeUpdate | null) => void
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('resourceType', '==', resourceType),
      where('resourceId', '==', resourceId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const update = {
            ...doc.data(),
            id: doc.id
          } as RealtimeUpdate;
          
          callback(update);
        } else {
          callback(null);
        }
      },
      (error: FirestoreError) => {
        logger.error('Resource subscription error', error, {
          resourceType,
          resourceId,
          subscriptionId
        });
      }
    );

    this.subscriptions.set(subscriptionId, unsubscribe);
    
    return subscriptionId;
  }

  /**
   * Subscribes to system-wide updates
   */
  subscribeToSystemUpdates(
    callback: (updates: RealtimeUpdate[]) => void,
    options?: {
      updateTypes?: UpdateType[];
      severity?: string[];
    }
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    
    let q = query(
      collection(db, this.COLLECTION_NAME),
      where('resourceType', '==', ResourceType.SYSTEM),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updates: RealtimeUpdate[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data() as RealtimeUpdate;
          
          // Apply filters
          if (!options?.updateTypes?.length || options.updateTypes.includes(data.type)) {
            if (!options?.severity?.length || options.severity.includes(data.data?.severity)) {
              updates.push({
                ...data,
                id: doc.id
              });
            }
          }
        });

        callback(updates);
      },
      (error: FirestoreError) => {
        logger.error('System subscription error', error, {
          subscriptionId
        });
      }
    );

    this.subscriptions.set(subscriptionId, unsubscribe);
    
    return subscriptionId;
  }

  /**
   * Unsubscribes from updates
   */
  unsubscribe(subscriptionId: string): boolean {
    const unsubscribe = this.subscriptions.get(subscriptionId);
    
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(subscriptionId);
      
      logger.debug('Realtime subscription removed', { subscriptionId });
      metrics.decrement('realtime.subscriptions.active');
      metrics.gauge('realtime.subscriptions.total', this.subscriptions.size);
      
      return true;
    }
    
    return false;
  }

  /**
   * Unsubscribes from all updates
   */
  unsubscribeAll(): void {
    for (const [id, unsubscribe] of this.subscriptions) {
      unsubscribe();
    }
    
    this.subscriptions.clear();
    
    logger.info('All realtime subscriptions removed');
    metrics.gauge('realtime.subscriptions.total', 0);
  }

  /**
   * Sends resume processing update
   */
  async sendResumeUpdate(
    userId: string,
    resumeId: string,
    status: 'started' | 'progress' | 'completed' | 'failed',
    data: any
  ): Promise<void> {
    let updateType: UpdateType;
    
    switch (status) {
      case 'started':
        updateType = UpdateType.RESUME_PROCESSING_STARTED;
        break;
      case 'progress':
        updateType = UpdateType.RESUME_PROCESSING_PROGRESS;
        break;
      case 'completed':
        updateType = UpdateType.RESUME_PROCESSING_COMPLETED;
        break;
      case 'failed':
        updateType = UpdateType.RESUME_PROCESSING_FAILED;
        break;
    }

    await this.sendUpdate({
      type: updateType,
      userId,
      resourceId: resumeId,
      resourceType: ResourceType.RESUME,
      status,
      data,
      progress: data.progress,
      message: data.message,
      error: data.error,
      correlationId: resumeId
    });
  }

  /**
   * Sends job update
   */
  async sendJobUpdate(
    userId: string,
    jobId: string,
    status: 'created' | 'started' | 'progress' | 'completed' | 'failed',
    data: any
  ): Promise<void> {
    let updateType: UpdateType;
    
    switch (status) {
      case 'created':
        updateType = UpdateType.JOB_CREATED;
        break;
      case 'started':
        updateType = UpdateType.JOB_STARTED;
        break;
      case 'progress':
        updateType = UpdateType.JOB_PROGRESS;
        break;
      case 'completed':
        updateType = UpdateType.JOB_COMPLETED;
        break;
      case 'failed':
        updateType = UpdateType.JOB_FAILED;
        break;
    }

    await this.sendUpdate({
      type: updateType,
      userId,
      resourceId: jobId,
      resourceType: ResourceType.JOB,
      status,
      data,
      progress: data.progress,
      correlationId: jobId
    });
  }

  /**
   * Sends system notification
   */
  async sendSystemNotification(
    message: string,
    severity: 'info' | 'warning' | 'error' | 'critical',
    data?: any
  ): Promise<void> {
    await this.sendUpdate({
      type: UpdateType.SYSTEM_NOTIFICATION,
      userId: 'system',
      resourceId: 'system',
      resourceType: ResourceType.SYSTEM,
      status: severity,
      data: {
        message,
        severity,
        ...data
      },
      message
    });
  }

  /**
   * Flushes the update buffer to Firestore
   */
  private async flushBuffer(): Promise<void> {
    if (this.updateBuffer.length === 0) return;

    const updates = [...this.updateBuffer];
    this.updateBuffer = [];

    try {
      // Write all updates to Firestore
      const promises = updates.map(update => 
        setDoc(doc(collection(db, this.COLLECTION_NAME)), update)
      );

      await Promise.all(promises);

      logger.debug('Realtime updates flushed', {
        count: updates.length
      });

      metrics.increment('realtime.updates.flushed', updates.length);

    } catch (error) {
      logger.error('Failed to flush realtime updates', error, {
        count: updates.length
      });

      // Re-add failed updates to buffer
      this.updateBuffer.unshift(...updates);
      
      metrics.increment('realtime.updates.flush_errors');
    }
  }

  /**
   * Starts the flush interval
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flushBuffer();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Stops the flush interval
   */
  stopFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      // Flush any remaining updates
      this.flushBuffer();
    }
  }

  /**
   * Generates a unique update ID
   */
  private generateUpdateId(): string {
    return `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets subscription statistics
   */
  getStatistics(): any {
    return {
      activeSubscriptions: this.subscriptions.size,
      bufferSize: this.updateBuffer.length,
      subscriptionIds: Array.from(this.subscriptions.keys())
    };
  }
}

// Export singleton instance
export const realtimeService = FirebaseRealtimeService.getInstance();

/**
 * React hook for subscribing to realtime updates
 */
export function useRealtimeUpdates(
  userId: string,
  options?: {
    resourceTypes?: ResourceType[];
    updateTypes?: UpdateType[];
    limit?: number;
  }
): RealtimeUpdate[] {
  const [updates, setUpdates] = React.useState<RealtimeUpdate[]>([]);

  React.useEffect(() => {
    if (!userId) return;

    const subscriptionId = realtimeService.subscribeToUserUpdates(
      userId,
      (newUpdates) => setUpdates(newUpdates),
      options
    );

    return () => {
      realtimeService.unsubscribe(subscriptionId);
    };
  }, [userId, JSON.stringify(options)]);

  return updates;
}

/**
 * React hook for subscribing to resource updates
 */
export function useResourceUpdates(
  resourceType: ResourceType,
  resourceId: string
): RealtimeUpdate | null {
  const [update, setUpdate] = React.useState<RealtimeUpdate | null>(null);

  React.useEffect(() => {
    if (!resourceId) return;

    const subscriptionId = realtimeService.subscribeToResourceUpdates(
      resourceType,
      resourceId,
      (newUpdate) => setUpdate(newUpdate)
    );

    return () => {
      realtimeService.unsubscribe(subscriptionId);
    };
  }, [resourceType, resourceId]);

  return update;
}