// src/lib/schema.ts
// Complete RMS v2.0.1 Zod schema with ALL sections

import { z } from 'zod';

// Helper schemas for common patterns
const dateFormatSchema = z.enum(['YYYY', 'MMMM YYYY', 'MM/DD/YYYY', 'DD/MM/YYYY']);
const countryCodeSchema = z.string().length(2).regex(/^[A-Z]{2}$/); // ISO 3166 A-2

// Essential fields schema - REQUIRED for RMS v2.0.1
const essentialFieldsSchema = z.object({
  Producer: z.literal('rms_v2.0.1'),
  rms_schema_detail: z.literal('https://github.com/rezi-io/resume-standard')
});

// Contact schema
const contactSchema = z.object({
  rms_contact_fullName: z.string(),
  rms_contact_givenNames: z.string().optional(),
  rms_contact_lastName: z.string().optional(),
  rms_contact_email: z.string().email(),
  rms_contact_phone: z.string().optional(),
  rms_contact_linkedin: z.string().optional(),
  rms_contact_github: z.string().optional(),
  rms_contact_behance: z.string().optional(),
  rms_contact_dribbble: z.string().optional(), // Fixed typo from "dribble" to "dribbble"
  rms_contact_website: z.string().optional(),
  rms_contact_country: z.string().optional(),
  rms_contact_countryCode: countryCodeSchema.optional(),
  rms_contact_city: z.string().optional(),
  rms_contact_state: z.string().optional()
});

// Summary schema
const summarySchema = z.object({
  rms_summary: z.string().optional()
});

// Experience schema - for traditional employment relationships and compensated work
const experienceSchema = z.object({
  rms_experience_count: z.number().int().min(0).max(15)
}).catchall(
  z.union([
    z.string(),
    z.number(),
    z.boolean()
  ])
);

// Education schema
const educationSchema = z.object({
  rms_education_count: z.number().int().min(0).max(15)
}).catchall(
  z.union([
    z.string(),
    z.number(),
    z.boolean()
  ])
);

// Certification schema
const certificationSchema = z.object({
  rms_certification_count: z.number().int().min(0).max(15)
}).catchall(
  z.union([
    z.string(),
    z.number()
  ])
);

// Coursework schema
const courseworkSchema = z.object({
  rms_coursework_count: z.number().int().min(0).max(15)
}).catchall(
  z.union([
    z.string(),
    z.number()
  ])
);

// Involvement schema - for extracurricular activities, volunteer work, and organizational participation
const involvementSchema = z.object({
  rms_involvement_count: z.number().int().min(0).max(15)
}).catchall(
  z.union([
    z.string(),
    z.number()
  ])
);

// Project schema - for personal projects, side projects, and independent work
const projectSchema = z.object({
  rms_project_count: z.number().int().min(0).max(15)
}).catchall(
  z.union([
    z.string(),
    z.number()
  ])
);

// Skill schema
const skillSchema = z.object({
  rms_skill_count: z.number().int().min(0).max(15)
}).catchall(z.string());

// Publication schema
const publicationSchema = z.object({
  rms_publication_count: z.number().int().min(0).max(15)
}).catchall(
  z.union([
    z.string(),
    z.number()
  ])
);

// Award schema
const awardSchema = z.object({
  rms_award_count: z.number().int().min(0).max(15)
}).catchall(
  z.union([
    z.string(),
    z.number()
  ])
);

// Reference schema
const referenceSchema = z.object({
  rms_reference_count: z.number().int().min(0).max(15)
}).catchall(z.string());

// Complete RMS schema combining all sections
export const rmsSchema = z.object({
  // Required fields
  Producer: z.literal('rms_v2.0.1'),
  rms_schema_detail: z.literal('https://github.com/rezi-io/resume-standard'),

  // Contact fields
  rms_contact_fullName: z.string(),
  rms_contact_givenNames: z.string().optional(),
  rms_contact_lastName: z.string().optional(),
  rms_contact_email: z.string().email(),
  rms_contact_phone: z.string().optional(),
  rms_contact_linkedin: z.string().optional(),
  rms_contact_github: z.string().optional(),
  rms_contact_behance: z.string().optional(),
  rms_contact_dribbble: z.string().optional(), // Fixed typo from "dribble" to "dribbble"
  rms_contact_website: z.string().optional(),
  rms_contact_country: z.string().optional(),
  rms_contact_countryCode: countryCodeSchema.optional(),
  rms_contact_city: z.string().optional(),
  rms_contact_state: z.string().optional(),

  // Summary
  rms_summary: z.string().optional(),

  // Section counts
  rms_experience_count: z.number().int().min(0).max(15).default(0),
  rms_education_count: z.number().int().min(0).max(15).default(0),
  rms_skill_count: z.number().int().min(0).max(15).default(0),
  rms_certification_count: z.number().int().min(0).max(15).default(0),
  rms_coursework_count: z.number().int().min(0).max(15).default(0),
  rms_involvement_count: z.number().int().min(0).max(15).default(0),
  rms_project_count: z.number().int().min(0).max(15).default(0),
  rms_publication_count: z.number().int().min(0).max(15).default(0),
  rms_award_count: z.number().int().min(0).max(15).default(0),
  rms_reference_count: z.number().int().min(0).max(15).default(0),
}).catchall(z.unknown()); // Allow dynamic fields for array items

