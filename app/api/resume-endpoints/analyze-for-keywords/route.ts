// app/api/resume/analyze-for-keywords/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, limit, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/features/auth/firebase-config';
import { analyzeEnterprise, extractResumeText } from '@/ai/flows/analyze-enterprise';

// Core Types
interface BaseRequest {
  resumeId: string;
  userId: string;
}

interface JobData {
  title: string;
  description: string;
  company?: string;
  url?: string;
}

interface AnalysisResult {
  atsScore: number;
  breakdown: {
    keywordMatch: number;
    skillsAlignment: number;
    experienceRelevance: number;
    educationMatch: number;
    formatting: number;
  };
  matchedKeywords: Array<{
    keyword: string;
    category: string;
    importance: string;
    context?: string;
  }>;
  missingKeywords: Array<{
    keyword: string;
    category: string;
    importance: string;
  }>;
  summary?: string;
}

interface HistoryItem {
  id: string;
  resumeId: string;
  userId: string;
  jobTitle: string;
  jobCompany: string;
  atsScore: number;
  timestamp: string;
}

// Response wrapper
function createResponse<T>(
  data: T | null,
  success = true,
  error?: string,
  elapsed?: number
): NextResponse {
  const response = {
    success,
    ...(success ? { data } : { error: error || 'An error occurred' }),
    timestamp: new Date().toISOString(),
    ...(elapsed && { elapsed })
  };

  return NextResponse.json(response, {
    status: success ? 200 : 400,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}

// Validate request middleware
async function validateRequest(
  request: { resumeId: string; userId: string }
): Promise<{ valid: boolean; error?: string; resumeData?: any }> {
  if (!request.resumeId || !request.userId) {
    return { valid: false, error: 'Missing required fields: resumeId and userId' };
  }

  try {
    const resumeRef = doc(db, 'resumes', request.resumeId);
    const resumeSnap = await getDoc(resumeRef);

    if (!resumeSnap.exists()) {
      return { valid: false, error: 'Resume not found' };
    }

    const resumeData = resumeSnap.data();
    if (resumeData.userId !== request.userId) {
      return { valid: false, error: 'Unauthorized access' };
    }

    return { valid: true, resumeData };
  } catch (error) {
    console.error('Validation error:', error);
    return { valid: false, error: 'Failed to validate request' };
  }
}

// POST - Main analysis endpoint
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { action = 'analyze' } = body;

    // Route to appropriate handler
    switch (action) {
      case 'analyze':
        return await handleAnalysis(body, startTime);
      case 'batch':
        return await handleBatchAnalysis(body, startTime);
      case 'clear':
        return await handleClearAnalysis(body, startTime);
      default:
        return createResponse(null, false, `Invalid action: ${action}`);
    }
  } catch (error) {
    console.error('POST error:', error);
    return createResponse(null, false, 'Invalid request format');
  }
}

// GET - Status and history endpoint
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    const resumeId = searchParams.get('resumeId');
    const userId = searchParams.get('userId');

    if (!userId) {
      return createResponse(null, false, 'Missing userId');
    }

    switch (action) {
      case 'status':
        if (!resumeId) {
          return createResponse(null, false, 'Missing resumeId');
        }
        return await handleGetStatus({ resumeId, userId }, startTime);
      case 'history':
        return await handleGetHistory(userId, resumeId, startTime);
      default:
        return createResponse(null, false, `Invalid action: ${action}`);
    }
  } catch (error) {
    console.error('GET error:', error);
    return createResponse(null, false, 'Failed to process request');
  }
}

// DELETE - Clear analysis
export async function DELETE(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');
    const userId = searchParams.get('userId');

    if (!resumeId || !userId) {
      return createResponse(null, false, 'Missing required parameters');
    }

    return await handleClearAnalysis({ resumeId, userId }, startTime);
  } catch (error) {
    console.error('DELETE error:', error);
    return createResponse(null, false, 'Failed to clear analysis');
  }
}

