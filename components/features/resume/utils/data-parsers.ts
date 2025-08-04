// components/resume/utils/data-parsers.ts
import { US_STATES } from '../forms/utils/location-data';
import { createDefaultResumeData } from '@/lib/client/stores/utils/defaults';
import { summaryDataToString } from './summary-utils';
import type {
  UnifiedResumeData,
  ContactFormData,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  ProjectEntry,
  InvolvementEntry,
  CourseworkEntry,
  CertificationEntry
} from '@/lib/client/stores/types';

// Helper functions for RMS field access
const getRmsField = (data: any, section: string, index: number, field: string): string => {
  return data[`rms_${section}_${index}_${field}`] || '';
};

const getRmsCount = (data: any, section: string): number => {
  return data[`rms_${section}_count`] || 0;
};

// Utility functions
const parseDescriptionToBulletPoints = (description: string): string[] => {
  if (!description) return [];

  let splitPoints = description.split(/[\n•·▪]/g);

  if (splitPoints.length === 1) {
    splitPoints = description.split(/\.\s+(?=[A-Z])/g);
    if (splitPoints.length === 1) {
      splitPoints = description.split(/\.(?=[A-Z])/g);
    }
  }

  return splitPoints
    .map(point => point.trim())
    .filter(point => point.length > 0)
    .map(point => {
      let cleaned = point.replace(/^[•·▪?-]\s*/, '');
      if (cleaned && !/[.!?]$/.test(cleaned)) {
        cleaned += '.';
      }
      return cleaned;
    })
    .filter(point => point.length > 1);
};

// Individual section parsers
export const parseContactInfo = (data: any): ContactFormData => {
  console.log('parseContactInfo - raw data:', data);
  const defaultContact = createDefaultResumeData().contactInfo;

  if (data.contactInfo) {
    console.log('parseContactInfo - using data.contactInfo:', data.contactInfo);
    return { ...defaultContact, ...data.contactInfo };
  }

  const rawCountry = data.rms_contact_country || data.rms_contact_countrycode || getRmsField(data, 'contact', 0, 'country') || getRmsField(data, 'contact', 0, 'countrycode') || '';
  const rawState = data.rms_contact_state || getRmsField(data, 'contact', 0, 'state') || '';

  const countryCode = rawCountry === 'United States' ? 'US' : rawCountry;

  let stateCode = rawState;
  if (countryCode === 'US' && rawState === 'California') {
    stateCode = 'CA';
  } else if (countryCode === 'US' && rawState) {
    const matchedState = US_STATES.find(state => state.label === rawState);
    if (matchedState) {
      stateCode = matchedState.value;
    }
  }

  const result = {
    fullName: data.rms_contact_fullname || data.rms_contact_fullName || getRmsField(data, 'contact', 0, 'fullname') || getRmsField(data, 'contact', 0, 'fullName') || '',
    email: data.rms_contact_email || getRmsField(data, 'contact', 0, 'email') || '',
    phone: data.rms_contact_phone || getRmsField(data, 'contact', 0, 'phone') || '',
    linkedin: data.rms_contact_linkedin || getRmsField(data, 'contact', 0, 'linkedin') || '',
    website: data.rms_contact_website || getRmsField(data, 'contact', 0, 'website') || '',
    country: countryCode,
    state: stateCode,
    city: data.rms_contact_city || getRmsField(data, 'contact', 0, 'city') || '',
    showEmail: true,
    showPhone: true,
    showLinkedin: true,
    showWebsite: true,
    showLocation: true,
    showCountry: true,
    showState: true,
    showCity: true
  };

  console.log('parseContactInfo - parsed result:', result);
  return result;
};

export const parseSummary = (data: any): string => {
  const summaryText = data.summary || getRmsField(data, 'summary', 0, '') || data.rms_summary || '';

  if (typeof summaryText === 'string') {
    return summaryText;
  }

  if (typeof summaryText === 'object' && summaryText !== null) {
    return summaryDataToString(summaryText);
  }

  return '';
};

export const parseExperiences = (data: any): ExperienceEntry[] => {
  if (data.experiences && Array.isArray(data.experiences)) {
    return data.experiences;
  }

  const expCount = getRmsCount(data, 'experience');
  const experiences: ExperienceEntry[] = [];

  for (let i = 0; i < expCount; i++) {
    const description = getRmsField(data, 'experience', i, 'description');
    const bulletPoints = parseDescriptionToBulletPoints(description);

    if (bulletPoints.length === 0 && description) {
      bulletPoints.push(description);
    }

    experiences.push({
      id: `exp_${i}`,
      title: getRmsField(data, 'experience', i, 'role'),
      company: getRmsField(data, 'experience', i, 'company'),
      location: getRmsField(data, 'experience', i, 'location'),
      startDate: getRmsField(data, 'experience', i, 'datebegin') || getRmsField(data, 'experience', i, 'dateBegin'),
      endDate: getRmsField(data, 'experience', i, 'dateend') || getRmsField(data, 'experience', i, 'dateEnd'),
      current: data[`rms_experience_${i}_iscurrent`] || data[`rms_experience_${i}_isCurrent`] || false,
      bulletPoints
    });
  }

  return experiences;
};

