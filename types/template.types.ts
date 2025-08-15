// types/template.resume-store.types.ts

export type Industry = 
  | 'business'
  | 'design'
  | 'education'
  | 'engineering'
  | 'finance'
  | 'legal'
  | 'marketing'
  | 'medical'
  | 'other'
  | 'programming'
  | 'student';

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';

export type TemplateType = 'resume' | 'cover_letter';

export type CoverLetterTone = 'formal' | 'conversational' | 'enthusiastic' | 'professional' | 'confident';

export interface TemplateMetadata {
  createdAt: Date;
  updatedAt: Date;
  author: string;
  version: string;
  tags: string[];
  popularity: number; // For sorting by most used
  rating: number; // User ratings
  ratingCount: number;
  isActive: boolean;
  isPremium: boolean;
}

export interface ResumeTemplateContent {
  // Personal Information
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin?: string;
  website?: string;

  // Professional Summary
  summary: string;

  // Experience
  experience: Array<{
    id: string;
    jobTitle: string;
    companyName: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    responsibilities: string[];
    achievements?: string[];
  }>;

  // Education
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    relevantCourses?: string[];
    honors?: string[];
  }>;

  // Skills
  skills: {
    technical?: string[];
    soft?: string[];
    languages?: Array<{
      language: string;
      proficiency: string;
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      date: string;
    }>;
  };

  // Additional Sections (optional)
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies?: string[];
    link?: string;
    achievements: string[];
  }>;

  volunteer?: Array<{
    id: string;
    role: string;
    organization: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;

  publications?: Array<{
    id: string;
    title: string;
    publication: string;
    date: string;
    link?: string;
  }>;

  awards?: Array<{
    id: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
}

export interface CoverLetterTemplateContent {
  // Header
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  phone: string;
  date: string;

  // Recipient
  recipientName?: string;
  recipientTitle?: string;
  companyName: string;
  companyAddress?: string;

  // Content
  salutation: string; // "Dear Hiring Manager" or "Dear [Name]"

  // Paragraphs
  opening: {
    hook: string;
    position: string;
    source: string; // How you found the position
  };

  body: Array<{
    id: string;
    content: string;
    focus: 'skills' | 'experience' | 'achievements' | 'fit' | 'passion';
  }>;

  closing: {
    callToAction: string;
    availability: string;
    thanks: string;
  };

  signature: {
    closing: string; // "Sincerely," "Best regards," etc.
    name: string;
  };
}

export interface ResumeTemplate {
  id: string;
  type: 'resume';
  industry: Industry;
  role: string;
  roleSlug: string; // URL-friendly version of role
  experienceLevel: ExperienceLevel;
  content: ResumeTemplateContent;
  metadata: TemplateMetadata;
  stylePreset?: string; // References existing style templates
  keywords: string[]; // For search functionality
  parsedData?: Record<string, any>; // RMS parsed data structure
}

export interface CoverLetterTemplate {
  id: string;
  type: 'cover_letter';
  industry: Industry;
  role: string;
  roleSlug: string;
  experienceLevel: ExperienceLevel;
  content: CoverLetterTemplateContent;
  metadata: TemplateMetadata;
  tone: CoverLetterTone;
  keywords: string[];
}

export type Template = ResumeTemplate | CoverLetterTemplate;

// Helper type guards
export function isResumeTemplate(template: Template): template is ResumeTemplate {
  return template.type === 'resume';
}

export function isCoverLetterTemplate(template: Template): template is CoverLetterTemplate {
  return template.type === 'cover_letter';
}

// Search and filter interfaces
export interface TemplateSearchParams {
  type?: TemplateType;
  industry?: Industry;
  experienceLevel?: ExperienceLevel;
  keywords?: string[];
  isPremium?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'popularity' | 'rating' | 'newest' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

export interface TemplateSearchResult {
  templates: Template[];
  total: number;
  hasMore: boolean;
}