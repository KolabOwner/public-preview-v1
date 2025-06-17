/**
 * ExifTool Service Integration
 * Wraps existing ExifTool functionality with enterprise features
 * Preserves local ExifTool.exe execution and XMP metadata embedding
 */

import { 
  IExifToolService, 
  RMSMetadata,
  ExifToolConfig
} from '../interfaces';
import { validateRMSMetadata } from '../schemas';
import { ComponentLogger } from '../../monitoring/logging';
import { ComponentMetricsCollector } from '../../monitoring/metrics';
import { SecurityValidator } from '../../security/validators';

/**
 * ExifTool service that integrates with existing write-rms API
 * Adds validation, metrics, and logging while preserving core behavior
 */
export class ExifToolServiceIntegration implements IExifToolService {
  private logger = new ComponentLogger('ExifToolService');
  private metrics = new ComponentMetricsCollector('exiftool_operations');
  private securityValidator = new SecurityValidator();
  
  constructor(
    private config: ExifToolConfig,
    private existingWriteRMS: (pdfBlob: Blob, metadata: any) => Promise<Blob>,
    private existingReadRMS?: (pdfBlob: Blob) => Promise<any>
  ) {}

  /**
   * Get ExifTool configuration
   */
  getConfig(): ExifToolConfig {
    return this.config;
  }
  
