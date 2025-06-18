import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
import { FormField } from './form-field';
import { VALIDATION_RULES, ValidationState } from '../hooks/use-job-form-validation';
import { FormState } from '../hooks/use-job-form-state';

interface JobFormProps {
  jobTitle: string;
  jobDescription: string;
  validation: ValidationState;
  formState: FormState;
  disabled: boolean;
  isLoading: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const JobForm: React.FC<JobFormProps> = ({
  jobTitle,
  jobDescription,
  validation,
  formState,
  disabled,
  isLoading,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onKeyDown
}) => {
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
  }, [jobDescription]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(e.target.value);
  }, [onTitleChange]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(e.target.value);
  }, [onDescriptionChange]);

  // Form validation
  const isFormValid = useMemo(() => {
    return validation.titleValid &&
           validation.descriptionValid &&
           jobTitle.trim().length > 0 &&
           jobDescription.trim().length > 0;
  }, [validation, jobTitle, jobDescription]);

  const inputClasses = useMemo(() =>
    `w-full px-3 py-2 border-2 rounded-lg transition-all duration-200 font-medium text-base
    bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 
    text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400
    focus:border-blue-500 dark:focus:border-blue-400 focus:bg-gray-50 dark:focus:bg-gray-600
    focus:outline-none focus:ring-2 focus:ring-blue-500/20`.trim(),
    []
  );

  const textareaClasses = useMemo(() =>
    `w-full px-3 py-3 border-2 rounded-lg resize-none transition-all duration-200 font-normal text-base min-h-[172px] max-h-96
    bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600
    text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400
    focus:border-blue-500 dark:focus:border-blue-400 focus:bg-gray-50 dark:focus:bg-gray-600
    focus:outline-none focus:ring-2 focus:ring-blue-500/20`.trim(),
    []
  );

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onKeyDown={onKeyDown}
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
          placeholder="e.g. Senior Software Engineer"
          value={jobTitle}
          onChange={handleTitleChange}
          className={inputClasses}
          maxLength={VALIDATION_RULES.title.maxLength}
          autoComplete="off"
          disabled={disabled || formState.isSubmitting || isLoading}
          aria-invalid={!!validation.titleError}
          aria-describedby={validation.titleError ? "title-error" : undefined}
        />
        <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
          {jobTitle.length}/{VALIDATION_RULES.title.maxLength} characters
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
          value={jobDescription}
          onChange={handleDescriptionChange}
          className={textareaClasses}
          maxLength={VALIDATION_RULES.description.maxLength}
          disabled={disabled || formState.isSubmitting || isLoading}
          aria-invalid={!!validation.descriptionError}
          aria-describedby={validation.descriptionError ? "description-error" : undefined}
          rows={6}
        />
        <div className="text-xs mt-1 flex justify-between text-gray-500 dark:text-gray-400">
          <span>{jobDescription.length}/{VALIDATION_RULES.description.maxLength} characters</span>
          <span>Minimum {VALIDATION_RULES.description.minLength} characters required</span>
        </div>
      </FormField>

      <button
        type="submit"
        disabled={!isFormValid || formState.isSubmitting || disabled || isLoading}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-bold uppercase text-sm transition-all duration-200 ${
          isFormValid && !formState.isSubmitting && !disabled && !isLoading
            ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-gray-400 dark:bg-gray-600 text-gray-300 dark:text-gray-400 cursor-not-allowed'
        } focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800`}
        aria-label={formState.isSubmitting ? 'Saving and analyzing...' : 'Save and analyze job description'}
      >
        {formState.isSubmitting || isLoading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            <span>{formState.isSubmitting ? 'Analyzing...' : 'Processing...'}</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>Save & Analyze</span>
          </>
        )}
      </button>

      {isFormValid && !formState.isSubmitting && !isLoading && (
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          Press <kbd className="px-1 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Ctrl+Enter</kbd> to save quickly
        </div>
      )}
    </form>
  );
};