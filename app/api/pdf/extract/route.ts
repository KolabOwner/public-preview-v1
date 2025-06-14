// app/api/pdf/extract/route.ts
// Redirect to /api/resume/extract for backward compatibility

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('=== /api/pdf/extract redirect called, forwarding to /api/resume/extract ===');
  
  try {
    // Clone the request to forward it
    const clonedBody = await request.clone().formData();
    
    // Forward the request to the correct endpoint
    const response = await fetch(new URL('/api/resume/extract', request.url), {
      method: 'POST',
      body: clonedBody
    });
    
    if (!response.ok) {
      throw new Error(`PDF extraction API responded with status: ${response.status}`);
    }
    
    // Return the response from the actual API endpoint
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in /api/pdf/extract redirect:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to redirect to PDF extraction endpoint',
        note: 'The API endpoint has moved to /api/resume/extract'
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
      redirect: '/api/resume/extract',
      note: 'The API endpoint has moved to /api/resume/extract'
    },
    { status: 301, headers: { 'Location': '/api/resume/extract' } }
  );
}