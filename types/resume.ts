                               // types/resume.ts

// Form sections enum
export type FormSection =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'coursework'
  | 'involvement';

// Contact Information
export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

// Experience/Work History
export interface Experience {
  company: string;
  position: string;
  location?: string;
  dateBegin: string;
  dateEnd: string;
  isCurrent?: boolean;
  description: string;
}

// Education
export interface Education {
  institution: string;
  qualification: string; // degree type
  fieldOfStudy?: string;
  date: string;
  isGraduate?: boolean;
  gpa?: string;
  location?: string;
  minor?: string;
  activities?: string;
  description?: string;
}

// Skills
export interface Skill {
  category: string;
  keywords: string;
}

// Projects
export interface Project {
  name: string;
  title: string;
  role?: string;
  organization?: string;
  description: string;
  dateBegin?: string;
  dateEnd?: string;
  url?: string;
  repository?: string;
}

// Certifications
export interface Certification {
  name: string;
  date: string;
  issuer: string;
  description?: string;
}

// Coursework
export interface Coursework {
  course: string;
  institution: string;
  date?: string;
  description?: string;
}

// Involvement/Activities
export interface Involvement {
  organization: string;
  role: string;
  location?: string;
  dateBegin: string;
  dateEnd: string;
  description?: string;
}

// Section completion status
export interface SectionStatus {
  isComplete: boolean;
}

// Processed/Structured Resume Data
export interface ProcessedResumeData {
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  coursework: Coursework[];
  involvement: Involvement[];
}

// Raw/Flattened Resume Data (as stored in database)
export interface ResumeData {
  // Core fields
  id: string;
  title: string;
  document_id?: string;
  user_id?: string;
  extracted_text?: string;

  // Section completion tracking
  sections?: Record<FormSection, SectionStatus>;

  // Summary
  rms_summary?: string;

  // Contact fields (flattened)
  rms_contact_fullName?: string;
  rms_contact_email?: string;
  rms_contact_phone?: string;
  rms_contact_location?: string;
  rms_contact_city?: string;
  rms_contact_state?: string;
  rms_contact_linkedin?: string;
  rms_contact_github?: string;
  rms_contact_website?: string;

  // Array counts
  experience_count?: string;
  education_count?: string;
  skill_count?: string;
  project_count?: string;
  certification_count?: string;
  coursework_count?: string;
  involvement_count?: string;

  // Dynamic flattened fields for arrays
  // Experience fields: rms_experience_0_company, rms_experience_0_position, etc.
  // Education fields: rms_education_0_institution, rms_education_0_qualification, etc.
  // Skills fields: rms_skill_0_category, rms_skill_0_keywords, etc.
  // Projects fields: rms_project_0_name, rms_project_0_title, etc.
  // Certifications fields: rms_certification_0_name, rms_certification_0_date, etc.
  // Involvement fields: rms_involvement_0_organization, rms_involvement_0_role, etc.
  [key: string]: any; // Allow dynamic fields
}

// Resume metadata
export interface ResumeMetadata {
  id: string;
  title: string;
  lastUpdated: string;
  createdAt: string;
  isTargeted?: boolean;
  userId: string;
  status?: string;
}

// Resume creation data
export interface CreateResumeData {
  title: string;
  userId: string;
  experience?: string;
  isTargeted?: boolean;
  initialStatus?: string;
}

// Resume list item (for displaying in grids/lists)
export interface ResumeListItem {
  id: string;
  title: string;
  lastUpdated: string;
  createdAt: string;
  isTargeted?: boolean;
}

// PDF Processing related types
export interface ParsedResumeData {
  contactInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary?: string;
  objective?: string;
  experiences?: Array<{
    company?: string;
    position?: string;
    role?: string;
    location?: string;
    dateBegin?: string;
    dateEnd?: string;
    description?: string;
  }>;
  experience?: Array<{
    company?: string;
    position?: string;
    role?: string;
    location?: string;
    dateBegin?: string;
    dateEnd?: string;
    description?: string;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    qualification?: string;
    fieldOfStudy?: string;
    date?: string;
    location?: string;
    description?: string;
  }>;
  skillCategories?: Array<{
    category?: string;
    keywords?: string;
  }>;
  skills?: Array<{
    category?: string;
    keywords?: string;
  }>;
  projects?: Array<{
    name?: string;
    title?: string;
    description?: string;
    role?: string;
    organization?: string;
    dateBegin?: string;
    dateEnd?: string;
    url?: string;
    repository?: string;
  }>;
  certifications?: Array<{
    name?: string;
    date?: string;
    issuer?: string;
    department?: string;
    description?: string;
  }>;
  involvements?: Array<{
    organization?: string;
    role?: string;
    location?: string;
    dateBegin?: string;
    dateEnd?: string;
    description?: string;
  }>;
}

// Resume template types
export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  isCustom?: boolean;
}

// Form validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Export utility type for section keys
export type SectionKey = keyof ProcessedResumeData;

// Default values
export const DEFAULT_CONTACT_INFO: ContactInfo = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  website: ''
};

export const DEFAULT_SECTION_STATUS: SectionStatus = {
  isComplete: false
};

export const FORM_SECTIONS: FormSection[] = [
  'contact',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'coursework',
  'involvement'
];

// Section display names
export const SECTION_NAMES: Record<FormSection, string> = {
  contact: 'Contact Information',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  coursework: 'Relevant Coursework',
  involvement: 'Activities & Involvement'
};

// Section descriptions
export const SECTION_DESCRIPTIONS: Record<FormSection, string> = {
  contact: 'Your basic contact information and professional links',
  summary: 'A brief overview of your professional background and goals',
  experience: 'Your work history and professional experience',
  education: 'Your educational background and qualifications',
  skills: 'Technical and professional skills organized by category',
  projects: 'Notable projects you\'ve worked on',
  certifications: 'Professional certifications and licenses',
  coursework: 'Relevant academic coursework',
  involvement: 'Extracurricular activities and volunteer work'
};