// Type inference
export type RMSData = z.infer<typeof rmsSchema>;

// Helper function to validate RMS data
export function validateRMSData(data: unknown): { success: boolean; data?: RMSData; error?: z.ZodError } {
  try {
    const validated = rmsSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

// Helper function to create a strict validator for specific sections
export function createSectionValidator(section: string, maxCount: number = 15) {
  const countKey = `rms_${section}_count`;

  return z.object({
    [countKey]: z.number().int().min(0).max(maxCount)
  }).catchall(z.unknown()).refine(
    (data) => {
      const count = data[countKey] as number;
      // Validate that all expected fields exist for each index
      for (let i = 0; i < count; i++) {
        const prefix = `rms_${section}_${i}_`;
        const hasAnyField = Object.keys(data).some(key => key.startsWith(prefix));
        if (!hasAnyField) {
          return false;
        }
      }
      return true;
    },
    {
      message: `Missing required fields for ${section} entries`
    }
  );
}

// Strict field validators for each section
export const strictValidators = {
  // Experience is for traditional employment relationships and compensated work
  experience: z.object({
    company: z.string(),
    role: z.string(), // Using "role" instead of "jobTitle" per RMS spec
    description: z.string(),
    dateBegin: z.string(),
    dateBeginTS: z.number().optional(),
    dateEnd: z.string(),
    dateEndTS: z.number().optional(),
    isCurrent: z.boolean(),
    location: z.string().optional()
  }),

  education: z.object({
    institution: z.string(),
    qualification: z.string(), // Using "qualification" instead of "field" per RMS spec
    location: z.string().optional(),
    date: z.string(),
    dateTS: z.number().optional(),
    dateFormat: dateFormatSchema.optional(),
    isGraduate: z.boolean().optional(),
    minor: z.string().optional(),
    score: z.string().optional(),
    scoreType: z.string().optional()
  }),

  certification: z.object({
    name: z.string(),
    department: z.string().optional(),
    date: z.string(),
    dateTS: z.number().optional(),
    dateFormat: dateFormatSchema.optional(),
    description: z.string().optional()
  }),

  coursework: z.object({
    name: z.string(),
    department: z.string().optional(),
    date: z.string(),
    dateTS: z.number().optional(),
    dateFormat: dateFormatSchema.optional(),
    description: z.string().optional(),
    skill: z.string().optional()
  }),

  // Involvement is for extracurricular activities, volunteer work, and organizational participation
  involvement: z.object({
    organization: z.string(),
    role: z.string().optional(),
    location: z.string().optional(),
    dateBegin: z.string(),
    dateBeginTS: z.number().optional(),
    dateBeginFormat: dateFormatSchema.optional(),
    dateEnd: z.string(),
    dateEndTS: z.number().optional(),
    dateEndFormat: dateFormatSchema.optional(),
    description: z.string().optional()
  }),

  skill: z.object({
    category: z.string(),
    keywords: z.string() // Comma-separated string, not array
  }),

  // Project is for personal projects, side projects, and independent work
  project: z.object({
    title: z.string(),
    organization: z.string().optional(), // Can be marked as "n/a" when no formal organization
    role: z.string().optional(),
    dateBegin: z.string().optional(),
    dateBeginTS: z.number().optional(),
    dateBeginFormat: dateFormatSchema.optional(),
    dateEnd: z.string().optional(),
    dateEndTS: z.number().optional(),
    dateEndFormat: dateFormatSchema.optional(),
    description: z.string(),
    url: z.string().url().optional()
  }),

  publication: z.object({
    title: z.string(),
    organization: z.string(),
    role: z.string().optional(),
    date: z.string(),
    dateTS: z.number().optional(),
    dateFormat: dateFormatSchema.optional(),
    description: z.string().optional(),
    type: z.string().optional()
  }),

  award: z.object({
    title: z.string(),
    organization: z.string(),
    date: z.string(),
    dateTS: z.number().optional(),
    dateFormat: dateFormatSchema.optional(),
    description: z.string().optional()
  }),

  reference: z.object({
    name: z.string(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    type: z.string().optional(),
    organization: z.string().optional(),
    role: z.string().optional()
  })
};

// Function to validate a single section entry
export function validateSectionEntry(section: keyof typeof strictValidators, data: unknown) {
  return strictValidators[section].safeParse(data);
}

// Create RMS validator for integration
export function createRMSValidator() {
  return {
    schema: rmsSchema,
    validate: validateRMSData,
    sections: strictValidators,

    // Helper to format validation errors
    formatValidationErrors: (errors: z.ZodError) => {
      return errors.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
    },

    // Helper to generate validation prompt
    generateValidationPrompt: (data: unknown) => {
      const result = validateRMSData(data);
      if (result.success) {
        return "The resume metadata is valid according to RMS v2.0.1 standard.";
      }

      const errors = result.error ?
        result.error.errors.map(e => `- ${e.path.join('.')}: ${e.message}`).join('\n') :
        'Unknown validation error';

      return `Resume metadata validation failed:\n${errors}\n\nPlease fix these issues to comply with RMS v2.0.1 standard.`;
    }
  };
}