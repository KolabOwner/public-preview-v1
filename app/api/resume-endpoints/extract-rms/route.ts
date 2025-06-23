// app/api/resume/extract-rms/route.ts
// API route for extracting RMS metadata from PDFs using ExifTool

import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';
import {
  detectRMSCompliance,
  generateValidationReport,
  validateRMSMetadata
} from "@/lib/features/pdf/pdf-rms-validator";


const execFileAsync = promisify(execFile);

// ExifTool configuration
const EXIFTOOL_PATH = 'C:\\Users\\ashto\\OneDrive\\ExifTool\\exiftool.exe';
const EXIFTOOL_CONFIG_PATH = './config/exiftool/rms-config.pl';

export const maxDuration = 30; // 30 seconds timeout
export const dynamic = 'force-dynamic';

interface RMSMetadata {
  producer?: string;
  rms_schema_detail?: string;
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
  rms_summary?: string;
  [key: string]: any; // For indexed fields
}

// GET handler for checking ExifTool availability
export async function GET(request: NextRequest) {
  try {
    // Check if ExifTool is available
    const { stdout } = await execFileAsync(EXIFTOOL_PATH, ['-ver'], {
      timeout: 5000,
      windowsHide: true,
    });
    
    const version = stdout.trim();
    
    return NextResponse.json({
      success: true,
      available: true,
      version,
      path: EXIFTOOL_PATH,
      configPath: EXIFTOOL_CONFIG_PATH,
    });
  } catch (error) {
    console.error('[ExifTool] Not available:', error);
    return NextResponse.json({
      success: false,
      available: false,
      error: 'ExifTool not found or not accessible',
      path: EXIFTOOL_PATH,
    });
  }
}

// POST handler for extracting RMS metadata
export async function POST(request: NextRequest) {
  let tempFilePath: string | undefined;
  
  try {
    // Get the PDF data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
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
    
    console.log(`[ExifTool API] Processing PDF: ${file.name} (${file.size} bytes)`);
    
    // Create temporary file
    const tempFileName = `rms_extract_${randomBytes(16).toString('hex')}.pdf`;
    tempFilePath = join(tmpdir(), tempFileName);
    
    // Convert File to Buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempFilePath, buffer);
    
    console.log(`[ExifTool API] Saved to temporary file: ${tempFileName}`);
    
    // Execute ExifTool with RMS config
    const { stdout, stderr } = await execFileAsync(
      EXIFTOOL_PATH,
      [
        '-config', EXIFTOOL_CONFIG_PATH,
        '-j', // JSON output
        '-XMP-rms:all', // Extract all RMS metadata
        '-PDF:Producer', // Also get PDF producer info
        '-PDF:Creator',
        '-b', // Binary output for large fields
        tempFilePath
      ],
      {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 30000, // 30 second timeout
        windowsHide: true, // Hide console window on Windows
      }
    );
    
    if (stderr) {
      console.warn('[ExifTool API] Warnings:', stderr);
    }
    
    // Parse JSON output
    const metadataArray = JSON.parse(stdout);
    const metadata = metadataArray[0] || {};
    
    // Transform ExifTool output to RMS format
    const rmsData: RMSMetadata = {};
    
    // Map ExifTool field names to our schema
    Object.keys(metadata).forEach(key => {
      // Handle different possible formats from ExifTool (case-insensitive RMS detection)
      const keyLower = key.toLowerCase();
      if (key.startsWith('RMS') || key.startsWith('Rms_') || key.includes('XMP-rms') || key.startsWith('rms_')) {
        let fieldName = key;
        
        // If it comes as "XMP-rms:rms_contact_fullName" or similar
        if (key.includes('XMP-rms:')) {
          fieldName = key.replace('XMP-rms:', '');
        }
        
        // Normalize the field name but preserve the original capitalization pattern
        // ExifTool returns "Rms_field_name" format, we'll keep it as-is
        rmsData[fieldName] = metadata[key];
      } else if (key === 'Producer' || key === 'Creator') {
        rmsData[key.toLowerCase()] = metadata[key];
      }
    });
    
    // Parse numeric count fields (handle both cases)
    const countFields = [
      'rms_experience_count', 'Rms_experience_count',
      'rms_education_count', 'Rms_education_count', 
      'rms_skill_count', 'Rms_skill_count',
      'rms_project_count', 'Rms_project_count',
      'rms_involvement_count', 'Rms_involvement_count',
      'rms_certification_count', 'Rms_certification_count',
    ];
    
    countFields.forEach(field => {
      if (rmsData[field]) {
        rmsData[field] = parseInt(String(rmsData[field]), 10);
      }
    });
    
    console.log(`[ExifTool API] Successfully extracted RMS metadata with ${Object.keys(rmsData).length} fields`);
    
    // Detect RMS compliance and validate
    const hasRMSData = detectRMSCompliance(rmsData);
    const validation = hasRMSData ? validateRMSMetadata(rmsData) : null;
    
    if (validation) {
      console.log(`[ExifTool API] RMS Validation: ${validation.isRMSCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}, Version: ${validation.version || 'Unknown'}`);
    }
    
    return NextResponse.json({
      success: true,
      hasRMSData,
      metadata: hasRMSData ? rmsData : null,
      fieldCount: Object.keys(rmsData).length,
      extractedFields: Object.keys(rmsData),
      validation: validation,
      validationReport: validation ? generateValidationReport(validation) : null,
    });
    
  } catch (error: any) {
    console.error('[ExifTool API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to extract RMS metadata',
      },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log('[ExifTool API] Cleaned up temporary file');
      } catch (err) {
        console.warn('[ExifTool API] Failed to delete temporary file:', err);
      }
    }
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}