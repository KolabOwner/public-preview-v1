import type { ResumeData } from '../types/pdf-types';
import { DEFAULT_CONFIG, FONT_CONFIGURATIONS } from '../constants/fonts';

/**
 * Font definition interface
 */
export interface FontDefinition {
  family: string;
  size: number;
  weight: number;
  style?: 'normal' | 'bold' | 'italic';
}

/**
 * PDF color configuration
 */
export interface PDFColors {
  text: { r: number; g: number; b: number };
  black: { r: number; g: number; b: number };
  gray: { r: number; g: number; b: number };
  accent: { r: number; g: number; b: number };
}

/**
 * PDF configuration interface
 */
export interface PDFConfiguration {
  colors: PDFColors;
  margins: { top: number; right: number; bottom: number; left: number };
  fonts: {
    name: FontDefinition;
    heading: FontDefinition;
    subheading: FontDefinition;
    body: FontDefinition;
    accent: FontDefinition;
    small: FontDefinition;
  };
  spacing: {
    sectionGap: number;
    itemGap: number;
    lineHeight: number;
  };
}

/**
 * Create PDF configuration based on resume data and style
 */
export function createPDFConfiguration(resumeData: ResumeData): PDFConfiguration {
  const style = resumeData.fontStyle || 'professional';
  const baseConfig = { ...DEFAULT_CONFIG };
  
  // Apply style-specific configuration
  if (FONT_CONFIGURATIONS[style]) {
    Object.assign(baseConfig, FONT_CONFIGURATIONS[style]);
  }
  
  // Apply document settings if provided
  if (resumeData.documentSettings) {
    // Apply margins (convert from inches to points)
    if (resumeData.documentSettings.margins) {
      const margins = resumeData.documentSettings.margins;
      baseConfig.margins = {
        top: margins.top * 72,
        right: margins.right * 72,
        bottom: margins.bottom * 72,
        left: margins.left * 72
      };
    }
    
    // Apply font size adjustments
    if (resumeData.documentSettings.fontSize) {
      const fontScale = resumeData.documentSettings.fontSize / 11; // 11pt is the base
      Object.keys(baseConfig.fonts).forEach(key => {
        const fontKey = key as keyof typeof baseConfig.fonts;
        baseConfig.fonts[fontKey] = {
          ...baseConfig.fonts[fontKey],
          size: baseConfig.fonts[fontKey].size * fontScale
        };
      });
    }
  }
  
  // Handle fontSize preset (small, medium, large)
  if (resumeData.fontSize) {
    applyFontSizePreset(baseConfig, resumeData.fontSize);
  }
  
  return baseConfig;
}

/**
 * Apply font size preset to configuration
 */
function applyFontSizePreset(config: PDFConfiguration, preset: 'small' | 'medium' | 'large'): void {
  const scales = {
    small: 0.85,
    medium: 1.0,
    large: 1.15
  };
  
  const scale = scales[preset];
  
  Object.keys(config.fonts).forEach(key => {
    const fontKey = key as keyof typeof config.fonts;
    config.fonts[fontKey] = {
      ...config.fonts[fontKey],
      size: config.fonts[fontKey].size * scale
    };
  });
}

/**
 * Get paper size dimensions in points
 */
export function getPaperSizeDimensions(paperSize: 'Letter' | 'A4' = 'Letter'): { width: number; height: number } {
  const sizes = {
    Letter: { width: 612, height: 792 }, // 8.5" x 11"
    A4: { width: 595.28, height: 841.89 } // 210mm x 297mm
  };
  
  return sizes[paperSize];
}

/**
 * Get template-specific font scale factors
 */
export function getTemplateFontScales(template: string): Record<string, number> {
  const templateScales: Record<string, Record<string, number>> = {
    'two-column': {
      name: 1.1,
      heading: 1.0,
      subheading: 0.95,
      body: 0.9,
      accent: 0.9,
      small: 0.85
    },
    'modern': {
      name: 1.05,
      heading: 0.95,
      subheading: 0.9,
      body: 0.88,
      accent: 0.88,
      small: 0.82
    },
    'creative': {
      name: 1.15,
      heading: 1.05,
      subheading: 1.0,
      body: 0.92,
      accent: 0.92,
      small: 0.86
    },
    'professional': {
      name: 1.0,
      heading: 1.0,
      subheading: 1.0,
      body: 1.0,
      accent: 1.0,
      small: 1.0
    }
  };
  
  return templateScales[template] || templateScales['professional'];
}

/**
 * Calculate content width based on page width and margins
 */
export function calculateContentWidth(pageWidth: number, margins: { left: number; right: number }): number {
  return pageWidth - margins.left - margins.right;
}

/**
 * Calculate line height based on font size and line height multiplier
 */
export function calculateLineHeight(fontSize: number, lineHeightMultiplier: number): number {
  return fontSize * lineHeightMultiplier;
}