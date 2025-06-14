// src/components/resume/panels/JobInfoPanel.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

import { CheckCircle, AlertCircle, Loader, Sparkles } from 'lucide-react';
import { useJobInfo } from "@/contexts/job-info-context";

export interface JobInfoPanelProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

interface FormState {
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
  hasUnsavedChanges: boolean;
}

interface ValidationState {
  titleValid: boolean;
  descriptionValid: boolean;
  titleError: string | null;
  descriptionError: string | null;
}

const VALIDATION_RULES = {
  title: {
    minLength: 2,
    maxLength: 100,
    required: true
  },
  description: {
    minLength: 50,
    maxLength: 5000,
    required: true
  }
} as const;

const FORM_MESSAGES = {
  title: {
    required: 'Job title is required',
    tooShort: `Job title must be at least ${VALIDATION_RULES.title.minLength} characters`,
    tooLong: `Job title must be less than ${VALIDATION_RULES.title.maxLength} characters`
  },
  description: {
    required: 'Job description is required',
    tooShort: `Job description must be at least ${VALIDATION_RULES.description.minLength} characters`,
    tooLong: `Job description must be less than ${VALIDATION_RULES.description.maxLength} characters`
  },
  success: 'Job description saved successfully!',
  error: 'Failed to save job description. Please try again.'
} as const;

// Form validation hook
const useFormValidation = (title: string, description: string): ValidationState => {
  return useMemo(() => {
    const titleTrimmed = title.trim();
    const descriptionTrimmed = description.trim();

    const titleValid = titleTrimmed.length >= VALIDATION_RULES.title.minLength &&
                      titleTrimmed.length <= VALIDATION_RULES.title.maxLength;

    const descriptionValid = descriptionTrimmed.length >= VALIDATION_RULES.description.minLength &&
                            descriptionTrimmed.length <= VALIDATION_RULES.description.maxLength;

    let titleError: string | null = null;
    let descriptionError: string | null = null;

    if (titleTrimmed.length > 0) {
      if (titleTrimmed.length < VALIDATION_RULES.title.minLength) {
        titleError = FORM_MESSAGES.title.tooShort;
      } else if (titleTrimmed.length > VALIDATION_RULES.title.maxLength) {
        titleError = FORM_MESSAGES.title.tooLong;
      }
    }

    if (descriptionTrimmed.length > 0) {
      if (descriptionTrimmed.length < VALIDATION_RULES.description.minLength) {
        descriptionError = FORM_MESSAGES.description.tooShort;
      } else if (descriptionTrimmed.length > VALIDATION_RULES.description.maxLength) {
        descriptionError = FORM_MESSAGES.description.tooLong;
      }
    }

    return {
      titleValid,
      descriptionValid,
      titleError,
      descriptionError
    };
  }, [title, description]);
};

// Form state management hook
const useFormState = () => {
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    submitSuccess: false,
    submitError: null,
    hasUnsavedChanges: false
  });

  const updateFormState = useCallback((updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFormState = useCallback(() => {
    setFormState({
      isSubmitting: false,
      submitSuccess: false,
      submitError: null,
      hasUnsavedChanges: false
    });
  }, []);

  return { formState, updateFormState, resetFormState };
};

// Form field component
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  children,
  className = ''
}) => {

  return (
    <div className={`relative grid gap-y-2 ${className}`}>
      <div className="flex items-end justify-between">
        <label className="uppercase flex items-center font-semibold text-xs leading-4 text-gray-700 dark:text-gray-300">
          <span className="cursor-pointer">{label}</span>
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Status message component
interface StatusMessageProps {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ type, message, show }) => {
  if (!show) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';
  const borderColor = isSuccess ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800';
  const textColor = isSuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-3 mb-4 animate-in fade-in-0 duration-200`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${textColor} flex-shrink-0`} />
        <span className={`text-sm ${textColor} font-medium`}>{message}</span>
      </div>
    </div>
  );
};

