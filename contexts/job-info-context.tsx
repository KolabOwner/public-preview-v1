// contexts/job-info-context.tsx

'use client';

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { resumeAnalyzer, JobData, KeywordAnalysisResult, JobInfoStatus, AnalyzeOptions } from '@/lib/client/api/resume-analyzer';
import { useAuth } from '@/contexts/firebase-auth-context';

export interface JobInfo {
  title: string;
  description: string;
  company?: string;
  atsScore?: number;
  analyzedAt?: string;
  matchedCount?: number;
  missingCount?: number;
  isActive: boolean;
  extractedKeywords?: any[];
  matchedKeywords?: any[];
  missingKeywords?: any[];
}

interface JobInfoContextType {
  // Current state
  jobInfo: JobInfo | null;
  currentResumeId: string | null;
  analysisResults: KeywordAnalysisResult | null;

  // Loading states
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;

  // Core actions
  setCurrentResumeId: (resumeId: string | null) => void;
  updateJobInfo: (jobData: JobData, options?: AnalyzeOptions) => Promise<void>;
  checkJobInfo: (resumeId?: string) => Promise<JobInfoStatus>;
  clearJobInfo: () => void;

  // Analysis actions
  analyzeResume: (options?: AnalyzeOptions) => Promise<KeywordAnalysisResult | null>;

  // Utility
  hasJobInfo: boolean;
  canAnalyze: boolean;
}

const JobInfoContext = createContext<JobInfoContextType | undefined>(undefined);

interface JobInfoProviderProps {
  children: React.ReactNode;
  initialResumeId?: string;
}

