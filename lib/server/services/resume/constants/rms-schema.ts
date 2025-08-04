import { z } from 'zod';

/**
 * RMS (Resume Metadata Standard) Schema definitions
 */

/**
 * RMS Contact Schema for contact information
 */
export const RMSContactSchema = z.object({
  rms_contact_fullName: z.string().optional(),
  rms_contact_firstName: z.string().optional(),
  rms_contact_lastName: z.string().optional(),
  rms_contact_middleName: z.string().optional(),
  rms_contact_email: z.string().optional(),
  rms_contact_phone: z.string().optional(),
  rms_contact_address: z.string().optional(),
  rms_contact_city: z.string().optional(),
  rms_contact_state: z.string().optional(),
  rms_contact_zip: z.string().optional(),
  rms_contact_country: z.string().optional(),
  rms_contact_linkedin: z.string().optional(),
  rms_contact_website: z.string().optional(),
  rms_contact_github: z.string().optional(),
  rms_contact_twitter: z.string().optional(),
  rms_contact_portfolio: z.string().optional()
});

/**
 * Complete RMS Metadata Schema
 */
export const RMSMetadataSchema = z.object({
  // Contact Information
  ...RMSContactSchema.shape,
  // Summary
  rms_summary: z.string().optional(),
  rms_objective: z.string().optional(),
  // Experience
  rms_experience_count: z.union([z.string(), z.number()]).optional(),
  // Education
  rms_education_count: z.union([z.string(), z.number()]).optional(),
  // Skills
  rms_skill_count: z.union([z.string(), z.number()]).optional(),
  // Projects
  rms_project_count: z.union([z.string(), z.number()]).optional(),
  // Certifications
  rms_certification_count: z.union([z.string(), z.number()]).optional(),
  // Involvements
  rms_involvement_count: z.union([z.string(), z.number()]).optional(),
  // Coursework
  rms_coursework_count: z.union([z.string(), z.number()]).optional(),
  // Publications
  rms_publication_count: z.union([z.string(), z.number()]).optional(),
  // Awards
  rms_award_count: z.union([z.string(), z.number()]).optional(),
  // Languages
  rms_language_count: z.union([z.string(), z.number()]).optional()
}).catchall(z.any());

export type RMSMetadata = z.infer<typeof RMSMetadataSchema>;

/**
 * Current RMS version
 */
export const RMS_VERSION = '2.0';

/**
 * RMS field prefixes for different sections
 */
export const RMS_FIELD_PREFIXES = {
  contact: 'rms_contact_',
  experience: 'rms_experience_',
  education: 'rms_education_',
  skill: 'rms_skill_',
  project: 'rms_project_',
  certification: 'rms_certification_',
  involvement: 'rms_involvement_',
  coursework: 'rms_coursework_',
  publication: 'rms_publication_',
  award: 'rms_award_',
  language: 'rms_language_',
  reference: 'rms_reference_'
} as const;