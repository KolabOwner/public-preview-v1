// PUT /api/jobs/applications/[id] - Update application status

import { NextRequest, NextResponse } from 'next/server';
import { 
  getDoc,
  doc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../../../../config/firebase-config';
import { 
  ApplicationStatus,
  UpdateApplicationStatusRequest
} from '../../../../../types/job-board.types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const { status, notes = '' }: UpdateApplicationStatusRequest = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' }, 
        { status: 400 }
      );
    }

    const appDoc = await getDoc(doc(db, 'job_applications', applicationId));
    
    if (!appDoc.exists()) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    const currentData = appDoc.data();
    const statusHistory = currentData.statusHistory || [];
    
    statusHistory.push({
      status,
      changedAt: Timestamp.now(),
      notes
    });
    
    const updateData = {
      status,
      statusHistory,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(doc(db, 'job_applications', applicationId), updateData);
    
    // Update user stats (import from applications route or create shared utility)
    // This would require creating a shared utilities file
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update application status', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}