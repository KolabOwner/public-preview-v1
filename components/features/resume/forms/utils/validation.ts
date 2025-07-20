// Form validation utilities for contact form
export const phoneRegExp = /^(\+\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s-]?)?(\d{3}[\s-]?\d{4})$/;

// Common placeholder values that should be treated as empty
export const EMPTY_VALUE_PLACEHOLDERS: string[] = [
  'n/a', 'N/A', 'na', 'NA',
  'none', 'None', 'NONE',
  'null', 'NULL',
  'undefined', 'UNDEFINED',
  '-', '--', '---',
  'not applicable', 'Not Applicable', 'NOT APPLICABLE',
  'not available', 'Not Available', 'NOT AVAILABLE',
  'empty', 'Empty', 'EMPTY',
  'blank', 'Blank', 'BLANK',
  'tbd', 'TBD',
  'to be determined', 'To Be Determined', 'TO BE DETERMINED'
];

// Function to clean placeholder values
export const cleanPlaceholderValue = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') return '';

  const trimmedValue = value.trim();

  // Check if the value is a common placeholder
  if (EMPTY_VALUE_PLACEHOLDERS.includes(trimmedValue)) {
    return '';
  }

  return trimmedValue;
};

// Utility function to normalize LinkedIn URL
export function normalizeLinkedInUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  const cleaned = input.trim();
  if (!cleaned) return '';
  
  // If it contains linkedin.com/in/, extract just the username
  if (cleaned.includes('linkedin.com/in/')) {
    const parts = cleaned.split('linkedin.com/in/');
    if (parts.length > 1) {
      const username = parts[1].split('/')[0].split('?')[0]; // Remove trailing slash or query params
      return username;
    }
  }
  
  // If it starts with "in/" (like from the prefix), remove it
  if (cleaned.startsWith('in/')) {
    const username = cleaned.substring(3);
    return username;
  }
  
  // If it's just a username (no special characters except allowed ones)
  const usernameMatch = cleaned.match(/^([a-zA-Z0-9\-_.]+)$/);
  if (usernameMatch) {
    return usernameMatch[1];
  }
  
  return cleaned;
}

// Utility function to validate LinkedIn username
export function validateLinkedInUsername(username: string): boolean {
  if (!username) return true; // Allow empty
  
  // More permissive pattern that allows dots and other characters LinkedIn allows
  const pattern = /^[a-zA-Z0-9\-_.]{1,100}$/;
  return pattern.test(username);
}

// Utility function to format website URL
export function formatWebsiteUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  const cleaned = input.trim();
  if (!cleaned) return '';
  
  // If it doesn't start with http/https, add https://
  if (!cleaned.match(/^https?:\/\//)) {
    return `https://${cleaned}`;
  }
  
  return cleaned;
}

// Phone number formatting
export function formatPhoneNumber(value: string): string {
  const cleaned: string = value.replace(/\D/g, '');

  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else {
    return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
}

// Validation rules type
export type ValidationFields = 'fullName' | 'email' | 'phone' | 'linkedin' | 'website' | 'city';
export type ValidationRules = Record<ValidationFields, any>;

// Validation rules
export const validationRules: ValidationRules = {
  fullName: {
    required: 'Full name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters'
    }
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email format'
    }
  },
  phone: {
    validate: (value: string) => {
      const cleanValue = cleanPlaceholderValue(value);
      if (!cleanValue) return true; // Allow empty
      return phoneRegExp.test(cleanValue) || 'Phone number is not valid';
    }
  },
  linkedin: {
    validate: (value: string) => {
      const cleanValue = cleanPlaceholderValue(value);
      if (!cleanValue) return true; // Allow empty
      
      // Since we normalize on change, the value should already be just the username
      return validateLinkedInUsername(cleanValue) || 'Invalid LinkedIn profile';
    }
  },
  website: {
    validate: (value: string) => {
      const cleanValue = cleanPlaceholderValue(value);
      if (!cleanValue) return true; // Allow empty
      const formatted = formatWebsiteUrl(cleanValue);
      const urlPattern = /^https?:\/\/.+\..+/;
      return urlPattern.test(formatted) || 'Invalid website URL';
    }
  },
  city: {
    validate: (value: string, formValues: any) => {
      if (formValues.showLocation && !cleanPlaceholderValue(value)) {
        return 'City is required when showing location';
      }
      return true;
    }
  }
};