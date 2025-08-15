// Main JobSearchPage component
'use client';

import React, { useState } from 'react';
import { ProgressiveJobLoader } from '@/components/ui/progressive-job-loader';
import { useJobSearch } from "@/lib/client/hooks/jobs/use-job-search";
import { useJobActions } from "@/lib/client/hooks/jobs/use-job-actions";
import { useAuth } from "@/contexts/firebase-auth-context";
import { TabNavigation } from "@/components/features/job-search/tab-navigation";
import { SearchFilters } from "@/components/features/job-search/search-filters";
import { JobList } from "@/components/features/job-search/job-list";
import { ApplicationStatus, Job, JobApplication, JobTabId } from '@/types/job-board.types';
import { Timestamp } from 'firebase/firestore';

export default function JobSearchPage() {
  const { user } = useAuth();
  const {
    activeTab,
    setActiveTab,
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
  } = useJobSearch();

  const { handleApplyToJob, handleApplyToJobSilent } = useJobActions({
    updateUserStats,
    setJobs,
    setSavedJobs,
    loadData
  });

  const handleApplyToJobWithUIUpdate = async (jobId: string, job?: Job) => {
    try {
      // Ensure user is authenticated
      if (!user?.uid) {
        console.error('User not authenticated');
        return;
      }

      // Create proper timestamps
      const now = Timestamp.now();

      // Create an optimistic application object that matches JobApplication interface
      const optimisticApplication: JobApplication = {
        id: 'temp-' + Date.now(),
        userId: user.uid, // Now properly typed as string
        jobId,
        job: job, // Type as Job instead of any
        status: ApplicationStatus.APPLIED, // Use enum value
        appliedAt: now, // Use Timestamp instead of Date
        notes: 'Applied via job board',
        resumeUsed: undefined,
        coverLetter: undefined,
        statusHistory: [
          {
            status: ApplicationStatus.APPLIED,
            changedAt: now,
            notes: 'Applied via job board'
          }
        ], // Required field that was missing
        createdAt: now, // Use Timestamp instead of Date
        updatedAt: now  // Use Timestamp instead of Date
      };
      
      // Add to applications immediately for instant UI update
      setApplications(prev => [optimisticApplication, ...prev]);
      
      // Update stats optimistically
      setStats(prev => ({ ...prev, applied: prev.applied + 1 }));
      
      // Switch to Applied tab immediately (programmatically, not user-initiated)
      setIsUserInitiatedTabChange(false);
      setActiveTab('APPLIED');
      
      // Save the application in the background and sync real data
      setTimeout(async () => {
        try {
          await handleApplyToJobSilent(jobId, job);
          // Using silent version to avoid redundant API calls and data fetching
        } catch (error) {
          console.error('Background save failed:', error);
          // Revert optimistic update on error
          setApplications(prev => prev.filter(app => app.id !== optimisticApplication.id));
          setStats(prev => ({ ...prev, applied: prev.applied - 1 }));
        }
      }, 100);
      
    } catch (error) {
      console.error('Error applying to job and updating UI:', error);
    }
  };

  const [showFilters, setShowFilters] = useState(false);
  const [shouldTriggerSearch, setShouldTriggerSearch] = useState(false);

  const handleSearch = async () => {
    if (activeTab === 'ALL_JOBS') {
      setJobs([]);
      setShouldTriggerSearch(true);
      // Reset trigger after a brief moment to allow for re-triggering
      setTimeout(() => setShouldTriggerSearch(false), 100);
    }
    // For other tabs (Applied, Saved, etc.), search doesn't make sense
    // since those show user's personal data, not external job searches
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={stats}
        />

        {/* Search Filters */}
        <SearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          location={location}
          setLocation={setLocation}
          onSearch={handleSearch}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {/* Job Results */}
        <div className="space-y-6">
          {activeTab === 'ALL_JOBS' ? (
            <ProgressiveJobLoader
              searchQuery={searchQuery}
              location={location}
              limit={25}
              onJobsUpdate={setJobs}
              onApplyToJob={handleApplyToJobWithUIUpdate}
              shouldTriggerSearch={shouldTriggerSearch}
              className="space-y-4"
            />
          ) : (
            <JobList
              activeTab={activeTab}
              jobs={jobs}
              applications={applications}
              savedJobs={savedJobs}
              loading={loading}
              updateUserStats={updateUserStats}
              setJobs={setJobs}
              setSavedJobs={setSavedJobs}
              loadData={loadData}
            />
          )}
        </div>
      </div>
    </div>
  );
}