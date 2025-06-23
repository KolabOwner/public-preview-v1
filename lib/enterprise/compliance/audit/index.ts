/**
 * Audit Trail Logging System
 * Provides immutable, cryptographically secure audit logging
 */

import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/features/auth/firebase-config';
import { createHash, createHmac } from 'crypto';
import { logger } from '../../monitoring/logging';

export interface AuditEvent {
  id: string;
  timestamp: any;
  eventType: AuditEventType;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  result: 'success' | 'failure' | 'partial';
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  correlationId?: string;
  hash?: string;
  previousHash?: string;
}

export enum AuditEventType {
  // Authentication
  AUTH_LOGIN = 'auth.login',
  AUTH_LOGOUT = 'auth.logout',
  AUTH_FAILED = 'auth.failed',
  AUTH_TOKEN_REFRESH = 'auth.token.refresh',
  
  // Data Access
  DATA_ACCESS = 'data.access',
  DATA_EXPORT = 'data.export',
  DATA_DOWNLOAD = 'data.download',
  
  // Data Modification
  DATA_CREATE = 'data.create',
  DATA_UPDATE = 'data.update',
  DATA_DELETE = 'data.delete',
  
  // Privacy
  PRIVACY_CONSENT = 'privacy.consent',
  PRIVACY_EXPORT = 'privacy.export',
  PRIVACY_DELETE = 'privacy.delete',
  
  // Security
  SECURITY_VIOLATION = 'security.violation',
  SECURITY_ALERT = 'security.alert',
  
  // System
  SYSTEM_CONFIG = 'system.config',
  SYSTEM_ERROR = 'system.error',
  SYSTEM_MAINTENANCE = 'system.maintenance'
}

export interface AuditQuery {
  userId?: string;
  eventType?: AuditEventType;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export class AuditService {
  private static instance: AuditService;
  private readonly COLLECTION_NAME = 'audit_logs';
  private readonly SECRET_KEY = process.env.AUDIT_SECRET_KEY || 'default-audit-key';
  private lastHash: string | null = null;

  private constructor() {
    this.initializeHashChain();
  }

  static getInstance(): AuditService {
    if (!this.instance) {
      this.instance = new AuditService();
    }
    return this.instance;
  }

  /**
   * Logs an audit event
   */
  async log(event: Omit<AuditEvent, 'id' | 'timestamp' | 'hash' | 'previousHash'>): Promise<void> {
    try {
      const auditEvent: AuditEvent = {
        ...event,
        id: this.generateEventId(),
        timestamp: serverTimestamp(),
        previousHash: this.lastHash
      };

      // Calculate hash for immutability
      auditEvent.hash = await this.calculateHash(auditEvent);
      this.lastHash = auditEvent.hash;

      // Store in Firestore
      await setDoc(
        doc(collection(db, this.COLLECTION_NAME)), 
        auditEvent
      );

      // Also log to structured logger for real-time monitoring
      logger.info('Audit event', {
        eventType: event.eventType,
        action: event.action,
        result: event.result,
        userId: event.userId,
        resourceId: event.resourceId
      });

    } catch (error) {
      // Audit logging should never fail silently
      logger.error('Failed to log audit event', error, { event });
      throw error;
    }
  }

  /**
   * Logs authentication events
   */
  async logAuth(
    userId: string,
    action: 'login' | 'logout' | 'failed' | 'refresh',
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventTypeMap = {
      login: AuditEventType.AUTH_LOGIN,
      logout: AuditEventType.AUTH_LOGOUT,
      failed: AuditEventType.AUTH_FAILED,
      refresh: AuditEventType.AUTH_TOKEN_REFRESH
    };

    await this.log({
      eventType: eventTypeMap[action],
      userId,
      action: `User ${action}`,
      result: action === 'failed' ? 'failure' : 'success',
      metadata
    });
  }

  /**
   * Logs data access events
   */
  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: 'view' | 'export' | 'download',
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventTypeMap = {
      view: AuditEventType.DATA_ACCESS,
      export: AuditEventType.DATA_EXPORT,
      download: AuditEventType.DATA_DOWNLOAD
    };

    await this.log({
      eventType: eventTypeMap[action],
      userId,
      resourceType,
      resourceId,
      action: `${action} ${resourceType}`,
      result: 'success',
      metadata
    });
  }

  /**
   * Logs data modification events
   */
  async logDataModification(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: 'create' | 'update' | 'delete',
    result: 'success' | 'failure',
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventTypeMap = {
      create: AuditEventType.DATA_CREATE,
      update: AuditEventType.DATA_UPDATE,
      delete: AuditEventType.DATA_DELETE
    };

    await this.log({
      eventType: eventTypeMap[action],
      userId,
      resourceType,
      resourceId,
      action: `${action} ${resourceType}`,
      result,
      metadata
    });
  }

  /**
   * Logs privacy-related events
   */
  async logPrivacyEvent(
    userId: string,
    action: 'consent' | 'export' | 'delete',
    details: Record<string, any>
  ): Promise<void> {
    const eventTypeMap = {
      consent: AuditEventType.PRIVACY_CONSENT,
      export: AuditEventType.PRIVACY_EXPORT,
      delete: AuditEventType.PRIVACY_DELETE
    };

    await this.log({
      eventType: eventTypeMap[action],
      userId,
      action: `Privacy ${action}`,
      result: 'success',
      metadata: details
    });
  }

