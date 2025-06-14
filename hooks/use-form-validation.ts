// src/hooks/useFormValidation.ts
import { useMemo } from 'react';

interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
}

interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export const useFormValidation = (
  value: string,
  rules: ValidationRules,
  fieldName: string
): ValidationResult => {
  return useMemo(() => {
    const trimmedValue = value.trim();

    if (rules.required && !trimmedValue) {
      return {
        isValid: false,
        error: `${fieldName} is required`
      };
    }

    if (rules.minLength && trimmedValue.length < rules.minLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${rules.minLength} characters`
      };
    }

    if (rules.maxLength && trimmedValue.length > rules.maxLength) {
      return {
        isValid: false,
        error: `${fieldName} must be less than ${rules.maxLength} characters`
      };
    }

    if (rules.pattern && !rules.pattern.test(trimmedValue)) {
      return {
        isValid: false,
        error: `${fieldName} format is invalid`
      };
    }

    return {
      isValid: true,
      error: null
    };
  }, [value, rules, fieldName]);
};