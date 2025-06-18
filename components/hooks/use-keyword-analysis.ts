// src/hooks/useKeywordAnalysis.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { AnalyzeAPI } from '@/lib/api/analyze';
import { logger } from '@/lib/enterprise/monitoring/logging';
import { performanceAnalytics } from '@/lib/enterprise/monitoring/analytics';
import KeywordPersistenceService from "@/lib/core/database/services/keyword-service";

// Enterprise API response types
interface ExtractedKeyword {
  keyword: string;
  frequency: number;
  category: 'skill' | 'tool' | 'qualification' | 'soft_skill' | 'certification';
  importance: 'required' | 'preferred' | 'nice_to_have';
  variations: string[];
  contexts: string[];
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

// Analysis response format
interface AnalysisResponse {
  matching_keywords: MatchedKeyword[];
  missing_keywords: MissingKeyword[];
  ats_score: {
    score: number;
    grade: string;
  };
  recommendations?: KeywordRecommendation[];
  metadata?: {
    extractionMethod?: 'local' | 'advanced';
    processingTime?: number;
    cacheHit?: boolean;
    enterpriseFeatures?: string[];
  };
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
  enterpriseOptions?: {
    enableValidation?: boolean;
    enableDLP?: boolean;
    enableRealTimeUpdates?: boolean;
    enableAuditLogging?: boolean;
    enableAdvancedNLP?: boolean;
    industryContext?: string;
  };
}

interface UseKeywordAnalysisReturn {
  analysis: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
  isCached: boolean;
  refetch: (forceRefresh?: boolean) => Promise<void>;
  getRecommendations: () => Promise<KeywordRecommendation[]>;
  isEnterpriseMode: boolean;
  performanceMetrics?: {
    extractionTime?: number;
    analysisTime?: number;
    totalTime?: number;
  };
}

export const useKeywordAnalysis = ({
  jobInfo,
  resumeData,
  enterpriseOptions = {}
}: UseKeywordAnalysisOptions): UseKeywordAnalysisReturn => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [isEnterpriseMode, setIsEnterpriseMode] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAnalysis = useCallback(async (forceRefresh = false) => {
    const startTime = Date.now();
    const timer = performanceAnalytics.startTimer('keyword.analysis.fetch', {
      userId: resumeData?.user_id,
      resumeId: resumeData?.document_id
    });

    logger.info('useKeywordAnalysis - fetchAnalysis called', {
      hasTitle: !!jobInfo?.title,
      hasDescription: !!jobInfo?.description,
      hasExtractedText: !!resumeData?.extracted_text,
      extractedTextLength: resumeData?.extracted_text?.length || 0,
      forceRefresh,
      enterpriseOptions
    });

    if (!jobInfo?.title || !jobInfo?.description || !resumeData?.extracted_text) {
      logger.debug('Missing required data for analysis');
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
              recommendations: cachedData.recommendations,
              metadata: {
                cacheHit: true,
                extractionMethod: 'local'
              }
            };
            setIsCached(true);
            logger.info('Using cached keyword analysis');
          }
        } catch (cacheError) {
          logger.error('Error retrieving cached data', { error: cacheError });
        }
      }

      // If no cached data, use enterprise API
      if (!responseData) {
        setIsCached(false);

        try {
          // First, ensure job is associated with resume
          if (resumeData.document_id && resumeData.user_id) {
            const statusResponse = await AnalyzeAPI.getStatus(
              resumeData.document_id,
              resumeData.user_id
            );

            // If no job associated yet, associate it first
            if (!statusResponse.data?.hasJobAssociated) {
              logger.info('No job associated, associating now');

              const associateResponse = await AnalyzeAPI.associateJob(
                resumeData.document_id,
                resumeData.user_id,
                {
                  title: jobInfo.title,
                  company: jobInfo.company || '',
                  description: jobInfo.description
                },
                enterpriseOptions
              );

              if (!associateResponse.success) {
                throw new Error('Failed to associate job');
              }
            }

            // Now perform ATS analysis
            const analysisResponse = await AnalyzeAPI.analyzeATS(
              resumeData.document_id,
              resumeData.user_id,
              {
                ...enterpriseOptions,
                includeRecommendations: true
              }
            );

            if (analysisResponse.success && analysisResponse.data) {
              const data = analysisResponse.data;
              setIsEnterpriseMode(analysisResponse.enterpriseEnabled || false);

              // Transform to expected format
              responseData = {
                matching_keywords: data.matchedKeywords || [],
                missing_keywords: data.missingKeywords || [],
                ats_score: {
                  score: data.atsScore,
                  grade: getATSGrade(data.atsScore)
                },
                recommendations: data.recommendations || [],
                metadata: {
                  extractionMethod: enterpriseOptions.enableAdvancedNLP ? 'advanced' : 'local',
                  processingTime: analysisResponse.elapsed,
                  enterpriseFeatures: Object.keys(enterpriseOptions).filter(k => enterpriseOptions[k])
                }
              };

              logger.info('Enterprise keyword analysis completed', {
                atsScore: data.atsScore,
                matchedKeywords: data.matchedKeywords?.length || 0,
                missingKeywords: data.missingKeywords?.length || 0,
                recommendations: data.recommendations?.length || 0,
                enterpriseMode: analysisResponse.enterpriseEnabled
              });
            } else {
              throw new Error('Analysis failed');
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
          } else {
            // Fallback to local analysis if no document ID
            logger.warn('No document ID, using local analysis');
            responseData = KeywordPersistenceService.generateFallbackAnalysis({
              resumeText: resumeData.extracted_text,
              jobTitle: jobInfo.title,
              jobDescription: jobInfo.description
            });
            setIsEnterpriseMode(false);
          }
        } catch (apiError: any) {
          if (apiError.name === 'AbortError') return;

          logger.error('Enterprise API request failed', { error: apiError });

          // Use local fallback analysis
          responseData = KeywordPersistenceService.generateFallbackAnalysis({
            resumeText: resumeData.extracted_text,
            jobTitle: jobInfo.title,
            jobDescription: jobInfo.description
          });
          setIsEnterpriseMode(false);

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

        // Calculate performance metrics
        const totalTime = Date.now() - startTime;
        setPerformanceMetrics({
          totalTime,
          extractionTime: responseData.metadata?.processingTime,
          analysisTime: totalTime - (responseData.metadata?.processingTime || 0)
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      logger.error('Analysis failed', { error: err });
      setError(err.message || 'Failed to analyze keywords');
      setIsCached(false);
    } finally {
      setLoading(false);
      await timer();

      // Record performance metrics
      await performanceAnalytics.recordMetric(
        'keyword.analysis.complete',
        Date.now() - startTime,
        'histogram' as any,
        {
          cached: isCached,
          enterprise: isEnterpriseMode,
          error: !!error
        }
      );
    }
  }, [jobInfo, resumeData, enterpriseOptions]);

  // Helper function to convert ATS score to grade
  const getATSGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  // Function to get enhanced recommendations using the enterprise API
  const getRecommendations = useCallback(async (): Promise<KeywordRecommendation[]> => {
    if (!analysis || !resumeData?.extracted_text) {
      logger.warn('No analysis data available for recommendations');
      return [];
    }

    const timer = performanceAnalytics.startTimer('keyword.recommendations.fetch');

    try {
      if (isEnterpriseMode && analysis.recommendations) {
        // If we have enterprise recommendations from the analysis, return them
        return analysis.recommendations;
      }

      // For additional recommendations, use the optimization endpoint
      if (resumeData.document_id && resumeData.user_id) {
        const optimizationResponse = await AnalyzeAPI.getOptimizations(
          resumeData.document_id,
          resumeData.user_id,
          {
            ...enterpriseOptions,
            sections: ['summary', 'experience', 'skills']
          }
        );

        if (optimizationResponse.success && optimizationResponse.data) {
          const recommendations: KeywordRecommendation[] = [];

          // Convert optimization suggestions to keyword recommendations
          const { sections } = optimizationResponse.data;

          if (sections.summary?.keywordsToInclude) {
            sections.summary.keywordsToInclude.forEach((keyword: string) => {
              recommendations.push({
                type: 'add',
                keyword,
                category: 'summary',
                reason: 'Add this critical keyword to your summary',
                priority: 1,
                implementation: sections.summary.example || ''
              });
            });
          }

          if (sections.skills?.skillsToAdd) {
            sections.skills.skillsToAdd.forEach((skill: string) => {
              recommendations.push({
                type: 'add',
                keyword: skill,
                category: 'skills',
                reason: 'This skill is mentioned in the job description',
                priority: 2,
                implementation: 'Add to your skills section'
              });
            });
          }

          return recommendations;
        }
      }

      return analysis.recommendations || [];
    } catch (error) {
      logger.error('Failed to get recommendations', { error });
      return analysis.recommendations || [];
    } finally {
      await timer();
    }
  }, [analysis, resumeData, isEnterpriseMode, enterpriseOptions]);

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
    isEnterpriseMode,
    performanceMetrics
  };
};