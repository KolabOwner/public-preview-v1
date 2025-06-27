/**
 * @fileOverview AI flow for generating personalized cover letters
 *
 * @exports generateCoverLetterFlow - Main cover letter generation flow
 * @exports GenerateCoverLetterInput - Input schema for cover letter generation
 * @exports GenerateCoverLetterOutput - Output schema for cover letter generation
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for cover letter generation
const GenerateCoverLetterInputSchema = z.object({
  // Resume context
  resumeText: z.string().describe('The resume content as plain text'),
  resumeSummary: z.string().optional().describe('Professional summary from resume'),

  // Job details
  jobTitle: z.string().describe('The job position title'),
  companyName: z.string().describe('The company name'),
  jobDescription: z.string().optional().describe('The job description if available'),

  // Highlights to emphasize
  skillsHighlight: z.array(z.string()).optional().describe('Key skills to highlight'),
  educationHighlight: z.string().optional().describe('Education credentials to emphasize'),
  experienceHighlight: z.array(z.string()).optional().describe('Key experiences to highlight'),

  // Cover letter preferences
  tone: z.enum(['professional', 'enthusiastic', 'confident', 'friendly']).default('professional').describe('The tone of the cover letter'),
  length: z.enum(['concise', 'standard', 'detailed']).default('standard').describe('The desired length of the cover letter'),
  includeCallToAction: z.boolean().default(true).describe('Whether to include a call to action'),

  // Additional context
  companyResearch: z.string().optional().describe('Any research about the company'),
  personalConnection: z.string().optional().describe('Any personal connection or referral'),
  targetKeywords: z.array(z.string()).optional().describe('Keywords to naturally incorporate'),
});
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

// Output schema for cover letter generation
const GenerateCoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter content'),

  sections: z.object({
    salutation: z.string().describe('The greeting/salutation'),
    opening: z.string().describe('The opening paragraph'),
    bodyParagraphs: z.array(z.string()).describe('The main body paragraphs'),
    closing: z.string().describe('The closing paragraph'),
    signature: z.string().describe('The signature block'),
  }).describe('Structured sections of the cover letter'),

  highlights: z.array(z.object({
    type: z.enum(['skill', 'experience', 'education', 'achievement']),
    content: z.string(),
    relevance: z.string().describe('How this highlight relates to the job'),
  })).describe('Key highlights included in the letter'),

  metadata: z.object({
    wordCount: z.number(),
    readingTime: z.number().describe('Estimated reading time in seconds'),
    tone: z.string(),
    keywordsIncluded: z.array(z.string()),
    strengthScore: z.number().min(0).max(100).describe('Overall strength score of the cover letter'),
  }).describe('Metadata about the generated cover letter'),

  suggestions: z.array(z.object({
    type: z.enum(['improvement', 'variation', 'warning']),
    message: z.string(),
  })).optional().describe('Suggestions for improving the cover letter'),
});
export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

const generateCoverLetterPrompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  input: { schema: GenerateCoverLetterInputSchema },
  output: { schema: GenerateCoverLetterOutputSchema },
  prompt: `You are an expert cover letter writer and career coach with extensive experience helping candidates land their dream jobs. Your task is to create a compelling, personalized cover letter that effectively showcases the candidate's qualifications and enthusiasm for the position.

**Position Details:**
Job Title: {{jobTitle}}
Company: {{companyName}}
{{#jobDescription}}Job Description: {{jobDescription}}{{/jobDescription}}

**Resume Content:**
{{resumeText}}

{{#resumeSummary}}
**Professional Summary:**
{{resumeSummary}}
{{/resumeSummary}}

**Writing Parameters:**
- Tone: {{tone}}
- Length: {{length}}
- Include Call to Action: {{includeCallToAction}}

{{#skillsHighlight}}
**Skills to Highlight:**
{{#each skillsHighlight}}
- {{this}}
{{/each}}
{{/skillsHighlight}}

{{#educationHighlight}}
**Education to Emphasize:**
{{educationHighlight}}
{{/educationHighlight}}

{{#experienceHighlight}}
**Experience to Highlight:**
{{#each experienceHighlight}}
- {{this}}
{{/each}}
{{/experienceHighlight}}

{{#companyResearch}}
**Company Research:**
{{companyResearch}}
{{/companyResearch}}

{{#personalConnection}}
**Personal Connection/Referral:**
{{personalConnection}}
{{/personalConnection}}

{{#targetKeywords}}
**Keywords to Include Naturally:**
{{#each targetKeywords}}
- {{this}}
{{/each}}
{{/targetKeywords}}

**Instructions:**

1. **Create a Compelling Cover Letter:**
   - Write a cover letter that grabs attention from the first line
   - Demonstrate clear understanding of the role and company
   - Show genuine enthusiasm and cultural fit
   - Use active voice and strong action verbs
   - Keep paragraphs concise and impactful

2. **Structure Guidelines:**
   - **Salutation**: Professional greeting (use "Dear Hiring Manager" if no specific name)
   - **Opening (1 paragraph)**: Hook the reader with enthusiasm and most relevant qualification
   - **Body (2-3 paragraphs)**: 
     * Connect experience to job requirements
     * Highlight specific achievements with quantifiable results
     * Demonstrate knowledge of company and role
     * Show how you'll add value
   - **Closing (1 paragraph)**: Reiterate interest and include call to action
   - **Signature**: Professional closing with full name

3. **Tone and Style:**
   - Match the tone parameter ({{tone}})
   - For "concise": 250-300 words
   - For "standard": 350-400 words  
   - For "detailed": 450-500 words
   - Use industry-appropriate language
   - Balance professionalism with personality

4. **Content Requirements:**
   - Naturally incorporate provided keywords
   - Emphasize highlighted skills, education, and experience
   - Reference specific job requirements if description provided
   - Include quantifiable achievements where possible
   - Show cultural fit and company knowledge
   - Avoid generic statements - be specific

5. **Quality Checks:**
   - No spelling or grammar errors
   - No repetition from resume (complement, don't duplicate)
   - Strong opening and closing
   - Clear value proposition
   - Appropriate length for parameter

6. **Calculate Metadata:**
   - Count words accurately
   - Estimate reading time (average 200 words per minute)
   - Score strength based on:
     * Relevance to job (40%)
     * Compelling narrative (25%)
     * Specific examples (20%)
     * Professional tone (15%)

Return a complete, ready-to-use cover letter with all required sections and metadata.`,
});

export const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async (input) => {
    const { output } = await generateCoverLetterPrompt(input);
    return output!;
  }
);

