// app/api/resume/rms/route.ts
// Unified API route for RMS metadata operations using ExifTool

import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
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
const EXIFTOOL_PATH = process.env.EXIFTOOL_PATH || 'C:\\Users\\ashto\\OneDrive\\ExifTool\\exiftool.exe';
const EXIFTOOL_CONFIG_PATH = './config/exiftool/rms-config.pl';
const NUMERIC_COUNT_FIELDS = new Set([
  'rms_experience_count',
  'rms_education_count',
  'rms_skill_count',
  'rms_project_count',
  'rms_involvement_count',
  'rms_certification_count'
]);

// API configuration
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// Types
enum RMSAction {
  EXTRACT = 'extract',
  WRITE = 'write',
  VALIDATE = 'validate'
}

interface RMSMetadata {
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

  // Indexed fields
  [key: string]: any;
}

interface ExifToolResult {
  stdout: string;
  stderr: string;
}

// Utility functions
function parseJSON<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

async function createTempFile(prefix: string, extension = 'pdf'): Promise<string> {
  const tempFileName = `${prefix}_${randomBytes(16).toString('hex')}.${extension}`;
  return join(tmpdir(), tempFileName);
}

async function executeExifTool(args: string[], options: any = {}): Promise<ExifToolResult> {
  const defaultOptions = {
    maxBuffer: 10 * 1024 * 1024,
    timeout: 30000,
    windowsHide: true,
    encoding: 'utf8' as BufferEncoding,
  };

  const result = await execFileAsync(EXIFTOOL_PATH, args, { ...defaultOptions, ...options });

  return {
    stdout: result.stdout.toString('utf8'),
    stderr: result.stderr.toString('utf8'),
  };
}

async function cleanupTempFile(filePath: string | undefined): Promise<void> {
  if (filePath) {
    try {
      await unlink(filePath);
    } catch (err) {
      console.warn('[RMS Cleanup] Failed to delete temp file:', err);
    }
  }
}

// Response helpers
function createResponse<T>(data: T | null, success = true, error?: string, statusCode = 200): NextResponse {
  return NextResponse.json({
    success,
    ...(success ? { data } : { error: error || 'An error occurred' }),
    timestamp: new Date().toISOString()
  }, {
    status: success ? statusCode : (statusCode >= 400 ? statusCode : 400)
  });
}

// GET - Check ExifTool availability and API status
export async function GET(request: NextRequest) {
  const logPrefix = '[RMS API]';

  try {
    const { stdout } = await executeExifTool(['-ver'], { timeout: 5000 });
    const version = stdout.trim();

    return createResponse({
      available: true,
      version,
      path: EXIFTOOL_PATH,
      configPath: EXIFTOOL_CONFIG_PATH,
      capabilities: ['extract', 'write', 'validate']
    });
  } catch (error) {
    console.error(`${logPrefix} ExifTool not available:`, error);
    return createResponse(null, false, 'ExifTool not found or not accessible');
  }
}

// POST - Main RMS operations endpoint
export async function POST(request: NextRequest) {
  const logPrefix = '[RMS API]';

  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    const file = formData.get('file') as File;

    if (!action) {
      return createResponse(null, false, 'Missing action parameter');
    }

    if (!file) {
      return createResponse(null, false, 'No file provided');
    }

    if (!file.type.includes('pdf')) {
      return createResponse(null, false, 'File must be a PDF');
    }

    // Route to appropriate handler
    switch (action) {
      case RMSAction.EXTRACT:
        return await handleExtract(file);

      case RMSAction.WRITE:
        const metadataJson = formData.get('metadata') as string;
        if (!metadataJson) {
          return createResponse(null, false, 'No metadata provided for write action');
        }
        return await handleWrite(file, metadataJson);

      case RMSAction.VALIDATE:
        return await handleValidate(file);

      default:
        return createResponse(null, false, `Invalid action: ${action}. Valid actions: ${Object.values(RMSAction).join(', ')}`);
    }
  } catch (error: any) {
    console.error(`${logPrefix} Error:`, error);
    return createResponse(null, false, error.message || 'Failed to process request');
  }
}

// Extract RMS metadata from PDF
async function handleExtract(file: File): Promise<NextResponse> {
  let tempFilePath: string | undefined;
  const logPrefix = '[RMS Extract]';

  try {
    console.log(`${logPrefix} Processing: ${file.name} (${file.size} bytes)`);

    // Create temporary file
    tempFilePath = await createTempFile('rms_extract');
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(tempFilePath, Buffer.from(arrayBuffer));

    // Execute ExifTool to extract metadata
    const { stdout, stderr } = await executeExifTool([
      '-config', EXIFTOOL_CONFIG_PATH,
      '-j',
      '-XMP-rms:all',
      '-PDF:Producer',
      '-PDF:Creator',
      '-b',
      tempFilePath
    ]);

    if (stderr) {
      console.warn(`${logPrefix} Warnings:`, stderr);
    }

    // Parse and transform metadata
    const metadataArray = parseJSON<any[]>(stdout, []);
    const rawMetadata = metadataArray[0] || {};
    const rmsData = transformExtractedMetadata(rawMetadata);

    // Validate and generate report
    const hasRMSData = detectRMSCompliance(rmsData);
    const validation = hasRMSData ? validateRMSMetadata(rmsData) : null;
    const validationReport = validation ? generateValidationReport(validation) : null;

    console.log(`${logPrefix} Found ${Object.keys(rmsData).length} fields, RMS Compliant: ${validation?.isRMSCompliant || false}`);

    return createResponse({
      hasRMSData,
      metadata: hasRMSData ? rmsData : null,
      fieldCount: Object.keys(rmsData).length,
      extractedFields: Object.keys(rmsData),
      validation,
      validationReport
    });

  } finally {
    await cleanupTempFile(tempFilePath);
  }
}

