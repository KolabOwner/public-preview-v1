/**
 * @fileOverview Enhanced ATS analysis flow with comprehensive keyword analysis and recommendations
 * 
 * @exports analyzeEnterprise - Main enterprise analysis function
 * @exports AnalyzeEnterpriseInput - Input schema for enterprise analysis
 * @exports AnalyzeEnterpriseOutput - Output schema for enterprise analysis
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Enhanced input schema for enterprise analysis
const AnalyzeEnterpriseInputSchema = z.object({
  resumeText: z.string().describe('The resume content as plain text'),
  jobTitle: z.string().describe('The title of the job position'),
  jobDescription: z.string().describe('The complete job description and requirements'),
  jobCompany: z.string().optional().describe('The company name'),
  industryContext: z.string().optional().describe('Industry context for better analysis'),
  targetATSScore: z.number().min(0).max(100).optional().describe('Target ATS score to aim for'),
  includeRecommendations: z.boolean().default(true).describe('Whether to include optimization recommendations'),
});
export type AnalyzeEnterpriseInput = z.infer<typeof AnalyzeEnterpriseInputSchema>;

// Enhanced output schema with detailed analysis
const AnalyzeEnterpriseOutputSchema = z.object({
  // Overall ATS Analysis
  atsScore: z.number().min(0).max(100).describe('Overall ATS compatibility score (0-100)'),
  breakdown: z.object({
    keywordMatch: z.number().min(0).max(100).describe('Keyword matching score'),
    skillsAlignment: z.number().min(0).max(100).describe('Skills alignment score'),
    experienceRelevance: z.number().min(0).max(100).describe('Experience relevance score'),
    educationMatch: z.number().min(0).max(100).describe('Education requirements match'),
    formatting: z.number().min(0).max(100).describe('ATS-friendly formatting score'),
  }).describe('Detailed breakdown of the ATS score'),

  // Keyword Analysis
  extractedKeywords: z.array(z.object({
    keyword: z.string(),
    frequency: z.number().min(1),
    category: z.enum(['skill', 'tool', 'qualification', 'soft_skill', 'certification', 'industry_term']),
    importance: z.enum(['required', 'preferred', 'nice_to_have']),
    variations: z.array(z.string()),
    contexts: z.array(z.string()),
  })).describe('Keywords extracted from the job description'),

  matchedKeywords: z.array(z.object({
    keyword: z.string(),
    category: z.string(),
    resumeFrequency: z.number().min(0),
    jobFrequency: z.number().min(1),
    relevanceScore: z.number().min(0).max(100),
    isExactMatch: z.boolean(),
    isSynonymMatch: z.boolean(),
    matchedVariations: z.array(z.string()),
  })).describe('Keywords that match between resume and job description'),

  missingKeywords: z.array(z.object({
    keyword: z.string(),
    category: z.string(),
    importance: z.enum(['critical', 'high', 'medium', 'low']),
    suggestions: z.array(z.string()),
    relatedTermsInResume: z.array(z.string()),
    impactOnScore: z.number().min(0).max(20),
  })).describe('Important keywords missing from the resume'),

  // Recommendations for improvement
  recommendations: z.array(z.object({
    type: z.enum(['add_keyword', 'rephrase', 'quantify', 'format', 'structure', 'skills_emphasis']),
    priority: z.enum(['high', 'medium', 'low']),
    section: z.string(),
    currentText: z.string().optional(),
    suggestedText: z.string(),
    reason: z.string(),
    keywords: z.array(z.string()),
    estimatedImpact: z.number().min(0).max(20),
  })).describe('Actionable recommendations to improve ATS score'),

  // Summary and insights
  summary: z.object({
    strengths: z.array(z.string()).describe('Key strengths of the resume for this position'),
    weaknesses: z.array(z.string()).describe('Areas that need improvement'),
    quickWins: z.array(z.string()).describe('Easy changes that would have high impact'),
    overallFit: z.string().describe('Overall assessment of candidate fit'),
  }).describe('Executive summary of the analysis'),
});
export type AnalyzeEnterpriseOutput = z.infer<typeof AnalyzeEnterpriseOutputSchema>;

export async function analyzeEnterprise(input: AnalyzeEnterpriseInput): Promise<AnalyzeEnterpriseOutput> {
  'use server';
  return analyzeEnterpriseFlow(input);
}

const analyzeEnterprisePrompt = ai.definePrompt({
  name: 'analyzeEnterprisePrompt',
  input: { schema: AnalyzeEnterpriseInputSchema },
  output: { schema: AnalyzeEnterpriseOutputSchema },
  prompt: `You are an expert ATS (Applicant Tracking System) analyst and senior career coach with deep knowledge of recruiting, hiring practices, and resume optimization. Your task is to perform a comprehensive analysis of a resume against a specific job description.

**Job Information:**
Position: {{jobTitle}}
{{#jobCompany}}Company: {{jobCompany}}{{/jobCompany}}
{{#industryContext}}Industry: {{industryContext}}{{/industryContext}}
{{#targetATSScore}}Target ATS Score: {{targetATSScore}}{{/targetATSScore}}

**Job Description:**
---
{{jobDescription}}
---

**Resume Content:**
---
{{resumeText}}
---

**Analysis Instructions:**

1. **Keyword Extraction & Analysis:**
   - **CRITICAL REQUIREMENT: Extract AT LEAST 25-40 keywords from the job description**
   - Be comprehensive and thorough - include ALL relevant terms:
     * Technical skills and tools (e.g., Python, SQL, AWS, Docker, Git, APIs, REST, GraphQL)
     * Soft skills and competencies (e.g., leadership, communication, problem-solving, teamwork)
     * Qualifications and certifications (e.g., Bachelor's degree, MBA, PMP, AWS Certified)
     * Industry-specific terms and domain knowledge (e.g., SaaS, B2B, fintech, healthcare)
     * Experience requirements (e.g., "5+ years", "senior level", "team management")
     * Action verbs and responsibilities (e.g., "develop", "implement", "optimize", "lead")
     * Methodologies and frameworks (e.g., Agile, Scrum, DevOps, CI/CD, SDLC)
     * Business concepts (e.g., ROI, KPIs, stakeholder management, strategic planning)
   - Include both single-word and multi-word phrases as keywords
   - Extract variations, abbreviations, and related terms (e.g., "JavaScript" → also include "JS", "Node.js")
   - Don't filter out keywords - include all relevant terms regardless of perceived importance
   - Categorize each keyword by type and importance level
   - Identify variations and synonyms that should be recognized

2. **Keyword Matching:**
   - Compare resume content against extracted keywords
   - Account for variations, plurals, and synonyms (e.g., "API" matches "APIs", "JavaScript" matches "JS")
   - Calculate relevance scores based on context and frequency
   - Distinguish between exact matches and synonym matches

3. **Missing Keywords Analysis:**
   - Identify critical keywords absent from the resume
   - Prioritize by impact on hiring decision
   - Suggest related terms already present in resume
   - Estimate score impact of each missing keyword

4. **ATS Score Calculation:**
   - **Keyword Match (40%):** Percentage of important keywords found
   - **Skills Alignment (25%):** How well candidate's skills match requirements
   - **Experience Relevance (20%):** Relevance of work history to role
   - **Education Match (10%):** Education requirements satisfaction
   - **Formatting (5%):** ATS-friendly structure and formatting

5. **Optimization Recommendations:**
   - Provide specific, actionable suggestions
   - Focus on highest-impact changes first
   - Include exact text suggestions where appropriate
   - Consider both keyword inclusion and natural readability

6. **Executive Summary:**
   - Highlight key strengths that align with the role
   - Identify critical gaps and weaknesses
   - Suggest quick wins for immediate improvement
   - Provide overall fit assessment

**Output Requirements:**
- **MANDATORY: The extractedKeywords array MUST contain at least 25-40 keywords**
- If the job description is brief, still extract compound phrases, related terms, and implied skills
- Be specific and actionable in all recommendations
- Use exact keywords from the job description
- Provide realistic improvement estimates
- Focus on changes that maintain authenticity
- Consider ATS parsing limitations and best practices
- Ensure comprehensive keyword coverage across all categories

Return a comprehensive JSON analysis following the specified schema.`,
});

const analyzeEnterpriseFlow = ai.defineFlow(
  {
    name: 'analyzeEnterpriseFlow',
    inputSchema: AnalyzeEnterpriseInputSchema,
    outputSchema: AnalyzeEnterpriseOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeEnterprisePrompt(input);
    return output!;
  }
);

// Helper function to extract resume text from resume data
export function extractResumeText(resumeData: any): string {
  const sections: string[] = [];

  // Add contact information
  if (resumeData.contactInfo || resumeData.contact) {
    const contact = resumeData.contactInfo || resumeData.contact;
    const name = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    if (name) sections.push(`Name: ${name}`);
    if (contact.email) sections.push(`Email: ${contact.email}`);
    if (contact.phone) sections.push(`Phone: ${contact.phone}`);
    if (contact.city && contact.state) sections.push(`Location: ${contact.city}, ${contact.state}`);
    if (contact.linkedin) sections.push(`LinkedIn: ${contact.linkedin}`);
  }

  // Add summary
  if (resumeData.summary) {
    sections.push(`\nSUMMARY:\n${resumeData.summary}`);
  }

  // Add work experience
  if (resumeData.experiences && resumeData.experiences.length > 0) {
    sections.push('\nWORK EXPERIENCE:');
    resumeData.experiences.forEach((exp: any) => {
      sections.push(`\n${exp.title || 'Position'} at ${exp.company || 'Company'}`);
      if (exp.startDate || exp.endDate) {
        sections.push(`${exp.startDate || ''} - ${exp.endDate || 'Present'}`);
      }
      if (exp.location) sections.push(`Location: ${exp.location}`);
      if (exp.description) sections.push(`${exp.description}`);
    });
  }

  // Add education
  if (resumeData.education && resumeData.education.length > 0) {
    sections.push('\nEDUCATION:');
    resumeData.education.forEach((edu: any) => {
      const degree = edu.degree && edu.fieldOfStudy ? 
        `${edu.degree} in ${edu.fieldOfStudy}` : 
        edu.qualification || edu.degree || 'Degree';
      sections.push(`\n${degree}`);
      sections.push(`${edu.institution || edu.school || 'Institution'}`);
      if (edu.endDate || edu.date) sections.push(`${edu.endDate || edu.date}`);
      if (edu.score || edu.gpa) sections.push(`GPA: ${edu.score || edu.gpa}`);
    });
  }

  // Add skills
  if (resumeData.skillCategories && resumeData.skillCategories.length > 0) {
    sections.push('\nSKILLS:');
    resumeData.skillCategories.forEach((category: any) => {
      const skills = Array.isArray(category.skills) 
        ? category.skills.map((skill: any) => typeof skill === 'string' ? skill : skill.name).join(', ')
        : category.skills;
      sections.push(`${category.name}: ${skills}`);
    });
  }

  // Add projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    sections.push('\nPROJECTS:');
    resumeData.projects.forEach((project: any) => {
      sections.push(`\n${project.title || 'Project'}`);
      if (project.organization) sections.push(`Organization: ${project.organization}`);
      if (project.description) sections.push(`${project.description}`);
      if (project.technologies) {
        const tech = Array.isArray(project.technologies) 
          ? project.technologies.join(', ') 
          : project.technologies;
        sections.push(`Technologies: ${tech}`);
      }
    });
  }

  // Add certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    sections.push('\nCERTIFICATIONS:');
    resumeData.certifications.forEach((cert: any) => {
      sections.push(`${cert.name || cert.title || 'Certification'} - ${cert.issuer || cert.organization || 'Issuer'}`);
      if (cert.issueDate || cert.date) sections.push(`Date: ${cert.issueDate || cert.date}`);
    });
  }

  // Add awards
  if (resumeData.awards && resumeData.awards.length > 0) {
    sections.push('\nAWARDS:');
    resumeData.awards.forEach((award: any) => {
      sections.push(`${award.title || award.name || 'Award'} - ${award.issuer || award.organization || 'Issuer'}`);
      if (award.date) sections.push(`Date: ${award.date}`);
      if (award.description) sections.push(`${award.description}`);
    });
  }

  // Add languages
  if (resumeData.languages && resumeData.languages.length > 0) {
    sections.push('\nLANGUAGES:');
    resumeData.languages.forEach((lang: any) => {
      const proficiency = lang.proficiency ? ` - ${lang.proficiency}` : '';
      sections.push(`${lang.name}${proficiency}`);
    });
  }

  return sections.join('\n');
}

// Helper function to calculate overall ATS score from breakdown
export function calculateATSScore(breakdown: {
  keywordMatch: number;
  skillsAlignment: number;
  experienceRelevance: number;
  educationMatch: number;
  formatting: number;
}): number {
  const weights = {
    keywordMatch: 0.40,
    skillsAlignment: 0.25,
    experienceRelevance: 0.20,
    educationMatch: 0.10,
    formatting: 0.05,
  };

  return Math.round(
    breakdown.keywordMatch * weights.keywordMatch +
    breakdown.skillsAlignment * weights.skillsAlignment +
    breakdown.experienceRelevance * weights.experienceRelevance +
    breakdown.educationMatch * weights.educationMatch +
    breakdown.formatting * weights.formatting
  );
}