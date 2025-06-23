// app/api/resume/analyze-enterprise/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/features/auth/firebase-config';
import { analyzeEnterprise, extractResumeText, calculateATSScore } from '@/ai/flows/analyze-enterprise';
import type { 
  JobData, 
  AnalyzeOptions,
  JobAssociationResult,
  ATSAnalysisResult,
  StatusResult,
  OptimizationResult,
  AnalyzeResponse,
  ExtractedKeyword,
  MatchedKeyword,
  MissingKeyword,
  KeywordRecommendation
} from '@/lib/features/api/analyze';

// Response helper
function createResponse<T>(data: T, success = true, error?: string, elapsed?: number): AnalyzeResponse<T> {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : error,
    enterpriseEnabled: true,
    elapsed
  };
}

// Enhanced error handling
function handleError(error: any, action: string): NextResponse<AnalyzeResponse> {
  console.error(`Error in ${action}:`, error);
  const message = error instanceof Error ? error.message : `Failed to ${action}`;
  return NextResponse.json(createResponse(null, false, message), { status: 500 });
}

// Transform Genkit output to API format
function transformGenkitToAPI(genkitResult: any): {
  extractedKeywords: ExtractedKeyword[];
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
  recommendations: KeywordRecommendation[];
  atsScore: number;
  breakdown: any;
} {
  return {
    extractedKeywords: genkitResult.extractedKeywords || [],
    matchedKeywords: genkitResult.matchedKeywords || [],
    missingKeywords: genkitResult.missingKeywords || [],
    recommendations: genkitResult.recommendations || [],
    atsScore: genkitResult.atsScore || 0,
    breakdown: genkitResult.breakdown || {
      keywordMatch: 0,
      skillsAlignment: 0,
      experienceRelevance: 0,
      educationMatch: 0,
      formatting: 0
    }
  };
}

