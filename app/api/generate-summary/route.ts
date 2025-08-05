// app/api/generate-summary/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateProfessionalSummary, extractExperienceText } from '@/lib/ai/flows/resume/generate-summary';
import { verifyAuthToken } from '@/lib/server/auth/middleware';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase-config';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
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

    // Increment AI generation counter for the user (optional, don't fail if it errors)
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
      // Log but don't throw - usage tracking is optional
      if (error instanceof Error && error.message.includes('permission-denied')) {
        console.warn('User document permissions insufficient for usage tracking - continuing without counter update');
      } else {
        console.error('Error updating AI generation count:', error);
      }
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