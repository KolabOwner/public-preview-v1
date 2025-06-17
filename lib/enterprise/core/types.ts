/**
 * Core type definitions for the enterprise abstraction layer
 * Includes TypeScript types that match ExifTool configuration
 */

// ============================================================================
// ExifTool Configuration Types
// ============================================================================

/**
 * ExifTool field configuration
 * Matches the Perl configuration structure
 */
export interface ExifToolField {
  Writable: 'string' | 'integer';
}

/**
 * ExifTool namespace configuration
 */
export interface ExifToolNamespace {
  GROUPS: {
    0: 'XMP';
    1: 'XMP-rms';
    2: 'Image';
  };
  NAMESPACE: {
    rms: 'https://github.com/rezi-io/resume-standard';
  };
  WRITABLE: 'string';
  [fieldName: string]: any;
}

/**
 * ExifTool configuration paths
 */
export interface ExifToolConfig {
  exifToolPath: string; // e.g., "C:\\Users\\ashto\\OneDrive\\ExifTool\\exiftool.exe"
  configPath: string;   // e.g., "./config/exiftool/rms-config.pl"
}

// ============================================================================
// RMS Field Limits
// ============================================================================

/**
 * RMS v2.0.1 field limits
 * Each section supports 0-15 items (16 total)
 */
export const RMS_LIMITS = {
  MAX_ITEMS_PER_SECTION: 16, // 0-15
  SECTIONS: [
    'experience',
    'education',
    'certification',
    'coursework',
    'involvement',
    'project',
    'skill',
    'publication',
    'award',
    'reference'
  ]
} as const;

// ============================================================================
// Date Format Types
// ============================================================================

/**
 * Supported date formats in RMS
 */
export type RMSDateFormat = 
  | 'YYYY'           // e.g., "2021"
  | 'MMMM YYYY'      // e.g., "June 2021"
  | 'MM/DD/YYYY'     // e.g., "06/01/2021"
  | 'DD/MM/YYYY';    // e.g., "01/06/2021"

/**
 * Date field structure
 */
export interface RMSDateField {
  date: string;           // Human-readable date
  dateTS?: number;        // Unix timestamp in milliseconds
  dateFormat?: RMSDateFormat;
}

// ============================================================================
// Field Name Generators
// ============================================================================

/**
 * Generate RMS field name following the pattern: rms_{section}_{index}_{field}
 */
export function getRMSFieldName(section: string, index: number, field: string): string {
  return `rms_${section}_${index}_${field}`;
}

/**
 * Generate count field name: rms_{section}_count
 */
export function getRMSCountFieldName(section: string): string {
  return `rms_${section}_count`;
}

/**
 * Parse RMS field name into components
 */
export function parseRMSFieldName(fieldName: string): {
  section?: string;
  index?: number;
  field?: string;
  isCount?: boolean;
} | null {
  // Match count fields: rms_experience_count
  const countMatch = fieldName.match(/^rms_([a-z]+)_count$/);
  if (countMatch) {
    return {
      section: countMatch[1],
      isCount: true
    };
  }

  // Match indexed fields: rms_experience_0_company
  const indexedMatch = fieldName.match(/^rms_([a-z]+)_(\d+)_(.+)$/);
  if (indexedMatch) {
    return {
      section: indexedMatch[1],
      index: parseInt(indexedMatch[2], 10),
      field: indexedMatch[3]
    };
  }

  // Match non-indexed fields: rms_contact_email
  const simpleMatch = fieldName.match(/^rms_([a-z]+)_(.+)$/);
  if (simpleMatch) {
    return {
      section: simpleMatch[1],
      field: simpleMatch[2]
    };
  }

  return null;
}

// ============================================================================
// Common Types
// ============================================================================

/**
 * Processing result with metrics
 */
export interface ProcessingResult {
  success: boolean;
  data?: any;
  metrics?: ProcessingMetrics;
  errors?: ProcessingError[];
  warnings?: ProcessingWarning[];
}

/**
 * Processing metrics
 */
export interface ProcessingMetrics {
  totalTime: number;
  validationTime?: number;
  parsingTime?: number;
  generationTime?: number;
  metadataTime?: number;
  [key: string]: number | undefined;
}

/**
 * Processing error
 */
export interface ProcessingError {
  code: string;
  message: string;
  field?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Processing warning
 */
export interface ProcessingWarning {
  code: string;
  message: string;
  field?: string;
}

/**
 * File processing status
 */
export enum FileStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  ERROR = 'error'
}

/**
 * Priority levels for job processing
 */
export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}