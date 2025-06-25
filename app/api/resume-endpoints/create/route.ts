import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/features/auth/firebase-config';
import { verifyIdToken } from '@/lib/features/auth/firebase-admin';
import { FileStatus } from '@/lib/features/pdf/pdf-generator';

interface CreateResumeRequest {
  title: string;
  experience?: string;
  isTargeted?: boolean;
  jobTitle?: string;
  jobDescription?: string;
}


export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decodedToken.uid;
    
    // Parse request body
    const body: CreateResumeRequest = await request.json();
    const { title, experience, isTargeted, jobTitle, jobDescription } = body;
    
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Resume title is required' }, { status: 400 });
    }
    
    
    // Create resume data
    const resumeData: any = {
      title: title.trim(),
      userId,
      experience: experience || '',
      isTargeted: isTargeted || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: FileStatus.UPLOADED
    };
    
    // Add job info if targeted and provided
    if (isTargeted && jobTitle && jobDescription) {
      resumeData.job_info = {
        title: jobTitle,
        description: jobDescription,
        company: '',
        saved_during_upload: true,
        created_at: new Date().toISOString()
      };
    }
    
    // Create resume document
    const docRef = await addDoc(collection(db, 'resumes'), resumeData);
    
    // No need to update resume count on creation anymore
    
    return NextResponse.json(
      { 
        success: true,
        resumeId: docRef.id,
        message: 'Resume created successfully'
      }, 
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}