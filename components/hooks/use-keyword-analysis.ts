// src/hooks/useKeywordAnalysis.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import KeywordPersistenceService from "@/lib/core/database/services/keyword-service";

// New enterprise API response format
interface EnterpriseAnalysisResponse {
  success: boolean;
  data: {
    analysis: {
      resumeId: string;
      jobId?: string;
      timestamp: string;
      extractedKeywords: ExtractedKeyword[];
      matchedKeywords: MatchedKeyword[];
      missingKeywords: MissingKeyword[];
      matchRate: number;
      atsScore: number;
      recommendations: KeywordRecommendation[];
      metadata: {
        extractionLayers: string[];
        processingTime: number;
        wordCount: number;
        sentenceCount: number;
      };
    };
    summary: {
      atsScore: number;
      matchRate: number;
      totalKeywordsExtracted: number;
      matchedKeywords: number;
      missingCriticalKeywords: number;
      topRecommendations: KeywordRecommendation[];
    };
  };
  processingTime: number;
  sessionId: string;
  timestamp: string;
}

interface ExtractedKeyword {
  keyword: string;
  category: string;
  frequency: number;
  score: number;
  positions: number[];
  context: string[];
}

interface MatchedKeyword {
  keyword: string;
  category: string;
  resumeFrequency: number;
  jobFrequency: number;
  relevanceScore: number;
  isExactMatch: boolean;
  isSynonymMatch: boolean;
}

interface MissingKeyword {
  keyword: string;
  category: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  suggestions: string[];
  relatedTermsInResume: string[];
}

interface KeywordRecommendation {
  type: 'add' | 'replace' | 'emphasize' | 'reduce';
  keyword: string;
  category: string;
  reason: string;
  priority: number;
  implementation: string;
}

// Legacy format for backward compatibility
interface AnalysisResponse {
  matching_keywords: MatchedKeyword[];
  missing_keywords: MissingKeyword[];
  ats_score: {
    score: number;
    grade: string;
  };
  recommendations?: KeywordRecommendation[];
}

interface JobInfo {
  title: string;
  description: string;
  company?: string;
  location?: string;
}

