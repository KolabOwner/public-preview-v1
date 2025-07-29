// Import from the new separate files
import { PDFProcessor, FileStatus, ProcessingOptions, ProcessingResult, ParseOptions, ParseResultResponse } from './pdf-processor';
import { PDFGenerator, ResumeData } from './pdf-renderer';

// Re-export types for backward compatibility
export { FileStatus, PDFProcessor } from './pdf-processor';
export type { ProcessingOptions, ProcessingResult, ParseOptions, ParseResultResponse } from './pdf-processor';
export { PDFGenerator } from './pdf-renderer';
export type { ResumeData } from './pdf-renderer';

/**
 * Unified PDF generator that combines the best of custom fonts and vector fonts
 * Automatically handles font loading, fallbacks, and optimal typography
 */
export async function generateResumePDF(resumeData: ResumeData): Promise<Blob> {
  const generator = new PDFGenerator(resumeData);
  return await generator.generate(resumeData);
}

/**
 * Legacy compatibility function
 */
export async function generateResumePDFAsync(resumeData: ResumeData): Promise<Blob> {
  return generateResumePDF(resumeData);
}

// Export enhanced parsing functions for external use
export const parseResumeTextWithGenkit = PDFProcessor.parseResumeTextWithGenkit.bind(PDFProcessor);
export const parsePDFWithGenkit = PDFProcessor.parsePDFWithGenkit.bind(PDFProcessor);

// Export core processor methods for external use
export const processPDF = PDFProcessor.processPDF.bind(PDFProcessor);
export const createResume = PDFProcessor.createResume.bind(PDFProcessor);
export const getResume = PDFProcessor.getResume.bind(PDFProcessor);
export const validateRMSData = PDFProcessor.validateRMSData.bind(PDFProcessor);