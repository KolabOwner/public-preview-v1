'use client';
import React, { useState, useEffect } from 'react';
import { Briefcase, Loader2 } from 'lucide-react';
import { useJobInfo } from '@/contexts/job-info-context';
import { useAuth } from '@/contexts/firebase-auth-context';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
interface JobInfoPanelProps {
  resumeId?: string; // Add this prop
  onComplete?: () => void;
  className?: string;
}
export default function JobInfoPanel({ resumeId, onComplete, className = '' }: JobInfoPanelProps) {
  const { updateJobInfo, isLoading, currentResumeId, analysisResults, jobInfo, setCurrentResumeId } = useJobInfo();
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set the resume ID in the context when the component mounts
  useEffect(() => {
    if (resumeId && resumeId !== currentResumeId) {
      setCurrentResumeId(resumeId);
    }
  }, [resumeId, currentResumeId, setCurrentResumeId, user?.uid]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both job title and description',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const jobData = {
        title: jobTitle,
        description: jobDescription,
        company: jobCompany,
      };



      console.log('Current resume ID:', currentResumeId);
      console.log('Prop resume ID:', resumeId);
      console.log('User ID:', user?.uid);
      // Call updateJobInfo and log the result
      const result = await updateJobInfo(jobData);
      console.log('updateJobInfo result:', result);
      console.log('Analysis results from context:', analysisResults);
      console.log('Job info from context:', jobInfo);


      toast({
        title: 'Analysis Complete',
        description: 'Job keywords have been analyzed successfully',
      });
      onComplete?.();
    } catch (err) {
      console.error('=== ERROR UPDATING JOB INFO ===');
      console.error('Error details:', err);
      console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
      console.error('=== END ERROR ===');
      toast({
        title: 'Analysis Failed',
        description: err instanceof Error ? err.message : 'Unable to analyze job keywords',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const isAnalyzing = isLoading || isSubmitting;
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Job Details
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Analyze keywords to optimize your resume
          </p>
        </div>
      </div>
      {/* Show a warning if no resume ID is set */}
      {!currentResumeId && !resumeId && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            No resume selected. Please ensure you&apos;re on a resume page to analyze job keywords.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Job Title *
          </label>
          <input
            id="job-title"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isAnalyzing}
          />
        </div>
        <div>
          <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Job Description *
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            disabled={isAnalyzing}
          />
        </div>
        <button
          type="submit"
          disabled={isAnalyzing || !jobTitle.trim() || !jobDescription.trim() || (!currentResumeId && !resumeId)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Keywords...
            </>
          ) : (
            'Analyze Job Keywords'
          )}
        </button>
      </form>
    </div>
  );
}