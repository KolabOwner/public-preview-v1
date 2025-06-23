// lib/api/analyze.ts
/**
 * Client-side API wrapper for enterprise keyword analysis
 * Implements the actual API calls to the analyze-enterprise route
 */

// Types
export interface JobData {
  title: string;
  company: string;
  description: string;
  url?: string;
}

export interface AnalyzeOptions {
  // Enterprise features
  enableValidation?: boolean;
  enableDLP?: boolean;
  enableRealTimeUpdates?: boolean;
  enableAuditLogging?: boolean;
  enableAdvancedNLP?: boolean;
  enableCostControl?: boolean;

  // Business logic
  industryContext?: string;
  targetATSScore?: number;
  priority?: 'low' | 'normal' | 'high';
  async?: boolean;
  includeRecommendations?: boolean;
}

export interface ExtractedKeyword {
  keyword: string;
  frequency: number;
  category: 'skill' | 'tool' | 'qualification' | 'soft_skill' | 'certification';
  importance: 'required' | 'preferred' | 'nice_to_have';
  variations: string[];
  contexts: string[];
}

export interface MatchedKeyword {
  keyword: string;
  category: string;
  resumeFrequency: number;
  jobFrequency: number;
  relevanceScore: number;
  isExactMatch: boolean;
  isSynonymMatch: boolean;
}

export interface MissingKeyword {
  keyword: string;
  category: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  suggestions: string[];
  relatedTermsInResume: string[];
}

export interface KeywordRecommendation {
  type: 'add_keyword' | 'rephrase' | 'quantify' | 'format' | 'structure';
  priority: 'high' | 'medium' | 'low';
  section: string;
  currentText?: string;
  suggestedText: string;
  reason: string;
  keywords: string[];
  impact: number;
}

export interface AnalyzeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  analysisId?: string;
  enterpriseEnabled?: boolean;
  elapsed?: number;
}

export interface JobAssociationResult {
  success: boolean;
  associationId?: string;
  keywordAnalysis?: {
    keywords: ExtractedKeyword[];
    skills: any[];
    requirements: string[];
    metadata: {
      method: 'local' | 'advanced';
      processingTime: number;
      cacheHit: boolean;
    };
  };
  atsAnalysis?: {
    atsScore: number;
    breakdown: {
      keywordMatch: number;
      skillsAlignment: number;
      experienceRelevance: number;
      educationMatch: number;
      formatting: number;
    };
    matchedKeywords: MatchedKeyword[];
    missingKeywords: MissingKeyword[];
    recommendations: KeywordRecommendation[];
  };
  jobData?: JobData & { keywords: ExtractedKeyword[] };
}

export interface ATSAnalysisResult {
  atsScore: number;
  breakdown: {
    keywordMatch: number;
    skillsAlignment: number;
    experienceRelevance: number;
    educationMatch: number;
    formatting: number;
  };
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
  recommendations: KeywordRecommendation[];
}

export interface StatusResult {
  resumeId: string;
  hasJobAssociated: boolean;
  jobInfo: {
    title?: string;
    company?: string;
    description?: string;
    keywords?: ExtractedKeyword[];
    updated_at?: string;
    parsedData?: {
      skills: any[];
      requirements: string[];
    };
  } | null;
  keywordCount: number;
  atsScore?: number;
  lastAnalyzed?: string;
  recommendations?: number;
}

export interface OptimizationResult {
  resumeId: string;
  sections: {
    summary?: {
      currentLength: number;
      suggestedLength: number;
      keywordsToInclude: string[];
      example: string;
    };
    experience?: Array<{
      experienceIndex: number;
      company: string;
      suggestedKeywords: string[];
      bulletPointSuggestions: string[];
    }>;
    skills?: {
      currentSkillCount: number;
      skillsToAdd: string[];
      skillsToEmphasize: string[];
      suggestedCategories: string[];
    };
  };
  overallStrategy: string;
  estimatedScoreImprovement: number;
}

