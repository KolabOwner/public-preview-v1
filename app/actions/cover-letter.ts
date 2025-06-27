// src/app/actions/cover-letter.ts
'use server';

import { generateCoverLetterFlow } from '@/ai/flows/generate-cover-letter';
import type { GenerateCoverLetterInput, GenerateCoverLetterOutput } from '@/ai/flows/generate-cover-letter';

export async function generateCoverLetter(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterOutput> {
  try {
    const result = await generateCoverLetterFlow(input);
    return result;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter');
  }
}