  /**
   * Logs security events
   */
  async logSecurityEvent(
    eventType: 'violation' | 'alert',
    details: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.log({
      eventType: eventType === 'violation' 
        ? AuditEventType.SECURITY_VIOLATION 
        : AuditEventType.SECURITY_ALERT,
      userId,
      action: `Security ${eventType}`,
      result: 'failure',
      metadata: details
    });
  }

  /**
   * Queries audit logs
   */
  async query(params: AuditQuery): Promise<AuditEvent[]> {
    let q = query(collection(db, this.COLLECTION_NAME));

    // Apply filters
    if (params.userId) {
      q = query(q, where('userId', '==', params.userId));
    }
    
    if (params.eventType) {
      q = query(q, where('eventType', '==', params.eventType));
    }
    
    if (params.resourceType) {
      q = query(q, where('resourceType', '==', params.resourceType));
    }
    
    if (params.resourceId) {
      q = query(q, where('resourceId', '==', params.resourceId));
    }
    
    if (params.startDate) {
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(params.startDate)));
    }
    
    if (params.endDate) {
      q = query(q, where('timestamp', '<=', Timestamp.fromDate(params.endDate)));
    }

    // Apply ordering and limit
    q = query(q, orderBy('timestamp', 'desc'));
    
    if (params.limit) {
      q = query(q, limit(params.limit));
    }

    // Execute query
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditEvent));
  }

  /**
   * Verifies audit log integrity
   */
  async verifyIntegrity(startDate?: Date, endDate?: Date): Promise<{
    valid: boolean;
    errors: string[];
    eventsChecked: number;
  }> {
    const errors: string[] = [];
    let eventsChecked = 0;
    let previousHash: string | null = null;

    // Query events in chronological order
    let q = query(
      collection(db, this.COLLECTION_NAME),
      orderBy('timestamp', 'asc')
    );

    if (startDate) {
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(startDate)));
    }
    
    if (endDate) {
      q = query(q, where('timestamp', '<=', Timestamp.fromDate(endDate)));
    }

    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
      const event = doc.data() as AuditEvent;
      eventsChecked++;

      // Verify hash chain
      if (event.previousHash !== previousHash) {
        errors.push(`Hash chain broken at event ${event.id}`);
      }

      // Verify event hash
      const calculatedHash = await this.calculateHash(event);
      if (calculatedHash !== event.hash) {
        errors.push(`Hash mismatch for event ${event.id}`);
      }

      previousHash = event.hash || null;
    }

    return {
      valid: errors.length === 0,
      errors,
      eventsChecked
    };
  }

  /**
   * Generates audit report
   */
  async generateReport(
    startDate: Date,
    endDate: Date,
    groupBy?: 'user' | 'eventType' | 'resource'
  ): Promise<any> {
    const events = await this.query({ startDate, endDate });
    
    const report: any = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      totalEvents: events.length,
      summary: {}
    };

    // Group events
    if (groupBy === 'user') {
      report.summary = this.groupByUser(events);
    } else if (groupBy === 'eventType') {
      report.summary = this.groupByEventType(events);
    } else if (groupBy === 'resource') {
      report.summary = this.groupByResource(events);
    }

    // Calculate statistics
    report.statistics = {
      successRate: events.filter(e => e.result === 'success').length / events.length,
      failureRate: events.filter(e => e.result === 'failure').length / events.length,
      uniqueUsers: new Set(events.map(e => e.userId).filter(Boolean)).size,
      eventTypes: this.countEventTypes(events)
    };

    return report;
  }

  /**
   * Initializes the hash chain
   */
  private async initializeHashChain(): Promise<void> {
    // Get the most recent event to continue the chain
    const q = query(
      collection(db, this.COLLECTION_NAME),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const lastEvent = snapshot.docs[0].data() as AuditEvent;
      this.lastHash = lastEvent.hash || null;
    }
  }

  /**
   * Calculates hash for an audit event
   */
  private async calculateHash(event: AuditEvent): Promise<string> {
    // Create a deterministic string representation
    const eventString = JSON.stringify({
      id: event.id,
      eventType: event.eventType,
      userId: event.userId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      action: event.action,
      result: event.result,
      previousHash: event.previousHash
    });

    // Calculate HMAC-SHA256
    const hmac = createHmac('sha256', this.SECRET_KEY);
    hmac.update(eventString);
    return hmac.digest('hex');
  }

  /**
   * Generates unique event ID
   */
  private generateEventId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Groups events by user
   */
  private groupByUser(events: AuditEvent[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    for (const event of events) {
      const key = event.userId || 'anonymous';
      grouped[key] = (grouped[key] || 0) + 1;
    }
    
    return grouped;
  }

  /**
   * Groups events by type
   */
  private groupByEventType(events: AuditEvent[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    for (const event of events) {
      grouped[event.eventType] = (grouped[event.eventType] || 0) + 1;
    }
    
    return grouped;
  }

  /**
   * Groups events by resource
   */
  private groupByResource(events: AuditEvent[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    for (const event of events) {
      if (event.resourceType) {
        grouped[event.resourceType] = (grouped[event.resourceType] || 0) + 1;
      }
    }
    
    return grouped;
  }

  /**
   * Counts event types
   */
  private countEventTypes(events: AuditEvent[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const event of events) {
      const category = event.eventType.split('.')[0];
      counts[category] = (counts[category] || 0) + 1;
    }
    
    return counts;
  }
}

// Export singleton instance
export const auditService = AuditService.getInstance();

// Export auditLogger as an alias for compatibility
export const auditLogger = auditService;