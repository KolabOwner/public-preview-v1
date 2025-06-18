/**
 * Enterprise-enhanced keyword extraction and ATS analysis route
 * Demonstrates how to add enterprise features to job association and analysis
 * WITHOUT breaking existing functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCORS } from "@/lib/core/api/middleware/cors";
import { enterpriseKeywordWrapper, withEnterpriseKeywordFeatures } from "@/lib/features/job/processor/enterprise-wrapper";
import { atsProcessorService } from "@/lib/enterprise/processors/ats/service";
import { logger } from "@/lib/enterprise/monitoring/logging";
import { performanceAnalytics } from "@/lib/enterprise/monitoring/analytics";
import { JobPriority } from '@/lib/enterprise/infrastructure/queue';

// Lazy load Firebase Admin to avoid initialization errors
let db: any = null;
let firebaseAvailable = false;

const getDb = async () => {
  if (!db) {
    try {
      const { adminDb, testFirestoreConnection } = await import('@/lib/core/auth/firebase-admin');
      db = adminDb;
      
      // Test the connection on first load
      console.log('Testing Firestore connection on first database access...');
      const testResult = await testFirestoreConnection();
      
      if (!testResult.success) {
        logger.warn('Firestore connection test failed, enterprise features will be limited', { 
          error: testResult.error,
          details: testResult.details 
        });
        
        // Return null instead of throwing - let callers handle gracefully
        firebaseAvailable = false;
        return null;
      }
      
      console.log('✓ Firestore connection verified successfully');
      firebaseAvailable = true;
    } catch (error) {
      logger.warn('Failed to initialize Firebase Admin, continuing without enterprise features', { error: error.message });
      firebaseAvailable = false;
      return null;
    }
  }
  return db;
};

const isFirebaseAvailable = () => firebaseAvailable;

// Configuration
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// OPTIONS handler with enterprise monitoring
export const OPTIONS = withCORS(
  withEnterpriseKeywordFeatures(async (request: NextRequest) => {
    return new NextResponse(null, { status: 200 });
  })
);

/**
 * Enhanced POST handler for job association and keyword extraction
 */
export const POST = withCORS(
  withEnterpriseKeywordFeatures(async (request: NextRequest) => {
    const startTime = Date.now();
    const analysisId = Math.random().toString(36).substring(7);

    // Log with enterprise logger
    logger.info('Enterprise Analyze API Called', {
      analysisId,
      path: request.nextUrl.pathname
    });

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      logger.error('Failed to parse request body', {
        analysisId,
        error: jsonError.message,
        contentType: request.headers.get('content-type')
      });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body. Expected valid JSON.',
          details: jsonError.message
        },
        { status: 400 }
      );
    }
    
    try {
      const action = body.action || 'associate'; // 'associate', 'analyze', 'batch'

      // Get enterprise options from headers or use defaults
      const enterpriseOptions = {
        enableValidation: request.headers.get('x-enable-validation') === 'true',
        enableDLP: request.headers.get('x-enable-dlp') === 'true',
        enableRealTimeUpdates: request.headers.get('x-enable-realtime') === 'true',
        enableAuditLogging: request.headers.get('x-enable-audit') === 'true',
        enableAdvancedNLP: request.headers.get('x-enable-advanced-nlp') === 'true',
        enableCostControl: request.headers.get('x-enable-cost-control') !== 'false', // Default true
        priority: body.priority || JobPriority.NORMAL
      };

      logger.info('Processing analysis request', {
        analysisId,
        action,
        enterpriseOptions
      });

      switch (action) {
        case 'associate':
          return handleJobAssociation(body, analysisId, enterpriseOptions);
        case 'analyze':
          return handleATSAnalysis(body, analysisId, enterpriseOptions);
        case 'batch':
          return handleBatchProcessing(body, analysisId, enterpriseOptions);
        case 'optimize':
          return handleContentOptimization(body, analysisId, enterpriseOptions);
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action specified' },
            { status: 400 }
          );
      }
    } catch (error: any) {
      logger.error('Enterprise analyze endpoint error', {
        analysisId,
        error: error.message,
        stack: error.stack
      });

      const elapsed = Date.now() - startTime;

      // Record error metric
      await performanceAnalytics.recordMetric(
        'keyword.analysis.error',
        1,
        'counter' as any,
        { errorType: error.constructor.name }
      );

      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to process analysis',
          elapsed,
          analysisId
        },
        { status: 500 }
      );
    }
  })
);

