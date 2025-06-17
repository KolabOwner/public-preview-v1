/**
 * RMS Processor Integration
 * Wraps existing RMS formatting functionality with enterprise features
 * Preserves v2.0.1 compliance and ExifTool integration
 */

import { 
  IRMSProcessor, 
  RMSMetadata, 
  ParsedRMSData
} from '../interfaces';
import { 
  validateRMSMetadata, 
  validateRMSCompliance 
} from '../schemas';
import { 
  getRMSFieldName, 
  getRMSCountFieldName,
  parseRMSFieldName,
  RMS_LIMITS 
} from '../types';
import { ComponentLogger } from '../../monitoring/logging';
import { ComponentMetricsCollector } from '../../monitoring/metrics';

/**
 * RMS Processor that integrates with existing formatToRMS functionality
 * Adds validation, metrics, and logging while preserving core behavior
 */
export class RMSProcessorIntegration implements IRMSProcessor {
  private logger = new ComponentLogger('RMSProcessor');
  private metrics = new ComponentMetricsCollector('rms_processing');
  
  constructor(
    private existingFormatter: (resumeData: any) => any,
    private existingParser?: (metadata: any) => any
  ) {}

  /**
   * Format resume data to RMS v2.0.1 metadata format
   * Wraps existing formatter with enterprise features
   */
  async formatToRMS(resumeData: any): Promise<RMSMetadata> {
    const startTime = Date.now();
    
    try {
      // Pre-process logging
      await this.logger.info('Starting RMS formatting', {
        hasData: !!resumeData,
        sections: Object.keys(resumeData || {})
      });
      
      // Call existing formatter
      const metadata = await this.existingFormatter(resumeData);
      
      // Ensure Producer field
      if (!metadata.Producer) {
        metadata.Producer = 'rms_v2.0.1';
      }
      
      // Validate result
      const validation = validateRMSMetadata(metadata);
      if (!validation.success) {
        await this.logger.warn('RMS validation warnings', {
          errors: validation.error?.errors
        });
      }
      
      // Check compliance
      const compliance = validateRMSCompliance(metadata);
      if (!compliance.valid) {
        await this.logger.error('RMS compliance errors', {
          errors: compliance.errors,
          warnings: compliance.warnings
        });
      }
      
      // Record metrics
      const processingTime = Date.now() - startTime;
      await this.metrics.recordMetric('rms_format_duration', processingTime);
      await this.metrics.recordMetric('rms_format_success', 1);
      
      // Count fields
      const fieldCount = Object.keys(metadata).length;
      await this.metrics.recordMetric('rms_field_count', fieldCount);
      
      await this.logger.info('RMS formatting completed', {
        processingTime,
        fieldCount,
        compliant: compliance.valid
      });
      
      return metadata;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.metrics.recordMetric('rms_format_duration', processingTime);
      await this.metrics.recordMetric('rms_format_error', 1);
      
      await this.logger.error('RMS formatting failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });
      
      throw error;
    }
  }
  
  /**
   * Convert indexed RMS fields to structured data
   */
  parseRMSToStructured(metadata: RMSMetadata): ParsedRMSData {
    const startTime = Date.now();
    
    try {
      // Use existing parser if available
      if (this.existingParser) {
        const result = this.existingParser(metadata);
        this.recordParsingMetrics(startTime, true);
        return result;
      }
      
      // Otherwise implement parsing logic
      const parsed: ParsedRMSData = {
        contact: {},
        experiences: [],
        education: [],
        skills: [],
        projects: [],
        involvements: [],
        certifications: [],
        coursework: [],
        publications: [],
        awards: [],
        references: []
      };
      
      // Parse contact fields
      const contactFields = [
        'fullName', 'givenNames', 'lastName', 'email', 'phone',
        'linkedin', 'github', 'behance', 'dribble', 'website',
        'country', 'countryCode', 'city', 'state'
      ];
      
      for (const field of contactFields) {
        const key = `rms_contact_${field}` as keyof RMSMetadata;
        if (metadata[key]) {
          parsed.contact[field as keyof typeof parsed.contact] = metadata[key] as string;
        }
      }
      
      // Parse summary
      if (metadata.rms_summary) {
        parsed.summary = metadata.rms_summary;
      }
      
      // Parse indexed sections
      for (const section of RMS_LIMITS.SECTIONS) {
        const count = parseInt(metadata[getRMSCountFieldName(section)] as string || '0', 10);
        const items = [];
        
        for (let i = 0; i < count; i++) {
          const item: any = {};
          
          // Extract all fields for this index
          for (const [key, value] of Object.entries(metadata)) {
            const parsed = parseRMSFieldName(key);
            if (parsed && parsed.section === section && parsed.index === i && parsed.field) {
              item[parsed.field] = value;
            }
          }
          
          if (Object.keys(item).length > 0) {
            items.push(item);
          }
        }
        
        // Map to correct property name
        const sectionMap: Record<string, keyof ParsedRMSData> = {
          experience: 'experiences',
          education: 'education',
          skill: 'skills',
          project: 'projects',
          involvement: 'involvements',
          certification: 'certifications',
          coursework: 'coursework',
          publication: 'publications',
          award: 'awards',
          reference: 'references'
        };
        
        const targetSection = sectionMap[section];
        if (targetSection && items.length > 0) {
          (parsed[targetSection] as any[]) = items;
        }
      }
      
      this.recordParsingMetrics(startTime, true);
      return parsed;
      
    } catch (error) {
      this.recordParsingMetrics(startTime, false);
      throw error;
    }
  }
  
  /**
   * Validate RMS metadata compliance with v2.0.1
   */
  validateRMSCompliance(metadata: unknown): ReturnType<typeof validateRMSCompliance> {
    return validateRMSCompliance(metadata);
  }
  
  /**
   * Validate RMS metadata with Zod
   */
  validateRMSMetadata(data: unknown): ReturnType<typeof validateRMSMetadata> {
    return validateRMSMetadata(data);
  }
  
  /**
   * Get RMS field for a specific section and index
   */
  getRMSField(section: string, index: number, field: string): string {
    return getRMSFieldName(section, index, field);
  }
  
  /**
   * Generate all fields for ExifTool based on resume data
   */
  generateExifToolFields(resumeData: any): Record<string, string | number> {
    // Note: This is synchronous in the interface, so we'll use the existing formatter directly
    const metadata = this.existingFormatter(resumeData);
    const fields: Record<string, string | number> = {};
    
    // Convert all metadata fields to ExifTool format
    for (const [key, value] of Object.entries(metadata)) {
      if (value !== undefined && value !== null && value !== '') {
        // ExifTool expects string or number values
        if (typeof value === 'boolean') {
          fields[key] = value.toString();
        } else if (typeof value === 'string' || typeof value === 'number') {
          fields[key] = value;
        } else {
          // Convert complex types to string
          fields[key] = JSON.stringify(value);
        }
      }
    }
    
    return fields;
  }
  
  /**
   * Record parsing metrics
   */
  private async recordParsingMetrics(startTime: number, success: boolean): Promise<void> {
    const duration = Date.now() - startTime;
    await this.metrics.recordMetric('rms_parse_duration', duration);
    await this.metrics.recordMetric(success ? 'rms_parse_success' : 'rms_parse_error', 1);
  }
}

/**
 * Factory function to create RMS processor with existing formatter
 */
export function createRMSProcessor(
  existingFormatter: (resumeData: any) => any,
  existingParser?: (metadata: any) => any
): IRMSProcessor {
  return new RMSProcessorIntegration(existingFormatter, existingParser);
}