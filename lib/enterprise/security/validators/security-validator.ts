/**
 * Security Validator
 * Comprehensive security checks including DLP, sanitization, and threat detection
 */

import { Validator, ValidationResult } from './base';

interface SecurityValidatorConfig {
  virusScan?: boolean;
  threatDetection?: boolean;
  sanitization?: boolean;
  checksumVerification?: boolean;
  dlpPatterns?: string[];
}

export class SecurityValidator extends Validator {
  name = 'SecurityValidator';
  
  private dlpPatterns = {
    ssn: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
    creditCard: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
    bankAccount: /\b\d{8,17}\b/g,
    apiKey: /\b[A-Za-z0-9]{32,}\b/g,
    privateKey: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
    password: /(?:password|passwd|pwd)[\s:=]+[\S]+/gi,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
  };

  constructor(private config: SecurityValidatorConfig = {}) {
    super();
  }

  async validate(file: File | Buffer | ArrayBuffer, context?: any): Promise<ValidationResult> {
    const errors = [];
    const warnings = [];
    const metadata: Record<string, any> = {};

    try {
      const buffer = await this.getBuffer(file);
      const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1000000)); // Limit to 1MB for text analysis

      // Data Leak Protection
      if (this.config.dlpPatterns || true) { // Always run DLP
        const dlpResults = this.performDLPCheck(content);
        metadata.dlp = dlpResults;
        
        if (dlpResults.violations.length > 0) {
          for (const violation of dlpResults.violations) {
            if (violation.severity === 'high') {
              errors.push({
                code: 'DLP_VIOLATION',
                message: `Sensitive data detected: ${violation.type}`,
                field: 'content',
                severity: 'high' as const
              });
            } else {
              warnings.push({
                code: 'DLP_WARNING',
                message: `Potentially sensitive data: ${violation.type} (${violation.count} instances)`
              });
            }
          }
        }
      }

      // Threat Detection
      if (this.config.threatDetection !== false) {
        const threatResults = this.detectThreats(buffer, content);
        metadata.threats = threatResults;
        
        if (threatResults.detected) {
          errors.push({
            code: 'THREAT_DETECTED',
            message: `Security threat detected: ${threatResults.type}`,
            field: 'content',
            severity: 'critical' as const
          });
        }
      }

      // Content Sanitization Check
      if (this.config.sanitization !== false) {
        const sanitizationResults = this.checkSanitization(content);
        metadata.sanitization = sanitizationResults;
        
        if (!sanitizationResults.safe) {
          warnings.push({
            code: 'UNSANITIZED_CONTENT',
            message: 'Content contains potentially unsafe elements that should be sanitized'
          });
        }
      }

      // Advanced Security Checks
      const advancedChecks = this.performAdvancedSecurityChecks(buffer, content);
      metadata.advancedSecurity = advancedChecks;
      
