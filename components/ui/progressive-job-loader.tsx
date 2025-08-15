import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, FileCheck, MoreHorizontal } from 'lucide-react';
import { Job } from '@/types/job-board.types';
import { useJobStream } from '@/hooks/useJobStream';
import { ApplicationConfirmationModal } from '@/components/features/job-search/application-confirmation-modal';
import { TargetResumeModal } from '@/components/features/job-search/target-resume-modal';
import { Timestamp } from 'firebase/firestore';

interface ProgressiveJobLoaderProps {
  searchQuery: string;
  location: string;
  limit?: number;
  onJobsUpdate?: (jobs: Job[]) => void;
  onApplyToJob?: (jobId: string, job?: Job) => void;
  shouldTriggerSearch?: boolean;
  className?: string;
}

export function ProgressiveJobLoader({
  searchQuery,
  location,
  limit = 25,
  onJobsUpdate,
  onApplyToJob,
  shouldTriggerSearch = false,
  className = ''
}: ProgressiveJobLoaderProps) {
  const jobStream = useJobStream();
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Only trigger search when explicitly requested by parent component
  React.useEffect(() => {
    if (shouldTriggerSearch && searchQuery && location) {
      jobStream.startSearch({
        query: searchQuery,
        location,
        limit,
        sources: ['linkedin']
      });
    }
  }, [shouldTriggerSearch, searchQuery, location, limit]);

  React.useEffect(() => {
    if (onJobsUpdate) {
      onJobsUpdate(jobStream.jobs);
    }
  }, [jobStream.jobs, onJobsUpdate]);

  const handleConfirmApplication = async () => {
    if (selectedJob && onApplyToJob) {
      await onApplyToJob(selectedJob.id, selectedJob);
    }
  };

  const handleViewJob = (job: Job) => {
    // Open job in new tab
    window.open(job.externalUrl, '_blank', 'noopener,noreferrer');
    // Show confirmation modal after a short delay to allow tab to open
    setTimeout(() => {
      setSelectedJob(job);
      setShowModal(true);
    }, 500);
  };

  return (
    <>
      <div className={`w-full ${className}`}>
        <JobResults
          jobs={jobStream.jobs}
          loading={jobStream.loading}
          onViewJob={handleViewJob}
        />
      </div>

      {/* Application Confirmation Modal */}
      {selectedJob && (
        <ApplicationConfirmationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedJob(null);
          }}
          onConfirmApplication={handleConfirmApplication}
          job={selectedJob}
        />
      )}
    </>
  );
}

interface JobResultsProps {
  jobs: Job[];
  loading: boolean;
  onViewJob?: (job: Job) => void;
}

