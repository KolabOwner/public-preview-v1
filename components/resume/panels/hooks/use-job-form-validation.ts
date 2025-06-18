import { useMemo } from 'react';

export const VALIDATION_RULES = {
  title: {
    minLength: 2,
    maxLength: 100,
    required: true
  },
  description: {
    minLength: 50,
    maxLength: 10000,
    required: true
  }
} as const;

export const FORM_MESSAGES = {
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
  success: 'Job description saved and analyzed successfully!',
  error: 'Failed to save job description. Please try again.'
} as const;

export interface ValidationState {
  titleValid: boolean;
  descriptionValid: boolean;
  titleError: string | null;
  descriptionError: string | null;
}

export const useFormValidation = (title: string, description: string): ValidationState => {
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