      if (advancedChecks.issues.length > 0) {
        for (const issue of advancedChecks.issues) {
          if (issue.severity === 'high' || issue.severity === 'critical') {
            errors.push({
              code: issue.code,
              message: issue.message,
              severity: issue.severity
            });
          } else {
            warnings.push({
              code: issue.code,
              message: issue.message
            });
          }
        }
      }

    } catch (error) {
      errors.push({
        code: 'SECURITY_VALIDATION_ERROR',
        message: `Security validation failed: ${error.message}`,
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

  private performDLPCheck(content: string): { violations: any[]; redactedContent?: string } {
    const violations = [];
    let redactedContent = content;

    for (const [type, pattern] of Object.entries(this.dlpPatterns)) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const severity = this.getDLPSeverity(type, matches.length);
        violations.push({
          type,
          count: matches.length,
          severity,
          samples: this.getRedactedSamples(matches.slice(0, 3))
        });

        // Redact sensitive data
        if (severity === 'high') {
          redactedContent = redactedContent.replace(pattern, '[REDACTED]');
        }
      }
    }

    return { violations, redactedContent: violations.length > 0 ? redactedContent : undefined };
  }

  private getDLPSeverity(type: string, count: number): 'low' | 'medium' | 'high' {
    const highSeverityTypes = ['ssn', 'creditCard', 'privateKey', 'apiKey'];
    const mediumSeverityTypes = ['bankAccount', 'password'];
    
    if (highSeverityTypes.includes(type)) return 'high';
    if (mediumSeverityTypes.includes(type)) return count > 5 ? 'high' : 'medium';
    return count > 10 ? 'medium' : 'low';
  }

  private getRedactedSamples(samples: string[]): string[] {
    return samples.map(sample => {
      if (sample.length <= 4) return '*'.repeat(sample.length);
      return sample.substring(0, 2) + '*'.repeat(sample.length - 4) + sample.substring(sample.length - 2);
    });
  }

  private detectThreats(buffer: Buffer, content: string): { detected: boolean; type?: string; details?: any } {
    // Check for known exploit patterns
    const exploitPatterns = [
      { pattern: /eval\s*\(\s*unescape/i, type: 'Code injection attempt' },
      { pattern: /<script[^>]*src\s*=\s*["']https?:\/\/[^"']+\.js["']/i, type: 'Remote script injection' },
      { pattern: /document\.write\s*\(\s*unescape/i, type: 'XSS attempt' },
      { pattern: /javascript:\s*[^"'\s]+/i, type: 'JavaScript protocol handler' },
      { pattern: /on\w+\s*=\s*["'][^"']*["']/i, type: 'Event handler injection' }
    ];

    for (const { pattern, type } of exploitPatterns) {
      if (pattern.test(content)) {
        return { detected: true, type, details: { pattern: pattern.toString() } };
      }
    }

    // Check for binary exploits
    const binaryExploits = [
      { sig: [0x90, 0x90, 0x90, 0x90], type: 'NOP sled detected' },
      { sig: [0x41, 0x41, 0x41, 0x41], type: 'Buffer overflow pattern' }
    ];

    for (const { sig, type } of binaryExploits) {
      if (this.findPattern(buffer, sig, 10)) { // Find 10 consecutive instances
        return { detected: true, type };
      }
    }

    return { detected: false };
  }

  private checkSanitization(content: string): { safe: boolean; issues?: string[] } {
    const issues = [];

    // Check for unsanitized HTML
    if (/<[^>]+>/.test(content)) {
      const dangerousTags = /<(script|iframe|object|embed|form|input|link|meta|style)/i;
      if (dangerousTags.test(content)) {
        issues.push('Dangerous HTML tags detected');
      }
    }

    // Check for SQL injection patterns
    const sqlPatterns = /(\b(union|select|insert|update|delete|drop|create)\b.*\b(from|where|into|values)\b)|(-{2}|\/\*|\*\/)/i;
    if (sqlPatterns.test(content)) {
      issues.push('Potential SQL injection patterns');
    }

    // Check for path traversal
    if (/\.\.\/|\.\.\\/.test(content)) {
      issues.push('Path traversal patterns detected');
    }

    return {
      safe: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  private performAdvancedSecurityChecks(buffer: Buffer, content: string): { issues: any[] } {
    const issues = [];

    // Check for hidden data in PDF
    if (buffer.toString('utf8', 0, 5) === '%PDF-') {
      // Check for suspicious PDF elements
      if (/\/AA|\/OpenAction/.test(content)) {
        issues.push({
          code: 'PDF_AUTO_ACTION',
          message: 'PDF contains automatic actions',
          severity: 'medium' as const
        });
      }

      if (/\/U\s*\(|\/O\s*\(/.test(content)) {
        issues.push({
          code: 'PDF_ENCRYPTED_SUSPICIOUS',
          message: 'PDF has suspicious encryption',
          severity: 'medium' as const
        });
      }
    }

    // Check for steganography indicators
    const entropy = this.calculateEntropy(buffer.slice(0, 1000));
    if (entropy > 7.5) {
      issues.push({
        code: 'HIGH_ENTROPY',
        message: 'File has unusually high entropy, possible encrypted/compressed data',
        severity: 'low' as const
      });
    }

    // Check for polyglot files
    if (this.isPolyglot(buffer)) {
      issues.push({
        code: 'POLYGLOT_FILE',
        message: 'File appears to be multiple file types (polyglot)',
        severity: 'high' as const
      });
    }

    return { issues };
  }

  private findPattern(buffer: Buffer, pattern: number[], minCount: number): boolean {
    let count = 0;
    for (let i = 0; i <= buffer.length - pattern.length; i++) {
      let match = true;
      for (let j = 0; j < pattern.length; j++) {
        if (buffer[i + j] !== pattern[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        count++;
        if (count >= minCount) return true;
      }
    }
    return false;
  }

  private calculateEntropy(buffer: Buffer): number {
    const freq = new Array(256).fill(0);
    for (let i = 0; i < buffer.length; i++) {
      freq[buffer[i]]++;
    }

    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (freq[i] > 0) {
        const p = freq[i] / buffer.length;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy;
  }

  private isPolyglot(buffer: Buffer): boolean {
    // Check if file appears to be multiple types
    const signatures = [
      { offset: 0, sig: [0x25, 0x50, 0x44, 0x46] }, // PDF
      { offset: 0, sig: [0xFF, 0xD8, 0xFF] }, // JPEG
      { offset: 0, sig: [0x89, 0x50, 0x4E, 0x47] }, // PNG
      { offset: 0, sig: [0x50, 0x4B, 0x03, 0x04] } // ZIP
    ];

    let typeCount = 0;
    for (const { offset, sig } of signatures) {
      if (buffer.length > offset + sig.length) {
        let match = true;
        for (let i = 0; i < sig.length; i++) {
          if (buffer[offset + i] !== sig[i]) {
            match = false;
            break;
          }
        }
        if (match) typeCount++;
      }
    }

    return typeCount > 1;
  }
}