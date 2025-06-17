// app/api/resume/parse/route.ts
// API route for parsing resumes from PDF or text

import { NextRequest, NextResponse } from 'next/server';
import {withCORS} from "@/lib/core/api/middleware/cors";
import { FileStatus, enterpriseWrapper } from "@/lib/features/pdf/processor";
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "@/lib/core/auth/firebase-config";
import { parseResumeText } from "@/lib/features/pdf/parsing/parser";


// Increase timeout for API route
export const maxDuration = 300; // 5 minutes timeout
export const dynamic = 'force-dynamic';

// Handle CORS preflight requests
export const OPTIONS = withCORS(async (request: NextRequest) => {
  return new NextResponse(null, { status: 200 });
});

export const POST = withCORS(async (request: NextRequest) => {
  console.log('=== Parse Resume API Called ===');
  const startTime = Date.now();

  try {
    // Check if the request is multipart/form-data (file upload) or JSON (text parsing)
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      return handleFileUpload(request, startTime);
    } else {
      return handleTextParsing(request, startTime);
    }
  } catch (error: any) {
    console.error('Parse endpoint error:', error);
    const elapsed = Date.now() - startTime;

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to parse resume',
        elapsed
      },
      { status: 500 }
    );
  }
});

/**
 * Handle file upload requests
 */
async function handleFileUpload(request: NextRequest, startTime: number) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string || 'anonymous';
    const title = formData.get('title') as string || '';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    console.log(`Processing uploaded PDF: ${file.name} (${file.size} bytes) for user: ${userId}`);
    
    // Create a new resume document
    const resumeData = {
      userId,
      title: title || file.name,
      status: FileStatus.PROCESSING,
      fileName: file.name,
      fileSize: file.size,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'resumes'), resumeData);
    const resumeId = docRef.id;
    
    // Queue the PDF processing job using enterprise wrapper
    const jobResult = await enterpriseWrapper.parseResumeWithEnterprise(
      file,
      userId,
      {
        enableValidation: true,
        enableDLP: true,
        enableRealTimeUpdates: true,
        enableAuditLogging: true
      }
    );
    
    // Return immediately with the resumeId
    return NextResponse.json({
      success: true,
      resumeId,
      message: 'Resume processing started',
      elapsed: Date.now() - startTime
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process file' },
      { status: 500 }
    );
  }
}

/**
 * Handle text parsing requests
 */
async function handleTextParsing(request: NextRequest, startTime: number) {
  try {
    const body = await request.json();
    const { resumeText, userId = 'anonymous', saveToFirebase = true } = body;

    if (!resumeText) {
      return NextResponse.json(
        { success: false, error: 'Resume text is required' },
        { status: 400 }
      );
    }

    if (resumeText.length > 100000) {
      return NextResponse.json(
        { success: false, error: 'Resume text too long. Maximum 100,000 characters.' },
        { status: 400 }
      );
    }

    console.log(`Parsing resume text (${resumeText.length} characters) for user: ${userId}`);

    // Call the parser directly instead of making another API call to ourselves
    const result = await parseResumeText(resumeText, userId, saveToFirebase);

    if (!result || !result.success) {
      throw new Error(result?.error || 'Failed to parse resume');
    }
    
    // Add parsing metadata
    const elapsed = Date.now() - startTime;
    return NextResponse.json({
      ...result,
      elapsed,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Text parsing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to parse resume text' },
      { status: 500 }
    );
  }
}

// GET request for checking the status of a resume processing job
export const GET = withCORS(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const resumeId = url.searchParams.get('resumeId');
    
    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: 'Resume ID is required' },
        { status: 400 }
      );
    }
    
    // Get resume from Firestore
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeDoc = await getDoc(resumeRef);
    
    if (!resumeDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    const resume = {
      id: resumeDoc.id,
      ...resumeDoc.data()
    };
    
    if (!resume) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      resumeId,
      status: resume.status,
      title: resume.title,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      isComplete: resume.status === FileStatus.PROCESSED,
      hasError: resume.status === FileStatus.ERROR,
      error: resume.error
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to check resume status' },
      { status: 500 }
    );
  }
});