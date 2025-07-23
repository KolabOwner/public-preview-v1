// ai/flows/resume/review.ts

import { ai } from '@/lib/ai/genkit';
import { z } from 'genkit';

const ReviewResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe('The resume PDF file as a data URI with MIME type and Base64 encoding'),
  reviewerNotes: z
    .string()
    .optional()
    .describe('Additional notes from the user about what to focus on'),
  preserveFormatting: z
    .boolean()
    .default(false)
    .describe('Whether to preserve the original formatting in feedback'),
});

export type ReviewResumeInput = z.infer<typeof ReviewResumeInputSchema>;

const ReviewResumeOutputSchema = z.object({
  overallScore: z.number().min(1).max(10).describe('Overall resume score from 1-10'),
  summary: z.string().describe('Brief summary of the resume review'),
  strengths: z.array(z.string()).describe('List of resume strengths'),
  weaknesses: z.array(z.string()).describe('List of areas for improvement'),
  recommendations: z.array(z.object({
    category: z.string().describe('Category of recommendation (e.g., "Content", "Formatting", "Structure")'),
    priority: z.enum(['high', 'medium', 'low']).describe('Priority level of this recommendation'),
    description: z.string().describe('Detailed description of the recommendation'),
    example: z.string().optional().describe('Example of how to implement this recommendation'),
  })).describe('Specific recommendations for improvement'),
  atsCompatibility: z.object({
    score: z.number().min(1).max(10).describe('ATS compatibility score'),
    issues: z.array(z.string()).describe('ATS-related issues found'),
    suggestions: z.array(z.string()).describe('Suggestions to improve ATS compatibility'),
  }).describe('Assessment of ATS (Applicant Tracking System) compatibility'),
  sectionAnalysis: z.object({
    contactInfo: z.object({
      present: z.boolean(),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    summary: z.object({
      present: z.boolean(),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    experience: z.object({
      present: z.boolean(),
      count: z.number(),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    education: z.object({
      present: z.boolean(),
      count: z.number(),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    skills: z.object({
      present: z.boolean(),
      count: z.number(),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
  }).describe('Detailed analysis of each resume section'),
});

export type ReviewResumeOutput = z.infer<typeof ReviewResumeOutputSchema>;

const reviewResumePrompt = ai.definePrompt({
  name: 'reviewResumePrompt',
  input: { schema: ReviewResumeInputSchema },
  output: { schema: ReviewResumeOutputSchema },
  prompt: `You are an expert resume reviewer with 15+ years of experience in recruitment and career coaching. You will provide a comprehensive, actionable review of this resume.

**REVIEW GUIDELINES:**
1. **Thoroughness**: Analyze every section, formatting choice, and content decision
2. **Actionability**: Provide specific, implementable recommendations
3. **Industry Standards**: Apply current best practices and ATS requirements
4. **Constructive Tone**: Be honest but encouraging, focusing on improvement
5. **Prioritization**: Rank recommendations by impact and importance

**SCORING CRITERIA:**
- **Content Quality (40%)**: Relevance, specificity, achievement focus
- **Structure & Organization (25%)**: Logical flow, section placement, readability
- **Formatting & Design (20%)**: Professional appearance, consistency, ATS compatibility
- **Language & Grammar (15%)**: Clarity, conciseness, error-free writing

**ANALYSIS FRAMEWORK:**

**1. CONTACT INFORMATION**
- Verify all essential contact details are present and professional
- Check for LinkedIn profile and appropriate email format
- Ensure phone number is correctly formatted

**2. SUMMARY/OBJECTIVE**
- Evaluate relevance and impact of opening statement
- Check for specific value proposition and target role clarity
- Assess length and engagement factor

**3. EXPERIENCE SECTION**
- Review job titles, company names, and date formatting
- Analyze bullet points for achievement focus vs. duty listing
- Check for quantifiable results and impact metrics
- Evaluate relevance to target positions

**4. EDUCATION SECTION**
- Verify degree information and formatting consistency
- Check for relevant coursework, honors, or GPA inclusion
- Assess placement relative to experience level

**5. SKILLS SECTION**
- Evaluate skill categorization and relevance
- Check for both hard and soft skills balance
- Assess skill level indicators and organization

**6. ATS COMPATIBILITY**
- Scan for ATS-friendly formatting
- Check for keyword optimization
- Identify potential parsing issues

**SPECIAL CONSIDERATIONS:**
{{#if reviewerNotes}}
**User Notes:** {{reviewerNotes}}
Please pay special attention to the areas mentioned in the user's notes.
{{/if}}

{{#if preserveFormatting}}
**Formatting Preservation:** The user wants to preserve formatting, so focus feedback on content and structure rather than visual changes.
{{/if}}

**PDF INPUT:** {{media url=resumeDataUri}}

**OUTPUT REQUIREMENTS:**
- Provide honest, specific feedback with clear next steps
- Include both positive reinforcement and improvement areas
- Prioritize recommendations by impact
- Ensure all suggestions are actionable and specific
- Focus on helping the candidate stand out to recruiters

Conduct a thorough review and provide your analysis following the schema.`,
});

export const reviewResumeFlow = ai.defineFlow(
  {
    name: 'reviewResumeFlow',
    inputSchema: ReviewResumeInputSchema,
    outputSchema: ReviewResumeOutputSchema,
  },
  async (input) => {
    console.log('🔍 Starting resume review flow');

    try {
      const { output } = await reviewResumePrompt(input);

      if (!output) {
        throw new Error('No output received from review prompt');
      }

      console.log('✅ Resume review completed successfully');
      return output;
    } catch (error) {
      console.error('❌ Resume review failed:', error);
      throw error;
    }
  }
);

// Helper function to be called from API routes
export async function reviewResume(input: ReviewResumeInput): Promise<ReviewResumeOutput> {
  return await reviewResumeFlow(input);
}