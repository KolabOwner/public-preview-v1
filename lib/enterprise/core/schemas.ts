/**
 * Zod schemas for RMS v2.0.1 validation
 * Ensures type safety and compliance with the Resume Metadata Standard
 */

import { z } from 'zod';
import { RMS_LIMITS } from './types';

// ============================================================================
// Essential Fields Schema
// ============================================================================

export const RMSEssentialSchema = z.object({
  Producer: z.literal('rms_v2.0.1'),
  rms_schema_detail: z.literal('https://github.com/rezi-io/resume-standard').optional(),
});

// ============================================================================
// Contact Information Schema
// ============================================================================

export const RMSContactSchema = z.object({
  rms_contact_fullName: z.string().optional(),
  rms_contact_givenNames: z.string().optional(),
  rms_contact_lastName: z.string().optional(),
  rms_contact_email: z.string().email().optional(),
  rms_contact_phone: z.string().optional(),
  rms_contact_linkedin: z.string().optional(),
  rms_contact_github: z.string().optional(),
  rms_contact_behance: z.string().optional(),
  rms_contact_dribble: z.string().optional(),
  rms_contact_website: z.string().url().or(z.string()).optional(), // Allow partial URLs
  rms_contact_country: z.string().optional(),
  rms_contact_countryCode: z.string().length(2).optional(), // ISO 3166 A-2
  rms_contact_city: z.string().optional(),
  rms_contact_state: z.string().optional(),
});

// ============================================================================
// Date Validation
// ============================================================================

const DateFormatSchema = z.enum(['YYYY', 'MMMM YYYY', 'MM/DD/YYYY', 'DD/MM/YYYY']);

const DateFieldSchema = z.object({
  date: z.string(),
  dateTS: z.union([z.string(), z.number()]).optional(), // Can be string or number
  dateFormat: DateFormatSchema.optional(),
});

// ============================================================================
// Section Item Schemas
// ============================================================================

export const RMSExperienceItemSchema = z.object({
  company: z.string(),
  role: z.string(),
  location: z.string().optional(),
  dateBegin: z.string(),
  dateBeginTS: z.union([z.string(), z.number()]).optional(),
  dateBeginFormat: DateFormatSchema.optional(),
  dateEnd: z.string(), // Can be "Present"
  dateEndTS: z.union([z.string(), z.number()]).optional(),
  dateEndFormat: DateFormatSchema.optional(),
  isCurrent: z.union([z.boolean(), z.string()]), // Can be "true"/"false" string
  description: z.string(),
});

export const RMSEducationItemSchema = z.object({
  institution: z.string(),
  qualification: z.string(),
  location: z.string().optional(),
  date: z.string(),
  dateTS: z.union([z.string(), z.number()]).optional(),
  dateFormat: DateFormatSchema.optional(),
  isGraduate: z.union([z.boolean(), z.string()]),
  minor: z.string().optional(),
  score: z.string().optional(),
  scoreType: z.string().optional(),
  description: z.string().optional(),
});

export const RMSCertificationItemSchema = z.object({
  name: z.string(),
  department: z.string().optional(),
  issuer: z.string().optional(), // Alternative to department
  date: z.string(),
  dateTS: z.union([z.string(), z.number()]).optional(),
  dateFormat: DateFormatSchema.optional(),
  description: z.string().optional(),
});

export const RMSCourseworkItemSchema = z.object({
  name: z.string(),
  department: z.string(),
  date: z.string(),
  dateTS: z.union([z.string(), z.number()]).optional(),
  dateFormat: DateFormatSchema.optional(),
  description: z.string().optional(),
  skill: z.string().optional(),
});

export const RMSInvolvementItemSchema = z.object({
  organization: z.string(),
  location: z.string().optional(),
  role: z.string(),
  dateBegin: z.string(),
  dateBeginTS: z.union([z.string(), z.number()]).optional(),
  dateBeginFormat: DateFormatSchema.optional(),
  dateEnd: z.string(),
  dateEndTS: z.union([z.string(), z.number()]).optional(),
  dateEndFormat: DateFormatSchema.optional(),
  description: z.string().optional(),
});

