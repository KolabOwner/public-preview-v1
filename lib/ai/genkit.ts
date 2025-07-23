// ai/genkit.ts

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest',
  // Disable telemetry in production
  telemetry: {
    instrumentation: process.env.NODE_ENV === 'production' ? 'none' : 'auto',
    logger: process.env.NODE_ENV === 'production' ? 'none' : 'auto',
  },
});
