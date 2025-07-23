import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/server/auth/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reviewDoc = await adminDb.collection('reviews').doc(params.reviewId).get();
    
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