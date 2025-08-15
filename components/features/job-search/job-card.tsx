// components/JobSearch/JobCard.tsx
import React, { useState } from 'react';
import { FileCheck, MoreHorizontal, Building, Calendar } from 'lucide-react';
import { Job, JobApplication, ApplicationStatus } from '@/types/job-board.types';
import { StatusDropdown } from "@/components/features/job-search/status-dropdown";
import { TargetResumeModal } from "@/components/features/job-search/target-resume-modal";
import { Timestamp } from 'firebase/firestore';

interface JobCardProps {
  job: Job;
  application?: JobApplication | null;
  isFromSaved?: boolean;
  onSaveJob: (jobId: string) => void;
  onUnsaveJob: (jobId: string) => void;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
  onApplyToJob: (jobId: string) => void;
  onRefreshData?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  application,
  onSaveJob,
  onUnsaveJob,
  onStatusChange,
  onApplyToJob,
  onRefreshData
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // Safety check - return null if job is undefined
  if (!job) {
    console.error('JobCard received undefined job prop');
    return null;
  }

  const formatDate = (timestamp: Timestamp | string | Date) => {
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
    <div className="
      group p-6 rounded-xl border border-slate-200 dark:border-slate-700 
      bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg shadow-corporate-gold-500/10 dark:shadow-slate-900/50
      hover:shadow-xl hover:shadow-corporate-amber-500/20 hover:border-corporate-amber-300 dark:hover:border-corporate-amber-600/50
      transition-all duration-300 cursor-pointer
    ">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Job Information */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-corporate-amber-700 dark:text-corporate-amber-400 mb-1 group-hover:text-corporate-amber-600 dark:group-hover:text-corporate-amber-300 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-4 text-corporate-navy-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4 text-corporate-amber-600 dark:text-corporate-amber-400" />
                <span className="font-medium">{job.company?.name || 'Unknown Company'}</span>
              </div>
              <span className="text-corporate-amber-500">•</span>
              <span>{job.location}</span>
            </div>
          </div>
          
          <p className="text-corporate-navy-700 dark:text-gray-300 text-sm leading-relaxed">
            {job.shortDescription || job.description?.substring(0, 150) + '...'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 lg:min-w-[200px]">
          <div className="flex items-center gap-1 text-corporate-navy-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-corporate-amber-600 dark:text-corporate-amber-400" />
            <span className="text-sm font-medium">{formatDate(job.postedAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Target Resume Button */}
            <button 
              onClick={() => {
                setShowTargetModal(true);
              }}
              className="
                px-3 py-1.5 text-xs font-semibold tracking-wide
                border border-corporate-amber-300 dark:border-corporate-amber-600/50 rounded-lg
                text-corporate-amber-700 dark:text-corporate-amber-300 bg-corporate-amber-50 dark:bg-corporate-amber-900/20
                hover:bg-corporate-amber-100 dark:hover:bg-corporate-amber-800/30 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500
                transition-all duration-200
              "
            >
              TARGET RESUME
            </button>

            {/* Save/Bookmark Button */}
            <button
              onClick={() => job.isSaved ? onUnsaveJob(job.id) : onSaveJob(job.id)}
              className="
                p-2 rounded-lg border border-slate-300 dark:border-slate-600
                bg-white dark:bg-slate-800 hover:bg-corporate-amber-50 dark:hover:bg-slate-700
                hover:border-corporate-amber-300 dark:hover:border-corporate-amber-600/50
                transition-all duration-200
              "
              title={job.isSaved ? 'Remove from saved jobs' : 'Save job for later'}
            >
              <FileCheck className={`w-4 h-4 transition-colors ${
                job.isSaved 
                  ? 'fill-corporate-amber-500 text-corporate-amber-500' 
                  : 'text-corporate-navy-400 hover:text-corporate-amber-600'
              }`} />
            </button>

            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="
                  p-2 rounded-lg border border-slate-300 dark:border-slate-600
                  bg-white dark:bg-slate-800 hover:bg-corporate-amber-50 dark:hover:bg-slate-700
                  hover:border-corporate-amber-300 dark:hover:border-corporate-amber-600/50
                  transition-all duration-200
                "
              >
                <MoreHorizontal className="w-4 h-4 text-corporate-navy-400 hover:text-corporate-amber-600 dark:hover:text-corporate-amber-400 transition-colors" />
              </button>

              <StatusDropdown
                currentStatus={application?.status}
                onStatusChange={(status) => onStatusChange(application?.id || '', status)}
                onApplyToJob={onApplyToJob}
                job={job}
                isOpen={dropdownOpen}
                onClose={() => setDropdownOpen(false)}
              />
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
};