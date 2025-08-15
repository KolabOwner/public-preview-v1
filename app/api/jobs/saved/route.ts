// GET /api/jobs/saved - Get user's saved jobs
// POST /api/jobs/saved - Save a job
// DELETE /api/jobs/saved - Remove saved job

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/server/auth/firebase-admin';
import { SavedJob } from '../../../../types/job-board.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    const snapshot = await adminDb.collection('saved_jobs')
      .where('userId', '==', userId)
      .orderBy('savedAt', 'desc')
      .get();
    const savedJobs: SavedJob[] = [];
    
    for (const docSnap of snapshot.docs) {
      const savedData = { id: docSnap.id, ...docSnap.data() } as SavedJob;
      
      // Get job details
      if (savedData.jobId) {
        const jobDoc = await adminDb.collection('jobs').doc(savedData.jobId).get();
        if (jobDoc.exists) {
          savedData.job = { id: jobDoc.id, ...jobDoc.data() } as any;
          
          // Get company info for the job
          if (savedData.job.companyId) {
            const companyDoc = await adminDb.collection('companies').doc(savedData.job.companyId).get();
            if (companyDoc.exists) {
              savedData.job.company = { id: companyDoc.id, ...companyDoc.data() } as any;
            }
          }
        }
      }
      
      savedJobs.push(savedData);
    }
    
    return NextResponse.json(savedJobs);
  } catch (error) {
    console.error('Error getting saved jobs:', error);
    return NextResponse.json(
      { error: 'Failed to get saved jobs', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, jobId, notes = '' }: { userId: string; jobId: string; notes?: string } = await request.json();

    if (!userId || !jobId) {
      return NextResponse.json(
        { error: 'User ID and Job ID are required' }, 
        { status: 400 }
      );
    }

    // Check if already saved
    const existingSnapshot = await adminDb.collection('saved_jobs')
      .where('userId', '==', userId)
      .where('jobId', '==', jobId)
      .get();
    
    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'Job already saved' },
        { status: 409 }
      );
    }
    
    const savedJob: Partial<SavedJob> = {
      userId,
      jobId,
      notes,
      savedAt: new Date() as any
    };
    
    const docRef = await adminDb.collection('saved_jobs').add(savedJob);
    
    // TODO: Update user stats - would need shared utility
    
    const createdSavedJob = { id: docRef.id, ...savedJob } as SavedJob;
    
    return NextResponse.json(createdSavedJob, { status: 201 });
  } catch (error) {
    console.error('Error saving job:', error);
    return NextResponse.json(
      { error: 'Failed to save job', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');

    if (!userId || !jobId) {
      return NextResponse.json(
        { error: 'User ID and Job ID are required' }, 
        { status: 400 }
      );
    }

    const snapshot = await adminDb.collection('saved_jobs')
      .where('userId', '==', userId)
      .where('jobId', '==', jobId)
      .get();
    
    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Saved job not found' },
        { status: 404 }
      );
    }
    
    await snapshot.docs[0].ref.delete();
    
    // TODO: Update user stats - would need shared utility
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing saved job:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved job', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}