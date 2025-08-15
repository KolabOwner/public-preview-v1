import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, adminDb } from '@/lib/server/auth/firebase-admin';
import { FileStatus } from '@/lib/server/services/resume/pdf-generator';

interface CreateResumeRequest {
  title: string;
  experience?: string;
  isTargeted?: boolean;
  jobTitle?: string;
  jobDescription?: string;
}

export async function GET(request: NextRequest) {
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
    
    // Fetch user's resumes using admin SDK
    const querySnapshot = await adminDb
      .collection('resumes')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();
    const resumes: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      resumes.push({
        id: doc.id,
        title: data.title,
        lastUpdated: data.updatedAt || data.createdAt,
        createdAt: data.createdAt,
        isTargeted: data.isTargeted || false,
        objective: data.objective || '',
        summary: data.summary || '',
        folderId: data.folderId || null
      });
    });

    return NextResponse.json({ resumes }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
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
    
    
    // Create resume data with default professional template settings
    const resumeData: any = {
      title: title.trim(),
      userId,
      experience: experience || '',
      isTargeted: isTargeted || false,
      status: FileStatus.UPLOADED,
      // Initialize with professional template by default
      documentSettings: {
        zoom: 120,
        fontFamily: 'Merriweather',
        primaryColor: '#000000',
        textColor: '#000000',
        fontSize: 11,
        lineHeight: 1.2,
        sectionSpacing: 0.75,
        paperSize: 'Letter',
        margins: {
          top: 0.75,
          right: 0.75,
          bottom: 0.75,
          left: 0.75,
        },
        showIcons: false,
        showDividers: true,
        useIndent: false,
        viewAsPages: true,
        template: 'professional',
        lastUpdated: new Date().toISOString(),
        version: 1,
      }
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
    
    // Create resume document using admin SDK
    const docRef = await adminDb.collection('resumes').add({
      ...resumeData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

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