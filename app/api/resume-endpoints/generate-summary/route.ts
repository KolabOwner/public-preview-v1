// app/api/generate-summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateProfessionalSummary, extractExperienceText } from '@/ai/flows/generate-summary';
import { verifyAuthToken } from '@/lib/features/auth/api-middleware';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (optional but recommended)
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      resumeData,
      targetPosition,
      skillsHighlight,
      existingSummary
    } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Extract experience text from resume data
    const experienceText = extractExperienceText(resumeData);

    if (!experienceText) {
      return NextResponse.json(
        { error: 'No experience data found in resume' },
        { status: 400 }
      );
    }

    // Generate summary using Genkit
    const result = await generateProfessionalSummary({
      existingExperience: experienceText,
      targetPosition,
      skillsHighlight,
      existingSummary,
    });

    return NextResponse.json({
      success: true,
      summary: result.summary,
      alternatives: result.alternativeVersions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}