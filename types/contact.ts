import { z } from 'zod';

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  category: z.enum(['technical', 'billing', 'general', 'feedback', 'bug'], {
    required_error: 'Please select a category'
  }),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

// Infer TypeScript types from Zod schema
export type ContactFormData = z.infer<typeof contactSchema>;

// Contact category types
export type ContactCategory = 'technical' | 'billing' | 'general' | 'feedback' | 'bug';

// API response types
export interface ContactApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Form submission state
export interface SubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

// Email template data
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Rate limiting types
export interface RateLimitConfig {
  maxRequestsPerWindow: number;
  windowMs: number;
  maxRequestsPerDay: number;
  dayMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  error?: string;
}

// Support feature types for UI
export interface SupportFeature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

// Contact category with display info
export interface ContactCategoryOption {
  value: ContactCategory;
  label: string;
  icon: string;
}

// Form validation error
export interface FormError {
  field: keyof ContactFormData;
  message: string;
}

// Constants
export const CONTACT_CATEGORIES: ContactCategoryOption[] = [
  { value: 'technical', label: 'Technical Support', icon: '🔧' },
  { value: 'billing', label: 'Billing & Account', icon: '💳' },
  { value: 'general', label: 'General Inquiry', icon: '❓' },
  { value: 'feedback', label: 'Product Feedback', icon: '💡' },
  { value: 'bug', label: 'Report a Bug', icon: '🐛' }
];

export const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequestsPerWindow: 5, // Max requests per IP in time window
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequestsPerDay: 20, // Max requests per IP per day
  dayMs: 24 * 60 * 60 * 1000, // 24 hours
};

// Email service result
export interface EmailServiceResult {
  success: boolean;
  messageId?: string;
  error?: string;
}