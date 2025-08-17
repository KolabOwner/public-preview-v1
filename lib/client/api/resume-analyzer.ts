// ==========================================
// lib/client/api/resume-analyzer.ts
// ==========================================


// Unified Types
export interface JobData {
  title: string;
  company?: string;
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
  
  // Auto-targeting
  autoTarget?: boolean;
}

export interface MatchedKeyword {
  keyword: string;
  category: string;
  resumeFrequency?: number;
  jobFrequency?: number;
  relevanceScore?: number;
  isExactMatch?: boolean;
  isSynonymMatch?: boolean;
  variations?: string[];
  contextInJob?: string;
}

export interface MissingKeyword {
  keyword: string;
  category: string;
  importance: 'must_have' | 'strongly_preferred' | 'nice_to_have';
  contextInJob: string;
  relatedTermsInResume?: string[];
  isMultiTerm?: boolean;
}

export interface KeywordAnalysisResult {
  atsScore: number;
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
  extractedKeywords?: any[];
  totalJobKeywords: number;
  matchedCount: number;
  missingCount: number;
}

export interface JobInfoStatus {
  hasJobInfo: boolean;
  jobInfo: {
    title: string;
    company: string;
    description: string;
    atsScore: number;
    analyzedAt: string;
    matchedCount: number;
    missingCount: number;
  } | null;
  analysisData: KeywordAnalysisResult | null;
}

// Base API Client
class BaseAPIClient {
  protected async fetch(url: string, options: RequestInit = {}) {
    // Get Firebase auth token
    const { auth: firebaseAuth } = await import('@/config/firebase-config');

    let authHeaders = {};
    if (firebaseAuth.currentUser) {
      try {
        const idToken = await firebaseAuth.currentUser.getIdToken();
        authHeaders = { 'Authorization': `Bearer ${idToken}` };
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

// Unified Resume Analyzer API
export class ResumeAnalyzerAPI extends BaseAPIClient {

  /**
   * Analyze resume against job description for keywords and ATS score
   */
  async analyzeKeywords(request: {
    resumeId: string;
    userId: string;
    jobTitle: string;
    jobDescription: string;
    jobCompany?: string;
    options?: AnalyzeOptions;
  }): Promise<KeywordAnalysisResult> {
    return this.fetch(`/api/resumes/${request.resumeId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        action: 'analyze'
      }),
    });
  }

  /**
   * Get current job info status for a resume
   */
  async getJobInfoStatus(resumeId: string, userId: string): Promise<JobInfoStatus> {
    return this.fetch(`/api/resumes/${resumeId}/analyze?userId=${userId}`);
  }

  /**
   * Update job information for a resume
   */
  async updateJobInfo(request: {
    resumeId: string;
    userId: string;
    jobData: JobData;
    options?: AnalyzeOptions;
  }): Promise<KeywordAnalysisResult> {
    return this.analyzeKeywords({
      resumeId: request.resumeId,
      userId: request.userId,
      jobTitle: request.jobData.title,
      jobDescription: request.jobData.description,
      jobCompany: request.jobData.company,
      options: request.options,
    });
  }
}

// Export singleton instance
export const resumeAnalyzer = new ResumeAnalyzerAPI();
