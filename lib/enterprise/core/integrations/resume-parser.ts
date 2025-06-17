/**
 * Resume Parser Integration
 * Wraps existing resume parsing functionality with enterprise features
 * Preserves AI parsing and RMS extraction capabilities
 */

import { 
  IResumeParser, 
  ParseResult,
  RMSMetadata 
} from '../interfaces';
import { validateRMSMetadata, validateRMSCompliance } from '../schemas';
import { ComponentLogger } from '../../monitoring/logging';
import { ComponentMetricsCollector } from '../../monitoring/metrics';
import { SecurityValidator } from '../../security/validators';
import { DLPScanner } from '../../security/dlp';
import { RetryManager } from '../../resilience/retry';

/**
 * Resume Parser that integrates with existing parsing functionality
 * Adds validation, metrics, and security while preserving core behavior
 */
export class ResumeParserIntegration implements IResumeParser {
  private logger = new ComponentLogger('ResumeParser');
  private metrics = new ComponentMetricsCollector('resume_parsing');
  private securityValidator = new SecurityValidator();
  private dlpScanner = new DLPScanner();
  private retryManager: RetryManager;
  
  constructor(
    private existingParseText: (text: string, userId: string, saveToFirebase?: boolean) => Promise<any>,
    private existingParsePDF: (file: File | ArrayBuffer, userId: string) => Promise<any>,
    private existingExtractText: (file: File | ArrayBuffer) => Promise<string>,
    private existingExtractRMS?: (file: File | ArrayBuffer) => Promise<any>
  ) {
    this.retryManager = new RetryManager({
      maxAttempts: 3,
      factor: 2,
      initialDelay: 1000
    });
  }

