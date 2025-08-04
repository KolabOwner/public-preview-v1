/**
 * Main PDF Generator module that coordinates all PDF generation functionality
 */

// Export PDF Builder
export { PDFBuilder } from './pdf-builder';
export { FontManager } from './font-manager';
export { createPDFConfiguration, type PDFConfiguration, type FontDefinition } from './pdf-config';
export * from './section-renderers';

// Re-export types
export type { ResumeData } from '../types/pdf-types';

// Re-export constants
export { FONT_URLS, FONT_FAMILIES, FONT_CONFIGURATIONS, DEFAULT_CONFIG } from '../constants/fonts';

// Re-export utilities
export * from '../utils/text-formatter';
export * from '../utils/date-formatter';