import { useCallback, Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/contexts/firebase-auth-context';
import { ApplicationStatus, Job, SavedJob } from '@/types/job-board.types';

interface UseJobActionsProps {
  updateUserStats: () => Promise<void>;
  setJobs: Dispatch<SetStateAction<Job[]>>;
  setSavedJobs: Dispatch<SetStateAction<SavedJob[]>>;
  loadData: () => Promise<void>;
}

export const useJobActions = ({
  updateUserStats,
  setJobs,
  setSavedJobs,
  loadData
}: UseJobActionsProps) => {
  const { user } = useAuth();

  const handleSaveJob = useCallback(async (jobId: string) => {
    if (!user?.uid) return;

    try {
      const userId = user.uid;
      await fetch('/api/jobs/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, jobId }),
      });

      await updateUserStats();
      setJobs((prev: Job[]) => prev.map((job: Job) =>
        job.id === jobId ? { ...job, isSaved: true } : job
      ));
    } catch (error) {
      console.error('Error saving job:', error);
    }
  }, [updateUserStats, setJobs, user?.uid]);

  const handleUnsaveJob = useCallback(async (jobId: string) => {
    if (!user?.uid) return;

    try {
      const userId = user.uid;
      await fetch(`/api/jobs/saved?userId=${userId}&jobId=${jobId}`, {
        method: 'DELETE',
      });

      await updateUserStats();
      setJobs((prev: Job[]) => prev.map((job: Job) =>
        job.id === jobId ? { ...job, isSaved: false } : job
      ));
      setSavedJobs((prev: SavedJob[]) => prev.filter((saved: SavedJob) => saved.jobId !== jobId));
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  }, [updateUserStats, setJobs, setSavedJobs, user?.uid]);

  const handleApplicationStatusChange = useCallback(async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    try {
      await fetch(`/api/jobs/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      await updateUserStats();
      await loadData();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  }, [updateUserStats, loadData]);

  const handleApplyToJob = useCallback(async (jobId: string, job?: Job) => {
    if (!user?.uid) return;
    
    try {
      const userId = user.uid;
      await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          jobId,
          jobData: job, // Include the full job object
          notes: 'Applied via job board'
        }),
      });

      await updateUserStats();
      await loadData();
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  }, [updateUserStats, loadData, user?.uid]);

  const handleApplyToJobSilent = useCallback(async (jobId: string, job?: Job) => {
    if (!user?.uid) return;
    
    try {
      const userId = user.uid;
      await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          jobId,
          jobData: job, // Include the full job object
          notes: 'Applied via job board'
        }),
      });

      // Silent version - no additional stats updates or data fetching
      // Used for optimistic update flows where UI is already updated
    } catch (error) {
      console.error('Error applying to job silently:', error);
    }
  }, [user?.uid]);

  return {
    handleSaveJob,
    handleUnsaveJob,
    handleApplicationStatusChange,
    handleApplyToJob,
    handleApplyToJobSilent
  };
};