interface ResumeData {
  extracted_text: string;
  document_id?: string;
  user_id?: string;
  title?: string;
  file_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface UseKeywordAnalysisOptions {
  jobInfo: Partial<JobInfo>;
  resumeData: Partial<ResumeData> | null;
}

interface UseKeywordAnalysisReturn {
  analysis: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
  isCached: boolean;
  refetch: (forceRefresh?: boolean) => Promise<void>;
  getRecommendations: () => Promise<KeywordRecommendation[]>;
  isEnterpriseMode: boolean;
}

export const useKeywordAnalysis = ({
  jobInfo,
  resumeData
}: UseKeywordAnalysisOptions): UseKeywordAnalysisReturn => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [isEnterpriseMode, setIsEnterpriseMode] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAnalysis = useCallback(async (forceRefresh = false) => {
    console.log('useKeywordAnalysis - fetchAnalysis called:', {
      hasTitle: !!jobInfo?.title,
      hasDescription: !!jobInfo?.description,
      hasExtractedText: !!resumeData?.extracted_text,
      extractedTextLength: resumeData?.extracted_text?.length || 0,
      forceRefresh
    });
    
    if (!jobInfo?.title || !jobInfo?.description || !resumeData?.extracted_text) {
      console.log('useKeywordAnalysis - Missing required data, skipping analysis');
      setAnalysis(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      let responseData: AnalysisResponse | null = null;

      // Check cache first (unless forcing refresh)
      if (!forceRefresh && resumeData.document_id) {
        try {
          const cachedData = await KeywordPersistenceService.getKeywordAnalysis(
            resumeData.document_id,
            jobInfo.title,
            jobInfo.description
          );

          if (cachedData) {
            responseData = {
              matching_keywords: cachedData.matching_keywords,
              missing_keywords: cachedData.missing_keywords,
              ats_score: cachedData.ats_score,
              recommendations: cachedData.recommendations
            };
            setIsCached(true);
            console.log('Using cached keyword analysis');
          }
        } catch (cacheError) {
          console.error('Error retrieving cached data:', cacheError);
        }
      }

      // If no cached data, perform new analysis
      if (!responseData) {
        setIsCached(false);

        try {
          // Try the new enterprise ATS analysis endpoint first
          const response = await axios.post<EnterpriseAnalysisResponse>(
            '/api/resume/analyze-ats',
            {
              resumeContent: resumeData.extracted_text,
              userId: resumeData.user_id || 'anonymous',
              resumeId: resumeData.document_id || `temp_${Date.now()}`,
              options: {
                enableValidation: true,
                enableAuditLogging: true,
                enableCaching: true,
                enableFallback: true,
                extractionLayers: ['tfidf', 'rules'],
                maxRecommendations: 15,
                priorityThreshold: 0.5
              }
            },
            {
              timeout: 45000, // Increased timeout for enterprise processing
              signal: abortControllerRef.current.signal,
              headers: {
                'Content-Type': 'application/json',
                'x-enable-validation': 'true',
                'x-enable-audit': 'true'
              }
            }
          );

          if (response.data.success) {
            const enterpriseData = response.data.data;
            setIsEnterpriseMode(true);
            
            // Transform enterprise response to legacy format for backward compatibility
            responseData = {
              matching_keywords: enterpriseData.analysis.matchedKeywords,
              missing_keywords: enterpriseData.analysis.missingKeywords,
              ats_score: {
                score: Math.round(enterpriseData.analysis.atsScore * 100), // Convert to percentage
                grade: getATSGrade(enterpriseData.analysis.atsScore)
              },
              recommendations: enterpriseData.analysis.recommendations
            };

            console.log('Enterprise keyword analysis completed:', {
              atsScore: enterpriseData.analysis.atsScore,
              matchRate: enterpriseData.analysis.matchRate,
              matchedKeywords: enterpriseData.analysis.matchedKeywords.length,
              missingKeywords: enterpriseData.analysis.missingKeywords.length,
              recommendations: enterpriseData.analysis.recommendations.length
            });
          } else {
            throw new Error('Enterprise analysis failed');
          }

          // Save to cache
          if (resumeData.document_id && responseData) {
            KeywordPersistenceService.saveKeywordAnalysis(
              resumeData.document_id,
              jobInfo.title,
              jobInfo.description,
              responseData
            );
          }
        } catch (apiError: any) {
          if (apiError.name === 'AbortError') return;

          console.error('Enterprise API request failed, trying fallback methods:', apiError);
          
          // Fallback to legacy analyze endpoint
          try {
            const legacyResponse = await axios.post(
              '/api/analyze',
              {
                jobTitle: jobInfo.title,
                jobDescription: jobInfo.description,
                resumeText: resumeData.extracted_text,
                userId: resumeData.user_id,
                documentId: resumeData.document_id
              },
              {
                timeout: 30000,
                signal: abortControllerRef.current.signal
              }
            );

            responseData = legacyResponse.data;
            setIsEnterpriseMode(false);
            console.log('Using legacy analysis endpoint');
          } catch (legacyError: any) {
            if (legacyError.name === 'AbortError') return;
            
            console.error('Legacy API also failed, using local fallback analysis:', legacyError);
            
            // Final fallback: local analysis
            responseData = KeywordPersistenceService.generateFallbackAnalysis({
              resumeText: resumeData.extracted_text,
              jobTitle: jobInfo.title,
              jobDescription: jobInfo.description
            });
            setIsEnterpriseMode(false);
          }

          // Save fallback analysis
          if (resumeData.document_id && responseData) {
            KeywordPersistenceService.saveKeywordAnalysis(
              resumeData.document_id,
              jobInfo.title,
              jobInfo.description,
              responseData
            );
          }
        }
      }

      if (responseData) {
        setAnalysis(responseData);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.error('Analysis failed:', err);
      setError('Failed to analyze keywords');
      setIsCached(false);
    } finally {
      setLoading(false);
    }
  }, [jobInfo, resumeData]);

  // Helper function to convert ATS score to grade
  const getATSGrade = (score: number): string => {
    if (score >= 0.9) return 'A+';
    if (score >= 0.8) return 'A';
    if (score >= 0.7) return 'B';
    if (score >= 0.6) return 'C';
    if (score >= 0.5) return 'D';
    return 'F';
  };

  // Function to get enhanced recommendations using the enterprise API
  const getRecommendations = useCallback(async (): Promise<KeywordRecommendation[]> => {
    if (!analysis || !resumeData?.extracted_text) {
      console.warn('No analysis data available for recommendations');
      return [];
    }

    try {
      if (isEnterpriseMode && analysis.recommendations) {
        // If we have enterprise recommendations from the analysis, return them
        return analysis.recommendations;
      }

      // Call the dedicated recommendations endpoint
      const response = await axios.post('/api/keywords/recommendations', {
        resumeContent: resumeData.extracted_text,
        resumeId: resumeData.document_id || `temp_${Date.now()}`,
        userId: resumeData.user_id || 'anonymous',
        options: {
          maxSuggestions: 15,
          priorityThreshold: 0.5,
          includeImplementationDetails: true,
          groupByCategory: false,
          includeQuickWins: true
        }
      });

      if (response.data.success) {
        return response.data.data.recommendations || [];
      }

      return [];
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return analysis.recommendations || [];
    }
  }, [analysis, resumeData, isEnterpriseMode]);

  useEffect(() => {
    fetchAnalysis();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAnalysis]);

  return {
    analysis,
    loading,
    error,
    isCached,
    refetch: fetchAnalysis,
    getRecommendations,
    isEnterpriseMode
  };
};