/**
 * Data Leak Protection (DLP) Service
 * Detects and prevents sensitive data exposure
 */

import { createHash } from 'crypto';

export interface DLPConfig {
  patterns: DLPPattern[];
  actions: DLPAction[];
  whitelist?: string[];
  enableRedaction?: boolean;
  enableHashing?: boolean;
  enableLogging?: boolean;
}

export interface DLPPattern {
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
}

export interface DLPAction {
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'redact' | 'block' | 'alert';
}

export interface DLPResult {
  clean: boolean;
  violations: DLPViolation[];
  redactedContent?: string;
  statistics: DLPStatistics;
}

export interface DLPViolation {
  pattern: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  samples: string[];
  locations: number[];
}

export interface DLPStatistics {
  totalViolations: number;
  violationsBySeverity: Record<string, number>;
  violationsByCategory: Record<string, number>;
  processingTime: number;
}

export class DataLeakProtectionService {
  private defaultPatterns: DLPPattern[] = [
    // Financial Data
    {
      name: 'Credit Card',
      pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
      severity: 'critical',
      category: 'financial',
      description: 'Credit card numbers'
    },
    {
      name: 'Bank Account',
      pattern: /\b[0-9]{8,17}\b/g,
      severity: 'high',
      category: 'financial',
      description: 'Bank account numbers'
    },
    {
      name: 'IBAN',
      pattern: /\b[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}\b/g,
      severity: 'high',
      category: 'financial',
      description: 'International Bank Account Numbers'
    },
    
    // Personal Identifiable Information (PII)
    {
      name: 'SSN',
      pattern: /\b(?!000|666|9\d{2})\d{3}[-\s]?(?!00)\d{2}[-\s]?(?!0000)\d{4}\b/g,
      severity: 'critical',
      category: 'pii',
      description: 'Social Security Numbers'
    },
    {
      name: 'Passport',
      pattern: /\b[A-Z]{1,2}[0-9]{6,9}\b/g,
      severity: 'high',
      category: 'pii',
      description: 'Passport numbers'
    },
    {
      name: 'Driver License',
      pattern: /\b[A-Z]{1,2}[0-9]{5,8}\b/g,
      severity: 'medium',
      category: 'pii',
      description: 'Driver license numbers'
    },
    
    // Authentication & Secrets
    {
      name: 'API Key',
      pattern: /\b[A-Za-z0-9_\-]{32,64}\b/g,
      severity: 'critical',
      category: 'secrets',
      description: 'API keys and tokens'
    },
    {
      name: 'Private Key',
      pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]+?-----END (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
      severity: 'critical',
      category: 'secrets',
      description: 'Private cryptographic keys'
    },
    {
      name: 'AWS Key',
      pattern: /\b(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/g,
      severity: 'critical',
      category: 'secrets',
      description: 'AWS access keys'
    },
    {
      name: 'JWT Token',
      pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
      severity: 'high',
      category: 'secrets',
      description: 'JSON Web Tokens'
    },
    
    // Contact Information
    {
      name: 'Email',
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      severity: 'low',
      category: 'contact',
      description: 'Email addresses'
    },
    {
      name: 'Phone',
      pattern: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
      severity: 'low',
      category: 'contact',
      description: 'Phone numbers'
    },
    
    // Network & Infrastructure
    {
      name: 'IPv4 Address',
      pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
      severity: 'medium',
      category: 'network',
      description: 'IPv4 addresses'
    },
    {
      name: 'IPv6 Address',
      pattern: /\b(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}\b/gi,
      severity: 'medium',
      category: 'network',
      description: 'IPv6 addresses'
    }
  ];

  constructor(private config?: Partial<DLPConfig>) {
    if (config?.patterns) {
      this.defaultPatterns = [...this.defaultPatterns, ...config.patterns];
    }
  }

  async scan(content: string): Promise<DLPResult> {
    const startTime = Date.now();
    const violations: DLPViolation[] = [];
    let redactedContent = content;
    
    const statistics: DLPStatistics = {
      totalViolations: 0,
      violationsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      violationsByCategory: {},
      processingTime: 0
    };

    // Scan for each pattern
    for (const pattern of this.defaultPatterns) {
      const matches = Array.from(content.matchAll(pattern.pattern));
      
      if (matches.length > 0) {
        const locations = matches.map(m => m.index!);
        const samples = this.getSamples(matches.map(m => m[0]));
        
        violations.push({
          pattern: pattern.name,
          category: pattern.category,
          severity: pattern.severity,
          count: matches.length,
          samples,
          locations
        });

        // Update statistics
        statistics.totalViolations += matches.length;
        statistics.violationsBySeverity[pattern.severity] += matches.length;
        statistics.violationsByCategory[pattern.category] = 
          (statistics.violationsByCategory[pattern.category] || 0) + matches.length;

        // Redact if enabled and severity is high enough
        if (this.config?.enableRedaction && 
            (pattern.severity === 'critical' || pattern.severity === 'high')) {
          redactedContent = this.redactContent(redactedContent, pattern.pattern, pattern.name);
        }
      }
    }

    // Apply whitelist if configured
    if (this.config?.whitelist) {
      violations.forEach(violation => {
        violation.samples = violation.samples.filter(
          sample => !this.config!.whitelist!.includes(sample)
        );
      });
    }

    statistics.processingTime = Date.now() - startTime;

    return {
      clean: violations.length === 0,
      violations,
      redactedContent: violations.length > 0 ? redactedContent : undefined,
      statistics
    };
  }

  async scanFile(file: File | Buffer): Promise<DLPResult> {
    const content = await this.extractTextContent(file);
    return this.scan(content);
  }

  private async extractTextContent(file: File | Buffer): Promise<string> {
    if (Buffer.isBuffer(file)) {
      return file.toString('utf8');
    } else if (file instanceof File) {
      const text = await file.text();
      return text;
    }
    throw new Error('Unsupported file type');
  }

  private getSamples(matches: string[], maxSamples: number = 3): string[] {
    const samples = matches.slice(0, maxSamples);
    
    if (this.config?.enableHashing) {
      return samples.map(s => this.hashSensitiveData(s));
    }
    
    return samples.map(s => this.maskSensitiveData(s));
  }

  private maskSensitiveData(data: string): string {
    if (data.length <= 4) {
      return '*'.repeat(data.length);
    }
    
    const visibleChars = Math.min(4, Math.floor(data.length / 4));
    const prefix = data.substring(0, visibleChars);
    const suffix = data.substring(data.length - visibleChars);
    const masked = '*'.repeat(data.length - (visibleChars * 2));
    
    return `${prefix}${masked}${suffix}`;
  }

  private hashSensitiveData(data: string): string {
    const hash = createHash('sha256').update(data).digest('hex');
    return `SHA256:${hash.substring(0, 8)}...`;
  }

  private redactContent(content: string, pattern: RegExp, patternName: string): string {
    return content.replace(pattern, `[REDACTED:${patternName}]`);
  }

  getDefaultPatterns(): DLPPattern[] {
    return [...this.defaultPatterns];
  }

  addPattern(pattern: DLPPattern): void {
    this.defaultPatterns.push(pattern);
  }

  removePattern(name: string): void {
    this.defaultPatterns = this.defaultPatterns.filter(p => p.name !== name);
  }

  async generateReport(result: DLPResult): Promise<string> {
    const report = [];
    
    report.push('=== Data Leak Protection Report ===');
    report.push(`Scan Time: ${new Date().toISOString()}`);
    report.push(`Processing Time: ${result.statistics.processingTime}ms`);
    report.push('');
    
    if (result.clean) {
      report.push('✓ No sensitive data detected');
    } else {
      report.push(`⚠ Found ${result.statistics.totalViolations} potential data leaks`);
      report.push('');
      
      // Summary by severity
      report.push('Violations by Severity:');
      for (const [severity, count] of Object.entries(result.statistics.violationsBySeverity)) {
        if (count > 0) {
          report.push(`  ${severity.toUpperCase()}: ${count}`);
        }
      }
      report.push('');
      
      // Summary by category
      report.push('Violations by Category:');
      for (const [category, count] of Object.entries(result.statistics.violationsByCategory)) {
        report.push(`  ${category}: ${count}`);
      }
      report.push('');
      
      // Detailed violations
      report.push('Detailed Findings:');
      for (const violation of result.violations) {
        report.push(`  ${violation.pattern} (${violation.severity})`);
        report.push(`    Count: ${violation.count}`);
        report.push(`    Samples: ${violation.samples.join(', ')}`);
      }
    }
    
    return report.join('\n');
  }
}

// Export alias for compatibility
export { DataLeakProtectionService as DLPScanner };