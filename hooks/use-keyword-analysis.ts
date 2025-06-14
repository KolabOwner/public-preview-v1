// src/hooks/useKeywordAnalysis.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import KeywordPersistenceService from "@/lib/services/keyword-persistence-service";
import { AnalysisResponse, JobInfo, ResumeData } from '@/src/types';

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
}

export const useKeywordAnalysis = ({
  jobInfo,
  resumeData
}: UseKeywordAnalysisOptions): UseKeywordAnalysisReturn => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
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
              ats_score: cachedData.ats_score
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
          const response = await axios.post(
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

          responseData = response.data;

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

          console.error('API request failed, using fallback analysis:', apiError);
          responseData = KeywordPersistenceService.generateFallbackAnalysis({
            resumeText: resumeData.extracted_text,
            jobTitle: jobInfo.title,
            jobDescription: jobInfo.description
          });

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
    refetch: fetchAnalysis
  };
};