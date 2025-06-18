/**
 * Content Validator
 * Validates file content for security threats and compliance
 */

import { Validator, ValidationResult } from './base';

interface ContentValidatorConfig {
  maxPages?: number;
  minTextLength?: number;
  maxTextLength?: number;
  malwareScanning?: boolean;
  contentTypeVerification?: boolean;
  allowedContentTypes?: string[];
  blockExecutable?: boolean;
  blockMacros?: boolean;
  sanitizeMetadata?: boolean;
}

export class ContentValidator extends Validator {
  name = 'ContentValidator';
  
  constructor(private config: ContentValidatorConfig) {
    super();
  }

  async validate(file: File | Buffer | ArrayBuffer, context?: any): Promise<ValidationResult> {
    const errors = [];
    const warnings = [];
    const metadata: Record<string, any> = {};

    try {
      const buffer = await this.getBuffer(file);
      
      // Check for executable content
      if (this.config.blockExecutable) {
        const execCheck = this.checkForExecutableContent(buffer);
        if (execCheck.found) {
          errors.push({
            code: 'EXECUTABLE_CONTENT_FOUND',
            message: 'File contains potentially executable content',
            field: 'content',
            severity: 'critical' as const
          });
          metadata.executableContent = execCheck.details;
        }
      }

      // Check for macros (in Office documents)
      if (this.config.blockMacros) {
        const macroCheck = this.checkForMacros(buffer);
        if (macroCheck.found) {
          errors.push({
            code: 'MACRO_CONTENT_FOUND',
            message: 'File contains macros which are not allowed',
            field: 'content',
            severity: 'high' as const
          });
          metadata.macros = macroCheck.details;
        }
      }

      // Check for embedded objects
      const embeddedCheck = this.checkForEmbeddedObjects(buffer);
      metadata.embeddedObjects = embeddedCheck;
      if (embeddedCheck.count > 10) {
        warnings.push({
          code: 'MANY_EMBEDDED_OBJECTS',
          message: `File contains ${embeddedCheck.count} embedded objects`
        });
      }

      // Check for suspicious patterns
      const suspiciousPatterns = this.checkSuspiciousPatterns(buffer);
      if (suspiciousPatterns.length > 0) {
        warnings.push({
          code: 'SUSPICIOUS_PATTERNS',
          message: 'File contains suspicious patterns that may indicate malicious content'
        });
        metadata.suspiciousPatterns = suspiciousPatterns;
      }

      // PDF-specific checks
      if (this.isPDF(buffer)) {
        const pdfChecks = await this.validatePDFContent(buffer);
        metadata.pdfAnalysis = pdfChecks.metadata;
        errors.push(...pdfChecks.errors);
        warnings.push(...pdfChecks.warnings);
      }

      // Check content structure
      if (context?.expectedStructure) {
        const structureCheck = this.validateContentStructure(buffer, context.expectedStructure);
        if (!structureCheck.valid) {
          warnings.push({
            code: 'UNEXPECTED_STRUCTURE',
            message: 'File structure differs from expected format'
          });
        }
      }

    } catch (error) {
      errors.push({
        code: 'CONTENT_VALIDATION_ERROR',
        message: `Content validation failed: ${error.message}`,
        severity: 'critical' as const
      });
    }

    return {
      valid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      errors,
      warnings,
      metadata
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

  private checkForExecutableContent(buffer: Buffer): { found: boolean; details?: any } {
    const executableSignatures = [
      { sig: [0x4D, 0x5A], name: 'PE/COFF executable' }, // MZ
      { sig: [0x7F, 0x45, 0x4C, 0x46], name: 'ELF executable' }, // .ELF
      { sig: [0xCA, 0xFE, 0xBA, 0xBE], name: 'Mach-O executable' },
      { sig: [0xFE, 0xED, 0xFA, 0xCE], name: 'Mach-O executable' },
      { sig: [0x23, 0x21], name: 'Script shebang' } // #!
    ];

    for (const { sig, name } of executableSignatures) {
      if (this.bufferStartsWith(buffer, sig)) {
        return { found: true, details: { type: name } };
      }
    }

    // Check for JavaScript in PDFs
    if (this.isPDF(buffer)) {
      const jsPattern = /\/JavaScript|\/JS/;
      const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
      if (jsPattern.test(content)) {
        return { found: true, details: { type: 'JavaScript in PDF' } };
      }
    }

    return { found: false };
  }

  private checkForMacros(buffer: Buffer): { found: boolean; details?: any } {
    // Check for Office document macros
    const macroSignatures = [
      'vbaProject.bin',
      'macros/vbaProject.bin',
      '_VBA_PROJECT_CUR',
      'VBA_PROJECT'
    ];

    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 50000));
    for (const sig of macroSignatures) {
      if (content.includes(sig)) {
        return { found: true, details: { signature: sig } };
      }
    }

    return { found: false };
  }