/**
 * Handle job association with keyword extraction
 * PRESERVES: Original job association flow
 * ADDS: Enterprise validation, monitoring, cost controls
 */
async function handleJobAssociation(
  body: any,
  analysisId: string,
  enterpriseOptions: any
) {
  const timer = performanceAnalytics.startTimer('keyword.job.association');

  try {
    const { resumeId, userId, jobData, async = false } = body;

    // Validate required fields
    if (!resumeId || !userId || !jobData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: resumeId, userId, and jobData are required'
        },
        { status: 400 }
      );
    }

    if (!jobData.title || !jobData.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job data must include title and description'
        },
        { status: 400 }
      );
    }
    
    // Set default company if not provided
    if (!jobData.company) {
      jobData.company = 'Unknown Company';
    }

    logger.info('Associating job with resume', {
      analysisId,
      resumeId,
      userId,
      jobTitle: jobData.title,
      jobCompany: jobData.company,
      async
    });

    // Try enterprise features with fallback to standard processing
    if (Object.values(enterpriseOptions).some(v => v)) {
      try {
        const result = await enterpriseKeywordWrapper.associateJobWithEnterprise(
          resumeId,
          jobData,
          userId,
          {
            ...enterpriseOptions,
            industryContext: body.industryContext,
            targetATSScore: body.targetATSScore || 80
          }
        );

        // Record success metrics
        await performanceAnalytics.recordMetric(
          'job.association.enterprise.success',
          1,
          'counter' as any,
          { userId, keywordCount: result.keywordAnalysis?.keywords?.length || 0 }
        );

        return NextResponse.json({
          success: true,
          data: result,
          analysisId,
          enterpriseEnabled: true,
          elapsed: Date.now() - timer.startTime
        });
      } catch (enterpriseError) {
        logger.warn('Enterprise features failed, falling back to standard processing', {
          analysisId,
          error: enterpriseError.message
        });
        
        // Fall through to standard processing
      }
    }
    
    // Standard processing (fallback or when enterprise features are disabled)
    {
      // Use standard processing (preserves original functionality)
      const database = await getDb();
      
      // Ensure user document exists first
      await database
        .collection('resumes')
        .doc(userId)
        .set({
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });
      
      // Update Firestore directly (filter out undefined values)
      const jobInfo: any = {
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        keywords: [], // Will be populated by separate call
        updated_at: new Date()
      };
      
      // Only add URL if it's defined
      if (jobData.url !== undefined) {
        jobInfo.url = jobData.url;
      }
      
      await database
        .collection('resumes')
        .doc(userId)
        .collection('resumes')
        .doc(resumeId)
        .set({
          'job_info': jobInfo,
          'isTargeted': true,
          'updatedAt': new Date()
        }, { merge: true });

      // Extract keywords using standard service
      const keywordResult = await atsProcessorService.extractJobKeywords(
        jobData.description,
        resumeId,
        userId,
        {
          async,
          industryContext: body.industryContext,
          saveToFirestore: true
        }
      );

      return NextResponse.json({
        success: true,
        data: {
          jobData,
          keywordAnalysis: keywordResult
        },
        analysisId,
        enterpriseEnabled: false,
        elapsed: Date.now() - timer.startTime
      });
    }
  } finally {
    await timer();
  }
}

/**
 * Handle ATS analysis for existing resume-job association
 */
async function handleATSAnalysis(
  body: any,
  analysisId: string,
  enterpriseOptions: any
) {
  const timer = performanceAnalytics.startTimer('keyword.ats.analysis');

  try {
    const { resumeId, userId, includeRecommendations = true, targetScore = 80 } = body;

    if (!resumeId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: resumeId and userId are required'
        },
        { status: 400 }
      );
    }

    logger.info('Analyzing ATS match', {
      analysisId,
      resumeId,
      userId,
      targetScore
    });

    // Check if job is already associated
    const database = await getDb();
    const resumeDoc = await database
      .collection('resumes')
      .doc(userId)
      .collection('resumes')
      .doc(resumeId)
      .get();

    if (!resumeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }

    const resumeData = resumeDoc.data();
    if (!resumeData?.job_info?.keywords || resumeData.job_info.keywords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No job keywords found. Please associate a job first.'
        },
        { status: 400 }
      );
    }

    // Perform ATS analysis
    let result;
    if (Object.values(enterpriseOptions).some(v => v)) {
      // Use enterprise wrapper for enhanced analysis
      result = await enterpriseKeywordWrapper.analyzeATSMatchWithEnterprise(
        resumeId,
        userId,
        {
          ...enterpriseOptions,
          includeRecommendations,
          targetScore
        }
      );
    } else {
      // Use standard service
      result = await atsProcessorService.analyzeATSMatch(
        resumeId,
        userId,
        {
          includeRecommendations,
          targetScore,
          saveToFirestore: true
        }
      );
    }

    // Record ATS score distribution
    await performanceAnalytics.recordMetric(
      'ats.score.value',
      result.atsScore,
      'histogram' as any,
      { userId }
    );

    return NextResponse.json({
      success: true,
      data: result,
      analysisId,
      enterpriseEnabled: Object.values(enterpriseOptions).some(v => v),
      elapsed: Date.now() - timer.startTime
    });

  } finally {
    await timer();
  }
}

