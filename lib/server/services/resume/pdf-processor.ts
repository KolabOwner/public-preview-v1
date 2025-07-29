import { collection, doc, addDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { z } from 'zod';
import { db, storage } from "@/config/firebase-config";
import { extractResumeData } from '@/lib/ai/flows/resume/generate';
import type { ExtractResumeDataOutput } from '@/lib/ai/flows/resume/generate';

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
 * Main class for processing PDF resumes with RMS compliance
 */
export class PDFProcessor {
  private static pdfJsLoaded = false;
  private static RMS_VERSION = '2.0';

  /**
   * Initialize PDF.js library for server-side usage
   */
  private static async initializePdfJs(): Promise<void> {
    if (this.pdfJsLoaded) return;

    try {
      // For server-side (Node.js) usage
      if (typeof window === 'undefined') {
        // Use dynamic import for Node.js
        const pdfParse = await import('pdf-parse');
        (global as any).pdfParse = pdfParse.default;
        this.pdfJsLoaded = true;
        console.log('PDF.js (server-side) initialized successfully');
        return;
      }

      // For client-side usage (fallback)
      if (!('pdfjsLib' in window)) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load PDF.js'));
          document.head.appendChild(script);
        });

        // Configure worker
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }
      
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

        const response = await fetch('/api/resumes/rms', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && result.data.hasRMSData && result.data.metadata) {
            exifRMSMetadata = result.data.metadata;
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
   * Extract text from a PDF file using server-side PDF.js
   */
  private static async extractTextFromPDF(file: File): Promise<string> {
    console.log('Extracting text from PDF using server-side processing');
    return this.extractTextWithPdfJs(file);
  }

  /**
   * Extract text from a PDF file using PDF.js (server-side or client-side)
   */
  private static async extractTextWithPdfJs(file: File): Promise<string> {
    console.log('Using PDF.js for text extraction');

    try {
      // Initialize PDF.js if needed
      await this.initializePdfJs();

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Use server-side PDF parsing if available
      if (typeof window === 'undefined' && (global as any).pdfParse) {
        console.log('Using server-side PDF parsing');
        const pdfParse = (global as any).pdfParse;
        const data = await pdfParse(buffer);
        const fullText = this.cleanExtractedText(data.text);
        console.log(`Extracted ${fullText.length} characters of text`);
        return fullText;
      }

      // Fallback to client-side PDF.js
      console.log('Using client-side PDF.js');
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
      console.log(`Extracted ${fullText.length} characters of text`);

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
      const response = await fetch('/api/resumes/parse', {
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

      await updateDoc(resumeRef, finalCleanData);
      console.log('Results saved successfully');
    } catch (error) {
      console.error('Error saving results to Firebase:', error);
      throw error;
    }
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
      Rms_schema_details: "https://github.com/rezi-io/resume-standard"
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

    // Exclude test patterns
    const isTestData = email.includes('test') || email.includes('example') || email.includes('n/a') ||
                       fullName.toLowerCase().includes('test') || fullName.toLowerCase().includes('example') ||
                       fullName === 'n/a' || fullName === '';

    console.log('RMS completeness check:', {
      hasContact,
      hasEmail,
      hasExperience,
      hasEducation,
      hasSkills,
      hasVersion,
      isTestData,
      fullName: fullName,
      email: email
    });

    // Require contact info, email, at least one section, version compliance, and not test data
    const isComplete = hasContact && hasEmail && (hasExperience || hasEducation || hasSkills) && hasVersion && !isTestData;

    console.log(`RMS data completeness: ${isComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
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
    merged.Producer = "rms_v2.0.1_merged";

    console.log('Merged RMS metadata successfully');
    return merged;
  }

  /**
   * Format extraction result to RMS format
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
      rmsData[`Rms_experience_${index}_role`] = exp.title || '';
      rmsData[`Rms_experience_${index}_dateBegin`] = exp.dates || '';
      rmsData[`Rms_experience_${index}_description`] = exp.description || '';
    });

    // Process Education with proper RMS field mapping
    const education = data.education || [];
    rmsData['Rms_education_count'] = education.length;
    education.forEach((edu, index) => {
      rmsData[`Rms_education_${index}_institution`] = edu.institution || '';
      rmsData[`Rms_education_${index}_qualification`] = edu.degree || '';
      rmsData[`Rms_education_${index}_date`] = edu.dates || '';
      rmsData[`Rms_education_${index}_description`] = edu.description || '';
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
    rmsData['Rms_schema_details'] = "https://github.com/rezi-io/resume-standard";

    return rmsData;
  }
}