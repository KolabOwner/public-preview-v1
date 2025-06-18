import { useState, useCallback } from 'react';

export interface FormState {
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
  hasUnsavedChanges: boolean;
}

export const useFormState = () => {
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