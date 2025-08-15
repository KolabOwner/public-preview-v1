// Job Board Type Definitions

import { Timestamp } from 'firebase/firestore';

// Enums
export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
  TEMPORARY = 'TEMPORARY'
}

export enum ExperienceLevel {
  ENTRY_LEVEL = 'ENTRY_LEVEL',
  MID_LEVEL = 'MID_LEVEL',
  SENIOR_LEVEL = 'SENIOR_LEVEL',
  EXECUTIVE = 'EXECUTIVE',
  INTERNSHIP = 'INTERNSHIP'
}

export enum ApplicationStatus {
  SAVED = 'SAVED',
  APPLIED = 'APPLIED',
  INTERVIEWING = 'INTERVIEWING',
  REJECTED = 'REJECTED',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED'
}

// Company Interface
export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  location?: string;
  size?: string;
  industry?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Job Interface
export interface Job {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  location: string;
  type: JobType;
  remote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  experienceLevel: ExperienceLevel;
  skills: string[];
  benefits: string[];
  externalUrl?: string;
  isActive: boolean;
  postedAt: Timestamp;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Foreign keys
  companyId: string;
  
  // Relations (populated)
  company?: Company;
  
  // External job fields
  isExternal?: boolean;
  source?: string;
  externalId?: string;
  isCached?: boolean;
  lastSynced?: Timestamp;
  
  // UI state
  isSaved?: boolean;
}

// Job Application Interface
export interface JobApplication {
  id: string;
  status: ApplicationStatus;
  appliedAt: Timestamp;
  notes?: string;
  resumeUsed?: string;
  coverLetter?: string;
  statusHistory: ApplicationStatusHistory[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Foreign keys
  userId: string;
  jobId: string;
  
  // Relations (populated)
  job?: Job;
}

// Application Status History
export interface ApplicationStatusHistory {
  status: ApplicationStatus;
  changedAt: Timestamp;
  notes?: string;
}

// Saved Job Interface
export interface SavedJob {
  id: string;
  savedAt: Timestamp;
  notes?: string;
  
  // Foreign keys
  userId: string;
  jobId: string;
  
  // Relations (populated)
  job?: Job;
}

// Job Search Interface
export interface JobSearch {
  id: string;
  query: string;
  location: string;
  filters: JobSearchFilters;
  resultsCount: number;
  searchedAt: Timestamp;
  
  // Foreign key
  userId: string;
}

// Job Search Filters
export interface JobSearchFilters {
  jobType?: JobType[];
  experienceLevel?: ExperienceLevel[];
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  companyId?: string;
}

// User Job Preferences
export interface JobPreferences {
  desiredRoles: string[];
  preferredLocations: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  jobTypes: JobType[];
  remote: boolean;
  industries: string[];
}

// Application Statistics
export interface ApplicationStats {
  totalApplications: number;
  saved: number;
  applied: number;
  interviewing: number;
  rejected: number;
  offered: number;
}

// Enhanced User Interface (extends existing user)
export interface JobBoardUser {
  // ... existing user fields ...
  jobPreferences?: JobPreferences;
  applicationStats?: ApplicationStats;
  skills?: string[];
  experience?: ExperienceLevel;
  currentJobTitle?: string;
  yearsOfExperience?: number;
}

// API Request/Response Types

// Search Jobs Request
export interface SearchJobsRequest {
  searchQuery?: string;
  location?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  remote?: boolean;
  salaryMin?: number;
  companyId?: string;
  pageSize?: number;
  lastDoc?: any; // Firebase DocumentSnapshot
}

// Search Jobs Response
export interface SearchJobsResponse {
  jobs: Job[];
  lastDoc?: any;
  hasMore: boolean;
  totalCount?: number;
  sources?: {
    internal: number;
    external: number;
  };
}

// Apply to Job Request
export interface ApplyToJobRequest {
  resumeId?: string;
  coverLetter?: string;
  notes?: string;
}

// Update Application Status Request
export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  notes?: string;
}

// External Job API Response Types
export interface ExternalJobSource {
  name: string;
  enabled: boolean;
  baseURL: string;
  apiKey?: string;
  rateLimit?: number;
}

// RemoteOK Job
export interface RemoteOKJob {
  id: string;
  position: string;
  company: string;
  location?: string;
  description?: string;
  url?: string;
  date?: string;
  salary_min?: number;
  salary_max?: number;
  tags?: string[];
  company_logo?: string;
}

// Adzuna Job
export interface AdzunaJob {
  id: string;
  title: string;
  description?: string;
  location: {
    display_name: string;
  };
  contract_type?: string;
  salary_min?: number;
  salary_max?: number;
  category?: {
    label: string;
  };
  redirect_url: string;
  company?: {
    display_name: string;
  };
  created?: string;
}

// USAJobs Job
export interface USAJobsJob {
  PositionID: string;
  PositionTitle: string;
  QualificationSummary?: string;
  PositionLocationDisplay: string;
  PositionSchedule?: Array<{
    Name: string;
  }>;
  TeleworkEligible?: boolean;
  PositionRemuneration?: Array<{
    MinimumRange?: number;
    MaximumRange?: number;
  }>;
  JobGrade?: Array<{
    Code: string;
  }>;
  PositionURI: string;
  OrganizationName?: string;
  PublicationStartDate?: string;
  UserArea?: {
    Details?: {
      JobSummary?: string;
    };
  };
}

// API Error Response
export interface APIError {
  error: string;
  message: string;
  code?: number;
}

// types/tab.resume-store.types.ts (or add to your existing types file)
export type JobTabId = 'ALL_JOBS' | 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'REJECTED';

export interface JobTab {
  id: JobTabId;
  label: string;
  showCount: boolean;
}
