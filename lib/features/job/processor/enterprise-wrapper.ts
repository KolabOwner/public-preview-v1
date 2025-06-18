/**
 * Enterprise Wrapper for Keyword Extraction and ATS Optimization
 * Preserves existing resume builder functionality while adding enterprise
 * security, monitoring, and resilience features
 */

import { ValidationPipeline } from '@/lib/enterprise/security/validators';
import { DLPScanner } from '@/lib/enterprise/security/dlp';
import { logger } from '@/lib/enterprise/monitoring/logging';
import { performanceAnalytics } from '@/lib/enterprise/monitoring/analytics';
import { circuitBreakerManager } from '@/lib/enterprise/resilience/circuit-breaker';
import { recoveryOrchestrator } from '@/lib/enterprise/resilience/recovery';
import { jobQueue, JobPriority, JobStatus } from '@/lib/enterprise/infrastructure/queue';
import { realtimeService } from '@/lib/enterprise/infrastructure/realtime';
import { auditLogger } from '@/lib/enterprise/compliance/audit';

// Import enterprise ATS processor
import { atsProcessorService } from '@/lib/enterprise/processors/ats/service';

// Note: Firebase Admin will be imported lazily when needed to avoid initialization errors

export interface EnterpriseKeywordOptions {
  enableValidation?: boolean;
  enableDLP?: boolean;
  enableRealTimeUpdates?: boolean;
  enableAuditLogging?: boolean;
  enableAdvancedNLP?: boolean;
  enableCostControl?: boolean;
  priority?: JobPriority;
  industryContext?: string;
  targetATSScore?: number;
}

/**
 * Wraps existing keyword extraction and ATS optimization with enterprise features
 * PRESERVES: Resume builder functionality, job association, keyword extraction
 * ADDS: Security validation, monitoring, error recovery, cost controls
 */
export class EnterpriseKeywordWrapper {
  private validationPipeline: ValidationPipeline;
  private dlpScanner: DLPScanner;

  constructor() {
    this.validationPipeline = new ValidationPipeline();
    this.dlpScanner = new DLPScanner();
  }

