// lib/genkit/config-simple.ts
// Simplified GenKit configuration for Next.js compatibility

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini directly without full GenKit (for Next.js compatibility)
let genAI: GoogleGenerativeAI | null = null;

export function initializeGemini() {
  if (!genAI && process.env.GOOGLE_AI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    console.log('Gemini AI initialized');
  }
  return genAI;
}

export function getGeminiModel(modelName: string = 'gemini-2.0-flash') {
  const ai = initializeGemini();
  if (!ai) {
    throw new Error('Google AI not initialized. Please set GOOGLE_AI_API_KEY');
  }
  return ai.getGenerativeModel({ model: modelName });
}