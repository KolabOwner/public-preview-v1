// src/contexts/JobInfoContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { JobInfo } from '@/types';

interface JobInfoContextType {
  jobInfo: JobInfo;
  updateJobInfo: (updates: Partial<JobInfo>) => void;
  resetJobInfo: () => void;
  setCurrentResumeId: (resumeId: string | null) => void;
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
  setCurrentResumeId: () => {}
});

interface JobInfoProviderProps {
  children: ReactNode;
}

export const JobInfoProvider: React.FC<JobInfoProviderProps> = ({ children }) => {
  const [jobInfoByResume, setJobInfoByResume] = useState<Record<string, JobInfo>>({});
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);

  // Get current job info based on resume ID
  const jobInfo = currentResumeId ? (jobInfoByResume[currentResumeId] || defaultJobInfo) : defaultJobInfo;

  const updateJobInfo = (updates: Partial<JobInfo>) => {
    if (!currentResumeId) return;
    
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

  const value: JobInfoContextType = {
    jobInfo,
    updateJobInfo,
    resetJobInfo,
    setCurrentResumeId
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