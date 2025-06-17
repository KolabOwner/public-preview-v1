/**
 * File Type Validator
 * Validates file types using MIME types, extensions, and magic numbers
 */

import { Validator, ValidationResult } from './index';

interface FileTypeValidatorConfig {
  allowed: string[];  // Allowed extensions
  mimeTypes: string[];  // Allowed MIME types
  magicNumbers?: Record<string, number[]>;  // Magic number signatures
}

export class FileTypeValidator extends Validator {
  name = 'FileTypeValidator';
  
  constructor(private config: FileTypeValidatorConfig) {
    super();
  }

  async validate(file: File | Buffer | ArrayBuffer): Promise<ValidationResult> {
    const errors = [];
    const warnings = [];
    const metadata: Record<string, any> = {};

    try {
      // Convert to File if needed
      const fileObj = file instanceof File ? file : null;
      const buffer = await this.getBuffer(file);

      // Check file extension
      if (fileObj) {
        const extension = this.getFileExtension(fileObj.name);
        metadata.extension = extension;
        
        if (!this.config.allowed.includes(extension)) {
          errors.push({
            code: 'INVALID_FILE_EXTENSION',
            message: `File extension '${extension}' is not allowed. Allowed: ${this.config.allowed.join(', ')}`,
            field: 'extension',
            severity: 'high' as const
          });
        }

        // Check MIME type
        metadata.mimeType = fileObj.type;
        if (!this.config.mimeTypes.includes(fileObj.type)) {
          errors.push({
            code: 'INVALID_MIME_TYPE',
            message: `MIME type '${fileObj.type}' is not allowed. Allowed: ${this.config.mimeTypes.join(', ')}`,
            field: 'mimeType',
            severity: 'high' as const
          });
        }
      }

      // Check magic numbers
      if (this.config.magicNumbers && buffer.length >= 4) {
        const magicValid = this.validateMagicNumbers(buffer);
        metadata.magicNumberValid = magicValid;
        
        if (!magicValid) {
          errors.push({
            code: 'INVALID_MAGIC_NUMBER',
            message: 'File content does not match expected file type signature',
            field: 'content',
            severity: 'critical' as const
          });
        }
      }

      // Additional checks for specific file types
      if (metadata.extension === '.pdf' || metadata.mimeType === 'application/pdf') {
        const pdfChecks = this.validatePDFStructure(buffer);
        if (!pdfChecks.valid) {
          errors.push(...pdfChecks.errors);
        }
        metadata.pdfStructure = pdfChecks.metadata;
      }

    } catch (error) {
      errors.push({
        code: 'FILE_TYPE_VALIDATION_ERROR',
        message: `File type validation failed: ${error.message}`,
        severity: 'critical' as const
      });
    }

    return {
      valid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      errors,
      warnings,
      metadata,
      severity: this.getHighestSeverity(errors)
    };
  }

  private async getBuffer(file: File | Buffer | ArrayBuffer): Promise<Buffer> {
    if (Buffer.isBuffer(file)) {
      return file;
    } else if (file instanceof ArrayBuffer) {
      return Buffer.from(file);
    } else if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
    throw new Error('Invalid file type');
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.slice(lastDot).toLowerCase();
  }

  private validateMagicNumbers(buffer: Buffer): boolean {
    if (!this.config.magicNumbers) return true;

    for (const [fileType, signature] of Object.entries(this.config.magicNumbers)) {
      let matches = true;
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
    return false;
  }

  private validatePDFStructure(buffer: Buffer): { valid: boolean; errors: any[]; metadata: any } {
    const errors = [];
    const metadata: any = {};

    // Check PDF header
    const header = buffer.slice(0, 8).toString('utf8');
    metadata.header = header;
    
    if (!header.startsWith('%PDF-')) {
      errors.push({
        code: 'INVALID_PDF_HEADER',
        message: 'PDF file does not have valid header',
        severity: 'critical' as const
      });
    }

    // Check PDF version
    const versionMatch = header.match(/%PDF-(\d+\.\d+)/);
    if (versionMatch) {
      metadata.version = versionMatch[1];
      const version = parseFloat(versionMatch[1]);
      if (version > 2.0) {
        warnings.push({
          code: 'HIGH_PDF_VERSION',
          message: `PDF version ${version} may not be fully supported`
        });
      }
    }

    // Check for EOF marker
    const footer = buffer.slice(-32).toString('utf8');
    metadata.hasEOF = footer.includes('%%EOF');
    
    if (!metadata.hasEOF) {
      errors.push({
        code: 'MISSING_PDF_EOF',
        message: 'PDF file does not have proper EOF marker',
        severity: 'medium' as const
      });
    }

    return {
      valid: errors.filter(e => e.severity === 'critical').length === 0,
      errors,
      metadata
    };
  }

  private getHighestSeverity(errors: any[]): 'low' | 'medium' | 'high' | 'critical' {
    if (errors.some(e => e.severity === 'critical')) return 'critical';
    if (errors.some(e => e.severity === 'high')) return 'high';
    if (errors.some(e => e.severity === 'medium')) return 'medium';
    return 'low';
  }
}