// lib/features/api/summary.ts
import { auth } from '@/lib/features/auth/firebase-config';

interface GenerateSummaryParams {
  resumeData: any;
  targetPosition?: string;
  skillsHighlight?: string;
  existingSummary?: string;
}

interface GenerateSummaryResponse {
  success: boolean;
  summary: string;
  alternatives?: string[];
  timestamp: string;
  error?: string;
}

/**
 * Generate a professional summary using AI
 * Calls the /api/summarize endpoint which uses Genkit AI
 */
export async function generateSummaryAPI(params: GenerateSummaryParams): Promise<GenerateSummaryResponse> {
  try {
    // Get the current user's ID token for authentication
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const idToken = await user.getIdToken();

    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate summary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling summary API:', error);
    throw error;
  }
}

/**
 * Regenerate summary with new parameters
 */
export async function regenerateSummaryAPI(params: GenerateSummaryParams): Promise<GenerateSummaryResponse> {
  // Add a small modification to trigger different output
  return generateSummaryAPI({
    ...params,
    existingSummary: (params.existingSummary || '') + ' ',
  });
}