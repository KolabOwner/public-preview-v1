/**
 * @fileOverview Legacy ATS analysis flow - now redirects to enterprise analysis
 * @deprecated Use analyze-enterprise.ts for comprehensive analysis
 */

// Re-export from the new enterprise analysis
export { 
  analyzeEnterprise as analyzeAts,
  extractResumeText,
  calculateATSScore
} from './analyze-enterprise';

// Legacy types for backward compatibility
export type AnalyzeAtsInput = {
  resumeDataUri?: string;
  resumeText?: string;
  jobTitle: string;
  jobDescription: string;
  jobCompany?: string;
};

export type AnalyzeAtsOutput = {
  atsScore: number;
  matchingKeywords: string[];
  missingKeywords: string[];
};
