// src/types/index.ts

// Resume Types
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

export interface ResumeSection {
  isComplete?: boolean;
}

export interface ResumeData {
  id: string;
  title: string;
  document_id?: string;
  user_id?: string;
  extracted_text?: string;
  sections: Record<FormSection, ResumeSection>;
  [key: string]: any;
}

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

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface Experience {
  company: string;
  position: string;
  location: string;
  dateBegin: string;
  dateEnd: string;
  isCurrent: boolean;
  description: string;
}

export interface Education {
  institution: string;
  qualification: string;
  fieldOfStudy: string;
  date: string;
  isGraduate: boolean;
  gpa: string;
  location: string;
  minor: string;
  activities: string;
  description?: string;
}

export interface Skill {
  category: string;
  keywords: string;
}

export interface Project {
  name?: string;
  title?: string;
  role: string;
  organization?: string;
  description: string;
  dateBegin: string;
  dateEnd: string;
  url?: string;
  repository?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Coursework {
  name: string;
  institution: string;
  description: string;
}

export interface Involvement {
  organization: string;
  role: string;
  location: string;
  dateBegin: string;
  dateEnd: string;
  description: string;
}

// Job Info Types
export interface JobInfo {
  title: string;
  company: string;
  description: string;
  keywords: string[];
  isActive: boolean;
}

// Keyword Analysis Types
export interface Keyword {
  keyword: string;
  importance: 'high' | 'medium' | 'low';
  category?: string;
  suggestion?: string;
}

export interface ATSScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  match_rate: number;
}

export interface AnalysisResponse {
  matching_keywords: Keyword[];
  missing_keywords: Keyword[];
  ats_score: ATSScore;
}

export interface KeywordAnalysisData extends AnalysisResponse {
  job_title: string;
  job_description: string;
  analyzed_at: string;
}

// Theme Types
export interface ThemeContextType {
  theme: 'light' | 'dark';
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}