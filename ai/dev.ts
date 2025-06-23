import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-ats.ts';
import '@/ai/flows/analyze-enterprise.ts';
import '@/ai/flows/extract-resume-data.ts';
import '@/ai/flows/generate-summary.ts';
import '@/ai/flows/summarize-resume.ts';