export const RMSProjectItemSchema = z.object({
  title: z.string(),
  organization: z.string().optional(),
  role: z.string().optional(),
  dateBegin: z.string().optional(),
  dateBeginTS: z.union([z.string(), z.number()]).optional(),
  dateBeginFormat: DateFormatSchema.optional(),
  dateEnd: z.string().optional(),
  dateEndTS: z.union([z.string(), z.number()]).optional(),
  dateEndFormat: DateFormatSchema.optional(),
  description: z.string(),
  url: z.string().optional(),
});

export const RMSSkillItemSchema = z.object({
  category: z.string(),
  keywords: z.string(), // Comma-separated
});

export const RMSPublicationItemSchema = z.object({
  title: z.string(),
  organization: z.string(),
  role: z.string(),
  date: z.string(),
  dateTS: z.union([z.string(), z.number()]).optional(),
  dateFormat: DateFormatSchema.optional(),
  description: z.string().optional(),
  type: z.string().optional(),
});

export const RMSAwardItemSchema = z.object({
  title: z.string(),
  organization: z.string(),
  date: z.string(),
  dateTS: z.union([z.string(), z.number()]).optional(),
  dateFormat: DateFormatSchema.optional(),
  description: z.string().optional(),
});

export const RMSReferenceItemSchema = z.object({
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  type: z.string().optional(),
  organization: z.string().optional(),
  role: z.string().optional(),
});

// ============================================================================
// Dynamic Field Validation
// ============================================================================

/**
 * Create a schema for indexed fields (0-15)
 */
function createIndexedFieldSchema<T extends z.ZodTypeAny>(
  section: string,
  itemSchema: T
): z.ZodObject<Record<string, z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>>> {
  const fields: Record<string, z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>> = {};
  
  // Add count field
  fields[`rms_${section}_count`] = z.union([z.string(), z.number()]).optional();
  
  // Add fields for each possible index (0-15)
  for (let i = 0; i < RMS_LIMITS.MAX_ITEMS_PER_SECTION; i++) {
    const itemFields = itemSchema._def.shape();
    
    for (const [fieldName, fieldSchema] of Object.entries(itemFields)) {
      const rmsFieldName = `rms_${section}_${i}_${fieldName}`;
      fields[rmsFieldName] = z.union([z.string(), z.number(), z.boolean()]).optional();
    }
  }
  
  return z.object(fields);
}

// ============================================================================
// Complete RMS Metadata Schema
// ============================================================================

/**
 * Complete RMS metadata schema with all fields
 * This is the main schema for validating RMS metadata
 */
export const RMSMetadataSchema = z.object({
  // Essential fields
  Producer: z.string(),
  rms_schema_detail: z.string().optional(),
  
  // Contact fields (non-indexed)
  rms_contact_fullName: z.string().optional(),
  rms_contact_givenNames: z.string().optional(),
  rms_contact_lastName: z.string().optional(),
  rms_contact_email: z.string().optional(),
  rms_contact_phone: z.string().optional(),
  rms_contact_linkedin: z.string().optional(),
  rms_contact_github: z.string().optional(),
  rms_contact_behance: z.string().optional(),
  rms_contact_dribble: z.string().optional(),
  rms_contact_website: z.string().optional(),
  rms_contact_country: z.string().optional(),
  rms_contact_countryCode: z.string().optional(),
  rms_contact_city: z.string().optional(),
  rms_contact_state: z.string().optional(),
  
  // Summary (non-indexed)
  rms_summary: z.string().optional(),
  
  // Count fields
  rms_experience_count: z.union([z.string(), z.number()]).optional(),
  rms_education_count: z.union([z.string(), z.number()]).optional(),
  rms_certification_count: z.union([z.string(), z.number()]).optional(),
  rms_coursework_count: z.union([z.string(), z.number()]).optional(),
  rms_involvement_count: z.union([z.string(), z.number()]).optional(),
  rms_project_count: z.union([z.string(), z.number()]).optional(),
  rms_skill_count: z.union([z.string(), z.number()]).optional(),
  rms_publication_count: z.union([z.string(), z.number()]).optional(),
  rms_award_count: z.union([z.string(), z.number()]).optional(),
  rms_reference_count: z.union([z.string(), z.number()]).optional(),
})
.catchall(z.any()); // Allow additional indexed fields

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate RMS metadata
 */
