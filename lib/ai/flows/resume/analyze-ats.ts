/**
 * @fileOverview Enhanced ATS analysis flow with comprehensive keyword analysis and recommendations
 * 
 * @exports analyzeEnterprise - Main enterprise analysis function
 * @exports AnalyzeEnterpriseInput - Input schema for enterprise analysis
 * @exports AnalyzeEnterpriseOutput - Output schema for enterprise analysis
 */

import { ai } from '@/lib/ai/genkit';
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

// Simplified keyword analysis schema for performance
const AnalyzeEnterpriseOutputSchema = z.object({
  extractedKeywords: z.array(z.object({
    keyword: z.string(),
    category: z.enum(['skill', 'tool', 'certification', 'soft_skill', 'industry_term']),
    importance: z.enum(['required', 'preferred']),
  })),

  matchedKeywords: z.array(z.object({
    keyword: z.string(),
    category: z.string(),
  })),

  missingKeywords: z.array(z.object({
    keyword: z.string(),
    category: z.string(),
    importance: z.string(),
  })),

  summary: z.string(),
});
export type AnalyzeEnterpriseOutput = z.infer<typeof AnalyzeEnterpriseOutputSchema>;

export async function analyzeAts(input: AnalyzeEnterpriseInput): Promise<AnalyzeEnterpriseOutput> {
  'use server';
  return analyzeEnterpriseFlow(input);
}

