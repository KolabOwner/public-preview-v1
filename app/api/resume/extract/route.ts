import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { ERROR_MESSAGES, FILE_LIMITS } from "@/lib/config/constants";


// Increase timeout for this route to handle large PDFs
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic'; // Ensure this route is not cached

/**
 * API route for extracting text from PDF files
 * Uses pdf-parse library for server-side extraction
 */
export async function POST(request: NextRequest) {
  try {
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

    if (file.size > FILE_LIMITS.MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.FILE_TOO_LARGE },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const options = {
        max: FILE_LIMITS.MAX_PDF_PAGES,
        timeout: FILE_LIMITS.PDF_PARSE_TIMEOUT_MS,
        pagerender: undefined,
        version: 'v1.10.100'
      };

      // Parse the PDF buffer
      const pdfData = await pdf(buffer, options);

      if (!pdfData.text || pdfData.text.length < FILE_LIMITS.MIN_TEXT_LENGTH) {
        return NextResponse.json({
          success: false,
          error: ERROR_MESSAGES.TEXT_TOO_SHORT,
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