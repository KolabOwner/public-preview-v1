// app/api/resume-endpoints/analyze-keywords/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/features/auth/firebase-config';
import { analyzeKeywords, extractResumeTextSimple } from '@/ai/flows/analyze-keywords';

interface AnalyzeRequest {
  resumeId: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  jobCompany?: string;
}

interface AnalyzeResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// POST - Analyze keywords for a resume against a job
export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { resumeId, userId, jobTitle, jobDescription, jobCompany } = body;

    // Validate required fields
    if (!resumeId || !userId || !jobTitle || !jobDescription) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: resumeId, userId, jobTitle, jobDescription'
      }, { status: 400 });
    }

    // Get resume data
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);
    
    if (!resumeSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Resume not found'
      }, { status: 404 });
    }

    // Verify user owns the resume
    const resumeData = resumeSnap.data();
    if (resumeData.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 });
    }

    // Extract resume text
    const resumeText = extractResumeTextSimple(resumeData);

    // Perform keyword analysis
    console.log('[AnalyzeKeywords] Starting analysis for resume:', resumeId);
    const analysisResult = await analyzeKeywords({
      resumeText,
      jobTitle,
      jobDescription
    });

    // Save job info and analysis results to Firebase
    const jobInfo = {
      title: jobTitle,
      description: jobDescription,
      company: jobCompany || '',
      analyzed_at: new Date().toISOString(),
      atsScore: analysisResult.atsScore,
      matchedKeywords: analysisResult.matchedKeywords,
      missingKeywords: analysisResult.missingKeywords,
      allJobKeywords: analysisResult.allJobKeywords,
    };

    await updateDoc(resumeRef, {
      job_info: jobInfo,
      'metadata.lastModified': new Date().toISOString()
    });

    console.log('[AnalyzeKeywords] Analysis complete. Score:', analysisResult.atsScore);

    return NextResponse.json({
      success: true,
      data: {
        atsScore: analysisResult.atsScore,
        matchedKeywords: analysisResult.matchedKeywords,
        missingKeywords: analysisResult.missingKeywords,
        totalJobKeywords: analysisResult.allJobKeywords.length,
        matchedCount: analysisResult.matchedKeywords.length,
        missingCount: analysisResult.missingKeywords.length,
      }
    });

  } catch (error) {
    console.error('[AnalyzeKeywords] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze keywords'
    }, { status: 500 });
  }
}

// GET - Check if job info exists for a resume
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');
    const userId = searchParams.get('userId');

    if (!resumeId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing resumeId or userId'
      }, { status: 400 });
    }

    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);
    
    if (!resumeSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Resume not found'
      }, { status: 404 });
    }

    const resumeData = resumeSnap.data();
    if (resumeData.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 });
    }

    const jobInfo = resumeData.job_info;
    const hasJobInfo = !!(jobInfo?.title && jobInfo?.description);

    return NextResponse.json({
      success: true,
      data: {
        hasJobInfo,
        jobInfo: hasJobInfo ? {
          title: jobInfo.title,
          company: jobInfo.company || '',
          description: jobInfo.description,
          atsScore: jobInfo.atsScore,
          analyzedAt: jobInfo.analyzed_at,
          matchedCount: jobInfo.matchedKeywords?.length || 0,
          missingCount: jobInfo.missingKeywords?.length || 0,
        } : null,
        // Include full analysis data if available
        analysisData: hasJobInfo && jobInfo.matchedKeywords ? {
          atsScore: jobInfo.atsScore,
          matchedKeywords: jobInfo.matchedKeywords,
          missingKeywords: jobInfo.missingKeywords,
          totalJobKeywords: jobInfo.allJobKeywords?.length || 0,
          matchedCount: jobInfo.matchedKeywords?.length || 0,
          missingCount: jobInfo.missingKeywords?.length || 0,
        } : null
      }
    });

  } catch (error) {
    console.error('[AnalyzeKeywords] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check job info'
    }, { status: 500 });
  }
}

// DELETE - Clear job info for a resume
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');
    const userId = searchParams.get('userId');

    if (!resumeId || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing resumeId or userId'
      }, { status: 400 });
    }

    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);
    
    if (!resumeSnap.exists()) {
      return NextResponse.json({
        success: false,
        error: 'Resume not found'
      }, { status: 404 });
    }

    const resumeData = resumeSnap.data();
    if (resumeData.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 });
    }

    await updateDoc(resumeRef, {
      job_info: null,
      'metadata.lastModified': new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Job info cleared successfully' }
    });

  } catch (error) {
    console.error('[AnalyzeKeywords] DELETE Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear job info'
    }, { status: 500 });
  }
}