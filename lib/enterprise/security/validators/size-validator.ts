/**
 * Size Validator
 * Validates file size constraints
 */

import { Validator, ValidationResult } from './base';

interface SizeValidatorConfig {
  maxSize: number;  // Maximum size in bytes
  minSize?: number; // Minimum size in bytes
  warnSize?: number; // Size to trigger warning
}

export class SizeValidator extends Validator {
  name = 'SizeValidator';
  
  constructor(private config: SizeValidatorConfig) {
    super();
  }

  async validate(file: File | Buffer | ArrayBuffer): Promise<ValidationResult> {
    const errors = [];
    const warnings = [];
    const metadata: Record<string, any> = {};

    try {
      const size = this.getFileSize(file);
      metadata.size = size;
      metadata.sizeHuman = this.formatBytes(size);

      // Check minimum size
      if (this.config.minSize && size < this.config.minSize) {
        errors.push({
          code: 'FILE_TOO_SMALL',
          message: `File size (${this.formatBytes(size)}) is below minimum allowed size (${this.formatBytes(this.config.minSize)})`,
          field: 'size',
          severity: 'medium' as const
        });
      }

      // Check maximum size
      if (size > this.config.maxSize) {
        errors.push({
          code: 'FILE_TOO_LARGE',
          message: `File size (${this.formatBytes(size)}) exceeds maximum allowed size (${this.formatBytes(this.config.maxSize)})`,
          field: 'size',
          severity: 'high' as const
        });
      }

      // Check warning size
      if (this.config.warnSize && size > this.config.warnSize) {
        warnings.push({
          code: 'LARGE_FILE_WARNING',
          message: `File size (${this.formatBytes(size)}) is large and may take longer to process`
        });
      }

      // Additional metadata
      metadata.compressionEstimate = this.estimateCompression(size);
      metadata.processingTimeEstimate = this.estimateProcessingTime(size);

    } catch (error) {
      errors.push({
        code: 'SIZE_VALIDATION_ERROR',
        message: `Size validation failed: ${error.message}`,
        severity: 'critical' as const
      });
    }

    return {
      valid: errors.filter(e => e.severity === 'high' || e.severity === 'critical').length === 0,
      errors,
      warnings,
      metadata
    };
  }

  private getFileSize(file: File | Buffer | ArrayBuffer): number {
    if (file instanceof File) {
      return file.size;
    } else if (Buffer.isBuffer(file)) {
      return file.length;
    } else if (file instanceof ArrayBuffer) {
      return file.byteLength;
    }
    throw new Error('Unable to determine file size');
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private estimateCompression(size: number): string {
    // Estimate potential compression ratio for PDFs
    const ratio = 0.7; // PDFs typically compress to 70% of original size
    const compressedSize = size * ratio;
    return `~${this.formatBytes(compressedSize)} after compression`;
  }

  private estimateProcessingTime(size: number): string {
    // Rough estimation: 1MB = 1 second processing
    const seconds = Math.ceil(size / (1024 * 1024));
    if (seconds < 60) {
      return `~${seconds} seconds`;
    } else {
      const minutes = Math.ceil(seconds / 60);
      return `~${minutes} minutes`;
    }
  }
}