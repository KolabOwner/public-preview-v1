// lib/genkit/analyze-resume-server.ts
// Server-only resume analysis implementation with ExifTool integration

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { 
  AnalyzeResumeForATSInput,
  AnalyzeResumeForATSOutput,
  ExtractedData,
  Suggestion,
  ATSScoringCriteria,
  RMSMetadata
} from './schemas/ats-analysis';
import { RMSMetadataSchema } from './schemas/ats-analysis';
import { randomBytes } from 'crypto';

// Dynamic imports for server-only modules
const getPdfParse = () => import('pdf-parse');
const getChildProcess = () => import('child_process');
const getFs = () => import('fs/promises');
const getOs = () => import('os');
const getPath = () => import('path');

const EXIFTOOL_PATH = 'C:\\Users\\ashto\\OneDrive\\ExifTool\\exiftool.exe';
const EXIFTOOL_CONFIG_PATH = './config/exiftool/rms-config.pl';

export async function analyzeResumeServer(input: AnalyzeResumeForATSInput): Promise<AnalyzeResumeForATSOutput> {
  let tempFilePath: string | undefined;
  
  try {
    console.log('Starting server-side resume analysis with ExifTool');
    
    // Initialize Gemini
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('Google AI API key not configured');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Step 1: Parse PDF and extract text
    const pdfParse = await getPdfParse();
    const pdfData = await parsePDFDataUri(input.resumeDataUri, pdfParse.default);
    console.log(`PDF parsed: ${pdfData.numpages} pages, ${pdfData.text.split(' ').length} words`);
    
    // Step 2: Extract RMS metadata using ExifTool
    let rmsMetadata: RMSMetadata | undefined;
    try {
      // Save PDF to temp file for ExifTool
      const os = await getOs();
      const path = await getPath();
      const fs = await getFs();
      
      const tempFileName = `temp_${randomBytes(16).toString('hex')}.pdf`;
      tempFilePath = path.join(os.tmpdir(), tempFileName);
      
      // Extract base64 data and save to file
      const base64Match = input.resumeDataUri.match(/^data:application\/pdf;base64,(.+)$/);
      if (base64Match) {
        const buffer = Buffer.from(base64Match[1], 'base64');
        await fs.writeFile(tempFilePath, buffer);
        
        // Extract RMS metadata
        rmsMetadata = await extractRMSMetadata(tempFilePath);
        if (rmsMetadata) {
          console.log('Successfully extracted RMS metadata using ExifTool');
        }
      }
    } catch (error) {
      console.warn('Failed to extract RMS metadata:', error);
    }
    
    // Step 3: Detect sections
    const identifiedSections = detectSections(pdfData.text);
    
    // Step 4: If we have RMS metadata, use it as a starting point
    let extractedData: Partial<ExtractedData> = {};
    if (rmsMetadata) {
      console.log('Using RMS metadata for initial extraction');
      extractedData = transformRMSToStructuredData(rmsMetadata);
    }
    
    // Step 5: Use AI to extract/enhance data
    const prompt = createExtractionPrompt(pdfData.text, extractedData, input.targetRole);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse AI response
    let aiExtraction: any = {};
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiExtraction = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse AI response as JSON');
    }
    
    // Merge AI extraction with RMS metadata
    const mergedData = mergeExtractedData(extractedData, aiExtraction);
    
    // Step 6: Calculate ATS compatibility score
    const scoringBreakdown = calculateATSScore(
      pdfData,
      mergedData,
      identifiedSections,
      input.jobDescription
    );
    
    const atsCompatibilityScore = Object.values(scoringBreakdown).reduce((a, b) => a + b, 0);
    
    // Step 7: Generate suggestions
    const suggestions = generateSuggestions(
      mergedData,
      scoringBreakdown,
      pdfData,
      input.targetRole
    );
    
    // Step 8: Perform keyword analysis if job description provided
    let keywordAnalysis;
    if (input.jobDescription) {
      keywordAnalysis = analyzeKeywords(
        pdfData.text,
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
      parseErrors: [],
      confidence: calculateConfidence(pdfData, mergedData, rmsMetadata),
      rmsMetadata, // Include RMS metadata in output
    };
    
    console.log(`Resume analysis completed. ATS Score: ${atsCompatibilityScore}`);
    return output;
    
  } catch (error) {
    console.error('Resume analysis error:', error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        const fs = await getFs();
        await fs.unlink(tempFilePath);
      } catch (e) {
        console.warn('Failed to delete temp file:', e);
      }
    }
  }
}

