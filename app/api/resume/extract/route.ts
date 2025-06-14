import { NextRequest, NextResponse } from 'next/server';
import { parse as pdfParse } from 'pdf-parse/lib/pdf-parse.js';

// Increase timeout for this route to handle large PDFs
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic'; // Ensure this route is not cached

/**
 * API route for extracting text from PDF files
 * Uses pdf-parse library for server-side extraction
 */
export async function POST(request: NextRequest) {
  try {
    console.log('PDF extraction API called');

    // Parse the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use pdf-parse to extract text
    console.log(`Processing PDF (${file.name}, ${buffer.length} bytes)`);

    try {
      // Configure pdf-parse options (avoid using hardcoded paths)
      const options = {
        max: 100, // Max pages to parse (prevents huge PDFs from causing issues)
        timeout: 30000, // 30 second timeout
        pagerender: undefined, // Use default renderer
        version: 'v1.10.100' // Use specific version
      };

      // Use direct import of pdf-parse.js to avoid the debug mode issue
      const pdfData = await pdfParse(buffer, options);

      if (!pdfData.text || pdfData.text.length < 50) {
        console.warn('Extracted text is too short, suggesting client-side fallback');
        return NextResponse.json({
          success: false,
          error: 'Extracted text is too short. Try client-side extraction.',
          useClientSide: true
        });
      }

      // Return the extracted text
      return NextResponse.json({
        success: true,
        text: pdfData.text,
        info: {
          pages: pdfData.numpages,
          metadata: pdfData.info,
          version: pdfData.version
        }
      });
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);

      // If server-side parsing fails, suggest client-side as fallback
      return NextResponse.json({
        success: false,
        error: `Failed to parse PDF on server: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`,
        useClientSide: true
      });
    }
  } catch (error) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract PDF text',
        details: error instanceof Error ? error.message : String(error),
        useClientSide: true
      },
      { status: 500 }
    );
  }
}

/**
 * Return options for the API
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
  });
}