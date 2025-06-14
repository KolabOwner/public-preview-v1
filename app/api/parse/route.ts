// app/api/parse/route.ts
// Redirect for backward compatibility - sends requests to the correct endpoint at /api/resume/parse

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('=== /api/parse redirect called, forwarding to /api/resume/parse ===');
  
  try {
    // Clone the request to forward it
    const clonedBody = await request.clone().formData();
    
    // Forward the request to the correct endpoint
    const response = await fetch(new URL('/api/resume/parse', request.url), {
      method: 'POST',
      body: clonedBody
    });
    
    if (!response.ok) {
      throw new Error(`Resume parsing API responded with status: ${response.status}`);
    }
    
    // Return the response from the actual API endpoint
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in /api/parse redirect:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to redirect to resume parsing endpoint',
        note: 'The API endpoint has moved to /api/resume/parse - please update your code to use the new endpoint'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests too
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'This endpoint has moved',
      redirect: '/api/resume/parse',
      note: 'The API endpoint has moved to /api/resume/parse - please update your code to use the new endpoint'
    },
    { status: 301, headers: { 'Location': '/api/resume/parse' } }
  );
}