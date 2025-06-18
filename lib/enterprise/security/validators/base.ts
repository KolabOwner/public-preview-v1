/**
 * Base types and interfaces for the validation system
 */

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

