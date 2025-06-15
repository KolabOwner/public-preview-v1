// lib/genkit/pdf-parser.ts
// Optimized PDF parser for resume analysis with GenKit and ExifTool integration

import pdf from 'pdf-parse';
import { z } from 'zod';
import { FILE_LIMITS } from '@/lib/constants';
import { randomBytes } from 'crypto';
import { RMSMetadataSchema, type RMSMetadata } from './schemas/ats-analysis';

// Dynamic imports for Node.js specific modules
let execFileAsync: any;
let writeFile: any;
let unlink: any;
let tmpdir: any;
let join: any;

// Only load Node.js modules on server side
if (typeof window === 'undefined') {
  const { execFile } = require('child_process');
  const { promisify } = require('util');
  const fs = require('fs/promises');
  const os = require('os');
  const path = require('path');
  
  execFileAsync = promisify(execFile);
  writeFile = fs.writeFile;
  unlink = fs.unlink;
  tmpdir = os.tmpdir;
  join = path.join;
}

// PDF Parsing Options Schema
export const PDFParsingOptionsSchema = z.object({
  maxPages: z.number().default(FILE_LIMITS.MAX_PDF_PAGES),
  pageDelimiter: z.string().default('\n\n'),
  preserveFormatting: z.boolean().default(true),
  extractMetadata: z.boolean().default(true),
  extractRMSMetadata: z.boolean().default(true),
  ocrEnabled: z.boolean().default(false),
  timeout: z.number().default(FILE_LIMITS.PDF_PARSE_TIMEOUT_MS),
  exiftoolPath: z.string().default('C:\\Users\\ashto\\OneDrive\\ExifTool\\exiftool.exe'),
  exiftoolConfigPath: z.string().default('./config/exiftool/rms-config.pl'),
});

export type PDFParsingOptions = z.infer<typeof PDFParsingOptionsSchema>;

// PDF Metadata Schema
export const PDFMetadataSchema = z.object({
  pageCount: z.number(),
  wordCount: z.number(),
  characterCount: z.number(),
  author: z.string().optional(),
  title: z.string().optional(),
  subject: z.string().optional(),
  keywords: z.string().optional(),
  creator: z.string().optional(),
  producer: z.string().optional(),
  creationDate: z.string().optional(),
  modificationDate: z.string().optional(),
  isEncrypted: z.boolean(),
  isLinearized: z.boolean(),
  pdfVersion: z.string(),
});

export type PDFMetadata = z.infer<typeof PDFMetadataSchema>;

// Parsed PDF Result Schema
export const ParsedPDFResultSchema = z.object({
  text: z.string(),
  pages: z.array(z.object({
    pageNumber: z.number(),
    text: z.string(),
    wordCount: z.number(),
  })),
  metadata: PDFMetadataSchema,
  rmsMetadata: RMSMetadataSchema.optional(),
  parseTime: z.number(),
  warnings: z.array(z.string()),
});

export type ParsedPDFResult = z.infer<typeof ParsedPDFResultSchema>;

/**
 * Enhanced PDF parser with ExifTool integration for RMS metadata
 */
export class OptimizedPDFParser {
  private readonly options: PDFParsingOptions;

  constructor(options: Partial<PDFParsingOptions> = {}) {
    this.options = PDFParsingOptionsSchema.parse(options);
  }

