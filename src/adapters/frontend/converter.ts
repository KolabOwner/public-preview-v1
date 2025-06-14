// src/adapters/frontend/converter.ts
// Converts RMS data format to frontend-compatible format

import { RMSData } from '../../lib/schema';
import { RMSUtilities } from '../../lib/utilities';

/**
 * Interface matching the frontend's expected resume data format
 */
export interface FrontendResumeData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  sections: {
    contact: {
      name: string;
      email: string;
      phone: string;
      linkedin?: string;
      github?: string;
      website?: string;
      location?: string;
    };
    summary?: string;
    experience: Array<{
      id: string;
      company: string;
      jobTitle: string;
      location?: string;
      startDate: string;
      endDate: string;
      isCurrent: boolean;
      description: string;
    }>;
    education: Array<{
      id: string;
      institution: string;
      qualification: string;
      location?: string;
      date: string;
      minor?: string;
      gpa?: string;
    }>;
    skills: Array<{
      id: string;
      category: string;
      skills: string[];
    }>;
    projects: Array<{
      id: string;
      title: string;
      organization?: string;
      description: string;
      technologies?: string[];
    }>;
    involvement: Array<{
      id: string;
      organization: string;
      role: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      description: string;
    }>;
    certifications: Array<{
      id: string;
      name: string;
      issuer: string;
      date?: string;
    }>;
  };
}

/**
 * Converts RMS data to frontend-friendly format
 */
export function convertToFrontendFormat(rmsData: RMSData, userId?: string): FrontendResumeData {
  // Get the readable format as a starting point
  const readable = RMSUtilities.toReadableFormat(rmsData);
  
  // Generate a unique ID if one doesn't exist
  const id = generateId();
  const timestamp = new Date();
  
  // Create the base structure
  const frontendData: FrontendResumeData = {
    id,
    title: readable.contact.fullName 
      ? `${readable.contact.fullName}'s Resume` 
      : 'Untitled Resume',
    createdAt: timestamp,
    updatedAt: timestamp,
    userId,
    sections: {
      contact: {
        name: readable.contact.fullName || '',
        email: readable.contact.email || '',
        phone: readable.contact.phone || '',
        linkedin: readable.contact.linkedin !== 'n/a' ? readable.contact.linkedin : undefined,
        github: readable.contact.github !== 'n/a' ? readable.contact.github : undefined,
        website: readable.contact.website !== 'n/a' ? readable.contact.website : undefined,
        location: formatLocation(readable.contact)
      },
      summary: readable.summary !== 'n/a' ? readable.summary : undefined,
      experience: [],
      education: [],
      skills: [],
      projects: [],
      involvement: [],
      certifications: []
    }
  };
  
  // Map experiences
  if (Array.isArray(readable.experiences)) {
    frontendData.sections.experience = readable.experiences.map((exp, index) => ({
      id: `exp-${id}-${index}`,
      company: exp.company !== 'n/a' ? exp.company : '',
      jobTitle: exp.role !== 'n/a' ? exp.role : '',
      location: exp.location !== 'n/a' ? exp.location : undefined,
      startDate: exp.dateBegin !== 'n/a' ? exp.dateBegin : '',
      endDate: exp.dateEnd !== 'n/a' ? exp.dateEnd : '',
      isCurrent: exp.isCurrent === 'true' || exp.dateEnd === 'Present',
      description: exp.description !== 'n/a' ? exp.description : ''
    }));
  }
  
  // Map education
  if (Array.isArray(readable.education)) {
    frontendData.sections.education = readable.education.map((edu, index) => ({
      id: `edu-${id}-${index}`,
      institution: edu.institution !== 'n/a' ? edu.institution : '',
      qualification: edu.qualification !== 'n/a' ? edu.qualification : '',
      location: edu.location !== 'n/a' ? edu.location : undefined,
      date: edu.date !== 'n/a' ? edu.date : '',
      minor: edu.minor !== 'n/a' ? edu.minor : undefined,
      gpa: edu.score !== 'n/a' ? edu.score : undefined
    }));
  }
  
  // Map skills
  if (Array.isArray(readable.skills)) {
    frontendData.sections.skills = readable.skills.map((skill, index) => ({
      id: `skill-${id}-${index}`,
      category: skill.category !== 'n/a' ? skill.category : 'Skills',
      skills: skill.keywords !== 'n/a' 
        ? skill.keywords.split(',').map(s => s.trim()) 
        : []
    }));
  }
  
  // Map projects
  if (Array.isArray(readable.projects)) {
    frontendData.sections.projects = readable.projects.map((proj, index) => {
      // Extract technologies from description if possible
      const techMatches = proj.description?.match(/(?:using|built with|developed with|technologies:|stack:)\s*([^.\n]*)/i);
      const technologies = techMatches && techMatches[1]
        ? techMatches[1].split(/[,|]/g).map(tech => tech.trim()).filter(tech => tech.length > 0)
        : undefined;
      
      return {
        id: `proj-${id}-${index}`,
        title: proj.title !== 'n/a' ? proj.title : '',
        organization: proj.organization !== 'n/a' ? proj.organization : undefined,
        description: proj.description !== 'n/a' ? proj.description : '',
        technologies
      };
    });
  }
  
  // Map involvement
  if (Array.isArray(readable.involvement)) {
    frontendData.sections.involvement = readable.involvement.map((inv, index) => ({
      id: `inv-${id}-${index}`,
      organization: inv.organization !== 'n/a' ? inv.organization : '',
      role: inv.role !== 'n/a' ? inv.role : '',
      location: inv.location !== 'n/a' ? inv.location : undefined,
      startDate: inv.dateBegin !== 'n/a' ? inv.dateBegin : undefined,
      endDate: inv.dateEnd !== 'n/a' ? inv.dateEnd : undefined,
      description: inv.description !== 'n/a' ? inv.description : ''
    }));
  }
  
  // Map certifications
  if (Array.isArray(readable.certifications)) {
    frontendData.sections.certifications = readable.certifications.map((cert, index) => ({
      id: `cert-${id}-${index}`,
      name: cert.name !== 'n/a' ? cert.name : '',
      issuer: cert.issuer !== 'n/a' ? cert.issuer : '',
      date: cert.date !== 'n/a' ? cert.date : undefined
    }));
  }
  
  return frontendData;
}

