// app/api/user/reviews/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/server/auth/firebase-admin';
import { createCachedResponse } from '@/lib/server/cache/route-cache';

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

    // Ensure user can only access their own reviews
    if (params.id !== session.user.uid) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch reviews from Firebase
    const reviewsSnapshot = await adminDb.collection('reviews')
      .where('userId', '==', session.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const reviews = [];
    for (const doc of reviewsSnapshot.docs) {
      const reviewData = { ...doc.data(), id: doc.id };
      
      // Fetch associated resume data
      const resumeDoc = await adminDb.collection('resumes').doc((reviewData as any).resumeId).get();
      if (resumeDoc.exists) {
        const resumeData = resumeDoc.data();
        reviews.push({
          ...reviewData,
          resume: {
            name: resumeData?.name,
            lastModified: resumeData?.lastModified,
          },
        });
      }
    }

    // Transform to match the frontend interface
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      resumeName: review.resume.name,
      submittedDate: (review as any).createdAt?.toDate().toISOString(),
      status: (review as any).status,
      reviewerNotes: (review as any).reviewerNotes,
      completedDate: (review as any).completedAt?.toDate().toISOString(),
      overallScore: (review as any).overallScore,
      commentsCount: (review as any).recommendations?.length || 0,
    }));

    return createCachedResponse({
      success: true,
      reviews: transformedReviews,
    }, {
      maxAge: 60, // 1 minute (reviews update more frequently)
      staleWhileRevalidate: 1800, // 30 minutes
      tags: [`user:${session.user.uid}:reviews`]
    });

  } catch (error) {
    console.error('Get user reviews API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}