export const parseEducation = (data: any): EducationEntry[] => {
  if (data.education && Array.isArray(data.education)) {
    return data.education.map((edu: any) => ({
      id: edu.id || `edu_${Date.now()}`,
      institution: edu.institution || edu.school || '',
      qualification: edu.qualification || edu.degree || '',
      location: edu.location || '',
      date: edu.date || edu.endDate || edu.formattedDate || '',
      dateFormat: edu.dateFormat || 'MMMM YYYY',
      minor: edu.minor || edu.fieldOfStudy || '',
      score: edu.score || edu.gpa || '',
      scoreType: edu.scoreType || edu.gpaScale || '',
      details: edu.details || edu.description || '',
      isGraduate: edu.isGraduate !== undefined ? edu.isGraduate : true
    }));
  }

  const eduCount = getRmsCount(data, 'education');
  const education: EducationEntry[] = [];

  for (let i = 0; i < eduCount; i++) {
    const dateField = getRmsField(data, 'education', i, 'date');
    let dateValue: Date | null = null;

    const dateString = typeof dateField === 'number' ? dateField.toString() : dateField;
    if (dateString && String(dateString).trim()) {
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        dateValue = parsedDate;
      }
    }

    education.push({
      id: `edu_${i}`,
      institution: getRmsField(data, 'education', i, 'institution'),
      qualification: getRmsField(data, 'education', i, 'qualification'),
      location: getRmsField(data, 'education', i, 'location'),
      date: dateValue,
      dateFormat: 'MMMM YYYY',
      minor: getRmsField(data, 'education', i, 'fieldofstudy') || getRmsField(data, 'education', i, 'fieldOfStudy'),
      score: getRmsField(data, 'education', i, 'gpa'),
      scoreType: getRmsField(data, 'education', i, 'gpa') ? 'GPA' : '',
      description: getRmsField(data, 'education', i, 'description')
    });
  }

  return education;
};

export const parseSkills = (data: any): SkillEntry[] => {
  if (data.skillCategories && Array.isArray(data.skillCategories)) {
    return data.skillCategories.map((cat: any) => ({
      id: cat.id || `skill_${Date.now()}`,
      category: cat.name || cat.category || '',
      keywords: Array.isArray(cat.skills)
        ? cat.skills.map((s: any) => s.name || s).join(', ')
        : cat.keywords || ''
    }));
  }

  const skillCount = getRmsCount(data, 'skill');
  const skills: SkillEntry[] = [];

  for (let i = 0; i < skillCount; i++) {
    skills.push({
      id: `skill_${i}`,
      category: getRmsField(data, 'skill', i, 'category'),
      keywords: getRmsField(data, 'skill', i, 'keywords')
    });
  }

  return skills;
};

export const parseProjects = (data: any): ProjectEntry[] => {
  if (data.projects && Array.isArray(data.projects)) {
    return data.projects.map((proj: any) => ({
      id: proj.id || `proj_${Date.now()}`,
      title: proj.title || '',
      organization: proj.organization || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      url: proj.url || '',
      description: proj.description || '',
      technologies: Array.isArray(proj.technologies) ? proj.technologies : []
    }));
  }

  const projectCount = getRmsCount(data, 'project');
  const projects: ProjectEntry[] = [];

  for (let i = 0; i < projectCount; i++) {
    projects.push({
      id: `proj_${i}`,
      title: getRmsField(data, 'project', i, 'title'),
      organization: getRmsField(data, 'project', i, 'organization'),
      startDate: '',
      endDate: '',
      url: getRmsField(data, 'project', i, 'url'),
      description: getRmsField(data, 'project', i, 'description'),
      current: false,
      bulletPoints: []
    });
  }

  return projects;
};

export const parseInvolvements = (data: any): InvolvementEntry[] => {
  if (data.involvements && Array.isArray(data.involvements)) {
    return data.involvements;
  }

  const involvementCount = getRmsCount(data, 'involvement');
  const involvements: InvolvementEntry[] = [];

  for (let i = 0; i < involvementCount; i++) {
    involvements.push({
      id: `inv_${i}`,
      organization: getRmsField(data, 'involvement', i, 'organization'),
      role: getRmsField(data, 'involvement', i, 'role'),
      location: getRmsField(data, 'involvement', i, 'location'),
      startDate: getRmsField(data, 'involvement', i, 'datebegin') || getRmsField(data, 'involvement', i, 'dateBegin'),
      endDate: getRmsField(data, 'involvement', i, 'dateend') || getRmsField(data, 'involvement', i, 'dateEnd'),
      current: false,
      description: getRmsField(data, 'involvement', i, 'description'),
      bulletPoints: []
    });
  }

  return involvements;
};

