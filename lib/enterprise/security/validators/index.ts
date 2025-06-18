/**
 * Enterprise Security Validation Pipeline
 * Implements multi-layer validation for file uploads with defense-in-depth approach
 */

import { z } from 'zod';

// Define types directly to avoid import issues
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export abstract class Validator {
  abstract name: string;
  abstract validate(data: any, context?: Record<string, any>): Promise<ValidationResult>;
}

/**
 * Orchestrates multiple validators in a pipeline
 */
export class ValidationPipeline {
  private validators: Validator[] = [];

  addValidator(validator: Validator): ValidationPipeline {
    this.validators.push(validator);
    return this;
  }

  async validate(file: File | Buffer | ArrayBuffer, context?: any): Promise<ValidationResult> {
    const results: ValidationResult[] = [];
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const metadata: Record<string, any> = {};

    for (const validator of this.validators) {
      try {
        console.log(`Running ${validator.name} validation...`);
        const result = await validator.validate(file, context);
        results.push(result);

        // Aggregate errors and warnings
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        
        // Merge metadata
        if (result.metadata) {
          Object.assign(metadata, result.metadata);
        }

        // Stop on critical errors
        if (result.severity === 'critical' && !result.valid) {
          console.error(`Critical validation failure in ${validator.name}`);
          break;
        }
      } catch (error) {
        console.error(`Validator ${validator.name} failed:`, error);
        errors.push({
          code: 'VALIDATOR_ERROR',
          message: `${validator.name} validation failed: ${error.message}`,
          severity: 'critical'
        });
        break; // Fail closed on validator errors
      }
    }

    const valid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;
    const highestSeverity = this.getHighestSeverity(errors);

    return {
      valid,
      errors,
      warnings,
      metadata,
      severity: highestSeverity
    };
  }

  private getHighestSeverity(errors: ValidationError[]): ValidationResult['severity'] {
    if (errors.some(e => e.severity === 'critical')) return 'critical';
    if (errors.some(e => e.severity === 'high')) return 'high';
    if (errors.some(e => e.severity === 'medium')) return 'medium';
    if (errors.some(e => e.severity === 'low')) return 'low';
    return 'low';
  }
}

// Export specific validators - commented out due to TypeScript compilation errors
// TODO: Fix TypeScript compilation errors in individual validator files
// export { FileTypeValidator } from './file-type-validator';
// export { SizeValidator } from './size-validator';
// export { ContentValidator } from './content-validator';
// export { MalwareScanner } from './malware-scanner';
// export { SecurityValidator } from './security-validator';