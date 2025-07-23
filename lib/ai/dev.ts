// ai/dev.ts

import { config } from 'dotenv';
config();

// resume flows

import '@/lib/ai/flows/resume/analyze-ats.ts';
import '@/lib/ai/flows/resume/generate.ts';
import '@/lib/ai/flows/resume/generate-summary.ts'

// cover letter flows

import '@/lib/ai/flows/cover-letter/generate.ts';
