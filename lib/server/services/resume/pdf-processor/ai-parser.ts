import { z } from 'zod';
import { extractResumeData } from '@/lib/ai/flows/resume/generate';
import type { ExtractResumeDataOutput } from '@/lib/ai/flows/resume/generate';
import { RMSMetadataSchema } from '../constants/rms-schema';

/**
 * AI-powered resume parsing utilities
 */
export class AIParser {
  /**
   * Parse resume using Gemini multimodal PDF capabilities
   */
  public static async parseWithGeminiMultimodal(
    pdfBuffer: Buffer,
    userId: string,
    validateRMS?: boolean,
    useEnhancedFormatting = true
  ): Promise<{
    rmsData: any;
    validationErrors?: z.ZodError;
  }> {
    try {
      console.log('🚀 Using Gemini multimodal PDF parsing capabilities');
      
      // Convert PDF buffer to data URI for Gemini
      const resumeDataUri = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
      
      // Use Gemini's multimodal PDF extraction
      const extractionResult = await extractResumeData({ resumeDataUri, fastMode: true });
      
      if (!extractionResult || Object.keys(extractionResult).length === 0) {
        throw new Error('Failed to extract resume data using Gemini multimodal PDF parsing');
      }
      
      console.log('✅ Gemini multimodal extraction completed successfully');
      
      // Convert to RMS format using enhanced or basic method
      let rmsData: Record<string, string | number | boolean>;
      
      if (useEnhancedFormatting) {
        console.log('[PDF] Using enhanced RMS formatting');
        const parsedData = this.convertExtractToParsedData(extractionResult);
        rmsData = this.formatToRmsEnhanced(parsedData);
      } else {
        console.log('[PDF] Using basic RMS formatting');
        rmsData = this.formatToRms(extractionResult);
      }
      
      // Validate RMS data if requested
      let validationErrors: z.ZodError | undefined = undefined;
      
      if (validateRMS) {
        const validation = this.validateRMSData(rmsData);
        if (!validation.success) {
          validationErrors = validation.error;
          console.warn('RMS validation errors:', validationErrors?.errors);
        }
      }
      
      return { rmsData, validationErrors };
    } catch (error: any) {
      console.error('Gemini multimodal parsing error:', error);
      throw new Error(`Failed to parse resume with Gemini multimodal: ${error.message}`);
    }
  }

