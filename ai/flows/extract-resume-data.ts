'use server';

/**
 * @fileOverview Gemini Multimodal PDF Resume Data Extraction Flow
 *
 * This file implements Gemini 1.5 Flash's multimodal PDF capabilities for direct resume parsing.
 * It replaces the previous Ollama-based text extraction approach with native PDF understanding.
 *
 * Key Features:
 * - Direct PDF binary processing (no text extraction required)
 * - Multimodal vision capabilities for layout understanding
 * - Optimized for PDFs without embedded RMS metadata
 * - Adheres to the Rezi Resume Metadata Standard (RMS)
 * - Systematic replacement of legacy Ollama parser
 *
 * Integration Points:
 * - Called by /app/api/resume-endpoints/parse/route.ts for direct PDF uploads
 * - Used by PDFProcessor when no complete RMS metadata is detected
 * - Falls back to text-based parsing if multimodal parsing fails
 *
 * @exports extractResumeData - Main extraction function using Gemini multimodal PDF
 * @exports ExtractResumeDataInput - Input schema requiring PDF data URI
 * @exports ExtractResumeDataOutput - Structured output following RMS schema
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';


const ExtractResumeDataInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      'The resume PDF file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type ExtractResumeDataInput = z.infer<typeof ExtractResumeDataInputSchema>;

const ExtractResumeDataOutputSchema = z.object({
  contactInformation: z.object({
    name: z.string().optional().describe('The full name of the resume owner.'),
    email: z.string().optional().describe('The email address of the resume owner.'),
    phone: z.string().optional().describe('The phone number of the resume owner.'),
    linkedin: z.string().optional().describe('The LinkedIn profile URL of the resume owner.'),
  }).optional().describe('Contact information of the resume owner.'),
  experience: z.array(z.object({
    title: z.string().optional().describe('The job title.'),
    company: z.string().optional().describe('The company name.'),
    dates: z.string().optional().describe('The start and end dates of the job.'),
    description: z.string().optional().describe('The description of the job.'),
  })).optional().describe('Work experience of the resume owner.'),
  education: z.array(z.object({
    institution: z.string().optional().describe('The name of the institution.'),
    degree: z.string().optional().describe('The degree obtained.'),
    dates: z.string().optional().describe('The start and end dates of the education.'),
    description: z.string().optional().describe('The description of the education.'),
  })).optional().describe('Education of the resume owner.'),
  projects: z.array(z.object({
    title: z.string().optional().describe('The project title.'),
    dates: z.string().optional().describe('The start and end dates of the project.'),
    description: z.string().optional().describe('A description of the project.'),
    url: z.string().optional().describe('A URL for the project if available.'),
  })).optional().describe('Projects the resume owner has worked on.'),
  involvement: z.array(z.object({
      organization: z.string().optional().describe('The name of the organization.'),
      role: z.string().optional().describe('The role or position held.'),
      dates: z.string().optional().describe('The start and end dates of involvement.'),
      description: z.string().optional().describe('A description of the involvement or activities.'),
  })).optional().describe('Extracurricular or community involvement.'),
  skills: z.array(z.string()).optional().describe('Skills of the resume owner.'),
  certifications: z.array(z.object({
    name: z.string().optional().describe('The name of the certification.'),
    issuer: z.string().optional().describe('The organization that issued the certification.'),
    date: z.string().optional().describe('The date the certification was awarded.'),
  })).optional().describe('Certifications held by the resume owner.'),
});

export type ExtractResumeDataOutput = z.infer<typeof ExtractResumeDataOutputSchema>;

export async function extractResumeData(input: ExtractResumeDataInput): Promise<ExtractResumeDataOutput> {
  console.log('🔍 Starting Gemini multimodal PDF extraction');
  
  // Validate input data URI format
  if (!input.resumeDataUri.startsWith('data:')) {
    throw new Error('Invalid data URI format. Expected data URI with MIME type and base64 encoding');
  }
  
  // Extract MIME type to ensure we're processing a PDF
  const mimeMatch = input.resumeDataUri.match(/^data:([^;]+);base64,/);
  if (!mimeMatch) {
    throw new Error('Invalid data URI format. Missing MIME type');
  }
  
  const mimeType = mimeMatch[1];
  if (mimeType !== 'application/pdf') {
    console.warn(`⚠️ Unexpected MIME type: ${mimeType}. Expected application/pdf`);
  }
  
  console.log(`📄 Processing PDF with MIME type: ${mimeType}`);
  
  try {
    const result = await extractResumeDataFlow(input);
    console.log('✅ Gemini multimodal PDF extraction completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Gemini multimodal PDF extraction failed:', error);
    throw error;
  }
}

const extractResumeDataPrompt = ai.definePrompt({
  name: 'extractResumeDataPrompt',
  input: {schema: ExtractResumeDataInputSchema},
  output: {schema: ExtractResumeDataOutputSchema},
  prompt: `You are an expert AI resume parser. Extract ALL information from this PDF resume.

**CRITICAL BUG FIX INSTRUCTIONS:**
1. Phone numbers should be extracted EXACTLY as shown - no extra whitespace or newlines
2. If you see repeated newlines or whitespace, clean them to a single space
3. MUST extract ALL experience entries - do not return experience_count: 0
4. MUST extract ALL education entries - do not return education_count: 0
5. MUST extract ALL skills - do not return skill_count: 0

**STEP-BY-STEP PARSING APPROACH:**
1. First, scan the ENTIRE document to identify all sections
2. Look for section headers like: EXPERIENCE, EDUCATION, SKILLS, PROJECTS, etc.
3. Extract contact info from the top (name, email, phone, LinkedIn) - clean any extra whitespace
4. For each experience entry, extract: company, role/title, dates, ALL bullet points as description
5. For each education entry, extract: institution, degree, dates, GPA if present
6. Extract ALL skills mentioned anywhere in the document

**CONTACT INFO EXTRACTION:**
- Name: Extract the full name (usually at the top in larger font)
- Email: Look for @ symbol
- Phone: Extract digits only, format as (XXX) XXX-XXXX if possible
- LinkedIn: Look for linkedin.com URLs
- IMPORTANT: If phone appears with extra spaces/newlines, clean it to just the number

**EXPERIENCE EXTRACTION:**
Look for variations of experience sections:
- "EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT"
- Each entry typically has: Company Name, Job Title, Dates, Location, Bullet points
- INCLUDE ALL BULLET POINTS in the description field
- Example format: "• Managed team of 5. • Increased sales by 20%. • Implemented new CRM system."

**EDUCATION EXTRACTION:**
Look for variations of education sections:
- "EDUCATION", "ACADEMIC BACKGROUND", "QUALIFICATIONS"
- Each entry has: School Name, Degree Type, Major/Field, Graduation Date, GPA (optional)

**SKILLS EXTRACTION:**
Look for variations of skills sections:
- "SKILLS", "TECHNICAL SKILLS", "CORE COMPETENCIES"
- Extract as array of individual skills
- Include skills mentioned in experience descriptions too

**PDF INPUT:** {{media url=resumeDataUri}}

**VALIDATION CHECKLIST:**
Before returning results, verify:
✓ Phone number is clean (no repeated newlines)
✓ Experience count > 0 if experience section exists
✓ Education count > 0 if education section exists
✓ Skills count > 0 if skills are mentioned
✓ All bullet points are captured in descriptions
✓ No truncated or missing sections

Return complete extraction following the schema.`,
});

const extractResumeDataFlow = ai.defineFlow(
  {
    name: 'extractResumeDataFlow',
    inputSchema: ExtractResumeDataInputSchema,
    outputSchema: ExtractResumeDataOutputSchema,
  },
  async input => {
    const {output} = await extractResumeDataPrompt(input);
    return output!;
  }
);
