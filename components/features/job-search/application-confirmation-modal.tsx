'use client';

import React from 'react';
import { Job } from '@/types/job-board.types';
import { Building, ExternalLink, X } from 'lucide-react';

interface ApplicationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmApplication: () => void;
  job: Job;
}

export const ApplicationConfirmationModal: React.FC<ApplicationConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmApplication,
  job
}) => {
  if (!isOpen) return null;

  const handleConfirmAndClose = () => {
    onConfirmApplication();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Did you apply?
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Job Info */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-900 dark:text-white mb-1">
              {job.title}
            </h4>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Building className="w-4 h-4" />
              <span>{job.company?.name || 'Unknown Company'}</span>
              <span>•</span>
              <span>{job.location}</span>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We opened the job application link for you. Did you complete and submit your application?
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              This helps us track your job applications and keep your dashboard up to date.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirmAndClose}
              className="
                flex-1 px-4 py-2.5 bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 
                hover:from-corporate-gold-400 hover:to-corporate-amber-400
                text-white font-medium rounded-lg shadow-lg shadow-corporate-gold-500/30
                transition-all duration-200 hover:-translate-y-0.5
              "
            >
              Yes, I applied! 🎉
            </button>
            <button
              onClick={onClose}
              className="
                flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600
                text-slate-700 dark:text-slate-300 font-medium rounded-lg
                hover:bg-slate-50 dark:hover:bg-slate-700
                transition-colors duration-200
              "
            >
              Not yet
            </button>
          </div>

          {/* Helper text */}
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
            Don't worry if you didn't apply yet - you can always update your status later from the job card menu.
          </p>
        </div>
      </div>
    </div>
  );
};