// Write RMS metadata to PDF
async function handleWrite(file: File, metadataJson: string): Promise<NextResponse> {
  let tempFilePath: string | undefined;
  const logPrefix = '[RMS Write]';

  try {
    // Parse metadata
    const metadata = parseJSON<RMSMetadata>(metadataJson, {});
    if (Object.keys(metadata).length === 0) {
      return createResponse(null, false, 'Invalid or empty metadata JSON');
    }

    console.log(`${logPrefix} Processing: ${file.name}, writing ${Object.keys(metadata).length} fields`);

    // Create temporary file
    tempFilePath = await createTempFile('rms_write');
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(tempFilePath, Buffer.from(arrayBuffer));

    // Build ExifTool arguments efficiently
    const args = [
      '-config', EXIFTOOL_CONFIG_PATH,
      '-overwrite_original',
      // Add all metadata fields in one pass
      ...Object.entries(metadata)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) =>
          key === 'producer'
            ? `-PDF:Producer=${String(value)}`
            : `-XMP-rms:${key}=${String(value)}`
        ),
      tempFilePath
    ];

    // Execute ExifTool to write metadata
    const { stdout, stderr } = await executeExifTool(args);

    if (stderr && !stderr.includes('Warning')) {
      console.error(`${logPrefix} Error:`, stderr);
      throw new Error('Failed to write metadata');
    }

    console.log(`${logPrefix} Success:`, stdout.trim());

    // Verify metadata was written
    const verification = await verifyWrittenMetadata(tempFilePath);

    // Read modified PDF
    const modifiedPdfBuffer = await readFile(tempFilePath);

    console.log(`${logPrefix} Successfully wrote ${verification.writtenFieldCount} fields`);

    // Return PDF with metadata
    return new NextResponse(modifiedPdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume_with_rms.pdf"`,
        'X-RMS-Fields-Written': String(verification.writtenFieldCount),
        'X-RMS-Validation': verification.isValid ? 'valid' : 'invalid'
      }
    });

  } finally {
    await cleanupTempFile(tempFilePath);
  }
}

// Validate RMS metadata without extraction
async function handleValidate(file: File): Promise<NextResponse> {
  // Extract metadata first
  const extractResult = await handleExtract(file);
  const extractData = await extractResult.json();

  if (!extractData.success || !extractData.data.hasRMSData) {
    return createResponse({
      isValid: false,
      hasRMSData: false,
      message: 'No RMS metadata found in PDF'
    });
  }

  return createResponse({
    isValid: extractData.data.validation?.isRMSCompliant || false,
    hasRMSData: true,
    validation: extractData.data.validation,
    validationReport: extractData.data.validationReport,
    fieldCount: extractData.data.fieldCount
  });
}

// Transform ExifTool output to normalized RMS format
function transformExtractedMetadata(raw: any): RMSMetadata {
  const rmsData: RMSMetadata = {};

  Object.entries(raw).forEach(([key, value]) => {
    // Handle RMS fields (any variation)
    if (/^(RMS|Rms_|rms_)/i.test(key) || key.includes('XMP-rms')) {
      // Normalize field name
      const fieldName = key.replace('XMP-rms:', '').toLowerCase();

      // Convert numeric count fields
      if (NUMERIC_COUNT_FIELDS.has(fieldName)) {
        rmsData[fieldName] = parseInt(String(value), 10) || 0;
      } else {
        rmsData[fieldName] = value;
      }
    }
    // Handle PDF metadata
    else if (key === 'Producer' || key === 'Creator') {
      rmsData[key.toLowerCase()] = value;
    }
  });

  return rmsData;
}

// Verify written metadata
async function verifyWrittenMetadata(filePath: string): Promise<{ writtenFieldCount: number; isValid: boolean }> {
  const logPrefix = '[RMS Verify]';

  try {
    const { stdout } = await executeExifTool([
      '-config', EXIFTOOL_CONFIG_PATH,
      '-j',
      '-XMP-rms:all',
      filePath
    ]);

    const verifiedMetadata = parseJSON<any>(stdout, [{}])[0] || {};
    const writtenFields = Object.keys(verifiedMetadata).filter(key =>
      key.toLowerCase().includes('rms') || key.includes('XMP-rms')
    );

    // Quick validation check
    const hasRequiredFields = writtenFields.some(field =>
      field.includes('contact') || field.includes('schema')
    );

    return {
      writtenFieldCount: writtenFields.length,
      isValid: hasRequiredFields
    };
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    return { writtenFieldCount: 0, isValid: false };
  }
}

// CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}