function JobResults({ jobs, loading, onViewJob }: JobResultsProps) {
  const handleViewJob = (job: Job) => {
    if (onViewJob) {
      onViewJob(job);
    }
  };

  return (
    <div className="space-y-0">
      <AnimatePresence>
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                delay: index * 0.1, // Stagger animation
                duration: 0.3
              }
            }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            <JobCard job={job} onViewJob={handleViewJob} onRefreshData={() => {/* TODO: Add refresh logic if needed */}} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={`skeleton-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-surface-2 rounded-lg border border-surface-2-stroke"
            >
              <JobSkeleton />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job, onViewJob, onRefreshData }: { 
  job: Job; 
  onViewJob?: (job: Job) => void;
  onRefreshData?: () => void;
}) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showTargetModal, setShowTargetModal] = React.useState(false);

  // Safety check - return null if job is undefined
  if (!job) {
    console.error('ProgressiveJobLoader JobCard received undefined job prop');
    return null;
  }

  const isExternal = job.isExternal || job.externalUrl;

  const handleSaveJob = async (jobId: string) => {
    // TODO: Implement save functionality
    console.log('Save job:', jobId);
  };

  // Helper function to format date from Timestamp or other date types
  const formatJobDate = (timestamp: Timestamp | string | Date) => {
    let date: Date;

    if (timestamp instanceof Timestamp) {
      // Firebase Timestamp
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      // String date
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      // Already a Date object
      date = timestamp;
    } else {
      // Fallback
      console.warn('Unknown timestamp format:', timestamp);
      return 'Unknown date';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="mb-2 flex cursor-pointer flex-col flex-wrap items-center gap-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-card-foreground p-6 transition-all duration-200 hover:bg-accent/10 hover:shadow-sm focus:bg-accent/10 sm:mb-4 lg:mb-0 lg:flex-row lg:flex-nowrap lg:gap-4 lg:rounded-t-none lg:border-0 lg:border-b lg:px-4 lg:py-3 lg:last:border-b-0 lg:rounded-b-none">

      {/* Job Info */}
      <div className="flex w-full flex-col gap-x-4 gap-y-4 lg:flex-row">
        <div className="flex-1">
          <div className="text-base font-bold leading-6 text-corporate-amber-700 dark:text-corporate-amber-300 hover:text-corporate-amber-600 dark:hover:text-corporate-amber-200 transition-colors">
            {job.title}
          </div>
          <div className="flex flex-row gap-x-2 mt-1">
            <div className="items-top flex flex-row gap-x-1">
              <Building className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div className="text-base font-normal leading-6 text-foreground">
                {job.company?.name || 'Unknown Company'}
              </div>
            </div>
            <span className="flex items-center text-muted-foreground after:content-['·']"></span>
            <div>
              <span className="break-words text-muted-foreground">{job.location}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-1 flex-row items-center lg:min-h-[48px]">
          <div className="flex w-full items-start gap-x-2">
            <div className="h-5 w-5 cursor-pointer group relative flex items-center justify-center">
              <i className="!flex items-center justify-center text-primary/80 pt-2 text-base w-5 h-5">
                ✨
              </i>
            </div>
            <div className="flex w-full text-sm text-muted-foreground leading-relaxed">
              {job.shortDescription || job.description?.substring(0, 120) + '...'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center lg:w-auto lg:flex-nowrap">

        {/* Date */}
        <div className="flex flex-row items-center justify-between gap-4 xs:!w-full sm:!w-1/2 lg:flex-col lg:items-start lg:gap-1" style={{minWidth: '100px'}}>
          <div className="w-full whitespace-nowrap text-muted-foreground">
            <div style={{minWidth: '100px'}} className="text-xs font-medium">
              {formatJobDate(job.postedAt)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-row items-center justify-end gap-x-2 sm:w-auto" style={{minWidth: '185px'}}>
          
          {/* View Job Button */}
          {isExternal && job.externalUrl && (
            <div className="flex w-full justify-end whitespace-nowrap sm:w-auto">
              <button
                onClick={() => {
                  if (onViewJob && typeof onViewJob === 'function') {
                    onViewJob(job);
                  } else {
                    // Fallback: just open the URL
                    window.open(job.externalUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="btn-primary btn-sm relative flex items-center justify-center font-semibold uppercase tracking-wide focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-200 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-sm hover:from-amber-500 hover:to-amber-600 px-2 py-1 min-h-8 leading-4 rounded-md text-xs"
              >
                <span className="px-1">VIEW JOB</span>
              </button>
            </div>
          )}
          
          {/* Target Resume Button */}
          <div className="flex w-full justify-end whitespace-nowrap sm:w-auto">
            <button
              type="button"
              onClick={() => setShowTargetModal(true)}
              className="btn-outline btn-sm relative flex items-center justify-center font-semibold uppercase tracking-wide focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 hover:bg-accent/20 text-foreground border border-slate-300 dark:border-slate-600 px-2 py-1 min-h-8 leading-4 rounded-md text-xs"
            >
              <span className="px-1">TARGET RESUME</span>
            </button>
          </div>

          <div className="flex flex-row">
            {/* Save/Bookmark Button */}
            <button
              onClick={() => handleSaveJob(job.id)}
              className="relative flex items-center justify-center focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 hover:bg-accent/20 text-foreground border border-slate-300 dark:border-slate-600 px-2 py-1 min-h-8 leading-4 rounded-md text-xs w-8 rounded-br-none rounded-tr-none border-r-0"
              title={job.isSaved ? 'Remove from saved jobs' : 'Save job for later'}
            >
              <FileCheck 
                className={`transition-colors w-3.5 h-3.5 ${
                  job.isSaved ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground hover:text-amber-400'
                }`}
              />
            </button>

            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative flex items-center justify-center focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 hover:bg-accent/20 text-foreground border border-slate-300 dark:border-slate-600 px-2 py-1 min-h-8 leading-4 rounded-md text-xs w-8 rounded-bl-none rounded-tl-none"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Target Resume Modal */}
      <TargetResumeModal
        isOpen={showTargetModal}
        onClose={() => setShowTargetModal(false)}
        job={job}
        onSuccess={() => {
          onRefreshData?.();
          setShowTargetModal(false);
        }}
      />

    </div>
  );
}

function JobSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex space-x-3 mb-2">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
        <div>
          <div className="h-4 bg-gray-300 rounded w-48 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
      <div className="flex space-x-4 mb-2">
        <div className="h-3 bg-gray-300 rounded w-24"></div>
        <div className="h-3 bg-gray-300 rounded w-16"></div>
        <div className="h-3 bg-gray-300 rounded w-32"></div>
      </div>
      <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
    </div>
  );
}