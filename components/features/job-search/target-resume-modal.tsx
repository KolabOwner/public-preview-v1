'use client';

import { useState, useRef, useEffect } from 'react';
import { X, FileText, Calendar, Clock } from 'lucide-react';
import { useResumes } from '@/lib/client/hooks/use-resumes';
import { useTargetResume } from '@/lib/client/hooks/jobs/use-target-resume';
import { useJobInfo } from '@/contexts/job-info-context';
import { Job } from '@/types/job-board.types';
import { formatDistanceToNow } from 'date-fns';

interface Resume {
  id: string;
  title: string;
  lastUpdated: string | { seconds: number; nanoseconds: number };
  createdAt: string | { seconds: number; nanoseconds: number };
  isTargeted?: boolean;
  objective?: string;
  summary?: string;
}

interface TargetResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onSuccess?: () => void;
}

export const TargetResumeModal: React.FC<TargetResumeModalProps> = ({
  isOpen,
  onClose,
  job,
  onSuccess
}) => {
  const { data: resumesData, isLoading, error } = useResumes();
  const { targetResume, isTargeting } = useTargetResume();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [editedJobData, setEditedJobData] = useState({
    title: job.title || '',
    description: job.description || '',
    company: job.company?.name || ''
  });
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Reset job data when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditedJobData({
        title: job.title || '',
        description: job.description || '',
        company: job.company?.name || ''
      });
    }
  }, [isOpen, job]);

  const isFirestoreTimestamp = (value: any): value is { seconds: number; nanoseconds: number } => {
    return value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value;
  };

  const parseDate = (dateValue: any): Date => {
    try {
      if (isFirestoreTimestamp(dateValue)) {
        return new Date(dateValue.seconds * 1000);
      }
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return new Date(); // fallback to current date
      }
      return date;
    } catch (e) {
      return new Date(); // fallback to current date
    }
  };

  const getLastUpdatedText = (resume: Resume) => {
    try {
      const date = parseDate(resume.lastUpdated);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  };

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
  };

  const { updateJobInfo, setCurrentResumeId } = useJobInfo();

  const handleConfirm = async () => {
    if (!selectedResumeId) return;

    console.log('🎯 Starting target resume process for:', { resumeId: selectedResumeId, jobTitle: job.title });

    try {
      // Save job information to the selected resume (passing resumeId directly)
      await updateJobInfo({
        title: editedJobData.title,
        description: editedJobData.description,
        company: editedJobData.company
      }, {}, selectedResumeId);
      
      // Then run the targeting
      const result = await targetResume(selectedResumeId);
      
      if (result.success) {
        console.log('✅ Resume targeting successful:', result.message);
        alert(`Success! ${result.message}`);
        onSuccess?.();
        onClose();
      } else {
        console.error('❌ Resume targeting failed:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert('An unexpected error occurred while targeting the resume.');
    }
  };

  const resumes = resumesData?.resumes || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white/95 dark:bg-corporate-navy-800 backdrop-blur-sm rounded-xl w-full max-w-2xl shadow-2xl border border-corporate-navy-200 dark:border-corporate-navy-600 max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-corporate-navy-200 dark:border-corporate-navy-600">
          <div>
            <h2 className="text-xl font-semibold text-corporate-navy-900 dark:text-white">
              Target Resume with AI
            </h2>
            <p className="text-sm text-corporate-navy-600 dark:text-gray-400 mt-1">
              Choose a resume to optimize for: <span className="font-medium text-corporate-amber-600 dark:text-corporate-amber-400">{job.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-corporate-navy-500 dark:text-gray-400 hover:text-corporate-amber-600 dark:hover:text-corporate-amber-400 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Job Information Section */}
          <div className="p-6 border-b border-corporate-navy-200 dark:border-corporate-navy-600 bg-corporate-navy-50/30 dark:bg-corporate-navy-900/30">
            <h3 className="text-lg font-semibold text-corporate-navy-900 dark:text-white mb-4">
              Job Information
            </h3>
            <div className="grid gap-4">
              {/* Job Title */}
              <div>
                <label htmlFor="job-title" className="block text-sm font-medium text-corporate-navy-700 dark:text-gray-300 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={editedJobData.title}
                  onChange={(e) => setEditedJobData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-corporate-navy-300 dark:border-corporate-navy-600 rounded-md bg-white dark:bg-corporate-navy-700 text-corporate-navy-900 dark:text-white focus:ring-2 focus:ring-corporate-amber-500 focus:border-corporate-amber-500"
                  placeholder="Enter job title..."
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="job-company" className="block text-sm font-medium text-corporate-navy-700 dark:text-gray-300 mb-1">
                  Company
                </label>
                <input
                  id="job-company"
                  type="text"
                  value={editedJobData.company}
                  onChange={(e) => setEditedJobData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-corporate-navy-300 dark:border-corporate-navy-600 rounded-md bg-white dark:bg-corporate-navy-700 text-corporate-navy-900 dark:text-white focus:ring-2 focus:ring-corporate-amber-500 focus:border-corporate-amber-500"
                  placeholder="Enter company name..."
                />
              </div>

              {/* Job Description */}
              <div>
                <label htmlFor="job-description" className="block text-sm font-medium text-corporate-navy-700 dark:text-gray-300 mb-1">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="job-description"
                  value={editedJobData.description}
                  onChange={(e) => setEditedJobData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-corporate-navy-300 dark:border-corporate-navy-600 rounded-md bg-white dark:bg-corporate-navy-700 text-corporate-navy-900 dark:text-white focus:ring-2 focus:ring-corporate-amber-500 focus:border-corporate-amber-500 resize-none"
                  placeholder="Enter or paste the job description..."
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-corporate-navy-900 dark:text-white mb-4">
              Select Resume to Target
            </h3>
            
            {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-corporate-amber-500 border-t-transparent"></div>
              <span className="ml-3 text-corporate-navy-600 dark:text-gray-400">Loading your resumes...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-500 dark:text-red-400 mb-2">Failed to load resumes</p>
                <p className="text-sm text-corporate-navy-600 dark:text-gray-400">Please try again later</p>
              </div>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-corporate-navy-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-corporate-navy-600 dark:text-gray-400 mb-2">No resumes found</p>
                <p className="text-sm text-corporate-navy-500 dark:text-gray-500">Create your first resume to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume: Resume) => (
                <div
                  key={resume.id}
                  onClick={() => handleResumeSelect(resume.id)}
                  className={`
                    relative p-4 rounded-lg border cursor-pointer transition-all duration-200
                    ${selectedResumeId === resume.id
                      ? 'border-corporate-amber-400 dark:border-corporate-amber-500 bg-corporate-amber-50 dark:bg-corporate-amber-900/20 ring-2 ring-corporate-amber-400/30'
                      : 'border-corporate-navy-200 dark:border-corporate-navy-600 hover:border-corporate-amber-300 dark:hover:border-corporate-amber-600/50 bg-white dark:bg-corporate-navy-700 hover:bg-corporate-amber-50/50 dark:hover:bg-corporate-navy-600'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-corporate-navy-900 dark:text-white">
                          {resume.title}
                        </h3>
                        {resume.isTargeted && (
                          <span className="bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            TARGETED
                          </span>
                        )}
                      </div>
                      
                      {(resume.objective || resume.summary) && (
                        <p className="text-sm text-corporate-navy-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {(resume.objective || resume.summary)?.substring(0, 120)}...
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-corporate-navy-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Updated {getLastUpdatedText(resume)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {formatDistanceToNow(parseDate(resume.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selection indicator */}
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center ml-4 flex-shrink-0
                      ${selectedResumeId === resume.id
                        ? 'border-corporate-amber-500 bg-corporate-amber-500'
                        : 'border-corporate-navy-300 dark:border-corporate-navy-500'
                      }
                    `}>
                      {selectedResumeId === resume.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-corporate-navy-200 dark:border-corporate-navy-600 bg-corporate-navy-50/50 dark:bg-corporate-navy-900/30">
          <div className="text-xs text-corporate-navy-500 dark:text-gray-400">
            {!editedJobData.title || !editedJobData.description ? 
              'Please fill in job title and description' : 
              !selectedResumeId ? 
              'Select a resume to continue' : 
              'Ready to target your resume with AI'
            }
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-corporate-navy-600 dark:text-gray-300 hover:text-corporate-navy-800 dark:hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedResumeId || resumes.length === 0 || isTargeting || !editedJobData.title.trim() || !editedJobData.description.trim()}
              className={`
                px-6 py-2 text-sm font-medium rounded-md transition-colors
                ${selectedResumeId && resumes.length > 0 && !isTargeting && editedJobData.title.trim() && editedJobData.description.trim()
                  ? 'bg-corporate-amber-600 text-white hover:bg-corporate-amber-700 shadow-md shadow-corporate-gold-500/30'
                  : 'bg-corporate-navy-300 dark:bg-corporate-navy-700 text-corporate-navy-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isTargeting ? 'TARGETING...' : 'TARGET RESUME'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};