/**
 * Converts frontend format back to RMS format
 */
export function convertFromFrontendFormat(frontendData: FrontendResumeData): RMSData {
  // Create readable format structure first
  const readable = {
    contact: {
      fullName: frontendData.sections.contact.name,
      givenNames: frontendData.sections.contact.name.split(' ')[0],
      lastName: frontendData.sections.contact.name.split(' ').pop(),
      email: frontendData.sections.contact.email,
      phone: frontendData.sections.contact.phone,
      linkedin: frontendData.sections.contact.linkedin || 'n/a',
      github: frontendData.sections.contact.github || 'n/a',
      website: frontendData.sections.contact.website || 'n/a'
    },
    summary: frontendData.sections.summary || 'n/a',
    experiences: frontendData.sections.experience.map(exp => ({
      company: exp.company,
      role: exp.jobTitle,
      location: exp.location || 'n/a',
      dateBegin: exp.startDate,
      dateEnd: exp.endDate,
      isCurrent: exp.isCurrent,
      description: exp.description
    })),
    education: frontendData.sections.education.map(edu => ({
      institution: edu.institution,
      qualification: edu.qualification,
      location: edu.location || 'n/a',
      date: edu.date,
      minor: edu.minor || 'n/a',
      score: edu.gpa || 'n/a',
      scoreType: edu.gpa ? 'GPA' : 'n/a'
    })),
    skills: frontendData.sections.skills.map(skill => ({
      category: skill.category,
      keywords: skill.skills.join(', ')
    })),
    projects: frontendData.sections.projects.map(proj => ({
      title: proj.title,
      organization: proj.organization || 'n/a',
      description: proj.description
    })),
    involvement: frontendData.sections.involvement.map(inv => ({
      organization: inv.organization,
      role: inv.role,
      location: inv.location || 'n/a',
      dateBegin: inv.startDate || 'n/a',
      dateEnd: inv.endDate || 'n/a',
      description: inv.description
    })),
    certifications: frontendData.sections.certifications.map(cert => ({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date || 'n/a'
    }))
  };
  
  // Use RMSUtilities to convert to indexed format
  return RMSUtilities.fromReadableFormat(readable) as RMSData;
}

