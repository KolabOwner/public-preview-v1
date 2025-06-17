/**
 * Enterprise-enhanced resume parsing route
 * Demonstrates how to add enterprise features to existing routes
 * WITHOUT breaking RMS metadata pipeline or custom font generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCORS } from "@/lib/core/api/middleware/cors";
import { FileStatus, enterpriseWrapper, withEnterpriseFeatures } from "@/lib/features/pdf/processor";
import { parseResumeText } from "@/lib/features/pdf/parsing/parser";
import { logger } from "@/lib/enterprise/monitoring/logging";
import { performanceAnalytics } from "@/lib/enterprise/monitoring/analytics";

// Same configuration as original route
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// OPTIONS handler with enterprise monitoring
export const OPTIONS = withCORS(
  withEnterpriseFeatures(async (request: NextRequest) => {
    return new NextResponse(null, { status: 200 });
  })
);

// Enhanced POST handler
export const POST = withCORS(
  withEnterpriseFeatures(async (request: NextRequest) => {
    const startTime = Date.now();
    const sessionId = Math.random().toString(36).substring(7);

    // Log with enterprise logger
    logger.info('Enterprise Parse Resume API Called', { sessionId });

    try {
      const contentType = request.headers.get('content-type') || '';
      
      // Get enterprise options from headers or use defaults
      const enterpriseOptions = {
        enableValidation: request.headers.get('x-enable-validation') === 'true',
        enableDLP: request.headers.get('x-enable-dlp') === 'true',
        enableRealTimeUpdates: request.headers.get('x-enable-realtime') === 'true',
        enableAuditLogging: request.headers.get('x-enable-audit') === 'true',
      };

      if (contentType.includes('multipart/form-data')) {
        return handleEnhancedFileUpload(request, startTime, sessionId, enterpriseOptions);
      } else {
        return handleEnhancedTextParsing(request, startTime, sessionId, enterpriseOptions);
      }
    } catch (error: any) {
      logger.error('Enterprise parse endpoint error', {
        sessionId,
        error: error.message,
        stack: error.stack
      });

      const elapsed = Date.now() - startTime;

      // Record error metric
      await performanceAnalytics.recordMetric(
        'resume.parse.error',
        1,
        'counter' as any,
        { errorType: error.constructor.name }
      );

      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to parse resume',
          elapsed,
          sessionId
        },
        { status: 500 }
      );
    }
  })
);

/**
 * Enhanced file upload with enterprise features
 * PRESERVES: Original PDF processing pipeline
 * ADDS: Validation, DLP, monitoring
 */
async function handleEnhancedFileUpload(
  request: NextRequest, 
  startTime: number,
  sessionId: string,
  enterpriseOptions: any
) {
  const uploadTimer = performanceAnalytics.startTimer('resume.upload.processing');

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

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    logger.info('Processing enhanced PDF upload', {
      sessionId,
      fileName: file.name,
      fileSize: file.size,
      userId,
      enterpriseOptions
    });

    // Step 1: Create resume document (same as original)
    const resumeId = await PDFProcessor.createResume({
      userId,
      title: title || file.name,
      initialStatus: FileStatus.PROCESSING
    });

    // Step 2: If enterprise features enabled, wrap the processing
    if (Object.values(enterpriseOptions).some(v => v)) {
      // Queue with enterprise wrapper for enhanced processing
      const result = await enterpriseWrapper.parseResumeWithEnterprise(
        file,
        userId,
        enterpriseOptions
      );

      logger.info('Resume queued for enterprise processing', {
        sessionId,
        resumeId,
        jobId: result.jobId
      });

      return NextResponse.json({
        success: true,
        resumeId,
        jobId: result.jobId,
        message: 'Resume processing started with enterprise features',
        elapsed: Date.now() - startTime,
        enterpriseEnabled: true
      });
    } else {
      // Use original processing (preserves all existing functionality)
      PDFProcessor.processPDF(file, resumeId, { userId, title })
        .catch(error => logger.error('Background processing error', { sessionId, error }));
      
      return NextResponse.json({
        success: true,
        resumeId,
        message: 'Resume processing started',
        elapsed: Date.now() - startTime,
        enterpriseEnabled: false
      });
    }
  } finally {
    await uploadTimer();
  }
}

/**
 * Enhanced text parsing with enterprise features
 */
async function handleEnhancedTextParsing(
  request: NextRequest,
  startTime: number,
  sessionId: string,
  enterpriseOptions: any
) {
  const parseTimer = performanceAnalytics.startTimer('resume.text.parsing');

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

    logger.info('Parsing resume text with enterprise features', {
      sessionId,
      textLength: resumeText.length,
      userId,
      enterpriseOptions
    });

    // Use original parser (preserves existing functionality)
    const result = await parseResumeText(resumeText, userId, saveToFirebase);

    if (!result || !result.success) {
      throw new Error(result?.error || 'Failed to parse resume');
    }

    // Record success metrics
    await performanceAnalytics.recordMetric(
      'resume.text.parse.success',
      1,
      'counter' as any,
      { userId }
    );
    
    const elapsed = Date.now() - startTime;
    return NextResponse.json({
      ...result,
      elapsed,
      timestamp: new Date().toISOString(),
      sessionId,
      enterpriseEnabled: Object.values(enterpriseOptions).some(v => v)
    });
  } finally {
    await parseTimer();
  }
}

// Enhanced GET handler for status checking
export const GET = withCORS(
  withEnterpriseFeatures(async (request: NextRequest) => {
    const statusTimer = performanceAnalytics.startTimer('resume.status.check');

    try {
      const url = new URL(request.url);
      const resumeId = url.searchParams.get('resumeId');
      
      if (!resumeId) {
        return NextResponse.json(
          { success: false, error: 'Resume ID is required' },
          { status: 400 }
        );
      }
      
      const resume = await PDFProcessor.getResume(resumeId);
      
      if (!resume) {
        return NextResponse.json(
          { success: false, error: 'Resume not found' },
          { status: 404 }
        );
      }

      // Record status check
      await performanceAnalytics.recordMetric(
        'resume.status.checked',
        1,
        'counter' as any,
        { status: resume.status }
      );
      
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
    } finally {
      await statusTimer();
    }
  })
);