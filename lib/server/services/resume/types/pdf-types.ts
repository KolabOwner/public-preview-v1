/**
 * Shared types for PDF processing and generation
 */

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
 * Font definition interface
 */
export interface FontDefinition {
  family: string;
  size: number;
  weight: number;
  style?: 'normal' | 'bold' | 'italic';
}

/**
 * PDF color configuration
 */
export interface PDFColors {
  text: { r: number; g: number; b: number };
  black: { r: number; g: number; b: number };
  gray: { r: number; g: number; b: number };
  accent: { r: number; g: number; b: number };
}

/**
 * PDF configuration interface
 */
export interface PDFConfiguration {
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

/**
 * Resume data interface for PDF generation
 */
export interface ResumeData {
  title: string;
  template?: string;
  fontSize?: 'small' | 'medium' | 'large';
  fontStyle?: 'elegant' | 'modern' | 'classic' | 'professional';
  parsedData: any; // RMS format - flattened key-value pairs
  sectionOrder?: string[];
  documentSettings?: {
    fontFamily?: string;
    fontSize?: number;
    paperSize?: 'Letter' | 'A4';
    margins?: { top: number; right: number; bottom: number; left: number };
  };
}

/**
 * Parsed resume data structure
 */
export interface ParsedData {
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