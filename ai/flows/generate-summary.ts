// ai/flows/generate-summary.ts
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const generateSummaryInputSchema = z.object({
  existingExperience: z.string().describe('The user\'s work experience and background'),
  targetPosition: z.string().optional().describe('The target job position'),
  skillsHighlight: z.string().optional().describe('Skills to emphasize in the summary'),
  existingSummary: z.string().optional().describe('Existing summary to improve upon'),
});

const generateSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated professional summary'),
  alternativeVersions: z.array(z.string()).optional().describe('Alternative summary versions'),
});

export type GenerateSummaryInput = z.infer<typeof generateSummaryInputSchema>;
export type GenerateSummaryOutput = z.infer<typeof generateSummaryOutputSchema>;

const generateSummaryPrompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: { schema: generateSummaryInputSchema },
  output: { schema: generateSummaryOutputSchema },
  prompt: `You are an expert resume writer. Generate a professional summary for a resume based on the following information:

Work Experience and Background:
{{existingExperience}}

{{#targetPosition}}Target Position: {{targetPosition}}{{/targetPosition}}
{{#skillsHighlight}}Skills to Emphasize: {{skillsHighlight}}{{/skillsHighlight}}
{{#existingSummary}}Current Summary (to improve): {{existingSummary}}{{/existingSummary}}

Guidelines:
- Write 2-4 sentences that are concise and impactful
- Highlight relevant experience and achievements
- Include quantifiable results where possible
- Tailor the summary to the target position if provided
- Use strong action words and professional language
- Avoid generic phrases and clichés
- Make it unique and memorable

Generate a primary professional summary and 2 alternative versions in the specified JSON format.`,
});

export const generateProfessionalSummary = ai.defineFlow(
  {
    name: 'generateProfessionalSummary',
    inputSchema: generateSummaryInputSchema,
    outputSchema: generateSummaryOutputSchema,
  },
  async (input) => {
    'use server';
    const { output } = await generateSummaryPrompt(input);
    return output!;
  }
);

// Helper function to extract experience text from resume data
export function extractExperienceText(resumeData: any): string {
  const experiences = [];

  // Extract work experiences
  if (resumeData.workExperience) {
    for (const exp of resumeData.workExperience) {
      experiences.push(`${exp.position} at ${exp.company} (${exp.duration}): ${exp.description}`);
    }
  }

  // Extract education
  if (resumeData.education) {
    for (const edu of resumeData.education) {
      experiences.push(`${edu.degree} from ${edu.institution}`);
    }
  }

  // Extract skills
  if (resumeData.skills) {
    experiences.push(`Skills: ${resumeData.skills.join(', ')}`);
  }

  return experiences.join('\n');
}