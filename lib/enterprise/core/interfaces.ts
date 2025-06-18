/**
 * Core interfaces for enterprise abstraction layer
 * These interfaces define contracts that preserve existing functionality
 * while enabling enterprise enhancements
 * 
 * Specifically preserves:
 * - RMS v2.0.1 metadata schema compliance with Zod validation
 * - ExifTool XMP metadata embedding with typed configuration
 * - Custom font generation (Merriweather Light)
 * - PDF generation pipeline
 */

import { z } from 'zod';
import { 
  RMSMetadataSchema,
  RMSExperienceItemSchema,
  RMSEducationItemSchema,
  RMSSkillItemSchema,
  validateRMSMetadata,
  validateRMSCompliance
} from './schemas';
import { ExifToolConfig, FileStatus, Priority } from './types';

// ============================================================================
// RMS v2.0.1 Metadata Interfaces (with Zod inference)
// ============================================================================

/**
 * RMS Metadata with full type safety from Zod schema
 */
export type RMSMetadata = z.infer<typeof RMSMetadataSchema>;

/**
 * RMS section items with type safety
 */
export type RMSExperienceItem = z.infer<typeof RMSExperienceItemSchema>;
export type RMSEducationItem = z.infer<typeof RMSEducationItemSchema>;
export type RMSSkillItem = z.infer<typeof RMSSkillItemSchema>;

/**
 * Parsed RMS data in structured format
 */
export interface ParsedRMSData {
  contact: {
    fullName?: string;
    givenNames?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    behance?: string;
    dribble?: string;
    website?: string;
    country?: string;
    countryCode?: string;
    city?: string;
    state?: string;
  };
  summary?: string;
  experiences: RMSExperienceItem[];
  education: RMSEducationItem[];
  skills: RMSSkillItem[];
  projects: any[];
  involvements: any[];
  certifications: any[];
  coursework: any[];
  publications: any[];
  awards: any[];
  references: any[];
}

/**
 * Interface for RMS metadata processing
 * Maintains v2.0.1 compliance with validation
 */
export interface IRMSProcessor {
  /**
   * Format resume data to RMS v2.0.1 metadata format
   */
  formatToRMS(resumeData: any): RMSMetadata;
  
  /**
   * Convert indexed RMS fields to structured data
   */
  parseRMSToStructured(metadata: RMSMetadata): ParsedRMSData;
  
  /**
   * Validate RMS metadata compliance with v2.0.1
   * Uses Zod schemas for validation
   */
  validateRMSCompliance(metadata: unknown): ReturnType<typeof validateRMSCompliance>;
  
  /**
   * Validate RMS metadata with Zod
   */
  validateRMSMetadata(data: unknown): ReturnType<typeof validateRMSMetadata>;
  
  /**
   * Get RMS field for a specific section and index
   */
  getRMSField(section: string, index: number, field: string): string;
  
  /**
   * Generate all fields for ExifTool based on resume data
   */
  generateExifToolFields(resumeData: any): Record<string, string | number>;
}

// ============================================================================
// ExifTool Integration Interfaces
// ============================================================================

/**
 * Interface for ExifTool operations
 * Preserves local ExifTool.exe integration with XMP metadata
 */
export interface IExifToolService {
  /**
   * Get ExifTool configuration
   */
  getConfig(): ExifToolConfig;
  
  /**
   * Check if ExifTool is available at configured path
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Write RMS metadata to PDF using ExifTool
   * Uses XMP-rms namespace for all fields
   */
  writeMetadata(pdfBlob: Blob, metadata: RMSMetadata): Promise<Blob>;
  
  /**
   * Read XMP metadata from PDF
   * Extracts all rms_* fields
   */
  readMetadata(pdfBlob: Blob): Promise<RMSMetadata>;
  
  /**
   * Get ExifTool version
   */
  getVersion(): Promise<string>;
  
  /**
   * Validate metadata against ExifTool configuration
   */
  validateFieldsAgainstConfig(metadata: RMSMetadata): {
    valid: boolean;
    unsupportedFields: string[];
  };
}

// ============================================================================
// PDF Generation Interfaces
// ============================================================================

/**
 * Interface for PDF generation functionality
 * Preserves existing custom font and styling capabilities
 */
export interface IPDFGenerator {
  /**
   * Generate PDF with RMS metadata embedded
   * This is the main method that combines all steps
   */
  generateWithRMS(resumeData: ResumeData): Promise<Blob>;
  
  /**
   * Generate PDF with custom fonts (Merriweather Light, etc.)
   */
  generateWithCustomFonts(resumeData: ResumeData): Promise<Blob>;
  
  /**
   * Generate PDF with vector fonts (fallback)
   */
  generateWithVectorFonts(resumeData: ResumeData): Promise<Blob>;
  
  /**
   * Generate PDF with HTML rendering
   */
  generateWithStyling(resumeData: ResumeData): Promise<Blob>;
}

/**
 * Resume data for PDF generation
 */
export interface ResumeData {
  title: string;
  template?: string;
  fontSize?: 'small' | 'medium' | 'large';
  fontStyle?: 'elegant' | 'modern' | 'classic' | 'professional';
  parsedData: any; // The actual resume content
  rmsRawData?: any; // Pre-formatted RMS data if available
}

// ============================================================================
// Font Management Interfaces
// ============================================================================

/**
 * Interface for custom font loading
 * Preserves Merriweather Light and other Google Fonts
 */
export interface IFontLoader {
  /**
   * Load font from Google Fonts CDN
   */
  loadFont(fontFamily: string, weight: string): Promise<ArrayBuffer>;
  
  /**
   * Get font URLs for a specific font family
   */
  getFontUrls(fontFamily: 'merriweather' | 'merriweatherSans' | 'openSans'): FontUrls;
  
