'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Check, FileCheck } from 'lucide-react';
import { Job } from '@/types/job-board.types';
import { useJobInfo } from '@/contexts/job-info-context';
import { useAuth } from '@/contexts/firebase-auth-context';
import JobInfoPanel from '@/components/features/resume/panels/job-info-panel';

interface JobAssociationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  resumeId?: string; // Add resumeId to know which resume to associate with
  onJobAssociated?: () => void;
}

export const JobAssociationModal: React.FC<JobAssociationModalProps> = ({
  isOpen,
  onClose,
  job,
  resumeId,
  onJobAssociated
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { hasJobInfo, jobInfo, clearJobInfo } = useJobInfo();

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Pre-populate with scraped job data when modal opens
  useEffect(() => {
    if (isOpen && job) {
      // Clear any existing job info first
      clearJobInfo();
      setIsComplete(false);
    }
  }, [isOpen, job, clearJobInfo]);

  const handleJobInfoComplete = () => {
    setIsComplete(true);
    onJobAssociated?.();
    // Auto-close modal after brief delay to show success state
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-corporate-navy-800 backdrop-blur-sm rounded-xl w-full max-w-4xl shadow-2xl border border-corporate-navy-200 dark:border-corporate-navy-600 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-corporate-navy-200 dark:border-corporate-navy-600">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <>
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-corporate-navy-900 dark:text-white">
                    Job Associated Successfully
                  </h2>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Ready for AI resume targeting
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-corporate-amber-100 dark:bg-corporate-amber-900/30 flex items-center justify-center">
                  <FileCheck className="w-4 h-4 text-corporate-amber-600 dark:text-corporate-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-corporate-navy-900 dark:text-white">
                    Verify Job Information
                  </h2>
                  <p className="text-sm text-corporate-navy-600 dark:text-gray-400">
                    Review and complete job details for: <span className="font-medium text-corporate-amber-600 dark:text-corporate-amber-400">{job.title}</span>
                  </p>
                </div>
              </>
            )}
          </div>
          {!isComplete && (
            <button
              onClick={onClose}
              className="text-corporate-navy-500 dark:text-gray-400 hover:text-corporate-amber-600 dark:hover:text-corporate-amber-400 transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {isComplete ? (
            // Success state
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-corporate-navy-900 dark:text-white mb-2">
                Job information saved successfully!
              </h3>
              <p className="text-corporate-navy-600 dark:text-gray-400 mb-4">
                Your job data has been analyzed and associated with your resume. You can now use AI targeting.
              </p>
              {hasJobInfo && jobInfo && (
                <div className="bg-corporate-amber-50 dark:bg-corporate-amber-900/20 border border-corporate-amber-200 dark:border-corporate-amber-800 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-corporate-amber-800 dark:text-corporate-amber-200">
                    <strong>Analysis Complete:</strong> {jobInfo.matchedCount || 0} keywords matched, {jobInfo.missingCount || 0} missing
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Job info form
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Scraped Job Data</h4>
                <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <p><strong>Title:</strong> {job.title}</p>
                  <p><strong>Company:</strong> {job.company?.name || 'Not provided'}</p>
                  <p><strong>Location:</strong> {job.location || 'Not provided'}</p>
                  {job.description && (
                    <p><strong>Description:</strong> {job.description.length > 100 ? `${job.description.substring(0, 100)}...` : job.description}</p>
                  )}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Please verify and complete the job information below. You can edit or add details as needed.
                </p>
              </div>

              {/* Pre-populate the job info panel with scraped data */}
              <EnhancedJobInfoPanel 
                initialJobTitle={job.title}
                initialJobDescription={job.description}
                initialCompany={job.company?.name}
                onComplete={handleJobInfoComplete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced JobInfoPanel that accepts initial values
interface EnhancedJobInfoPanelProps {
  onComplete: () => void;
  initialJobTitle?: string;
  initialJobDescription?: string;
  initialCompany?: string;
}

const EnhancedJobInfoPanel: React.FC<EnhancedJobInfoPanelProps> = ({ 
  onComplete, 
  initialJobTitle,
  initialJobDescription,
  initialCompany
}) => {
  const { updateJobInfo, isLoading, currentResumeId } = useJobInfo();
  const { user } = useAuth();
  const [jobTitle, setJobTitle] = useState(initialJobTitle || '');
  const [jobCompany, setJobCompany] = useState(initialCompany || '');
  const [jobDescription, setJobDescription] = useState(initialJobDescription || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim()) {
      alert('Please provide both job title and description');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const jobData = {
        title: jobTitle,
        description: jobDescription,
        company: jobCompany,
      };

      await updateJobInfo(jobData);
      onComplete();
    } catch (err) {
      console.error('Error updating job info:', err);
      alert('Failed to save job information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAnalyzing = isLoading || isSubmitting;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg">
      <form onSubmit={handleSubmit} className="grid gap-y-4">
        {/* Job Title */}
        <div className="relative grid content-baseline gap-y-1">
          <label htmlFor="job-title" className="uppercase flex items-center text-gray-900 dark:text-white font-normal">
            <span className="text-sm leading-5">Job Title</span>
            <span className="text-sm leading-5 ml-1">*</span>
          </label>
          <input
            id="job-title"
            type="text"
            placeholder="Senior UI Designer"
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={isAnalyzing}
            className="h-10 w-full border-2 rounded transition-all duration-200 border-gray-300 dark:border-gray-600 px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500"
          />
        </div>

        {/* Company (Optional) */}
        <div className="relative grid content-baseline gap-y-1">
          <label htmlFor="job-company" className="uppercase flex items-center text-gray-900 dark:text-white font-normal">
            <span className="text-sm leading-5">Company</span>
          </label>
          <input
            id="job-company"
            type="text"
            placeholder="Company Name"
            value={jobCompany}
            onChange={(e) => setJobCompany(e.target.value)}
            disabled={isAnalyzing}
            className="h-10 w-full border-2 rounded transition-all duration-200 border-gray-300 dark:border-gray-600 px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500"
          />
        </div>

        {/* Job Description */}
        <div className="relative grid gap-y-1">
          <label htmlFor="job-description" className="uppercase flex items-center text-gray-900 dark:text-white font-normal">
            <span className="text-sm leading-5">Job Description</span>
            <span className="text-sm leading-5 ml-1">*</span>
          </label>
          <textarea
            id="job-description"
            rows={6}
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isAnalyzing}
            required
            className="bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-500 text-gray-900 dark:text-white rounded resize-none font-normal min-h-44 w-full px-3 py-2"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isAnalyzing}
          className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed w-full border-0 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 focus:bg-blue-500 text-white px-3 py-2.5 h-10 leading-5 rounded-md text-sm"
        >
          {isAnalyzing ? 'Analyzing Keywords...' : 'SAVE JOB INFORMATION'}
        </button>
      </form>
    </div>
  );
};