async function extractRMSMetadata(pdfPath: string): Promise<RMSMetadata | undefined> {
  try {
    const { execFile } = await getChildProcess();
    const { promisify } = await import('util');
    const execFileAsync = promisify(execFile);
    
    const { stdout } = await execFileAsync(
      EXIFTOOL_PATH,
      [
        '-config', EXIFTOOL_CONFIG_PATH,
        '-j', // JSON output
        '-XMP-rms:all', // Extract all RMS metadata
        '-PDF:all', // Extract PDF metadata
        '-b', // Binary output
        pdfPath
      ],
      {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 30000, // 30 second timeout
      }
    );
    
    const metadata = JSON.parse(stdout)[0] || {};
    
    // Transform ExifTool output to match our schema
    const rmsData: any = {};
    
    // Extract RMS fields
    Object.keys(metadata).forEach(key => {
      if (key.startsWith('RMS') || key.includes('rms_')) {
        // Convert ExifTool field names to our schema format
        const fieldName = key.replace('RMS', 'rms_').replace(/-/g, '_').toLowerCase();
        rmsData[fieldName] = metadata[key];
      }
    });
    
    // Also extract standard PDF fields
    if (metadata.Producer) rmsData.producer = metadata.Producer;
    
    // Parse numeric counts
    const countFields = [
      'rms_experience_count',
      'rms_education_count',
      'rms_skill_count',
      'rms_project_count',
      'rms_involvement_count',
      'rms_certification_count',
      'rms_award_count',
      'rms_publication_count',
      'rms_reference_count',
      'rms_coursework_count'
    ];
    
    countFields.forEach(field => {
      if (rmsData[field]) {
        rmsData[field] = parseInt(rmsData[field], 10);
      }
    });
    
    // Validate against schema
    const validated = RMSMetadataSchema.safeParse(rmsData);
    
    if (validated.success) {
      console.log('Successfully extracted RMS metadata');
      return validated.data;
    } else {
      console.warn('RMS metadata validation failed:', validated.error);
      return undefined;
    }
    
  } catch (error) {
    console.error('ExifTool extraction error:', error);
    return undefined;
  }
}

function transformRMSToStructuredData(rmsMetadata: RMSMetadata): Partial<ExtractedData> {
  const result: Partial<ExtractedData> = {};
  
  // Personal Info
  if (rmsMetadata.rms_contact_fullName || rmsMetadata.rms_contact_email) {
    result.personalInfo = {
      name: rmsMetadata.rms_contact_fullName,
      email: rmsMetadata.rms_contact_email,
      phone: rmsMetadata.rms_contact_phone,
      address: [
        rmsMetadata.rms_contact_city,
        rmsMetadata.rms_contact_state,
        rmsMetadata.rms_contact_country
      ].filter(Boolean).join(', '),
      linkedinUrl: rmsMetadata.rms_contact_linkedin,
    };
  }
  
  // Experience (parse indexed fields)
  if (rmsMetadata.rms_experience_count && rmsMetadata.rms_experience_count > 0) {
    result.experience = [];
    for (let i = 0; i < rmsMetadata.rms_experience_count; i++) {
      const exp = extractIndexedRMSData(rmsMetadata, 'experience', i);
      if (exp.company || exp.role) {
        result.experience.push({
          jobTitle: exp.role || '',
          company: exp.company || '',
          location: exp.location,
          startDate: exp.dateBegin,
          endDate: exp.dateEnd,
          isCurrent: exp.isCurrent === 'true',
          responsibilities: exp.description ? [exp.description] : [],
        });
      }
    }
  }
  
  // Education (parse indexed fields)
  if (rmsMetadata.rms_education_count && rmsMetadata.rms_education_count > 0) {
    result.education = [];
    for (let i = 0; i < rmsMetadata.rms_education_count; i++) {
      const edu = extractIndexedRMSData(rmsMetadata, 'education', i);
      if (edu.institution || edu.qualification) {
        result.education.push({
          degree: edu.qualification || '',
          institution: edu.institution || '',
          location: edu.location,
          graduationDate: edu.date,
          gpa: edu.score,
        });
      }
    }
  }
  
  // Involvement (parse indexed fields)
  if (rmsMetadata.rms_involvement_count && rmsMetadata.rms_involvement_count > 0) {
    result.involvement = [];
    for (let i = 0; i < rmsMetadata.rms_involvement_count; i++) {
      const inv = extractIndexedRMSData(rmsMetadata, 'involvement', i);
      if (inv.organization || inv.role) {
        result.involvement.push({
          organization: inv.organization || '',
          role: inv.role || '',
          location: inv.location,
          description: inv.description || '',
          startDate: inv.dateBegin,
          endDate: inv.dateEnd,
          isCurrent: inv.dateEnd ? false : true,
        });
      }
    }
  }
  
  // Skills (parse indexed fields)
  if (rmsMetadata.rms_skill_count && rmsMetadata.rms_skill_count > 0) {
    result.skills = [];
    for (let i = 0; i < rmsMetadata.rms_skill_count; i++) {
      const skill = extractIndexedRMSData(rmsMetadata, 'skill', i);
      if (skill.keywords) {
        // Split keywords by comma and add to skills array
        const keywords = skill.keywords.split(',').map((s: string) => s.trim()).filter(Boolean);
        result.skills.push(...keywords);
      }
    }
  }
  
  return result;
}

