// app/api/resume/analyze-ats/route.ts
// API route for ATS-optimized resume analysis

import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeResumeForATSInputSchema } from '@/lib/genkit/schemas/ats-analysis';
import { analyzeResumeServer } from '@/lib/genkit/analyze-resume-server';

// GET handler for checking service status
export async function GET(request: NextRequest) {
  try {
    const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;
    
    return NextResponse.json({
      success: true,
      status: hasApiKey ? 'ready' : 'no-api-key',
      service: 'ATS Resume Analysis',
      version: '1.0.0',
      features: [
        'PDF parsing with ExifTool integration',
        'RMS metadata extraction',
        'AI-powered data extraction (Gemini)',
        'ATS compatibility scoring',
        'Keyword analysis',
        'Improvement suggestions',
      ],
      apiKeyConfigured: hasApiKey,
      exiftoolPath: 'C:\\Users\\ashto\\OneDrive\\ExifTool\\exiftool.exe',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Service initialization failed',
      },
      { status: 500 }
    );
  }
}

// Main POST handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = AnalyzeResumeForATSInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    
    const input = validationResult.data;
    console.log('Starting ATS analysis for resume');
    
    // Run the analysis with ExifTool integration
    const result = await analyzeResumeServer(input);
    
    const processingTime = Date.now() - startTime;
    console.log(`ATS analysis completed in ${processingTime}ms`);
    
    return NextResponse.json({
      success: true,
      data: result,
      processingTime,
    });
    
  } catch (error) {
    console.error('ATS analysis error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze resume',
      },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}