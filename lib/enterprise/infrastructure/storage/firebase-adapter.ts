/**
 * Firebase Storage Adapter
 * Production-ready implementation of IStorageAdapter for Firebase Storage
 * Includes temporary access functionality via Cloud Functions
 */

import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  getMetadata as getFirebaseMetadata,
  updateMetadata as updateFirebaseMetadata,
  getBytes
} from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { 
  IStorageAdapter, 
  StorageUploadResult, 
  StorageDownloadResult 
} from '@/lib/enterprise/core/interfaces';
import { logger } from '@/lib/enterprise/monitoring/logging';

export interface FirebaseStorageConfig {
  bucketName?: string;
  basePath?: string;
  enableTemporaryAccess?: boolean;
  defaultTempAccessDuration?: number; // in seconds
}

export interface TemporaryAccessOptions {
  expiresIn: number; // seconds
  allowedIPs?: string[];
  maxDownloads?: number;
  requireAuth?: boolean;
}

export class FirebaseStorageAdapter implements IStorageAdapter {
  private storage = getStorage();
  private functions = getFunctions();
  private basePath: string;
  private enableTemporaryAccess: boolean;
  private defaultTempAccessDuration: number;

  constructor(config: FirebaseStorageConfig = {}) {
    this.basePath = config.basePath || 'enterprise-storage';
    this.enableTemporaryAccess = config.enableTemporaryAccess ?? true;
    this.defaultTempAccessDuration = config.defaultTempAccessDuration || 3600; // 1 hour default
  }

