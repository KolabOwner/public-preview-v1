import React, { useCallback, useMemo, useEffect } from 'react';
import { useJobInfo } from "@/contexts/job-info-context";
import { useAuth } from "@/contexts/auth-context";
import { logger } from '@/lib/enterprise/monitoring/logging';

// Components
import { JobPanelHeader } from './components/job-panel-header';
import { StatusMessage } from './components/status-message';
import { JobForm } from './components/job-form';

// Hooks
import { useFormValidation, FORM_MESSAGES } from './hooks/use-job-form-validation';
import { useFormState } from './hooks/use-job-form-state';

// Styles
import { getContainerClasses } from './styles/job-panel-styles';

export interface JobInfoPanelProps {
  onComplete?: () => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  enterpriseOptions?: {
    enableValidation?: boolean;
    enableDLP?: boolean;
    enableRealTimeUpdates?: boolean;
    enableAuditLogging?: boolean;
    enableAdvancedNLP?: boolean;
    industryContext?: string;
    targetATSScore?: number;
  };
}

const JobInfoPanel: React.FC<JobInfoPanelProps> = ({
  onComplete,
  onError,
  className = '',
  disabled = false,
  enterpriseOptions = {}
}) => {
  const {
    jobInfo,
    updateJobInfo,
    currentResumeId,
    associateJob,
    isEnterpriseMode,
    isLoading,
    error: contextError
  } = useJobInfo();
  const { user } = useAuth();
  const { formState, updateFormState } = useFormState();
  const validation = useFormValidation(jobInfo.title, jobInfo.description);

  // Auto-hide success message
  useEffect(() => {
    if (formState.submitSuccess) {
      const timer = setTimeout(() => {
        updateFormState({ submitSuccess: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [formState.submitSuccess, updateFormState]);

  // Handle context errors
  useEffect(() => {
    if (contextError) {
      updateFormState({ submitError: contextError });
    }
  }, [contextError, updateFormState]);

  // Event handlers
  const handleTitleChange = useCallback((value: string) => {
    updateJobInfo({ title: value });
    updateFormState({ submitError: null, submitSuccess: false, hasUnsavedChanges: true });
  }, [updateJobInfo, updateFormState]);

  const handleDescriptionChange = useCallback((value: string) => {
    updateJobInfo({ description: value });
    updateFormState({ submitError: null, submitSuccess: false, hasUnsavedChanges: true });
  }, [updateJobInfo, updateFormState]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const isFormValid = validation.titleValid &&
           validation.descriptionValid &&
           jobInfo.title.trim().length > 0 &&
           jobInfo.description.trim().length > 0;

    if (!isFormValid || formState.isSubmitting || disabled || !user?.uid) {
      return;
    }

    updateFormState({ isSubmitting: true, submitError: null });

    try {
      logger.info('Submitting job info', {
        resumeId: currentResumeId,
        jobTitle: jobInfo.title,
        enterpriseOptions
      });

      const result = await associateJob(
        {
          title: jobInfo.title.trim(),
          company: '',
          description: jobInfo.description.trim(),
          url: jobInfo.url
        },
        enterpriseOptions
      );

      if (result.success) {
        updateFormState({
          isSubmitting: false,
          submitSuccess: true,
          hasUnsavedChanges: false
        });

        onComplete?.();

        logger.info('Job associated successfully', {
          keywordCount: result.keywordCount,
          atsScore: result.atsScore
        });
      } else {
        throw new Error(result.error || 'Failed to associate job');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : FORM_MESSAGES.error;
      logger.error('Failed to submit job info', { error: errorMessage });

      updateFormState({
        isSubmitting: false,
        submitError: errorMessage
      });
      onError?.(errorMessage);
    }
  }, [
    validation,
    jobInfo,
    formState.isSubmitting,
    disabled,
    user?.uid,
    updateFormState,
    currentResumeId,
    associateJob,
    enterpriseOptions,
    onComplete,
    onError
  ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isFormValid = validation.titleValid &&
           validation.descriptionValid &&
           jobInfo.title.trim().length > 0 &&
           jobInfo.description.trim().length > 0;
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isFormValid) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }, [validation, jobInfo, handleSubmit]);

  const containerClasses = useMemo(() => 
    getContainerClasses(disabled, isLoading, className),
    [disabled, isLoading, className]
  );

  const successDetails = useMemo(() => {
    if (!jobInfo.extractedKeywords?.length) return undefined;
    return `Found ${jobInfo.extractedKeywords.length} keywords • ATS Score: ${jobInfo.atsScore || 'Analyzing...'}%`;
  }, [jobInfo.extractedKeywords, jobInfo.atsScore]);

  return (
    <div className={containerClasses}>
      <JobPanelHeader 
        isEnterpriseMode={isEnterpriseMode}
        enterpriseOptions={enterpriseOptions}
      />

      <StatusMessage
        type="success"
        message={FORM_MESSAGES.success}
        details={successDetails}
        show={formState.submitSuccess}
      />

      <StatusMessage
        type="error"
        message={formState.submitError || FORM_MESSAGES.error}
        show={!!formState.submitError}
      />

      <StatusMessage
        type="info"
        message="Processing with enterprise features..."
        details="Advanced NLP analysis may take a few moments"
        show={isLoading && !formState.isSubmitting}
      />

      <JobForm
        jobTitle={jobInfo.title}
        jobDescription={jobInfo.description}
        validation={validation}
        formState={formState}
        disabled={disabled}
        isLoading={isLoading}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default JobInfoPanel;