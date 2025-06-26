// src/contexts/JobInfoContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { AnalyzeAPI } from '@/lib/features/api/analyze';
import { logger } from '@/lib/enterprise/monitoring/logging';
import { performanceAnalytics } from '@/lib/enterprise/monitoring/analytics';

export interface JobInfo {
  title: string;
  description: string;
  company: string;
  keywords: string;
  isActive: boolean;
  url?: string;
  location?: string;
  salary?: string;
  type?: string;
  experience?: string;
  postedDate?: string;
}

interface EnterpriseJobInfo extends JobInfo {
  extractedKeywords?: ExtractedKeyword[];
  atsScore?: number;
  recommendations?: KeywordRecommendation[];
  analysisId?: string;
  enterpriseMetadata?: {
    extractionMethod?: 'local' | 'advanced';
    processingTime?: number;
    cacheHit?: boolean;
    lastAnalyzed?: Date;
  };
}

interface ExtractedKeyword {
  keyword: string;
  frequency: number;
  category: 'skill' | 'tool' | 'qualification' | 'soft_skill' | 'certification';
  importance: 'required' | 'preferred' | 'nice_to_have';
  variations: string[];
  contexts: string[];
}

interface KeywordRecommendation {
  type: 'add_keyword' | 'rephrase' | 'quantify' | 'format' | 'structure';
  priority: 'high' | 'medium' | 'low';
  section: string;
  currentText?: string;
  suggestedText: string;
  reason: string;
  keywords: string[];
  impact: number;
}