const analyzeEnterprisePrompt = ai.definePrompt({
  name: 'analyzeEnterprisePrompt',
  input: { schema: AnalyzeEnterpriseInputSchema },
  output: { schema: AnalyzeEnterpriseOutputSchema },
  prompt: `Extract 30 keywords from the job description and check which ones appear in the resume.

**Job:** {{jobTitle}}
**Job Description:** {{jobDescription}}
**Resume:** {{resumeText}}

**Extract keywords:** Skills, tools, certifications, soft skills, and industry terms from the job description.

**Match keywords:** Search resume text for each keyword (case-insensitive). Only mark as matched if the exact keyword appears in the resume.

**Categorize:** Every keyword goes in either matchedKeywords OR missingKeywords.

Return JSON with extractedKeywords, matchedKeywords, missingKeywords, and brief summary.`,
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

  // Check if this is RMS format data - look for RMS field patterns
  const hasRMSFields = resumeData.rms_contact_fullname || resumeData.rms_experience_count || 
                      resumeData.Rms_contact_fullName || resumeData.Rms_experience_count ||
                      (resumeData.parsedData && (resumeData.parsedData.rms_contact_fullname || resumeData.parsedData.rms_experience_count));

  if (hasRMSFields) {
    // If parsedData exists and has RMS fields, use that; otherwise use resumeData directly
    const rmsData = (resumeData.parsedData && (resumeData.parsedData.rms_contact_fullname || resumeData.parsedData.rms_experience_count)) 
      ? resumeData.parsedData 
      : resumeData;
    return extractRMSResumeText(rmsData);
  }

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

// Helper function to extract resume text from RMS format data
function extractRMSResumeText(rmsData: any): string {
  const sections: string[] = [];

  // Helper to get field value (try both lowercase and uppercase variants)
  const getRmsField = (field: string) => {
    const lowerField = field.toLowerCase();
    const upperField = field.replace('rms_', 'Rms_');
    return rmsData[lowerField] || rmsData[upperField] || '';
  };

  // Add contact information
  const fullName = getRmsField('rms_contact_fullname') || getRmsField('rms_contact_fullName');
  if (fullName) {
    sections.push(`Name: ${fullName}`);
  }
  
  const email = getRmsField('rms_contact_email');
  if (email) {
    sections.push(`Email: ${email}`);
  }
  
  const phone = getRmsField('rms_contact_phone');
  if (phone) {
    sections.push(`Phone: ${phone}`);
  }
  
  const city = getRmsField('rms_contact_city');
  const state = getRmsField('rms_contact_state');
  if (city && state) {
    sections.push(`Location: ${city}, ${state}`);
  }
  
  const linkedin = getRmsField('rms_contact_linkedin');
  if (linkedin) {
    sections.push(`LinkedIn: ${linkedin}`);
  }

  // Add summary
  const summary = getRmsField('rms_summary');
  if (summary) {
    sections.push(`\nSUMMARY:\n${summary}`);
  }

  // Add work experience
  const experienceCount = getRmsField('rms_experience_count') || 0;
  if (experienceCount > 0) {
    sections.push('\nWORK EXPERIENCE:');
    for (let i = 0; i < experienceCount; i++) {
      const role = getRmsField(`rms_experience_${i}_role`);
      const company = getRmsField(`rms_experience_${i}_company`);
      const dateBegin = getRmsField(`rms_experience_${i}_datebegin`) || getRmsField(`rms_experience_${i}_dateBegin`);
      const dateEnd = getRmsField(`rms_experience_${i}_dateend`) || getRmsField(`rms_experience_${i}_dateEnd`);
      const location = getRmsField(`rms_experience_${i}_location`);
      const description = getRmsField(`rms_experience_${i}_description`);

      if (role || company) {
        sections.push(`\n${role || 'Position'} at ${company || 'Company'}`);
        if (dateBegin) sections.push(`${dateBegin}${dateEnd ? ` - ${dateEnd}` : ''}`);
        if (location) sections.push(`Location: ${location}`);
        if (description) sections.push(`${description}`);
      }
    }
  }

  // Add education
  const educationCount = getRmsField('rms_education_count') || 0;
  if (educationCount > 0) {
    sections.push('\nEDUCATION:');
    for (let i = 0; i < educationCount; i++) {
      const qualification = getRmsField(`rms_education_${i}_qualification`);
      const institution = getRmsField(`rms_education_${i}_institution`);
      const date = getRmsField(`rms_education_${i}_date`);
      const location = getRmsField(`rms_education_${i}_location`);
      const score = getRmsField(`rms_education_${i}_score`);

      if (qualification || institution) {
        sections.push(`\n${qualification || 'Degree'}`);
        sections.push(`${institution || 'Institution'}`);
        if (date) sections.push(`${date}`);
        if (location) sections.push(`Location: ${location}`);
        if (score) sections.push(`Score: ${score}`);
      }
    }
  }

  // Add skills
  const skillCount = getRmsField('rms_skill_count') || 0;
  if (skillCount > 0) {
    sections.push('\nSKILLS:');
    for (let i = 0; i < skillCount; i++) {
      const category = getRmsField(`rms_skill_${i}_category`);
      const keywords = getRmsField(`rms_skill_${i}_keywords`);
      
      if (keywords) {
        sections.push(`${category || 'Skills'}: ${keywords}`);
      }
    }
  }

  // Add certifications
  const certificationCount = getRmsField('rms_certification_count') || 0;
  if (certificationCount > 0) {
    sections.push('\nCERTIFICATIONS:');
    for (let i = 0; i < certificationCount; i++) {
      const name = getRmsField(`rms_certification_${i}_name`);
      const department = getRmsField(`rms_certification_${i}_department`) || getRmsField(`rms_certification_${i}_issuer`);
      const date = getRmsField(`rms_certification_${i}_date`);

      if (name) {
        sections.push(`${name}${department ? ` - ${department}` : ''}`);
        if (date) sections.push(`Date: ${date}`);
      }
    }
  }

  // Add projects
  const projectCount = getRmsField('rms_project_count') || 0;
  if (projectCount > 0) {
    sections.push('\nPROJECTS:');
    for (let i = 0; i < projectCount; i++) {
      const title = getRmsField(`rms_project_${i}_title`);
      const description = getRmsField(`rms_project_${i}_description`);
      const technologies = getRmsField(`rms_project_${i}_technologies`);

      if (title) {
        sections.push(`\n${title}`);
        if (description) sections.push(`${description}`);
        if (technologies) sections.push(`Technologies: ${technologies}`);
      }
    }
  }

  return sections.join('\n');
}
