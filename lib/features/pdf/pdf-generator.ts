// lib/pdf-processor.ts

import { collection, doc, addDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import { db, storage } from "@/lib/features/auth/firebase-config";
import { extractResumeData } from '@/ai/flows/extract-resume-data';
import type { ExtractResumeDataOutput } from '@/ai/flows/extract-resume-data';

// Configure PDF.js worker
if (typeof window !== 'undefined' && 'pdfjsLib' in window) {
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(window as any).pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * Status of a file in the processing pipeline
 */
export enum FileStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  ERROR = 'error'
}

export interface ParseResultResponse {
  success: boolean;
  data?: Record<string, string | number | boolean>; // RMS format
  extractedData?: ExtractResumeDataOutput; // Raw extracted data
  parseTime?: number;
  model?: string;
  timestamp?: string;
  error?: string;
  sectionsFound?: string[]; // List of sections that were found
  totalFields?: number; // Total number of RMS fields generated
}

export interface ParseOptions {
  userId?: string;
  saveToFirebase?: boolean;
  useEnhancedFormatting?: boolean;
  includeRawData?: boolean;
  model?: 'gemini-1.5-flash' | 'gemini-1.5-pro';
}

/**
 * RMS Metadata Standard Schema using Zod
 */
const RMSContactSchema = z.object({
  rms_contact_fullName: z.string().optional(),
  rms_contact_firstName: z.string().optional(),
  rms_contact_lastName: z.string().optional(),
  rms_contact_middleName: z.string().optional(),
  rms_contact_email: z.string().optional(),
  rms_contact_phone: z.string().optional(),
  rms_contact_address: z.string().optional(),
  rms_contact_city: z.string().optional(),
  rms_contact_state: z.string().optional(),
  rms_contact_zip: z.string().optional(),
  rms_contact_country: z.string().optional(),
  rms_contact_linkedin: z.string().optional(),
  rms_contact_website: z.string().optional(),
  rms_contact_github: z.string().optional(),
  rms_contact_twitter: z.string().optional(),
  rms_contact_portfolio: z.string().optional()
});

const RMSMetadataSchema = z.object({
  // Contact Information
  ...RMSContactSchema.shape,

  // Summary
  rms_summary: z.string().optional(),
  rms_objective: z.string().optional(),

  // Experience
  rms_experience_count: z.union([z.string(), z.number()]).optional(),

  // Education
  rms_education_count: z.union([z.string(), z.number()]).optional(),

  // Skills
  rms_skill_count: z.union([z.string(), z.number()]).optional(),

  // Projects
  rms_project_count: z.union([z.string(), z.number()]).optional(),

  // Certifications
  rms_certification_count: z.union([z.string(), z.number()]).optional(),

  // Involvements
  rms_involvement_count: z.union([z.string(), z.number()]).optional(),

  // Coursework
  rms_coursework_count: z.union([z.string(), z.number()]).optional(),

  // Publications
  rms_publication_count: z.union([z.string(), z.number()]).optional(),

  // Awards
  rms_award_count: z.union([z.string(), z.number()]).optional(),

  // Languages
  rms_language_count: z.union([z.string(), z.number()]).optional()
}).catchall(z.any());

export type RMSMetadata = z.infer<typeof RMSMetadataSchema>;

/**
 * Interface for processing options
 */
export interface ProcessingOptions {
  saveToFirebase?: boolean;
  generatePdf?: boolean;
  userId: string;
  title?: string;
  validateRMS?: boolean;
}

/**
 * Interface for processing results
 */
export interface ProcessingResult {
  success: boolean;
  resumeId: string;
  fileUrl?: string;
  rmsData?: any;
  error?: string;
  status: FileStatus;
  validationErrors?: z.ZodError;
}

/**
 * Interface for batch processing
 */
export interface BatchProcessingOptions {
  files: File[];
  userId: string;
  onProgress?: (current: number, total: number, fileName: string) => void;
  continueOnError?: boolean;
  validateRMS?: boolean;
}

/**
 * Parsed resume data structure
 */
interface ParsedData {
  contactInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
  };
  summary?: string;
  experiences?: Array<{
    company?: string;
    title?: string;
    role?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    location?: string;
  }>;
  education?: Array<{
    school?: string;
    institution?: string;
    degree?: string;
    qualification?: string;
    fieldOfStudy?: string;
    description?: string;
    formattedDate?: string;
    startDate?: string;
    endDate?: string;
    graduationDate?: string;
    current?: boolean;
    gpa?: string;
    score?: string;
    location?: string;
  }>;
  skillCategories?: Array<{
    name?: string;
    skills?: Array<{ name: string } | string>;
  }>;
  projects?: Array<{
    title?: string;
    description?: string;
    organization?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    technologies?: string[] | string;
  }>;
  involvements?: Array<{
    role?: string;
    organization?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    location?: string;
  }>;
  certifications?: Array<{
    name?: string;
    title?: string;
    issuer?: string;
    organization?: string;
    date?: string;
    issueDate?: string;
    credentialId?: string;
    url?: string;
  }>;
  awards?: Array<{
    title?: string;
    name?: string;
    issuer?: string;
    organization?: string;
    date?: string;
    description?: string;
  }>;
  coursework?: Array<{
    name?: string;
    department?: string;
  }>;
  publications?: Array<{
    title?: string;
    authors?: string;
    journal?: string;
    date?: string;
    description?: string;
    url?: string;
  }>;
  references?: Array<{
    name?: string;
    title?: string;
    company?: string;
    email?: string;
    phone?: string;
  }>;
  languages?: Array<{
    name?: string;
    proficiency?: string;
  }>;
  volunteer?: Array<{
    role?: string;
    title?: string;
    organization?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
}

/**
 * Resume data interface for PDF generation
 */
export interface ResumeData {
  title: string;
  template?: string;
  fontSize?: 'small' | 'medium' | 'large';
  fontStyle?: 'elegant' | 'modern' | 'classic' | 'professional';
  parsedData: any;
  rmsRawData?: any;
  documentSettings?: {
    fontFamily?: string;
    fontSize?: number;
    paperSize?: 'Letter' | 'A4';
    margins?: { top: number; right: number; bottom: number; left: number };
  };
}

interface FontDefinition {
  family: string;
  size: number;
  weight: number;
  style?: 'normal' | 'bold' | 'italic';
}

interface PDFColors {
  text: { r: number; g: number; b: number };
  black: { r: number; g: number; b: number };
  gray: { r: number; g: number; b: number };
  accent: { r: number; g: number; b: number };
}

interface PDFConfiguration {
  colors: PDFColors;
  margins: { top: number; right: number; bottom: number; left: number };
  fonts: {
    name: FontDefinition;
    heading: FontDefinition;
    subheading: FontDefinition;
    body: FontDefinition;
    accent: FontDefinition;
    small: FontDefinition;
  };
  spacing: {
    sectionGap: number;
    itemGap: number;
    lineHeight: number;
  };
}

// Font configurations for different styles
const FONT_CONFIGURATIONS: Record<string, Partial<PDFConfiguration>> = {
  professional: {
    fonts: {
      name: { family: 'helvetica', size: 18, weight: 700 },
      heading: { family: 'helvetica', size: 12, weight: 700 },
      subheading: { family: 'helvetica', size: 11, weight: 700 },
      body: { family: 'helvetica', size: 10, weight: 400 },
      accent: { family: 'helvetica', size: 9, weight: 400 },
      small: { family: 'helvetica', size: 8, weight: 400 }
    }
  },
  elegant: {
    fonts: {
      name: { family: 'merriweather', size: 20, weight: 700 },
      heading: { family: 'merriweather', size: 13, weight: 600 },
      subheading: { family: 'merriweather', size: 12, weight: 600 },
      body: { family: 'merriweather', size: 10, weight: 400 },
      accent: { family: 'merriweather', size: 9, weight: 300 },
      small: { family: 'merriweather', size: 8, weight: 300 }
    }
  },
  modern: {
    fonts: {
      name: { family: 'merriweatherSans', size: 19, weight: 700 },
      heading: { family: 'merriweatherSans', size: 12, weight: 600 },
      subheading: { family: 'merriweatherSans', size: 11, weight: 600 },
      body: { family: 'merriweatherSans', size: 10, weight: 400 },
      accent: { family: 'merriweatherSans', size: 9, weight: 300 },
      small: { family: 'merriweatherSans', size: 8, weight: 300 }
    }
  },
  classic: {
    fonts: {
      name: { family: 'times', size: 18, weight: 700 },
      heading: { family: 'times', size: 12, weight: 700 },
      subheading: { family: 'times', size: 11, weight: 700 },
      body: { family: 'times', size: 10, weight: 400 },
      accent: { family: 'times', size: 9, weight: 400 },
      small: { family: 'times', size: 8, weight: 400 }
    }
  }
};

// Default configuration
const DEFAULT_CONFIG: PDFConfiguration = {
  colors: {
    text: { r: 51, g: 51, b: 51 },
    black: { r: 0, g: 0, b: 0 },
    gray: { r: 102, g: 102, b: 102 },
    accent: { r: 0, g: 0, b: 0 }
  },
  margins: { top: 36, right: 36, bottom: 36, left: 36 },
  fonts: FONT_CONFIGURATIONS.professional.fonts!,
  spacing: {
    sectionGap: 12,
    itemGap: 8,
    lineHeight: 1.2
  }
};

// Font URLs from Google Fonts CDN
export const FONT_URLS = {
  merriweather: {
    light: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZWMf6.ttf',
    lightItalic: 'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7lXcf_hP3a.ttf',
    regular: 'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l52xwNZWMf6.ttf',
    italic: 'https://fonts.gstatic.com/s/merriweather/v30/u-4m0qyriQwlOrhSvowK_l5-eSZJdeP3.ttf',
    bold: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52_wFZWMf6.ttf',
    boldItalic: 'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR71Wsf_hP3a.ttf',
    black: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNZXMf6.ttf',
    blackItalic: 'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7NWMf_hP3a.ttf'
  },
  merriweatherSans: {
    light: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-cO9IRs1JiJN1FRAMjTN5zd9vgsFF_5asQTb6hZ2JKZ.ttf',
    regular: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX1QjU.ttf',
    bold: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-cO9IRs1JiJN1FRAMjTN5zd9vgsFF_NbMQTb6hZ2JKZ.ttf',
    extrabold: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-cO9IRs1JiJN1FRAMjTN5zd9vgsFF-RaMQTb6hZ2JKZ.ttf'
  },
  // Fallback fonts
  openSans: {
    regular: 'https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0C4n.ttf',
    bold: 'https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1y4n.ttf'
  }
};

// Font family definitions
export const FONT_FAMILIES = {
  merriweather: {
    name: 'Merriweather',
    weights: {
      300: { normal: 'merriweather-light', italic: 'merriweather-lightitalic' },
      400: { normal: 'merriweather-regular', italic: 'merriweather-italic' },
      700: { normal: 'merriweather-bold', italic: 'merriweather-bolditalic' },
      900: { normal: 'merriweather-black', italic: 'merriweather-blackitalic' }
    }
  },
  merriweatherSans: {
    name: 'Merriweather Sans',
    weights: {
      300: { normal: 'merriweathersans-light' },
      400: { normal: 'merriweathersans-regular' },
      700: { normal: 'merriweathersans-bold' },
      800: { normal: 'merriweathersans-extrabold' }
    }
  },
  helvetica: {
    name: 'Helvetica',
    weights: {
      400: { normal: 'helvetica', italic: 'helvetica-oblique' },
      700: { normal: 'helvetica-bold', italic: 'helvetica-boldoblique' }
    }
  },
  times: {
    name: 'Times',
    weights: {
      400: { normal: 'times', italic: 'times-italic' },
      700: { normal: 'times-bold', italic: 'times-bolditalic' }
    }
  }
};

// Font loading cache
const fontCache = new Map<string, ArrayBuffer>();

/**
 * Load font from URL and cache it
 */
async function loadFontFromUrl(url: string): Promise<ArrayBuffer> {
  if (fontCache.has(url)) {
    return fontCache.get(url)!;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load font from ${url}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    fontCache.set(url, arrayBuffer);
    return arrayBuffer;
  } catch (error) {
    console.error(`Error loading font from ${url}:`, error);
    throw error;
  }
}

/**
 * Convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

/**
 * Add custom fonts to jsPDF instance
 */
export async function addCustomFonts(doc: jsPDF, fontFamily: 'merriweather' | 'merriweatherSans' | 'openSans' = 'merriweather') {
  try {
    if (fontFamily === 'merriweather') {
      // Load Merriweather Light
      const lightFont = await loadFontFromUrl(FONT_URLS.merriweather.light);
      doc.addFileToVFS('Merriweather-Light.ttf', arrayBufferToBase64(lightFont));
      doc.addFont('Merriweather-Light.ttf', 'merriweather-light', 'normal', 300);

      // Load Merriweather Light Italic
      const lightItalicFont = await loadFontFromUrl(FONT_URLS.merriweather.lightItalic);
      doc.addFileToVFS('Merriweather-LightItalic.ttf', arrayBufferToBase64(lightItalicFont));
      doc.addFont('Merriweather-LightItalic.ttf', 'merriweather-lightitalic', 'italic', 300);

      // Load Merriweather Regular
      const regularFont = await loadFontFromUrl(FONT_URLS.merriweather.regular);
      doc.addFileToVFS('Merriweather-Regular.ttf', arrayBufferToBase64(regularFont));
      doc.addFont('Merriweather-Regular.ttf', 'merriweather-regular', 'normal', 400);

      // Load Merriweather Italic
      const italicFont = await loadFontFromUrl(FONT_URLS.merriweather.italic);
      doc.addFileToVFS('Merriweather-Italic.ttf', arrayBufferToBase64(italicFont));
      doc.addFont('Merriweather-Italic.ttf', 'merriweather-italic', 'italic', 400);

      // Load Merriweather Bold
      const boldFont = await loadFontFromUrl(FONT_URLS.merriweather.bold);
      doc.addFileToVFS('Merriweather-Bold.ttf', arrayBufferToBase64(boldFont));
      doc.addFont('Merriweather-Bold.ttf', 'merriweather-bold', 'normal', 700);

      // Load Merriweather Bold Italic
      const boldItalicFont = await loadFontFromUrl(FONT_URLS.merriweather.boldItalic);
      doc.addFileToVFS('Merriweather-BoldItalic.ttf', arrayBufferToBase64(boldItalicFont));
      doc.addFont('Merriweather-BoldItalic.ttf', 'merriweather-bolditalic', 'italic', 700);

      console.log('Merriweather fonts loaded successfully');
      return true;
    } else if (fontFamily === 'merriweatherSans') {
      // Load Merriweather Sans variants
      const lightFont = await loadFontFromUrl(FONT_URLS.merriweatherSans.light);
      doc.addFileToVFS('MerriweatherSans-Light.ttf', arrayBufferToBase64(lightFont));
      doc.addFont('MerriweatherSans-Light.ttf', 'merriweathersans-light', 'normal', 300);

      const regularFont = await loadFontFromUrl(FONT_URLS.merriweatherSans.regular);
      doc.addFileToVFS('MerriweatherSans-Regular.ttf', arrayBufferToBase64(regularFont));
      doc.addFont('MerriweatherSans-Regular.ttf', 'merriweathersans-regular', 'normal', 400);

      const boldFont = await loadFontFromUrl(FONT_URLS.merriweatherSans.bold);
      doc.addFileToVFS('MerriweatherSans-Bold.ttf', arrayBufferToBase64(boldFont));
      doc.addFont('MerriweatherSans-Bold.ttf', 'merriweathersans-bold', 'normal', 700);

      console.log('Merriweather Sans fonts loaded successfully');
      return true;
    }
  } catch (error) {
    console.error('Error loading custom fonts:', error);
    return false;
  }
}

/**
 * Get font name for jsPDF based on family, weight and style
 */
export function getFontName(family: string, weight = 400, style: 'normal' | 'italic' = 'normal'): string {
  const fontFamily = FONT_FAMILIES[family as keyof typeof FONT_FAMILIES];

  if (!fontFamily) {
    return 'helvetica'; // Fallback
  }

  const weightDef = fontFamily.weights[weight as keyof typeof fontFamily.weights];
  if (!weightDef) {
    // Find closest weight
    const weights = Object.keys(fontFamily.weights).map(Number).sort((a, b) => a - b);
    const closest = weights.reduce((prev, curr) =>
      Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev
    );
    const closestWeightDef = fontFamily.weights[closest as keyof typeof fontFamily.weights];
    if (!closestWeightDef) return 'helvetica';
    
    if (typeof closestWeightDef === 'object' && style in closestWeightDef) {
      return closestWeightDef[style as keyof typeof closestWeightDef] || 'helvetica';
    }
    return (typeof closestWeightDef === 'object' && 'normal' in closestWeightDef) ? closestWeightDef.normal : 'helvetica';
  }

  if (typeof weightDef === 'object' && style in weightDef) {
    return weightDef[style as keyof typeof weightDef] || 'helvetica';
  }
  return (typeof weightDef === 'object' && 'normal' in weightDef) ? weightDef.normal : 'helvetica';
}

/**
 * Main class for processing PDF resumes with RMS compliance
 */
export class PDFProcessor {
  private static pdfJsLoaded = false;
  private static RMS_VERSION = '2.0';

  /**
   * Initialize PDF.js library
   */
  private static async initializePdfJs(): Promise<void> {
    if (this.pdfJsLoaded) return;

    try {
      // Dynamically import PDF.js if not already loaded
      if (typeof window !== 'undefined' && !('pdfjsLib' in window)) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load PDF.js'));
          document.head.appendChild(script);
        });

        // Load worker
        const workerScript = document.createElement('script');
        workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        await new Promise<void>((resolve, reject) => {
          workerScript.onload = () => resolve();
          workerScript.onerror = () => reject(new Error('Failed to load PDF.js worker'));
          document.head.appendChild(workerScript);
        });
      }

      // Configure worker
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      this.pdfJsLoaded = true;
      console.log('PDF.js initialized successfully');
    } catch (error) {
      console.error('Error initializing PDF.js:', error);
      throw error;
    }
  }

  /**
   * Validate RMS data against schema
   */
  public static validateRMSData(data: any): {
    success: boolean;
    data?: RMSMetadata;
    error?: z.ZodError
  } {
    try {
      const validated = RMSMetadataSchema.parse(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error };
      }
      throw error;
    }
  }

  /**
   * Create a new resume record in Firestore
   */
  public static async createResume(options: {
    userId: string;
    title: string;
    initialStatus?: FileStatus;
  }): Promise<string> {
    try {
      const resumeData = {
        userId: options.userId,
        title: options.title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: options.initialStatus || FileStatus.UPLOADED,
        parsedData: null,
        fileUrl: null,
        rmsVersion: this.RMS_VERSION
      };

      const docRef = await addDoc(collection(db, 'resumes'), resumeData);
      console.log(`Created new resume document with ID: ${docRef.id}`);

      return docRef.id;
    } catch (error) {
      console.error('Error creating resume document:', error);
      throw error;
    }
  }

  /**
   * Process a PDF file by uploading it, extracting text, and parsing it
   */
  public static async processPDF(
    file: File,
    resumeId: string,
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      console.log(`Processing PDF for resume: ${resumeId}`);

      // Validate file
      this.validatePDFFile(file);

      // First, update the resume status to processing
      await this.updateResumeStatus(resumeId, FileStatus.PROCESSING);

      // Upload the PDF to Firebase Storage
      const fileUrl = await this.uploadPDFToStorage(file, options.userId, resumeId);
      console.log(`Uploaded PDF to: ${fileUrl}`);

      // Try to extract RMS metadata using ExifTool API first
      let exifRMSMetadata = null;
      try {
        console.log('Calling ExifTool API to extract RMS metadata...');

        // Create FormData with the PDF file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('action', 'extract');

        const response = await fetch('/api/resume-endpoints/rms', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.hasRMSData && result.data.metadata) {
            exifRMSMetadata = result.data.metadata;
            console.log(`Successfully extracted RMS metadata with ${result.data.fieldCount} fields via API`);
          } else {
            console.log('No RMS metadata found in PDF');
          }
        } else {
          const error = await response.json();
          console.warn('ExifTool API error:', error.error);
        }
      } catch (error) {
        console.warn('Failed to extract RMS metadata via API:', error);
      }

      let rmsData: any;
      let validationErrors: any;

      // Debug RMS metadata before completeness check
      console.log('RMS metadata check:', {
        hasExifRMSMetadata: !!exifRMSMetadata,
        fieldCount: exifRMSMetadata ? Object.keys(exifRMSMetadata).length : 0,
        sampleFields: exifRMSMetadata ? Object.keys(exifRMSMetadata).slice(0, 5) : []
      });

      // Check if we have complete RMS metadata - if so, skip expensive AI parsing
      if (exifRMSMetadata && this.isCompleteRMSData(exifRMSMetadata)) {
        const fastPathStartTime = Date.now();
        console.log('🚀 Complete RMS metadata detected - using FAST PATH (skipping AI parsing)');

        // Use the existing RMS metadata directly
        rmsData = exifRMSMetadata;
        validationErrors = null;

        console.log('Fast Path - RMS Data contains:', {
          hasContactInfo: !!(rmsData.rms_contact_email || rmsData.Rms_contact_email),
          fullName: rmsData.rms_contact_fullName || rmsData.Rms_contact_fullName || 
                    rmsData.rms_contact_fullname || rmsData.Rms_contact_fullname,
          email: rmsData.rms_contact_email || rmsData.Rms_contact_email,
          experienceCount: rmsData.rms_experience_count || rmsData.Rms_experience_count || 0
        });

        const fastPathTime = Date.now() - fastPathStartTime;
        console.log(`✅ RMS Fast Path completed in ${fastPathTime}ms (typical AI parsing: 10,000-60,000ms)`);
        console.log(`💰 Performance gain: ~${Math.round(30000/fastPathTime)}x faster processing`);
      } else {
        console.log('Incomplete or no RMS metadata - proceeding with Gemini multimodal PDF parsing');

        // Extract text from the PDF for AI parsing
        const pdfText = await this.extractTextFromPDF(file);
        console.log(`Extracted ${pdfText.length} characters of text`);

        if (!pdfText || pdfText.length < 100) {
          throw new Error('PDF text extraction failed or resulted in too little text');
        }

        // Use Gemini multimodal PDF parsing instead of text extraction + AI parsing
        try {
          const pdfBuffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
          const parseResult = await this.parseWithGeminiMultimodal(pdfBuffer, options.userId, options.validateRMS, true);
          rmsData = parseResult.rmsData;
          validationErrors = parseResult.validationErrors;

          console.log('Parsed resume data successfully using Gemini multimodal PDF capabilities');
        } catch (geminiError) {
          console.warn('Gemini multimodal parsing failed, falling back to text extraction + AI parsing:', geminiError);

          // Fallback to the old text-based approach
          const parseResult = await this.parseResumeText(
            pdfText,
            options.userId,
            options.validateRMS
          );
          rmsData = parseResult.rmsData;
          validationErrors = parseResult.validationErrors;

          console.log('Parsed resume data successfully using fallback AI text parsing');
        }

        // Merge ExifTool RMS metadata with AI-parsed data if available
        if (exifRMSMetadata && rmsData) {
          console.log('Merging ExifTool RMS metadata with AI-parsed data...');
          rmsData = this.mergeRMSMetadata(exifRMSMetadata, rmsData);
        }
      }

      // Extract title from RMS data if not provided
      const rmsFullName = rmsData.rms_contact_fullName || rmsData.Rms_contact_fullName || '';
      const title = options.title || rmsFullName || 'Untitled Resume';

      // Save the results to Firebase
      if (options.saveToFirebase !== false) {
        await this.saveResultsToFirebase(resumeId, {
          fileUrl,
          rmsData: rmsData,
          title,
          exifToolExtracted: !!exifRMSMetadata,
          usedRMSFastPath: exifRMSMetadata && this.isCompleteRMSData(exifRMSMetadata)
        });
        console.log('Saved results to Firebase');
      }

      // Update the resume status to processed
      await this.updateResumeStatus(resumeId, FileStatus.PROCESSED);

      const processingTime = Date.now() - startTime;
      console.log(`PDF processing completed in ${processingTime}ms`);

      return {
        success: true,
        resumeId,
        fileUrl,
        rmsData,
        status: FileStatus.PROCESSED,
        validationErrors
      };
    } catch (error: any) {
      console.error('Error processing PDF:', error);

      // Update status to error
      await this.updateResumeStatus(resumeId, FileStatus.ERROR, {
        error: error.message || 'Unknown error occurred',
        errorTime: new Date().toISOString()
      });

      return {
        success: false,
        resumeId,
        error: error.message || 'Unknown error occurred',
        status: FileStatus.ERROR
      };
    }
  }

  /**
   * Get a resume by ID
   */
  public static async getResume(resumeId: string): Promise<any | null> {
    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      const resumeSnap = await getDoc(resumeRef);

      if (!resumeSnap.exists()) {
        console.log(`Resume with ID ${resumeId} not found`);
        return null;
      }

      return {
        id: resumeSnap.id,
        ...resumeSnap.data()
      };
    } catch (error) {
      console.error('Error getting resume:', error);
      throw error;
    }
  }

  /**
   * Validate PDF file
   */
  private static validatePDFFile(file: File): void {
    // Check file type
    if (!file.type || !file.type.includes('pdf')) {
      throw new Error('File must be a PDF');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    // Check file name
    if (!file.name || file.name.length === 0) {
      throw new Error('File must have a valid name');
    }
  }

  /**
   * Upload a PDF file to Firebase Storage
   */
  private static async uploadPDFToStorage(
    file: File,
    userId: string,
    resumeId: string
  ): Promise<string> {
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9-_.]/g, '_');
    const filename = `${timestamp}-${safeFileName}`;
    const storagePath = `resumes/${userId}/${resumeId}/${filename}`;

    console.log(`Uploading file to storage path: ${storagePath}`);

    const storageRef = ref(storage, storagePath);

    try {
      // Set metadata for the file
      const metadata = {
        contentType: file.type,
        customMetadata: {
          userId,
          resumeId,
          originalName: file.name,
          uploadTime: new Date().toISOString(),
          rmsVersion: this.RMS_VERSION
        }
      };

      // Upload the file with metadata
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      console.log('Upload successful:', uploadResult);

      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error);
      throw new Error(`Failed to upload PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract text from a PDF file
   * Uses pdf.js or the PDF API endpoint
   */
  private static async extractTextFromPDF(file: File): Promise<string> {
    console.log('Extracting text from PDF');

    // First try the API endpoint
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Calling PDF extraction API...');
      const response = await fetch('/api/resume-endpoints/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (result.success && result.text) {
        console.log('Successfully extracted text via API');
        return result.text;
      }

      if (result.useClientSide) {
        console.log('API suggests using client-side extraction');
        return this.extractTextWithPdfJs(file);
      }

      throw new Error(result.error || 'Failed to extract text from PDF');
    } catch (error) {
      console.error('API extraction failed, falling back to client-side:', error);
      return this.extractTextWithPdfJs(file);
    }
  }

  /**
   * Extract text from a PDF file using PDF.js
   * This is a client-side extraction method
   */
  private static async extractTextWithPdfJs(file: File): Promise<string> {
    console.log('Using PDF.js for text extraction');

    try {
      // Initialize PDF.js if needed
      await this.initializePdfJs();

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Load the PDF document
      const pdfjsLib = (window as any).pdfjsLib;
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
      });

      const pdf = await loadingTask.promise;
      console.log(`PDF loaded with ${pdf.numPages} pages`);

      let fullText = '';

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Process text items
        const pageText = textContent.items
          .map((item: any) => {
            // Handle both regular text items and marked content
            if (item.str) {
              return item.str;
            }
            return '';
          })
          .join(' ');

        fullText += pageText + '\n\n';
      }

      // Clean up the text
      fullText = this.cleanExtractedText(fullText);

      console.log(`Successfully extracted ${fullText.length} characters from PDF`);
      return fullText;
    } catch (error) {
      console.error('PDF.js extraction error:', error);
      throw new Error(`Failed to extract text with PDF.js: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clean extracted text from PDF
   */
  private static cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page numbers (common patterns)
      .replace(/^\d+\s*$/gm, '')
      // Remove common header/footer patterns
      .replace(/Page \d+ of \d+/gi, '')
      // Fix common OCR issues
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Remove non-printable characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      // Trim each line
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
  }

  /**
   * Parse resume using Gemini multimodal PDF capabilities
   */
  private static async parseWithGeminiMultimodal(
    pdfBuffer: Buffer,
    userId: string,
    validateRMS?: boolean,
    useEnhancedFormatting = true
  ): Promise<{
    rmsData: any;
    validationErrors?: z.ZodError;
  }> {
    try {
      console.log('🚀 Using Gemini multimodal PDF parsing capabilities');

      // Convert PDF buffer to data URI for Gemini
      const resumeDataUri = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

      // Use Gemini's multimodal PDF extraction
      const extractionResult = await extractResumeData({ resumeDataUri });

      if (!extractionResult || Object.keys(extractionResult).length === 0) {
        throw new Error('Failed to extract resume data using Gemini multimodal PDF parsing');
      }

      console.log('✅ Gemini multimodal extraction completed successfully');

      // Convert to RMS format using enhanced or basic method
      let rmsData: Record<string, string | number | boolean>;
      if (useEnhancedFormatting) {
        console.log('[PDF] Using enhanced RMS formatting');
        const parsedData = this.convertExtractToParsedData(extractionResult);
        rmsData = this.formatToRmsEnhanced(parsedData);
      } else {
        console.log('[PDF] Using basic RMS formatting');
        rmsData = this.formatToRms(extractionResult);
      }

      // Validate RMS data if requested
      let validationErrors: z.ZodError | undefined = undefined;
      if (validateRMS) {
        const validation = this.validateRMSData(rmsData);
        if (!validation.success) {
          validationErrors = validation.error;
          console.warn('RMS validation errors:', validationErrors?.errors);
        }
      }

      console.log('📊 Generated RMS data with fields:', Object.keys(rmsData).length);

      return { rmsData, validationErrors };
    } catch (error: any) {
      console.error('Gemini multimodal parsing error:', error);
      throw new Error(`Failed to parse resume with Gemini multimodal: ${error.message}`);
    }
  }

  /**
   * Enhanced resume text parser using Genkit AI with complete internal RMS support
   */
  public static async parseResumeTextWithGenkit(
    resumeText: string,
    options: ParseOptions = {}
  ): Promise<ParseResultResponse> {
    const {
      userId = 'anonymous',
      saveToFirebase = true,
      useEnhancedFormatting = true,
      includeRawData = false,
      model = 'gemini-1.5-flash'
    } = options;

    console.log(`[Genkit Parser] Parsing resume text using ${model} (${resumeText.length} chars)`);

    try {
      const startTime = Date.now();

      // Convert text to base64 data URI for Genkit
      const textAsBase64 = Buffer.from(resumeText).toString('base64');
      const resumeDataUri = `data:text/plain;base64,${textAsBase64}`;

      // Use Genkit's extractResumeData flow
      const extractionResult: ExtractResumeDataOutput = await extractResumeData({ resumeDataUri });

      if (!extractionResult || Object.keys(extractionResult).length === 0) {
        console.error('[Genkit Parser] Failed to extract resume data - empty result');
        return {
          success: false,
          error: 'Failed to extract resume data'
        };
      }

      // Analyze sections found
      const { sectionsFound, totalFields } = this.analyzeSections(extractionResult);

      // Choose formatting method
      let rmsData: Record<string, string | number | boolean>;

      if (useEnhancedFormatting) {
        console.log('[Genkit Parser] Using enhanced RMS formatting');
        const parsedData = this.convertExtractToParsedData(extractionResult);
        rmsData = this.formatToRmsEnhanced(parsedData);
      } else {
        console.log('[Genkit Parser] Using basic RMS formatting');
        rmsData = this.formatToRms(extractionResult);
      }

      const parseTime = Date.now() - startTime;
      console.log(`[Genkit Parser] Successfully parsed resume in ${parseTime}ms`);
      console.log(`[Genkit Parser] Sections found: ${sectionsFound.join(', ')}`);
      console.log(`[Genkit Parser] Generated ${Object.keys(rmsData).length} RMS fields`);

      const result: ParseResultResponse = {
        success: true,
        data: rmsData,
        parseTime,
        model,
        timestamp: new Date().toISOString(),
        sectionsFound,
        totalFields: Object.keys(rmsData).length
      };

      if (includeRawData) {
        result.extractedData = extractionResult;
      }

      return result;

    } catch (error) {
      console.error('[Genkit Parser] Error in parseResumeTextWithGenkit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error parsing resume'
      };
    }
  }

  /**
   * Enhanced PDF parser using Genkit AI with complete internal RMS support
   */
  public static async parsePDFWithGenkit(
    pdfFile: File | Buffer,
    options: ParseOptions = {}
  ): Promise<ParseResultResponse> {
    const {
      userId = 'anonymous',
      useEnhancedFormatting = true,
      includeRawData = false,
      model = 'gemini-1.5-flash'
    } = options;

    console.log(`[Genkit Parser] Parsing PDF resume using ${model}`);

    try {
      const startTime = Date.now();

      // Convert PDF to base64 data URI
      let buffer: Buffer;
      if (pdfFile instanceof File) {
        const arrayBuffer = await pdfFile.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        buffer = pdfFile;
      }

      const resumeDataUri = `data:application/pdf;base64,${buffer.toString('base64')}`;
      console.log(`[Genkit Parser] PDF converted to base64 (${buffer.length} bytes)`);

      // Use Genkit's extractResumeData flow which handles PDFs
      const extractionResult: ExtractResumeDataOutput = await extractResumeData({ resumeDataUri });

      if (!extractionResult || Object.keys(extractionResult).length === 0) {
        console.error('[Genkit Parser] Failed to extract resume data from PDF - empty result');
        return {
          success: false,
          error: 'Failed to extract resume data from PDF'
        };
      }

      // Analyze sections found
      const { sectionsFound, totalFields } = this.analyzeSections(extractionResult);

      // Choose formatting method
      let rmsData: Record<string, string | number | boolean>;

      if (useEnhancedFormatting) {
        console.log('[Genkit Parser] Using enhanced RMS formatting');
        const parsedData = this.convertExtractToParsedData(extractionResult);
        rmsData = this.formatToRmsEnhanced(parsedData);
      } else {
        console.log('[Genkit Parser] Using basic RMS formatting');
        rmsData = this.formatToRms(extractionResult);
      }

      const parseTime = Date.now() - startTime;
      console.log(`[Genkit Parser] Successfully parsed PDF resume in ${parseTime}ms`);
      console.log(`[Genkit Parser] Sections found: ${sectionsFound.join(', ')}`);
      console.log(`[Genkit Parser] Generated ${Object.keys(rmsData).length} RMS fields`);

      const result: ParseResultResponse = {
        success: true,
        data: rmsData,
        parseTime,
        model,
        timestamp: new Date().toISOString(),
        sectionsFound,
        totalFields: Object.keys(rmsData).length
      };

      if (includeRawData) {
        result.extractedData = extractionResult;
      }

      return result;

    } catch (error) {
      console.error('[Genkit Parser] Error in parsePDFWithGenkit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error parsing PDF'
      };
    }
  }

  /**
   * Utility function to validate RMS data structure
   */
  public static validateRMSStructure(rmsData: Record<string, string | number | boolean>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!rmsData.Producer) {
      errors.push('Missing Producer field');
    }

    if (!rmsData.Rms_contact_fullName || rmsData.Rms_contact_fullName === 'n/a') {
      warnings.push('No contact name found');
    }

    if (!rmsData.Rms_contact_email || rmsData.Rms_contact_email === 'n/a') {
      warnings.push('No contact email found');
    }

    // Check if we have any substantial content
    const experienceCount = Number(rmsData.Rms_experience_count) || 0;
    const educationCount = Number(rmsData.Rms_education_count) || 0;
    const skillCount = Number(rmsData.Rms_skill_count) || 0;

    if (experienceCount === 0 && educationCount === 0 && skillCount === 0) {
      warnings.push('Resume appears to have minimal content');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Utility function to convert basic RMS data to enhanced format
   * Useful for upgrading existing RMS data
   */
  public static upgradeRMSData(basicRmsData: Record<string, string | number | boolean>): Record<string, string | number | boolean> {
    // This would be used to convert basic RMS to enhanced RMS
    // For now, return as-is since we're generating enhanced directly
    return { ...basicRmsData };
  }

  /**
   * Parse resume text using the resume parsing API
   */
  private static async parseResumeText(
    resumeText: string,
    userId: string,
    validateRMS?: boolean
  ): Promise<{
    rmsData: any;
    validationErrors?: z.ZodError;
  }> {
    try {
      console.log('Calling resume parsing API...');

      const response = await fetch('/api/resume-endpoints/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          userId,
          saveToFirebase: false, // We'll handle this ourselves
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to parse resume');
      }

      console.log('Resume parsing completed successfully');

      // Validate RMS data if requested
      let validationErrors: z.ZodError | undefined = undefined;
      if (validateRMS) {
        const validation = this.validateRMSData(result.data);
        if (!validation.success) {
          validationErrors = validation.error;
          console.warn('RMS validation errors:', validationErrors?.errors);
        }
      }

      console.log('📊 Received RMS data with fields:', Object.keys(result.data).length);

      return { rmsData: result.data, validationErrors };
    } catch (error: any) {
      console.error('Resume parsing error:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  /**
   * Update the status of a resume in Firestore
   */
  private static async updateResumeStatus(
    resumeId: string,
    status: FileStatus,
    additionalData: Record<string, any> = {}
  ): Promise<void> {
    try {
      console.log(`Updating resume ${resumeId} status to ${status}`);

      const resumeRef = doc(db, 'resumes', resumeId);

      await updateDoc(resumeRef, {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      });

      console.log(`Status updated successfully`);
    } catch (error) {
      console.error('Error updating resume status:', error);
      // Don't throw here, as this shouldn't fail the whole process
    }
  }

  /**
   * Save processing results to Firebase
   */
  private static async saveResultsToFirebase(
    resumeId: string,
    data: {
      fileUrl: string;
      rmsData: any;
      title: string;
      exifToolExtracted?: boolean;
      usedRMSFastPath?: boolean;
    }
  ): Promise<void> {
    try {
      console.log(`Saving processing results to Firebase for resume ${resumeId}`);

      const resumeRef = doc(db, 'resumes', resumeId);

      // Clean data to avoid Firebase undefined value errors
      const cleanData: any = {
        updatedAt: serverTimestamp(),
        status: FileStatus.PROCESSED,
        processingCompleted: new Date().toISOString(),
        rmsVersion: this.RMS_VERSION,
        exifToolExtracted: data.exifToolExtracted || false,
        usedRMSFastPath: data.usedRMSFastPath || false
      };

      console.log('Data values before filtering:', {
        fileUrl: data.fileUrl,
        hasFileUrl: data.fileUrl !== undefined,
        rmsData: typeof data.rmsData,
        hasRmsData: data.rmsData !== undefined,
        title: data.title,
        hasTitle: data.title !== undefined,
        usedRMSFastPath: data.usedRMSFastPath
      });

      if (data.fileUrl !== undefined) cleanData.fileUrl = data.fileUrl;
      if (data.rmsData !== undefined) cleanData.rmsRawData = data.rmsData;
      if (data.title !== undefined) cleanData.title = data.title;

      // Recursively remove all undefined values
      const removeUndefined = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(removeUndefined).filter(item => item !== undefined);
        } else if (obj !== null && typeof obj === 'object') {
          const cleaned: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
              const cleanedValue = removeUndefined(value);
              if (cleanedValue !== undefined) {
                cleaned[key] = cleanedValue;
              }
            }
          }
          return cleaned;
        }
        return obj;
      };

      // Clean all data recursively
      const finalCleanData = removeUndefined(cleanData);

      console.log('Final clean data keys:', Object.keys(finalCleanData));

      await updateDoc(resumeRef, finalCleanData);

      console.log('Results saved successfully');
    } catch (error) {
      console.error('Error saving results to Firebase:', error);
      throw error;
    }
  }

  /**
   * Extract common fields from RMS data for frontend use
   */
  public static extractCommonFields(rmsData: any): {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    experienceCount: number;
    educationCount: number;
    skillsCount: number;
  } {
    return {
      fullName: rmsData.rms_contact_fullName || rmsData.Rms_contact_fullName || '',
      email: rmsData.rms_contact_email || rmsData.Rms_contact_email || '',
      phone: rmsData.rms_contact_phone || rmsData.Rms_contact_phone || '',
      linkedin: rmsData.rms_contact_linkedin || rmsData.Rms_contact_linkedin || '',
      experienceCount: parseInt(rmsData.rms_experience_count || rmsData.Rms_experience_count || '0'),
      educationCount: parseInt(rmsData.rms_education_count || rmsData.Rms_education_count || '0'),
      skillsCount: parseInt(rmsData.rms_skill_count || rmsData.Rms_skill_count || '0')
    };
  }

  /**
   * Internal function: Convert ExtractResumeDataOutput to ParsedData format
   */
  private static convertExtractToParsedData(extractResult: ExtractResumeDataOutput): ParsedData {
    return {
      contactInfo: {
        fullName: extractResult.contactInformation?.name,
        email: extractResult.contactInformation?.email,
        phone: extractResult.contactInformation?.phone,
        linkedin: extractResult.contactInformation?.linkedin
      },
      summary: undefined, // Not provided by extract format
      experiences: extractResult.experience?.map(exp => ({
        company: exp.company,
        title: exp.title,
        description: exp.description,
        startDate: exp.dates?.split(' - ')[0]?.trim(),
        endDate: exp.dates?.split(' - ')[1]?.trim(),
        current: exp.dates?.includes('Present') || false
      })),
      education: extractResult.education?.map(edu => ({
        school: edu.institution,
        institution: edu.institution,
        degree: edu.degree,
        qualification: edu.degree,
        description: edu.description,
        formattedDate: edu.dates,
        startDate: edu.dates?.split(' - ')[0]?.trim(),
        endDate: edu.dates?.split(' - ')[1]?.trim()
      })),
      skillCategories: extractResult.skills && extractResult.skills.length > 0 ? [{
        name: 'Skills',
        skills: extractResult.skills.map(skill => ({ name: skill }))
      }] : [],
      projects: extractResult.projects?.map(proj => ({
        title: proj.title,
        description: proj.description,
        startDate: proj.dates?.split(' - ')[0]?.trim(),
        endDate: proj.dates?.split(' - ')[1]?.trim(),
        current: proj.dates?.includes('Present') || false
      })),
      involvements: extractResult.involvement?.map(inv => ({
        role: inv.role,
        organization: inv.organization,
        description: inv.description,
        startDate: inv.dates?.split(' - ')[0]?.trim(),
        endDate: inv.dates?.split(' - ')[1]?.trim(),
        current: inv.dates?.includes('Present') || false
      })),
      certifications: extractResult.certifications?.map(cert => ({
        name: cert.name,
        title: cert.name,
        issuer: cert.issuer,
        organization: cert.issuer,
        date: cert.date,
        issueDate: cert.date
      }))
    };
  }

  /**
   * Internal function: Enhanced RMS formatting that handles all resume sections
   */
  private static formatToRmsEnhanced(parsedData: ParsedData): Record<string, string | number | boolean> {
    // Start with basic structure
    const rmsData: Record<string, string | number | boolean> = {
      Producer: "rms_v2.0.1",
      Rms_schema_details: "https://github.com/resume-io/resume-standard"
    };

    // Process Contact Information
    const contactInfo = parsedData.contactInfo || {};
    rmsData['Rms_contact_fullName'] = contactInfo.fullName || 'n/a';
    rmsData['Rms_contact_email'] = contactInfo.email || 'n/a';
    rmsData['Rms_contact_phone'] = contactInfo.phone || 'n/a';
    rmsData['Rms_contact_linkedin'] = contactInfo.linkedin || 'n/a';

    // Process Experience
    const experiences = parsedData.experiences || [];
    rmsData['Rms_experience_count'] = experiences.length;
    experiences.forEach((exp, index) => {
      rmsData[`Rms_experience_${index}_company`] = exp.company || '';
      rmsData[`Rms_experience_${index}_role`] = exp.title || exp.role || '';
      rmsData[`Rms_experience_${index}_dateBegin`] = exp.startDate || '';
      rmsData[`Rms_experience_${index}_dateEnd`] = exp.endDate || (exp.current ? 'Present' : '');
      rmsData[`Rms_experience_${index}_description`] = exp.description || '';
      rmsData[`Rms_experience_${index}_isCurrent`] = exp.current || false;
      rmsData[`Rms_experience_${index}_location`] = exp.location || '';
    });

    // Process Education
    const education = parsedData.education || [];
    rmsData['Rms_education_count'] = education.length;
    education.forEach((edu, index) => {
      rmsData[`Rms_education_${index}_institution`] = edu.school || edu.institution || '';
      rmsData[`Rms_education_${index}_qualification`] = edu.degree || edu.qualification || '';
      rmsData[`Rms_education_${index}_fieldOfStudy`] = edu.fieldOfStudy || '';
      rmsData[`Rms_education_${index}_date`] = edu.formattedDate || edu.endDate || edu.graduationDate || '';
      rmsData[`Rms_education_${index}_dateBegin`] = edu.startDate || '';
      rmsData[`Rms_education_${index}_dateEnd`] = edu.endDate || edu.graduationDate || '';
      rmsData[`Rms_education_${index}_description`] = edu.description || '';
      rmsData[`Rms_education_${index}_isGraduate`] = !edu.current;
      rmsData[`Rms_education_${index}_gpa`] = edu.gpa || edu.score || '';
      rmsData[`Rms_education_${index}_location`] = edu.location || '';
    });

    // Process Skills
    const skillCategories = parsedData.skillCategories || [];
    if (skillCategories.length > 0) {
      rmsData['Rms_skill_count'] = skillCategories.length;
      skillCategories.forEach((category, index) => {
        rmsData[`Rms_skill_${index}_category`] = category.name || 'Skills';
        const skillNames = category.skills?.map(skill =>
          typeof skill === 'string' ? skill : skill.name
        ).filter(Boolean).join(', ') || '';
        rmsData[`Rms_skill_${index}_keywords`] = skillNames;
      });
    } else {
      rmsData['Rms_skill_count'] = 0;
    }

    // Process Projects
    const projects = parsedData.projects || [];
    rmsData['Rms_project_count'] = projects.length;
    projects.forEach((proj, index) => {
      rmsData[`Rms_project_${index}_title`] = proj.title || '';
      rmsData[`Rms_project_${index}_organization`] = proj.organization || '';
      rmsData[`Rms_project_${index}_dateBegin`] = proj.startDate || '';
      rmsData[`Rms_project_${index}_dateEnd`] = proj.endDate || (proj.current ? 'Present' : '');
      rmsData[`Rms_project_${index}_description`] = proj.description || '';
      rmsData[`Rms_project_${index}_technologies`] = Array.isArray(proj.technologies) ?
        proj.technologies.join(', ') : (proj.technologies || '');
      rmsData[`Rms_project_${index}_url`] = '';
    });

    // Process Involvement
    const involvements = parsedData.involvements || [];
    rmsData['Rms_involvement_count'] = involvements.length;
    involvements.forEach((inv, index) => {
      rmsData[`Rms_involvement_${index}_role`] = inv.role || '';
      rmsData[`Rms_involvement_${index}_organization`] = inv.organization || '';
      rmsData[`Rms_involvement_${index}_dateBegin`] = inv.startDate || '';
      rmsData[`Rms_involvement_${index}_dateEnd`] = inv.endDate || (inv.current ? 'Present' : '');
      rmsData[`Rms_involvement_${index}_description`] = inv.description || '';
      rmsData[`Rms_involvement_${index}_location`] = inv.location || '';
    });

    // Process Certifications
    const certifications = parsedData.certifications || [];
    rmsData['Rms_certification_count'] = certifications.length;
    certifications.forEach((cert, index) => {
      rmsData[`Rms_certification_${index}_name`] = cert.name || cert.title || '';
      rmsData[`Rms_certification_${index}_issuer`] = cert.issuer || cert.organization || '';
      rmsData[`Rms_certification_${index}_date`] = cert.date || cert.issueDate || '';
      rmsData[`Rms_certification_${index}_credentialId`] = cert.credentialId || '';
      rmsData[`Rms_certification_${index}_url`] = cert.url || '';
    });

    // Process Awards
    const awards = parsedData.awards || [];
    rmsData['Rms_award_count'] = awards.length;
    awards.forEach((award, index) => {
      rmsData[`Rms_award_${index}_title`] = award.title || award.name || '';
      rmsData[`Rms_award_${index}_issuer`] = award.issuer || award.organization || '';
      rmsData[`Rms_award_${index}_date`] = award.date || '';
      rmsData[`Rms_award_${index}_description`] = award.description || '';
    });

    // Process Coursework
    const coursework = parsedData.coursework || [];
    rmsData['Rms_coursework_count'] = coursework.length;
    coursework.forEach((course, index) => {
      rmsData[`Rms_coursework_${index}_name`] = course.name || '';
      rmsData[`Rms_coursework_${index}_department`] = course.department || '';
    });

    // Process Publications
    const publications = parsedData.publications || [];
    rmsData['Rms_publication_count'] = publications.length;
    publications.forEach((pub, index) => {
      rmsData[`Rms_publication_${index}_title`] = pub.title || '';
      rmsData[`Rms_publication_${index}_authors`] = pub.authors || '';
      rmsData[`Rms_publication_${index}_journal`] = pub.journal || '';
      rmsData[`Rms_publication_${index}_date`] = pub.date || '';
      rmsData[`Rms_publication_${index}_description`] = pub.description || '';
      rmsData[`Rms_publication_${index}_url`] = pub.url || '';
    });

    // Process References
    const references = parsedData.references || [];
    rmsData['Rms_reference_count'] = references.length;
    references.forEach((ref, index) => {
      rmsData[`Rms_reference_${index}_name`] = ref.name || '';
      rmsData[`Rms_reference_${index}_title`] = ref.title || '';
      rmsData[`Rms_reference_${index}_company`] = ref.company || '';
      rmsData[`Rms_reference_${index}_email`] = ref.email || '';
      rmsData[`Rms_reference_${index}_phone`] = ref.phone || '';
    });

    // Process Languages
    const languages = parsedData.languages || [];
    rmsData['Rms_language_count'] = languages.length;
    languages.forEach((lang, index) => {
      rmsData[`Rms_language_${index}_name`] = lang.name || '';
      rmsData[`Rms_language_${index}_proficiency`] = lang.proficiency || '';
    });

    // Process Volunteer Experience
    const volunteer = parsedData.volunteer || [];
    rmsData['Rms_volunteer_count'] = volunteer.length;
    volunteer.forEach((vol, index) => {
      rmsData[`Rms_volunteer_${index}_role`] = vol.role || vol.title || '';
      rmsData[`Rms_volunteer_${index}_organization`] = vol.organization || '';
      rmsData[`Rms_volunteer_${index}_location`] = vol.location || '';
      rmsData[`Rms_volunteer_${index}_dateBegin`] = vol.startDate || '';
      rmsData[`Rms_volunteer_${index}_dateEnd`] = vol.endDate || (vol.current ? 'Present' : '');
      rmsData[`Rms_volunteer_${index}_description`] = vol.description || '';
    });

    return rmsData;
  }

  /**
   * Internal function: Analyze extracted data to determine sections found
   */
  private static analyzeSections(extractResult: ExtractResumeDataOutput): {
    sectionsFound: string[];
    totalFields: number;
  } {
    const sections: string[] = [];
    let fieldCount = 0;

    if (extractResult.contactInformation?.name) {
      sections.push('contact');
      fieldCount += Object.keys(extractResult.contactInformation).length;
    }

    if (extractResult.experience?.length) {
      sections.push('experience');
      fieldCount += extractResult.experience.length * 6; // Avg fields per experience
    }

    if (extractResult.education?.length) {
      sections.push('education');
      fieldCount += extractResult.education.length * 8; // Avg fields per education
    }

    if (extractResult.skills?.length) {
      sections.push('skills');
      fieldCount += 3; // Skills are grouped
    }

    if (extractResult.projects?.length) {
      sections.push('projects');
      fieldCount += extractResult.projects.length * 5;
    }

    if (extractResult.involvement?.length) {
      sections.push('involvement');
      fieldCount += extractResult.involvement.length * 5;
    }

    if (extractResult.certifications?.length) {
      sections.push('certifications');
      fieldCount += extractResult.certifications.length * 4;
    }

    return { sectionsFound: sections, totalFields: fieldCount };
  }

  /**
   * Check if RMS metadata contains enough information to skip AI parsing
   */
  private static isCompleteRMSData(rmsMetadata: any): boolean {
    // Debug: Log all contact-related fields
    const contactFields = Object.keys(rmsMetadata).filter(key => 
      key.toLowerCase().includes('contact') || key.toLowerCase().includes('name')
    );
    console.log('RMS contact fields found:', contactFields);
    
    // Check for essential fields that indicate complete resume data
    const hasContact = rmsMetadata.rms_contact_fullName || rmsMetadata.Rms_contact_fullName || 
                      rmsMetadata.rms_contact_fullname || rmsMetadata.Rms_contact_fullname ||
                      rmsMetadata.rms_contact_givenNames || rmsMetadata.Rms_contact_givenNames ||
                      rmsMetadata.rms_contact_givennames || rmsMetadata.Rms_contact_givennames ||
                      rmsMetadata.rms_contact_lastName || rmsMetadata.Rms_contact_lastName ||
                      rmsMetadata.rms_contact_lastname || rmsMetadata.Rms_contact_lastname;
    const hasEmail = rmsMetadata.rms_contact_email || rmsMetadata.Rms_contact_email;

    // Check for at least one substantial section
    const hasExperience = (rmsMetadata.rms_experience_count || rmsMetadata.Rms_experience_count) > 0;
    const hasEducation = (rmsMetadata.rms_education_count || rmsMetadata.Rms_education_count) > 0;
    const hasSkills = (rmsMetadata.rms_skill_count || rmsMetadata.Rms_skill_count) > 0;

    // Check for RMS version compliance
    const hasVersion = rmsMetadata.rms_version || rmsMetadata.Rms_version ||
                      (rmsMetadata.producer && rmsMetadata.producer.includes('rms_v'));

    // Detect and exclude test/default/fallback data patterns
    const email = hasEmail ? (rmsMetadata.rms_contact_email || rmsMetadata.Rms_contact_email) : '';
    const fullName = hasContact ? (rmsMetadata.rms_contact_fullName || rmsMetadata.Rms_contact_fullName || 
                                   rmsMetadata.rms_contact_fullname || rmsMetadata.Rms_contact_fullname ||
                                   `${rmsMetadata.rms_contact_givenNames || rmsMetadata.Rms_contact_givenNames || 
                                      rmsMetadata.rms_contact_givennames || rmsMetadata.Rms_contact_givennames || ''} ${
                                      rmsMetadata.rms_contact_lastName || rmsMetadata.Rms_contact_lastName || 
                                      rmsMetadata.rms_contact_lastname || rmsMetadata.Rms_contact_lastname || ''}`.trim()) : '';

    const testDataPatterns = [
      'john.doe@example.com',
      'test@example.com',
      'user@example.com',
      'sample@example.com',
      'john doe',
      'test user',
      'sample user',
      'jane doe'
    ];

    const isTestData = testDataPatterns.some(pattern =>
      email.toLowerCase().includes(pattern) ||
      fullName.toLowerCase().includes(pattern)
    );

    if (isTestData) {
      console.log('❌ Detected test/default data - will not use Fast Path');
      return false;
    }

    const isComplete = hasContact && hasEmail && hasVersion && (hasExperience || hasEducation || hasSkills);

    if (isComplete) {
      console.log('RMS metadata is complete - contains contact info, version, and substantial content');
    } else {
      console.log('RMS metadata is incomplete:', {
        hasContact,
        hasEmail,
        hasVersion,
        hasExperience,
        hasEducation,
        hasSkills
      });
    }

    return isComplete;
  }

  /**
   * Merge RMS metadata from ExifTool with parsed data
   */
  private static mergeRMSMetadata(exifMetadata: any, parsedData: any): any {
    const merged = { ...parsedData };

    // Override contact info if ExifTool has better data
    if (exifMetadata.rms_contact_fullName && (!merged.rms_contact_fullName || merged.rms_contact_fullName === 'n/a')) {
      merged.rms_contact_fullName = exifMetadata.rms_contact_fullName;
    }
    if (exifMetadata.rms_contact_email && (!merged.rms_contact_email || merged.rms_contact_email === 'n/a')) {
      merged.rms_contact_email = exifMetadata.rms_contact_email;
    }

    // Merge all RMS fields that aren't already in parsed data
    Object.keys(exifMetadata).forEach(key => {
      if (key.startsWith('rms_') && (!merged[key] || merged[key] === 'n/a')) {
        merged[key] = exifMetadata[key];
      }
    });

    // Update producer info
    if (exifMetadata.producer) {
      merged.Producer = exifMetadata.producer;
    }

    console.log('RMS metadata merged successfully');
    return merged;
  }

  /**
   * Formats the structured resume data into a flat key-value pair object
   * according to the Resume Resume Metadata Standard (RMS) style.
   * This now generates the proper RMS format that matches ExifTool output.
   * @param data The structured data extracted from the resume.
   * @returns A flattened object with proper RMS-style keys.
   */
  private static formatToRms(data: ExtractResumeDataOutput): Record<string, string | number | boolean> {
    const rmsData: Record<string, string | number | boolean> = {
      Producer: "rms_v2.0.1",
    };

    // Process Contact Information with proper RMS field names
    const contactInfo = data.contactInformation || {};

    // Map to proper RMS contact field names
    rmsData['Rms_contact_fullName'] = contactInfo.name || 'n/a';
    rmsData['Rms_contact_email'] = contactInfo.email || 'n/a';
    rmsData['Rms_contact_phone'] = contactInfo.phone || 'n/a';
    rmsData['Rms_contact_linkedin'] = contactInfo.linkedin || 'n/a';

    // Process Experience with proper RMS field mapping
    const experiences = data.experience || [];
    rmsData['Rms_experience_count'] = experiences.length;

    experiences.forEach((exp, index) => {
      rmsData[`Rms_experience_${index}_company`] = exp.company || '';
      rmsData[`Rms_experience_${index}_role`] = exp.title || ''; // Map title -> role
      rmsData[`Rms_experience_${index}_dateBegin`] = exp.dates || '';
      rmsData[`Rms_experience_${index}_description`] = exp.description || '';
      rmsData[`Rms_experience_${index}_isCurrent`] = false; // Default to false for Gemini parsing
    });

    // Process Education with proper RMS field mapping
    const education = data.education || [];
    rmsData['Rms_education_count'] = education.length;

    education.forEach((edu, index) => {
      rmsData[`Rms_education_${index}_institution`] = edu.institution || '';
      rmsData[`Rms_education_${index}_qualification`] = edu.degree || ''; // Map degree -> qualification
      rmsData[`Rms_education_${index}_date`] = edu.dates || '';
      rmsData[`Rms_education_${index}_description`] = edu.description || '';
      rmsData[`Rms_education_${index}_isGraduate`] = true; // Default to true
    });

    // Process Projects with proper RMS field mapping
    const projects = data.projects || [];
    rmsData['Rms_project_count'] = projects.length;

    projects.forEach((proj, index) => {
      rmsData[`Rms_project_${index}_title`] = proj.title || '';
      rmsData[`Rms_project_${index}_dateBegin`] = proj.dates || '';
      rmsData[`Rms_project_${index}_description`] = proj.description || '';
      rmsData[`Rms_project_${index}_url`] = proj.url || '';
    });

    // Process Involvement with proper RMS field mapping
    const involvement = data.involvement || [];
    rmsData['Rms_involvement_count'] = involvement.length;

    involvement.forEach((inv, index) => {
      rmsData[`Rms_involvement_${index}_organization`] = inv.organization || '';
      rmsData[`Rms_involvement_${index}_role`] = inv.role || '';
      rmsData[`Rms_involvement_${index}_dateBegin`] = inv.dates || '';
      rmsData[`Rms_involvement_${index}_description`] = inv.description || '';
    });

    // Process Certifications with proper RMS field mapping
    const certifications = data.certifications || [];
    rmsData['Rms_certification_count'] = certifications.length;

    certifications.forEach((cert, index) => {
      rmsData[`Rms_certification_${index}_name`] = cert.name || '';
      rmsData[`Rms_certification_${index}_issuer`] = cert.issuer || '';
      rmsData[`Rms_certification_${index}_date`] = cert.date || '';
    });

    // Handle skills with proper RMS format
    const skills = data.skills || [];
    if (skills.length > 0) {
      // Group all skills into a single category for RMS format
      rmsData['Rms_skill_count'] = 1;
      rmsData['Rms_skill_0_category'] = 'Skills';
      rmsData['Rms_skill_0_keywords'] = skills.join(', ');
    } else {
      rmsData['Rms_skill_count'] = 0;
    }

    // Add additional RMS metadata fields to match ExifTool format
    rmsData['Rms_award_count'] = 0;
    rmsData['Rms_coursework_count'] = 0;
    rmsData['Rms_publication_count'] = 0;
    rmsData['Rms_reference_count'] = 0;
    rmsData['Rms_schema_details'] = "https://github.com/resume-io/resume-standard";

    return rmsData;
  }
}

