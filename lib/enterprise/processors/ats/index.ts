/**
 * Enterprise Keyword Processor Integration
 * Integrates keyword extraction and ATS optimization with enterprise-grade features
 * Following the same architecture pattern as RMS Processor
 */

import { EventEmitter } from 'events';
import {
  ProcessingResult,
  ProcessingMetrics,
  ProcessingError,
  KeywordExtractionConfig
} from '../../core/types';
import {
  IKeywordProcessor,
  IEnterpriseOptions,
  ExtractedKeywords,
  ATSAnalysis,
  KeywordMetadata
} from '../../core/interfaces';
import { logger } from '../../monitoring/logging';
import { performanceAnalytics } from '../../monitoring/analytics';
import { circuitBreakerManager } from '../../resilience/circuit-breaker';
import { recoveryOrchestrator } from '../../resilience/recovery';
import { ValidationPipeline } from '../../security/validators';
import { auditLogger } from '../../compliance/audit';
import { cache } from '../../infrastructure/cache';
import { AnalyzeAPI } from '@/lib/api/analyze';
import { skillsTaxonomyService } from '../../services/skills-taxonomy';

/**
 * Configuration for Keyword Processor
 */
export interface KeywordProcessorConfig {
  // NLP Configuration
  spacyModel?: string;
  spacyEndpoint?: string;

  // External APIs
  escoApiUrl?: string;
  onetApiUrl?: string;
  awsComprehendEnabled?: boolean;

  // Processing Options
  maxTextLength?: number;
  timeout?: number;
  batchSize?: number;

  // Caching
  cacheEnabled?: boolean;
  cacheTTL?: number;

  // Validation
  validation?: {
    strict?: boolean;
    minKeywords?: number;
    maxKeywords?: number;
  };

  // Cost Control
  costControl?: {
    maxApiCallsPerDay?: number;
    fallbackToLocal?: boolean;
    budgetThreshold?: number;
  };
}

/**
 * Enterprise Keyword Processor
 * Wraps native keyword extraction with enterprise features
 */
export class EnterpriseKeywordProcessor extends EventEmitter implements IKeywordProcessor {
  private nativeProcessor: any;
  private config: KeywordProcessorConfig;
  private validationPipeline: ValidationPipeline;
  private processingCount: number = 0;
  private dailyApiCalls: number = 0;
  private lastResetDate: Date = new Date();

  constructor(config: KeywordProcessorConfig = {}) {
    super();

    this.config = {
      spacyModel: config.spacyModel || 'en_core_web_sm',
      spacyEndpoint: config.spacyEndpoint || process.env.SPACY_ENDPOINT || 'http://localhost:8080',
      escoApiUrl: config.escoApiUrl || 'https://ec.europa.eu/esco/api',
      onetApiUrl: config.onetApiUrl || 'https://services.onetcenter.org/ws',
      awsComprehendEnabled: config.awsComprehendEnabled || false,
      maxTextLength: config.maxTextLength || 50000,
      timeout: config.timeout || 30000,
      batchSize: config.batchSize || 10,
      cacheEnabled: config.cacheEnabled !== false,
      cacheTTL: config.cacheTTL || 86400, // 24 hours
      validation: {
        strict: config.validation?.strict !== false,
        minKeywords: config.validation?.minKeywords || 5,
        maxKeywords: config.validation?.maxKeywords || 100
      },
      costControl: {
        maxApiCallsPerDay: config.costControl?.maxApiCallsPerDay || 1000,
        fallbackToLocal: config.costControl?.fallbackToLocal !== false,
        budgetThreshold: config.costControl?.budgetThreshold || 50 // $50/day
      }
    };

    this.validationPipeline = new ValidationPipeline();
    this.initializeNativeProcessor();
    this.setupDailyReset();
  }

