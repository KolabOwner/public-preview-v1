// lib/genkit/config.ts
// GenKit configuration and initialization

import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';
import { logger } from '@genkit-ai/core/logging';
import { defineFlow } from '@genkit-ai/flow';

// Import flows
import analyzeResumeFlow from './flows/analyze-resume';

// Configure GenKit
export async function initializeGenKit() {
  try {
    configureGenkit({
      plugins: [
        // Google AI plugin for Gemini models
        googleAI({
          apiKey: process.env.GOOGLE_AI_API_KEY,
        }),
        // Firebase plugin for authentication and storage
        firebase({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          // Use Firebase Admin SDK if available
          ...((process.env.FIREBASE_ADMIN_SDK_PATH) && {
            serviceAccountKeyPath: process.env.FIREBASE_ADMIN_SDK_PATH,
          }),
        }),
      ],
      // Enable flow server for development
      flowStateStore: process.env.NODE_ENV === 'development' ? 'firebase' : undefined,
      logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      // Enable tracing for performance monitoring
      enableTracing: true,
    });

    logger.info('GenKit initialized successfully');
    
    // Register flows
    await registerFlows();
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize GenKit:', error);
    throw error;
  }
}

// Register all flows
async function registerFlows() {
  // The flows are already defined with defineFlow, just need to log registration
  logger.info('Registered flow: analyzeResume');
  
  // Add more flows here as they are created
}

// Helper to run flows with error handling
export async function runGenKitFlow<TInput, TOutput>(
  flowName: string,
  input: TInput
): Promise<TOutput> {
  try {
    logger.info(`Running flow: ${flowName}`);
    
    switch (flowName) {
      case 'analyzeResume':
        return await analyzeResumeFlow(input) as any;
      default:
        throw new Error(`Unknown flow: ${flowName}`);
    }
  } catch (error) {
    logger.error(`Flow ${flowName} failed:`, error);
    throw error;
  }
}

// Export flow references
export const flows = {
  analyzeResume: analyzeResumeFlow,
};

// Export types
export type { AnalyzeResumeForATSInput, AnalyzeResumeForATSOutput } from './schemas/ats-analysis';