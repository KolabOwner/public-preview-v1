// hooks/useJobSearch.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/firebase-auth-context';
import { Job, JobApplication, SavedJob, ApplicationStatus, JobTabId } from '@/types/job-board.types';

export const useJobSearch = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<JobTabId>('ALL_JOBS'); // Now properly typed
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('software engineer intern');
  const [location, setLocation] = useState('California, United States');
  const [stats, setStats] = useState({
    saved: 0,
    applied: 0,
    interviewing: 0,
    rejected: 0
  });

  const updateUserStats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // Fetch real stats from APIs
      const [savedResponse, appliedResponse, interviewingResponse, rejectedResponse] = await Promise.all([
        fetch(`/api/jobs/saved?userId=${user.uid}`),
        fetch(`/api/jobs/applications?userId=${user.uid}&status=APPLIED`),
        fetch(`/api/jobs/applications?userId=${user.uid}&status=INTERVIEWING`),
        fetch(`/api/jobs/applications?userId=${user.uid}&status=REJECTED`)
      ]);

      const [savedData, appliedData, interviewingData, rejectedData] = await Promise.all([
        savedResponse.json(),
        appliedResponse.json(),
        interviewingResponse.json(),
        rejectedResponse.json()
      ]);

      setStats({
        saved: Array.isArray(savedData) ? savedData.length : 0,
        applied: Array.isArray(appliedData) ? appliedData.length : 0,
        interviewing: Array.isArray(interviewingData) ? interviewingData.length : 0,
        rejected: Array.isArray(rejectedData) ? rejectedData.length : 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Fallback to zeros if API fails
      setStats({
        saved: 0,
        applied: 0,
        interviewing: 0,
        rejected: 0
      });
    }
  }, [user?.uid]);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const userId = user.uid;

      switch (activeTab) {
        case 'ALL_JOBS':
          const jobsResponse = await fetch(
            `/api/jobs?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}&limit=25`
          );
          const jobsData = await jobsResponse.json();
          setJobs(jobsData.jobs);
          break;

        case 'SAVED':
          const savedResponse = await fetch(`/api/jobs/saved?userId=${userId}`);
          const savedData = await savedResponse.json();
          setSavedJobs(savedData);
          break;

        default:
          // For 'APPLIED', 'INTERVIEWING', 'REJECTED' tabs
          const appsResponse = await fetch(`/api/jobs/applications?userId=${userId}&status=${activeTab}`);
          const appsData = await appsResponse.json();
          if (Array.isArray(appsData)) {
            setApplications(appsData);
          } else {
            console.error('Applications API returned non-array:', appsData);
            setApplications([]);
          }
          break;
      }

      await updateUserStats();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, location, updateUserStats, user?.uid]);

  // Track if tab change was initiated by user or by application flow
  const [isUserInitiatedTabChange, setIsUserInitiatedTabChange] = useState(true);

  useEffect(() => {
    if (activeTab !== 'ALL_JOBS' && isUserInitiatedTabChange) {
      loadData();
    }
    // Reset the flag after handling the tab change
    setIsUserInitiatedTabChange(true);
  }, [activeTab, loadData, isUserInitiatedTabChange]);

  return {
    activeTab, // Now properly typed as JobTabId
    setActiveTab, // Now properly typed to accept JobTabId
    jobs,
    setJobs,
    applications,
    setApplications,
    savedJobs,
    setSavedJobs,
    loading,
    searchQuery,
    setSearchQuery,
    location,
    setLocation,
    stats,
    setStats,
    loadData,
    updateUserStats,
    setIsUserInitiatedTabChange
  };
};