export const FILE_LIMITS = {
  MAX_PDF_SIZE_MB: 10,
  MAX_PDF_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_TEXT_LENGTH: 100000,
  MAX_PDF_PAGES: 100,
  PDF_PARSE_TIMEOUT_MS: 30000,
  MIN_TEXT_LENGTH: 50,
} as const;

export const API_TIMEOUTS = {
  PDF_EXTRACTION_SECONDS: 60,
  DEFAULT_REQUEST_MS: 120000,
  MAX_REQUEST_MS: 600000,
} as const;

export const STORAGE_LIMITS = {
  MAX_STORAGE_PER_USER_MB: 200,
  MAX_RESUMES_PER_USER: 20,
  MAX_COVER_LETTERS_PER_USER: 10,
} as const;

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY_MS: 300,
  AUTOSAVE_DELAY_MS: 2000,
  TOOLTIP_DELAY_MS: 200,
  MAX_FONT_SIZE: 20,
  MIN_FONT_SIZE: 8,
  DEFAULT_FONT_SIZE: 11,
  ZOOM_LEVELS: [50, 75, 90, 100, 110, 125, 150] as const,
  DEFAULT_ZOOM: 120,
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_EMAIL_LENGTH: 255,
  MAX_NAME_LENGTH: 100,
  PHONE_REGEX: /^\(\d{3}\) \d{3}-\d{4}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export const API_ENDPOINTS = {
  RESUME_PARSE: '/api/resume/parse',
  PDF_EXTRACT: '/api/resume/extract',
  STATUS_CHECK: '/api/resume/parse',
} as const;

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NO_FILE: 'No file provided',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a PDF or text file.',
  FILE_TOO_LARGE: 'File size must be less than 10MB',
  TEXT_TOO_SHORT: 'Resume text is too short. Please provide more content.',
  TEXT_TOO_LONG: 'Resume text exceeds the maximum allowed length',
  PARSING_FAILED: 'Failed to parse resume. Please check the format and try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTH_REQUIRED: 'Authentication required',
  RATE_LIMITED: 'Too many requests. Please try again later.',
} as const;

export const SUCCESS_MESSAGES = {
  RESUME_SAVED: 'Resume saved successfully',
  RESUME_CREATED: 'Resume created successfully',
  RESUME_DELETED: 'Resume deleted successfully',
  COVER_LETTER_GENERATED: 'Cover letter generated successfully',
  PDF_EXPORTED: 'PDF exported successfully',
} as const;

export const FIREBASE_COLLECTIONS = {
  RESUMES: 'resumes',
  COVER_LETTERS: 'coverLetters',
  USERS: 'users',
  JOB_INFO: 'jobInfo',
  KEYWORDS: 'keywords',
} as const;

export const DEFAULT_THEME = 'light' as const;

export const RESUME_TEMPLATES = {
  DEFAULT: 'default',
  MODERN: 'modern',
  CLASSIC: 'classic',
  MINIMAL: 'minimal',
} as const;

export const REDIS_CONFIG = {
  DEFAULT_TTL: 3600, // 1 hour
  RATE_LIMIT_TTL: 3600, // 1 hour  
  SESSION_TTL: 86400, // 24 hours
  CACHE_TTL: 1800, // 30 minutes
  KEY_PREFIXES: {
    RATE_LIMIT: 'rl',
    SESSION: 'sess',
    CACHE: 'cache',
    USER_DATA: 'user',
  },
} as const;

export const RATE_LIMITS = {
  API: {
    REQUESTS: 100,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  FILE_UPLOAD: {
    REQUESTS: 5,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  AUTH: {
    REQUESTS: 10,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  AI_PROCESSING: {
    REQUESTS: 20,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
  STRICT: {
    REQUESTS: 30,
    WINDOW_MS: 60 * 1000, // 1 minute
  },
} as const;