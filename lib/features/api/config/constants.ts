// lib/features/api/config/constants.ts

export const RESUME_TEMPLATES = {
  DEFAULT: 'default',
  MODERN: 'modern',
  CLASSIC: 'classic',
  MINIMAL: 'minimal',
} as const;

export const SECURITY_CONFIG = {
  ALLOWED_ORIGINS: [
    'https://your-domain.com',
    'https://www.your-domain.com',
    ...(process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000'] 
      : [])
  ],
  CORS_MAX_AGE: 86400, // 24 hours
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https://firebasestorage.googleapis.com'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'https://*.googleapis.com', 'wss://*.hot-reload.local'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
} as const;