// lib/genkit/flows/analyze-resume.ts
// GenKit flow for AI-powered resume analysis with ATS optimization

import { defineFlow, runFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import { logger } from '@genkit-ai/core/logging';
import { 
  AnalyzeResumeForATSInputSchema,
  AnalyzeResumeForATSOutputSchema,
  type AnalyzeResumeForATSInput,
  type AnalyzeResumeForATSOutput,
  type ExtractedData,
  type Suggestion,
  type ATSScoringCriteria
} from '../schemas/ats-analysis';
import { pdfParser } from '../pdf-parser';

// Configure Gemini model
const gemini = googleAI({
  model: 'gemini-2.0-flash',
  config: {
    temperature: 0.3,
    topP: 0.9,
  }
});

// Define the analyze resume flow
export const analyzeResumeFlow = defineFlow({
  name: 'analyzeResume',
  inputSchema: AnalyzeResumeForATSInputSchema,
  outputSchema: AnalyzeResumeForATSOutputSchema,
  authPolicy: async (auth, input) => {
    // Add authentication check here if needed
    return true;
  },
}, async (input: AnalyzeResumeForATSInput): Promise<AnalyzeResumeForATSOutput> => {
  try {
    logger.info('Starting resume analysis flow');
    
    // Step 1: Parse PDF and extract text/metadata
    const parsedPDF = await pdfParser.parseFromDataURI(input.resumeDataUri);
    logger.info(`PDF parsed: ${parsedPDF.pages.length} pages, ${parsedPDF.metadata.wordCount} words`);
    
    // Step 2: Detect sections
    const identifiedSections = pdfParser.detectSections(parsedPDF.text);
    
    // Step 3: If we have RMS metadata, use it as a starting point
    let extractedData: Partial<ExtractedData> = {};
    if (parsedPDF.rmsMetadata) {
      logger.info('Using RMS metadata for initial extraction');
      extractedData = pdfParser.transformRMSToStructuredData(parsedPDF.rmsMetadata);
    }
    
    // Step 4: Use AI to extract/enhance data
    const aiExtractionPrompt = createExtractionPrompt(
      parsedPDF.text, 
      extractedData,
      input.targetRole
    );
    
    const aiExtraction = await gemini.generate({
      prompt: aiExtractionPrompt,
      schema: ExtractedDataSchema,
    });
    
    // Merge AI extraction with RMS metadata (RMS takes precedence for accuracy)
    const mergedData = mergeExtractedData(extractedData, aiExtraction.output);
    
    // Step 5: Calculate ATS compatibility score
    const scoringBreakdown = calculateATSScore(
      parsedPDF,
      mergedData,
      identifiedSections,
      input.jobDescription
    );
    
    const atsCompatibilityScore = Object.values(scoringBreakdown).reduce((a, b) => a + b, 0);
    
    // Step 6: Generate suggestions
    const suggestions = await generateSuggestions(
      mergedData,
      scoringBreakdown,
      parsedPDF,
      input.jobDescription,
      input.targetRole
    );
    
    // Step 7: Perform keyword analysis if job description provided
    let keywordAnalysis;
    if (input.jobDescription) {
      keywordAnalysis = await analyzeKeywords(
        parsedPDF.text,
        input.jobDescription,
        mergedData
      );
    }
    
    // Build final output
    const output: AnalyzeResumeForATSOutput = {
      extractedData: mergedData as ExtractedData,
      identifiedSections,
      atsCompatibilityScore,
      scoringBreakdown,
      suggestions,
      keywordAnalysis,
      parseErrors: parsedPDF.warnings,
      confidence: calculateConfidence(parsedPDF, mergedData),
    };
    
    logger.info(`Resume analysis completed. ATS Score: ${atsCompatibilityScore}`);
    return output;
    
  } catch (error) {
    logger.error('Resume analysis error:', error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

/**
 * Create AI prompt for data extraction
 */
function createExtractionPrompt(
  resumeText: string, 
  existingData: Partial<ExtractedData>,
  targetRole?: string
): string {
  return `
You are an expert ATS (Applicant Tracking System) resume analyzer.
${targetRole ? `The candidate is targeting a ${targetRole} role.` : ''}

Please extract structured information from the following resume text.
${existingData && Object.keys(existingData).length > 0 ? 
  `I have already extracted some information using metadata. Please enhance and complete it:
${JSON.stringify(existingData, null, 2)}` : ''}

Resume Text:
${resumeText}

Instructions:
1. Extract all personal information (name, email, phone, address, LinkedIn, portfolio URLs)
2. Extract professional summary or objective
3. For each work experience, extract: job title, company, location, dates, and list of responsibilities/achievements
4. For each education entry, extract: degree, institution, location, graduation date, GPA if mentioned
5. Extract all skills mentioned
6. Extract projects with descriptions and technologies used
7. Extract involvement in organizations, clubs, or volunteer work
8. Extract certifications, awards, publications, and languages if present

Ensure all extracted information is accurate and properly formatted.
Pay special attention to dates and ensure they are in a consistent format.
`;
}

/**
 * Merge extracted data with AI enhancements
 */
function mergeExtractedData(
  rmsData: Partial<ExtractedData>,
  aiData: any
): ExtractedData {
  // RMS data is more reliable, so it takes precedence
  return {
    personalInfo: { ...aiData.personalInfo, ...rmsData.personalInfo },
    summary: rmsData.summary || aiData.summary,
    experience: rmsData.experience?.length ? rmsData.experience : aiData.experience,
    education: rmsData.education?.length ? rmsData.education : aiData.education,
    skills: [...new Set([...(rmsData.skills || []), ...(aiData.skills || [])])],
    projects: aiData.projects, // Usually not in RMS
    involvement: rmsData.involvement?.length ? rmsData.involvement : aiData.involvement,
    certifications: aiData.certifications,
    languages: aiData.languages,
    awards: aiData.awards,
    publications: aiData.publications,
  };
}

/**
 * Calculate ATS compatibility score
 */
function calculateATSScore(
  parsedPDF: any,
  extractedData: ExtractedData,
  sections: string[],
  jobDescription?: string
): ATSScoringCriteria {
  const scores: ATSScoringCriteria = {
    formatting: 0,
    keywords: 0,
    structure: 0,
    readability: 0,
  };
  
  // Formatting score (25 points max)
  if (parsedPDF.metadata.pdfVersion && !parsedPDF.metadata.isEncrypted) scores.formatting += 10;
  if (parsedPDF.pages.length <= 2) scores.formatting += 5;
  if (parsedPDF.metadata.wordCount >= 200 && parsedPDF.metadata.wordCount <= 800) scores.formatting += 5;
  if (!parsedPDF.warnings.length) scores.formatting += 5;
  
  // Structure score (25 points max)
  const expectedSections = ['Contact Information', 'Summary', 'Work Experience', 'Education', 'Skills'];
  const foundSections = expectedSections.filter(s => sections.includes(s));
  scores.structure += Math.min(25, foundSections.length * 5);
  
  // Readability score (25 points max)
  if (extractedData.personalInfo?.email) scores.readability += 5;
  if (extractedData.personalInfo?.phone) scores.readability += 5;
  if (extractedData.experience?.length) scores.readability += 5;
  if (extractedData.education?.length) scores.readability += 5;
  if (extractedData.skills?.length) scores.readability += 5;
  
  // Keywords score (25 points max) - simplified without job description
  if (!jobDescription) {
    // Basic keyword presence
    const hasActionVerbs = /\b(managed|developed|implemented|created|designed|analyzed|improved)\b/i.test(parsedPDF.text);
    const hasMetrics = /\b(\d+%|increased|decreased|reduced|improved by)\b/i.test(parsedPDF.text);
    const hasSkillKeywords = extractedData.skills && extractedData.skills.length > 5;
    
    if (hasActionVerbs) scores.keywords += 10;
    if (hasMetrics) scores.keywords += 10;
    if (hasSkillKeywords) scores.keywords += 5;
  } else {
    // TODO: Implement job description keyword matching
    scores.keywords = 15; // Placeholder
  }
  
  return scores;
}

/**
 * Generate improvement suggestions
 */
async function generateSuggestions(
  extractedData: ExtractedData,
  scoringBreakdown: ATSScoringCriteria,
  parsedPDF: any,
  jobDescription?: string,
  targetRole?: string
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];
  
  // Formatting suggestions
  if (scoringBreakdown.formatting < 20) {
    if (parsedPDF.pages.length > 2) {
      suggestions.push({
        category: 'formatting',
        severity: 'high',
        message: 'Resume is longer than 2 pages. Consider condensing to improve ATS compatibility.',
        section: 'Overall Format',
      });
    }
    
    if (parsedPDF.metadata.isEncrypted) {
      suggestions.push({
        category: 'formatting',
        severity: 'critical',
        message: 'PDF is encrypted. Remove encryption as it prevents ATS from reading the content.',
        section: 'File Format',
      });
    }
  }
  
  // Structure suggestions
  if (!extractedData.summary) {
    suggestions.push({
      category: 'structure',
      severity: 'medium',
      message: 'Add a professional summary or objective at the beginning of your resume.',
      section: 'Summary',
      example: 'Experienced software engineer with 5+ years developing scalable web applications...',
    });
  }
  
  if (!extractedData.skills || extractedData.skills.length < 5) {
    suggestions.push({
      category: 'content',
      severity: 'high',
      message: 'Include a dedicated skills section with at least 5-10 relevant skills.',
      section: 'Skills',
    });
  }
  
  // Content suggestions
  if (extractedData.experience) {
    extractedData.experience.forEach((exp, index) => {
      if (exp.responsibilities.length < 3) {
        suggestions.push({
          category: 'content',
          severity: 'medium',
          message: `Add more bullet points (3-5) for the ${exp.jobTitle} role at ${exp.company}.`,
          section: `Experience #${index + 1}`,
        });
      }
      
      // Check for quantifiable achievements
      const hasMetrics = exp.responsibilities.some(r => 
        /\b(\d+%|increased|decreased|reduced|improved by)\b/i.test(r)
      );
      
      if (!hasMetrics) {
        suggestions.push({
          category: 'content',
          severity: 'medium',
          message: `Add quantifiable achievements for ${exp.jobTitle} role (e.g., "Increased sales by 25%").`,
          section: `Experience #${index + 1}`,
          example: 'Reduced processing time by 40% through algorithm optimization',
        });
      }
    });
  }
  
  // Readability suggestions
  if (!extractedData.personalInfo?.email || !extractedData.personalInfo?.phone) {
    suggestions.push({
      category: 'readability',
      severity: 'critical',
      message: 'Ensure contact information (email and phone) is clearly visible at the top.',
      section: 'Contact Information',
    });
  }
  
  return suggestions;
}

/**
 * Analyze keywords (placeholder - implement with AI)
 */
async function analyzeKeywords(
  resumeText: string,
  jobDescription: string,
  extractedData: ExtractedData
): Promise<{ found: string[]; missing: string[]; density: number }> {
  // TODO: Implement proper keyword analysis with AI
  return {
    found: extractedData.skills || [],
    missing: [],
    density: 0.05,
  };
}

/**
 * Calculate confidence score
 */
function calculateConfidence(parsedPDF: any, extractedData: ExtractedData): number {
  let confidence = 0.5; // Base confidence
  
  // Increase confidence based on data completeness
  if (parsedPDF.rmsMetadata) confidence += 0.3; // RMS metadata is highly reliable
  if (extractedData.personalInfo?.email) confidence += 0.05;
  if (extractedData.experience?.length) confidence += 0.05;
  if (extractedData.education?.length) confidence += 0.05;
  if (!parsedPDF.warnings.length) confidence += 0.05;
  
  return Math.min(1, confidence);
}

// Export the flow for use in API routes
export default analyzeResumeFlow;