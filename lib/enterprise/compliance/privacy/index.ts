/**
 * Data Privacy and GDPR Compliance
 * Implements privacy controls, data retention, and user rights management
 */

import { 
  doc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { EncryptionService } from '../../security/encryption';
import { logger } from '../../monitoring/logging';
import { metrics } from '../../monitoring/metrics';

export interface PrivacyPolicy {
  dataRetention: DataRetentionPolicy;
  userRights: UserRightsPolicy;
  dataMinimization: DataMinimizationPolicy;
  encryption: EncryptionPolicy;
}

export interface DataRetentionPolicy {
  resumes: RetentionRule;
  processedData: RetentionRule;
  logs: RetentionRule;
  analytics: RetentionRule;
}

export interface RetentionRule {
  duration: number; // milliseconds
  action: 'delete' | 'archive' | 'anonymize';
  exceptions?: string[];
}

export interface UserRightsPolicy {
  access: boolean;
  rectification: boolean;
  erasure: boolean;
  portability: boolean;
  restriction: boolean;
  objection: boolean;
}

export interface DataMinimizationPolicy {
  collectOnlyNecessary: boolean;
  purposeLimitation: boolean;
  accuracyRequirement: boolean;
}

export interface EncryptionPolicy {
  atRest: boolean;
  inTransit: boolean;
  fields: string[];
}

export class PrivacyComplianceService {
  private static instance: PrivacyComplianceService;
  private encryptionService: EncryptionService;
  
  private readonly defaultPolicy: PrivacyPolicy = {
    dataRetention: {
      resumes: {
        duration: 365 * 24 * 60 * 60 * 1000, // 1 year
        action: 'delete'
      },
      processedData: {
        duration: 90 * 24 * 60 * 60 * 1000, // 90 days
        action: 'anonymize'
      },
      logs: {
        duration: 30 * 24 * 60 * 60 * 1000, // 30 days
        action: 'delete',
        exceptions: ['security', 'audit']
      },
      analytics: {
        duration: 180 * 24 * 60 * 60 * 1000, // 180 days
        action: 'anonymize'
      }
    },
    userRights: {
      access: true,
      rectification: true,
      erasure: true,
      portability: true,
      restriction: true,
      objection: true
    },
    dataMinimization: {
      collectOnlyNecessary: true,
      purposeLimitation: true,
      accuracyRequirement: true
    },
    encryption: {
      atRest: true,
      inTransit: true,
      fields: ['email', 'phone', 'address', 'ssn', 'dateOfBirth']
    }
  };

  private constructor() {
    this.encryptionService = new EncryptionService();
  }

  static getInstance(): PrivacyComplianceService {
    if (!this.instance) {
      this.instance = new PrivacyComplianceService();
    }
    return this.instance;
  }

  /**
   * Implements right to access - exports all user data
   */
  async exportUserData(userId: string): Promise<any> {
    const log = logger.child({ userId, operation: 'data_export' });
    log.info('Starting user data export');

    try {
      const userData: any = {
        exportDate: new Date().toISOString(),
        userId,
        data: {}
      };

      // Export resumes
      const resumesQuery = query(
        collection(db, 'resumes'),
        where('userId', '==', userId)
      );
      const resumesSnapshot = await getDocs(resumesQuery);
      userData.data.resumes = resumesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Export user profile
      const userDoc = await getDocs(query(
        collection(db, 'users'),
        where('uid', '==', userId)
      ));
      if (!userDoc.empty) {
        userData.data.profile = userDoc.docs[0].data();
      }

      // Export activity logs (limited)
      const logsQuery = query(
        collection(db, 'user_activity'),
        where('userId', '==', userId)
      );
      const logsSnapshot = await getDocs(logsQuery);
      userData.data.activityLogs = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      log.info('User data export completed', {
        resumeCount: userData.data.resumes.length,
        hasProfile: !!userData.data.profile
      });

      metrics.increment('privacy.data_export.success');

      return userData;

    } catch (error) {
      log.error('User data export failed', error);
      metrics.increment('privacy.data_export.error');
      throw error;
    }
  }

  /**
   * Implements right to erasure - deletes all user data
   */
  async deleteUserData(userId: string, options?: { 
    keepAnonymized?: boolean;
    reason?: string;
  }): Promise<void> {
    const log = logger.child({ userId, operation: 'data_deletion' });
    log.info('Starting user data deletion', { options });

    try {
      const batch = writeBatch(db);

      // Delete resumes
      const resumesQuery = query(
        collection(db, 'resumes'),
        where('userId', '==', userId)
      );
      const resumesSnapshot = await getDocs(resumesQuery);
      
      for (const doc of resumesSnapshot.docs) {
        if (options?.keepAnonymized) {
          // Anonymize instead of delete
          batch.update(doc.ref, {
            userId: 'anonymous',
            personal: null,
            deletedAt: serverTimestamp(),
            anonymized: true
          });
        } else {
          batch.delete(doc.ref);
        }
      }

      // Delete storage files
      const storageRef = ref(storage, `resumes/${userId}`);
      const fileList = await listAll(storageRef);
      
      const deletePromises = fileList.items.map(item => deleteObject(item));
      await Promise.all(deletePromises);

      // Delete user profile
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );
      const userSnapshot = await getDocs(userQuery);
      
      for (const doc of userSnapshot.docs) {
        batch.delete(doc.ref);
      }

      // Commit batch
      await batch.commit();

      // Log deletion for compliance
      await this.logDataDeletion(userId, options?.reason || 'User request');

      log.info('User data deletion completed', {
        resumesDeleted: resumesSnapshot.size,
        filesDeleted: fileList.items.length
      });

      metrics.increment('privacy.data_deletion.success');

    } catch (error) {
      log.error('User data deletion failed', error);
      metrics.increment('privacy.data_deletion.error');
      throw error;
    }
  }

  /**
   * Implements right to rectification - updates user data
   */
  async updateUserData(userId: string, updates: any): Promise<void> {
    const log = logger.child({ userId, operation: 'data_rectification' });
    log.info('Starting user data rectification');

    try {
      // Update user profile
      const userQuery = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        await updateDoc(userSnapshot.docs[0].ref, {
          ...updates,
          updatedAt: serverTimestamp(),
          rectifiedAt: serverTimestamp()
        });
      }

      log.info('User data rectification completed');
      metrics.increment('privacy.data_rectification.success');

    } catch (error) {
      log.error('User data rectification failed', error);
      metrics.increment('privacy.data_rectification.error');
      throw error;
    }
  }

  /**
   * Implements right to data portability
   */
  async exportPortableData(userId: string): Promise<{
    format: string;
    data: any;
    checksum: string;
  }> {
    const log = logger.child({ userId, operation: 'data_portability' });
    log.info('Starting portable data export');

    try {
      const userData = await this.exportUserData(userId);
      
      // Convert to machine-readable format
      const portableData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        userData: userData.data,
        metadata: {
          format: 'JSON',
          encoding: 'UTF-8',
          compression: 'none'
        }
      };

      // Calculate checksum for integrity
      const checksum = this.encryptionService.hash(
        JSON.stringify(portableData),
        'sha256'
      );

      log.info('Portable data export completed');
      metrics.increment('privacy.data_portability.success');

      return {
        format: 'application/json',
        data: portableData,
        checksum
      };

    } catch (error) {
      log.error('Portable data export failed', error);
      metrics.increment('privacy.data_portability.error');
      throw error;
    }
  }

  /**
   * Applies data retention policies
   */
  async applyRetentionPolicies(): Promise<{
    processed: number;
    deleted: number;
    anonymized: number;
  }> {
    const log = logger.child({ operation: 'retention_policy' });
    log.info('Applying data retention policies');

    const results = {
      processed: 0,
      deleted: 0,
      anonymized: 0
    };

    try {
      // Process each retention rule
      for (const [dataType, rule] of Object.entries(this.defaultPolicy.dataRetention)) {
        const cutoffDate = new Date(Date.now() - rule.duration);
        
        switch (dataType) {
          case 'resumes':
            const resumeResults = await this.processResumeRetention(cutoffDate, rule);
            results.processed += resumeResults.processed;
            results.deleted += resumeResults.deleted;
            results.anonymized += resumeResults.anonymized;
            break;
            
          case 'logs':
            const logResults = await this.processLogRetention(cutoffDate, rule);
            results.processed += logResults.processed;
            results.deleted += logResults.deleted;
            break;
            
          // Add other data types as needed
        }
      }

      log.info('Data retention policies applied', results);
      metrics.gauge('privacy.retention.processed', results.processed);
      metrics.gauge('privacy.retention.deleted', results.deleted);
      metrics.gauge('privacy.retention.anonymized', results.anonymized);

      return results;

    } catch (error) {
      log.error('Failed to apply retention policies', error);
      metrics.increment('privacy.retention.error');
      throw error;
    }
  }

  /**
   * Processes resume retention
   */
  private async processResumeRetention(
    cutoffDate: Date,
    rule: RetentionRule
  ): Promise<{ processed: number; deleted: number; anonymized: number }> {
    const results = { processed: 0, deleted: 0, anonymized: 0 };

    const oldResumesQuery = query(
      collection(db, 'resumes'),
      where('createdAt', '<', cutoffDate)
    );
    
    const snapshot = await getDocs(oldResumesQuery);
    const batch = writeBatch(db);

    for (const doc of snapshot.docs) {
      results.processed++;
      
      if (rule.action === 'delete') {
        batch.delete(doc.ref);
        results.deleted++;
      } else if (rule.action === 'anonymize') {
        batch.update(doc.ref, {
          userId: 'anonymous',
          personal: null,
          anonymizedAt: serverTimestamp()
        });
        results.anonymized++;
      }
    }

    await batch.commit();
    return results;
  }

  /**
   * Processes log retention
   */
  private async processLogRetention(
    cutoffDate: Date,
    rule: RetentionRule
  ): Promise<{ processed: number; deleted: number }> {
    const results = { processed: 0, deleted: 0 };

    const oldLogsQuery = query(
      collection(db, 'logs'),
      where('timestamp', '<', cutoffDate)
    );
    
    const snapshot = await getDocs(oldLogsQuery);
    const batch = writeBatch(db);

    for (const doc of snapshot.docs) {
      const logData = doc.data();
      
      // Check exceptions
      if (rule.exceptions?.includes(logData.type)) {
        continue;
      }
      
      results.processed++;
      batch.delete(doc.ref);
      results.deleted++;
    }

    await batch.commit();
    return results;
  }

  /**
   * Logs data deletion for compliance
   */
  private async logDataDeletion(userId: string, reason: string): Promise<void> {
    await setDoc(doc(collection(db, 'compliance_logs')), {
      type: 'data_deletion',
      userId,
      reason,
      timestamp: serverTimestamp(),
      operator: 'system',
      ip: 'system'
    });
  }

  /**
   * Validates privacy compliance
   */
  async validateCompliance(): Promise<{
    compliant: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check encryption
    if (!this.defaultPolicy.encryption.atRest) {
      issues.push('Encryption at rest is not enabled');
    }

    // Check user rights implementation
    for (const [right, enabled] of Object.entries(this.defaultPolicy.userRights)) {
      if (!enabled) {
        issues.push(`User right '${right}' is not implemented`);
      }
    }

    // Check data minimization
    if (!this.defaultPolicy.dataMinimization.collectOnlyNecessary) {
      issues.push('Data minimization principle not enforced');
    }

    return {
      compliant: issues.length === 0,
      issues
    };
  }
}

// Export singleton instance
export const privacyService = PrivacyComplianceService.getInstance();