// lib/features/api/keywords.ts

export interface KeywordAnalysisRequest {
  resumeId: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  jobCompany?: string;
}

export interface MatchedKeyword {
  keyword: string;
  category: string;
  variations: string[];
  contextInJob: string;
}

export interface MissingKeyword {
  keyword: string;
  category: string;
  importance: 'must_have' | 'strongly_preferred' | 'nice_to_have';
  contextInJob: string;
  relatedTermsInResume: string[];
  isMultiTerm: boolean;
}

export interface KeywordAnalysisResult {
  atsScore: number;
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
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

export class KeywordsAPI {
  static async analyzeKeywords(data: KeywordAnalysisRequest): Promise<KeywordAnalysisResult> {
    const response = await fetch('/api/resume-endpoints/analyze-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to analyze keywords');
    }

    return result.data;
  }

  static async checkJobInfo(resumeId: string, userId: string): Promise<JobInfoStatus> {
    const params = new URLSearchParams({ resumeId, userId });
    const response = await fetch(`/api/resume-endpoints/analyze-keywords?${params}`, {
      method: 'GET',
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to check job info');
    }

    return result.data;
  }

  static async clearJobInfo(resumeId: string, userId: string): Promise<void> {
    const params = new URLSearchParams({ resumeId, userId });
    const response = await fetch(`/api/resume-endpoints/analyze-keywords?${params}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to clear job info');
    }
  }
}