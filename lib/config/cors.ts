// lib/cors-config.ts
// Centralized CORS configuration for production security

import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_CONFIG } from './constants';

// Use allowed origins from constants
const ALLOWED_ORIGINS = [...SECURITY_CONFIG.ALLOWED_ORIGINS];

// Allowed methods for API endpoints
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

// Allowed headers
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'Cache-Control',
  'X-File-Name'
];

// Exposed headers
const EXPOSED_HEADERS = [
  'X-RateLimit-Limit',
  'X-RateLimit-Remaining',
  'X-RateLimit-Reset'
];

export interface CORSOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export function createCORSConfig(options: CORSOptions = {}): CORSOptions {
  return {
    origin: options.origin || ALLOWED_ORIGINS,
    methods: options.methods || ALLOWED_METHODS,
    allowedHeaders: options.allowedHeaders || ALLOWED_HEADERS,
    exposedHeaders: options.exposedHeaders || EXPOSED_HEADERS,
    credentials: options.credentials !== undefined ? options.credentials : true,
    maxAge: options.maxAge || SECURITY_CONFIG.CORS_MAX_AGE,
  };
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  // Allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return true;
    }
  }
  
  return ALLOWED_ORIGINS.includes(origin);
}

export function setCORSHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  
  // Set appropriate origin header
  if (isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin!);
  } else if (process.env.NODE_ENV === 'development') {
    // Allow any origin in development
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
  response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
  response.headers.set('Access-Control-Expose-Headers', EXPOSED_HEADERS.join(', '));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', String(SECURITY_CONFIG.CORS_MAX_AGE));
  
  return response;
}

export function handleCORSPreflight(request: NextRequest): NextResponse | null {
  // Handle OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return setCORSHeaders(response, request);
  }
  
  return null;
}

// Express.js CORS configuration
export const expressCORSConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'), false);
    }
  },
  methods: ALLOWED_METHODS,
  allowedHeaders: ALLOWED_HEADERS,
  exposedHeaders: EXPOSED_HEADERS,
  credentials: true,
  maxAge: SECURITY_CONFIG.CORS_MAX_AGE,
};