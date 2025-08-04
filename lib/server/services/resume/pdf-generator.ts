/**
 * Modular PDF Generator Service
 * 
 * This is the main entry point for all PDF generation functionality.
 * The original monolithic file has been refactored into smaller, focused modules:
 * 
 * - pdf-processor/: Handles PDF parsing, text extraction, and AI processing
 * - pdf-generator/: Handles PDF creation and rendering
 * - constants/: Font definitions, RMS schemas, and other constants
 * - utils/: Text formatting, date formatting utilities
 * - types/: TypeScript interfaces and types
 */

// Export the main classes and functions
export { PDFProcessor, type ProcessingOptions, type ProcessingResult } from './pdf-processor';
export { PDFBuilder } from './pdf-generator/pdf-builder';

// Export types
export type { ResumeData, ParsedData } from './types/pdf-types';
export { FileStatus } from './types/pdf-types';

// Export RMS schema and validation
export { RMSMetadataSchema, type RMSMetadata, RMS_VERSION } from './constants/rms-schema';

// Export font utilities 
export { FontManager } from './pdf-generator/font-manager';

// Export PDF configuration
export { createPDFConfiguration, type PDFConfiguration, type FontDefinition } from './pdf-generator/pdf-config';

// Export utilities
export * from './utils/text-formatter';
export * from './utils/date-formatter';

// Export validation service (use existing one)
export * from './pdf-rms-validator';

// Main resume generation functions (for backward compatibility)
import { PDFBuilder } from './pdf-generator/pdf-builder';
import type { ResumeData } from './types/pdf-types';

/**
 * Generate a resume PDF (async version)
 */
export async function generateResumePDF(resumeData: ResumeData): Promise<Blob> {
  const builder = new PDFBuilder(resumeData);
  return builder.generate(resumeData);
}

/**
 * Generate a resume PDF (sync version)
 */
export function generateResumePDFSync(resumeData: ResumeData): Blob {
  const builder = new PDFBuilder(resumeData);
  return builder.generateSync(resumeData);
}

/**
 * Generate a resume PDF (async version - alias)
 */
export async function generateResumePDFAsync(resumeData: ResumeData): Promise<Blob> {
  return generateResumePDF(resumeData);
}

// Backward compatibility exports for the old API
export { PDFProcessor as PDFGenerator } from './pdf-processor';

// Note: The new modular structure provides cleaner, more maintainable APIs
// All core functionality is available through the PDFProcessor and PDFBuilder classes