  /**
   * Extract RMS metadata using ExifTool
   */
  private async extractRMSMetadata(pdfPath: string): Promise<RMSMetadata | undefined> {
    try {
      const { stdout } = await execFileAsync(
        this.options.exiftoolPath,
        [
          '-config', this.options.exiftoolConfigPath,
          '-j', // JSON output
          '-XMP-rms:all', // Extract all RMS metadata
          '-PDF:all', // Extract PDF metadata
          '-b', // Binary output
          pdfPath
        ],
        {
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          timeout: 30000, // 30 second timeout
        }
      );

      const metadata = JSON.parse(stdout)[0] || {};
      
      // Transform ExifTool output to match our schema
      const rmsData: any = {};
      
      // Extract RMS fields
      Object.keys(metadata).forEach(key => {
        if (key.startsWith('RMS') || key.includes('rms_')) {
          // Convert ExifTool field names to our schema format
          const fieldName = key.replace('RMS', 'rms_').replace(/-/g, '_').toLowerCase();
          rmsData[fieldName] = metadata[key];
        }
      });

      // Also extract standard PDF fields
      if (metadata.Producer) rmsData.producer = metadata.Producer;
      
      // Parse numeric counts
      const countFields = [
        'rms_experience_count',
        'rms_education_count',
        'rms_skill_count',
        'rms_project_count',
        'rms_involvement_count',
        'rms_certification_count',
        'rms_award_count',
        'rms_publication_count',
        'rms_reference_count',
        'rms_coursework_count'
      ];
      
      countFields.forEach(field => {
        if (rmsData[field]) {
          rmsData[field] = parseInt(rmsData[field], 10);
        }
      });

      // Validate against schema
      const validated = RMSMetadataSchema.safeParse(rmsData);
      
      if (validated.success) {
        console.info('Successfully extracted RMS metadata');
        return validated.data;
      } else {
        console.warn('RMS metadata validation failed:', validated.error);
        return undefined;
      }
      
    } catch (error) {
      logger.error('ExifTool extraction error:', error);
      return undefined;
    }
  }

  /**
   * Parse PDF from buffer with enhanced text extraction
   */
  async parseFromBuffer(buffer: Buffer): Promise<ParsedPDFResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    let tempFilePath: string | undefined;
    let rmsMetadata: RMSMetadata | undefined;

