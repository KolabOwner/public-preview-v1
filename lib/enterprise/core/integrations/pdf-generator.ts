/**
 * PDF Generator Integration
 * Wraps existing PDF generation functionality with enterprise features
 * Preserves custom font loading and styling capabilities
 */

import { 
  IPDFGenerator, 
  ResumeData
} from '../interfaces';
import { ComponentLogger } from '../../monitoring/logging';
import { ComponentMetricsCollector } from '../../monitoring/metrics';
import { DLPScanner } from '../../security/dlp';
import { CircuitBreaker } from '../../resilience/circuit-breaker';

/**
 * PDF Generator that integrates with existing PDF generation
 * Adds validation, metrics, and resilience while preserving core behavior
 */
export class PDFGeneratorIntegration implements IPDFGenerator {
  private logger = new ComponentLogger('PDFGenerator');
  private metrics = new ComponentMetricsCollector('pdf_generation');
  private dlpScanner = new DLPScanner();
  private circuitBreaker: CircuitBreaker;
  
  constructor(
    private existingGenerateWithRMS: (resumeData: any) => Promise<Blob>,
    private existingGenerateWithCustomFonts: (resumeData: any) => Promise<Blob>,
    private existingGenerateWithVectorFonts: (resumeData: any) => Promise<Blob>,
    private existingGenerateWithStyling: (resumeData: any) => Promise<Blob>
  ) {
    // Configure circuit breaker for PDF generation
    this.circuitBreaker = new CircuitBreaker('pdf_generation', {
      failureThreshold: 5,
      timeout: 60000, // 60 seconds for PDF generation
      resetTimeout: 30000
    });
  }

  /**
   * Generate PDF with RMS metadata embedded
   * This is the main method that combines all steps
   */
  async generateWithRMS(resumeData: ResumeData): Promise<Blob> {
    const startTime = Date.now();
    
    try {
      // Pre-process logging
      await this.logger.info('Starting PDF generation with RMS', {
        title: resumeData.title,
        template: resumeData.template,
        fontSize: resumeData.fontSize,
        fontStyle: resumeData.fontStyle,
        hasRMSData: !!resumeData.rmsRawData
      });
      
      // DLP scan on resume data
      const dlpResult = await this.dlpScanner.scan(
        JSON.stringify(resumeData.parsedData)
      );
      
      if (dlpResult.violations.length > 0) {
        await this.logger.warn('DLP violations found in resume data', {
          violations: dlpResult.violations
        });
        
        // Redact sensitive data if configured
        if (dlpResult.redactedContent) {
          resumeData.parsedData = JSON.parse(dlpResult.redactedContent);
        }
      }
      
      // Generate PDF with circuit breaker protection
      const pdfBlob = await this.circuitBreaker.execute(async () => {
        return await this.existingGenerateWithRMS(resumeData);
      });
      
      // Validate result
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('PDF generation returned empty result');
      }
      
      // Record metrics
      const processingTime = Date.now() - startTime;
      await this.metrics.recordMetric('pdf_generation_duration', processingTime);
      await this.metrics.recordMetric('pdf_generation_success', 1);
      await this.metrics.recordMetric('pdf_size', pdfBlob.size);
      
      await this.logger.info('PDF generation with RMS completed', {
        processingTime,
        pdfSize: pdfBlob.size,
        template: resumeData.template
      });
      
      return pdfBlob;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.metrics.recordMetric('pdf_generation_duration', processingTime);
      await this.metrics.recordMetric('pdf_generation_error', 1);
      
      await this.logger.error('PDF generation with RMS failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        template: resumeData.template
      });
      
      throw error;
    }
  }
  
  /**
   * Generate PDF with custom fonts (Merriweather Light, etc.)
   */
  async generateWithCustomFonts(resumeData: ResumeData): Promise<Blob> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Generating PDF with custom fonts', {
        fontStyle: resumeData.fontStyle
      });
      
      const pdfBlob = await this.circuitBreaker.execute(async () => {
        return await this.existingGenerateWithCustomFonts(resumeData);
      });
      
      this.recordGenerationMetrics(startTime, true, 'custom_fonts', pdfBlob.size);
      return pdfBlob;
      
    } catch (error) {
      this.recordGenerationMetrics(startTime, false, 'custom_fonts', 0);
      
      await this.logger.error('Custom font PDF generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fall back to vector fonts
      await this.logger.info('Falling back to vector fonts');
      return this.generateWithVectorFonts(resumeData);
    }
  }
  
  /**
   * Generate PDF with vector fonts (fallback)
   */
  async generateWithVectorFonts(resumeData: ResumeData): Promise<Blob> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Generating PDF with vector fonts (fallback)');
      
      const pdfBlob = await this.existingGenerateWithVectorFonts(resumeData);
      
      this.recordGenerationMetrics(startTime, true, 'vector_fonts', pdfBlob.size);
      return pdfBlob;
      
    } catch (error) {
      this.recordGenerationMetrics(startTime, false, 'vector_fonts', 0);
      
      await this.logger.error('Vector font PDF generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Generate PDF with HTML rendering
   */
  async generateWithStyling(resumeData: ResumeData): Promise<Blob> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Generating PDF with HTML styling', {
        template: resumeData.template
      });
      
      // Ensure font style is set for HTML rendering
      if (!resumeData.fontStyle) {
        resumeData.fontStyle = 'elegant'; // Default to elegant (Merriweather Light)
      }
      
      const pdfBlob = await this.circuitBreaker.execute(async () => {
        return await this.existingGenerateWithStyling(resumeData);
      });
      
      this.recordGenerationMetrics(startTime, true, 'html_styling', pdfBlob.size);
      return pdfBlob;
      
    } catch (error) {
      this.recordGenerationMetrics(startTime, false, 'html_styling', 0);
      
      await this.logger.error('HTML styling PDF generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Record generation metrics
   */
  private async recordGenerationMetrics(
    startTime: number,
    success: boolean,
    method: string,
    size: number
  ): Promise<void> {
    const duration = Date.now() - startTime;
    await this.metrics.recordMetric(`pdf_${method}_duration`, duration);
    await this.metrics.recordMetric(`pdf_${method}_${success ? 'success' : 'error'}`, 1);
    if (success) {
      await this.metrics.recordMetric(`pdf_${method}_size`, size);
    }
  }
}

/**
 * Factory function to create PDF generator with existing functionality
 */
export function createPDFGenerator(
  existingGenerateWithRMS: (resumeData: any) => Promise<Blob>,
  existingGenerateWithCustomFonts: (resumeData: any) => Promise<Blob>,
  existingGenerateWithVectorFonts: (resumeData: any) => Promise<Blob>,
  existingGenerateWithStyling: (resumeData: any) => Promise<Blob>
): IPDFGenerator {
  return new PDFGeneratorIntegration(
    existingGenerateWithRMS,
    existingGenerateWithCustomFonts,
    existingGenerateWithVectorFonts,
    existingGenerateWithStyling
  );
}