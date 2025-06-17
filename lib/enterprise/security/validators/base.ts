/**
 * Base classes and interfaces for validators
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

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
}

export abstract class Validator {
  abstract name: string;
  abstract validate(file: File | Buffer | ArrayBuffer, context?: any): Promise<ValidationResult>;
}