/**
 * PDF Generator class for creating PDFs from resume data
 */
export class PDFGenerator {
  private doc: jsPDF;
  private config: PDFConfiguration;
  private customFontsLoaded = false;
  private pageWidth: number;
  private pageHeight: number;
  private contentWidth: number;
  private yPosition: number;

  constructor(resumeData: ResumeData) {
    // Create PDF document
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: resumeData.documentSettings?.paperSize === 'A4' ? 'a4' : 'letter',
      compress: true,
      putOnlyUsedFonts: true,
    });

    // Initialize configuration
    this.config = this.createConfiguration(resumeData);

    // Set page dimensions
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.contentWidth = this.pageWidth - this.config.margins.left - this.config.margins.right;
    this.yPosition = this.config.margins.top;
  }

  private createConfiguration(resumeData: ResumeData): PDFConfiguration {
    const style = resumeData.fontStyle || 'professional';
    const baseConfig = { ...DEFAULT_CONFIG };

    // Apply style-specific configuration
    if (FONT_CONFIGURATIONS[style]) {
      Object.assign(baseConfig, FONT_CONFIGURATIONS[style]);
    }

    // Apply document settings overrides
    if (resumeData.documentSettings) {
      const { documentSettings } = resumeData;

      if (documentSettings.margins) {
        baseConfig.margins = { ...baseConfig.margins, ...documentSettings.margins };
      }

      if (documentSettings.fontSize) {
        // Scale all fonts by the specified size
        const scaleFactor = documentSettings.fontSize / 10; // Base size is 10
        Object.keys(baseConfig.fonts).forEach(key => {
          const fontKey = key as keyof typeof baseConfig.fonts;
          baseConfig.fonts[fontKey].size *= scaleFactor;
        });
      }
    }

    return baseConfig;
  }

  private async loadCustomFonts(): Promise<boolean> {
    const fontFamily = this.config.fonts.body.family;

    if (fontFamily === 'merriweather' || fontFamily === 'merriweatherSans') {
      try {
        this.customFontsLoaded = (await addCustomFonts(this.doc, fontFamily)) ?? false;
        console.log(`[PDF] Custom fonts ${fontFamily} loaded: ${this.customFontsLoaded}`);
        return this.customFontsLoaded;
      } catch (error) {
        console.warn('[PDF] Failed to load custom fonts, using fallback:', error);
        this.fallbackToStandardFonts();
        return false;
      }
    }

    return true; // Standard fonts don't need loading
  }

  private fallbackToStandardFonts(): void {
    // Convert custom font families to standard equivalents
    const fontMapping: Record<string, string> = {
      'merriweather': 'times',
      'merriweatherSans': 'helvetica'
    };

    Object.keys(this.config.fonts).forEach(key => {
      const fontKey = key as keyof typeof this.config.fonts;
      const currentFamily = this.config.fonts[fontKey].family;
      if (fontMapping[currentFamily]) {
        this.config.fonts[fontKey].family = fontMapping[currentFamily];
      }
    });
  }

  private setFont(fontDef: FontDefinition): void {
    this.doc.setFontSize(fontDef.size);

    if (this.customFontsLoaded && (fontDef.family === 'merriweather' || fontDef.family === 'merriweatherSans')) {
      const fontName = getFontName(fontDef.family, fontDef.weight);
      this.doc.setFont(fontName);
    } else {
      const style = fontDef.weight >= 700 ? 'bold' : 'normal';
      this.doc.setFont(fontDef.family, style);
    }
  }

  private addText(
    text: string,
    x: number,
    y: number,
    options: {
      font?: FontDefinition;
      color?: { r: number; g: number; b: number };
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
    } = {}
  ): number {
    const font = options.font || this.config.fonts.body;
    const color = options.color || this.config.colors.text;

    this.setFont(font);
    this.doc.setTextColor(color.r, color.g, color.b);

    if (options.maxWidth) {
      const lines = this.splitTextToLines(text, options.maxWidth);
      const lineHeight = font.size * this.config.spacing.lineHeight;

      lines.forEach((line, index) => {
        const alignOptions: any = {};
        if (options.align) alignOptions.align = options.align;
        this.doc.text(line, x, y + (index * lineHeight), alignOptions);
      });

      return y + (lines.length * lineHeight);
    } else {
      const alignOptions: any = {};
      if (options.align) alignOptions.align = options.align;
      this.doc.text(text, x, y, alignOptions);
      return y + font.size * this.config.spacing.lineHeight;
    }
  }

  private splitTextToLines(text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const words = text.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = this.doc.getTextWidth(testLine);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private checkPageOverflow(requiredSpace = 60): void {
    if (this.yPosition > this.pageHeight - this.config.margins.bottom - requiredSpace) {
      this.doc.addPage();
      this.yPosition = this.config.margins.top;
    }
  }

  private addSectionHeading(heading: string): void {
    this.checkPageOverflow(30);

    this.yPosition += this.config.spacing.sectionGap;

    this.yPosition = this.addText(heading.toUpperCase(), this.config.margins.left, this.yPosition, {
      font: this.config.fonts.heading,
      color: this.config.colors.black
    });

    this.yPosition += 3;

    // Add underline
    this.doc.setLineWidth(0.75);
    this.doc.setDrawColor(this.config.colors.black.r, this.config.colors.black.g, this.config.colors.black.b);
    this.doc.line(this.config.margins.left, this.yPosition, this.pageWidth - this.config.margins.right, this.yPosition);

    this.yPosition += 8;
  }

  private formatLocation(...parts: (string | undefined)[]): string {
    return parts.filter(Boolean).join(', ');
  }

  private parseBulletPoints(text: string): string[] {
    if (!text) return [];

    const lines = text
      .split(/[\n•·\-\*]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0 && text.trim()) {
      return [text.trim()];
    }

    return lines;
  }

  private formatDateRange(startDate?: string, endDate?: string, current?: boolean): string {
    const dateRange = [];
    if (startDate) dateRange.push(startDate);
    if (current) {
      dateRange.push('Present');
    } else if (endDate) {
      dateRange.push(endDate);
    }
    return dateRange.join(' – ');
  }

  private renderHeader(contactInfo: any): void {
    // Name (centered)
    const name = contactInfo.fullName || 'YOUR NAME';
    this.yPosition = this.addText(name.toUpperCase(), this.pageWidth / 2, this.yPosition, {
      font: this.config.fonts.name,
      color: this.config.colors.black,
      align: 'center'
    });

    this.yPosition += 6;

    // Contact info (centered)
    const contactItems = [];
    const location = this.formatLocation(
      contactInfo.location,
      contactInfo.city,
      contactInfo.state,
      contactInfo.country
    );

    if (location) contactItems.push(location);
    if (contactInfo.email) contactItems.push(contactInfo.email);
    if (contactInfo.phone) contactItems.push(contactInfo.phone);
    if (contactInfo.linkedin) {
      const linkedinHandle = contactInfo.linkedin.replace(/^.*\/in\//, '');
      contactItems.push(`linkedin.com/in/${linkedinHandle}`);
    }
    if (contactInfo.website) contactItems.push(contactInfo.website);

    if (contactItems.length > 0) {
      const contactText = contactItems.join(' • ');
      this.yPosition = this.addText(contactText, this.pageWidth / 2, this.yPosition, {
        font: this.config.fonts.accent,
        color: this.config.colors.gray,
        align: 'center'
      });
    }

    this.yPosition += this.config.spacing.sectionGap;
  }

  private renderSummary(summary: string): void {
    if (!summary) return;

    this.addSectionHeading('PROFESSIONAL SUMMARY');
    this.yPosition = this.addText(summary, this.config.margins.left, this.yPosition, {
      font: this.config.fonts.body,
      color: this.config.colors.text,
      maxWidth: this.contentWidth
    });
    this.yPosition += this.config.spacing.itemGap;
  }

  private renderExperience(experiences: any[]): void {
    if (!experiences || experiences.length === 0) return;

    this.addSectionHeading('PROFESSIONAL EXPERIENCE');

    experiences.forEach((exp, index) => {
      this.checkPageOverflow(80);

      // Job title
      this.yPosition = this.addText(exp.title || exp.role || '', this.config.margins.left, this.yPosition, {
        font: this.config.fonts.subheading,
        color: this.config.colors.black
      });

      // Company and dates
      const companyInfo = [];
      if (exp.company) companyInfo.push(exp.company);
      if (exp.location) companyInfo.push(exp.location);

      const leftText = companyInfo.join(', ');
      const rightText = this.formatDateRange(exp.startDate, exp.endDate, exp.current);

      if (leftText) {
        this.addText(leftText, this.config.margins.left, this.yPosition, {
          font: this.config.fonts.body,
          color: this.config.colors.text
        });
      }

      if (rightText) {
        this.setFont(this.config.fonts.accent);
        const textWidth = this.doc.getTextWidth(rightText);
        this.addText(rightText, this.pageWidth - this.config.margins.right - textWidth, this.yPosition, {
          font: this.config.fonts.accent,
          color: this.config.colors.gray
        });
      }

      this.yPosition += this.config.fonts.body.size * this.config.spacing.lineHeight + 4;

      // Description bullets
      if (exp.description) {
        const bullets = this.parseBulletPoints(exp.description);

        bullets.forEach(bullet => {
          this.addText('•', this.config.margins.left + 10, this.yPosition, {
            font: this.config.fonts.body,
            color: this.config.colors.text
          });

          this.yPosition = this.addText(bullet, this.config.margins.left + 20, this.yPosition, {
            font: this.config.fonts.body,
            color: this.config.colors.text,
            maxWidth: this.contentWidth - 20
          });

          this.yPosition += 2;
        });
      }

      if (index < experiences.length - 1) {
        this.yPosition += this.config.spacing.itemGap;
      }
    });
  }

  private renderEducation(education: any[]): void {
    if (!education || education.length === 0) return;

    this.addSectionHeading('EDUCATION');

    education.forEach((edu, index) => {
      // School name
      this.yPosition = this.addText(edu.school || edu.institution || '', this.config.margins.left, this.yPosition, {
        font: this.config.fonts.subheading,
        color: this.config.colors.black
      });

      // Degree and date
      const degreeParts = [];
      if (edu.degree) degreeParts.push(edu.degree);
      if (edu.fieldOfStudy) degreeParts.push(edu.fieldOfStudy);

      if (degreeParts.length > 0) {
        const leftText = degreeParts.join(' in ');
        const rightText = edu.endDate || edu.graduationDate || '';

        this.addText(leftText, this.config.margins.left, this.yPosition, {
          font: this.config.fonts.body,
          color: this.config.colors.text
        });

        if (rightText) {
          this.setFont(this.config.fonts.accent);
          const textWidth = this.doc.getTextWidth(rightText);
          this.addText(rightText, this.pageWidth - this.config.margins.right - textWidth, this.yPosition, {
            font: this.config.fonts.accent,
            color: this.config.colors.gray
          });
        }

        this.yPosition += this.config.fonts.body.size * this.config.spacing.lineHeight;
      }

      // Additional info
      const additionalInfo = [];
      if (edu.gpa) additionalInfo.push(`GPA: ${edu.gpa}`);
      if (edu.location) additionalInfo.push(edu.location);

      if (additionalInfo.length > 0) {
        this.yPosition = this.addText(additionalInfo.join(' • '), this.config.margins.left, this.yPosition, {
          font: this.config.fonts.small,
          color: this.config.colors.gray
        });
      }

      if (index < education.length - 1) {
        this.yPosition += this.config.spacing.itemGap;
      }
    });
  }

  private renderSkills(skillCategories: any[]): void {
    if (!skillCategories || skillCategories.length === 0) return;

    this.addSectionHeading('SKILLS');

    skillCategories.forEach(category => {
      const skillNames = category.skills.map((s: any) => s.name || s).join(', ');

      if (category.name && category.name !== 'Skills') {
        this.setFont({ ...this.config.fonts.body, weight: 700 });
        const categoryWidth = this.doc.getTextWidth(category.name + ': ');
        this.doc.setTextColor(this.config.colors.black.r, this.config.colors.black.g, this.config.colors.black.b);
        this.doc.text(category.name + ': ', this.config.margins.left, this.yPosition);

        this.yPosition = this.addText(skillNames, this.config.margins.left + categoryWidth, this.yPosition, {
          font: this.config.fonts.body,
          color: this.config.colors.text,
          maxWidth: this.contentWidth - categoryWidth
        });
      } else {
        this.yPosition = this.addText(skillNames, this.config.margins.left, this.yPosition, {
          font: this.config.fonts.body,
          color: this.config.colors.text,
          maxWidth: this.contentWidth
        });
      }

      this.yPosition += 4;
    });
  }

  private renderProjects(projects: any[]): void {
    if (!projects || projects.length === 0) return;

    this.addSectionHeading('PROJECTS');

    projects.forEach((project, index) => {
      this.yPosition = this.addText(project.title || '', this.config.margins.left, this.yPosition, {
        font: this.config.fonts.subheading,
        color: this.config.colors.black
      });

      if (project.description) {
        this.yPosition = this.addText(project.description, this.config.margins.left, this.yPosition, {
          font: this.config.fonts.body,
          color: this.config.colors.text,
          maxWidth: this.contentWidth
        });
      }

      if (project.technologies && project.technologies.length > 0) {
        const techText = `Technologies: ${Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}`;
        this.yPosition = this.addText(techText, this.config.margins.left, this.yPosition, {
          font: this.config.fonts.small,
          color: this.config.colors.gray,
          maxWidth: this.contentWidth
        });
      }

      if (index < projects.length - 1) {
        this.yPosition += this.config.spacing.itemGap;
      }
    });
  }

  public async generate(resumeData: ResumeData): Promise<Blob> {
    console.log('[PDF] Starting unified PDF generation');

    // Load custom fonts if needed
    await this.loadCustomFonts();

    return this.renderDocument(resumeData);
  }

  public generateSync(resumeData: ResumeData): Blob {
    console.log('[PDF] Starting unified PDF generation (sync)');
    console.log('[PDF] Note: Custom fonts will not be loaded in sync mode');

    // Skip font loading for sync generation
    this.customFontsLoaded = false;
    this.fallbackToStandardFonts();

    return this.renderDocument(resumeData);
  }

  private renderDocument(resumeData: ResumeData): Blob {
    const { parsedData } = resumeData;
    const contactInfo = parsedData.contactInfo || {};

    // Render sections
    this.renderHeader(contactInfo);
    this.renderSummary(parsedData.summary);
    this.renderExperience(parsedData.experiences);
    this.renderEducation(parsedData.education);
    this.renderSkills(parsedData.skillCategories);
    this.renderProjects(parsedData.projects);

    // Additional sections (involvement, certifications, etc.) can be added here

    // Set document properties
    this.doc.setProperties({
      title: resumeData.title || 'Resume',
      author: contactInfo.fullName || 'Resume Owner',
      creator: 'Resume Builder Pro with RMS',
      keywords: 'resume, cv, professional',
    });

    console.log('[PDF] Unified PDF generation complete');
    return this.doc.output('blob');
  }
}

/**
 * Unified PDF generator that combines the best of custom fonts and vector fonts
 * Automatically handles font loading, fallbacks, and optimal typography
 */
export async function generateResumePDF(resumeData: ResumeData): Promise<Blob> {
  const generator = new PDFGenerator(resumeData);
  return await generator.generate(resumeData);
}

/**
 * Synchronous PDF generation (uses fallback fonts)
 */
export function generateResumePDFSync(resumeData: ResumeData): Blob {
  const generator = new PDFGenerator(resumeData);
  return generator.generateSync(resumeData);
}

/**
 * Legacy compatibility function
 */
export async function generateResumePDFAsync(resumeData: ResumeData): Promise<Blob> {
  return generateResumePDF(resumeData);
}

// Export enhanced parsing functions for external use
export const parseResumeTextWithGenkit = PDFProcessor.parseResumeTextWithGenkit.bind(PDFProcessor);
export const parsePDFWithGenkit = PDFProcessor.parsePDFWithGenkit.bind(PDFProcessor);
export const validateRMSStructure = PDFProcessor.validateRMSStructure.bind(PDFProcessor);
export const upgradeRMSData = PDFProcessor.upgradeRMSData.bind(PDFProcessor);