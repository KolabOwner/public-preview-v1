/**
 * Keyword Processor Service
 * High-level service for keyword extraction and ATS optimization operations
 * Following the same pattern as RMS Processor Service
 */

import {
  ExtractedKeywords,
  ATSAnalysis,
  KeywordBatchResult,
  ATSOptimizationResult,
  IEnterpriseOptions,
  KeywordAnalysisResult,
  ResumeOptimizationSuggestions
} from '../../core/interfaces';
import { enterpriseKeywordProcessor } from './index';
import { jobQueue, JobPriority } from '../../infrastructure/queue';
import { realtimeService } from '../../infrastructure/realtime';
import { logger } from '../../monitoring/logging';
import { performanceAnalytics } from '../../monitoring/analytics';
// Note: Firebase Admin will be imported lazily when needed to avoid initialization errors

// Lazy load Firebase Admin to avoid initialization errors
let db: any = null;
const getDb = async () => {
  if (!db) {
    const { adminDb } = await import('@/lib/core/auth/firebase-admin');
    db = adminDb;
  }
  return db;
};


export interface KeywordServiceOptions extends IEnterpriseOptions {
  async?: boolean;
  webhook?: string;
  includeRecommendations?: boolean;
  targetScore?: number;
  industryContext?: string;
  useAdvancedNLP?: boolean;
  saveToFirestore?: boolean;
}

/**
 * Keyword Processor Service
 * Provides high-level API for keyword extraction and ATS optimization
 */
export class ATSProcessorService {
  /**
   * Extract keywords from job description
   */
  async extractJobKeywords(
    jobDescription: string,
    resumeId: string,
    userId: string,
    options: KeywordServiceOptions = {}
  ): Promise<KeywordAnalysisResult | { jobId: string; status: string }> {

    // If async processing is requested, queue the job
    if (options.async) {
      return await this.queueKeywordExtraction(jobDescription, resumeId, userId, options);
    }

    // Otherwise, process synchronously
    return await this.extractSync(jobDescription, resumeId, userId, options);
  }