// API Client Class
export class AnalyzeAPI {
  private static getBaseUrl(): string {
    // In server-side contexts, we need a full URL
    if (typeof window === 'undefined') {
      // Server-side: use localhost for internal calls
      return 'http://localhost:3000/api/resume-endpoints/analyze-enterprise';
    }
    // Client-side: use relative URL
    return '/api/resume-endpoints/analyze-enterprise';
  }

  /**
   * Set custom headers based on enterprise options
   */
  private static getHeaders(options: AnalyzeOptions = {}): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-enable-validation': options.enableValidation ? 'true' : 'false',
      'x-enable-dlp': options.enableDLP ? 'true' : 'false',
      'x-enable-realtime': options.enableRealTimeUpdates ? 'true' : 'false',
      'x-enable-audit': options.enableAuditLogging ? 'true' : 'false',
      'x-enable-advanced-nlp': options.enableAdvancedNLP ? 'true' : 'false',
      'x-enable-cost-control': options.enableCostControl !== false ? 'true' : 'false',
    };
  }

  /**
   * Associate a job with a resume and extract keywords
   */
  static async associateJob(
    resumeId: string,
    userId: string,
    jobData: JobData,
    options: AnalyzeOptions = {}
  ): Promise<AnalyzeResponse<JobAssociationResult>> {
    try {
      const response = await fetch(this.getBaseUrl(), {
        method: 'POST',
        headers: this.getHeaders(options),
        body: JSON.stringify({
          action: 'associate',
          resumeId,
          userId,
          jobData,
          industryContext: options.industryContext,
          targetATSScore: options.targetATSScore,
          priority: options.priority,
          async: options.async
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to associate job:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to associate job'
      };
    }
  }

  /**
   * Analyze ATS match for an existing resume-job association
   */
  static async analyzeATS(
    resumeId: string,
    userId: string,
    options: AnalyzeOptions & {
      includeRecommendations?: boolean;
    } = {}
  ): Promise<AnalyzeResponse<ATSAnalysisResult>> {
    try {
      const response = await fetch(this.getBaseUrl(), {
        method: 'POST',
        headers: this.getHeaders(options),
        body: JSON.stringify({
          action: 'analyze',
          resumeId,
          userId,
          includeRecommendations: options.includeRecommendations !== false,
          targetScore: options.targetATSScore || 80
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to analyze ATS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze ATS match'
      };
    }
  }

  /**
   * Process multiple jobs in batch
   */
  static async processBatch(
    jobs: Array<{
      jobId: string;
      jobDescription: string;
      resumeId: string;
    }>,
    userId: string,
    options: AnalyzeOptions & {
      concurrency?: number;
    } = {}
  ): Promise<AnalyzeResponse> {
    try {
      const response = await fetch(this.getBaseUrl(), {
        method: 'POST',
        headers: this.getHeaders(options),
        body: JSON.stringify({
          action: 'batch',
          jobs,
          userId,
          concurrency: options.concurrency || 3,
          priority: options.priority
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to process batch:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process batch jobs'
      };
    }
  }

  /**
   * Get content optimization suggestions
   */
  static async getOptimizations(
    resumeId: string,
    userId: string,
    options: AnalyzeOptions & {
      sections?: string[];
    } = {}
  ): Promise<AnalyzeResponse<OptimizationResult>> {
    try {
      const response = await fetch(this.getBaseUrl(), {
        method: 'POST',
        headers: this.getHeaders(options),
        body: JSON.stringify({
          action: 'optimize',
          resumeId,
          userId,
          sections: options.sections || ['summary', 'experience', 'skills']
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to get optimizations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get optimization suggestions'
      };
    }
  }

  /**
   * Get analysis status
   */
  static async getStatus(
    resumeId: string,
    userId: string
  ): Promise<AnalyzeResponse<StatusResult>> {
    try {
      const params = new URLSearchParams({
        action: 'status',
        resumeId,
        userId
      });

      const response = await fetch(`${this.getBaseUrl()}?${params}`, {
        method: 'GET'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to get status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analysis status'
      };
    }
  }

  /**
   * Get user analytics
   */
  static async getAnalytics(
    userId: string,
    resumeId?: string
  ): Promise<AnalyzeResponse> {
    try {
      const params = new URLSearchParams({
        action: 'analytics',
        userId
      });

      if (resumeId) {
        params.append('resumeId', resumeId);
      }

      const response = await fetch(`${this.getBaseUrl()}?${params}`, {
        method: 'GET'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics'
      };
    }
  }

  /**
   * Get analysis history
   */
  static async getHistory(
    userId: string,
    resumeId?: string
  ): Promise<AnalyzeResponse> {
    try {
      const params = new URLSearchParams({
        action: 'history',
        userId
      });

      if (resumeId) {
        params.append('resumeId', resumeId);
      }

      const response = await fetch(`${this.getBaseUrl()}?${params}`, {
        method: 'GET'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to get history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analysis history'
      };
    }
  }

  /**
   * Re-analyze with latest algorithms
   */
  static async reanalyze(
    resumeId: string,
    userId: string,
    options: {
      useAdvancedNLP?: boolean;
      industryContext?: string;
    } = {}
  ): Promise<AnalyzeResponse> {
    try {
      const response = await fetch(this.getBaseUrl(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reanalyze',
          resumeId,
          userId,
          ...options
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to reanalyze:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reanalyze'
      };
    }
  }

  /**
   * Clear analysis data
   */
  static async clearAnalysis(
    resumeId: string,
    userId: string
  ): Promise<AnalyzeResponse> {
    try {
      const response = await fetch(this.getBaseUrl(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'clear',
          resumeId,
          userId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to clear analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear analysis'
      };
    }
  }

  /**
   * Helper method to transform extracted keywords to UI format
   */
  static transformKeywordsForUI(
    extractedKeywords: ExtractedKeyword[] = [],
    matchedKeywords: MatchedKeyword[] = [],
    missingKeywords: MissingKeyword[] = []
  ) {
    // Create a set of matched keyword names for quick lookup
    const matchedKeywordNames = new Set(matchedKeywords.map(k => k.keyword.toLowerCase()));

    // Transform extracted keywords
    const allKeywords = extractedKeywords.map(kw => ({
      keyword: kw.keyword,
      isMatching: matchedKeywordNames.has(kw.keyword.toLowerCase()),
      frequency: kw.frequency,
      importance: kw.importance,
      category: kw.category,
      isExtracted: true
    }));

    // Add missing keywords that weren't in extracted
    const extractedKeywordNames = new Set(extractedKeywords.map(k => k.keyword.toLowerCase()));

    missingKeywords.forEach(kw => {
      if (!extractedKeywordNames.has(kw.keyword.toLowerCase())) {
        allKeywords.push({
          keyword: kw.keyword,
          isMatching: false,
          frequency: 0,
          importance: kw.importance as any,
          category: kw.category as any,
          isExtracted: false
        });
      }
    });

    // Sort by importance then by matching status
    const importanceOrder = {
      'critical': 0,
      'required': 1,
      'high': 2,
      'preferred': 3,
      'medium': 4,
      'nice_to_have': 5,
      'low': 6
    };

    allKeywords.sort((a, b) => {
      // Matching keywords first
      if (a.isMatching !== b.isMatching) {
        return a.isMatching ? -1 : 1;
      }
      // Then by importance
      const aImportance = importanceOrder[a.importance] || 999;
      const bImportance = importanceOrder[b.importance] || 999;
      if (aImportance !== bImportance) {
        return aImportance - bImportance;
      }
      // Then by frequency
      return b.frequency - a.frequency;
    });

    return {
      allKeywords,
      matchedKeywords: allKeywords.filter(k => k.isMatching),
      missingKeywords: allKeywords.filter(k => !k.isMatching)
    };
  }
}