const JobInfoPanel: React.FC<JobInfoPanelProps> = ({
  onComplete,
  onError,
  className = '',
  disabled = false
}) => {
  const { jobInfo, updateJobInfo } = useJobInfo();
  const { formState, updateFormState } = useFormState();
  const validation = useFormValidation(jobInfo.title, jobInfo.description);

  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (descriptionRef.current) {
      const textarea = descriptionRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(172, textarea.scrollHeight)}px`;
    }
  }, [jobInfo.description]);

  // Auto-hide success message
  useEffect(() => {
    if (formState.submitSuccess) {
      const timer = setTimeout(() => {
        updateFormState({ submitSuccess: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formState.submitSuccess, updateFormState]);

  // Load saved job info on mount
  useEffect(() => {
    const loadSavedJobInfo = async () => {
      const documentId = localStorage.getItem('current_document_id');
      const userId = localStorage.getItem('current_user_id');

      if (documentId && userId && !jobInfo.isActive && (!jobInfo.title || !jobInfo.description)) {
        try {
          const response = await fetch(`/api/resume/get/${documentId}?user_id=${userId}`);
          if (response.ok) {
            const data = await response.json();
            if (data?.job_info) {
              updateJobInfo({
                title: data.job_info.title || '',
                description: data.job_info.description || '',
                isActive: true
              });
            }
          }
        } catch (error) {
          console.error('Failed to load saved job info:', error);
        }
      }
    };

    loadSavedJobInfo();
  }, []);

  // Form validation
  const isFormValid = useMemo(() => {
    return validation.titleValid &&
           validation.descriptionValid &&
           jobInfo.title.trim().length > 0 &&
           jobInfo.description.trim().length > 0;
  }, [validation, jobInfo]);

  // Event handlers
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateJobInfo({ title: e.target.value });
    updateFormState({ submitError: null, submitSuccess: false });
  }, [updateJobInfo, updateFormState]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateJobInfo({ description: e.target.value });
    updateFormState({ submitError: null, submitSuccess: false });
  }, [updateJobInfo, updateFormState]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || formState.isSubmitting || disabled) {
      return;
    }

    updateFormState({ isSubmitting: true, submitError: null });

    try {
      const documentId = localStorage.getItem('current_document_id');
      const userId = localStorage.getItem('current_user_id');

      if (documentId && userId) {
        try {
          await fetch(`/api/resume/update-job-info/${documentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              job_info: {
                title: jobInfo.title,
                description: jobInfo.description,
                updated_at: new Date().toISOString()
              }
            }),
          });
        } catch (saveError) {
          console.error('Failed to save job info to database:', saveError);
        }
      }

      updateJobInfo({ isActive: true });
      updateFormState({
        isSubmitting: false,
        submitSuccess: true,
        hasUnsavedChanges: false
      });
      onComplete?.();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : FORM_MESSAGES.error;
      updateFormState({
        isSubmitting: false,
        submitError: errorMessage
      });
      onError?.(errorMessage);
    }
  }, [isFormValid, formState.isSubmitting, disabled, updateFormState, updateJobInfo, onComplete, onError, jobInfo]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isFormValid) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }, [isFormValid, handleSubmit]);

  // Styles
  const containerClasses = useMemo(() =>
    `bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 ${
      disabled ? 'opacity-50 pointer-events-none' : ''
    } ${className}`.trim(),
    [disabled, className]
  );

  const inputClasses = useMemo(() =>
    `w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 font-medium text-base
    bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
    text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400
    focus:border-blue-500 dark:focus:border-blue-400 focus:bg-gray-50 dark:focus:bg-gray-600
    focus:outline-none focus:ring-2 focus:ring-blue-500/20`.trim(),
    []
  );

  const textareaClasses = useMemo(() =>
    `w-full px-3 py-3 border-2 rounded-lg resize-none transition-all duration-200 font-normal text-base min-h-[172px] max-h-64
    bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600
    text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400
    focus:border-blue-500 dark:focus:border-blue-400 focus:bg-gray-50 dark:focus:bg-gray-600
    focus:outline-none focus:ring-2 focus:ring-blue-500/20`.trim(),
    []
  );

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Keyword Targeting
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Rezi helps you get more interviews by optimizing your resume with important keywords in the job description.
          It's super easy - let's start by adding a job description.
        </p>
      </div>

      {/* Status Messages */}
      <StatusMessage
        type="success"
        message={FORM_MESSAGES.success}
        show={formState.submitSuccess}
      />

      <StatusMessage
        type="error"
        message={formState.submitError || FORM_MESSAGES.error}
        show={!!formState.submitError}
      />

      {/* Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="space-y-6"
        noValidate
      >
        <FormField
          label="Job Title"
          required
          error={validation.titleError}
        >
          <input
            ref={titleInputRef}
            type="text"
            name="job-title"
            id="job-title"
            placeholder="e.g. Senior UI Designer"
            value={jobInfo.title}
            onChange={handleTitleChange}
            className={inputClasses}
            maxLength={VALIDATION_RULES.title.maxLength}
            autoComplete="off"
            disabled={disabled || formState.isSubmitting}
            aria-invalid={!!validation.titleError}
            aria-describedby={validation.titleError ? "title-error" : undefined}
          />
          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
            {jobInfo.title.length}/{VALIDATION_RULES.title.maxLength} characters
          </div>
        </FormField>

        <FormField
          label="Job Description"
          required
          error={validation.descriptionError}
        >
          <textarea
            ref={descriptionRef}
            name="job-description"
            id="job-description"
            placeholder="Paste the full job description here..."
            value={jobInfo.description}
            onChange={handleDescriptionChange}
            className={textareaClasses}
            maxLength={VALIDATION_RULES.description.maxLength}
            disabled={disabled || formState.isSubmitting}
            aria-invalid={!!validation.descriptionError}
            aria-describedby={validation.descriptionError ? "description-error" : undefined}
            rows={6}
          />
          <div className="text-xs mt-1 flex justify-between text-gray-500 dark:text-gray-400">
            <span>{jobInfo.description.length}/{VALIDATION_RULES.description.maxLength} characters</span>
            <span>Minimum {VALIDATION_RULES.description.minLength} characters required</span>
          </div>
        </FormField>

        <button
          type="submit"
          disabled={!isFormValid || formState.isSubmitting || disabled}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-bold uppercase text-sm transition-all duration-200 ${
            isFormValid && !formState.isSubmitting && !disabled
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-gray-400 dark:bg-gray-600 text-gray-300 dark:text-gray-400 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800`}
          aria-label={formState.isSubmitting ? 'Saving job description...' : 'Save job description'}
        >
          {formState.isSubmitting ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Save Job Description</span>
            </>
          )}
        </button>

        {isFormValid && !formState.isSubmitting && (
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            Press <kbd className="px-1 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Ctrl+Enter</kbd> to save quickly
          </div>
        )}
      </form>
    </div>
  );
};

export default JobInfoPanel;