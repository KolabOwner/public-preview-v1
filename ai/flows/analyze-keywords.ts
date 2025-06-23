/**
 * @fileOverview Focused keyword analysis flow for ATS scoring
 * 
 * @exports analyzeKeywords - Main keyword analysis function
 * @exports AnalyzeKeywordsInput - Input schema for keyword analysis
 * @exports AnalyzeKeywordsOutput - Output schema for keyword analysis
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for keyword analysis
const AnalyzeKeywordsInputSchema = z.object({
  resumeText: z.string().describe('The resume content as plain text'),
  jobTitle: z.string().describe('The title of the job position'),
  jobDescription: z.string().describe('The complete job description and requirements'),
});
export type AnalyzeKeywordsInput = z.infer<typeof AnalyzeKeywordsInputSchema>;

// Output schema focused on high-quality keyword extraction
const AnalyzeKeywordsOutputSchema = z.object({
  // ATS Score
  atsScore: z.number().min(0).max(100).describe('Overall ATS compatibility score'),
  
  // Matched Keywords - found in both job and resume
  matchedKeywords: z.array(z.object({
    keyword: z.string().describe('The exact keyword or phrase'),
    category: z.enum(['technical_skill', 'tool_technology', 'domain_expertise', 'certification', 'soft_skill', 'industry_term']),
    variations: z.array(z.string()).describe('Alternative forms found (e.g., "React.js" for "React")'),
    contextInJob: z.string().describe('How this keyword appears in the job description'),
  })).describe('Keywords found in both job description and resume'),
  
  // Missing Keywords - prioritizing multi-term and meaningful phrases
  missingKeywords: z.array(z.object({
    keyword: z.string().describe('The exact keyword or phrase missing'),
    category: z.enum(['technical_skill', 'tool_technology', 'domain_expertise', 'certification', 'soft_skill', 'industry_term']),
    importance: z.enum(['must_have', 'strongly_preferred', 'nice_to_have']),
    contextInJob: z.string().describe('The sentence or context where this appears in the job'),
    relatedTermsInResume: z.array(z.string()).describe('Similar terms already in resume that could be enhanced'),
    isMultiTerm: z.boolean().describe('Whether this is a multi-word phrase'),
  })).describe('Important keywords missing from resume, prioritizing meaningful multi-term phrases'),
  
  // Additional extracted keywords from job for reference
  allJobKeywords: z.array(z.object({
    keyword: z.string(),
    category: z.enum(['technical_skill', 'tool_technology', 'domain_expertise', 'certification', 'soft_skill', 'industry_term']),
    frequency: z.number().describe('How often it appears in the job description'),
  })).describe('All meaningful keywords extracted from the job description'),
});
export type AnalyzeKeywordsOutput = z.infer<typeof AnalyzeKeywordsOutputSchema>;

export async function analyzeKeywords(input: AnalyzeKeywordsInput): Promise<AnalyzeKeywordsOutput> {
  'use server';
  return analyzeKeywordsFlow(input);
}

const analyzeKeywordsPrompt = ai.definePrompt({
  name: 'analyzeKeywordsPrompt',
  input: { schema: AnalyzeKeywordsInputSchema },
  output: { schema: AnalyzeKeywordsOutputSchema },
  prompt: `You are an expert ATS keyword analyst. Extract and analyze keywords with a focus on meaningful, multi-term phrases.

**Job Title:** {{jobTitle}}

**Job Description:**
{{jobDescription}}

**Resume:**
{{resumeText}}

**Analysis Instructions:**

1. **Extract All Job Keywords:**
   - Prioritize multi-word technical phrases (e.g., "machine learning", "cloud architecture", "agile methodology")
   - Include specific tools/technologies with versions (e.g., "React 18", "Python 3.x", "AWS Lambda")
   - Capture domain-specific terms (e.g., "financial modeling", "supply chain optimization")
   - Include certifications by full name (e.g., "AWS Certified Solutions Architect")
   - Identify industry-specific terminology and methodologies

2. **Keyword Matching Rules:**
   - Consider variations as matches (e.g., "JS" matches "JavaScript", "ML" matches "Machine Learning")
   - Multi-term phrases should match even if words are slightly reordered
   - Partial matches count if the core competency is demonstrated

3. **Missing Keywords Priority:**
   - MUST prioritize multi-term, specific phrases over single words
   - "Data science with Python" is better than just "Python"
   - "RESTful API development" is better than just "API"
   - Include the exact context from the job description
   - Group related single-word terms into meaningful phrases when possible

4. **Importance Classification:**
   - must_have: Explicitly required, uses words like "required", "must have", "essential"
   - strongly_preferred: Uses words like "preferred", "ideal", "strong", "should have"
   - nice_to_have: Uses words like "bonus", "plus", "beneficial", "desired"

5. **ATS Scoring:**
   - 90-100: Has 90%+ of must_have keywords and 70%+ of strongly_preferred
   - 70-89: Has 70%+ of must_have keywords and 50%+ of strongly_preferred
   - 50-69: Has 50%+ of must_have keywords
   - Below 50: Missing critical must_have keywords

**Output Requirements:**
- Extract meaningful phrases, not just individual words
- Preserve the exact phrasing from the job description
- Include context to show where/how the keyword is used
- Identify related terms in resume that could be enhanced
- Mark multi-term phrases with isMultiTerm: true`,
});

const analyzeKeywordsFlow = ai.defineFlow(
  {
    name: 'analyzeKeywordsFlow',
    inputSchema: AnalyzeKeywordsInputSchema,
    outputSchema: AnalyzeKeywordsOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeKeywordsPrompt(input);
    return output!;
  }
);

// Helper function to extract text from parsed resume data
export function extractResumeTextSimple(resumeData: any): string {
  const sections: string[] = [];

  // Contact
  const contact = resumeData.contact || resumeData.contactInfo || {};
  const name = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  if (name) sections.push(name);

  // Summary
  if (resumeData.summary) {
    sections.push(resumeData.summary);
  }

  // Experience
  if (resumeData.experience?.length > 0) {
    resumeData.experience.forEach((exp: any) => {
      sections.push(`${exp.position || exp.title} at ${exp.company}`);
      if (exp.description) sections.push(exp.description);
    });
  }

  // Education
  if (resumeData.education?.length > 0) {
    resumeData.education.forEach((edu: any) => {
      const degree = edu.qualification || edu.degree || 'Degree';
      const field = edu.fieldOfStudy || '';
      sections.push(`${degree} ${field ? 'in ' + field : ''} from ${edu.institution || edu.school}`);
      if (edu.gpa) sections.push(`GPA: ${edu.gpa}`);
    });
  }

  // Skills
  if (resumeData.skills?.length > 0) {
    resumeData.skills.forEach((skill: any) => {
      if (skill.keywords) sections.push(`${skill.category || 'Skills'}: ${skill.keywords}`);
    });
  }

  // Projects
  if (resumeData.projects?.length > 0) {
    resumeData.projects.forEach((project: any) => {
      sections.push(project.title || project.name);
      if (project.description) sections.push(project.description);
      if (project.role) sections.push(`Role: ${project.role}`);
    });
  }

  // Certifications
  if (resumeData.certifications?.length > 0) {
    resumeData.certifications.forEach((cert: any) => {
      sections.push(`${cert.name} from ${cert.issuer}`);
      if (cert.description) sections.push(cert.description);
    });
  }

  // Involvement
  if (resumeData.involvement?.length > 0) {
    resumeData.involvement.forEach((inv: any) => {
      sections.push(`${inv.role} at ${inv.organization}`);
      if (inv.description) sections.push(inv.description);
    });
  }

  // Awards
  if (resumeData.awards?.length > 0) {
    resumeData.awards.forEach((award: any) => {
      sections.push(`${award.title || award.name} from ${award.issuer || award.organization}`);
      if (award.description) sections.push(award.description);
    });
  }

  // Publications
  if (resumeData.publications?.length > 0) {
    resumeData.publications.forEach((pub: any) => {
      sections.push(pub.title);
      if (pub.journal) sections.push(`Published in ${pub.journal}`);
      if (pub.description) sections.push(pub.description);
    });
  }

  // Languages
  if (resumeData.languages?.length > 0) {
    const langs = resumeData.languages.map((lang: any) => 
      `${lang.name}${lang.proficiency ? ' (' + lang.proficiency + ')' : ''}`
    ).join(', ');
    sections.push(`Languages: ${langs}`);
  }

  // Volunteer
  if (resumeData.volunteer?.length > 0) {
    resumeData.volunteer.forEach((vol: any) => {
      sections.push(`${vol.role || vol.title} at ${vol.organization}`);
      if (vol.description) sections.push(vol.description);
    });
  }

  // Coursework
  if (resumeData.coursework?.length > 0) {
    const courses = resumeData.coursework.map((course: any) => course.name).join(', ');
    sections.push(`Relevant Coursework: ${courses}`);
  }

  return sections.join('\n\n');
}