  /**
   * Parse resume from text
   */
  async parseText(text: string, userId: string, saveToFirebase: boolean = false): Promise<ParseResult> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Starting text resume parsing', {
        userId,
        textLength: text.length,
        saveToFirebase
      });
      
      // DLP scan
      const dlpResult = await this.dlpScanner.scan(text);
      if (dlpResult.violations.length > 0) {
        await this.logger.warn('DLP violations found', {
          violations: dlpResult.violations
        });
        
        if (dlpResult.redactedContent) {
          text = dlpResult.redactedContent;
        }
      }
      
      // Parse with retry logic
      const retryResult = await this.retryManager.execute(async () => {
        return await this.existingParseText(text, userId, saveToFirebase);
      });
      
      // Extract the actual result
      const parseResult = retryResult.success ? retryResult.result : null;
      if (!parseResult) {
        throw new Error('Failed to parse text after retries');
      }
      
      // Validate RMS data if present
      let validationResult;
      if (parseResult.rmsData) {
        const metadataValidation = validateRMSMetadata(parseResult.rmsData);
        if (!metadataValidation.success) {
          await this.logger.warn('RMS metadata validation warnings', {
            errors: metadataValidation.error?.errors
          });
        }
        // Also run compliance validation for the result
        validationResult = validateRMSCompliance(parseResult.rmsData);
        if (!validationResult.valid) {
          await this.logger.warn('RMS compliance warnings', {
            errors: validationResult.errors,
            warnings: validationResult.warnings
          });
        }
      }
      
      // Record metrics
      const parsingTime = Date.now() - startTime;
      await this.metrics.recordMetric('text_parse_duration', parsingTime);
      await this.metrics.recordMetric('text_parse_success', 1);
      
      await this.logger.info('Text resume parsing completed', {
        parsingTime,
        hasRMSData: !!parseResult.rmsData,
        resumeId: parseResult.resumeId
      });
      
      return {
        success: true,
        data: parseResult.data,
        rmsData: parseResult.rmsData,
        resumeId: parseResult.resumeId,
        validationResult
      };
      
    } catch (error) {
      const parsingTime = Date.now() - startTime;
      await this.metrics.recordMetric('text_parse_duration', parsingTime);
      await this.metrics.recordMetric('text_parse_error', 1);
      
      await this.logger.error('Text resume parsing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        parsingTime
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Parse resume from PDF file
   */
  async parsePDF(file: File | ArrayBuffer, userId: string): Promise<ParseResult> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Starting PDF resume parsing', {
        userId,
        fileType: file instanceof File ? 'File' : 'ArrayBuffer',
        size: file instanceof File ? file.size : (file as ArrayBuffer).byteLength
      });
      
      // Security validation
      const buffer = file instanceof File 
        ? await file.arrayBuffer() 
        : file;
        
      const securityResult = await this.securityValidator.validateFile(
        buffer,
        'application/pdf'
      );
      
      if (!securityResult.isValid) {
        throw new Error(`Security validation failed: ${securityResult.errors.join(', ')}`);
      }
      
      // Parse with retry logic
      const retryResult = await this.retryManager.execute(async () => {
        return await this.existingParsePDF(file, userId);
      });
      
      // Extract the actual result
      const parseResult = retryResult.success ? retryResult.result : null;
      if (!parseResult) {
        throw new Error('Failed to parse PDF after retries');
      }
      
      // Try to extract RMS metadata if available
      let rmsData: RMSMetadata | null = null;
      if (this.existingExtractRMS) {
        try {
          rmsData = await this.extractRMSFromPDF(file);
        } catch (error) {
          await this.logger.warn('Failed to extract RMS metadata', {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // Record metrics
      const parsingTime = Date.now() - startTime;
      await this.metrics.recordMetric('pdf_parse_duration', parsingTime);
      await this.metrics.recordMetric('pdf_parse_success', 1);
      
      await this.logger.info('PDF resume parsing completed', {
        parsingTime,
        hasRMSData: !!rmsData,
        resumeId: parseResult.resumeId
      });
      
      return {
        success: true,
        data: parseResult.data,
        rmsData: rmsData || parseResult.rmsData,
        resumeId: parseResult.resumeId
      };
      
    } catch (error) {
      const parsingTime = Date.now() - startTime;
      await this.metrics.recordMetric('pdf_parse_duration', parsingTime);
      await this.metrics.recordMetric('pdf_parse_error', 1);
      
      await this.logger.error('PDF resume parsing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        parsingTime
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Extract text from PDF
   */
  async extractTextFromPDF(file: File | ArrayBuffer): Promise<string> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Extracting text from PDF');
      
      const text = await this.existingExtractText(file);
      
      const extractTime = Date.now() - startTime;
      await this.metrics.recordMetric('pdf_extract_duration', extractTime);
      await this.metrics.recordMetric('pdf_extract_success', 1);
      await this.metrics.recordMetric('pdf_extract_length', text.length);
      
      return text;
      
    } catch (error) {
      const extractTime = Date.now() - startTime;
      await this.metrics.recordMetric('pdf_extract_duration', extractTime);
      await this.metrics.recordMetric('pdf_extract_error', 1);
      
      await this.logger.error('PDF text extraction failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Extract existing RMS metadata from PDF
   * Returns validated metadata or null
   */
  async extractRMSFromPDF(file: File | ArrayBuffer): Promise<RMSMetadata | null> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Extracting RMS metadata from PDF');
      
      if (!this.existingExtractRMS) {
        await this.logger.debug('RMS extraction not available');
        return null;
      }
      
      const metadata = await this.existingExtractRMS(file);
      
      if (!metadata || Object.keys(metadata).length === 0) {
        await this.logger.debug('No RMS metadata found in PDF');
        return null;
      }
      
      // Validate extracted metadata
      const validation = validateRMSMetadata(metadata);
      if (!validation.success) {
        await this.logger.warn('Extracted RMS metadata validation failed', {
          errors: validation.error?.errors
        });
        return null;
      }
      
      const extractTime = Date.now() - startTime;
      await this.metrics.recordMetric('rms_extract_duration', extractTime);
      await this.metrics.recordMetric('rms_extract_success', 1);
      await this.metrics.recordMetric('rms_extract_fields', Object.keys(metadata).length);
      
      await this.logger.info('RMS metadata extracted successfully', {
        fieldCount: Object.keys(metadata).length,
        extractTime
      });
      
      return validation.data!;
      
    } catch (error) {
      const extractTime = Date.now() - startTime;
      await this.metrics.recordMetric('rms_extract_duration', extractTime);
      await this.metrics.recordMetric('rms_extract_error', 1);
      
      await this.logger.error('RMS metadata extraction failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return null;
    }
  }
}

/**
 * Factory function to create resume parser with existing functionality
 */
export function createResumeParser(
  existingParseText: (text: string, userId: string, saveToFirebase?: boolean) => Promise<any>,
  existingParsePDF: (file: File | ArrayBuffer, userId: string) => Promise<any>,
  existingExtractText: (file: File | ArrayBuffer) => Promise<string>,
  existingExtractRMS?: (file: File | ArrayBuffer) => Promise<any>
): IResumeParser {
  return new ResumeParserIntegration(
    existingParseText,
    existingParsePDF,
    existingExtractText,
    existingExtractRMS
  );
}