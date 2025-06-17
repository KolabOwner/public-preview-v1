/**
 * Storage abstraction for cloud functions
 * Provides unified interface for file operations
 */

import { getStorage } from 'firebase-admin/storage';
import { getConfig } from './config';

export interface StorageUploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface StorageDownloadResult {
  data: Buffer;
  contentType: string;
  size: number;
  metadata?: Record<string, string>;
}

export class StorageService {
  private storage = getStorage();
  private bucket = this.storage.bucket(getConfig().storageBucket);

  /**
   * Upload file to storage
   */
  async uploadFile(
    data: Buffer | ArrayBuffer,
    path: string,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<StorageUploadResult> {
    const file = this.bucket.file(path);
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    
    const metadata = {
      contentType: options?.contentType || 'application/octet-stream',
      metadata: options?.metadata || {}
    };

    await file.save(buffer, { metadata });
    
    // Get signed URL for download
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    return {
      url,
      path,
      size: buffer.length,
      contentType: metadata.contentType,
      metadata: metadata.metadata
    };
  }

  /**
   * Download file from storage
   */
  async downloadFile(path: string): Promise<StorageDownloadResult> {
    const file = this.bucket.file(path);
    
    // Get file metadata
    const [metadata] = await file.getMetadata();
    
    // Download file contents
    const [contents] = await file.download();

    return {
      data: contents,
      contentType: metadata.contentType || 'application/octet-stream',
      size: metadata.size,
      metadata: metadata.metadata
    };
  }

  /**
   * Download file from URL
   */
  async downloadFromUrl(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Delete file from storage
   */
  async deleteFile(path: string): Promise<void> {
    const file = this.bucket.file(path);
    await file.delete();
  }

  /**
   * Check if file exists
   */
  async fileExists(path: string): Promise<boolean> {
    const file = this.bucket.file(path);
    const [exists] = await file.exists();
    return exists;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path: string): Promise<Record<string, any>> {
    const file = this.bucket.file(path);
    const [metadata] = await file.getMetadata();
    return metadata;
  }

  /**
   * Generate file path with timestamp and unique ID
   */
  generatePath(userId: string, originalName: string, category: string = 'uploads'): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || 'bin';
    return `${category}/${userId}/${timestamp}-${randomId}.${extension}`;
  }
}

// Singleton instance
export const storageService = new StorageService();