  /**
   * Extract keywords synchronously
   */
  private async extractSync(
    jobDescription: string,
    resumeId: string,
    userId: string,
    options: KeywordServiceOptions
  ): Promise<KeywordAnalysisResult> {
    try {
      logger.info('Extracting keywords from job description', {
        resumeId,
        userId,
        textLength: jobDescription.length
      });

      // Extract keywords with enterprise features
      const result = await enterpriseKeywordProcessor.extractKeywords(
        jobDescription,
        resumeId,
        {
          ...options,
          userId,
          industryContext: options.industryContext,
          useAdvancedNLP: options.useAdvancedNLP
        }
      );

      if (!result.success) {
        throw new Error(result.errors?.[0]?.message || 'Keyword extraction failed');
      }

      // Transform result to KeywordAnalysisResult
      const analysisResult: KeywordAnalysisResult = {
        status: 'success',
        resumeId,
        keywords: result.data!.keywords,
        skills: result.data!.skills,
        requirements: result.data!.requirements || [],
        metadata: {
          processingTime: result.metrics?.processingTime || 0,
          keywordCount: result.data!.keywords.length,
          skillCount: result.data!.skills.length,
          method: options.useAdvancedNLP ? 'advanced' : 'local',
          cacheHit: result.metrics?.cacheHit || false
        }
      };

      // Save to Firestore if requested
      if (options.saveToFirestore) {
        await this.saveKeywordsToFirestore(resumeId, userId, analysisResult);
      }

      // Send real-time update if enabled
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'keyword_extraction_complete',
          timestamp: new Date(),
          data: {
            resumeId,
            keywordCount: analysisResult.keywords.length,
            skillCount: analysisResult.skills.length
          }
        });
      }

      // Call webhook if provided
      if (options.webhook) {
        await this.callWebhook(options.webhook, analysisResult);
      }

      return analysisResult;

    } catch (error) {
      logger.error('Keyword extraction failed', {
        resumeId,
        userId,
        error
      });

      throw error;
    }
  }

  /**
   * Queue keyword extraction for async processing
   */
  private async queueKeywordExtraction(
    jobDescription: string,
    resumeId: string,
    userId: string,
    options: KeywordServiceOptions
  ): Promise<{ jobId: string; status: string }> {
    try {
      const job = await jobQueue.addJob(
        'keyword_extraction',
        {
          jobDescription,
          resumeId,
          userId,
          options: {
            industryContext: options.industryContext,
            useAdvancedNLP: options.useAdvancedNLP,
            includeRecommendations: options.includeRecommendations,
            targetScore: options.targetScore,
            saveToFirestore: options.saveToFirestore,
            webhook: options.webhook
          }
        },
        {
          priority: options.priority || JobPriority.NORMAL,
          metadata: { userId, resumeId }
        }
      );

      logger.info('Keyword extraction job queued', {
        jobId: job.id,
        resumeId,
        userId
      });

      // Send real-time update
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'keyword_extraction_queued',
          timestamp: new Date(),
          data: {
            jobId: job.id,
            resumeId
          }
        });
      }

      return {
        jobId: job.id,
        status: 'queued'
      };

    } catch (error) {
      logger.error('Failed to queue keyword extraction', {
        resumeId,
        userId,
        error
      });
      throw error;
    }
  }

  /**
   * Analyze resume-job match and get ATS score
   */
  async analyzeATSMatch(
    resumeId: string,
    userId: string,
    options: KeywordServiceOptions = {}
  ): Promise<ATSOptimizationResult> {
    const timer = performanceAnalytics.startTimer('ats.match.analysis', {
      userId,
      resumeId
    });

    try {
      // Get resume data from Firestore
      const database = await getDb();
      const resumeDoc = await database
        .collection('resumes')
        .doc(userId)
        .collection('resumes')
        .doc(resumeId)
        .get();

      if (!resumeDoc.exists) {
        throw new Error('Resume not found');
      }

      const resumeData = resumeDoc.data();

      // Check if job keywords exist
      if (!resumeData?.job_info?.keywords || resumeData.job_info.keywords.length === 0) {
        throw new Error('No job keywords found. Please extract keywords first.');
      }

      // Analyze match
      const analysisResult = await enterpriseKeywordProcessor.analyzeMatch(
        resumeData,
        {
          keywords: resumeData.job_info.keywords,
          skills: resumeData.job_info.parsedData?.skills || [],
          requirements: resumeData.job_info.parsedData?.requirements || []
        },
        {
          ...options,
          userId,
          includeRecommendations: options.includeRecommendations,
          targetScore: options.targetScore
        }
      );

      if (!analysisResult.success) {
        throw new Error(analysisResult.errors?.[0]?.message || 'ATS analysis failed');
      }

      // Create optimization result
      const optimizationResult: ATSOptimizationResult = {
        status: 'success',
        resumeId,
        atsScore: analysisResult.data!.overallScore,
        breakdown: analysisResult.data!.breakdown,
        matchedKeywords: analysisResult.data!.matchedKeywords,
        missingKeywords: analysisResult.data!.missingKeywords,
        recommendations: analysisResult.data!.recommendations || [],
        metadata: {
          analysisTime: analysisResult.metrics?.processingTime || 0,
          recommendationCount: analysisResult.data!.recommendations?.length || 0
        }
      };

      // Save analysis to Firestore
      if (options.saveToFirestore) {
        await this.saveATSAnalysisToFirestore(resumeId, userId, optimizationResult);
      }

      // Send real-time update
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'ats_analysis_complete',
          timestamp: new Date(),
          data: {
            resumeId,
            atsScore: optimizationResult.atsScore,
            recommendationCount: optimizationResult.recommendations.length
          }
        });
      }

      return optimizationResult;

    } catch (error) {
      logger.error('ATS analysis failed', {
        resumeId,
        userId,
        error
      });
      throw error;

    } finally {
      await timer();
    }
  }

  /**
   * Generate tailored resume content based on job keywords
   */
  async generateTailoredContent(
    resumeId: string,
    userId: string,
    options: KeywordServiceOptions & { sections?: string[] } = {}
  ): Promise<ResumeOptimizationSuggestions> {
    try {
      logger.info('Generating tailored resume content', {
        resumeId,
        userId,
        sections: options.sections
      });

      // Get resume and job data
      const database = await getDb();
      const resumeDoc = await database
        .collection('resumes')
        .doc(userId)
        .collection('resumes')
        .doc(resumeId)
        .get();

      if (!resumeDoc.exists) {
        throw new Error('Resume not found');
      }

      const resumeData = resumeDoc.data();
      const jobKeywords = resumeData?.job_info?.keywords || [];
      const missingKeywords = resumeData?.keywordAnalysis?.missingKeywords || [];

      // Generate suggestions for each section
      const suggestions: ResumeOptimizationSuggestions = {
        resumeId,
        sections: {},
        overallStrategy: '',
        estimatedScoreImprovement: 0
      };

      // Generate summary suggestions
      if (!options.sections || options.sections.includes('summary')) {
        suggestions.sections.summary = await this.generateSummarySuggestions(
          resumeData,
          jobKeywords,
          missingKeywords
        );
      }

      // Generate experience suggestions
      if (!options.sections || options.sections.includes('experience')) {
        suggestions.sections.experience = await this.generateExperienceSuggestions(
          resumeData,
          jobKeywords,
          missingKeywords
        );
      }

      // Generate skills suggestions
      if (!options.sections || options.sections.includes('skills')) {
        suggestions.sections.skills = await this.generateSkillsSuggestions(
          resumeData,
          jobKeywords,
          missingKeywords
        );
      }

      // Calculate estimated improvement
      suggestions.estimatedScoreImprovement = this.calculateScoreImprovement(
        suggestions,
        resumeData.atsScore || 0
      );

      // Generate overall strategy
      suggestions.overallStrategy = this.generateOptimizationStrategy(
        resumeData,
        jobKeywords,
        suggestions
      );

      // Save suggestions if requested
      if (options.saveToFirestore) {
        await resumeDoc.ref.update({
          optimizationSuggestions: suggestions,
          'updatedAt': new Date()
        });
      }

      return suggestions;

    } catch (error) {
      logger.error('Failed to generate tailored content', {
        resumeId,
        userId,
        error
      });
      throw error;
    }
  }

  /**
   * Process multiple job descriptions in batch
   */
  async processBatch(
    jobs: Array<{
      jobId: string;
      jobDescription: string;
      resumeId: string;
    }>,
    userId: string,
    options: KeywordServiceOptions & { concurrency?: number } = {}
  ): Promise<KeywordBatchResult> {
    const batchId = `kw_batch_${Date.now()}`;

    logger.info('Starting batch keyword processing', {
      batchId,
      jobCount: jobs.length,
      userId
    });

    const timer = performanceAnalytics.startTimer('keyword.batch.processing', {
      userId,
      jobCount: jobs.length
    });

    try {
      // Process jobs
      const results = await enterpriseKeywordProcessor.processBatch(
        jobs.map(job => ({
          id: job.jobId,
          description: job.jobDescription,
          resumeId: job.resumeId
        })),
        {
          ...options,
          userId,
          concurrency: options.concurrency || 3
        }
      );

      // Calculate statistics
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      const batchResult: KeywordBatchResult = {
        batchId,
        total: jobs.length,
        successful,
        failed,
        jobs: jobs.map((job, index) => {
          const result = results[index];
          return {
            jobId: job.jobId,
            resumeId: job.resumeId,
            status: result.success ? 'success' : 'error',
            keywords: result.success ? result.data?.keywords : undefined,
            error: result.errors?.[0]?.message
          };
        })
      };

      // Record metrics
      await performanceAnalytics.recordMetric(
        'keyword.batch.success_rate',
        successful / jobs.length,
        'gauge' as any,
        { batchId, userId }
      );

      // Send real-time update
      if (options.enableRealTimeUpdates) {
        await realtimeService.sendUpdate(userId, {
          type: 'keyword_batch_complete',
          timestamp: new Date(),
          data: {
            batchId,
            total: jobs.length,
            successful,
            failed
          }
        });
      }

      return batchResult;

    } finally {
      await timer();
    }
  }

  /**
   * Get keyword extraction statistics
   */
  async getStats(): Promise<any> {
    return enterpriseKeywordProcessor.getStats();
  }

  /**
   * Clear keyword cache
   */
  async clearCache(): Promise<void> {
    await enterpriseKeywordProcessor.clearCache();
    logger.info('Keyword processor cache cleared');
  }

  /**
   * Save keywords to Firestore
   */
  private async saveKeywordsToFirestore(
    resumeId: string,
    userId: string,
    analysisResult: KeywordAnalysisResult
  ): Promise<void> {
    try {
      const database = await getDb();
      await database
        .collection('resumes')
        .doc(userId)
        .collection('resumes')
        .doc(resumeId)
        .update({
          'job_info.keywords': analysisResult.keywords,
          'job_info.parsedData': {
            skills: analysisResult.skills,
            requirements: analysisResult.requirements
          },
          'job_info.updated_at': new Date(),
          'keywordAnalysis': {
            extractedAt: new Date(),
            keywordCount: analysisResult.keywords.length,
            skillCount: analysisResult.skills.length,
            method: analysisResult.metadata.method
          },
          'updatedAt': new Date()
        });

      logger.info('Keywords saved to Firestore', {
        resumeId,
        userId,
        keywordCount: analysisResult.keywords.length
      });

    } catch (error) {
      logger.error('Failed to save keywords to Firestore', {
        resumeId,
        userId,
        error
      });
      throw error;
    }
  }

  /**
   * Save ATS analysis to Firestore
   */
  private async saveATSAnalysisToFirestore(
    resumeId: string,
    userId: string,
    analysisResult: ATSOptimizationResult
  ): Promise<void> {
    try {
      const database = await getDb();
      await database
        .collection('resumes')
        .doc(userId)
        .collection('resumes')
        .doc(resumeId)
        .update({
          'atsScore': analysisResult.atsScore,
          'atsAnalysis': {
            score: analysisResult.atsScore,
            breakdown: analysisResult.breakdown,
            matchedKeywordCount: analysisResult.matchedKeywords.length,
            missingKeywordCount: analysisResult.missingKeywords.length,
            analyzedAt: new Date()
          },
          'keywordAnalysis.matchedKeywords': analysisResult.matchedKeywords,
          'keywordAnalysis.missingKeywords': analysisResult.missingKeywords,
          'keywordAnalysis.recommendations': analysisResult.recommendations,
          'updatedAt': new Date()
        });

      logger.info('ATS analysis saved to Firestore', {
        resumeId,
        userId,
        atsScore: analysisResult.atsScore
      });

    } catch (error) {
      logger.error('Failed to save ATS analysis to Firestore', {
        resumeId,
        userId,
        error
      });
      throw error;
    }
  }

  /**
   * Generate summary suggestions
   */
  private async generateSummarySuggestions(
    resumeData: any,
    jobKeywords: any[],
    missingKeywords: any[]
  ): Promise<any> {
    const criticalMissing = missingKeywords
      .filter(kw => kw.importance === 'critical')
      .slice(0, 3);

    return {
      currentLength: resumeData.parsedData?.summary?.length || 0,
      suggestedLength: 150,
      keywordsToInclude: criticalMissing.map(kw => kw.keyword),
      example: `Results-driven professional with expertise in ${criticalMissing.map(kw => kw.keyword).join(', ')}...`
    };
  }

  /**
   * Generate experience suggestions
   */
  private async generateExperienceSuggestions(
    resumeData: any,
    jobKeywords: any[],
    missingKeywords: any[]
  ): Promise<any[]> {
    const experiences = resumeData.parsedData?.experiences || [];

    return experiences.map((exp: any, index: number) => {
      const relevantKeywords = missingKeywords
        .filter(kw => kw.suggestedSections?.includes('experience'))
        .slice(0, 2);

      return {
        experienceIndex: index,
        company: exp.company,
        suggestedKeywords: relevantKeywords.map(kw => kw.keyword),
        bulletPointSuggestions: [
          `Demonstrate experience with ${relevantKeywords[0]?.keyword || 'relevant skill'}`,
          `Quantify achievements related to ${exp.title}`
        ]
      };
    });
  }

  /**
   * Generate skills suggestions
   */
  private async generateSkillsSuggestions(
    resumeData: any,
    jobKeywords: any[],
    missingKeywords: any[]
  ): Promise<any> {
    const currentSkills = resumeData.parsedData?.skillCategories
      ?.flatMap((cat: any) => cat.skills.map((s: any) => s.name)) || [];

    const skillsToAdd = missingKeywords
      .filter(kw =>
        kw.category === 'skill' &&
        !currentSkills.some((s: string) =>
          s.toLowerCase().includes(kw.keyword.toLowerCase())
        )
      )
      .map(kw => kw.keyword);

    return {
      currentSkillCount: currentSkills.length,
      skillsToAdd: skillsToAdd.slice(0, 10),
      skillsToEmphasize: jobKeywords
        .filter(kw => kw.importance === 'required')
        .map(kw => kw.keyword)
        .slice(0, 5),
      suggestedCategories: ['Technical Skills', 'Tools & Technologies', 'Soft Skills']
    };
  }

  /**
   * Calculate estimated score improvement
   */
  private calculateScoreImprovement(
    suggestions: ResumeOptimizationSuggestions,
    currentScore: number
  ): number {
    let improvement = 0;

    // Each missing critical keyword could add 5-10 points
    const keywordsToAdd = suggestions.sections.skills?.skillsToAdd?.length || 0;
    improvement += Math.min(keywordsToAdd * 5, 25);

    // Summary optimization could add 5-10 points
    if (suggestions.sections.summary) {
      improvement += 7;
    }

    // Experience optimization could add 10-15 points
    if (suggestions.sections.experience?.length) {
      improvement += 12;
    }

    // Cap total improvement at reasonable level
    const maxScore = 95;
    const potentialScore = currentScore + improvement;

    if (potentialScore > maxScore) {
      improvement = maxScore - currentScore;
    }

    return improvement;
  }

  /**
   * Generate overall optimization strategy
   */
  private generateOptimizationStrategy(
    resumeData: any,
    jobKeywords: any[],
    suggestions: ResumeOptimizationSuggestions
  ): string {
    const currentScore = resumeData.atsScore || 0;
    const targetScore = currentScore + suggestions.estimatedScoreImprovement;

    let strategy = `Current ATS Score: ${currentScore}%. Target: ${targetScore}%. `;

    if (currentScore < 60) {
      strategy += 'Focus on adding missing critical keywords and restructuring content. ';
    } else if (currentScore < 80) {
      strategy += 'Enhance keyword density and optimize bullet points in experience section. ';
    } else {
      strategy += 'Fine-tune keyword placement and ensure natural integration. ';
    }

    const missingCriticalCount = resumeData.keywordAnalysis?.missingKeywords
      ?.filter((kw: any) => kw.importance === 'critical').length || 0;

    if (missingCriticalCount > 0) {
      strategy += `Priority: Add ${missingCriticalCount} critical missing keywords. `;
    }

    return strategy;
  }

  /**
   * Call webhook with processing result
   */
  private async callWebhook(
    webhookUrl: string,
    result: any
  ): Promise<void> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'keyword_processing_complete',
          timestamp: new Date().toISOString(),
          result
        })
      });

      if (!response.ok) {
        logger.warn('Webhook call failed', {
          webhookUrl,
          status: response.status
        });
      }

    } catch (error) {
      logger.error('Failed to call webhook', {
        webhookUrl,
        error: error.message
      });
    }
  }
}

// Export singleton instance
export const atsProcessorService = new ATSProcessorService();

// Backwards compatibility
export const keywordProcessorService = atsProcessorService;