/**
 * Alternative implementation of the Frontend conversion
 * Uses the original format expected by the `AlternativeResumeData` format
 */
export function convertToAlternativeFormat(rmsData: RMSData, userId?: string): any {
  const readable = RMSUtilities.toReadableFormat(rmsData);
  const timestamp = new Date();
  const timestampMs = timestamp.getTime();
  
  // Create sections array
  const sections = [];
  
  // Create personal info section
  const personalInfoSection = {
    id: 'personalInfo',
    title: 'Personal Information',
    type: 'personalInfo',
    entries: [{
      id: String(timestampMs),
      fields: {
        name: readable.contact.fullName || '',
        email: readable.contact.email || '',
        phone: readable.contact.phone || '',
        id: String(timestampMs)
      }
    }]
  };
  sections.push(personalInfoSection);
  
  // Create summary section
  if (readable.summary && readable.summary !== 'n/a') {
    const summarySection = {
      id: 'summary',
      title: 'Summary',
      type: 'summary',
      entries: [{
        id: String(timestampMs + 1),
        fields: {
          content: readable.summary,
          id: String(timestampMs + 1)
        }
      }]
    };
    sections.push(summarySection);
  }
  
  // Create experience section
  const experienceSection = {
    id: 'experience',
    title: 'Work Experience',
    type: 'experience',
    entries: readable.experiences.map((exp, index) => ({
      id: String(timestampMs + 2 + index),
      fields: {
        company: exp.company !== 'n/a' ? exp.company : '',
        jobTitle: exp.role !== 'n/a' ? exp.role : '',
        location: exp.location !== 'n/a' ? exp.location : '',
        dates: formatDateRange(exp.dateBegin, exp.dateEnd),
        description: exp.description !== 'n/a' ? exp.description : '',
        id: String(timestampMs + 2 + index)
      }
    }))
  };
  sections.push(experienceSection);
  
  // Create education section
  const educationSection = {
    id: 'education',
    title: 'Education',
    type: 'education',
    entries: readable.education.map((edu, index) => ({
      id: String(timestampMs + 100 + index),
      fields: {
        institution: edu.institution !== 'n/a' ? edu.institution : '',
        qualification: edu.qualification !== 'n/a' ? edu.qualification : '',
        date: edu.date !== 'n/a' ? edu.date : '',
        location: edu.location !== 'n/a' ? edu.location : '',
        id: String(timestampMs + 100 + index)
      }
    }))
  };
  sections.push(educationSection);
  
  // Create skills section
  if (readable.skills && readable.skills.length > 0) {
    const allSkills = readable.skills.flatMap(skill => 
      skill.keywords.split(',').map(s => s.trim())
    );
    
    const skillsSection = {
      id: 'skills',
      title: 'Skills',
      type: 'skills',
      entries: [{
        id: String(timestampMs + 200),
        fields: {
          list: allSkills,
          id: String(timestampMs + 200)
        }
      }]
    };
    sections.push(skillsSection);
  }
  
  // Return the alternative format
  return {
    ownerId: userId || '',
    title: readable.contact.fullName 
      ? `${readable.contact.fullName}'s Resume` 
      : 'Untitled Resume',
    templateId: 'default',
    createdAt: timestamp,
    updatedAt: timestamp,
    sections
  };
}

// Helper Functions

/**
 * Generates a unique ID
 */
function generateId(): string {
  return 'r_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Formats contact location from city, state, country
 */
function formatLocation(contact: any): string | undefined {
  const parts = [
    contact.city !== 'n/a' ? contact.city : '',
    contact.state !== 'n/a' ? contact.state : '',
    contact.country !== 'n/a' && contact.country !== 'USA' ? contact.country : ''
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : undefined;
}

/**
 * Formats date range from start and end dates
 */
function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate || startDate === 'n/a') return '';
  if (!endDate || endDate === 'n/a') return startDate;
  
  return `${startDate} - ${endDate}`;
}