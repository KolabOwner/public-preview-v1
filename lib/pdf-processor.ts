// lib/pdf-processor.ts
// Production-ready PDF processing pipeline with RMS metadata standard compliance

import { collection, doc, addDoc, updateDoc, serverTimestamp, getDoc, query, where, orderBy, limit, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { z } from 'zod';
import * as pdfjsLib from 'pdfjs-dist';

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

const RMSExperienceItemSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  dateBegin: z.string().optional(),
  dateEnd: z.string().optional(),
  isCurrent: z.union([z.boolean(), z.string()]).optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional()
});

const RMSEducationItemSchema = z.object({
  institution: z.string().optional(),
  qualification: z.string().optional(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  dateBegin: z.string().optional(),
  dateEnd: z.string().optional(),
  score: z.string().optional(),
  scoreType: z.string().optional(),
  description: z.string().optional(),
  honors: z.string().optional(),
  activities: z.string().optional()
});

const RMSSkillItemSchema = z.object({
  category: z.string().optional(),
  keywords: z.string().optional(),
  level: z.string().optional()
});

const RMSProjectItemSchema = z.object({
  title: z.string().optional(),
  organization: z.string().optional(),
  date: z.string().optional(),
  dateBegin: z.string().optional(),
  dateEnd: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  technologies: z.string().optional()
});

const RMSCertificationItemSchema = z.object({
  name: z.string().optional(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional()
});

const RMSInvolvementItemSchema = z.object({
  organization: z.string().optional(),
  role: z.string().optional(),
  location: z.string().optional(),
  dateBegin: z.string().optional(),
  dateEnd: z.string().optional(),
  isCurrent: z.union([z.boolean(), z.string()]).optional(),
  description: z.string().optional()
});

const RMSCourseworkItemSchema = z.object({
  name: z.string().optional(),
  institution: z.string().optional(),
  date: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional()
});

const RMSPublicationItemSchema = z.object({
  title: z.string().optional(),
  publisher: z.string().optional(),
  authors: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
  doi: z.string().optional(),
  description: z.string().optional()
});

const RMSAwardItemSchema = z.object({
  title: z.string().optional(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional()
});

const RMSLanguageItemSchema = z.object({
  name: z.string().optional(),
  proficiency: z.string().optional()
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
 * Interface for parsed resume data
 */
export interface ParsedResumeData {
  contactInfo: {
    fullName: string;
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    location: string; // Formatted location
    linkedin: string;
    website: string;
    github: string;
    twitter: string;
    portfolio: string;
  };
  summary: string;
  objective: string;
  experiences: Array<{
    id: string;
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    responsibilities: string[];
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa: string;
    gpaScale: string;
    description: string;
    honors: string;
    activities: string;
  }>;
  skillCategories: Array<{
    id: string;
    name: string;
    skills: Array<{
      id: string;
      name: string;
      level?: string;
    }>;
  }>;
  projects: Array<{
    id: string;
    title: string;
    organization: string;
    startDate: string;
    endDate: string;
    url: string;
    description: string;
    technologies: string[];
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    credentialId: string;
    url: string;
    description: string;
  }>;
  involvements: Array<{
    id: string;
    organization: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  coursework: Array<{
    id: string;
    courseName: string;
    institution: string;
    completionDate: string;
    grade: string;
    description: string;
  }>;
  publications: Array<{
    id: string;
    title: string;
    publisher: string;
    authors: string[];
    date: string;
    url: string;
    doi: string;
    description: string;
  }>;
  awards: Array<{
    id: string;
    title: string;
    issuer: string;
    date: string;
    description: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    proficiency: string;
  }>;
  metadata: {
    parseTime: number;
    parseDate: string;
    model: string;
    rmsVersion: string;
  };
}

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
  parsedData?: ParsedResumeData;
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

      // Extract text from the PDF
      const pdfText = await this.extractTextFromPDF(file);
      console.log(`Extracted ${pdfText.length} characters of text`);

      if (!pdfText || pdfText.length < 100) {
        throw new Error('PDF text extraction failed or resulted in too little text');
      }

      // Parse the resume using the API
      const { parsedData, rmsData, validationErrors } = await this.parseResumeText(
        pdfText,
        options.userId,
        options.validateRMS
      );
      console.log('Parsed resume data successfully');

      // If title wasn't provided, use the parsed name as title
      const title = options.title || parsedData.contactInfo.fullName || 'Untitled Resume';

      // Save the results to Firebase
      if (options.saveToFirebase !== false) {
        await this.saveResultsToFirebase(resumeId, {
          fileUrl,
          parsedData,
          rmsData,
          title
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
        parsedData,
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
   * Process multiple PDF files in batch
   */
  public static async processBatch(
    options: BatchProcessingOptions
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    const total = options.files.length;

    console.log(`Starting batch processing of ${total} files`);

    for (let i = 0; i < options.files.length; i++) {
      const file = options.files[i];

      // Notify progress
      if (options.onProgress) {
        options.onProgress(i + 1, total, file.name);
      }

      try {
        // Create resume record
        const resumeId = await this.createResume({
          userId: options.userId,
          title: file.name
        });

        // Process the file
        const result = await this.processPDF(file, resumeId, {
          userId: options.userId,
          saveToFirebase: true,
          validateRMS: options.validateRMS
        });

        results.push(result);
      } catch (error: any) {
        console.error(`Error processing file ${file.name}:`, error);

        const errorResult: ProcessingResult = {
          success: false,
          resumeId: '',
          error: error.message || 'Unknown error occurred',
          status: FileStatus.ERROR
        };

        results.push(errorResult);

        // Stop processing if continueOnError is false
        if (!options.continueOnError) {
          break;
        }
      }
    }

    console.log(`Batch processing completed. Success: ${results.filter(r => r.success).length}/${total}`);
    return results;
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
   * Get all resumes for a user
   */
  public static async getUserResumes(
    userId: string,
    limitCount: number = 50
  ): Promise<any[]> {
    try {
      const resumesQuery = query(
        collection(db, 'resumes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(resumesQuery);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user resumes:', error);
      throw error;
    }
  }

  /**
   * Delete a resume and its associated storage file
   */
  public static async deleteResume(resumeId: string): Promise<void> {
    try {
      // Get the resume document
      const resume = await this.getResume(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }

      // Delete the storage file if it exists
      if (resume.fileUrl) {
        try {
          const storageRef = ref(storage, resume.fileUrl);
          await deleteObject(storageRef);
          console.log('Deleted storage file');
        } catch (error) {
          console.error('Error deleting storage file:', error);
          // Continue with document deletion even if storage deletion fails
        }
      }

      // Delete the Firestore document
      await deleteDoc(doc(db, 'resumes', resumeId));
      console.log(`Deleted resume ${resumeId}`);
    } catch (error) {
      console.error('Error deleting resume:', error);
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
      const response = await fetch('/api/resume/extract', {
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
   * Fallback method to extract text without worker
   */
  private static async extractTextWithoutWorker(file: File): Promise<string> {
    console.log('Attempting PDF text extraction without worker (fallback mode)');

    try {
      const pdfJS = await import('pdfjs-dist');

      // Disable worker entirely
      pdfJS.GlobalWorkerOptions.workerSrc = '';

      const arrayBuffer = await file.arrayBuffer();

      const loadingTask = pdfJS.getDocument({
        data: arrayBuffer,
        disableWorker: true, // Force disable worker
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ');

          fullText += pageText + '\n\n';
        } catch (pageError) {
          console.error(`Error processing page ${i} in fallback mode:`, pageError);
          continue;
        }
      }

      fullText = fullText.trim();

      if (!fullText || fullText.length < 50) {
        throw new Error('Unable to extract text from PDF in fallback mode');
      }

      console.log(`Fallback extraction complete. Extracted ${fullText.length} characters`);
      return fullText;
    } catch (error) {
      console.error('Fallback extraction failed:', error);
      throw new Error('Unable to extract text from PDF. The file may be corrupted, password-protected, or contain only images.');
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
    parsedData: ParsedResumeData;
    rmsData: any;
    validationErrors?: z.ZodError;
  }> {
    try {
      console.log('Calling resume parsing API...');

      const response = await fetch('/api/resume/parse', {
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
      let validationErrors: z.ZodError | undefined;
      if (validateRMS) {
        const validation = this.validateRMSData(result.data);
        if (!validation.success) {
          validationErrors = validation.error;
          console.warn('RMS validation errors:', validationErrors.errors);
        }
      }

      // Convert the RMS data to our ParsedResumeData format
      const parsedData = this.convertRMSDataToParsedData(result.data, {
        parseTime: result.parseTime,
        model: result.model,
        timestamp: result.timestamp
      });

      return { parsedData, rmsData: result.data, validationErrors };
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
      parsedData: ParsedResumeData;
      rmsData?: any;
      title: string;
    }
  ): Promise<void> {
    try {
      console.log(`Saving processing results to Firebase for resume ${resumeId}`);

      const resumeRef = doc(db, 'resumes', resumeId);

      await updateDoc(resumeRef, {
        fileUrl: data.fileUrl,
        parsedData: data.parsedData,
        rmsRawData: data.rmsData || null,
        title: data.title,
        updatedAt: serverTimestamp(),
        status: FileStatus.PROCESSED,
        processingCompleted: new Date().toISOString(),
        rmsVersion: this.RMS_VERSION
      });

      console.log('Results saved successfully');
    } catch (error) {
      console.error('Error saving results to Firebase:', error);
      throw error;
    }
  }

  /**
   * Convert RMS data format to our parsed data format
   */
  private static convertRMSDataToParsedData(
    rmsData: any,
    metadata: { parseTime: number; model: string; timestamp: string }
  ): ParsedResumeData {
    console.log('Converting RMS data to parsed data format');

    // Create a parsed data object with our structure
    const parsedData: ParsedResumeData = {
      contactInfo: {
        fullName: this.getStringValue(rmsData.rms_contact_fullName),
        firstName: this.getStringValue(rmsData.rms_contact_firstName),
        lastName: this.getStringValue(rmsData.rms_contact_lastName),
        middleName: this.getStringValue(rmsData.rms_contact_middleName),
        email: this.getStringValue(rmsData.rms_contact_email),
        phone: this.getStringValue(rmsData.rms_contact_phone),
        address: this.getStringValue(rmsData.rms_contact_address),
        city: this.getStringValue(rmsData.rms_contact_city),
        state: this.getStringValue(rmsData.rms_contact_state),
        zip: this.getStringValue(rmsData.rms_contact_zip),
        country: this.getStringValue(rmsData.rms_contact_country),
        location: this.formatLocation(
          rmsData.rms_contact_city,
          rmsData.rms_contact_state,
          rmsData.rms_contact_country
        ),
        linkedin: this.getStringValue(rmsData.rms_contact_linkedin),
        website: this.getStringValue(rmsData.rms_contact_website),
        github: this.getStringValue(rmsData.rms_contact_github),
        twitter: this.getStringValue(rmsData.rms_contact_twitter),
        portfolio: this.getStringValue(rmsData.rms_contact_portfolio)
      },
      summary: this.getStringValue(rmsData.rms_summary),
      objective: this.getStringValue(rmsData.rms_objective),
      experiences: [],
      education: [],
      skillCategories: [],
      projects: [],
      certifications: [],
      involvements: [],
      coursework: [],
      publications: [],
      awards: [],
      languages: [],
      metadata: {
        parseTime: metadata.parseTime,
        parseDate: metadata.timestamp,
        model: metadata.model,
        rmsVersion: this.RMS_VERSION
      }
    };

    // Extract experiences
    const experienceCount = parseInt(this.getStringValue(rmsData.rms_experience_count, '0'));
    for (let i = 0; i < experienceCount; i++) {
      const prefix = `rms_experience_${i}`;
      const responsibilities = this.parseDelimitedList(rmsData[`${prefix}_responsibilities`]);

      const experience = {
        id: `exp_${i}`,
        company: this.getStringValue(rmsData[`${prefix}_company`]),
        title: this.getStringValue(rmsData[`${prefix}_role`]),
        location: this.getStringValue(rmsData[`${prefix}_location`]),
        startDate: this.getStringValue(rmsData[`${prefix}_dateBegin`]),
        endDate: this.getStringValue(rmsData[`${prefix}_dateEnd`]),
        current: this.getBooleanValue(rmsData[`${prefix}_isCurrent`]),
        description: this.getStringValue(rmsData[`${prefix}_description`]),
        responsibilities
      };

      parsedData.experiences.push(experience);
    }

    // Extract education
    const educationCount = parseInt(this.getStringValue(rmsData.rms_education_count, '0'));
    for (let i = 0; i < educationCount; i++) {
      const prefix = `rms_education_${i}`;

      // Handle both separate degree/fieldOfStudy and combined qualification field
      let degree = this.getStringValue(rmsData[`${prefix}_degree`]);
      let fieldOfStudy = this.getStringValue(rmsData[`${prefix}_fieldOfStudy`]);

      if (!degree && !fieldOfStudy) {
        const qualification = this.getStringValue(rmsData[`${prefix}_qualification`]);
        const parsed = this.parseDegreeAndField(qualification);
        degree = parsed.degree;
        fieldOfStudy = parsed.fieldOfStudy;
      }

      const education = {
        id: `edu_${i}`,
        school: this.getStringValue(rmsData[`${prefix}_institution`]),
        degree,
        fieldOfStudy,
        location: this.getStringValue(rmsData[`${prefix}_location`]),
        startDate: this.getStringValue(rmsData[`${prefix}_dateBegin`]),
        endDate: this.getStringValue(rmsData[`${prefix}_dateEnd`] || rmsData[`${prefix}_date`]),
        current: this.getBooleanValue(rmsData[`${prefix}_isCurrent`]),
        gpa: this.getStringValue(rmsData[`${prefix}_score`]),
        gpaScale: this.getStringValue(rmsData[`${prefix}_scoreType`]),
        description: this.getStringValue(rmsData[`${prefix}_description`]),
        honors: this.getStringValue(rmsData[`${prefix}_honors`]),
        activities: this.getStringValue(rmsData[`${prefix}_activities`])
      };

      parsedData.education.push(education);
    }

    // Extract skills
    const skillCount = parseInt(this.getStringValue(rmsData.rms_skill_count, '0'));
    const skillCategoryMap = new Map<string, Array<{ id: string; name: string; level?: string }>>();

    for (let i = 0; i < skillCount; i++) {
      const prefix = `rms_skill_${i}`;
      const category = this.getStringValue(rmsData[`${prefix}_category`], 'Skills');
      const keywords = this.getStringValue(rmsData[`${prefix}_keywords`], '');
      const level = this.getStringValue(rmsData[`${prefix}_level`]);

      // Split comma-separated keywords into individual skills
      const skillsArray = keywords.split(',')
        .map((s, idx) => ({
          id: `skill_${i}_${idx}`,
          name: s.trim(),
          level: level || ''
        }))
        .filter(s => s.name);

      if (skillsArray.length > 0) {
        if (skillCategoryMap.has(category)) {
          skillCategoryMap.get(category)?.push(...skillsArray);
        } else {
          skillCategoryMap.set(category, skillsArray);
        }
      }
    }

    // Convert skill category map to array
    let categoryIdx = 0;
    for (const [categoryName, skills] of skillCategoryMap.entries()) {
      if (skills.length > 0) {
        parsedData.skillCategories.push({
          id: `category_${categoryIdx}`,
          name: categoryName,
          skills
        });
        categoryIdx++;
      }
    }

    // Extract projects
    const projectCount = parseInt(this.getStringValue(rmsData.rms_project_count, '0'));
    for (let i = 0; i < projectCount; i++) {
      const prefix = `rms_project_${i}`;
      const technologies = this.parseDelimitedList(rmsData[`${prefix}_technologies`]);

      const project = {
        id: `proj_${i}`,
        title: this.getStringValue(rmsData[`${prefix}_title`]),
        organization: this.getStringValue(rmsData[`${prefix}_organization`]),
        startDate: this.getStringValue(rmsData[`${prefix}_dateBegin`]),
        endDate: this.getStringValue(rmsData[`${prefix}_dateEnd`] || rmsData[`${prefix}_date`]),
        url: this.getStringValue(rmsData[`${prefix}_url`]),
        description: this.getStringValue(rmsData[`${prefix}_description`]),
        technologies
      };

      parsedData.projects.push(project);
    }

    // Extract certifications
    const certificationCount = parseInt(this.getStringValue(rmsData.rms_certification_count, '0'));
    for (let i = 0; i < certificationCount; i++) {
      const prefix = `rms_certification_${i}`;

      const certification = {
        id: `cert_${i}`,
        name: this.getStringValue(rmsData[`${prefix}_name`]),
        issuer: this.getStringValue(rmsData[`${prefix}_issuer`]),
        issueDate: this.getStringValue(rmsData[`${prefix}_date`]),
        expiryDate: this.getStringValue(rmsData[`${prefix}_expiryDate`]),
        credentialId: this.getStringValue(rmsData[`${prefix}_credentialId`]),
        url: this.getStringValue(rmsData[`${prefix}_url`]),
        description: this.getStringValue(rmsData[`${prefix}_description`])
      };

      parsedData.certifications.push(certification);
    }

    // Extract involvements
    const involvementCount = parseInt(this.getStringValue(rmsData.rms_involvement_count, '0'));
    for (let i = 0; i < involvementCount; i++) {
      const prefix = `rms_involvement_${i}`;

      const involvement = {
        id: `inv_${i}`,
        organization: this.getStringValue(rmsData[`${prefix}_organization`]),
        role: this.getStringValue(rmsData[`${prefix}_role`]),
        location: this.getStringValue(rmsData[`${prefix}_location`]),
        startDate: this.getStringValue(rmsData[`${prefix}_dateBegin`]),
        endDate: this.getStringValue(rmsData[`${prefix}_dateEnd`]),
        current: this.getBooleanValue(rmsData[`${prefix}_isCurrent`]),
        description: this.getStringValue(rmsData[`${prefix}_description`])
      };

      parsedData.involvements.push(involvement);
    }

    // Extract coursework
    const courseworkCount = parseInt(this.getStringValue(rmsData.rms_coursework_count, '0'));
    for (let i = 0; i < courseworkCount; i++) {
      const prefix = `rms_coursework_${i}`;

      const coursework = {
        id: `course_${i}`,
        courseName: this.getStringValue(rmsData[`${prefix}_name`]),
        institution: this.getStringValue(rmsData[`${prefix}_institution`]),
        completionDate: this.getStringValue(rmsData[`${prefix}_date`]),
        grade: this.getStringValue(rmsData[`${prefix}_grade`]),
        description: this.getStringValue(rmsData[`${prefix}_description`])
      };

      parsedData.coursework.push(coursework);
    }

    // Extract publications
    const publicationCount = parseInt(this.getStringValue(rmsData.rms_publication_count, '0'));
    for (let i = 0; i < publicationCount; i++) {
      const prefix = `rms_publication_${i}`;
      const authors = this.parseDelimitedList(rmsData[`${prefix}_authors`]);

      const publication = {
        id: `pub_${i}`,
        title: this.getStringValue(rmsData[`${prefix}_title`]),
        publisher: this.getStringValue(rmsData[`${prefix}_publisher`]),
        authors,
        date: this.getStringValue(rmsData[`${prefix}_date`]),
        url: this.getStringValue(rmsData[`${prefix}_url`]),
        doi: this.getStringValue(rmsData[`${prefix}_doi`]),
        description: this.getStringValue(rmsData[`${prefix}_description`])
      };

      parsedData.publications.push(publication);
    }

    // Extract awards
    const awardCount = parseInt(this.getStringValue(rmsData.rms_award_count, '0'));
    for (let i = 0; i < awardCount; i++) {
      const prefix = `rms_award_${i}`;

      const award = {
        id: `award_${i}`,
        title: this.getStringValue(rmsData[`${prefix}_title`]),
        issuer: this.getStringValue(rmsData[`${prefix}_issuer`]),
        date: this.getStringValue(rmsData[`${prefix}_date`]),
        description: this.getStringValue(rmsData[`${prefix}_description`])
      };

      parsedData.awards.push(award);
    }

    // Extract languages
    const languageCount = parseInt(this.getStringValue(rmsData.rms_language_count, '0'));
    for (let i = 0; i < languageCount; i++) {
      const prefix = `rms_language_${i}`;

      const language = {
        id: `lang_${i}`,
        name: this.getStringValue(rmsData[`${prefix}_name`]),
        proficiency: this.getStringValue(rmsData[`${prefix}_proficiency`])
      };

      parsedData.languages.push(language);
    }

    console.log('Successfully converted RMS data to parsed format');
    return parsedData;
  }

  /**
   * Get a string value from RMS data with a default value if not present
   */
  private static getStringValue(value: any, defaultValue: string = ''): string {
    if (value === undefined || value === null) return defaultValue;
    return String(value).replace('n/a', '').trim() || defaultValue;
  }

  /**
   * Get a boolean value from RMS data
   */
  private static getBooleanValue(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
    }
    return false;
  }

  /**
   * Parse a delimited list (comma, semicolon, or pipe separated)
   */
  private static parseDelimitedList(value: any): string[] {
    if (!value) return [];

    const str = this.getStringValue(value);
    if (!str) return [];

    // Try different delimiters
    const delimiters = [',', ';', '|'];
    let result: string[] = [];

    for (const delimiter of delimiters) {
      if (str.includes(delimiter)) {
        result = str.split(delimiter).map(s => s.trim()).filter(Boolean);
        break;
      }
    }

    // If no delimiter found, treat as single item
    if (result.length === 0 && str) {
      result = [str];
    }

    return result;
  }

  /**
   * Format location from city, state, and country
   */
  private static formatLocation(city?: any, state?: any, country?: any): string {
    const cityStr = this.getStringValue(city);
    const stateStr = this.getStringValue(state);
    const countryStr = this.getStringValue(country);

    const parts = [cityStr, stateStr, countryStr].filter(Boolean);
    return parts.join(', ');
  }

  /**
   * Parse degree and field of study from qualification field
   */
  private static parseDegreeAndField(qualification: string): {
    degree: string;
    fieldOfStudy: string
  } {
    if (!qualification) {
      return { degree: '', fieldOfStudy: '' };
    }

    // Common degree patterns
    const degreePatterns = [
      /\b(Bachelor|Master|Ph\.?D|Doctorate|MBA|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Associate|JD|MD|DDS|LLB|LLM)['']?s?\s+(of|in)\s+([A-Za-z\s]+)/i,
      /\b(B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Ph\.?D)\s+([A-Za-z\s]+)/i,
      /\b(Bachelor|Master|Doctor|Associate)\s+Degree\s+(of|in)\s+([A-Za-z\s]+)/i
    ];

    for (const pattern of degreePatterns) {
      const match = qualification.match(pattern);
      if (match) {
        // Group 1 is the degree type, group 3 (or 2 for some patterns) is the field
        const degreeType = match[1];
        const field = match[3] || match[2] || '';
        return {
          degree: degreeType,
          fieldOfStudy: field.trim()
        };
      }
    }

    // If no pattern matches, just return the full qualification as the degree
    return {
      degree: qualification,
      fieldOfStudy: ''
    };
  }

  /**
   * Export parsed resume data to JSON
   */
  public static exportToJSON(parsedData: ParsedResumeData): string {
    return JSON.stringify(parsedData, null, 2);
  }

  /**
   * Export parsed resume data to a formatted text file
   */
  public static exportToText(parsedData: ParsedResumeData): string {
    let text = '';

    // Contact Information
    text += '=== CONTACT INFORMATION ===\n';
    text += `Name: ${parsedData.contactInfo.fullName}\n`;
    if (parsedData.contactInfo.email) text += `Email: ${parsedData.contactInfo.email}\n`;
    if (parsedData.contactInfo.phone) text += `Phone: ${parsedData.contactInfo.phone}\n`;
    if (parsedData.contactInfo.address) text += `Address: ${parsedData.contactInfo.address}\n`;
    if (parsedData.contactInfo.location) text += `Location: ${parsedData.contactInfo.location}\n`;
    if (parsedData.contactInfo.linkedin) text += `LinkedIn: ${parsedData.contactInfo.linkedin}\n`;
    if (parsedData.contactInfo.website) text += `Website: ${parsedData.contactInfo.website}\n`;
    if (parsedData.contactInfo.github) text += `GitHub: ${parsedData.contactInfo.github}\n`;

    // Summary & Objective
    if (parsedData.summary) {
      text += '\n=== SUMMARY ===\n';
      text += parsedData.summary + '\n';
    }

    if (parsedData.objective) {
      text += '\n=== OBJECTIVE ===\n';
      text += parsedData.objective + '\n';
    }

    // Experience
    if (parsedData.experiences.length > 0) {
      text += '\n=== EXPERIENCE ===\n';
      parsedData.experiences.forEach((exp, index) => {
        if (index > 0) text += '\n';
        text += `${exp.title} at ${exp.company}\n`;
        text += `${exp.location} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n`;
        if (exp.description) text += `${exp.description}\n`;
        if (exp.responsibilities.length > 0) {
          text += 'Responsibilities:\n';
          exp.responsibilities.forEach(resp => text += `• ${resp}\n`);
        }
      });
    }

    // Education
    if (parsedData.education.length > 0) {
      text += '\n=== EDUCATION ===\n';
      parsedData.education.forEach((edu, index) => {
        if (index > 0) text += '\n';
        text += `${edu.school}\n`;
        text += `${edu.degree}${edu.fieldOfStudy ? ' in ' + edu.fieldOfStudy : ''}\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}${edu.gpaScale ? '/' + edu.gpaScale : ''}\n`;
        if (edu.honors) text += `Honors: ${edu.honors}\n`;
        if (edu.activities) text += `Activities: ${edu.activities}\n`;
        if (edu.description) text += `${edu.description}\n`;
      });
    }

    // Skills
    if (parsedData.skillCategories.length > 0) {
      text += '\n=== SKILLS ===\n';
      parsedData.skillCategories.forEach(category => {
        text += `${category.name}: `;
        text += category.skills.map(skill => skill.name + (skill.level ? ` (${skill.level})` : '')).join(', ') + '\n';
      });
    }

    // Projects
    if (parsedData.projects.length > 0) {
      text += '\n=== PROJECTS ===\n';
      parsedData.projects.forEach((project, index) => {
        if (index > 0) text += '\n';
        text += `${project.title}`;
        if (project.organization) text += ` (${project.organization})`;
        text += '\n';
        if (project.url) text += `URL: ${project.url}\n`;
        if (project.technologies.length > 0) {
          text += `Technologies: ${project.technologies.join(', ')}\n`;
        }
        text += `${project.description}\n`;
      });
    }

    // Certifications
    if (parsedData.certifications.length > 0) {
      text += '\n=== CERTIFICATIONS ===\n';
      parsedData.certifications.forEach((cert, index) => {
        if (index > 0) text += '\n';
        text += `${cert.name}\n`;
        text += `Issued by: ${cert.issuer}\n`;
        text += `Date: ${cert.issueDate}`;
        if (cert.expiryDate) text += ` - Expires: ${cert.expiryDate}`;
        text += '\n';
        if (cert.credentialId) text += `Credential ID: ${cert.credentialId}\n`;
        if (cert.url) text += `URL: ${cert.url}\n`;
        if (cert.description) text += `${cert.description}\n`;
      });
    }

    // Involvements
    if (parsedData.involvements.length > 0) {
      text += '\n=== INVOLVEMENTS & ACTIVITIES ===\n';
      parsedData.involvements.forEach((inv, index) => {
        if (index > 0) text += '\n';
        text += `${inv.role} at ${inv.organization}\n`;
        text += `${inv.location} | ${inv.startDate} - ${inv.current ? 'Present' : inv.endDate}\n`;
        if (inv.description) text += `${inv.description}\n`;
      });
    }

    // Coursework
    if (parsedData.coursework.length > 0) {
      text += '\n=== RELEVANT COURSEWORK ===\n';
      parsedData.coursework.forEach((course, index) => {
        if (index > 0) text += '\n';
        text += `${course.courseName}`;
        if (course.institution) text += ` (${course.institution})`;
        text += '\n';
        if (course.grade) text += `Grade: ${course.grade}\n`;
        if (course.description) text += `${course.description}\n`;
      });
    }

    // Publications
    if (parsedData.publications.length > 0) {
      text += '\n=== PUBLICATIONS ===\n';
      parsedData.publications.forEach((pub, index) => {
        if (index > 0) text += '\n';
        text += `"${pub.title}"\n`;
        if (pub.authors.length > 0) text += `Authors: ${pub.authors.join(', ')}\n`;
        text += `Published in: ${pub.publisher} (${pub.date})\n`;
        if (pub.doi) text += `DOI: ${pub.doi}\n`;
        if (pub.url) text += `URL: ${pub.url}\n`;
        if (pub.description) text += `${pub.description}\n`;
      });
    }

    // Awards
    if (parsedData.awards.length > 0) {
      text += '\n=== AWARDS & HONORS ===\n';
      parsedData.awards.forEach((award, index) => {
        if (index > 0) text += '\n';
        text += `${award.title}\n`;
        text += `Issued by: ${award.issuer} (${award.date})\n`;
        if (award.description) text += `${award.description}\n`;
      });
    }

    // Languages
    if (parsedData.languages.length > 0) {
      text += '\n=== LANGUAGES ===\n';
      parsedData.languages.forEach(lang => {
        text += `${lang.name}: ${lang.proficiency}\n`;
      });
    }

    // Metadata
    text += '\n=== PARSING METADATA ===\n';
    text += `Parsed on: ${parsedData.metadata.parseDate}\n`;
    text += `Parse time: ${parsedData.metadata.parseTime}ms\n`;
    text += `Model: ${parsedData.metadata.model}\n`;
    text += `RMS Version: ${parsedData.metadata.rmsVersion}\n`;

    return text;
  }

  /**
   * Export parsed resume data to RMS-compliant format
   */
  public static exportToRMSFormat(parsedData: ParsedResumeData): RMSMetadata {
    const rmsData: any = {
      // Contact Information
      rms_contact_fullName: parsedData.contactInfo.fullName,
      rms_contact_firstName: parsedData.contactInfo.firstName,
      rms_contact_lastName: parsedData.contactInfo.lastName,
      rms_contact_middleName: parsedData.contactInfo.middleName,
      rms_contact_email: parsedData.contactInfo.email,
      rms_contact_phone: parsedData.contactInfo.phone,
      rms_contact_address: parsedData.contactInfo.address,
      rms_contact_city: parsedData.contactInfo.city,
      rms_contact_state: parsedData.contactInfo.state,
      rms_contact_zip: parsedData.contactInfo.zip,
      rms_contact_country: parsedData.contactInfo.country,
      rms_contact_linkedin: parsedData.contactInfo.linkedin,
      rms_contact_website: parsedData.contactInfo.website,
      rms_contact_github: parsedData.contactInfo.github,
      rms_contact_twitter: parsedData.contactInfo.twitter,
      rms_contact_portfolio: parsedData.contactInfo.portfolio,

      // Summary & Objective
      rms_summary: parsedData.summary,
      rms_objective: parsedData.objective,

      // Counts
      rms_experience_count: parsedData.experiences.length,
      rms_education_count: parsedData.education.length,
      rms_skill_count: parsedData.skillCategories.length,
      rms_project_count: parsedData.projects.length,
      rms_certification_count: parsedData.certifications.length,
      rms_involvement_count: parsedData.involvements.length,
      rms_coursework_count: parsedData.coursework.length,
      rms_publication_count: parsedData.publications.length,
      rms_award_count: parsedData.awards.length,
      rms_language_count: parsedData.languages.length
    };

    // Add experiences
    parsedData.experiences.forEach((exp, i) => {
      const prefix = `rms_experience_${i}`;
      rmsData[`${prefix}_company`] = exp.company;
      rmsData[`${prefix}_role`] = exp.title;
      rmsData[`${prefix}_location`] = exp.location;
      rmsData[`${prefix}_dateBegin`] = exp.startDate;
      rmsData[`${prefix}_dateEnd`] = exp.endDate;
      rmsData[`${prefix}_isCurrent`] = exp.current;
      rmsData[`${prefix}_description`] = exp.description;
      rmsData[`${prefix}_responsibilities`] = exp.responsibilities.join('; ');
    });

    // Add education entries
    parsedData.education.forEach((edu, i) => {
      const prefix = `rms_education_${i}`;
      rmsData[`${prefix}_institution`] = edu.school;
      rmsData[`${prefix}_degree`] = edu.degree;
      rmsData[`${prefix}_fieldOfStudy`] = edu.fieldOfStudy;
      rmsData[`${prefix}_qualification`] = `${edu.degree}${edu.fieldOfStudy ? ' in ' + edu.fieldOfStudy : ''}`;
      rmsData[`${prefix}_location`] = edu.location;
      rmsData[`${prefix}_dateBegin`] = edu.startDate;
      rmsData[`${prefix}_dateEnd`] = edu.endDate;
      rmsData[`${prefix}_date`] = edu.endDate;
      rmsData[`${prefix}_isCurrent`] = edu.current;
      rmsData[`${prefix}_score`] = edu.gpa;
      rmsData[`${prefix}_scoreType`] = edu.gpaScale;
      rmsData[`${prefix}_description`] = edu.description;
      rmsData[`${prefix}_honors`] = edu.honors;
      rmsData[`${prefix}_activities`] = edu.activities;
    });

    // Add other sections similarly...

    return rmsData as RMSMetadata;
  }
}