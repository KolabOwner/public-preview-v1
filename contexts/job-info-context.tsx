// src/contexts/JobInfoContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { JobInfo } from '@/types';

interface JobInfoContextType {
  jobInfo: JobInfo;
  updateJobInfo: (updates: Partial<JobInfo>) => void;
  resetJobInfo: () => void;
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
  resetJobInfo: () => {}
});

interface JobInfoProviderProps {
  children: ReactNode;
}

export const JobInfoProvider: React.FC<JobInfoProviderProps> = ({ children }) => {
  const [jobInfo, setJobInfo] = useState<JobInfo>(defaultJobInfo);

  const updateJobInfo = (updates: Partial<JobInfo>) => {
    setJobInfo(prevState => ({
      ...prevState,
      ...updates
    }));
  };

  const resetJobInfo = () => {
    setJobInfo(defaultJobInfo);
  };

  const value: JobInfoContextType = {
    jobInfo,
    updateJobInfo,
    resetJobInfo
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