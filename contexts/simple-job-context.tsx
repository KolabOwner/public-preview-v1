// contexts/simple-job-context.tsx

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { KeywordsAPI, KeywordAnalysisResult, JobInfoStatus } from '@/lib/features/api/keywords';
import { useAuth } from '@/contexts/auth-context';

interface JobInfo {
  title: string;
  description: string;
  company: string;
  atsScore?: number;
  analyzedAt?: string;
  matchedCount?: number;
  missingCount?: number;
}

interface SimpleJobContextType {
  // Current job info
  jobInfo: JobInfo | null;
  currentResumeId: string | null;
  
  // Analysis results
  analysisResults: KeywordAnalysisResult | null;
  
  // Loading states
  isLoading: boolean;
  isAnalyzing: boolean;
  
  // Actions
  setCurrentResumeId: (resumeId: string | null) => void;
  checkJobInfo: (resumeId: string) => Promise<JobInfoStatus>;
  analyzeJob: (jobData: { title: string; description: string; company?: string }) => Promise<void>;
  clearJobInfo: () => Promise<void>;
  
  // Error state
  error: string | null;
}

const SimpleJobContext = createContext<SimpleJobContextType | undefined>(undefined);

export function SimpleJobProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [analysisResults, setAnalysisResults] = useState<KeywordAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if job info exists for a resume
  const checkJobInfo = useCallback(async (resumeId: string): Promise<JobInfoStatus> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const status = await KeywordsAPI.checkJobInfo(resumeId, user.uid);
      
      if (status.hasJobInfo && status.jobInfo) {
        setJobInfo({
          title: status.jobInfo.title,
          description: status.jobInfo.description,
          company: status.jobInfo.company,
          atsScore: status.jobInfo.atsScore,
          analyzedAt: status.jobInfo.analyzedAt,
          matchedCount: status.jobInfo.matchedCount,
          missingCount: status.jobInfo.missingCount,
        });
        
        // Load the full analysis results if available
        if (status.analysisData) {
          setAnalysisResults(status.analysisData);
        }
      } else {
        setJobInfo(null);
        setAnalysisResults(null);
      }
      
      return status;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to check job info';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Analyze job against resume
  const analyzeJob = useCallback(async (jobData: { title: string; description: string; company?: string }) => {
    if (!user?.uid || !currentResumeId) {
      throw new Error('User and resume ID required');
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      const results = await KeywordsAPI.analyzeKeywords({
        resumeId: currentResumeId,
        userId: user.uid,
        jobTitle: jobData.title,
        jobDescription: jobData.description,
        jobCompany: jobData.company,
      });
      
      setAnalysisResults(results);
      setJobInfo({
        ...jobData,
        company: jobData.company || '',
        atsScore: results.atsScore,
        analyzedAt: new Date().toISOString(),
        matchedCount: results.matchedCount,
        missingCount: results.missingCount,
      });
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to analyze job';
      setError(errorMsg);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user?.uid, currentResumeId]);

  // Clear job info
  const clearJobInfo = useCallback(async () => {
    if (!user?.uid || !currentResumeId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await KeywordsAPI.clearJobInfo(currentResumeId, user.uid);
      
      setJobInfo(null);
      setAnalysisResults(null);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to clear job info';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, currentResumeId]);

  // Reset state when resume ID changes
  useEffect(() => {
    if (currentResumeId) {
      setJobInfo(null);
      setAnalysisResults(null);
      setError(null);
    }
  }, [currentResumeId]);

  const value: SimpleJobContextType = {
    jobInfo,
    currentResumeId,
    analysisResults,
    isLoading,
    isAnalyzing,
    setCurrentResumeId,
    checkJobInfo,
    analyzeJob,
    clearJobInfo,
    error,
  };

  return (
    <SimpleJobContext.Provider value={value}>
      {children}
    </SimpleJobContext.Provider>
  );
}

export function useSimpleJob() {
  const context = useContext(SimpleJobContext);
  if (!context) {
    throw new Error('useSimpleJob must be used within SimpleJobProvider');
  }
  return context;
}