// Main analysis handler
async function handleAnalysis(
  body: BaseRequest & { jobTitle?: string; jobDescription?: string; jobCompany?: string; jobData?: JobData },
  startTime: number
): Promise<NextResponse> {
  // Normalize job data
  const jobData: JobData = body.jobData || {
    title: body.jobTitle!,
    description: body.jobDescription!,
    company: body.jobCompany || ''
  };

  if (!jobData.title || !jobData.description) {
    return createResponse(null, false, 'Missing job title or description');
  }

  // Validate request
  const validation = await validateRequest(body);
  if (!validation.valid) {
    return createResponse(null, false, validation.error);
  }

  try {
    // Use transaction for consistency
    const result = await runTransaction(db, async (transaction) => {
      const resumeRef = doc(db, 'resumes', body.resumeId);
      const resumeDoc = await transaction.get(resumeRef);
      const resumeData = resumeDoc.data();

      // Extract and analyze-for-keywords resume
      const resumeText = extractResumeText(resumeData);
      const analysisResult = await analyzeEnterprise({
        resumeText,
        jobTitle: jobData.title,
        jobDescription: jobData.description,
        jobCompany: jobData.company,
        includeRecommendations: false
      });

      // Prepare structured result
      const structuredResult: AnalysisResult = {
        atsScore: analysisResult.atsScore || 0,
        breakdown: analysisResult.breakdown || {
          keywordMatch: 0,
          skillsAlignment: 0,
          experienceRelevance: 0,
          educationMatch: 0,
          formatting: 0
        },
        matchedKeywords: (analysisResult.matchedKeywords || []).map((k: any) => ({
          keyword: k.keyword,
          category: k.category || 'general',
          importance: k.relevanceScore > 0.8 ? 'high' : k.relevanceScore > 0.5 ? 'medium' : 'low',
          context: k.matchedVariations?.join(', ')
        })),
        missingKeywords: (analysisResult.missingKeywords || []).map((k: any) => ({
          keyword: k.keyword,
          category: k.category || 'general',
          importance: k.importance || 'medium'
        })),
        summary: typeof analysisResult.summary === 'string'
          ? analysisResult.summary
          : analysisResult.summary?.overallFit || 'Analysis completed'
      };

      // Update resume document
      const updateData = {
        job_info: {
          ...jobData,
          ...structuredResult,
          analyzed_at: new Date().toISOString()
        },
        'metadata.lastModified': new Date().toISOString()
      };

      transaction.update(resumeRef, updateData);

      // Store analysis history
      const historyRef = doc(collection(db, 'analysis_history'));
      transaction.set(historyRef, {
        resumeId: body.resumeId,
        userId: body.userId,
        jobTitle: jobData.title,
        jobCompany: jobData.company,
        atsScore: structuredResult.atsScore,
        timestamp: new Date().toISOString()
      });

      return structuredResult;
    });

    // Increment AI generation counter for the user
    try {
      const userDocRef = doc(db, 'users', body.userId);
      const userDoc = await getDoc(userDocRef);
      
      let currentAiGenerations = 0;
      let currentMonthlyGenerations = 0;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentAiGenerations = userData.usage?.aiGenerations || 0;
        currentMonthlyGenerations = userData.usage?.monthlyAiGenerations || 0;
      }

      await updateDoc(userDocRef, {
        'usage.aiGenerations': currentAiGenerations + 1,
        'usage.monthlyAiGenerations': currentMonthlyGenerations + 1,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating AI generation count:', error);
      // Don't fail the request if counter update fails
    }

    return createResponse(result, true, undefined, Date.now() - startTime);

  } catch (error) {
    console.error('Analysis error:', error);
    return createResponse(null, false, 'Failed to analyze-for-keywords resume');
  }
}

// Batch analysis handler
async function handleBatchAnalysis(
  body: { userId: string; resumeIds: string[]; jobData: JobData },
  startTime: number
): Promise<NextResponse> {
  if (!body.resumeIds?.length || !body.jobData) {
    return createResponse(null, false, 'Missing resumeIds or jobData');
  }

  // Limit batch size for performance
  const MAX_BATCH_SIZE = 10;
  if (body.resumeIds.length > MAX_BATCH_SIZE) {
    return createResponse(null, false, `Batch size exceeds maximum of ${MAX_BATCH_SIZE}`);
  }

  try {
    const results = await Promise.allSettled(
      body.resumeIds.map(resumeId =>
        handleAnalysis({ ...body, resumeId }, Date.now())
          .then(res => res.json())
      )
    );

    const processedResults = results.map((result, index) => ({
      resumeId: body.resumeIds[index],
      ...(result.status === 'fulfilled' ? result.value : {
        success: false,
        error: 'Processing failed'
      })
    }));

    const summary = {
      total: body.resumeIds.length,
      successful: processedResults.filter(r => r.success).length,
      failed: processedResults.filter(r => !r.success).length,
      averageScore: processedResults
        .filter(r => r.success && r.data?.atsScore)
        .reduce((sum, r) => sum + r.data.atsScore, 0) /
        processedResults.filter(r => r.success).length || 0
    };

    return createResponse({ results: processedResults, summary }, true, undefined, Date.now() - startTime);

  } catch (error) {
    console.error('Batch analysis error:', error);
    return createResponse(null, false, 'Batch processing failed');
  }
}

// Get status handler
async function handleGetStatus(
  params: BaseRequest,
  startTime: number
): Promise<NextResponse> {
  const validation = await validateRequest(params);
  if (!validation.valid) {
    return createResponse(null, false, validation.error);
  }

  const resumeData = validation.resumeData;
  const jobInfo = resumeData.job_info;

  const status = {
    resumeId: params.resumeId,
    hasAnalysis: !!jobInfo,
    lastAnalyzed: jobInfo?.analyzed_at || null,
    currentJob: jobInfo ? {
      title: jobInfo.title,
      company: jobInfo.company,
      atsScore: jobInfo.atsScore
    } : null,
    metrics: jobInfo ? {
      atsScore: jobInfo.atsScore,
      matchedKeywords: jobInfo.matchedKeywords?.length || 0,
      missingKeywords: jobInfo.missingKeywords?.length || 0,
      totalKeywords: (jobInfo.matchedKeywords?.length || 0) + (jobInfo.missingKeywords?.length || 0)
    } : null,
    breakdown: jobInfo?.breakdown || null
  };

  return createResponse(status, true, undefined, Date.now() - startTime);
}

// Get history handler
async function handleGetHistory(
  userId: string,
  resumeId: string | null,
  startTime: number
): Promise<NextResponse> {
  try {
    const historyQuery = resumeId
      ? query(
          collection(db, 'analysis_history'),
          where('userId', '==', userId),
          where('resumeId', '==', resumeId),
          orderBy('timestamp', 'desc'),
          limit(20)
        )
      : query(
          collection(db, 'analysis_history'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(50)
        );

    const historySnap = await getDocs(historyQuery);
    const history: HistoryItem[] = historySnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        resumeId: data.resumeId,
        userId: data.userId,
        jobTitle: data.jobTitle,
        jobCompany: data.jobCompany,
        atsScore: data.atsScore,
        timestamp: data.timestamp
      };
    });

    // Calculate analytics from history
    const analytics = {
      totalAnalyses: history.length,
      uniqueResumes: new Set(history.map((h: HistoryItem) => h.resumeId)).size,
      averageScore: history.reduce((sum, h) => sum + (h.atsScore || 0), 0) / history.length || 0,
      scoreProgression: history
        .filter((h: HistoryItem) => h.resumeId === resumeId)
        .map((h: HistoryItem) => ({ score: h.atsScore, date: h.timestamp }))
        .reverse(),
      recentActivity: history.slice(0, 5)
    };

    return createResponse({ history, analytics }, true, undefined, Date.now() - startTime);

  } catch (error) {
    console.error('History error:', error);
    return createResponse(null, false, 'Failed to retrieve history');
  }
}

// Clear analysis handler
async function handleClearAnalysis(
  params: BaseRequest,
  startTime: number
): Promise<NextResponse> {
  const validation = await validateRequest(params);
  if (!validation.valid) {
    return createResponse(null, false, validation.error);
  }

  try {
    const resumeRef = doc(db, 'resumes', params.resumeId);
    await updateDoc(resumeRef, {
      job_info: null,
      'metadata.lastModified': new Date().toISOString()
    });

    return createResponse({
      message: 'Analysis cleared successfully',
      resumeId: params.resumeId
    }, true, undefined, Date.now() - startTime);

  } catch (error) {
    console.error('Clear error:', error);
    return createResponse(null, false, 'Failed to clear analysis');
  }
}