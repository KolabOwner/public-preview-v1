'use server';

/**
 * @fileOverview Optimized RMS-Compliant Gemini Resume Parser
 *
 * Fast, efficient resume parsing with Gemini 1.5 Flash
 * Optimized for sub-5 second processing times
 */

import { ai } from '@/lib/ai/genkit';
import { z } from 'genkit';

// ============================================================================
// CONSTANTS
// ============================================================================

const RMS_SCHEMA_URL = 'https://github.com/rezi-io/resume-standard';

// ============================================================================
// FAST UTILITY FUNCTIONS
// ============================================================================

function dateToTimestamp(dateStr: string): number {
  try {
    return Math.floor(new Date(dateStr).getTime() / 1000);
  } catch {
    return 0;
  }
}

function getDateFormat(dateStr: string): string {
  if (/^\d{4}$/.test(dateStr)) return '2006';
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{4}$/i.test(dateStr)) return 'January 2006';
  return 'unknown';
}

function formatPhoneNumber(phone: string): number {
  return parseInt(phone.replace(/\D/g, '')) || 0;
}

function parseFullName(name: string): { givennames: string; lastname: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return { givennames: parts[0] || '', lastname: '' };
  return {
    givennames: parts.slice(0, -1).join(' '),
    lastname: parts[parts.length - 1]
  };
}

// ============================================================================
// SCHEMAS
// ============================================================================

const ExtractResumeDataInputSchema = z.object({
  resumeDataUri: z.string(),
  fastMode: z.boolean().optional().default(true),
});

export type ExtractResumeDataInput = z.infer<typeof ExtractResumeDataInputSchema>;

const ExtractResumeDataOutputSchema = z.object({
  creator: z.string().optional(),
  producer: z.string().optional(),
  rms_schema_details: z.string().default(RMS_SCHEMA_URL),
  rms_contact_fullname: z.string().optional(),
  rms_contact_givennames: z.string().optional(),
  rms_contact_lastname: z.string().optional(),
  rms_contact_email: z.string().optional(),
  rms_contact_phone: z.number().optional(),
  rms_contact_linkedin: z.string().optional(),
  rms_contact_city: z.string().optional(),
  rms_contact_state: z.string().optional(),
  rms_contact_country: z.string().optional(),
  rms_contact_countrycode: z.string().optional(),
  rms_experience_count: z.number().default(0),
  rms_education_count: z.number().default(0),
  rms_skill_count: z.number().default(0),
  rms_project_count: z.number().default(0),
  rms_involvement_count: z.number().default(0),
  rms_certification_count: z.number().default(0),
  rms_award_count: z.number().default(0),
  rms_publication_count: z.number().default(0),
  rms_coursework_count: z.number().default(0),
  rms_reference_count: z.number().default(0),
}).passthrough();

export type ExtractResumeDataOutput = z.infer<typeof ExtractResumeDataOutputSchema>;

// ============================================================================
// SIMPLIFIED FAST EXTRACTION PROMPT
// ============================================================================

const fastExtractPrompt = ai.definePrompt({
  name: 'fastExtractPrompt',
  input: { schema: ExtractResumeDataInputSchema },
  output: {
    schema: z.object({
      contact: z.object({
        fullname: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        linkedin: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
      }).optional(),
      experience: z.array(z.object({
        company: z.string(),
        role: z.string(),
        location: z.string().optional(),
        datebegin: z.string(),
        dateend: z.string(),
        description: z.string(),
      })).optional(),
      education: z.array(z.object({
        institution: z.string(),
        qualification: z.string(),
        location: z.string().optional(),
        date: z.string(),
        isgraduate: z.boolean(),
      })).optional(),
      skills: z.array(z.object({
        category: z.string(),
        keywords: z.string(),
      })).optional(),
      involvement: z.array(z.object({
        organization: z.string(),
        role: z.string(),
        datebegin: z.string(),
        dateend: z.string(),
        description: z.string(),
      })).optional(),
    })
  },
  prompt: `Extract resume data from this PDF. Be fast and accurate.

CONTACT: name, email, phone, linkedin, city, state, country
EXPERIENCE: company, role, location, dates (datebegin/dateend), full description
EDUCATION: school, degree, location, graduation date, isgraduate (true/false)
SKILLS: group by category, list keywords
INVOLVEMENT: organization, role, dates, description

Key rules:
- Combine ALL bullet points into single description
- Use "Present" for current positions
- Extract exact text, don't summarize
- Return empty arrays for missing sections

{{media url=resumeDataUri}}

Extract and return structured data.`,
});

// ============================================================================
// FAST FLOW
// ============================================================================

const fastExtractFlow = ai.defineFlow(
  {
    name: 'fastExtractFlow',
    inputSchema: ExtractResumeDataInputSchema,
    outputSchema: z.any(),
  },
  async input => {
    const { output } = await fastExtractPrompt(input);
    return output!;
  }
);

// ============================================================================
// RMS FORMATTER (OPTIMIZED)
// ============================================================================