  /**
   * Validate RMS data against schema
   */
  public static validateRMSData(data: any): {
    success: boolean;
    data?: any;
    error?: z.ZodError
  } {
    try {
      const validated = RMSMetadataSchema.parse(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error };
      }
      throw error;
    }
  }

  /**
   * Convert extracted data to parsed data format
   */
  private static convertExtractToParsedData(extractionResult: ExtractResumeDataOutput): any {
    return {
      contactInformation: extractionResult.contactInformation,
      experience: extractionResult.experience,
      education: extractionResult.education,
      skills: extractionResult.skills,
      projects: extractionResult.projects,
      certifications: extractionResult.certifications,
      involvement: extractionResult.involvement
    };
  }

  /**
   * Format extracted data to RMS (basic format)
   */
  private static formatToRms(extractionResult: ExtractResumeDataOutput): Record<string, string | number | boolean> {
    const rmsData: Record<string, string | number | boolean> = {};
    
    // Contact information
    if (extractionResult.contactInformation) {
      const contact = extractionResult.contactInformation as any;
      if (contact?.name) rmsData.rms_contact_fullname = contact.name;
      if (contact?.email) rmsData.rms_contact_email = contact.email;
      if (contact?.phone) rmsData.rms_contact_phone = contact.phone;
      if (contact?.linkedin) rmsData.rms_contact_linkedin = contact.linkedin;
      if (contact?.city) rmsData.rms_contact_city = contact.city;
      if (contact?.state) rmsData.rms_contact_state = contact.state;
      if (contact?.country) rmsData.rms_contact_country = contact.country;
    }
    
    // Summary
    if ((extractionResult as any).summary) {
      rmsData.rms_summary = (extractionResult as any).summary;
    }
    
    // Count-based sections
    if (extractionResult.experience && Array.isArray(extractionResult.experience)) {
      rmsData.rms_experience_count = extractionResult.experience.length;
    }
    
    if (extractionResult.education && Array.isArray(extractionResult.education)) {
      rmsData.rms_education_count = extractionResult.education.length;
    }
    
    if (extractionResult.skills) {
      rmsData.rms_skill_count = 1; // Single skills array becomes one category
    }
    
    if (extractionResult.projects && Array.isArray(extractionResult.projects)) {
      rmsData.rms_project_count = extractionResult.projects.length;
    }
    
    if (extractionResult.certifications && Array.isArray(extractionResult.certifications)) {
      rmsData.rms_certification_count = extractionResult.certifications.length;
    }
    
    if (extractionResult.involvement && Array.isArray(extractionResult.involvement)) {
      rmsData.rms_involvement_count = extractionResult.involvement.length;
    }
    
    return rmsData;
  }

  /**
   * Format extracted data to RMS (enhanced format with detailed fields)
   */
  private static formatToRmsEnhanced(parsedData: any): Record<string, string | number | boolean> {
    const rmsData: Record<string, string | number | boolean> = {};
    
    // Start with basic formatting
    const basicRms = this.formatToRms(parsedData);
    Object.assign(rmsData, basicRms);
    
    // Add detailed experience data
    if (parsedData.experience && Array.isArray(parsedData.experience)) {
      parsedData.experience.forEach((exp: any, index: number) => {
        const prefix = `rms_experience_${index}`;
        if (exp.company) rmsData[`${prefix}_company`] = exp.company;
        if (exp.title || exp.role) rmsData[`${prefix}_role`] = exp.title || exp.role;
        if (exp.startDate) rmsData[`${prefix}_dateBegin`] = exp.startDate;
        if (exp.endDate) rmsData[`${prefix}_dateEnd`] = exp.endDate;
        if (exp.current) rmsData[`${prefix}_current`] = true;
        if (exp.description) rmsData[`${prefix}_description`] = exp.description;
        if (exp.location) rmsData[`${prefix}_location`] = exp.location;
      });
    }
    
    // Add detailed education data
    if (parsedData.education && Array.isArray(parsedData.education)) {
      parsedData.education.forEach((edu: any, index: number) => {
        const prefix = `rms_education_${index}`;
        if (edu.school || edu.institution) rmsData[`${prefix}_institution`] = edu.school || edu.institution;
        if (edu.degree || edu.qualification) rmsData[`${prefix}_qualification`] = edu.degree || edu.qualification;
        if (edu.fieldOfStudy) rmsData[`${prefix}_field`] = edu.fieldOfStudy;
        if (edu.startDate) rmsData[`${prefix}_dateBegin`] = edu.startDate;
        if (edu.endDate || edu.graduationDate) rmsData[`${prefix}_dateEnd`] = edu.endDate || edu.graduationDate;
        if (edu.gpa || edu.score) rmsData[`${prefix}_gpa`] = edu.gpa || edu.score;
        if (edu.location) rmsData[`${prefix}_location`] = edu.location;
      });
    }
    
    // Add skill keywords  
    if (parsedData.skills && Array.isArray(parsedData.skills)) {
      rmsData.rms_skill_0_category = 'Skills';
      rmsData.rms_skill_0_keywords = parsedData.skills.join(', ');
      rmsData.rms_skill_count = 1;
    }
    
    return rmsData;
  }

  /**
   * Check if RMS metadata is complete (for fast path detection)
   */
  public static isCompleteRMSData(metadata: any): boolean {
    if (!metadata || typeof metadata !== 'object') {
      return false;
    }
    
    // Check for essential contact information
    const hasContactInfo = !!(metadata.rms_contact_fullName || metadata.Rms_contact_fullName) &&
                          !!(metadata.rms_contact_email || metadata.Rms_contact_email);
    
    // Check for at least some section counts
    const hasSectionCounts = !!(metadata.rms_experience_count || metadata.Rms_experience_count ||
                               metadata.rms_education_count || metadata.Rms_education_count ||
                               metadata.rms_skill_count || metadata.Rms_skill_count);
    
    // Check for RMS compliance indicators
    const hasRMSIndicators = !!(metadata.producer && metadata.producer.includes('rms_v')) ||
                            !!(metadata.rms_schema_detail || metadata.Rms_schema_detail);
    
    return hasContactInfo && hasSectionCounts && hasRMSIndicators;
  }

  /**
   * Merge ExifTool RMS metadata with AI-parsed data
   */
  public static mergeRMSMetadata(exifRMS: any, aiRMS: any): any {
    // ExifTool data takes precedence for existing fields
    const merged = { ...aiRMS };
    
    Object.keys(exifRMS).forEach(key => {
      if (exifRMS[key] !== null && exifRMS[key] !== undefined && exifRMS[key] !== '') {
        merged[key] = exifRMS[key];
      }
    });
    
    return merged;
  }

}