export function JobInfoProvider({ children, initialResumeId }: JobInfoProviderProps) {
  const { user } = useAuth();

  // State
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(initialResumeId || null);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [analysisResults, setAnalysisResults] = useState<KeywordAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const hasJobInfo = jobInfo !== null && jobInfo.isActive;
  const canAnalyze = hasJobInfo && !!currentResumeId && !!user?.uid;

  // Clear error when resume changes
  useEffect(() => {
    setError(null);
  }, [currentResumeId]);

  // Check if job info exists for current or specified resume
  const checkJobInfo = useCallback(async (resumeId?: string): Promise<JobInfoStatus> => {
    const targetResumeId = resumeId || currentResumeId;

    if (!user?.uid || !targetResumeId) {
      throw new Error('User and resume ID required');
    }

    try {
      setIsLoading(true);
      setError(null);

      // First try the API
      try {
        const status = await resumeAnalyzer.getJobInfoStatus(targetResumeId, user.uid);

        if (status.hasJobInfo && status.jobInfo) {
          const newJobInfo: JobInfo = {
            title: status.jobInfo.title,
            description: status.jobInfo.description,
            company: status.jobInfo.company || undefined,
            atsScore: status.jobInfo.atsScore || undefined,
            analyzedAt: status.jobInfo.analyzedAt || undefined,
            matchedCount: status.jobInfo.matchedCount || undefined,
            missingCount: status.jobInfo.missingCount || undefined,
            isActive: true,
            extractedKeywords: status.analysisData?.extractedKeywords || [],
            matchedKeywords: status.analysisData?.matchedKeywords || [],
            missingKeywords: status.analysisData?.missingKeywords || [],
          };

          setJobInfo(newJobInfo);

          // Set analysis data if available
          if (status.analysisData) {
            setAnalysisResults(status.analysisData);
          }

          return status;
        }
      } catch (apiError) {
        console.warn('API call failed, checking resume data directly:', apiError);
      }

      // Fallback: Check resume data directly from Firebase
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/config/firebase-config');
      
      const resumeRef = doc(db, 'resumes', targetResumeId);
      const resumeSnap = await getDoc(resumeRef);
      
      if (resumeSnap.exists()) {
        const resumeData = resumeSnap.data();
        
        // Check if job_info exists in the resume document
        if (resumeData.job_info && resumeData.job_info.title) {
          const jobInfoData = resumeData.job_info;
          
          const newJobInfo: JobInfo = {
            title: jobInfoData.title,
            description: jobInfoData.description,
            company: jobInfoData.company || undefined,
            atsScore: jobInfoData.atsScore || undefined,
            analyzedAt: jobInfoData.analyzed_at || undefined,
            matchedCount: jobInfoData.matchedKeywords?.length || undefined,
            missingCount: jobInfoData.missingKeywords?.length || undefined,
            isActive: true,
            extractedKeywords: jobInfoData.extractedKeywords || [],
            matchedKeywords: jobInfoData.matchedKeywords || [],
            missingKeywords: jobInfoData.missingKeywords || [],
          };

          setJobInfo(newJobInfo);

          // Set analysis data if available
          if (jobInfoData.extractedKeywords || jobInfoData.matchedKeywords) {
            setAnalysisResults({
              atsScore: jobInfoData.atsScore || 0,
              matchedKeywords: jobInfoData.matchedKeywords || [],
              missingKeywords: jobInfoData.missingKeywords || [],
              totalJobKeywords: jobInfoData.extractedKeywords?.length || 0,
              matchedCount: jobInfoData.matchedKeywords?.length || 0,
              missingCount: jobInfoData.missingKeywords?.length || 0,
            });
          }

          return {
            hasJobInfo: true,
            jobInfo: {
              title: newJobInfo.title,
              company: newJobInfo.company || '',
              description: newJobInfo.description,
              atsScore: newJobInfo.atsScore || 0,
              analyzedAt: newJobInfo.analyzedAt || '',
              matchedCount: newJobInfo.matchedCount || 0,
              missingCount: newJobInfo.missingCount || 0,
            },
            analysisData: {
              atsScore: jobInfoData.atsScore || 0,
              matchedKeywords: jobInfoData.matchedKeywords || [],
              missingKeywords: jobInfoData.missingKeywords || [],
              totalJobKeywords: jobInfoData.extractedKeywords?.length || 0,
              matchedCount: jobInfoData.matchedKeywords?.length || 0,
              missingCount: jobInfoData.missingKeywords?.length || 0,
            }
          };
        }
      }

      // No job info found
      setJobInfo(null);
      setAnalysisResults(null);
      
      return {
        hasJobInfo: false,
        jobInfo: null,
        analysisData: null
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to check job info';
      setError(errorMsg);
      console.error('Error checking job info:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentResumeId, user?.uid]);

  // Auto-load job info when resume ID changes
  useEffect(() => {
    if (currentResumeId && user?.uid) {
      checkJobInfo(currentResumeId);
    } else {
      // Clear state when no resume is selected
      setJobInfo(null);
      setAnalysisResults(null);
    }
  }, [currentResumeId, user?.uid, checkJobInfo]);

  // Update job information and analyze
  const updateJobInfo = useCallback(async (jobData: JobData, options: AnalyzeOptions = {}) => {
    if (!user?.uid || !currentResumeId) {
      throw new Error('User and resume ID required');
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // Update job info and get analysis results
      const results = await resumeAnalyzer.updateJobInfo({
        resumeId: currentResumeId,
        userId: user.uid,
        jobData,
        options,
      });

      // Update local state
      const newJobInfo: JobInfo = {
        title: jobData.title,
        description: jobData.description,
        company: jobData.company || undefined,
        atsScore: results.atsScore || undefined,
        analyzedAt: new Date().toISOString(),
        matchedCount: results.matchedCount || undefined,
        missingCount: results.missingCount || undefined,
        isActive: true,
      };

      setJobInfo(newJobInfo);
      setAnalysisResults(results);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update job info';
      setError(errorMsg);
      console.error('Error updating job info:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentResumeId, user?.uid]);

  // Analyze resume against current job (re-analyze existing job info)
  const analyzeResume = useCallback(async (options: AnalyzeOptions = {}): Promise<KeywordAnalysisResult | null> => {
    if (!canAnalyze || !jobInfo) {
      throw new Error('Cannot analyze: missing job info or resume ID');
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const results = await resumeAnalyzer.analyzeKeywords({
        resumeId: currentResumeId!,
        userId: user!.uid,
        jobTitle: jobInfo.title,
        jobDescription: jobInfo.description,
        jobCompany: jobInfo.company || '',
        options,
      });

      // Update job info with new analysis results
      setJobInfo(prev => prev ? {
        ...prev,
        atsScore: results.atsScore || undefined,
        analyzedAt: new Date().toISOString(),
        matchedCount: results.matchedCount || undefined,
        missingCount: results.missingCount || undefined,
      } : null);

      setAnalysisResults(results);

      return results;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to analyze resume';
      setError(errorMsg);
      console.error('Error analyzing resume:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [canAnalyze, jobInfo, currentResumeId, user]);

  // Clear job info (local state only)
  const clearJobInfo = useCallback(() => {
    setJobInfo(null);
    setAnalysisResults(null);
    setError(null);
  }, []);

  const value: JobInfoContextType = {
    // State
    jobInfo,
    currentResumeId,
    analysisResults,
    isLoading,
    isAnalyzing,
    error,

    // Actions
    setCurrentResumeId,
    updateJobInfo,
    checkJobInfo,
    clearJobInfo,
    analyzeResume,

    // Computed
    hasJobInfo,
    canAnalyze,
  };

  return (
    <JobInfoContext.Provider value={value}>
      {children}
    </JobInfoContext.Provider>
  );
}

// Hook to use job info context
export function useJobInfo() {
  const context = useContext(JobInfoContext);
  if (!context) {
    throw new Error('useJobInfo must be used within JobInfoProvider');
  }
  return context;
}

// Export types for other components
export type { JobData, KeywordAnalysisResult, JobInfoStatus, AnalyzeOptions };