  /**
   * Get font configuration for a style preset
   */
  getFontConfig(style: FontStyle): FontConfiguration;
  
  /**
   * Add custom fonts to jsPDF instance
   */
  addCustomFonts(doc: any): Promise<void>;
  
  /**
   * Check if font is cached
   */
  isFontCached(fontUrl: string): boolean;
}

/**
 * Font URLs from Google Fonts CDN
 */
export interface FontUrls {
  light?: string;
  lightItalic?: string;
  regular?: string;
  italic?: string;
  bold?: string;
  boldItalic?: string;
  black?: string;
  blackItalic?: string;
  extrabold?: string;
}

/**
 * Font configuration for a style
 */
export interface FontConfiguration {
  name: string;
  family: string;
  weights: {
    [weight: number]: {
      normal?: string;
      italic?: string;
    };
  };
}

export type FontStyle = 'elegant' | 'modern' | 'classic' | 'professional';

// ============================================================================
// Resume Parsing Interfaces
// ============================================================================

/**
 * Interface for resume parsing functionality
 */
export interface IResumeParser {
  /**
   * Parse resume from text
   */
  parseText(text: string, userId: string, saveToFirebase?: boolean): Promise<ParseResult>;
  
  /**
   * Parse resume from PDF file
   */
  parsePDF(file: File | ArrayBuffer, userId: string): Promise<ParseResult>;
  
  /**
   * Extract text from PDF
   */
  extractTextFromPDF(file: File | ArrayBuffer): Promise<string>;
  
  /**
   * Extract existing RMS metadata from PDF
   * Returns validated metadata or null
   */
  extractRMSFromPDF(file: File | ArrayBuffer): Promise<RMSMetadata | null>;
}

/**
 * Parse result
 */
export interface ParseResult {
  success: boolean;
  data?: any;
  rmsData?: RMSMetadata;
  error?: string;
  resumeId?: string;
  validationResult?: ReturnType<typeof validateRMSCompliance>;
}

// ============================================================================
// File Processing Interfaces
// ============================================================================

/**
 * Interface for PDF processing pipeline
 */
export interface IPDFProcessor {
  /**
   * Create resume document in Firestore
   */
  createResume(data: CreateResumeData): Promise<string>;
  
  /**
   * Process PDF file (background job)
   * This includes parsing, RMS formatting, and metadata embedding
   */
  processPDF(file: File, resumeId: string, metadata: any): Promise<void>;
  
  /**
   * Get resume by ID
   */
  getResume(resumeId: string): Promise<Resume | null>;
  
  /**
   * Update resume status
   */
  updateStatus(resumeId: string, status: FileStatus): Promise<void>;
}

export interface CreateResumeData {
  userId: string;
  title: string;
  initialStatus: FileStatus;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  status: FileStatus;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
  metadata?: RMSMetadata;
}

// ============================================================================
// RMS Processing Interfaces
// ============================================================================

/**
 * Interface for RMS processing results
 */
export interface RMSProcessingResult {
  status: 'success' | 'already_compliant' | 'error';
  inputPath: string;
  outputPath?: string;
  metadata?: RMSMetadata;
  stats: {
    processingTime: number;
    sectionsFound: number;
    fieldsGenerated: number;
    fileSize: number;
  };
  verification?: {
    isValid: boolean;
    hasProducer: boolean;
    hasRMS: boolean;
    hasSchema: boolean;
    fieldCount: number;
  };
  error?: string;
  stack?: string;
}

/**
 * Interface for batch RMS processing
 */
export interface RMSBatchResult {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  files: Array<{
    file: string;
    status: 'success' | 'already_compliant' | 'error';
    metadata?: RMSMetadata;
    error?: string;
  }>;
}

// ============================================================================
// Enterprise Enhancement Interfaces
// ============================================================================

/**
 * Interface for enterprise processing options
 */
export interface IEnterpriseOptions {
  // Security
  enableValidation?: boolean;
  enableDLP?: boolean;
  enableEncryption?: boolean;
  
  // Monitoring
  enableMetrics?: boolean;
  enableLogging?: boolean;
  enableTracing?: boolean;
  
  // Resilience
  enableCircuitBreaker?: boolean;
  enableRetry?: boolean;
  enableRecovery?: boolean;
  
  // Infrastructure
  enableQueue?: boolean;
  enableRealTimeUpdates?: boolean;
  
  // Compliance
  enableAuditLog?: boolean;
  enablePrivacy?: boolean;
  
  // Processing
  priority?: Priority;
  userId: string;
}

/**
 * Interface for enterprise wrapper
 * Enhances existing functionality without modification
 */
export interface IEnterpriseWrapper {
  /**
   * Wrap PDF generation with enterprise features
   * Preserves: Custom fonts, RMS metadata, ExifTool integration
   */
  generatePDFWithEnterprise(
    resumeData: ResumeData,
    options: IEnterpriseOptions
  ): Promise<Blob>;
  
  /**
   * Wrap resume parsing with enterprise features
   */
  parseResumeWithEnterprise(
    file: File | string,
    options: IEnterpriseOptions
  ): Promise<ParseResult>;
  
  /**
   * Wrap RMS metadata writing with enterprise features
   * Preserves: ExifTool.exe execution, XMP embedding
   */
  writeRMSWithEnterprise(
    pdfBlob: Blob,
    metadata: RMSMetadata,
    options: IEnterpriseOptions
  ): Promise<Blob>;
  
  /**
   * Extract and validate RMS metadata with enterprise features
   * Includes Zod validation
   */
  extractRMSWithEnterprise(
    pdfBlob: Blob,
    options: IEnterpriseOptions
  ): Promise<RMSMetadata | null>;
}