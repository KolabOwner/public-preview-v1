// src/components/resume/panels/job-info-panel.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useJobInfo } from '@/contexts/job-info-context';
import { useAuth } from '@/contexts/firebase-auth-context';
import { useToast } from '@/lib/client/hooks/ui/use-toast';

interface JobInfoPanelProps {
  resumeId?: string;
  onComplete?: () => void;
  className?: string;
}

export default function JobInfoPanel({ resumeId, onComplete, className = '' }: JobInfoPanelProps) {
  const { updateJobInfo, isLoading, currentResumeId, analysisResults, jobInfo, setCurrentResumeId, isTargeting } = useJobInfo();
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoTargetEnabled, setAutoTargetEnabled] = useState(() => {
    // Load from localStorage, default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoTargetEnabled');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  // Set the resume ID in the context when the component mounts
  useEffect(() => {
    if (resumeId && resumeId !== currentResumeId) {
      setCurrentResumeId(resumeId);
    }
  }, [resumeId, currentResumeId, setCurrentResumeId, user?.uid]);

  // Save toggle state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoTargetEnabled', JSON.stringify(autoTargetEnabled));
    }
  }, [autoTargetEnabled]);

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
      const result = await updateJobInfo(jobData, {
        autoTarget: autoTargetEnabled
      });
      console.log('updateJobInfo result:', result);
      console.log('Analysis results from context:', analysisResults);
      console.log('Job info from context:', jobInfo);

      toast({
        title: 'Analysis Complete',
        description: autoTargetEnabled 
          ? 'Job keywords have been analyzed and your resume is being optimized...'
          : 'Job keywords have been analyzed successfully',
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
  const isProcessing = isAnalyzing || isTargeting;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full h-full pb-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 lg:p-6 !border-none !shadow-none !pb-0">
        <div className="flex flex-col gap-y-4">
          <div>
            <h2 className="text-lg leading-7 font-semibold text-gray-900 dark:text-white flex w-full justify-between items-center">
              <span className="w-full">AI Keyword Targeting</span>
            </h2>
            {isAnalyzing && !isTargeting && (
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mt-2">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Analyzing job keywords...</span>
              </div>
            )}
            {isTargeting && (
              <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-2">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Optimizing your resume content...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-200 dark:border-gray-700 mt-0 mb-0 !mt-4"></div>

      {/* Auto-Target Toggle */}
      <div className="bg-white dark:bg-gray-800 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Auto-optimize resume content
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Automatically tailor your resume using AI when job info is saved
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoTargetEnabled(!autoTargetEnabled)}
            disabled={isProcessing}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              autoTargetEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            role="switch"
            aria-checked={autoTargetEnabled}
            aria-labelledby="auto-target-label"
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                autoTargetEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 lg:p-6 !border-none !rounded-none !py-0">
        <div className="-mx-6">
          <div className="px-6">
            {/* Show a warning if no resume ID is set */}
            {!currentResumeId && !resumeId && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  No resume selected. Please ensure you&apos;re on a resume page to analyze job keywords.
                </p>
              </div>
            )}

            <span className="text-gray-500 dark:text-gray-400 text-sm leading-5 inline-block py-4">
              Rezum helps you get more interviews by optimizing your resume with important keywords in the job description. It&apos;s super easy - let&apos;s start by adding a job description.
            </span>

            <form onSubmit={handleSubmit} className="grid gap-y-4">
              {/* Job Title */}
              <div className="relative grid content-baseline gap-y-1">
                <div className="inline-block">
                  <div className="flex items-end justify-between">
                    <label htmlFor="job-title" className="uppercase flex items-center text-gray-900 dark:text-white font-normal">
                      <span className="cursor-default text-sm leading-5">Job Title</span>
                      <span className="cursor-default text-sm leading-5 ml-1">*</span>
                    </label>
                  </div>
                </div>
                <div className="flex flex-row items-center">
                  <div className="flex w-full flex-col gap-1">
                    <div className="h-10 text-base flex w-full flex-row items-center self-stretch border-2 rounded transition-all duration-200 border-gray-300 dark:border-gray-600 px-3 py-1 focus-within:ring-0 bg-white dark:bg-gray-700 gap-1">
                      <input
                        autoComplete="off"
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-gray-300 dark:placeholder:text-gray-500 text-ellipsis focus:outline-none focus:ring-0"
                        type="text"
                        name="job-title"
                        placeholder="Senior UI Designer"
                        id="job-title"
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="relative grid gap-y-1">
                <div className="inline-block">
                  <div className="flex items-end justify-between">
                    <label htmlFor="job-description" className="uppercase flex items-center text-gray-900 dark:text-white font-normal">
                      <span className="cursor-default text-sm leading-5">Job Description</span>
                      <span className="cursor-default text-sm leading-5 ml-1">*</span>
                    </label>
                  </div>
                </div>
                <textarea
                  id="job-description"
                  autoComplete="off"
                  className="bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-500 text-gray-900 dark:text-white rounded resize-none font-normal max-h-64 min-h-44 w-full px-3 py-2"
                  name="job-description"
                  rows={6}
                  placeholder="Paste the full job description here..."
                  style={{ height: '172px' }}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={isProcessing}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed !w-full border-0 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 focus:bg-blue-500 text-white px-3 py-2.5 h-10 leading-5 rounded-md text-sm"
              >
                {isTargeting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="px-1">Optimizing Resume...</span>
                  </>
                ) : isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="px-1">Analyzing Keywords...</span>
                  </>
                ) : (
                  <span className="px-1">
                    {autoTargetEnabled ? 'ANALYZE & OPTIMIZE' : 'ANALYZE JOB DESCRIPTION'}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}