// GET /api/jobs/applications - Get user applications
// POST /api/jobs/applications - Apply to job
// PUT /api/jobs/applications/[id] - Update application status

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/auth/firebase-admin';
import { verifyAuthToken } from '@/lib/server/auth/middleware';
import { 
  JobApplication, 
  ApplicationStatus,
  ApplyToJobRequest
} from '@/types/job-board.types';

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ApplicationStatus | null;
    
    // Use authenticated user's ID instead of trusting query parameter
    const userId = authUser.uid;
    
    let applicationsQuery = adminDb.collection('job_applications')
      .where('userId', '==', userId)
      .orderBy('appliedAt', 'desc');
    
    if (status) {
      applicationsQuery = applicationsQuery.where('status', '==', status);
    }
    
    const snapshot = await applicationsQuery.get();
    const applications: JobApplication[] = [];
    
    for (const docSnap of snapshot.docs) {
      const appData = { id: docSnap.id, ...docSnap.data() } as JobApplication;
      
      // Get job details
      if (appData.jobId) {
        const jobDoc = await adminDb.collection('jobs').doc(appData.jobId).get();
        if (jobDoc.exists) {
          appData.job = { id: jobDoc.id, ...jobDoc.data() } as any;
          
          // Get company info for the job
          if (appData.job?.companyId) {
            const companyDoc = await adminDb.collection('companies').doc(appData.job.companyId).get();
            if (companyDoc.exists) {
              appData.job.company = { id: companyDoc.id, ...companyDoc.data() } as any;
            }
          }
        }
      }
      
      applications.push(appData);
    }
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error getting user applications:', error);
    return NextResponse.json(
      { error: 'Failed to get applications', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { jobId, jobData, ...applicationData }: ApplyToJobRequest & { jobId: string; jobData?: any } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' }, 
        { status: 400 }
      );
    }

    // Use authenticated user's ID
    const userId = authUser.uid;

    // Check if user already applied
    const existingSnapshot = await adminDb.collection('job_applications')
      .where('userId', '==', userId)
      .where('jobId', '==', jobId)
      .get();
    
    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'Already applied to this job' },
        { status: 409 }
      );
    }

    // Store job data in jobs collection if provided and doesn't exist
    if (jobData) {
      const jobDoc = await adminDb.collection('jobs').doc(jobId).get();
      if (!jobDoc.exists) {
        console.log('Storing job data for external job:', jobId);
        const jobToStore = {
          ...jobData,
          id: jobId,
          isExternal: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await adminDb.collection('jobs').doc(jobId).set(jobToStore);
        
        // Also store company data if available
        if (jobData.company && jobData.companyId) {
          const companyDoc = await adminDb.collection('companies').doc(jobData.companyId).get();
          if (!companyDoc.exists) {
            await adminDb.collection('companies').doc(jobData.companyId).set({
              ...jobData.company,
              id: jobData.companyId,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }
    }
    
    const now = new Date();
    const application: Partial<JobApplication> = {
      userId,
      jobId,
      status: ApplicationStatus.APPLIED,
      appliedAt: now as any,
      statusHistory: [{
        status: ApplicationStatus.APPLIED,
        changedAt: now as any,
        notes: 'Initial application'
      }],
      ...applicationData,
      createdAt: now as any,
      updatedAt: now as any
    };
    
    const docRef = await adminDb.collection('job_applications').add(application);
    
    // Update user's application stats
    await updateUserStats(userId);
    
    const createdApplication = { id: docRef.id, ...application } as JobApplication;
    
    return NextResponse.json(createdApplication, { status: 201 });
  } catch (error) {
    console.error('Error applying to job:', error);
    return NextResponse.json(
      { error: 'Failed to apply to job', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to update user application statistics
async function updateUserStats(userId: string) {
  try {
    const snapshot = await adminDb.collection('job_applications')
      .where('userId', '==', userId)
      .get();
    const stats = {
      totalApplications: 0,
      saved: 0,
      applied: 0,
      interviewing: 0,
      rejected: 0,
      offered: 0
    };
    
    snapshot.docs.forEach(docSnap => {
      const status = docSnap.data().status;
      stats.totalApplications++;
      const statusKey = status.toLowerCase();
      if (statusKey in stats) {
        (stats as any)[statusKey]++;
      }
    });
    
    // Get saved jobs count
    const savedSnapshot = await adminDb.collection('saved_jobs')
      .where('userId', '==', userId)
      .get();
    stats.saved = savedSnapshot.size;
    
    await adminDb.collection('users').doc(userId).update({
      applicationStats: stats,
      updatedAt: new Date()
    });
    
    return stats;
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}