export function validateRMSMetadata(data: unknown): {
  success: boolean;
  data?: z.infer<typeof RMSMetadataSchema>;
  error?: z.ZodError;
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
 * Validate a specific RMS section
 */
export function validateRMSSection(
  section: string,
  index: number,
  data: Record<string, any>
): boolean {
  // Map section names to schemas
  const sectionSchemas: Record<string, z.ZodTypeAny> = {
    experience: RMSExperienceItemSchema,
    education: RMSEducationItemSchema,
    certification: RMSCertificationItemSchema,
    coursework: RMSCourseworkItemSchema,
    involvement: RMSInvolvementItemSchema,
    project: RMSProjectItemSchema,
    skill: RMSSkillItemSchema,
    publication: RMSPublicationItemSchema,
    award: RMSAwardItemSchema,
    reference: RMSReferenceItemSchema,
  };
  
  const schema = sectionSchemas[section];
  if (!schema) return false;
  
  // Extract fields for this specific index
  const itemData: Record<string, any> = {};
  const prefix = `rms_${section}_${index}_`;
  
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith(prefix)) {
      const fieldName = key.substring(prefix.length);
      itemData[fieldName] = value;
    }
  }
  
  try {
    schema.parse(itemData);
    return true;
  } catch {
    return false;
  }
}

/**
 * Strict validation that checks for RMS v2.0.1 compliance
 */
export function validateRMSCompliance(data: unknown): {
  valid: boolean;
  version: string;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic type check
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      version: 'unknown',
      errors: ['Data must be an object'],
      warnings,
    };
  }
  
  const metadata = data as Record<string, any>;
  
  // Check version
  const version = metadata.Producer || 'unknown';
  if (version !== 'rms_v2.0.1') {
    errors.push(`Invalid RMS version: ${version}. Expected: rms_v2.0.1`);
  }
  
  // Check schema URL
  if (metadata.rms_schema_detail !== 'https://github.com/rezi-io/resume-standard') {
    warnings.push('Schema detail URL is missing or incorrect');
  }
  
  // Validate counts match actual fields
  for (const section of RMS_LIMITS.SECTIONS) {
    const countField = `rms_${section}_count`;
    const count = parseInt(metadata[countField] || '0', 10);
    
    if (count > 0) {
      // Check if we have the expected fields
      for (let i = 0; i < count; i++) {
        const sampleField = `rms_${section}_${i}_`;
        const hasFields = Object.keys(metadata).some(key => key.startsWith(sampleField));
        
        if (!hasFields) {
          errors.push(`Missing fields for ${section} item ${i} (count indicates ${count} items)`);
        }
      }
    }
    
    // Check for fields beyond the count
    for (let i = count; i < RMS_LIMITS.MAX_ITEMS_PER_SECTION; i++) {
      const extraField = `rms_${section}_${i}_`;
      const hasExtraFields = Object.keys(metadata).some(key => key.startsWith(extraField));
      
      if (hasExtraFields) {
        warnings.push(`Found ${section} fields at index ${i} but count is only ${count}`);
      }
    }
  }
  
  // Check for required contact info
  if (!metadata.rms_contact_fullName && !metadata.rms_contact_email) {
    warnings.push('No contact name or email provided');
  }
  
  return {
    valid: errors.length === 0,
    version,
    errors,
    warnings,
  };
}