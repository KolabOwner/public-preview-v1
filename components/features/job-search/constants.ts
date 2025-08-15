// constants/jobSearch.ts
import { JobTabId, JobTab } from '@/types/job-board.types';

export const JOB_TABS: readonly JobTab[] = [
  { id: 'ALL_JOBS' as JobTabId, label: 'All Jobs', showCount: false },
  { id: 'SAVED' as JobTabId, label: 'Saved', showCount: true },
  { id: 'APPLIED' as JobTabId, label: 'Applied', showCount: true },
  { id: 'INTERVIEWING' as JobTabId, label: 'Interviewing', showCount: true },
  { id: 'REJECTED' as JobTabId, label: 'Rejected', showCount: true }
] as const;

export const APPLICATION_STATUSES = [
  { id: 'NO_STATUS', label: 'No status', color: 'neutral' },
  { id: 'APPLIED', label: 'Applied', color: 'amber' },
  { id: 'INTERVIEWING', label: 'Interviewing', color: 'emerald' },
  { id: 'REJECTED', label: 'Rejected', color: 'red' }
] as const;

// Type for APPLICATION_STATUSES colors
export type StatusColor = 'neutral' | 'amber' | 'emerald' | 'red';

// Type for APPLICATION_STATUSES
export type ApplicationStatusId = 'NO_STATUS' | 'APPLIED' | 'INTERVIEWING' | 'REJECTED';