/**
 * Handle batch processing of multiple jobs
 */
async function handleBatchProcessing(
  body: any,
  analysisId: string,
  enterpriseOptions: any
) {
  const timer = performanceAnalytics.startTimer('keyword.batch.processing');

  try {
    const { jobs, userId, concurrency = 3 } = body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Jobs array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate job structure
    const invalidJobs = jobs.filter(job =>
      !job.jobId || !job.jobDescription || !job.resumeId
    );

    if (invalidJobs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Each job must have jobId, jobDescription, and resumeId'
        },
        { status: 400 }
      );
    }

    logger.info('Processing batch jobs', {
      analysisId,
      userId,
      jobCount: jobs.length,
      concurrency
    });

    // Queue batch processing
    const result = await enterpriseKeywordWrapper.processBatchJobsWithEnterprise(
      jobs,
      userId,
      {
        ...enterpriseOptions,
        concurrency
      }
    );

    // Record batch metrics
    await performanceAnalytics.recordMetric(
      'keyword.batch.queued',
      jobs.length,
      'gauge' as any,
      { userId, batchId: result.batchId }
    );

    return NextResponse.json({
      success: true,
      data: result,
      analysisId,
      message: `Batch processing queued for ${jobs.length} jobs`,
      enterpriseEnabled: true,
      elapsed: Date.now() - timer.startTime
    });

  } finally {
    await timer();
  }
}

/**
 * Handle content optimization suggestions
 */
async function handleContentOptimization(
  body: any,
  analysisId: string,
  enterpriseOptions: any
) {
  const timer = performanceAnalytics.startTimer('keyword.content.optimization');

  try {
    const { resumeId, userId, sections = ['summary', 'experience', 'skills'] } = body;

    if (!resumeId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: resumeId and userId are required'
        },
        { status: 400 }
      );
    }

    logger.info('Generating content optimization', {
      analysisId,
      resumeId,
      userId,
      sections
    });

    // Generate tailored content
    const result = await enterpriseKeywordWrapper.generateTailoredContentWithEnterprise(
      resumeId,
      userId,
      {
        ...enterpriseOptions,
        sections
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
      analysisId,
      enterpriseEnabled: true,
      elapsed: Date.now() - timer.startTime
    });

  } finally {
    await timer();
  }
}

/**
 * Enhanced GET handler for retrieving analysis results and analytics
 */
export const GET = withCORS(
  withEnterpriseKeywordFeatures(async (request: NextRequest) => {
    const timer = performanceAnalytics.startTimer('keyword.analysis.retrieve');

    try {
      const url = new URL(request.url);
      const action = url.searchParams.get('action') || 'status'; // 'status', 'analytics', 'history'
      const resumeId = url.searchParams.get('resumeId');
      const userId = url.searchParams.get('userId');

      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID is required' },
          { status: 400 }
        );
      }

      switch (action) {
        case 'status':
          return getAnalysisStatus(resumeId!, userId);
        case 'analytics':
          return getUserAnalytics(userId, resumeId);
        case 'history':
          return getAnalysisHistory(userId, resumeId);
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action specified' },
            { status: 400 }
          );
      }
    } finally {
      await timer();
    }
  })
);

/**
 * Get analysis status for a resume
 */