function extractIndexedRMSData(metadata: any, type: string, index: number): any {
  const result: any = {};
  const prefix = `rms_${type}_${index}_`;
  
  Object.keys(metadata).forEach(key => {
    if (key.startsWith(prefix)) {
      const fieldName = key.replace(prefix, '');
      result[fieldName] = metadata[key];
    }
  });
  
  return result;
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
    skills: Array.from(new Set([...(rmsData.skills || []), ...(aiData.skills || [])])),
    projects: aiData.projects || [],
    involvement: rmsData.involvement?.length ? rmsData.involvement : (aiData.involvement || []),
    certifications: aiData.certifications || [],
    languages: aiData.languages || [],
    awards: aiData.awards || [],
    publications: aiData.publications || [],
  };
}

async function parsePDFDataUri(dataURI: string, pdfParse: any): Promise<any> {
  // Extract base64 data from data URI
  const base64Match = dataURI.match(/^data:application\/pdf;base64,(.+)$/);
  if (!base64Match) {
    throw new Error('Invalid PDF data URI format');
  }
  
  const buffer = Buffer.from(base64Match[1], 'base64');
  return await pdfParse(buffer);
}

function detectSections(text: string): string[] {
  const sections: string[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  const sectionPatterns = [
    { pattern: /^(personal\s+information|contact\s+info)/i, name: 'Contact Information' },
    { pattern: /^(professional\s+)?summary|objective|profile/i, name: 'Summary' },
    { pattern: /^(work\s+)?experience|employment|professional\s+experience/i, name: 'Work Experience' },
    { pattern: /^education|academic/i, name: 'Education' },
    { pattern: /^skills|technical\s+skills|core\s+competencies/i, name: 'Skills' },
    { pattern: /^projects|portfolio/i, name: 'Projects' },
    { pattern: /^(involvement|activities|volunteer|leadership)/i, name: 'Involvement' },
    { pattern: /^certifications?|licenses?/i, name: 'Certifications' },
    { pattern: /^awards?|achievements?|honors?/i, name: 'Awards' },
    { pattern: /^publications?|papers?/i, name: 'Publications' },
    { pattern: /^languages?/i, name: 'Languages' },
    { pattern: /^references?/i, name: 'References' },
  ];
  
  for (const line of lines) {
    for (const { pattern, name } of sectionPatterns) {
      if (pattern.test(line) && !sections.includes(name)) {
        sections.push(name);
        break;
      }
    }
  }
  
  return sections;
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

function calculateATSScore(
  pdfData: any,
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
  if (pdfData.version && !pdfData.info?.Encrypted) scores.formatting += 10;
  if (pdfData.numpages <= 2) scores.formatting += 5;
  const wordCount = pdfData.text.split(' ').length;
  if (wordCount >= 200 && wordCount <= 800) scores.formatting += 5;
  if (pdfData.text.length > 100) scores.formatting += 5;
  
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
    const hasActionVerbs = /\b(managed|developed|implemented|created|designed|analyzed|improved)\b/i.test(pdfData.text);
    const hasMetrics = /\b(\d+%|increased|decreased|reduced|improved by)\b/i.test(pdfData.text);
    const hasSkillKeywords = extractedData.skills && extractedData.skills.length > 5;
    
    if (hasActionVerbs) scores.keywords += 10;
    if (hasMetrics) scores.keywords += 10;
    if (hasSkillKeywords) scores.keywords += 5;
  } else {
    // Basic keyword matching
    const jobKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(pdfData.text);
    const matchedKeywords = jobKeywords.filter(k => resumeKeywords.includes(k));
    scores.keywords = Math.min(25, Math.round((matchedKeywords.length / jobKeywords.length) * 25));
  }
  
  return scores;
}

function generateSuggestions(
  extractedData: ExtractedData,
  scoringBreakdown: ATSScoringCriteria,
  pdfData: any,
  targetRole?: string
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Formatting suggestions
  if (scoringBreakdown.formatting < 20) {
    if (pdfData.numpages > 2) {
      suggestions.push({
        category: 'formatting',
        severity: 'high',
        message: 'Resume is longer than 2 pages. Consider condensing to improve ATS compatibility.',
        section: 'Overall Format',
      });
    }
    
    if (pdfData.info?.Encrypted) {
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
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'been', 'will', 'are'];
  return Array.from(new Set(words.filter(w => !stopWords.includes(w))));
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

function calculateConfidence(pdfData: any, extractedData: ExtractedData, rmsMetadata?: RMSMetadata): number {
  let confidence = 0.5;
  
  if (rmsMetadata) confidence += 0.3; // High confidence if we have RMS metadata
  if (extractedData.personalInfo?.email) confidence += 0.05;
  if (extractedData.experience?.length) confidence += 0.05;
  if (extractedData.education?.length) confidence += 0.05;
  if (pdfData.text.length > 100) confidence += 0.05;
  
  return Math.min(1, confidence);
}