export const parseCertifications = (data: any): CertificationEntry[] => {
  if (data.certifications && Array.isArray(data.certifications)) {
    return data.certifications.map((cert: any) => ({
      id: cert.id || `cert_${Date.now()}`,
      name: cert.name || cert.certificateName || '',
      issuer: cert.issuer || cert.issuingOrganization || cert.department || '',
      date: cert.date || cert.issueDate || '',
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      url: cert.url || ''
    }));
  }

  const certificationCount = getRmsCount(data, 'certification');
  const certifications: CertificationEntry[] = [];

  for (let i = 0; i < certificationCount; i++) {
    certifications.push({
      id: `cert_${i}`,
      name: getRmsField(data, 'certification', i, 'name'),
      issuer: getRmsField(data, 'certification', i, 'department') || getRmsField(data, 'certification', i, 'issuer'),
      date: getRmsField(data, 'certification', i, 'date')
    });
  }

  return certifications;
};

export const parseCoursework = (data: any): CourseworkEntry[] => {
  if (data.coursework && Array.isArray(data.coursework)) {
    return data.coursework.map((course: any) => ({
      id: course.id || `course_${Date.now()}`,
      name: course.name || course.title || course.courseName || '',
      institution: course.institution || course.school || '',
      date: course.date || course.completionDate || '',
      description: course.description || ''
    }));
  }

  const courseworkCount = getRmsCount(data, 'coursework');
  const coursework: CourseworkEntry[] = [];

  for (let i = 0; i < courseworkCount; i++) {
    coursework.push({
      id: `course_${i}`,
      name: getRmsField(data, 'coursework', i, 'name') || getRmsField(data, 'coursework', i, 'title'),
      institution: getRmsField(data, 'coursework', i, 'institution'),
      date: getRmsField(data, 'coursework', i, 'date'),
      description: getRmsField(data, 'coursework', i, 'description')
    });
  }

  return coursework;
};

// Generic parser for additional sections (awards, languages, publications)
export const parseGenericSection = (data: any, sectionName: string, fieldMapping: Record<string, string[]>) => {
  const existingData = data[sectionName];
  if (existingData && Array.isArray(existingData)) {
    return existingData.map((item: any, index: number) => {
      const result: any = { id: item.id || `${sectionName}_${Date.now()}_${index}` };

      Object.entries(fieldMapping).forEach(([resultField, possibleFields]) => {
        result[resultField] = possibleFields.reduce((found, field) =>
          found || item[field] || '', ''
        );
      });

      return result;
    });
  }

  const count = getRmsCount(data, sectionName);
  const results: any[] = [];

  for (let i = 0; i < count; i++) {
    const result: any = { id: `${sectionName}_${i}` };

    Object.entries(fieldMapping).forEach(([resultField, possibleFields]) => {
      result[resultField] = possibleFields.reduce((found, field) =>
        found || getRmsField(data, sectionName, i, field), ''
      );
    });

    results.push(result);
  }

  return results;
};

// Main parsing function
export const parseToUnifiedFormat = (legacyData: any): UnifiedResumeData => {
  if (!legacyData) return createDefaultResumeData();

  // If already in unified format, return with summary conversion
  if (legacyData.contactInfo && !legacyData.parsedData && !legacyData.rmsRawData) {
    return {
      ...createDefaultResumeData(),
      ...legacyData,
      summary: typeof legacyData.summary === 'string'
        ? legacyData.summary
        : summaryDataToString(legacyData.summary || { summary: '', positionHighlight: false, position: '', skillsHighlight: '' })
    };
  }

  const data = legacyData.rmsRawData || legacyData.parsedData || legacyData;

  return {
    contactInfo: parseContactInfo(data),
    summary: parseSummary(data),
    experiences: parseExperiences(data),
    education: parseEducation(data),
    skills: parseSkills(data),
    projects: parseProjects(data),
    involvements: parseInvolvements(data),
    coursework: parseCoursework(data),
    certifications: parseCertifications(data),
    awards: parseGenericSection(data, 'award', {
      title: ['title', 'name'],
      issuer: ['issuer', 'organization', 'issuingorganization'],
      date: ['date', 'issuedate'],
      description: ['description']
    }),
    languages: parseGenericSection(data, 'language', {
      language: ['language', 'name'],
      proficiency: ['proficiency', 'level', 'fluency']
    }),
    publications: parseGenericSection(data, 'publication', {
      title: ['title'],
      publisher: ['publisher', 'journal', 'venue'],
      date: ['date', 'publishdate', 'publicationdate'],
      authors: ['authors', 'author'],
      url: ['url', 'link'],
      description: ['description', 'abstract']
    })
  };
};