  /**
   * Associate job with resume and extract keywords with enterprise features
   */
  async associateJobWithEnterprise(
    resumeId: string,
    jobData: {
      title: string;
      company: string;
      description: string;
      url?: string;
    },
    userId: string,
    options: EnterpriseKeywordOptions = {}
  ): Promise<any> {
    const timer = performanceAnalytics.startTimer('enterprise.job.association', {
      userId,
      resumeId,
      jobCompany: jobData.company
    });

    const associationId = `assoc_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      // Step 1: Pre-validation if enabled
      if (options.enableValidation) {
        await this.validateJobData(jobData, userId);
      }

      // Step 2: DLP scanning if enabled
      if (options.enableDLP) {
        await this.scanJobDescription(jobData.description, userId);
      }

      // Step 3: Audit logging
      if (options.enableAuditLogging) {
        await auditLogger.log({
          action: 'job_association_started',
          resourceType: 'resume_job_association',
          resourceId: resumeId,
          userId,
          metadata: {
            associationId,
            jobTitle: jobData.title,
            jobCompany: jobData.company,
            enableAdvancedNLP: options.enableAdvancedNLP
          }
        });
      }

      // Step 4: Real-time updates
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'job_association_started',
          timestamp: new Date(),
          data: {
            resumeId,
            jobTitle: jobData.title,
            jobCompany: jobData.company
          }
        });
      }

      // Step 5: Use circuit breaker for job association
      const breaker = circuitBreakerManager.getBreaker('job_association');
      const result = await breaker.execute(async () => {
        // Lazy load Firebase Admin
        const { adminDb } = await import('@/lib/core/auth/firebase-admin');
        
        // Ensure user document exists first
        await adminDb
          .collection('resumes')
          .doc(userId)
          .set({
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date()
          }, { merge: true });
        
        // Update resume with job info (filter out undefined values)
        const jobInfo: any = {
          title: jobData.title,
          company: jobData.company,
          description: jobData.description,
          keywords: [], // Will be populated by keyword extraction
          updated_at: new Date()
        };
        
        // Only add URL if it's defined
        if (jobData.url !== undefined) {
          jobInfo.url = jobData.url;
        }
        
        await adminDb
          .collection('resumes')
          .doc(userId)
          .collection('resumes')
          .doc(resumeId)
          .set({
            'job_info': jobInfo,
            'isTargeted': true,
            'updatedAt': new Date()
          }, { merge: true });

        // Extract keywords using enterprise service
        const keywordResult = await atsProcessorService.extractJobKeywords(
          jobData.description,
          resumeId,
          userId,
          {
            ...options,
            industryContext: options.industryContext,
            useAdvancedNLP: options.enableAdvancedNLP,
            saveToFirestore: true,
            enableRealTimeUpdates: options.enableRealTimeUpdates
          }
        );

        return keywordResult;
      });

      // Step 6: Analyze ATS match automatically
      let atsAnalysis;
      if (!result.jobId) { // Only if processed synchronously
        atsAnalysis = await this.analyzeATSMatchWithEnterprise(
          resumeId,
          userId,
          {
            ...options,
            includeRecommendations: true,
            targetScore: options.targetATSScore
          }
        );
      }

      // Step 7: Record success metrics
      await performanceAnalytics.recordMetric(
        'job.association.success',
        1,
        'counter' as any,
        {
          jobCompany: jobData.company,
          keywordCount: result.keywords?.length || 0
        }
      );

      // Step 8: Audit success
      if (options.enableAuditLogging) {
        await auditLogger.log({
          action: 'job_association_completed',
          resourceType: 'resume_job_association',
          resourceId: resumeId,
          userId,
          result: 'success',
          metadata: {
            associationId,
            keywordCount: result.keywords?.length || 0,
            atsScore: atsAnalysis?.atsScore
          }
        });
      }

      // Step 9: Send completion update
      if (options.enableRealTimeUpdates && !result.jobId) {
        await realtimeService.sendUpdate(userId, {
          type: 'job_association_completed',
          timestamp: new Date(),
          data: {
            resumeId,
            keywordCount: result.keywords?.length || 0,
            atsScore: atsAnalysis?.atsScore
          }
        });
      }

      return {
        success: true,
        associationId,
        keywordAnalysis: result,
        atsAnalysis,
        jobData: {
          ...jobData,
          keywords: result.keywords
        }
      };

    } catch (error) {
      // Record error
      await performanceAnalytics.recordMetric(
        'job.association.error',
        1,
        'counter' as any,
        { error: error.message }
      );

      // Attempt recovery
      if (options.enableAuditLogging) {
        const recoveryResult = await recoveryOrchestrator.recover(
          error,
          'job_association',
          {
            userId,
            operationFn: () => this.associateJobWithEnterprise(resumeId, jobData, userId, options),
            cacheKey: `job_assoc_${resumeId}_${jobData.title}`
          }
        );

        if (recoveryResult.success) {
          return recoveryResult.result;
        }
      }

      // Log failure
      logger.error('Job association failed', {
        userId,
        resumeId,
        error: error.message,
        jobTitle: jobData.title
      });

      throw error;

    } finally {
      await timer();
    }
  }

  /**
   * Analyze ATS match with enterprise features
   */
  async analyzeATSMatchWithEnterprise(
    resumeId: string,
    userId: string,
    options: EnterpriseKeywordOptions & {
      includeRecommendations?: boolean;
      targetScore?: number;
    } = {}
  ): Promise<any> {
    const timer = performanceAnalytics.startTimer('enterprise.ats.analysis', {
      userId,
      resumeId
    });

    try {
      logger.info('Analyzing ATS match with enterprise features', {
        userId,
        resumeId,
        targetScore: options.targetScore
      });

      // Use circuit breaker for ATS analysis
      const breaker = circuitBreakerManager.getBreaker('ats_analysis');
      const analysisResult = await breaker.execute(async () => {
        return await atsProcessorService.analyzeATSMatch(
          resumeId,
          userId,
          {
            ...options,
            saveToFirestore: true,
            enableRealTimeUpdates: options.enableRealTimeUpdates
          }
        );
      });

      // Generate tailored content if score is below target
      let tailoredContent;
      if (analysisResult.atsScore < (options.targetScore || 80)) {
        tailoredContent = await this.generateTailoredContentWithEnterprise(
          resumeId,
          userId,
          options
        );
      }

      // Record metrics
      await performanceAnalytics.recordMetric(
        'ats.score.distribution',
        analysisResult.atsScore,
        'histogram' as any,
        { userId }
      );

      return {
        ...analysisResult,
        tailoredContent
      };

    } catch (error) {
      logger.error('ATS analysis failed', {
        userId,
        resumeId,
        error: error.message
      });

      await performanceAnalytics.recordMetric(
        'ats.analysis.error',
        1,
        'counter' as any,
        { error: error.message }
      );

      throw error;

    } finally {
      await timer();
    }
  }

  /**
   * Generate tailored content with enterprise features
   */
  async generateTailoredContentWithEnterprise(
    resumeId: string,
    userId: string,
    options: EnterpriseKeywordOptions & {
      sections?: string[];
    } = {}
  ): Promise<any> {
    const timer = performanceAnalytics.startTimer('enterprise.content.generation', {
      userId,
      resumeId,
      sections: options.sections?.join(',')
    });

    try {
      logger.info('Generating tailored content with enterprise features', {
        userId,
        resumeId,
        sections: options.sections
      });

      // Check cost controls if using advanced features
      if (options.enableCostControl && options.enableAdvancedNLP) {
        const costCheck = await this.checkCostLimits(userId);
        if (!costCheck.allowed) {
          logger.warn('Cost limit reached for user', {
            userId,
            dailySpend: costCheck.dailySpend,
            limit: costCheck.limit
          });

          // Fall back to basic generation
          options.enableAdvancedNLP = false;
        }
      }

      // Use circuit breaker for content generation
      const breaker = circuitBreakerManager.getBreaker('content_generation');
      const tailoredContent = await breaker.execute(async () => {
        return await atsProcessorService.generateTailoredContent(
          resumeId,
          userId,
          {
            ...options,
            saveToFirestore: true
          }
        );
      });

      // Audit logging
      if (options.enableAuditLogging) {
        await auditLogger.log({
          action: 'tailored_content_generated',
          resourceType: 'resume_optimization',
          resourceId: resumeId,
          userId,
          metadata: {
            sections: options.sections,
            estimatedImprovement: tailoredContent.estimatedScoreImprovement
          }
        });
      }

      return tailoredContent;

    } catch (error) {
      logger.error('Tailored content generation failed', {
        userId,
        resumeId,
        error: error.message
      });

      throw error;

    } finally {
      await timer();
    }
  }

  /**
   * Extract keywords from multiple jobs in batch
   */
  async processBatchJobsWithEnterprise(
    jobs: Array<{
      jobId: string;
      jobDescription: string;
      resumeId: string;
    }>,
    userId: string,
    options: EnterpriseKeywordOptions & {
      concurrency?: number;
    } = {}
  ): Promise<any> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      // Queue the batch job
      const job = await jobQueue.addJob(
        'keyword_batch_processing',
        {
          jobs,
          userId,
          options: {
            industryContext: options.industryContext,
            enableAdvancedNLP: options.enableAdvancedNLP,
            concurrency: options.concurrency || 3
          }
        },
        {
          priority: options.priority || JobPriority.LOW,
          metadata: { userId, batchId, jobCount: jobs.length }
        }
      );

      // Send real-time updates
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'batch_processing_queued',
          jobId: job.id,
          timestamp: new Date(),
          data: {
            batchId,
            jobCount: jobs.length
          }
        });
      }

      // Audit logging
      if (options.enableAuditLogging) {
        await auditLogger.log({
          action: 'batch_keyword_processing_queued',
          resourceType: 'keyword_batch',
          resourceId: batchId,
          userId,
          metadata: {
            jobId: job.id,
            jobCount: jobs.length
          }
        });
      }

      return {
        jobId: job.id,
        batchId,
        status: JobStatus.PENDING,
        message: 'Batch keyword processing queued'
      };

    } catch (error) {
      logger.error('Failed to queue batch processing', {
        userId,
        batchId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get keyword analytics for user
   */
  async getKeywordAnalytics(
    userId: string,
    options: {
      resumeId?: string;
      dateRange?: { start: Date; end: Date };
    } = {}
  ): Promise<any> {
    try {
      const analytics = {
        totalJobsAnalyzed: 0,
        averageKeywordsPerJob: 0,
        averageATSScore: 0,
        topKeywords: [] as any[],
        skillGaps: [] as any[],
        improvementTrend: [] as any[]
      };

      // Lazy load Firebase Admin
      const { adminDb } = await import('@/lib/core/auth/firebase-admin');
      
      // Query resumes
      let query = adminDb
        .collection('resumes')
        .doc(userId)
        .collection('resumes')
        .where('isTargeted', '==', true);

      if (options.resumeId) {
        query = query.where('__name__', '==', options.resumeId);
      }

      const resumes = await query.get();

      // Aggregate analytics
      let totalKeywords = 0;
      let totalATSScore = 0;
      const keywordFrequency = new Map<string, number>();

      resumes.forEach(doc => {
        const data = doc.data();
        if (data.job_info?.keywords) {
          analytics.totalJobsAnalyzed++;
          totalKeywords += data.job_info.keywords.length;

          // Count keyword frequency
          data.job_info.keywords.forEach((kw: any) => {
            const count = keywordFrequency.get(kw.keyword) || 0;
            keywordFrequency.set(kw.keyword, count + 1);
          });
        }

        if (data.atsScore) {
          totalATSScore += data.atsScore;
        }
      });

      // Calculate averages
      if (analytics.totalJobsAnalyzed > 0) {
        analytics.averageKeywordsPerJob = totalKeywords / analytics.totalJobsAnalyzed;
        analytics.averageATSScore = totalATSScore / analytics.totalJobsAnalyzed;
      }

      // Get top keywords
      analytics.topKeywords = Array.from(keywordFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([keyword, count]) => ({ keyword, count }));

      return analytics;

    } catch (error) {
      logger.error('Failed to get keyword analytics', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate job data
   */
  private async validateJobData(jobData: any, userId: string): Promise<void> {
    logger.debug('Validating job data', { userId });

    if (!jobData.title || !jobData.company || !jobData.description) {
      throw new Error('Job data must contain title, company, and description');
    }

    if (jobData.description.length < 100) {
      throw new Error('Job description too short for meaningful analysis');
    }

    if (jobData.description.length > 50000) {
      throw new Error('Job description exceeds maximum length');
    }
  }

  /**
   * Scan job description for sensitive information
   */
  private async scanJobDescription(description: string, userId: string): Promise<void> {
    logger.debug('Scanning job description for sensitive data', { userId });

    const dlpResult = await this.dlpScanner.scan(description, {
      documentType: 'job_description',
      userId
    });

    if (dlpResult.hasViolations) {
      logger.warn('DLP violations found in job description', {
        userId,
        violations: dlpResult.violations
      });

      // Log but don't block - job descriptions are external content
    }
  }

  /**
   * Check cost limits for user
   */
  private async checkCostLimits(userId: string): Promise<{ allowed: boolean; dailySpend: number; limit: number }> {
    // This would check actual usage from your billing system
    // For now, returning mock data
    const dailySpend = 0; // Would calculate from actual API usage
    const limit = 5; // $5 per user per day

    return {
      allowed: dailySpend < limit,
      dailySpend,
      limit
    };
  }
}

// Export singleton instance
export const enterpriseKeywordWrapper = new EnterpriseKeywordWrapper();

/**
 * Middleware to add enterprise features to existing keyword/ATS routes
 */
export function withEnterpriseKeywordFeatures(
  handler: (req: any, res: any) => Promise<any>,
  options: EnterpriseKeywordOptions = {}
) {
  return async (req: any, res: any) => {
    const requestId = Math.random().toString(36).substring(7);
    const timer = performanceAnalytics.startTimer('api.keyword.request', {
      method: req.method,
      path: req.url
    });

    try {
      // Log request
      logger.info('Keyword API request', {
        requestId,
        method: req.method,
        path: req.url,
        userId: req.headers.get('x-user-id')
      });

      // Execute original handler with enterprise context
      req.enterpriseContext = {
        requestId,
        enableValidation: options.enableValidation,
        enableDLP: options.enableDLP,
        enableAuditLogging: options.enableAuditLogging
      };

      const result = await handler(req, res);

      // Record success
      await performanceAnalytics.recordMetric(
        'api.keyword.request.success',
        1,
        'counter' as any,
        { path: req.url }
      );

      return result;

    } catch (error) {
      // Record error
      await performanceAnalytics.recordMetric(
        'api.keyword.request.error',
        1,
        'counter' as any,
        { path: req.url, error: error.message }
      );

      logger.error('Keyword API request failed', {
        requestId,
        error: error.message,
        stack: error.stack
      });

      throw error;

    } finally {
      await timer();
    }
  };
}