function formatToRMS(rawData: any): ExtractResumeDataOutput {
  const rmsData: any = {
    creator: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    producer: 'Skia/PDF m138',
    rms_schema_details: RMS_SCHEMA_URL,
    rms_experience_count: 0,
    rms_education_count: 0,
    rms_skill_count: 0,
    rms_project_count: 0,
    rms_involvement_count: 0,
    rms_certification_count: 0,
    rms_award_count: 0,
    rms_publication_count: 0,
    rms_coursework_count: 0,
    rms_reference_count: 0,
  };

  // Contact - fast processing
  if (rawData.contact) {
    const c = rawData.contact;
    if (c.fullname) {
      rmsData.rms_contact_fullname = c.fullname;
      const { givennames, lastname } = parseFullName(c.fullname);
      rmsData.rms_contact_givennames = givennames;
      rmsData.rms_contact_lastname = lastname;
    }
    if (c.email) rmsData.rms_contact_email = c.email;
    if (c.phone) rmsData.rms_contact_phone = formatPhoneNumber(c.phone);
    if (c.linkedin) rmsData.rms_contact_linkedin = c.linkedin;
    if (c.city) rmsData.rms_contact_city = c.city;
    if (c.state) rmsData.rms_contact_state = c.state;
    if (c.country) {
      rmsData.rms_contact_country = c.country;
      rmsData.rms_contact_countrycode = c.country;
    }
  }

  // Experience - streamlined
  if (rawData.experience?.length) {
    rmsData.rms_experience_count = rawData.experience.length;
    rawData.experience.forEach((exp: any, i: number) => {
      const p = `rms_experience_${i}`;
      rmsData[`${p}_company`] = exp.company;
      rmsData[`${p}_role`] = exp.role;
      if (exp.location) rmsData[`${p}_location`] = exp.location;
      rmsData[`${p}_description`] = exp.description;
      rmsData[`${p}_datebegin`] = exp.datebegin;
      rmsData[`${p}_datebeginformat`] = getDateFormat(exp.datebegin);
      rmsData[`${p}_datebegints`] = dateToTimestamp(exp.datebegin);
      rmsData[`${p}_dateend`] = exp.dateend;
      rmsData[`${p}_iscurrent`] = exp.dateend.toLowerCase() === 'present';
      if (!rmsData[`${p}_iscurrent`]) {
        rmsData[`${p}_dateendformat`] = getDateFormat(exp.dateend);
        rmsData[`${p}_dateendts`] = dateToTimestamp(exp.dateend);
      }
    });
  }

  // Education - streamlined
  if (rawData.education?.length) {
    rmsData.rms_education_count = rawData.education.length;
    rawData.education.forEach((edu: any, i: number) => {
      const p = `rms_education_${i}`;
      rmsData[`${p}_institution`] = edu.institution;
      rmsData[`${p}_qualification`] = edu.qualification;
      if (edu.location) rmsData[`${p}_location`] = edu.location;
      const yearMatch = edu.date.match(/\d{4}/);
      if (yearMatch) {
        rmsData[`${p}_date`] = parseInt(yearMatch[0]);
        rmsData[`${p}_dateformat`] = 2006;
        rmsData[`${p}_datets`] = dateToTimestamp(`${yearMatch[0]}-01-01`);
      }
      rmsData[`${p}_isgraduate`] = edu.isgraduate || false;
    });
  }

  // Skills - streamlined
  if (rawData.skills?.length) {
    rmsData.rms_skill_count = rawData.skills.length;
    rawData.skills.forEach((skill: any, i: number) => {
      rmsData[`rms_skill_${i}_category`] = skill.category;
      rmsData[`rms_skill_${i}_keywords`] = skill.keywords;
    });
  }

  // Involvement - streamlined
  if (rawData.involvement?.length) {
    rmsData.rms_involvement_count = rawData.involvement.length;
    rawData.involvement.forEach((inv: any, i: number) => {
      const p = `rms_involvement_${i}`;
      rmsData[`${p}_organization`] = inv.organization;
      rmsData[`${p}_role`] = inv.role;
      rmsData[`${p}_description`] = inv.description;
      rmsData[`${p}_datebegin`] = inv.datebegin;
      rmsData[`${p}_datebeginformat`] = getDateFormat(inv.datebegin);
      rmsData[`${p}_datebegints`] = dateToTimestamp(inv.datebegin);
      rmsData[`${p}_dateend`] = inv.dateend;
    });
  }

  return rmsData;
}

// ============================================================================
// MAIN FUNCTION - OPTIMIZED FOR SPEED
// ============================================================================

export async function extractResumeData(
  input: ExtractResumeDataInput
): Promise<ExtractResumeDataOutput> {
  const startTime = Date.now();

  try {
    // Skip validation for speed
    console.log('⚡ Fast extraction starting...');

    // Direct extraction - no retries by default
    const rawResult = await fastExtractFlow(input);

    // Fast RMS formatting
    const rmsFormatted = formatToRMS(rawResult);

    const elapsed = Date.now() - startTime;
    console.log(`✅ Completed in ${elapsed}ms`);

    return rmsFormatted;

  } catch (error) {
    // Fast fail
    console.error('❌ Extraction failed:', error);

    // Return minimal valid structure on error
    return {
      creator: 'Mozilla/5.0',
      producer: 'Skia/PDF',
      rms_schema_details: RMS_SCHEMA_URL,
      rms_experience_count: 0,
      rms_education_count: 0,
      rms_skill_count: 0,
      rms_project_count: 0,
      rms_involvement_count: 0,
      rms_certification_count: 0,
      rms_award_count: 0,
      rms_publication_count: 0,
      rms_coursework_count: 0,
      rms_reference_count: 0,
    };
  }
}