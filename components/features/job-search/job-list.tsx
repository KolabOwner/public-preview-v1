// components/JobSearch/JobList.tsx
import React from 'react';
import { Job, JobApplication, SavedJob } from '@/types/job-board.types';
import { JobCard } from "@/components/features/job-search/job-card";
import { useJobActions } from "@/lib/client/hooks/jobs/use-job-actions";


interface JobListProps {
  activeTab: string;
  jobs: Job[];
  applications: JobApplication[];
  savedJobs: SavedJob[];
  loading: boolean;
  updateUserStats: () => Promise<void>;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  setSavedJobs: React.Dispatch<React.SetStateAction<SavedJob[]>>;
  loadData: () => Promise<void>;
}

export const JobList: React.FC<JobListProps> = ({
  activeTab,
  jobs,
  applications,
  savedJobs,
  loading,
  updateUserStats,
  setJobs,
  setSavedJobs,
  loadData
}) => {
  const {
    handleSaveJob,
    handleUnsaveJob,
    handleApplicationStatusChange,
    handleApplyToJob
  } = useJobActions({ updateUserStats, setJobs, setSavedJobs, loadData });


  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse"></div>
        </div>
        <span className="ml-4 text-slate-600 dark:text-slate-400 font-medium">
          Loading jobs...
        </span>
      </div>
    );
  }

  const renderJobs = () => {
    switch (activeTab) {
      case 'SAVED':
        return (Array.isArray(savedJobs) ? savedJobs : [])
          ?.filter((saved) => saved && saved.job) // Filter out saved jobs without job data
          ?.map((saved) => (
            <JobCard
              key={saved.id}
              job={saved.job}
              isFromSaved={true}
              onSaveJob={handleSaveJob}
              onUnsaveJob={handleUnsaveJob}
              onStatusChange={handleApplicationStatusChange}
              onApplyToJob={handleApplyToJob}
              onRefreshData={loadData}
            />
          ));

      case 'APPLIED':
      case 'INTERVIEWING':
      case 'REJECTED':
        return (Array.isArray(applications) ? applications : [])
          ?.filter((app) => app && app.job) // Filter out applications without job data
          ?.map((app) => (
            <JobCard
              key={app.id}
              job={app.job}
              application={app}
              onSaveJob={handleSaveJob}
              onUnsaveJob={handleUnsaveJob}
              onStatusChange={handleApplicationStatusChange}
              onApplyToJob={handleApplyToJob}
              onRefreshData={loadData}
            />
          ));

      default:
        return (Array.isArray(jobs) ? jobs : [])?.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSaveJob={handleSaveJob}
            onUnsaveJob={handleUnsaveJob}
            onStatusChange={handleApplicationStatusChange}
            onApplyToJob={handleApplyToJob}
            onRefreshData={loadData}
          />
        ));
    }
  };

  return (
    <div className="space-y-4">
      {renderJobs()}
    </div>
  );
};