  /**
   * Check if ExifTool is available at configured path
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Check if we can execute ExifTool
      const response = await fetch('/api/check-exiftool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: this.config.exifToolPath })
      });
      
      const result = await response.json();
      
      await this.logger.info('ExifTool availability check', {
        available: result.available,
        path: this.config.exifToolPath
      });
      
      return result.available;
      
    } catch (error) {
      await this.logger.error('ExifTool availability check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
  
  /**
   * Write RMS metadata to PDF using ExifTool
   * Wraps existing write-rms API with enterprise features
   */
  async writeMetadata(pdfBlob: Blob, metadata: RMSMetadata): Promise<Blob> {
    const startTime = Date.now();
    
    try {
      // Pre-process validation
      await this.logger.info('Starting ExifTool metadata write', {
        pdfSize: pdfBlob.size,
        metadataFields: Object.keys(metadata).length
      });
      
      // Validate metadata
      const validation = validateRMSMetadata(metadata);
      if (!validation.success) {
        await this.logger.warn('Metadata validation warnings', {
          errors: validation.error?.errors
        });
      }
      
      // Security check on PDF
      const securityResult = await this.securityValidator.validateFile(
        await pdfBlob.arrayBuffer(),
        'application/pdf'
      );
      
      if (!securityResult.isValid) {
        throw new Error(`Security validation failed: ${securityResult.errors.join(', ')}`);
      }
      
      // Call existing write-rms functionality
      const resultBlob = await this.existingWriteRMS(pdfBlob, metadata);
      
      // Verify the result
      if (!resultBlob || resultBlob.size === 0) {
        throw new Error('ExifTool returned empty result');
      }
      
      // Record metrics
      const processingTime = Date.now() - startTime;
      await this.metrics.recordMetric('exiftool_write_duration', processingTime);
      await this.metrics.recordMetric('exiftool_write_success', 1);
      await this.metrics.recordMetric('exiftool_output_size', resultBlob.size);
      
      await this.logger.info('ExifTool metadata write completed', {
        processingTime,
        inputSize: pdfBlob.size,
        outputSize: resultBlob.size,
        sizeIncrease: resultBlob.size - pdfBlob.size
      });
      
      return resultBlob;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.metrics.recordMetric('exiftool_write_duration', processingTime);
      await this.metrics.recordMetric('exiftool_write_error', 1);
      
      await this.logger.error('ExifTool metadata write failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });
      
      throw error;
    }
  }
  
  /**
   * Read XMP metadata from PDF
   * Extracts all rms_* fields
   */
  async readMetadata(pdfBlob: Blob): Promise<RMSMetadata> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Starting ExifTool metadata read', {
        pdfSize: pdfBlob.size
      });
      
      // Use existing read functionality if available
      if (this.existingReadRMS) {
        const metadata = await this.existingReadRMS(pdfBlob);
        
        // Filter to only RMS fields
        const rmsMetadata: RMSMetadata = { Producer: 'rms_v2.0.1' };
        for (const [key, value] of Object.entries(metadata)) {
          if (key.startsWith('rms_') || key === 'Producer') {
            rmsMetadata[key as keyof RMSMetadata] = value as any;
          }
        }
        
        this.recordReadMetrics(startTime, true, Object.keys(rmsMetadata).length);
        return rmsMetadata;
      }
      
      // Otherwise call ExifTool API directly
      const formData = new FormData();
      formData.append('pdf', pdfBlob);
      
      const response = await fetch('/api/read-rms', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`ExifTool read failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      const metadata = result.metadata || {};
      
      // Ensure we have RMS metadata
      const rmsMetadata: RMSMetadata = { Producer: metadata.Producer || 'rms_v2.0.1' };
      for (const [key, value] of Object.entries(metadata)) {
        if (key.startsWith('rms_') || key === 'Producer') {
          rmsMetadata[key as keyof RMSMetadata] = value as any;
        }
      }
      
      this.recordReadMetrics(startTime, true, Object.keys(rmsMetadata).length);
      return rmsMetadata;
      
    } catch (error) {
      this.recordReadMetrics(startTime, false, 0);
      
      await this.logger.error('ExifTool metadata read failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Get ExifTool version
   */
  async getVersion(): Promise<string> {
    try {
      const response = await fetch('/api/exiftool-version', {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get ExifTool version');
      }
      
      const result = await response.json();
      return result.version || 'Unknown';
      
    } catch (error) {
      await this.logger.error('Failed to get ExifTool version', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 'Unknown';
    }
  }
  
  /**
   * Validate metadata against ExifTool configuration
   */
  validateFieldsAgainstConfig(metadata: RMSMetadata): {
    valid: boolean;
    unsupportedFields: string[];
  } {
    // List of known RMS fields from ExifTool config
    const supportedFields = new Set([
      'Producer',
      'rms_schema_detail',
      'rms_contact_fullName',
      'rms_contact_givenNames',
      'rms_contact_lastName',
      'rms_contact_email',
      'rms_contact_phone',
      'rms_contact_linkedin',
      'rms_contact_github',
      'rms_contact_behance',
      'rms_contact_dribble',
      'rms_contact_website',
      'rms_contact_country',
      'rms_contact_countryCode',
      'rms_contact_city',
      'rms_contact_state',
      'rms_summary'
    ]);
    
    // Add all indexed field patterns
    const sections = [
      'experience', 'education', 'certification', 'coursework',
      'involvement', 'project', 'skill', 'publication', 'award', 'reference'
    ];
    
    for (const section of sections) {
      supportedFields.add(`rms_${section}_count`);
      
      // Add patterns for indexed fields (0-15)
      for (let i = 0; i < 16; i++) {
        // We can't enumerate all possible fields, so we'll check patterns
        supportedFields.add(`rms_${section}_${i}_*`);
      }
    }
    
    const unsupportedFields: string[] = [];
    
    for (const field of Object.keys(metadata)) {
      // Check if field is supported
      if (!supportedFields.has(field)) {
        // Check if it matches an indexed pattern
        const isIndexedField = sections.some(section => {
          const pattern = new RegExp(`^rms_${section}_\\d+_\\w+$`);
          return pattern.test(field);
        });
        
        if (!isIndexedField) {
          unsupportedFields.push(field);
        }
      }
    }
    
    return {
      valid: unsupportedFields.length === 0,
      unsupportedFields
    };
  }
  
  /**
   * Record read metrics
   */
  private async recordReadMetrics(
    startTime: number, 
    success: boolean, 
    fieldCount: number
  ): Promise<void> {
    const duration = Date.now() - startTime;
    await this.metrics.recordMetric('exiftool_read_duration', duration);
    await this.metrics.recordMetric(success ? 'exiftool_read_success' : 'exiftool_read_error', 1);
    if (success) {
      await this.metrics.recordMetric('exiftool_read_fields', fieldCount);
    }
  }
}

/**
 * Factory function to create ExifTool service with existing functionality
 */
export function createExifToolService(
  config: ExifToolConfig,
  existingWriteRMS: (pdfBlob: Blob, metadata: any) => Promise<Blob>,
  existingReadRMS?: (pdfBlob: Blob) => Promise<any>
): IExifToolService {
  return new ExifToolServiceIntegration(config, existingWriteRMS, existingReadRMS);
}