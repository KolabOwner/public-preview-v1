// app/api/resume/review/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { reviewResume } from '@/lib/ai/flows/resume/review';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/server/auth/firebase-admin';


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let reviewId: string | null = null;
  
  try {
    // Authentication check
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewerNotes, preserveFormatting } = body;
    const resumeId = params.id;

    // Fetch resume from database
    const resumeDoc = await adminDb.collection('resumes').doc(resumeId).get();
    
    if (!resumeDoc.exists) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    const resumeData = resumeDoc.data();
    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    // Type assertion for Firebase document data
    const resume = resumeData as any;
    
    // Ensure user owns this resume
    if (resume.userId !== session.user.uid) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Create review record
    const reviewRef = adminDb.collection('reviews').doc();
    reviewId = reviewRef.id; // Store for error handling
    
    await reviewRef.set({
      resumeId,
      userId: session.user.uid,
      status: 'PROCESSING',
      reviewerNotes,
      preserveFormatting,
      createdAt: new Date(),
    });

    // Process the review using AI
    const reviewResult = await reviewResume({
      resumeDataUri: resume.dataUri,
      reviewerNotes,
      preserveFormatting,
    });

    // Update review record with results
    await adminDb.collection('reviews').doc(reviewId).update({
      status: 'COMPLETED',
      overallScore: reviewResult.overallScore,
      summary: reviewResult.summary,
      strengths: reviewResult.strengths,
      weaknesses: reviewResult.weaknesses,
      recommendations: reviewResult.recommendations,
      atsCompatibility: reviewResult.atsCompatibility,
      sectionAnalysis: reviewResult.sectionAnalysis,
      completedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      reviewId: reviewId,
      message: 'Review completed successfully',
    });

  } catch (error) {
    console.error('Resume review API error:', error);

    // Try to mark review as failed if we have a review ID
    if (reviewId) {
      try {
        await adminDb.collection('reviews').doc(reviewId).update({
          status: 'FAILED',
        });
      } catch (updateError) {
        console.error('Failed to update review status:', updateError);
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch review results
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const reviewId = url.searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const reviewDoc = await adminDb.collection('reviews').doc(reviewId).get();
    
    if (!reviewDoc.exists) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    const reviewData = reviewDoc.data();
    
    if (!reviewData) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Ensure user owns this review
    if (reviewData.userId !== session.user.uid) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Fetch associated resume data
    const resumeDoc = await adminDb.collection('resumes').doc(reviewData.resumeId).get();
    const resumeData = resumeDoc.exists ? resumeDoc.data() : null;
    
    const review = {
      id: reviewDoc.id,
      ...reviewData,
      resume: resumeData ? {
        name: resumeData.name,
        lastModified: resumeData.lastModified,
      } : null,
    };


    return NextResponse.json({
      success: true,
      review,
    });

  } catch (error) {
    console.error('Get review API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}