async function getAnalysisStatus(resumeId: string, userId: string) {
  if (!resumeId) {
    return NextResponse.json(
      { success: false, error: 'Resume ID is required' },
      { status: 400 }
    );
  }

  const database = await getDb();
  
  // If Firebase is not available, return limited status
  if (!database) {
    return NextResponse.json({
      success: true,
      data: {
        resumeId,
        hasJobAssociated: false,
        jobInfo: null,
        keywordCount: 0,
        atsScore: null,
        lastAnalyzed: null,
        recommendations: 0,
        firebaseAvailable: false,
        message: 'Firebase not available - enterprise features limited'
      }
    });
  }

  try {
    const resumeDoc = await database
      .collection('resumes')
      .doc(userId)
      .collection('resumes')
      .doc(resumeId)
      .get();

    if (!resumeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }

    const data = resumeDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        resumeId,
        hasJobAssociated: !!data?.job_info?.title,
        jobInfo: data?.job_info || null,
        keywordCount: data?.job_info?.keywords?.length || 0,
        atsScore: data?.atsScore || null,
        lastAnalyzed: data?.keywordAnalysis?.analyzedAt || null,
        recommendations: data?.keywordAnalysis?.recommendations?.length || 0,
        firebaseAvailable: true
      }
    });
  } catch (error) {
    logger.error('Failed to get analysis status', { resumeId, userId, error: error.message });
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analysis status' },
      { status: 500 }
    );
  }
}

/**
 * Get user analytics
 */
async function getUserAnalytics(userId: string, resumeId?: string) {
  const analytics = await enterpriseKeywordWrapper.getKeywordAnalytics(
    userId,
    {
      resumeId,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: new Date()
      }
    }
  );

  return NextResponse.json({
    success: true,
    data: analytics
  });
}

/**
 * Get analysis history
 */
async function getAnalysisHistory(userId: string, resumeId?: string) {
  const database = await getDb();
  let query = database
    .collection('resumes')
    .doc(userId)
    .collection('resumes')
    .where('isTargeted', '==', true)
    .orderBy('updatedAt', 'desc')
    .limit(20);

  if (resumeId) {
    query = query.where('__name__', '==', resumeId);
  }

  const snapshot = await query.get();

  const history = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      resumeId: doc.id,
      title: data.title,
      jobTitle: data.job_info?.title,
      jobCompany: data.job_info?.company,
      keywordCount: data.job_info?.keywords?.length || 0,
      atsScore: data.atsScore,
      analyzedAt: data.keywordAnalysis?.analyzedAt,
      updatedAt: data.updatedAt
    };
  });

  return NextResponse.json({
    success: true,
    data: history
  });
}

/**
 * Enhanced PUT handler for re-analysis or updates
 */
export const PUT = withCORS(
  withEnterpriseKeywordFeatures(async (request: NextRequest) => {
    const timer = performanceAnalytics.startTimer('keyword.analysis.update');

    try {
      const body = await request.json();
      const { resumeId, userId, action = 'reanalyze' } = body;

      if (!resumeId || !userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields: resumeId and userId are required'
          },
          { status: 400 }
        );
      }

      logger.info('Updating analysis', {
        resumeId,
        userId,
        action
      });

      const database = await getDb();
      
      switch (action) {
        case 'reanalyze':
          // Re-extract keywords with latest algorithms
          const resumeDoc = await database
            .collection('resumes')
            .doc(userId)
            .collection('resumes')
            .doc(resumeId)
            .get();

          if (!resumeDoc.exists) {
            return NextResponse.json(
              { success: false, error: 'Resume not found' },
              { status: 404 }
            );
          }

          const data = resumeDoc.data();
          if (!data?.job_info?.description) {
            return NextResponse.json(
              { success: false, error: 'No job description found' },
              { status: 400 }
            );
          }

          // Re-extract keywords
          const result = await atsProcessorService.extractJobKeywords(
            data.job_info.description,
            resumeId,
            userId,
            {
              useAdvancedNLP: body.useAdvancedNLP,
              industryContext: body.industryContext,
              saveToFirestore: true,
              force: true // Force re-extraction
            }
          );

          return NextResponse.json({
            success: true,
            data: result,
            message: 'Keywords re-extracted successfully'
          });

        case 'clear':
          // Clear analysis data
          await database
            .collection('resumes')
            .doc(userId)
            .collection('resumes')
            .doc(resumeId)
            .update({
              'job_info': null,
              'keywordAnalysis': null,
              'atsScore': null,
              'atsAnalysis': null,
              'isTargeted': false,
              'updatedAt': new Date()
            });

          return NextResponse.json({
            success: true,
            message: 'Analysis data cleared successfully'
          });

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action specified' },
            { status: 400 }
          );
      }
    } finally {
      await timer();
    }
  })
);