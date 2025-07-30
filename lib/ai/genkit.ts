// ai/genkit.ts

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest',
});

// Optimized model configs for resume parsing
export const resumeParsingConfig = {
  model: 'googleai/gemini-1.5-flash-latest',
  config: {
    temperature: 0.1, // Low temperature for consistent extraction
    maxOutputTokens: 8192, // Increased output limit
    timeout: 45000, // 45 second timeout
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH', 
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
};

// Fast parsing config for simpler resumes
export const fastParsingConfig = {
  model: 'googleai/gemini-1.5-flash-latest',
  config: {
    temperature: 0,
    maxOutputTokens: 4096,
    timeout: 20000, // 20 second timeout for fast path
  },
};
