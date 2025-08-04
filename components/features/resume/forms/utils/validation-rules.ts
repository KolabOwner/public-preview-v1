// components/resume/forms/utils/validation-rules.ts
export const contactFormValidation = {
  fullName: {
    required: 'Full name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' }
  },

  email: {
    required: 'Email is required',
    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
  },

  city: (showCity: boolean) => ({
    validate: (value: string) => {
      if (showCity && !value?.trim()) {
        return 'City is required when choosing to show city on resume';
      }
      return true;
    }
  })
};