    try {
      // Validate buffer size
      if (buffer.length > FILE_LIMITS.MAX_PDF_SIZE_BYTES) {
        throw new Error(`PDF size exceeds maximum allowed size of ${FILE_LIMITS.MAX_PDF_SIZE_MB}MB`);
      }

      // If RMS metadata extraction is enabled, save buffer to temp file
      if (this.options.extractRMSMetadata) {
        const tempFileName = `temp_${randomBytes(16).toString('hex')}.pdf`;
        tempFilePath = join(tmpdir(), tempFileName);
        await writeFile(tempFilePath, buffer);
        
        // Extract RMS metadata
        rmsMetadata = await this.extractRMSMetadata(tempFilePath);
      }

      // Parse PDF with timeout
      const parsePromise = pdf(buffer, {
        max: this.options.maxPages,
        version: 'v2.0.550',
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PDF parsing timeout')), this.options.timeout);
      });

      const data = await Promise.race([parsePromise, timeoutPromise]) as any;

      // Extract and clean text
      const cleanedText = this.cleanText(data.text);
      const pages = this.extractPages(data);
      
      // Extract metadata
      const metadata = this.extractMetadata(data, cleanedText);

      // Check for common issues
      if (cleanedText.length < FILE_LIMITS.MIN_TEXT_LENGTH) {
        warnings.push('Resume text is very short. It may not contain enough information.');
      }

      if (data.numpages > 3) {
        warnings.push('Resume is longer than 3 pages. Consider condensing for better ATS compatibility.');
      }

      const parseTime = Date.now() - startTime;
      logger.info(`PDF parsed successfully in ${parseTime}ms`);

      return ParsedPDFResultSchema.parse({
        text: cleanedText,
        pages,
        metadata,
        rmsMetadata,
        parseTime,
        warnings,
      });

    } catch (error) {
      logger.error('PDF parsing error:', error);
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clean up temp file
      if (tempFilePath) {
        try {
          await unlink(tempFilePath);
        } catch (e) {
          logger.warn('Failed to delete temp file:', e);
        }
      }
    }
  }

  /**
   * Parse PDF from base64 data URI
   */
  async parseFromDataURI(dataURI: string): Promise<ParsedPDFResult> {
    try {
      // Extract base64 data from data URI
      const base64Match = dataURI.match(/^data:application\/pdf;base64,(.+)$/);
      if (!base64Match) {
        throw new Error('Invalid PDF data URI format');
      }

      const buffer = Buffer.from(base64Match[1], 'base64');
      return await this.parseFromBuffer(buffer);
    } catch (error) {
      logger.error('Data URI parsing error:', error);
      throw new Error(`Failed to parse data URI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse PDF from file path (with direct ExifTool integration)
   */
  async parseFromFile(filePath: string): Promise<ParsedPDFResult> {
    try {
      const { readFile } = await import('fs/promises');
      const buffer = await readFile(filePath);
      
      // Get RMS metadata directly from file
      const rmsMetadata = await this.extractRMSMetadata(filePath);
      
      const result = await this.parseFromBuffer(buffer);
      
      // Override RMS metadata if we got it directly from file
      if (rmsMetadata) {
        result.rmsMetadata = rmsMetadata;
      }
      
      return result;
    } catch (error) {
      logger.error('File parsing error:', error);
      throw new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Fix common PDF extraction issues
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/(\d+)\s*-\s*(\d+)/g, '$1-$2') // Fix date ranges
      .replace(/\s*[\u2022\u2023\u25E6\u2043\u2219]/g, '\n• ') // Normalize bullet points
      .replace(/\s*[●○■□▪▫◆◇★☆]/g, '\n• ') // More bullet point variants
      // Fix common encoding issues
      .replace(/â€™/g, "'")
      .replace(/â€"/g, "—")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"')
      .replace(/Ã©/g, 'é')
      .replace(/Ã¨/g, 'è')
      .replace(/Ã¡/g, 'á')
      .replace(/Ã /g, 'à')
      // Preserve formatting
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .trim();
  }

  /**
   * Extract individual pages with text
   */
  private extractPages(data: any): Array<{ pageNumber: number; text: string; wordCount: number }> {
    if (!data.pages || !Array.isArray(data.pages)) {
      return [{
        pageNumber: 1,
        text: data.text || '',
        wordCount: this.countWords(data.text || ''),
      }];
    }

    return data.pages.map((page: any, index: number) => {
      const pageText = this.cleanText(page.pageStrings?.join(' ') || '');
      return {
        pageNumber: index + 1,
        text: pageText,
        wordCount: this.countWords(pageText),
      };
    });
  }

  /**
   * Extract comprehensive metadata
   */
  private extractMetadata(data: any, cleanedText: string): PDFMetadata {
    const info = data.info || {};
    const metadata = data.metadata || {};

    return {
      pageCount: data.numpages || 1,
      wordCount: this.countWords(cleanedText),
      characterCount: cleanedText.length,
      author: info.Author || metadata.dc?.creator || undefined,
      title: info.Title || metadata.dc?.title || undefined,
      subject: info.Subject || metadata.dc?.subject || undefined,
      keywords: info.Keywords || undefined,
      creator: info.Creator || metadata.xmp?.CreatorTool || undefined,
      producer: info.Producer || undefined,
      creationDate: this.formatDate(info.CreationDate || metadata.xmp?.CreateDate),
      modificationDate: this.formatDate(info.ModDate || metadata.xmp?.ModifyDate),
      isEncrypted: data.isEncrypted || false,
      isLinearized: data.isLinearized || false,
      pdfVersion: data.version || '1.4',
    };
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Format PDF date to ISO string
   */
  private formatDate(pdfDate: any): string | undefined {
    if (!pdfDate) return undefined;
    
    try {
      if (pdfDate instanceof Date) {
        return pdfDate.toISOString();
      }
      
      // Handle PDF date format (D:YYYYMMDDHHmmSS)
      const match = String(pdfDate).match(/D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
      if (match) {
        const [_, year, month, day, hour = '00', minute = '00', second = '00'] = match;
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`).toISOString();
      }
      
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Advanced text section detection
   */
  detectSections(text: string): string[] {
    const sections: string[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    const sectionPatterns = [
      { pattern: /^(personal\s+information|contact\s+info)/i, name: 'Contact Information' },
      { pattern: /^(professional\s+)?summary|objective|profile/i, name: 'Summary' },
      { pattern: /^(work\s+)?experience|employment|professional\s+experience/i, name: 'Work Experience' },
      { pattern: /^education|academic/i, name: 'Education' },
      { pattern: /^skills|technical\s+skills|core\s+competencies/i, name: 'Skills' },
      { pattern: /^projects|portfolio/i, name: 'Projects' },
      { pattern: /^(involvement|activities|volunteer|leadership)/i, name: 'Involvement' },
      { pattern: /^certifications?|licenses?/i, name: 'Certifications' },
      { pattern: /^awards?|achievements?|honors?/i, name: 'Awards' },
      { pattern: /^publications?|papers?/i, name: 'Publications' },
      { pattern: /^languages?/i, name: 'Languages' },
      { pattern: /^references?/i, name: 'References' },
    ];

    for (const line of lines) {
      for (const { pattern, name } of sectionPatterns) {
        if (pattern.test(line) && !sections.includes(name)) {
          sections.push(name);
          break;
        }
      }
    }

    return sections;
  }

  /**
   * Transform RMS metadata into structured resume data
   */
  transformRMSToStructuredData(rmsMetadata: RMSMetadata): Partial<ExtractedData> {
    const result: Partial<ExtractedData> = {};

    // Personal Info
    if (rmsMetadata.rms_contact_fullName || rmsMetadata.rms_contact_email) {
      result.personalInfo = {
        name: rmsMetadata.rms_contact_fullName,
        email: rmsMetadata.rms_contact_email,
        phone: rmsMetadata.rms_contact_phone,
        address: [
          rmsMetadata.rms_contact_city,
          rmsMetadata.rms_contact_state,
          rmsMetadata.rms_contact_country
        ].filter(Boolean).join(', '),
        linkedinUrl: rmsMetadata.rms_contact_linkedin,
      };
    }

    // Experience (parse indexed fields)
    if (rmsMetadata.rms_experience_count && rmsMetadata.rms_experience_count > 0) {
      result.experience = [];
      for (let i = 0; i < rmsMetadata.rms_experience_count; i++) {
        const exp = this.extractIndexedRMSData(rmsMetadata, 'experience', i);
        if (exp.company || exp.role) {
          result.experience.push({
            jobTitle: exp.role || '',
            company: exp.company || '',
            location: exp.location,
            startDate: exp.dateBegin,
            endDate: exp.dateEnd,
            isCurrent: exp.isCurrent === 'true',
            responsibilities: exp.description ? [exp.description] : [],
          });
        }
      }
    }

    // Education (parse indexed fields)
    if (rmsMetadata.rms_education_count && rmsMetadata.rms_education_count > 0) {
      result.education = [];
      for (let i = 0; i < rmsMetadata.rms_education_count; i++) {
        const edu = this.extractIndexedRMSData(rmsMetadata, 'education', i);
        if (edu.institution || edu.qualification) {
          result.education.push({
            degree: edu.qualification || '',
            institution: edu.institution || '',
            location: edu.location,
            graduationDate: edu.date,
            gpa: edu.score,
          });
        }
      }
    }

    // Involvement (parse indexed fields)
    if (rmsMetadata.rms_involvement_count && rmsMetadata.rms_involvement_count > 0) {
      result.involvement = [];
      for (let i = 0; i < rmsMetadata.rms_involvement_count; i++) {
        const inv = this.extractIndexedRMSData(rmsMetadata, 'involvement', i);
        if (inv.organization || inv.role) {
          result.involvement.push({
            organization: inv.organization || '',
            role: inv.role || '',
            location: inv.location,
            description: inv.description || '',
            startDate: inv.dateBegin,
            endDate: inv.dateEnd,
            isCurrent: inv.dateEnd ? false : true,
          });
        }
      }
    }

    // Skills (parse indexed fields)
    if (rmsMetadata.rms_skill_count && rmsMetadata.rms_skill_count > 0) {
      result.skills = [];
      for (let i = 0; i < rmsMetadata.rms_skill_count; i++) {
        const skill = this.extractIndexedRMSData(rmsMetadata, 'skill', i);
        if (skill.keywords) {
          // Split keywords by comma and add to skills array
          const keywords = skill.keywords.split(',').map(s => s.trim()).filter(Boolean);
          result.skills.push(...keywords);
        }
      }
    }

    return result;
  }

  /**
   * Extract indexed RMS data fields
   */
  private extractIndexedRMSData(metadata: any, type: string, index: number): any {
    const result: any = {};
    const prefix = `rms_${type}_${index}_`;
    
    Object.keys(metadata).forEach(key => {
      if (key.startsWith(prefix)) {
        const fieldName = key.replace(prefix, '');
        result[fieldName] = metadata[key];
      }
    });
    
    return result;
  }
}

// Export singleton instance
export const pdfParser = new OptimizedPDFParser();

// Import type for transformation
import type { ExtractedData } from './schemas/ats-analysis';