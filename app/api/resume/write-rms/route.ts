// app/api/resume/write-rms/route.ts
// API route for writing RMS metadata to PDFs using ExifTool

import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';

const execFileAsync = promisify(execFile);

// ExifTool configuration
const EXIFTOOL_PATH = 'C:\\Users\\ashto\\OneDrive\\ExifTool\\exiftool.exe';
const EXIFTOOL_CONFIG_PATH = './config/exiftool/rms-config.pl';

export const maxDuration = 30; // 30 seconds timeout
export const dynamic = 'force-dynamic';

interface RMSMetadataInput {
  producer?: string;
  rms_schema_detail?: string;
  
  // Contact Information
  rms_contact_fullName?: string;
  rms_contact_givenNames?: string;
  rms_contact_lastName?: string;
  rms_contact_email?: string;
  rms_contact_phone?: string;
  rms_contact_city?: string;
  rms_contact_state?: string;
  rms_contact_country?: string;
  rms_contact_linkedin?: string;
  rms_contact_github?: string;
  rms_contact_website?: string;
  
  // Summary
  rms_summary?: string;
  
  // Counts
  rms_experience_count?: number;
  rms_education_count?: number;
  rms_skill_count?: number;
  rms_project_count?: number;
  rms_involvement_count?: number;
  rms_certification_count?: number;
  
  // All other indexed fields
  [key: string]: any;
}

// POST handler for writing RMS metadata to PDF
export async function POST(request: NextRequest) {
  let tempInputPath: string | undefined;
  let tempOutputPath: string | undefined;
  
  try {
    // Get the PDF data and metadata from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadataJson = formData.get('metadata') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!metadataJson) {
      return NextResponse.json(
        { success: false, error: 'No metadata provided' },
        { status: 400 }
      );
    }
    
    // Parse metadata
    let metadata: RMSMetadataInput;
    try {
      metadata = JSON.parse(metadataJson);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid metadata JSON' },
        { status: 400 }
      );
    }
    
    // Verify it's a PDF
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }
    
    console.log(`[RMS Write API] Processing PDF: ${file.name} (${file.size} bytes)`);
    console.log(`[RMS Write API] Writing ${Object.keys(metadata).length} metadata fields`);
    
    // Create temporary files
    const tempId = randomBytes(16).toString('hex');
    tempInputPath = join(tmpdir(), `rms_input_${tempId}.pdf`);
    tempOutputPath = join(tmpdir(), `rms_output_${tempId}.pdf`);
    
    // Save input PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempInputPath, buffer);
    
    // Build ExifTool arguments
    const args = [
      '-config', EXIFTOOL_CONFIG_PATH,
      '-overwrite_original', // Don't create backup
    ];
    
    // Add each metadata field as an argument with proper namespace
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Producer goes to PDF metadata, not XMP
        if (key === 'producer') {
          args.push(`-PDF:Producer=${String(value)}`);
        } else {
          // RMS fields go to XMP-rms namespace
          args.push(`-XMP-rms:${key}=${String(value)}`);
        }
      }
    });
    
    // Add input file
    args.push(tempInputPath);
    
    console.log(`[RMS Write API] ExifTool command: exiftool ${args.join(' ')}`);
    
    // Execute ExifTool to write metadata
    const { stdout, stderr } = await execFileAsync(
      EXIFTOOL_PATH,
      args,
      {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 30000, // 30 second timeout
        windowsHide: true,
      }
    );
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('[RMS Write API] ExifTool stderr:', stderr);
    }
    
    console.log('[RMS Write API] ExifTool stdout:', stdout);
    
    // Read the modified PDF
    const modifiedPdfBuffer = await readFile(tempInputPath);
    
    // Verify metadata was written by reading it back
    const verifyArgs = [
      '-config', EXIFTOOL_CONFIG_PATH,
      '-j', // JSON output
      '-XMP-rms:all',
      tempInputPath
    ];
    
    const { stdout: verifyOutput } = await execFileAsync(
      EXIFTOOL_PATH,
      verifyArgs,
      {
        maxBuffer: 10 * 1024 * 1024,
        timeout: 10000,
        windowsHide: true,
      }
    );
    
    const verifiedMetadata = JSON.parse(verifyOutput)[0] || {};
    const writtenFields = Object.keys(verifiedMetadata).filter(key => 
      key.includes('rms') || key.includes('RMS')
    );
    
    console.log(`[RMS Write API] Successfully wrote ${writtenFields.length} RMS fields`);
    
    // Return the modified PDF as a response
    return new NextResponse(modifiedPdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume_with_rms.pdf"`,
        'X-RMS-Fields-Written': String(writtenFields.length),
      },
    });
    
  } catch (error: any) {
    console.error('[RMS Write API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to write RMS metadata',
      },
      { status: 500 }
    );
  } finally {
    // Clean up temporary files
    if (tempInputPath) {
      try {
        await unlink(tempInputPath);
      } catch (err) {
        console.warn('[RMS Write API] Failed to delete input temp file:', err);
      }
    }
    if (tempOutputPath) {
      try {
        await unlink(tempOutputPath);
      } catch (err) {
        console.warn('[RMS Write API] Failed to delete output temp file:', err);
      }
    }
  }
}

// GET handler for testing ExifTool write capability
export async function GET(request: NextRequest) {
  try {
    // Test if we can write metadata
    const testArgs = ['-ver'];
    const { stdout } = await execFileAsync(EXIFTOOL_PATH, testArgs, {
      timeout: 5000,
      windowsHide: true,
    });
    
    return NextResponse.json({
      success: true,
      available: true,
      version: stdout.trim(),
      path: EXIFTOOL_PATH,
      configPath: EXIFTOOL_CONFIG_PATH,
      capabilities: ['read', 'write'],
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      available: false,
      error: 'ExifTool not available for writing',
    });
  }
}