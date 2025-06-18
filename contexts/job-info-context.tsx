// src/contexts/JobInfoContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { JobInfo } from '@/types';
import axios from 'axios';

interface JobInfoContextType {
  jobInfo: JobInfo;
  updateJobInfo: (updates: Partial<JobInfo>) => void;
  resetJobInfo: () => void;
  setCurrentResumeId: (resumeId: string | null) => void;
  currentResumeId: string | null;
  loadJobInfoFromEnterprise: (resumeId: string) => Promise<void>;
  isEnterpriseMode: boolean;
}

const defaultJobInfo: JobInfo = {
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
  isEnterpriseMode: false
});

interface JobInfoProviderProps {
  children: ReactNode;
}

export const JobInfoProvider: React.FC<JobInfoProviderProps> = ({ children }) => {
  const [jobInfoByResume, setJobInfoByResume] = useState<Record<string, JobInfo>>({});
  const [currentResumeId, setCurrentResumeIdState] = useState<string | null>(null);
  const [isEnterpriseMode, setIsEnterpriseMode] = useState(false);
  
  const setCurrentResumeId = (resumeId: string | null) => {
    console.log('setCurrentResumeId called:', { from: currentResumeId, to: resumeId });
    setCurrentResumeIdState(resumeId);
  };

  // Get current job info based on resume ID
  const jobInfo = currentResumeId ? (jobInfoByResume[currentResumeId] || defaultJobInfo) : defaultJobInfo;
  
  // Log job info changes
  useEffect(() => {
    console.log('JobInfoContext - jobInfo changed:', { currentResumeId, jobInfo, jobInfoByResume });
  }, [currentResumeId, jobInfo]);

  const updateJobInfo = (updates: Partial<JobInfo>) => {
    if (!currentResumeId) {
      console.warn('updateJobInfo called without currentResumeId');
      return;
    }
    
    console.log('updateJobInfo called:', { currentResumeId, updates });
    
    setJobInfoByResume(prev => ({
      ...prev,
      [currentResumeId]: {
        ...prev[currentResumeId] || defaultJobInfo,
        ...updates
      }
    }));
  };

  const resetJobInfo = () => {
    if (!currentResumeId) return;
    
    setJobInfoByResume(prev => {
      const updated = { ...prev };
      delete updated[currentResumeId];
      return updated;
    });
  };

  // Load job info from enterprise service
  const loadJobInfoFromEnterprise = async (resumeId: string): Promise<void> => {
    try {
      console.log('Loading job info from enterprise service for resume:', resumeId);
      
      const response = await axios.get(`/api/enterprise/job-context/${resumeId}`);
      
      if (response.data.success && response.data.jobInfo) {
        const enterpriseJobInfo = response.data.jobInfo;
        
        // Transform enterprise format to our JobInfo format
        const transformedJobInfo: JobInfo = {
          title: enterpriseJobInfo.title || '',
          company: enterpriseJobInfo.company || '',
          description: enterpriseJobInfo.description || '',
          keywords: enterpriseJobInfo.keywords || [],
          isActive: true
        };

        setJobInfoByResume(prev => ({
          ...prev,
          [resumeId]: transformedJobInfo
        }));

        setIsEnterpriseMode(true);
        console.log('Job info loaded from enterprise service:', transformedJobInfo);
      }
    } catch (error) {
      console.warn('Failed to load job info from enterprise service:', error);
      setIsEnterpriseMode(false);
      // Don't throw error - fallback to local storage or default
    }
  };

  // Auto-load job info when resumeId changes
  useEffect(() => {
    if (currentResumeId && !jobInfoByResume[currentResumeId]) {
      loadJobInfoFromEnterprise(currentResumeId);
    }
  }, [currentResumeId]);

  const value: JobInfoContextType = {
    jobInfo,
    updateJobInfo,
    resetJobInfo,
    setCurrentResumeId,
    currentResumeId,
    loadJobInfoFromEnterprise,
    isEnterpriseMode
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