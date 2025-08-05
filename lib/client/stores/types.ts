// lib/client/stores/types.ts

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  country: string;
  state: string;
  city: string;
  showEmail: boolean;
  showPhone: boolean;
  showLinkedin: boolean;
  showWebsite: boolean;
  showLocation: boolean;
  showCountry: boolean;
  showState: boolean;
  showCity: boolean;
}

export interface ExperienceEntry {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  bulletPoints: string[];
}

export interface EducationEntry {
  id?: string;
  institution: string;
  qualification: string;
  location?: string;
  date?: Date | null;
  dateFormat?: string;
  minor?: string;
  score?: string;
  scoreType?: string;
  description?: string;
}

export interface SkillEntry {
  id?: string;
  category: string;
  keywords: string;
}

export interface ProjectEntry {
  id?: string;
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  url?: string;
  description?: string;
  bulletPoints: string[];
}

export interface InvolvementEntry {
  id?: string;
  organization: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  bulletPoints: string[];
}

export interface CourseworkEntry {
  id?: string;
  name: string;
  institution: string;
  date?: string;
  description?: string;
}

export interface CertificationEntry {
  id?: string;
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface AwardEntry {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

export interface PublicationEntry {
  id: string;
  title: string;
  publisher: string;
  date: string;
  authors: string;
  url?: string;
  description?: string;
}

export interface UnifiedResumeData {
  contactInfo: ContactFormData;
  summary: string;
  experiences: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  involvements: InvolvementEntry[];
  coursework: CourseworkEntry[];
  certifications: CertificationEntry[];
  awards: AwardEntry[];
  languages: LanguageEntry[];
  publications: PublicationEntry[];
}

export interface SummaryData {
  summary: string;
  positionHighlight: boolean;
  position: string;
  skillsHighlight: string;
}

export interface ResumeDocument {
  id: string;
  title: string;
  userId: string;
  parsedData: any; // RMS format - flattened key-value pairs
  createdAt: string;
  updatedAt: string;
}

// Dirty tracking types
export type SectionKey = keyof UnifiedResumeData;
export type DirtyState = Record<SectionKey, boolean>;

export interface SaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  pendingSections: SectionKey[];
  error: string | null;
}