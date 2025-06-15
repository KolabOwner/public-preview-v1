// lib/middleware/cors.ts
// CORS middleware for Next.js API routes

import { NextRequest, NextResponse } from 'next/server';
import { handleCORSPreflight, setCORSHeaders } from '@/lib/cors-config';

export function withCORS(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle CORS preflight
    const preflightResponse = handleCORSPreflight(request);
    if (preflightResponse) {
      return preflightResponse;
    }

    try {
      // Execute the actual handler
      const response = await handler(request);
      
      // Add CORS headers to the response
      return setCORSHeaders(response, request);
    } catch (error) {
      // Handle errors and still apply CORS headers
      console.error('Handler error:', error);
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      
      return setCORSHeaders(errorResponse, request);
    }
  };
}

// Alternative wrapper for simpler usage
export function corsHandler(handler: any) {
  return withCORS(handler);
}