  private checkForEmbeddedObjects(buffer: Buffer): { count: number; types: string[] } {
    const types: string[] = [];
    let count = 0;

    // Check for common embedded object patterns
    const patterns = [
      { pattern: /\/EmbeddedFile/g, type: 'PDF Embedded File' },
      { pattern: /<<\/Type\/Filespec/g, type: 'PDF File Specification' },
      { pattern: /obj\s*<<.*\/Subtype\s*\/Flash/g, type: 'Flash Object' },
      { pattern: /<object\s+/gi, type: 'HTML Object' },
      { pattern: /<embed\s+/gi, type: 'HTML Embed' }
    ];

    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 100000));
    
    for (const { pattern, type } of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        count += matches.length;
        types.push(type);
      }
    }

    return { count, types: [...new Set(types)] };
  }

  private checkSuspiciousPatterns(buffer: Buffer): string[] {
    const suspicious: string[] = [];
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 50000));

    // Check for obfuscation patterns
    if (/eval\s*\(|Function\s*\(|setTimeout\s*\(/.test(content)) {
      suspicious.push('Code evaluation patterns');
    }

    // Check for hex-encoded content
    if (/[0-9a-fA-F]{100,}/.test(content)) {
      suspicious.push('Long hex strings (possible encoded payload)');
    }

    // Check for base64 encoded content
    if (/[A-Za-z0-9+\/]{100,}={0,2}/.test(content)) {
      suspicious.push('Long base64 strings (possible encoded payload)');
    }

    // Check for URL patterns that might be malicious
    const urlPattern = /https?:\/\/[^\s"'<>]+/g;
    const urls = content.match(urlPattern) || [];
    const suspiciousUrls = urls.filter(url => 
      /\.(tk|ml|ga|cf|free|download|xxx|adult)/i.test(url) ||
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(url)
    );
    
    if (suspiciousUrls.length > 0) {
      suspicious.push('Suspicious URLs detected');
    }

    return suspicious;
  }

  private async validatePDFContent(buffer: Buffer): Promise<{ errors: any[]; warnings: any[]; metadata: any }> {
    const errors = [];
    const warnings = [];
    const metadata: any = {};

    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 100000));

    // Check for forms
    if (/\/AcroForm/.test(content)) {
      metadata.hasForms = true;
      warnings.push({
        code: 'PDF_FORMS_DETECTED',
        message: 'PDF contains interactive forms'
      });
    }

    // Check for encryption
    if (/\/Encrypt/.test(content)) {
      metadata.isEncrypted = true;
      warnings.push({
        code: 'PDF_ENCRYPTED',
        message: 'PDF is encrypted'
      });
    }

    // Check page count (rough estimate)
    const pageMatches = content.match(/\/Type\s*\/Page[^s]/g);
    if (pageMatches) {
      metadata.estimatedPages = pageMatches.length;
      if (this.config.maxPages && pageMatches.length > this.config.maxPages) {
        errors.push({
          code: 'TOO_MANY_PAGES',
          message: `PDF has too many pages (${pageMatches.length} > ${this.config.maxPages})`,
          severity: 'medium' as const
        });
      }
    }

    // Check for suspicious PDF features
    if (/\/Launch|\/GoToR|\/ImportData|\/SubmitForm/.test(content)) {
      errors.push({
        code: 'DANGEROUS_PDF_ACTIONS',
        message: 'PDF contains potentially dangerous actions',
        severity: 'high' as const
      });
    }

    return { errors, warnings, metadata };
  }

  private validateContentStructure(buffer: Buffer, expectedStructure: any): { valid: boolean } {
    // Implement structure validation based on expected format
    // This is a placeholder for custom structure validation
    return { valid: true };
  }

  private isPDF(buffer: Buffer): boolean {
    return buffer.length > 4 && buffer.toString('utf8', 0, 5) === '%PDF-';
  }

  private bufferStartsWith(buffer: Buffer, bytes: number[]): boolean {
    if (buffer.length < bytes.length) return false;
    for (let i = 0; i < bytes.length; i++) {
      if (buffer[i] !== bytes[i]) return false;
    }
    return true;
  }
}