  /**
   * Upload file to Firebase Storage with temporary access metadata
   */
  async upload(
    file: File | Blob | ArrayBuffer, 
    path: string, 
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
      temporaryAccess?: TemporaryAccessOptions;
    }
  ): Promise<StorageUploadResult> {
    // Construct full path with base path
    const fullPath = `${this.basePath}/${path}`;
    const storageRef = ref(this.storage, fullPath);

    // Convert ArrayBuffer to Blob if needed
    const uploadData = file instanceof ArrayBuffer 
      ? new Blob([file], { type: options?.contentType || 'application/octet-stream' }) 
      : file;

    // Prepare metadata for Firebase
    const metadata = {
      contentType: options?.contentType || (file instanceof File ? file.type : 'application/octet-stream'),
      customMetadata: {
        ...options?.metadata,
        uploadedAt: new Date().toISOString(),
        ...(file instanceof File && { originalName: file.name }),
        // Add temporary access metadata if enabled
        ...(this.enableTemporaryAccess && options?.temporaryAccess && {
          tempAccessEnabled: 'true',
          tempAccessDuration: options.temporaryAccess.expiresIn.toString(),
          tempAccessCreatedAt: new Date().toISOString(),
          ...(options.temporaryAccess.requireAuth && { requireAuth: 'true' }),
          ...(options.temporaryAccess.maxDownloads && { maxDownloads: options.temporaryAccess.maxDownloads.toString() })
        })
      }
    };

    try {
      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, uploadData, metadata);
      
      // Get appropriate URL based on access type
      let url: string;
      if (this.enableTemporaryAccess && options?.temporaryAccess) {
        // Generate temporary signed URL via Cloud Function
        url = await this.generateSignedUrl(fullPath, options.temporaryAccess);
      } else {
        // Get permanent download URL
        url = await getDownloadURL(snapshot.ref);
      }

      logger.info('File uploaded successfully', {
        path: fullPath,
        size: snapshot.metadata.size,
        temporaryAccess: !!options?.temporaryAccess
      });

      return {
        url,
        path: fullPath,
        size: snapshot.metadata.size,
        contentType: snapshot.metadata.contentType || '',
        metadata: snapshot.metadata.customMetadata
      };
    } catch (error) {
      logger.error('Firebase Storage upload failed', {
        path: fullPath,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Firebase Storage upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Download file from Firebase Storage
   */
  async download(path: string): Promise<StorageDownloadResult> {
    const fullPath = `${this.basePath}/${path}`;
    const storageRef = ref(this.storage, fullPath);

    try {
      // Get metadata first
      const metadata = await getFirebaseMetadata(storageRef);
      
      // Check if temporary access validation is needed
      if (metadata.customMetadata?.tempAccessEnabled === 'true') {
        await this.validateTemporaryAccess(metadata.customMetadata);
      }
      
      // Download file data as ArrayBuffer
      const arrayBuffer = await getBytes(storageRef);

      // Update download count if tracking is enabled
      if (metadata.customMetadata?.maxDownloads) {
        await this.incrementDownloadCount(fullPath);
      }

      return {
        data: arrayBuffer,
        contentType: metadata.contentType || 'application/octet-stream',
        size: metadata.size,
        metadata: metadata.customMetadata
      };
    } catch (error) {
      logger.error('Firebase Storage download failed', {
        path: fullPath,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Firebase Storage download failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete file from Firebase Storage
   */
  async delete(path: string): Promise<void> {
    const fullPath = `${this.basePath}/${path}`;
    const storageRef = ref(this.storage, fullPath);

    try {
      await deleteObject(storageRef);
      
      // Clean up any temporary access records
      if (this.enableTemporaryAccess) {
        await this.cleanupTemporaryAccessRecords(fullPath);
      }

      logger.info('File deleted successfully', { path: fullPath });
    } catch (error) {
      logger.error('Firebase Storage delete failed', {
        path: fullPath,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Firebase Storage delete failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if file exists in Firebase Storage
   */
  async exists(path: string): Promise<boolean> {
    const fullPath = `${this.basePath}/${path}`;
    const storageRef = ref(this.storage, fullPath);

    try {
      await getFirebaseMetadata(storageRef);
      return true;
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        return false;
      }
      throw new Error(`Firebase Storage exists check failed: ${error.message}`);
    }
  }

  /**
   * Get download URL for file
   */
  async getDownloadUrl(path: string): Promise<string> {
    const fullPath = `${this.basePath}/${path}`;
    const storageRef = ref(this.storage, fullPath);

    try {
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw new Error(`Firebase Storage URL generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get signed URL with temporary access via Cloud Function
   */
  async getSignedUrl(path: string, expiresIn: number): Promise<string> {
    if (!this.enableTemporaryAccess) {
      // Fallback to regular download URL if temporary access is disabled
      return this.getDownloadUrl(path);
    }

    try {
      // Call Cloud Function to generate signed URL
      const generateSignedUrl = httpsCallable<
        { path: string; expiresIn: number },
        { url: string; expiresAt: string }
      >(this.functions, 'generateSignedStorageUrl');

      const result = await generateSignedUrl({ 
        path, 
        expiresIn 
      });

      logger.info('Generated signed URL', {
        path,
        expiresIn,
        expiresAt: result.data.expiresAt
      });

      return result.data.url;
    } catch (error) {
      logger.error('Failed to generate signed URL', {
        path,
        error: error instanceof Error ? error.message : String(error)
      });
      // Fallback to regular URL on error
      return this.getDownloadUrl(path);
    }
  }

  /**
   * Update file metadata
   */
  async updateMetadata(path: string, metadata: Record<string, string>): Promise<void> {
    const fullPath = `${this.basePath}/${path}`;
    const storageRef = ref(this.storage, fullPath);

    try {
      await updateFirebaseMetadata(storageRef, {
        customMetadata: {
          ...metadata,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      throw new Error(`Firebase Storage metadata update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get file metadata
   */
  async getMetadata(path: string): Promise<Record<string, string>> {
    const fullPath = `${this.basePath}/${path}`;
    const storageRef = ref(this.storage, fullPath);

    try {
      const metadata = await getFirebaseMetadata(storageRef);
      return metadata.customMetadata || {};
    } catch (error) {
      throw new Error(`Firebase Storage metadata retrieval failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate signed URL via Cloud Function with advanced options
   */
  private async generateSignedUrl(
    path: string, 
    options: TemporaryAccessOptions
  ): Promise<string> {
    try {
      const generateSignedUrl = httpsCallable<
        { 
          path: string; 
          options: TemporaryAccessOptions 
        },
        { 
          url: string; 
          expiresAt: string;
          accessToken?: string;
        }
      >(this.functions, 'generateAdvancedSignedUrl');

      const result = await generateSignedUrl({ path, options });

      return result.data.url;
    } catch (error) {
      logger.error('Failed to generate advanced signed URL', {
        path,
        options,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Validate temporary access permissions
   */
  private async validateTemporaryAccess(metadata: Record<string, string>): Promise<void> {
    if (metadata.tempAccessEnabled !== 'true') {
      return;
    }

    const createdAt = new Date(metadata.tempAccessCreatedAt).getTime();
    const duration = parseInt(metadata.tempAccessDuration) * 1000; // Convert to milliseconds
    const expiresAt = createdAt + duration;

    if (Date.now() > expiresAt) {
      throw new Error('Temporary access has expired');
    }

    // Additional validations can be added here (IP restrictions, auth requirements, etc.)
  }

  /**
   * Increment download count for files with download limits
   */
  private async incrementDownloadCount(path: string): Promise<void> {
    try {
      const trackDownload = httpsCallable<
        { path: string },
        { downloadCount: number }
      >(this.functions, 'trackFileDownload');

      await trackDownload({ path });
    } catch (error) {
      logger.warn('Failed to track download count', {
        path,
        error: error instanceof Error ? error.message : String(error)
      });
      // Don't throw - allow download to proceed even if tracking fails
    }
  }

  /**
   * Clean up temporary access records when file is deleted
   */
  private async cleanupTemporaryAccessRecords(path: string): Promise<void> {
    try {
      const cleanup = httpsCallable<
        { path: string },
        { success: boolean }
      >(this.functions, 'cleanupTemporaryAccess');

      await cleanup({ path });
    } catch (error) {
      logger.warn('Failed to cleanup temporary access records', {
        path,
        error: error instanceof Error ? error.message : String(error)
      });
      // Don't throw - file deletion should succeed even if cleanup fails
    }
  }
}