// POST - Handle job association and analysis
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { action, resumeId, userId } = body;

    if (!resumeId || !userId) {
      return NextResponse.json(
        createResponse(null, false, 'Missing resumeId or userId'),
        { status: 400 }
      );
    }

    switch (action) {
      case 'associate':
        return await handleJobAssociation(body, startTime);
      
      case 'analyze':
        return await handleATSAnalysis(body, startTime);
      
      case 'batch':
        return await handleBatchProcessing(body, startTime);
      
      case 'optimize':
        return await handleOptimization(body, startTime);
      
      case 'reanalyze':
        return await handleReanalysis(body, startTime);
      
      case 'clear':
        return await handleClearAnalysis(body, startTime);
      
      default:
        return NextResponse.json(
          createResponse(null, false, `Unknown action: ${action}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return handleError(error, 'process request');
  }
}

// GET - Handle status, analytics, and history requests
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const resumeId = searchParams.get('resumeId');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        createResponse(null, false, 'Missing userId'),
        { status: 400 }
      );
    }

    switch (action) {
      case 'status':
        if (!resumeId) {
          return NextResponse.json(
            createResponse(null, false, 'Missing resumeId for status'),
            { status: 400 }
          );
        }
        return await handleGetStatus(resumeId, userId, startTime);
      
      case 'analytics':
        return await handleGetAnalytics(userId, resumeId, startTime);
      
      case 'history':
        return await handleGetHistory(userId, resumeId, startTime);
      
      default:
        return NextResponse.json(
          createResponse(null, false, `Unknown action: ${action}`),
          { status: 400 }
        );
    }
  } catch (error) {
    return handleError(error, 'process GET request');
  }
}

// Job Association Handler
async function handleJobAssociation(body: any, startTime: number): Promise<NextResponse> {
  const { resumeId, userId, jobData, industryContext, targetATSScore } = body;

  try {
    // Get resume data
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);
    
    if (!resumeSnap.exists()) {
      return NextResponse.json(
        createResponse(null, false, 'Resume not found'),
        { status: 404 }
      );
    }

    const resumeData = resumeSnap.data();
    const resumeText = extractResumeText(resumeData);

    // Perform comprehensive analysis using Genkit
    const analysisResult = await analyzeEnterprise({
      resumeText,
      jobTitle: jobData.title,
      jobDescription: jobData.description,
      jobCompany: jobData.company,
      industryContext,
      targetATSScore,
      includeRecommendations: true
    });

    // Transform result to API format
    const transformed = transformGenkitToAPI(analysisResult);

    // Save job association and analysis to Firebase
    const jobInfo = {
      title: jobData.title,
      company: jobData.company,
      description: jobData.description,
      url: jobData.url,
      keywords: transformed.extractedKeywords,
      atsScore: transformed.atsScore,
      breakdown: transformed.breakdown,
      matchedKeywords: transformed.matchedKeywords,
      missingKeywords: transformed.missingKeywords,
      recommendations: transformed.recommendations,
      summary: analysisResult.summary,
      updated_at: new Date().toISOString(),
      analyzed_at: new Date().toISOString()
    };

    await updateDoc(resumeRef, {
      job_info: jobInfo,
      ats_analysis: {
        score: transformed.atsScore,
        breakdown: transformed.breakdown,
        last_analyzed: new Date().toISOString()
      }
    });

    const result: JobAssociationResult = {
      success: true,
      associationId: `${resumeId}_${Date.now()}`,
      keywordAnalysis: {
        keywords: transformed.extractedKeywords,
        skills: transformed.extractedKeywords.filter(k => k.category === 'skill'),
        requirements: transformed.missingKeywords.map(k => k.keyword),
        metadata: {
          method: 'advanced',
          processingTime: Date.now() - startTime,
          cacheHit: false
        }
      },
      atsAnalysis: {
        atsScore: transformed.atsScore,
        breakdown: transformed.breakdown,
        matchedKeywords: transformed.matchedKeywords,
        missingKeywords: transformed.missingKeywords,
        recommendations: transformed.recommendations
      },
      jobData: {
        ...jobData,
        keywords: transformed.extractedKeywords
      }
    };

    return NextResponse.json(
      createResponse(result, true, undefined, Date.now() - startTime)
    );

  } catch (error) {
    return handleError(error, 'associate job');
  }
}

// ATS Analysis Handler
async function handleATSAnalysis(body: any, startTime: number): Promise<NextResponse> {
  const { resumeId, userId, includeRecommendations = true, targetScore = 80 } = body;

  try {
    // Get resume with job association
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);
    
    if (!resumeSnap.exists()) {
      return NextResponse.json(
        createResponse(null, false, 'Resume not found'),
        { status: 404 }
      );
    }

    const resumeData = resumeSnap.data();
    
    if (!resumeData.job_info) {
      return NextResponse.json(
        createResponse(null, false, 'No job associated with resume. Please associate a job first.'),
        { status: 400 }
      );
    }

    const resumeText = extractResumeText(resumeData);
    const jobInfo = resumeData.job_info;

    // Perform analysis
    const analysisResult = await analyzeEnterprise({
      resumeText,
      jobTitle: jobInfo.title,
      jobDescription: jobInfo.description,
      jobCompany: jobInfo.company,
      targetATSScore: targetScore,
      includeRecommendations
    });

    const transformed = transformGenkitToAPI(analysisResult);

    // Update resume with new analysis
    await updateDoc(resumeRef, {
      'job_info.atsScore': transformed.atsScore,
      'job_info.breakdown': transformed.breakdown,
      'job_info.matchedKeywords': transformed.matchedKeywords,
      'job_info.missingKeywords': transformed.missingKeywords,
      'job_info.recommendations': transformed.recommendations,
      'job_info.summary': analysisResult.summary,
      'job_info.analyzed_at': new Date().toISOString(),
      'ats_analysis.score': transformed.atsScore,
      'ats_analysis.breakdown': transformed.breakdown,
      'ats_analysis.last_analyzed': new Date().toISOString()
    });

    const result: ATSAnalysisResult = {
      atsScore: transformed.atsScore,
      breakdown: transformed.breakdown,
      matchedKeywords: transformed.matchedKeywords,
      missingKeywords: transformed.missingKeywords,
      recommendations: transformed.recommendations
    };

    return NextResponse.json(
      createResponse(result, true, undefined, Date.now() - startTime)
    );

  } catch (error) {
    return handleError(error, 'analyze ATS');
  }
}

// Status Handler
async function handleGetStatus(resumeId: string, userId: string, startTime: number): Promise<NextResponse> {
  try {
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);
    
    if (!resumeSnap.exists()) {
      return NextResponse.json(
        createResponse(null, false, 'Resume not found'),
        { status: 404 }
      );
    }

    const resumeData = resumeSnap.data();
    const jobInfo = resumeData.job_info;
    const atsAnalysis = resumeData.ats_analysis;

    const result: StatusResult = {
      resumeId,
      hasJobAssociated: !!jobInfo,
      jobInfo: jobInfo ? {
        title: jobInfo.title,
        company: jobInfo.company,
        description: jobInfo.description,
        keywords: jobInfo.keywords || [],
        updated_at: jobInfo.updated_at,
        parsedData: {
          skills: jobInfo.keywords?.filter((k: any) => k.category === 'skill') || [],
          requirements: jobInfo.missingKeywords?.map((k: any) => k.keyword) || []
        }
      } : null,
      keywordCount: jobInfo?.keywords?.length || 0,
      atsScore: atsAnalysis?.score || jobInfo?.atsScore,
      lastAnalyzed: atsAnalysis?.last_analyzed || jobInfo?.analyzed_at,
      recommendations: jobInfo?.recommendations?.length || 0
    };

    return NextResponse.json(
      createResponse(result, true, undefined, Date.now() - startTime)
    );

  } catch (error) {
    return handleError(error, 'get status');
  }
}

// Placeholder handlers for other endpoints
async function handleBatchProcessing(body: any, startTime: number): Promise<NextResponse> {
  // TODO: Implement batch processing
  return NextResponse.json(
    createResponse({ message: 'Batch processing not yet implemented' }, false, 'Not implemented'),
    { status: 501 }
  );
}

async function handleOptimization(body: any, startTime: number): Promise<NextResponse> {
  // TODO: Implement optimization suggestions
  return NextResponse.json(
    createResponse({ message: 'Optimization not yet implemented' }, false, 'Not implemented'),
    { status: 501 }
  );
}

async function handleReanalysis(body: any, startTime: number): Promise<NextResponse> {
  // Reuse the analyze handler
  return handleATSAnalysis(body, startTime);
}

async function handleClearAnalysis(body: any, startTime: number): Promise<NextResponse> {
  const { resumeId, userId } = body;

  try {
    const resumeRef = doc(db, 'resumes', resumeId);
    await updateDoc(resumeRef, {
      job_info: null,
      ats_analysis: null
    });

    return NextResponse.json(
      createResponse({ success: true }, true, undefined, Date.now() - startTime)
    );
  } catch (error) {
    return handleError(error, 'clear analysis');
  }
}

async function handleGetAnalytics(userId: string, resumeId: string | null, startTime: number): Promise<NextResponse> {
  // TODO: Implement analytics
  return NextResponse.json(
    createResponse({ message: 'Analytics not yet implemented' }, false, 'Not implemented'),
    { status: 501 }
  );
}

async function handleGetHistory(userId: string, resumeId: string | null, startTime: number): Promise<NextResponse> {
  // TODO: Implement history
  return NextResponse.json(
    createResponse({ message: 'History not yet implemented' }, false, 'Not implemented'),
    { status: 501 }
  );
}