  /**
   * Initialize the processor - we'll use the existing AnalyzeAPI and skills taxonomy service
   */
  private async initializeNativeProcessor(): Promise<void> {
    try {
      // Initialize skills taxonomy service
      await skillsTaxonomyService.initialize();
      
      logger.info('ATS processor initialized', {
        mode: 'api-wrapper',
        cacheEnabled: this.config.cacheEnabled,
        skillsTaxonomyEnabled: true
      });
    } catch (error) {
      logger.warn('Failed to initialize skills taxonomy service, continuing without it', { error });
      
      logger.info('ATS processor initialized', {
        mode: 'api-wrapper',
        cacheEnabled: this.config.cacheEnabled,
        skillsTaxonomyEnabled: false
      });
    }
  }

  /**
   * Setup daily API call counter reset
   */
  private setupDailyReset(): void {
    setInterval(() => {
      const now = new Date();
      if (now.getDate() !== this.lastResetDate.getDate()) {
        this.dailyApiCalls = 0;
        this.lastResetDate = now;
        logger.info('Daily API call counter reset');
      }
    }, 60000); // Check every minute
  }

  /**
   * Extract keywords from job description with enterprise features
   * This method wraps the AnalyzeAPI.associateJob call with enterprise features
   */
  async extractKeywords(
    jobDescription: string,
    resumeId: string,
    options: IEnterpriseOptions & {
      jobTitle?: string;
      company?: string;
      industryContext?: string;
      useAdvancedNLP?: boolean;
      targetScore?: number;
    } = {}
  ): Promise<ProcessingResult<ExtractedKeywords>> {
    const startTime = Date.now();
    const processId = `kw_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Start metrics
    const timer = performanceAnalytics.startTimer('keyword.extraction', {
      userId: options.userId,
      resumeId,
      textLength: jobDescription.length
    });

    // Emit processing start event
    this.emit('extraction:start', { processId, resumeId });

    try {
      this.processingCount++;

      // Audit log
      if (options.enableAuditLog) {
        await auditLogger.log({
          action: 'keyword_extraction_started',
          resourceType: 'job_description',
          resourceId: resumeId,
          userId: options.userId,
          metadata: {
            processId,
            textLength: jobDescription.length,
            industryContext: options.industryContext,
            useAdvancedNLP: options.useAdvancedNLP
          }
        });
      }

      // Check cache first
      const cacheKey = this.getCacheKey(jobDescription, options);
      if (this.config.cacheEnabled) {
        const cached = await cache.get(cacheKey);
        if (cached) {
          logger.debug('Keyword extraction cache hit', { processId, cacheKey });
          this.emit('extraction:cached', { processId, cacheKey });

          return {
            success: true,
            data: cached as ExtractedKeywords,
            metrics: {
              totalTime: Date.now() - startTime,
              cacheHit: true
            }
          };
        }
      }

      // Validate input
      if (options.enableValidation) {
        const validationResult = await this.validateJobDescription(jobDescription);
        if (!validationResult.isValid) {
          throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      // Check cost controls
      const shouldUseAdvanced = await this.checkCostControls(options.useAdvancedNLP);

      // Use circuit breaker for the keyword extraction
      const breaker = circuitBreakerManager.getBreaker('keyword_extraction');
      const apiResult = await breaker.execute(async () => {
        // Direct keyword extraction without API calls to avoid circular dependency
        return await this.extractKeywordsDirectly(jobDescription, options);
      });

      // Extract the keywords from the API response
      const extractedKeywords: ExtractedKeywords = {
        keywords: apiResult.keywordAnalysis?.keywords || [],
        skills: apiResult.keywordAnalysis?.skills || [],
        requirements: apiResult.keywordAnalysis?.requirements || [],
        metadata: apiResult.keywordAnalysis?.metadata || {
          extractionMethod: shouldUseAdvanced ? 'advanced' : 'local',
          processingTime: Date.now() - startTime,
          keywordCount: 0,
          skillCount: 0
        }
      };

      // Enhance skills with ESCO and O*NET data if enabled
      if (extractedKeywords.skills.length > 0 && process.env.SKILLS_ENHANCEMENT_ENABLED !== 'false') {
        try {
          const skillNames = extractedKeywords.skills.map((skill: any) => 
            typeof skill === 'string' ? skill : skill.name || skill.skill
          ).filter(Boolean); // Remove empty/null skills
          
          if (skillNames.length === 0) {
            logger.debug('No valid skill names found for enhancement');
          } else {
            const enrichedSkills = await skillsTaxonomyService.enrichSkills(skillNames, {
              providers: ['esco', 'onet'],
              limit: 5,
              includeRelations: true,
              language: 'en'
            });

            // Only update if we got meaningful results
            if (enrichedSkills.length > 0) {
              // Update skills with taxonomy data
              extractedKeywords.skills = enrichedSkills.map((enriched, index) => {
                const skill: any = {
                  original: skillNames[index] || '',
                  name: enriched.originalSkill,
                  matches: enriched.matches || [],
                  categories: enriched.categories || [],
                  relatedSkills: (enriched.relatedSkills || []).slice(0, 3),
                  occupations: (enriched.occupations || []).slice(0, 3),
                  confidence: enriched.matches.length > 0 ? enriched.matches[0].relevanceScore : 0.5
                };
                
                // Only add escoUri if it exists
                const escoMatch = enriched.matches.find(m => m.provider === 'esco');
                if (escoMatch?.uri) {
                  skill.escoUri = escoMatch.uri;
                }
                
                // Only add onetId if it exists
                const onetMatch = enriched.matches.find(m => m.provider === 'onet');
                if (onetMatch?.id) {
                  skill.onetId = onetMatch.id;
                }
                
                return skill;
              });

              logger.info('Skills enhanced with taxonomy data', {
                originalCount: skillNames.length,
                enrichedCount: enrichedSkills.length,
                escoMatches: enrichedSkills.filter(e => e.matches.some(m => m.provider === 'esco')).length,
                onetMatches: enrichedSkills.filter(e => e.matches.some(m => m.provider === 'onet')).length
              });

              // Also enhance with occupation data
              try {
                const enhancedWithOccupations = await this.enhanceWithOccupationData(extractedKeywords, {
                  jobTitle: options.jobTitle,
                  industryContext: options.industryContext,
                  includeRelatedOccupations: true
                });

                // Update with occupation-enhanced data
                extractedKeywords.keywords = enhancedWithOccupations.keywords;
                extractedKeywords.metadata = enhancedWithOccupations.metadata;
                if (enhancedWithOccupations.occupations) {
                  extractedKeywords.occupations = enhancedWithOccupations.occupations;
                }
              } catch (occupationError) {
                logger.warn('Failed to enhance with occupation data', { 
                  error: occupationError instanceof Error ? occupationError.message : 'Unknown error'
                });
              }
            } else {
              logger.debug('No enrichment results obtained from taxonomy services');
            }
          }
        } catch (error) {
          logger.warn('Failed to enhance skills with taxonomy data', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            skillsCount: extractedKeywords.skills.length
          });
          // Continue with original skills if enhancement fails
        }
      } else if (process.env.SKILLS_ENHANCEMENT_ENABLED === 'false') {
        logger.debug('Skills enhancement disabled by configuration');
      }

      // Cache the results
      if (this.config.cacheEnabled && extractedKeywords.keywords.length > 0) {
        await cache.set(cacheKey, extractedKeywords);
      }

      // Transform to enterprise format
      const result: ProcessingResult<ExtractedKeywords> = {
        success: true,
        data: extractedKeywords,
        metrics: {
          totalTime: Date.now() - startTime,
          processingTime: Date.now() - startTime,
          keywordsExtracted: extractedKeywords.keywords.length,
          skillsIdentified: extractedKeywords.skills.length,
          apiCallsUsed: shouldUseAdvanced ? 1 : 0,
          cacheHit: false
        }
      };

      // Record success metrics
      await performanceAnalytics.recordMetric(
        'keyword.extraction.success',
        1,
        'counter' as any,
        {
          method: shouldUseAdvanced ? 'advanced' : 'local',
          keywordCount: extractedKeywords.keywords.length
        }
      );

      // Emit completion event
      this.emit('extraction:complete', {
        processId,
        keywordCount: extractedKeywords.keywords.length,
        processingTime: result.metrics!.processingTime
      });

      // Audit success
      if (options.enableAuditLog) {
        await auditLogger.log({
          action: 'keyword_extraction_completed',
          resourceType: 'job_description',
          resourceId: resumeId,
          userId: options.userId,
          result: 'success',
          metadata: {
            processId,
            keywordsExtracted: extractedKeywords.keywords.length,
            skillsIdentified: extractedKeywords.skills.length,
            processingTime: result.metrics!.processingTime
          }
        });
      }

      return result;

    } catch (error) {
      // Record error metrics
      await performanceAnalytics.recordMetric(
        'keyword.extraction.error',
        1,
        'counter' as any,
        { error: error.message }
      );

      // Emit error event
      this.emit('extraction:error', {
        processId,
        error: error.message
      });

      // Attempt recovery if enabled
      if (options.enableRecovery) {
        const recoveryResult = await recoveryOrchestrator.recover(
          error,
          'keyword_extraction',
          {
            userId: options.userId,
            operationFn: () => this.extractKeywords(jobDescription, resumeId, options),
            cacheKey: `recovery_${cacheKey}`
          }
        );

        if (recoveryResult.success) {
          return recoveryResult.result;
        }
      }

      // Audit failure
      if (options.enableAuditLog) {
        await auditLogger.log({
          action: 'keyword_extraction_failed',
          resourceType: 'job_description',
          resourceId: resumeId,
          userId: options.userId,
          result: 'failure',
          metadata: {
            processId,
            error: error.message,
            stack: error.stack
          }
        });
      }

      logger.error('Keyword extraction failed', {
        processId,
        resumeId,
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        errors: [{
          code: 'EXTRACTION_FAILED',
          message: error.message,
          severity: 'critical'
        }]
      };

    } finally {
      this.processingCount--;
      await timer();
    }
  }

  /**
   * Analyze resume-job match with ATS scoring
   * This method wraps the AnalyzeAPI.analyzeATS call with enterprise features
   */
  async analyzeMatch(
    resumeData: any,
    jobData: any,
    options: IEnterpriseOptions & {
      includeRecommendations?: boolean;
      targetScore?: number;
      userId?: string;
    } = {}
  ): Promise<ProcessingResult<ATSAnalysis>> {
    const startTime = Date.now();
    const analysisId = `ats_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const timer = performanceAnalytics.startTimer('ats.analysis', {
      userId: options.userId,
      resumeId: resumeData?.id || 'unknown'
    });

    try {
      logger.info('Starting ATS analysis', {
        analysisId,
        resumeId: resumeData?.id,
        includeRecommendations: options.includeRecommendations
      });

      // Use circuit breaker for the API call
      const breaker = circuitBreakerManager.getBreaker('ats_analysis');
      const apiResult = await breaker.execute(async () => {
        const response = await AnalyzeAPI.analyzeATS(
          resumeData?.id || '',
          options.userId || '',
          {
            includeRecommendations: options.includeRecommendations !== false,
            targetATSScore: options.targetScore,
            enableValidation: options.enableValidation,
            enableAuditLogging: options.enableAuditLog,
            enableCostControl: true
          }
        );

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to analyze ATS match');
        }

        return response.data;
      });

      // Transform API response to ATSAnalysis format
      const analysis: ATSAnalysis = {
        overallScore: apiResult.atsScore,
        keywordMatchScore: apiResult.breakdown.keywordMatch,
        skillsScore: apiResult.breakdown.skillsAlignment,
        experienceScore: apiResult.breakdown.experienceRelevance,
        matchedKeywords: apiResult.matchedKeywords,
        missingKeywords: apiResult.missingKeywords,
        recommendations: apiResult.recommendations,
        breakdown: {
          keywords: apiResult.breakdown.keywordMatch,
          skills: apiResult.breakdown.skillsAlignment,
          experience: apiResult.breakdown.experienceRelevance,
          education: apiResult.breakdown.educationMatch,
          formatting: apiResult.breakdown.formatting
        }
      };

      const result: ProcessingResult<ATSAnalysis> = {
        success: true,
        data: analysis,
        metrics: {
          totalTime: Date.now() - startTime,
          processingTime: Date.now() - startTime,
          atsScore: analysis.overallScore,
          recommendationCount: analysis.recommendations?.length || 0
        }
      };

      // Record metrics
      await performanceAnalytics.recordMetric(
        'ats.score',
        analysis.overallScore,
        'gauge' as any,
        { resumeId: resumeData?.id }
      );

      // Audit log
      if (options.enableAuditLog) {
        await auditLogger.log({
          action: 'ats_analysis_completed',
          resourceType: 'resume_analysis',
          resourceId: resumeData?.id || '',
          userId: options.userId || '',
          result: 'success',
          metadata: {
            analysisId,
            atsScore: analysis.overallScore,
            recommendationCount: analysis.recommendations?.length || 0
          }
        });
      }

      return result;

    } catch (error) {
      logger.error('ATS analysis failed', {
        analysisId,
        error: error.message
      });

      // Audit failure
      if (options.enableAuditLog) {
        await auditLogger.log({
          action: 'ats_analysis_failed',
          resourceType: 'resume_analysis',
          resourceId: resumeData?.id || '',
          userId: options.userId || '',
          result: 'failure',
          metadata: {
            analysisId,
            error: error.message
          }
        });
      }

      return {
        success: false,
        errors: [{
          code: 'ANALYSIS_FAILED',
          message: error.message,
          severity: 'high'
        }]
      };

    } finally {
      await timer();
    }
  }

  /**
   * Batch process multiple job descriptions
   */
  async processBatch(
    jobs: Array<{ id: string; description: string; resumeId: string }>,
    options: IEnterpriseOptions & { concurrency?: number } = {}
  ): Promise<ProcessingResult[]> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    logger.info('Starting batch keyword extraction', {
      batchId,
      jobCount: jobs.length,
      concurrency: options.concurrency || 3
    });

    const timer = performanceAnalytics.startTimer('keyword.batch.processing', {
      userId: options.userId,
      jobCount: jobs.length
    });

    try {
      // Process in chunks to respect concurrency limits
      const concurrency = options.concurrency || 3;
      const results: ProcessingResult[] = [];

      for (let i = 0; i < jobs.length; i += concurrency) {
        const chunk = jobs.slice(i, i + concurrency);
        const chunkResults = await Promise.all(
          chunk.map(job =>
            this.extractKeywords(job.description, job.resumeId, options)
              .catch(error => ({
                success: false,
                errors: [{
                  code: 'BATCH_ITEM_FAILED',
                  message: error.message,
                  severity: 'high' as const
                }]
              }))
          )
        );
        results.push(...chunkResults);
      }

      // Calculate batch statistics
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      await performanceAnalytics.recordMetric(
        'keyword.batch.success_rate',
        successCount / jobs.length,
        'gauge' as any,
        { batchId }
      );

      logger.info('Batch keyword extraction completed', {
        batchId,
        total: jobs.length,
        success: successCount,
        failure: failureCount
      });

      return results;

    } catch (error) {
      logger.error('Batch keyword extraction failed', {
        batchId,
        error: error.message
      });

      throw error;

    } finally {
      await timer();
    }
  }

  /**
   * Enhance keywords with occupation data from taxonomies
   */
  async enhanceWithOccupationData(
    keywords: ExtractedKeywords,
    options: {
      jobTitle?: string;
      industryContext?: string;
      includeRelatedOccupations?: boolean;
    } = {}
  ): Promise<ExtractedKeywords> {
    try {
      // Extract skill names for occupation search
      const skillNames = keywords.skills.map((skill: any) => 
        typeof skill === 'string' ? skill : skill.name || skill.skill
      );

      if (skillNames.length === 0) return keywords;

      // Search for occupations related to these skills
      const occupationMatches = await skillsTaxonomyService.searchOccupations(skillNames, {
        providers: ['esco', 'onet'],
        limit: 10,
        industryContext: options.industryContext
      });

      // Filter occupations by job title if provided
      let relevantOccupations = occupationMatches;
      if (options.jobTitle) {
        const titleWords = options.jobTitle.toLowerCase().split(/\s+/);
        relevantOccupations = occupationMatches.filter(occ => 
          titleWords.some(word => 
            occ.title.toLowerCase().includes(word) || 
            occ.description.toLowerCase().includes(word)
          )
        ).slice(0, 5);

        // If no matches by title, keep top 3 by relevance
        if (relevantOccupations.length === 0) {
          relevantOccupations = occupationMatches.slice(0, 3);
        }
      }

      // Enhance keywords with occupation context
      const enhancedKeywords = [...keywords.keywords];
      const occupationKeywords = new Set<string>();

      for (const occupation of relevantOccupations) {
        // Add occupation title as a keyword if not already present
        const titleWords = occupation.title.split(/\s+/).filter(word => word.length > 2);
        for (const word of titleWords) {
          if (!enhancedKeywords.some(kw => 
            typeof kw === 'string' ? kw.toLowerCase() === word.toLowerCase() : 
            (kw.keyword || kw.name || '').toLowerCase() === word.toLowerCase()
          )) {
            occupationKeywords.add(word);
          }
        }

        // Extract relevant skills from occupation
        const occupationSkills = [...occupation.requiredSkills, ...occupation.optionalSkills];
        for (const skill of occupationSkills.slice(0, 3)) {
          if (!skillNames.some(s => s.toLowerCase() === skill.toLowerCase())) {
            occupationKeywords.add(skill);
          }
        }
      }

      // Add occupation-derived keywords
      for (const keyword of occupationKeywords) {
        enhancedKeywords.push({
          keyword: keyword,
          frequency: 1,
          category: 'occupation_derived' as any,
          importance: 'preferred' as any,
          variations: [],
          contexts: ['occupation_match'],
          source: 'taxonomy_enhancement'
        });
      }

      // Update metadata
      const enhancedMetadata = {
        ...keywords.metadata,
        occupationMatches: relevantOccupations.length,
        taxonomyEnhanced: true,
        enhancementSource: 'esco_onet'
      };

      return {
        ...keywords,
        keywords: enhancedKeywords,
        metadata: enhancedMetadata,
        occupations: relevantOccupations.map(occ => ({
          id: occ.id,
          title: occ.title,
          code: occ.code,
          provider: occ.provider,
          relevanceScore: occ.relevanceScore,
          matchedSkills: occ.matchedSkills
        }))
      };

    } catch (error) {
      logger.warn('Failed to enhance keywords with occupation data', { error });
      return keywords;
    }
  }

  /**
   * Post-process extracted keywords
   */
  private async postProcessKeywords(
    keywords: ExtractedKeywords,
    industryContext?: string
  ): Promise<ExtractedKeywords> {
    // Enhance with ESCO/O*NET data
    const enhanced = await this.enhanceWithTaxonomies(keywords);

    // Apply industry-specific filtering
    if (industryContext) {
      enhanced.keywords = this.filterByIndustry(enhanced.keywords, industryContext);
    }

    // Remove duplicates and rank by importance
    enhanced.keywords = this.rankKeywords(enhanced.keywords);

    // Ensure we meet min/max constraints
    if (enhanced.keywords.length < this.config.validation!.minKeywords!) {
      logger.warn('Too few keywords extracted', {
        found: enhanced.keywords.length,
        minimum: this.config.validation!.minKeywords
      });
    }

    if (enhanced.keywords.length > this.config.validation!.maxKeywords!) {
      enhanced.keywords = enhanced.keywords.slice(0, this.config.validation!.maxKeywords);
    }

    return enhanced;
  }

  /**
   * Enhance keywords with taxonomy data
   */
  private async enhanceWithTaxonomies(
    keywords: ExtractedKeywords
  ): Promise<ExtractedKeywords> {
    try {
      // Use ESCO API to enhance skills
      const escoEnhanced = await this.nativeProcessor.matcher.enhanceWithESCO(
        keywords.skills
      );

      keywords.skills = escoEnhanced;

      return keywords;
    } catch (error) {
      logger.warn('Taxonomy enhancement failed, using original keywords', {
        error: error.message
      });
      return keywords;
    }
  }

  /**
   * Filter keywords by industry context
   */
  private filterByIndustry(keywords: any[], industry: string): any[] {
    // Industry-specific filtering logic
    return keywords.filter(kw => {
      // Implementation would check industry relevance
      return true;
    });
  }

  /**
   * Rank keywords by importance
   */
  private rankKeywords(keywords: any[]): any[] {
    return keywords.sort((a, b) => {
      // Sort by importance: required > preferred > nice-to-have
      const importanceOrder = { required: 3, preferred: 2, 'nice-to-have': 1 };
      const aImportance = importanceOrder[a.importance] || 0;
      const bImportance = importanceOrder[b.importance] || 0;

      if (aImportance !== bImportance) {
        return bImportance - aImportance;
      }

      // Then by frequency
      return b.frequency - a.frequency;
    });
  }

  /**
   * Generate ATS optimization recommendations
   */
  private async generateRecommendations(
    resumeData: any,
    jobKeywords: ExtractedKeywords,
    analysis: ATSAnalysis,
    targetScore?: number
  ): Promise<any[]> {
    const recommendations = [];
    const target = targetScore || 80;

    if (analysis.overallScore < target) {
      // Add missing critical keywords
      const missingCritical = jobKeywords.keywords
        .filter(kw => kw.importance === 'required' && !analysis.matchedKeywords.includes(kw.keyword))
        .slice(0, 5);

      missingCritical.forEach(kw => {
        recommendations.push({
          type: 'add_keyword',
          priority: 'high',
          section: 'skills',
          keyword: kw.keyword,
          reason: `Critical skill "${kw.keyword}" appears ${kw.frequency} times in job description`,
          impact: Math.min(15, kw.frequency * 3)
        });
      });
    }

    return recommendations;
  }

  /**
   * Check cost controls before using advanced APIs
   */
  private async checkCostControls(requestedAdvanced?: boolean): Promise<boolean> {
    if (!requestedAdvanced) return false;

    // Check daily API call limit
    if (this.dailyApiCalls >= this.config.costControl!.maxApiCallsPerDay!) {
      logger.warn('Daily API call limit reached', {
        current: this.dailyApiCalls,
        limit: this.config.costControl!.maxApiCallsPerDay
      });

      return this.config.costControl!.fallbackToLocal!;
    }

    // Check estimated cost
    const estimatedCost = this.dailyApiCalls * 0.0001; // Example cost per call
    if (estimatedCost >= this.config.costControl!.budgetThreshold!) {
      logger.warn('Budget threshold reached', {
        estimatedCost,
        threshold: this.config.costControl!.budgetThreshold
      });

      return false;
    }

    return true;
  }

  /**
   * Validate job description
   */
  private async validateJobDescription(
    jobDescription: string
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!jobDescription || jobDescription.trim().length === 0) {
      errors.push('Job description cannot be empty');
    }

    if (jobDescription.length > this.config.maxTextLength!) {
      errors.push(`Job description exceeds maximum length of ${this.config.maxTextLength} characters`);
    }

    if (jobDescription.length < 100) {
      errors.push('Job description too short for meaningful analysis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get cache key for keyword extraction
   */
  private getCacheKey(text: string, options: any): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(text + JSON.stringify(options))
      .digest('hex');

    return `keywords:${hash}`;
  }

  /**
   * Get processor statistics
   */
  getStats(): any {
    return {
      activeProcessing: this.processingCount,
      dailyApiCalls: this.dailyApiCalls,
      cacheEnabled: this.config.cacheEnabled,
      lastReset: this.lastResetDate
    };
  }

  /**
   * Clear processor cache
   */
  async clearCache(): Promise<void> {
    await cache.flushPattern('keywords:*');
    logger.info('Keyword processor cache cleared');
  }

  /**
   * Direct keyword extraction using Ollama (avoids circular API calls)
   */
  private async extractKeywordsDirectly(
    jobDescription: string,
    options: any
  ): Promise<any> {
    try {
      logger.info('Extracting keywords directly using Ollama', {
        textLength: jobDescription.length,
        useAdvancedNLP: options.useAdvancedNLP
      });

      // Use Ollama to extract keywords
      const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
      const model = process.env.OLLAMA_MODEL_KEYWORDS || 'llama3.1:8b-instruct-q4_K_M';
      
      // Check if Ollama is available first
      try {
        const healthCheck = await fetch(`${ollamaHost}/api/tags`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout for health check
        });
        
        if (!healthCheck.ok) {
          throw new Error(`Ollama health check failed: ${healthCheck.status}`);
        }
      } catch (healthError) {
        logger.warn('Ollama service not available, using fallback', {
          host: ollamaHost,
          error: healthError.message
        });
        throw new Error(`Ollama service unavailable: ${healthError.message}`);
      }

      const prompt = `Extract key skills, technologies, and qualifications from this job description. Return a JSON object with keywords categorized as follows:

Job Description:
${jobDescription}

Return format:
{
  "keywords": [
    {"keyword": "Python", "category": "skill", "importance": "required", "frequency": 3},
    {"keyword": "Linux", "category": "tool", "importance": "required", "frequency": 2}
  ],
  "skills": ["Python", "Linux", "Ubuntu", "Software Engineering"],
  "requirements": ["Bachelor's degree", "Open source experience", "Distributed team collaboration"]
}

Focus on technical skills, tools, frameworks, qualifications, and soft skills mentioned in the job posting.`;

      const response = await fetch(`${ollamaHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 2000
          }
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout for generation
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        logger.error('Ollama API request failed', {
          status: response.status,
          statusText: response.statusText,
          host: ollamaHost,
          model,
          errorResponse: errorText.substring(0, 200)
        });
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Parse the JSON response from Ollama
      let extractedData;
      try {
        // Clean up the response and extract JSON
        const jsonMatch = result.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        logger.warn('Failed to parse Ollama response, using fallback', { parseError });
        extractedData = this.generateFallbackKeywords(jobDescription);
      }

      return {
        keywordAnalysis: {
          keywords: extractedData.keywords || [],
          skills: extractedData.skills || [],
          requirements: extractedData.requirements || [],
          metadata: {
            method: 'ollama',
            model,
            processingTime: Date.now(),
            cacheHit: false
          }
        }
      };

    } catch (error) {
      logger.error('Ollama keyword extraction failed, using fallback', { error });
      
      // Fallback to simple keyword extraction
      const fallbackKeywords = this.generateFallbackKeywords(jobDescription);
      return {
        keywordAnalysis: {
          keywords: fallbackKeywords.keywords || [],
          skills: fallbackKeywords.skills || [],
          requirements: fallbackKeywords.requirements || [],
          metadata: {
            method: 'fallback',
            processingTime: Date.now(),
            cacheHit: false
          }
        }
      };
    }
  }

  /**
   * Fallback keyword extraction using simple text analysis
   */
  private generateFallbackKeywords(jobDescription: string): any {
    const text = jobDescription.toLowerCase();
    
    // Common tech keywords to look for
    const techKeywords = [
      'python', 'java', 'javascript', 'typescript', 'react', 'node', 'aws', 'cloud',
      'docker', 'kubernetes', 'linux', 'ubuntu', 'git', 'sql', 'api', 'microservices',
      'golang', 'rust', 'c++', 'bash', 'shell', 'debian', 'packaging', 'apt', 'deb'
    ];

    const softSkills = [
      'communication', 'teamwork', 'leadership', 'problem-solving', 'collaboration',
      'distributed team', 'remote work', 'documentation', 'testing', 'debugging'
    ];

    const extractedKeywords = [];
    const extractedSkills = [];

    // Find tech keywords
    techKeywords.forEach(keyword => {
      // Escape special regex characters
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        extractedKeywords.push({
          keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          category: 'skill',
          importance: 'required',
          frequency: matches.length
        });
        extractedSkills.push(keyword);
      }
    });

    // Find soft skills
    softSkills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        extractedKeywords.push({
          keyword: skill.charAt(0).toUpperCase() + skill.slice(1),
          category: 'soft_skill',
          importance: 'preferred',
          frequency: 1
        });
        extractedSkills.push(skill);
      }
    });

    return {
      keywords: extractedKeywords,
      skills: extractedSkills,
      requirements: ['Bachelor\'s degree', 'Software engineering experience']
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<KeywordProcessorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Keyword processor configuration updated', newConfig);
  }
}

// Export singleton instance
export const enterpriseKeywordProcessor = new EnterpriseKeywordProcessor();
