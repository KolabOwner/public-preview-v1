import { PDFExtractor } from './pdf-extractor';
import { FirebaseStorageService } from './firebase-storage';
import { AIParser } from './ai-parser';
import { FileStatus } from '../types/pdf-types';

/**
 * Processing options interface
 */
export interface ProcessingOptions {
  saveToFirebase?: boolean;
  generatePdf?: boolean;
  userId: string;
  title?: string;
  validateRMS?: boolean;
}

/**
 * Processing result interface
 */
export interface ProcessingResult {
  success: boolean;
  resumeId: string;
  fileUrl?: string;
  rmsData?: any;
  error?: string;
  status: FileStatus;
  validationErrors?: any;
}

/**
 * Main PDF processor orchestrating all PDF processing operations
 */
export class PDFProcessor {
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
      PDFExtractor.validatePDFFile(file);
      
      // First, update the resume status to processing
      await FirebaseStorageService.updateResumeStatus(resumeId, FileStatus.PROCESSING);
      
      // Upload the PDF to Firebase Storage
      const fileUrl = await FirebaseStorageService.uploadPDFToStorage(file, options.userId, resumeId);
      console.log(`Uploaded PDF to: ${fileUrl}`);
      
      // Try to extract RMS metadata using ExifTool API first
      let exifRMSMetadata = null;
      try {
        console.log('Calling ExifTool API to extract RMS metadata...');
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
      if (exifRMSMetadata && AIParser.isCompleteRMSData(exifRMSMetadata)) {
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
        const pdfText = await PDFExtractor.extractTextFromPDF(file);
        console.log(`Extracted ${pdfText.length} characters of text`);
        
        if (!pdfText || pdfText.length < 100) {
          throw new Error('PDF text extraction failed or resulted in too little text');
        }
        
        // Use Gemini multimodal PDF parsing
        try {
          const pdfBuffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
          const parseResult = await AIParser.parseWithGeminiMultimodal(
            pdfBuffer, 
            options.userId, 
            options.validateRMS, 
            true
          );
          
          rmsData = parseResult.rmsData;
          validationErrors = parseResult.validationErrors;
          console.log('Parsed resume data successfully using Gemini multimodal PDF capabilities');
        } catch (geminiError) {
          console.warn('Gemini multimodal parsing failed:', geminiError);
          throw geminiError;
        }
        
        // Merge ExifTool RMS metadata with AI-parsed data if available
        if (exifRMSMetadata && rmsData) {
          console.log('Merging ExifTool RMS metadata with AI-parsed data...');
          rmsData = AIParser.mergeRMSMetadata(exifRMSMetadata, rmsData);
        }
      }
      
      // Extract title from RMS data if not provided
      const rmsFullName = rmsData.rms_contact_fullName || rmsData.Rms_contact_fullName || '';
      const title = options.title || rmsFullName || 'Untitled Resume';
      
      // Save the results to Firebase
      if (options.saveToFirebase !== false) {
        await FirebaseStorageService.saveResultsToFirebase(resumeId, {
          fileUrl,
          rmsData: rmsData,
          title,
          exifToolExtracted: !!exifRMSMetadata,
          usedRMSFastPath: exifRMSMetadata && AIParser.isCompleteRMSData(exifRMSMetadata)
        });
        console.log('Saved results to Firebase');
      }
      
      // Update the resume status to processed
      await FirebaseStorageService.updateResumeStatus(resumeId, FileStatus.PROCESSED);
      
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
      await FirebaseStorageService.updateResumeStatus(resumeId, FileStatus.ERROR, {
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
   * Create a new resume record
   */
  public static async createResume(options: {
    userId: string;
    title: string;
    initialStatus?: FileStatus;
  }): Promise<string> {
    return FirebaseStorageService.createResume(options);
  }

  /**
   * Get a resume by ID
   */
  public static async getResume(resumeId: string): Promise<any | null> {
    return FirebaseStorageService.getResume(resumeId);
  }

  /**
   * Validate RMS data
   */
  public static validateRMSData(data: any) {
    return AIParser.validateRMSData(data);
  }
}

// Export sub-modules
export { PDFExtractor };
export { FirebaseStorageService };
export { AIParser };