interface JobInfoContextType {
  jobInfo: EnterpriseJobInfo;
  updateJobInfo: (updates: Partial<EnterpriseJobInfo>) => void;
  resetJobInfo: () => void;
  setCurrentResumeId: (resumeId: string | null) => void;
  currentResumeId: string | null;
  loadJobInfoFromEnterprise: (resumeId: string, options?: LoadOptions) => Promise<void>;
  associateJob: (jobData: JobData, options?: AssociateOptions) => Promise<AssociateResult>;
  analyzeATS: (options?: AnalyzeOptions) => Promise<ATSAnalysisResult>;
  isEnterpriseMode: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoadOptions {
  forceRefresh?: boolean;
  includeAnalysis?: boolean;
}

interface JobData {
  title: string;
  company: string;
  description: string;
  url?: string;
}

interface AssociateOptions {
  enableValidation?: boolean;
  enableDLP?: boolean;
  enableRealTimeUpdates?: boolean;
  enableAuditLogging?: boolean;
  enableAdvancedNLP?: boolean;
  industryContext?: string;
  targetATSScore?: number;
}

interface AssociateResult {
  success: boolean;
  keywordCount?: number;
  atsScore?: number;
  analysisId?: string;
  error?: string;
}

interface AnalyzeOptions {
  includeRecommendations?: boolean;
  targetScore?: number;
  forceReanalysis?: boolean;
}

interface ATSAnalysisResult {
  score: number;
  breakdown: {
    keywordMatch: number;
    skillsAlignment: number;
    experienceRelevance: number;
    educationMatch: number;
    formatting: number;
  };
  recommendations: KeywordRecommendation[];
}

const defaultJobInfo: EnterpriseJobInfo = {
  title: '',
  company: '',
  description: '',
  keywords: [],
  isActive: false
};

const JobInfoContext = createContext<JobInfoContextType>({
  jobInfo: defaultJobInfo,
  updateJobInfo: () => {},
  resetJobInfo: () => {},
  setCurrentResumeId: () => {},
  currentResumeId: null,
  loadJobInfoFromEnterprise: async () => {},
  associateJob: async () => ({ success: false }),
  analyzeATS: async () => ({ score: 0, breakdown: {}, recommendations: [] }),
  isEnterpriseMode: false,
  isLoading: false,
  error: null
});

interface JobInfoProviderProps {
  children: ReactNode;
  userId?: string;
  resumeId?: string;
}

export const JobInfoProvider: React.FC<JobInfoProviderProps> = ({ children, userId, resumeId }) => {
  const [jobInfoByResume, setJobInfoByResume] = useState<Record<string, EnterpriseJobInfo>>({});
  const [currentResumeId, setCurrentResumeIdState] = useState<string | null>(resumeId || null);
  const [isEnterpriseMode, setIsEnterpriseMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCurrentResumeId = useCallback((resumeId: string | null) => {
    setCurrentResumeIdState(prev => {
      if (prev === resumeId) {
        return prev; // No change needed
      }
      logger.info('Setting current resume ID', { from: prev, to: resumeId });
      setError(null); // Clear any previous errors
      return resumeId;
    });
  }, []);

  // Get current job info based on resume ID
  const jobInfo = currentResumeId ? (jobInfoByResume[currentResumeId] || defaultJobInfo) : defaultJobInfo;

  // Log job info changes
  useEffect(() => {
    logger.debug('JobInfo changed', {
      currentResumeId,
      hasJobInfo: !!jobInfo.title,
      keywordCount: jobInfo.extractedKeywords?.length || 0,
      atsScore: jobInfo.atsScore
    });
  }, [currentResumeId, jobInfo]);

  const updateJobInfo = useCallback((updates: Partial<EnterpriseJobInfo>) => {
    if (!currentResumeId) {
      logger.warn('updateJobInfo called without currentResumeId');
      return;
    }

    logger.info('Updating job info', { currentResumeId, updates });

    setJobInfoByResume(prev => ({
      ...prev,
      [currentResumeId]: {
        ...prev[currentResumeId] || defaultJobInfo,
        ...updates
      }
    }));
  }, [currentResumeId]);

  const resetJobInfo = useCallback(() => {
    if (!currentResumeId) return;

    logger.info('Resetting job info', { currentResumeId });

    setJobInfoByResume(prev => {
      const updated = { ...prev };
      delete updated[currentResumeId];
      return updated;
    });

    setIsEnterpriseMode(false);
    setError(null);
  }, [currentResumeId]);

  // Load job info from enterprise service
  const loadJobInfoFromEnterprise = useCallback(async (
    resumeId: string,
    options: LoadOptions = {}
  ): Promise<void> => {
    // Don't make API calls without a valid user ID
    if (!userId) {
      logger.info('No user ID available, skipping enterprise load', { resumeId });
      return;
    }

    const timer = performanceAnalytics.startTimer('jobinfo.load', { resumeId });

    try {
      logger.info('Loading job info from enterprise service', { resumeId, options, userId });
      setIsLoading(true);
      setError(null);

      // Get job association status
      const statusResponse = await AnalyzeAPI.getStatus(resumeId, userId);

      if (statusResponse.success && statusResponse.data) {
        const { hasJobAssociated, jobInfo: remoteJobInfo, keywordCount, atsScore } = statusResponse.data;

        if (hasJobAssociated && remoteJobInfo) {
          const transformedJobInfo: EnterpriseJobInfo = {
            title: remoteJobInfo.title || '',
            company: remoteJobInfo.company || '',
            description: remoteJobInfo.description || '',
            keywords: remoteJobInfo.keywords || [],
            extractedKeywords: remoteJobInfo.parsedData?.keywords,
            atsScore: atsScore,
            isActive: true,
            enterpriseMetadata: {
              lastAnalyzed: remoteJobInfo.updated_at ? new Date(remoteJobInfo.updated_at) : undefined
            }
          };

          // If analysis is requested and we have keywords, get full analysis
          if (options.includeAnalysis && keywordCount > 0) {
            try {
              const analysisResponse = await AnalyzeAPI.analyzeATS(resumeId, userId, {
                includeRecommendations: true,
                enableAdvancedNLP: false // Use cached results
              });

              if (analysisResponse.success && analysisResponse.data) {
                transformedJobInfo.atsScore = analysisResponse.data.atsScore;
                transformedJobInfo.recommendations = analysisResponse.data.recommendations;
              }
            } catch (analysisError) {
              logger.warn('Failed to load ATS analysis', { resumeId, error: analysisError });
            }
          }

          setJobInfoByResume(prev => ({
            ...prev,
            [resumeId]: transformedJobInfo
          }));

          setIsEnterpriseMode(true);
          logger.info('Job info loaded from enterprise service', {
            resumeId,
            keywordCount,
            atsScore
          });

          // Record success metric
          await performanceAnalytics.recordMetric(
            'jobinfo.load.success',
            1,
            'counter' as any,
            { hasJob: true }
          );
        } else {
          logger.info('No job associated with resume', { resumeId });
        }
      }
    } catch (error) {
      logger.error('Failed to load job info from enterprise service', { resumeId, error });
      setError('Failed to load job information');
      setIsEnterpriseMode(false);

      // Record error metric
      await performanceAnalytics.recordMetric(
        'jobinfo.load.error',
        1,
        'counter' as any,
        { error: error.message }
      );
    } finally {
      setIsLoading(false);
      await timer();
    }
  }, [userId]);

  // Associate job with resume using enterprise features
  const associateJob = useCallback(async (
    jobData: JobData,
    options: AssociateOptions = {}
  ): Promise<AssociateResult> => {
    if (!currentResumeId || !userId) {
      return {
        success: false,
        error: 'Resume ID and User ID required'
      };
    }

    const timer = performanceAnalytics.startTimer('jobinfo.associate', {
      resumeId: currentResumeId,
      company: jobData.company
    });

    try {
      logger.info('Associating job with resume', {
        resumeId: currentResumeId,
        jobTitle: jobData.title,
        options
      });

      setIsLoading(true);
      setError(null);

      const response = await AnalyzeAPI.associateJob(
        currentResumeId,
        userId,
        jobData,
        {
          ...options,
          enableCostControl: true // Always enable cost control
        }
      );

      if (response.success && response.data) {
        const { keywordAnalysis, atsAnalysis } = response.data;

        // Update local state with results
        updateJobInfo({
          title: jobData.title,
          company: jobData.company,
          description: jobData.description,
          isActive: true,
          extractedKeywords: keywordAnalysis?.keywords,
          keywords: keywordAnalysis?.keywords?.map(k => k.keyword) || [],
          atsScore: atsAnalysis?.atsScore,
          recommendations: atsAnalysis?.recommendations,
          analysisId: response.analysisId,
          enterpriseMetadata: {
            extractionMethod: keywordAnalysis?.metadata?.method,
            processingTime: response.elapsed,
            cacheHit: keywordAnalysis?.metadata?.cacheHit,
            lastAnalyzed: new Date()
          }
        });

        setIsEnterpriseMode(response.enterpriseEnabled || false);

        logger.info('Job associated successfully', {
          resumeId: currentResumeId,
          keywordCount: keywordAnalysis?.keywords?.length || 0,
          atsScore: atsAnalysis?.atsScore
        });

        return {
          success: true,
          keywordCount: keywordAnalysis?.keywords?.length || 0,
          atsScore: atsAnalysis?.atsScore,
          analysisId: response.analysisId
        };
      } else {
        throw new Error(response.error || 'Failed to associate job');
      }
    } catch (error) {
      logger.error('Failed to associate job', {
        resumeId: currentResumeId,
        error
      });

      setError(error.message || 'Failed to associate job');

      return {
        success: false,
        error: error.message || 'Failed to associate job'
      };
    } finally {
      setIsLoading(false);
      await timer();
    }
  }, [currentResumeId, userId, updateJobInfo]);

  // Analyze ATS match
  const analyzeATS = useCallback(async (
    options: AnalyzeOptions = {}
  ): Promise<ATSAnalysisResult> => {
    if (!currentResumeId || !userId) {
      throw new Error('Resume ID and User ID required');
    }

    const timer = performanceAnalytics.startTimer('jobinfo.analyze', {
      resumeId: currentResumeId
    });

    try {
      logger.info('Analyzing ATS match', {
        resumeId: currentResumeId,
        options
      });

      setIsLoading(true);
      setError(null);

      const response = await AnalyzeAPI.analyzeATS(
        currentResumeId,
        userId,
        {
          ...options,
          enableCostControl: true
        }
      );

      if (response.success && response.data) {
        const { atsScore, breakdown, recommendations } = response.data;

        // Update local state with analysis results
        updateJobInfo({
          atsScore,
          recommendations,
          enterpriseMetadata: {
            ...jobInfo.enterpriseMetadata,
            lastAnalyzed: new Date()
          }
        });

        logger.info('ATS analysis completed', {
          resumeId: currentResumeId,
          atsScore,
          recommendationCount: recommendations.length
        });

        return {
          score: atsScore,
          breakdown,
          recommendations
        };
      } else {
        throw new Error(response.error || 'Failed to analyze ATS match');
      }
    } catch (error) {
      logger.error('Failed to analyze ATS match', {
        resumeId: currentResumeId,
        error
      });

      setError(error.message || 'Failed to analyze ATS match');
      throw error;
    } finally {
      setIsLoading(false);
      await timer();
    }
  }, [currentResumeId, userId, jobInfo.enterpriseMetadata, updateJobInfo]);

  // Update currentResumeId when prop changes
  useEffect(() => {
    if (resumeId && resumeId !== currentResumeId) {
      setCurrentResumeId(resumeId);
    }
  }, [resumeId, currentResumeId, setCurrentResumeId]);

  // Auto-load job info when resumeId changes
  useEffect(() => {
    if (currentResumeId && !jobInfoByResume[currentResumeId] && userId) {
      loadJobInfoFromEnterprise(currentResumeId, { includeAnalysis: false });
    }
  }, [currentResumeId, jobInfoByResume, userId, loadJobInfoFromEnterprise]);

  const value: JobInfoContextType = {
    jobInfo,
    updateJobInfo,
    resetJobInfo,
    setCurrentResumeId,
    currentResumeId,
    loadJobInfoFromEnterprise,
    associateJob,
    analyzeATS,
    isEnterpriseMode,
    isLoading,
    error
  };

  return (
    <JobInfoContext.Provider value={value}>
      {children}
    </JobInfoContext.Provider>
  );
};

export const useJobInfo = (): JobInfoContextType => {
  const context = useContext(JobInfoContext);
  if (!context) {
    throw new Error('useJobInfo must be used within a JobInfoProvider');
  }
  return context;
};