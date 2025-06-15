// lib/genkit/schemas/ats-analysis.ts
// Zod schemas for ATS resume analysis with GenKit

import { z } from 'zod';

// Personal Information Schema
export const PersonalInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
}).strict();

// Experience Entry Schema
export const ExperienceEntrySchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  responsibilities: z.array(z.string()),
  technologies: z.array(z.string()).optional(),
}).strict();

// Education Entry Schema
export const EducationEntrySchema = z.object({
  degree: z.string(),
  institution: z.string(),
  location: z.string().optional(),
  graduationDate: z.string().optional(),
  gpa: z.string().optional(),
  relevantCoursework: z.array(z.string()).optional(),
  honors: z.array(z.string()).optional(),
}).strict();

// Project Entry Schema
export const ProjectEntrySchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  link: z.string().url().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).strict();

// Involvement Entry Schema (for clubs, organizations, volunteer work)
export const InvolvementEntrySchema = z.object({
  organization: z.string(),
  role: z.string(),
  location: z.string().optional(),
  description: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
}).strict();

// Certification Entry Schema
export const CertificationEntrySchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string().optional(),
  expirationDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().url().optional(),
}).strict();

// Extracted Data Schema
export const ExtractedDataSchema = z.object({
  personalInfo: PersonalInfoSchema.optional(),
  summary: z.string().optional(),
  experience: z.array(ExperienceEntrySchema).optional(),
  education: z.array(EducationEntrySchema).optional(),
  skills: z.array(z.string()).optional(),
  projects: z.array(ProjectEntrySchema).optional(),
  involvement: z.array(InvolvementEntrySchema).optional(),
  certifications: z.array(CertificationEntrySchema).optional(),
  languages: z.array(z.string()).optional(),
  awards: z.array(z.string()).optional(),
  publications: z.array(z.string()).optional(),
}).strict();

// ATS Scoring Criteria
export const ATSScoringCriteriaSchema = z.object({
  formatting: z.number().min(0).max(25),
  keywords: z.number().min(0).max(25),
  structure: z.number().min(0).max(25),
  readability: z.number().min(0).max(25),
}).strict();

// Suggestion Schema
export const SuggestionSchema = z.object({
  category: z.enum(['formatting', 'content', 'keywords', 'structure', 'readability']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  message: z.string(),
  section: z.string().optional(),
  example: z.string().optional(),
}).strict();

// Input Schema for ATS Analysis
export const AnalyzeResumeForATSInputSchema = z.object({
  resumeDataUri: z.string().describe('Base64 encoded resume data URI or URL'),
  jobDescription: z.string().optional().describe('Optional job description for keyword matching'),
  targetRole: z.string().optional().describe('Target role for optimization suggestions'),
  industryContext: z.string().optional().describe('Industry context for better analysis'),
}).strict();

// Output Schema for ATS Analysis
export const AnalyzeResumeForATSOutputSchema = z.object({
  extractedData: ExtractedDataSchema,
  identifiedSections: z.array(z.string()),
  atsCompatibilityScore: z.number().min(0).max(100),
  scoringBreakdown: ATSScoringCriteriaSchema,
  suggestions: z.array(SuggestionSchema),
  keywordAnalysis: z.object({
    found: z.array(z.string()),
    missing: z.array(z.string()),
    density: z.number(),
  }).optional(),
  parseErrors: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).describe('Confidence level of the extraction'),
}).strict();

// Enhanced Resume Data Schema (for internal use)
export const EnhancedResumeDataSchema = z.object({
  originalText: z.string(),
  cleanedText: z.string(),
  metadata: z.object({
    pageCount: z.number(),
    wordCount: z.number(),
    characterCount: z.number(),
    fileType: z.string(),
    createdAt: z.string().optional(),
    modifiedAt: z.string().optional(),
  }),
  structuredData: ExtractedDataSchema,
  formatting: z.object({
    hasHeaders: z.boolean(),
    hasBulletPoints: z.boolean(),
    hasConsistentFormatting: z.boolean(),
    fontInfo: z.array(z.string()).optional(),
  }),
}).strict();

// Batch Processing Schema
export const BatchATSAnalysisInputSchema = z.object({
  resumes: z.array(z.object({
    id: z.string(),
    resumeDataUri: z.string(),
    metadata: z.record(z.string()).optional(),
  })),
  jobDescription: z.string().optional(),
  options: z.object({
    parallel: z.boolean().default(true),
    maxConcurrency: z.number().default(5),
    includeConfidenceScores: z.boolean().default(true),
  }).optional(),
}).strict();

export const BatchATSAnalysisOutputSchema = z.object({
  results: z.array(z.object({
    id: z.string(),
    success: z.boolean(),
    data: AnalyzeResumeForATSOutputSchema.optional(),
    error: z.string().optional(),
  })),
  summary: z.object({
    total: z.number(),
    successful: z.number(),
    failed: z.number(),
    averageScore: z.number(),
    processingTime: z.number(),
  }),
}).strict();

// RMS (Resume Metadata Standard) Schema for ExifTool extraction
export const RMSMetadataSchema = z.object({
  producer: z.string().optional(),
  rms_schema_details: z.string().optional(),
  // Contact info
  rms_contact_fullName: z.string().optional(),
  rms_contact_givenNames: z.string().optional(),
  rms_contact_lastName: z.string().optional(),
  rms_contact_email: z.string().optional(),
  rms_contact_phone: z.string().optional(),
  rms_contact_city: z.string().optional(),
  rms_contact_state: z.string().optional(),
  rms_contact_country: z.string().optional(),
  rms_contact_countryCode: z.string().optional(),
  rms_contact_linkedin: z.string().optional(),
  // Counts
  rms_experience_count: z.number().optional(),
  rms_education_count: z.number().optional(),
  rms_skill_count: z.number().optional(),
  rms_project_count: z.number().optional(),
  rms_involvement_count: z.number().optional(),
  rms_certification_count: z.number().optional(),
  rms_award_count: z.number().optional(),
  rms_publication_count: z.number().optional(),
  rms_reference_count: z.number().optional(),
  rms_coursework_count: z.number().optional(),
}).passthrough(); // Allow additional RMS fields

// Type exports
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
export type EducationEntry = z.infer<typeof EducationEntrySchema>;
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;
export type InvolvementEntry = z.infer<typeof InvolvementEntrySchema>;
export type CertificationEntry = z.infer<typeof CertificationEntrySchema>;
export type ExtractedData = z.infer<typeof ExtractedDataSchema>;
export type ATSScoringCriteria = z.infer<typeof ATSScoringCriteriaSchema>;
export type Suggestion = z.infer<typeof SuggestionSchema>;
export type AnalyzeResumeForATSInput = z.infer<typeof AnalyzeResumeForATSInputSchema>;
export type AnalyzeResumeForATSOutput = z.infer<typeof AnalyzeResumeForATSOutputSchema>;
export type EnhancedResumeData = z.infer<typeof EnhancedResumeDataSchema>;
export type BatchATSAnalysisInput = z.infer<typeof BatchATSAnalysisInputSchema>;
export type BatchATSAnalysisOutput = z.infer<typeof BatchATSAnalysisOutputSchema>;
export type RMSMetadata = z.infer<typeof RMSMetadataSchema>;