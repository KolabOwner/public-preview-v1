'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface JobUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (title: string, description: string) => void;
  currentTitle?: string;
  currentDescription?: string;
}

const JobUpdateModal: React.FC<JobUpdateModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  currentTitle = '',
  currentDescription = ''
}) => {
  const [mounted, setMounted] = useState(false);
  const [jobTitle, setJobTitle] = useState(currentTitle);
  const [jobDescription, setJobDescription] = useState(currentDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setJobTitle(currentTitle);
    setJobDescription(currentDescription);
  }, [currentTitle, currentDescription]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobTitle.trim() || !jobDescription.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(jobTitle.trim(), jobDescription.trim());
      onClose();
    } catch (error) {
      console.error('Failed to update job description:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setJobTitle(currentTitle);
    setJobDescription(currentDescription);
    onClose();
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={handleCancel} />
      
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative transform rounded-lg border border-gray-200 dark:border-gray-700 text-left align-middle shadow-xl transition-all w-full max-w-md bg-white dark:bg-gray-800">
            {/* Header */}
            <h2 className="flex leading-7 text-xl font-semibold bg-gray-50 dark:bg-gray-900 rounded-t-lg text-gray-900 dark:text-gray-100 items-center px-6 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="grow font-semibold">Update Job Description</div>
              <button
                onClick={handleCancel}
                className="absolute right-6 flex h-12 w-12 cursor-pointer items-center justify-center text-xl text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <X className="w-5 h-5" />
              </button>
            </h2>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
                <p className="text-gray-900 dark:text-gray-100">
                  Update your job description to analyze keywords and optimize your resume for better matching.
                </p>

                {/* Job Title Input */}
                <div className="relative grid content-baseline gap-y-1">
                  <div className="inline-block">
                    <div className="flex items-end justify-between">
                      <label htmlFor="job-title" className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal">
                        <span className="cursor-default text-sm leading-5">Job Title</span>
                        <span className="cursor-default text-sm leading-5 ml-1 text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <div className="flex w-full flex-col gap-1">
                      <div className="h-10 text-base sm:h-12 flex w-full flex-row items-center self-stretch border-2 rounded transition-all duration-200 border-gray-300 dark:border-gray-600 px-3 py-1 focus-within:border-blue-500 dark:focus-within:border-blue-400 bg-white dark:bg-gray-900">
                        <input
                          id="job-title"
                          type="text"
                          className="bg-transparent text-gray-900 dark:text-gray-100 h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-ellipsis focus:outline-none focus:ring-0"
                          placeholder="e.g., Software Engineer"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Description Textarea */}
                <div className="relative grid gap-y-1">
                  <div className="inline-block">
                    <div className="flex items-end justify-between">
                      <label htmlFor="job-description" className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal">
                        <span className="cursor-default text-sm leading-5">Job Description</span>
                        <span className="cursor-default text-sm leading-5 ml-1 text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                  <textarea
                    id="job-description"
                    className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 rounded resize-none font-normal max-h-64 min-h-44 p-3"
                    rows={6}
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                    style={{ minHeight: '172px' }}
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex gap-x-4 justify-end rounded-b-lg px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 px-3 py-2 h-10 leading-5 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !jobTitle.trim() || !jobDescription.trim()}
                className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition duration-200 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-3 py-2 h-10 leading-5 rounded-md text-sm"
              >
                {isSubmitting ? 'Updating...' : 'Update job description'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default JobUpdateModal;