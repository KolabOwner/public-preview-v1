// app/api/summarize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateProfessionalSummary, extractExperienceText } from '@/ai/flows/generate-summary';
import { verifyAuthToken } from '@/lib/features/auth/api-middleware';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/features/auth/firebase-config';

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

    // Increment AI generation counter for the user
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let currentAiGenerations = 0;
      let currentMonthlyGenerations = 0;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentAiGenerations = userData.usage?.aiGenerations || 0;
        currentMonthlyGenerations = userData.usage?.monthlyAiGenerations || 0;
      }

      await updateDoc(userDocRef, {
        'usage.aiGenerations': currentAiGenerations + 1,
        'usage.monthlyAiGenerations': currentMonthlyGenerations + 1,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating AI generation count:', error);
      // Don't fail the request if counter update fails
    }

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