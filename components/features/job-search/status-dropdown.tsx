// components/JobSearch/StatusDropdown.tsx

import React from 'react';
import { APPLICATION_STATUSES } from "@/components/features/job-search/constants";
import { ApplicationStatus, Job } from '@/types/job-board.types';

// Define the color type based on your APPLICATION_STATUSES
type StatusColor = 'neutral' | 'amber' | 'emerald' | 'red';

interface StatusDropdownProps {
  currentStatus?: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
  onApplyToJob: (jobId: string) => void;
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  onApplyToJob,
  job,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getStatusColorClasses = (color: StatusColor): string => {
    const colorMap: Record<StatusColor, string> = {
      neutral: 'bg-slate-200 border-slate-300',
      amber: 'bg-amber-200 border-amber-300',
      emerald: 'bg-emerald-200 border-emerald-300',
      red: 'bg-red-200 border-red-300'
    };
    return colorMap[color] || colorMap.neutral;
  };

  const handleStatusClick = async (statusId: string) => {
    if (statusId === 'APPLIED' && !currentStatus) {
      await onApplyToJob(job.id);
    } else if (currentStatus) {
      onStatusChange(statusId as ApplicationStatus);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="
        absolute right-0 top-full mt-1 z-20 min-w-[160px]
        bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700
        py-1 backdrop-blur-sm
      ">
        {APPLICATION_STATUSES.map(status => (
          <button
            key={status.id}
            onClick={() => handleStatusClick(status.id)}
            className={`
              w-full px-4 py-2 text-left flex items-center gap-3 transition-colors
              hover:bg-slate-50 dark:hover:bg-slate-700
              ${currentStatus === status.id ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
            `}
          >
            <span className={`w-3 h-3 rounded-full border-2 ${getStatusColorClasses(status.color as StatusColor)}`} />
            <span className={`text-sm font-medium ${
              currentStatus === status.id 
                ? 'text-amber-700 dark:text-amber-300' 
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {status.label}
            </span>
          </button>
        ))}
      </div>
    </>
  );
};