// lib/genkit/analyze-resume-simple.ts
// Simplified resume analysis without full GenKit flow (Next.js compatible)

import { getGeminiModel } from './config-simple';
import { 
  type AnalyzeResumeForATSInput,
  type AnalyzeResumeForATSOutput,
  type ExtractedData,
  type Suggestion,
  type ATSScoringCriteria
} from './schemas/ats-analysis';
import { pdfParser } from './pdf-parser';

export async function analyzeResumeSimple(input: AnalyzeResumeForATSInput): Promise<AnalyzeResumeForATSOutput> {
  try {
    console.log('Starting resume analysis');
    
    // Step 1: Parse PDF and extract text/metadata
    const parsedPDF = await pdfParser.parseFromDataURI(input.resumeDataUri);
    console.log(`PDF parsed: ${parsedPDF.pages.length} pages, ${parsedPDF.metadata.wordCount} words`);
    
    // Step 2: Detect sections
    const identifiedSections = pdfParser.detectSections(parsedPDF.text);
    
    // Step 3: If we have RMS metadata, use it as a starting point
    let extractedData: Partial<ExtractedData> = {};
    if (parsedPDF.rmsMetadata) {
      console.log('Using RMS metadata for initial extraction');
      extractedData = pdfParser.transformRMSToStructuredData(parsedPDF.rmsMetadata);
    }
    
    // Step 4: Use AI to extract/enhance data
    const model = getGeminiModel();
    const prompt = createExtractionPrompt(parsedPDF.text, extractedData, input.targetRole);
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse AI response
    let aiExtraction: any = {};
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiExtraction = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse AI response as JSON, using empty extraction');
    }
    
    // Merge AI extraction with RMS metadata
    const mergedData = mergeExtractedData(extractedData, aiExtraction);
    
    // Step 5: Calculate ATS compatibility score
    const scoringBreakdown = calculateATSScore(
      parsedPDF,
      mergedData,
      identifiedSections,
      input.jobDescription
    );
    
    const atsCompatibilityScore = Object.values(scoringBreakdown).reduce((a, b) => a + b, 0);
    
    // Step 6: Generate suggestions
    const suggestions = generateSuggestions(
      mergedData,
      scoringBreakdown,
      parsedPDF,
      input.targetRole
    );
    
    // Step 7: Perform keyword analysis if job description provided
    let keywordAnalysis;
    if (input.jobDescription) {
      keywordAnalysis = analyzeKeywords(
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
    
    console.log(`Resume analysis completed. ATS Score: ${atsCompatibilityScore}`);
    return output;
    
  } catch (error) {
    console.error('Resume analysis error:', error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function createExtractionPrompt(
  resumeText: string, 
  existingData: Partial<ExtractedData>,
  targetRole?: string
): string {
  return `You are an expert ATS (Applicant Tracking System) resume analyzer.
${targetRole ? `The candidate is targeting a ${targetRole} role.` : ''}

Extract structured information from the following resume text and return it as JSON.

Resume Text:
${resumeText}

${existingData && Object.keys(existingData).length > 0 ? 
  `I have already extracted some information using metadata: ${JSON.stringify(existingData, null, 2)}` : ''}

Return a JSON object with the following structure:
{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "linkedinUrl": "string",
    "portfolioUrl": "string"
  },
  "summary": "string",
  "experience": [{
    "jobTitle": "string",
    "company": "string",
    "location": "string",
    "startDate": "string",
    "endDate": "string",
    "responsibilities": ["string"]
  }],
  "education": [{
    "degree": "string",
    "institution": "string",
    "location": "string",
    "graduationDate": "string",
    "gpa": "string"
  }],
  "skills": ["string"],
  "projects": [{
    "name": "string",
    "description": "string",
    "technologies": ["string"],
    "link": "string"
  }],
  "involvement": [{
    "organization": "string",
    "role": "string",
    "location": "string",
    "description": "string",
    "startDate": "string",
    "endDate": "string"
  }]
}

Ensure all dates are in a consistent format (MM/YYYY or Month YYYY).`;
}

function mergeExtractedData(
  rmsData: Partial<ExtractedData>,
  aiData: any
): ExtractedData {
  return {
    personalInfo: { ...aiData.personalInfo, ...rmsData.personalInfo },
    summary: rmsData.summary || aiData.summary || '',
    experience: rmsData.experience?.length ? rmsData.experience : (aiData.experience || []),
    education: rmsData.education?.length ? rmsData.education : (aiData.education || []),
    skills: [...new Set([...(rmsData.skills || []), ...(aiData.skills || [])])],
    projects: aiData.projects || [],
    involvement: rmsData.involvement?.length ? rmsData.involvement : (aiData.involvement || []),
    certifications: aiData.certifications || [],
    languages: aiData.languages || [],
    awards: aiData.awards || [],
    publications: aiData.publications || [],
  };
}

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
  
  // Keywords score (25 points max)
  if (!jobDescription) {
    const hasActionVerbs = /\b(managed|developed|implemented|created|designed|analyzed|improved)\b/i.test(parsedPDF.text);
    const hasMetrics = /\b(\d+%|increased|decreased|reduced|improved by)\b/i.test(parsedPDF.text);
    const hasSkillKeywords = extractedData.skills && extractedData.skills.length > 5;
    
    if (hasActionVerbs) scores.keywords += 10;
    if (hasMetrics) scores.keywords += 10;
    if (hasSkillKeywords) scores.keywords += 5;
  } else {
    // Basic keyword matching
    const jobKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(parsedPDF.text);
    const matchedKeywords = jobKeywords.filter(k => resumeKeywords.includes(k));
    scores.keywords = Math.min(25, Math.round((matchedKeywords.length / jobKeywords.length) * 25));
  }
  
  return scores;
}

function generateSuggestions(
  extractedData: ExtractedData,
  scoringBreakdown: ATSScoringCriteria,
  parsedPDF: any,
  targetRole?: string
): Suggestion[] {
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

function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Remove common words
  const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'been', 'will', 'are'];
  return [...new Set(words.filter(w => !stopWords.includes(w)))];
}

function analyzeKeywords(
  resumeText: string,
  jobDescription: string,
  extractedData: ExtractedData
): { found: string[]; missing: string[]; density: number } {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  
  const found = jobKeywords.filter(k => resumeKeywords.includes(k));
  const missing = jobKeywords.filter(k => !resumeKeywords.includes(k)).slice(0, 10);
  const density = found.length / jobKeywords.length;
  
  return { found: found.slice(0, 20), missing, density };
}

function calculateConfidence(parsedPDF: any, extractedData: ExtractedData): number {
  let confidence = 0.5;
  
  if (parsedPDF.rmsMetadata) confidence += 0.3;
  if (extractedData.personalInfo?.email) confidence += 0.05;
  if (extractedData.experience?.length) confidence += 0.05;
  if (extractedData.education?.length) confidence += 0.05;
  if (!parsedPDF.warnings.length) confidence += 0.05;
  
  return Math.min(1, confidence);
}