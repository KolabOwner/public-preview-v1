// components/resume/resume-editor-tabs-area.tsx
'use client';

import React, { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useResumeStore } from '@/lib/client/stores/resume-store';
import FormWrapper from './wrappers/form-wrapper';
import dynamic from 'next/dynamic';

// Import types from the resume store (where they're originally defined)
import type {
  ContactFormData,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  ProjectEntry,
  InvolvementEntry,
  CourseworkEntry,
  CertificationEntry,
  UnifiedResumeData // Import from store instead of redefining
} from '@/lib/client/stores/resume-store';

// Export types for use in lazy-loaded components
export type {
  ContactFormData,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  ProjectEntry,
  InvolvementEntry,
  CourseworkEntry,
  CertificationEntry
} from '@/lib/client/stores/resume-store';

// Dynamic imports for all form components - no loading UI to prevent flash
const ContactForm = dynamic(() => import('./forms/contact-form'), {
  ssr: false
});

const ExperienceForm = dynamic(() => import('./forms/experience-form'), {
  ssr: false
});

const EducationForm = dynamic(() => import('./forms/education-form'), {
  ssr: false
});

const SkillsForm = dynamic(() => import('./forms/skills-form'), {
  ssr: false
});

const ProjectsForm = dynamic(() => import('./forms/projects-form'), {
  ssr: false
});

const InvolvementForm = dynamic(() => import('./forms/involvement-form'), {
  ssr: false
});

const CourseworkForm = dynamic(() => import('./forms/coursework-form'), {
  ssr: false
});

const CertificationsForm = dynamic(() => import('./forms/certifications-form'), {
  ssr: false
});

const SummaryForm = dynamic(() => import('./forms/summary-form'), {
  ssr: false
});

// Define SummaryData type to match what SummaryForm expects
interface SummaryData {
  summary: string;
  positionHighlight: boolean;
  position: string;
  skillsHighlight: string;
}

// Additional interfaces for sections not in the store (if needed)
// Note: These are defined locally since they may not be in the store yet

interface ResumeDocument {
  id: string;
  title: string;
  userId: string;
  data: UnifiedResumeData;
  createdAt: string;
  updatedAt: string;
  rmsRawData?: any;
  parsedData?: any;
}

interface ResumeEditorAreaProps {
  resume: ResumeDocument;
}

function ResumePreview(props: { resumeData: UnifiedResumeData, resumeId: string }) {
  return null;
}

// Default empty resume data structure - using store's UnifiedResumeData type
const createDefaultResumeData = (): UnifiedResumeData => ({
  contactInfo: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    website: '',
    country: '',
    state: '',
    city: '',
    showEmail: true,
    showPhone: true,
    showLinkedin: true,
    showWebsite: true,
    showLocation: true,
    showCountry: true,
    showState: true,
    showCity: true
  },
  summary: '', // Store expects string, not object
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  involvements: [],
  coursework: [],
  certifications: [],
  awards: [],
  languages: [],
  publications: []
});

// Helper function to convert SummaryData to string for store compatibility
const summaryDataToString = (summaryData: SummaryData): string => {
  const parts = [
    summaryData.summary,
    summaryData.positionHighlight ? `Position: ${summaryData.position}` : '',
    summaryData.skillsHighlight ? `Skills: ${summaryData.skillsHighlight}` : ''
  ].filter(Boolean);

  return parts.join('\n\n');
};

// Helper function to convert string to SummaryData for form compatibility
const stringToSummaryData = (summaryString: string): SummaryData => {
  // If it's already an object, return as is
  if (typeof summaryString === 'object' && summaryString !== null) {
    return summaryString as unknown as SummaryData;
  }

  // Split by double newlines to attempt to reconstruct the structure
  const parts = summaryString.split('\n\n');

  // Try to extract position and skills from the string
  let position = '';
  let skillsHighlight = '';
  let positionHighlight = false;

  parts.forEach(part => {
    if (part.startsWith('Position: ')) {
      position = part.replace('Position: ', '');
      positionHighlight = true;
    } else if (part.startsWith('Skills: ')) {
      skillsHighlight = part.replace('Skills: ', '');
    }
  });

  return {
    summary: parts[0] || summaryString || '',
    positionHighlight: positionHighlight,
    position: position,
    skillsHighlight: skillsHighlight
  };
};

// Helper function to parse legacy/RMS format into unified format
const parseToUnifiedFormat = (legacyData: any): UnifiedResumeData => {
  if (!legacyData) return createDefaultResumeData();

  // If it's already in the unified format, return as is
  if (legacyData.contactInfo && !legacyData.parsedData && !legacyData.rmsRawData) {
    return {
      ...createDefaultResumeData(),
      ...legacyData,
      // Ensure summary is a string for store compatibility
      summary: typeof legacyData.summary === 'string'
        ? legacyData.summary
        : summaryDataToString(legacyData.summary || { summary: '', positionHighlight: '', position: '', skillsHighlight: '' })
    };
  }

  const unified = createDefaultResumeData();

  // Handle RMS raw data structure first (highest priority)
  const data = legacyData.rmsRawData || legacyData.parsedData || legacyData;

  // Parse contact info with priority for RMS format
  if (data.contactInfo) {
    unified.contactInfo = {
      ...unified.contactInfo,
      ...data.contactInfo
    };
  } else if (data.Rms_contact_fullName || data.rms_contact_fullname || data.rms_contact_fullName) {
    // Handle RMS format with correct field names from your data structure
    unified.contactInfo = {
      fullName: data.Rms_contact_fullName || data.rms_contact_fullname || data.rms_contact_fullName || '',
      email: data.Rms_contact_email || data.rms_contact_email || '',
      phone: data.Rms_contact_phone || data.rms_contact_phone || '',
      linkedin: data.Rms_contact_linkedin || data.rms_contact_linkedin || '',
      website: data.rms_contact_website || data.Rms_contact_website || '',
      country: data.rms_contact_country || data.rms_contact_countrycode || data.Rms_contact_country || '',
      state: data.rms_contact_state || data.Rms_contact_state || '',
      city: data.rms_contact_city || data.Rms_contact_city || '',
      showEmail: true,
      showPhone: true,
      showLinkedin: true,
      showWebsite: true,
      showLocation: true,
      showCountry: true,
      showState: true,
      showCity: true
    };
  }

  // Parse summary - convert to string for store compatibility
  const summaryText = data.summary || data.rms_summary || data.Rms_summary || '';
  if (typeof summaryText === 'string') {
    unified.summary = summaryText;
  } else if (typeof summaryText === 'object' && summaryText !== null) {
    unified.summary = summaryDataToString(summaryText);
  } else {
    unified.summary = '';
  }

  // Parse experiences
  if (data.experiences && Array.isArray(data.experiences)) {
    unified.experiences = data.experiences;
  } else if (data.Rms_experience_count || data.rms_experience_count) {
    // Handle RMS format with priority for capitalized field names (from your data structure)
    const expCount = data.Rms_experience_count || data.rms_experience_count;
    unified.experiences = [];
    for (let i = 0; i < expCount; i++) {
      const description = data[`Rms_experience_${i}_description`] || data[`rms_experience_${i}_description`] || '';
      // Convert description to bullet points - handle various formats
      let bulletPoints: string[] = [];

      if (description) {
        // First try splitting by line breaks or bullet markers
        let splitPoints = description.split(/[\n•·▪]/g);

        // If no line breaks/bullets found, try splitting by sentences that end with periods followed by capital letters
        if (splitPoints.length === 1) {
          // Split on periods followed by capital letters (sentence boundaries)
          splitPoints = description.split(/\.(?=[A-Z])/g);
        }

        bulletPoints = splitPoints
          .map((point: string) => point.trim())
          .filter((point: string) => point.length > 0)
          .map((point: string) => {
            // Remove leading markers and ensure proper punctuation
            let cleaned = point.replace(/^[•·▪?-]\s*/, '');
            // Add period if it doesn't end with punctuation
            if (cleaned && !/[.!?]$/.test(cleaned)) {
              cleaned += '.';
            }
            return cleaned;
          })
          .filter((point: string) => point.length > 1); // Filter out single characters
      }

      // Ensure at least one bullet point if description exists
      if (bulletPoints.length === 0 && description) {
        bulletPoints = [description];
      }

      unified.experiences.push({
        id: `exp_${i}`,
        title: data[`Rms_experience_${i}_role`] || data[`rms_experience_${i}_role`] || '',
        company: data[`Rms_experience_${i}_company`] || data[`rms_experience_${i}_company`] || '',
        location: data[`Rms_experience_${i}_location`] || data[`rms_experience_${i}_location`] || '',
        startDate: data[`Rms_experience_${i}_dateBegin`] || data[`rms_experience_${i}_dateBegin`] || data[`rms_experience_${i}_datebegin`] || '',
        endDate: data[`Rms_experience_${i}_dateEnd`] || data[`rms_experience_${i}_dateEnd`] || data[`rms_experience_${i}_dateend`] || '',
        current: data[`Rms_experience_${i}_isCurrent`] || data[`rms_experience_${i}_isCurrent`] || data[`rms_experience_${i}_iscurrent`] || false,
        bulletPoints: bulletPoints
      });
    }
  }

  // Parse education
  if (data.education && Array.isArray(data.education)) {
    unified.education = data.education.map((edu: any) => ({
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
  } else if (data.Rms_education_count || data.rms_education_count) {
    // Handle RMS format with priority for capitalized field names (from your data structure)
    const eduCount = data.Rms_education_count || data.rms_education_count;
    unified.education = [];
    for (let i = 0; i < eduCount; i++) {
      unified.education.push({
        id: `edu_${i}`,
        institution: data[`Rms_education_${i}_institution`] || data[`rms_education_${i}_institution`] || '',
        qualification: data[`Rms_education_${i}_qualification`] || data[`rms_education_${i}_qualification`] || '',
        location: data[`Rms_education_${i}_location`] || data[`rms_education_${i}_location`] || '',
        date: data[`Rms_education_${i}_date`] || data[`rms_education_${i}_date`] || '',
        dateFormat: 'MMMM YYYY',
        minor: '',
        score: (data[`Rms_education_${i}_score`] || data[`rms_education_${i}_score`])?.toString() || '',
        scoreType: data[`Rms_education_${i}_scoreType`] || data[`rms_education_${i}_scoreType`] || '',
        description: ''
      });
    }
  }

  // Parse skills
  if (data.skillCategories && Array.isArray(data.skillCategories)) {
    unified.skills = data.skillCategories.map((cat: any) => ({
      id: cat.id || `skill_${Date.now()}`,
      category: cat.name || cat.category || '',
      keywords: Array.isArray(cat.skills)
        ? cat.skills.map((s: any) => s.name || s).join(', ')
        : cat.keywords || ''
    }));
  } else if (data.Rms_skill_count || data.rms_skill_count) {
    // Handle RMS format with priority for capitalized field names (from your data structure)
    const skillCount = data.Rms_skill_count || data.rms_skill_count;
    unified.skills = [];
    for (let i = 0; i < skillCount; i++) {
      unified.skills.push({
        id: `skill_${i}`,
        category: data[`Rms_skill_${i}_category`] || data[`rms_skill_${i}_category`] || '',
        keywords: data[`Rms_skill_${i}_keywords`] || data[`rms_skill_${i}_keywords`] || ''
      });
    }
  }

  // Parse projects
  if (data.projects && Array.isArray(data.projects)) {
    unified.projects = data.projects.map((proj: any) => ({
      id: proj.id || `proj_${Date.now()}`,
      title: proj.title || '',
      organization: proj.organization || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      url: proj.url || '',
      description: proj.description || '',
      technologies: Array.isArray(proj.technologies) ? proj.technologies : []
    }));
  } else if (data.rms_project_count || data.Rms_project_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const projectCount = data.rms_project_count || data.Rms_project_count;
    unified.projects = [];
    for (let i = 0; i < projectCount; i++) {
      unified.projects.push({
        id: `proj_${i}`,
        title: data[`rms_project_${i}_title`] || data[`Rms_project_${i}_title`] || '',
        organization: data[`rms_project_${i}_organization`] || data[`Rms_project_${i}_organization`] || '',
        startDate: '',
        endDate: '',
        url: data[`rms_project_${i}_url`] || data[`Rms_project_${i}_url`] || '',
        description: data[`rms_project_${i}_description`] || data[`Rms_project_${i}_description`] || '',
        current: false,
        bulletPoints: []
      });
    }
  }

  // Parse involvements
  if (data.involvements && Array.isArray(data.involvements)) {
    unified.involvements = data.involvements;
  } else if (data.rms_involvement_count || data.Rms_involvement_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const involvementCount = data.rms_involvement_count || data.Rms_involvement_count;
    unified.involvements = [];
    for (let i = 0; i < involvementCount; i++) {
      unified.involvements.push({
        id: `inv_${i}`,
        organization: data[`rms_involvement_${i}_organization`] || data[`Rms_involvement_${i}_organization`] || '',
        role: data[`rms_involvement_${i}_role`] || data[`Rms_involvement_${i}_role`] || '',
        location: data[`rms_involvement_${i}_location`] || data[`Rms_involvement_${i}_location`] || '',
        startDate: data[`rms_involvement_${i}_dateBegin`] || data[`rms_involvement_${i}_datebegin`] || data[`Rms_involvement_${i}_dateBegin`] || '',
        endDate: data[`rms_involvement_${i}_dateEnd`] || data[`rms_involvement_${i}_dateend`] || data[`Rms_involvement_${i}_dateEnd`] || '',
        current: false,
        bulletPoints: []
      });
    }
  }

  // Parse certifications
  if (data.certifications && Array.isArray(data.certifications)) {
    unified.certifications = data.certifications.map((cert: any) => ({
      id: cert.id || `cert_${Date.now()}`,
      name: cert.name || cert.certificateName || '',
      issuer: cert.issuer || cert.issuingOrganization || cert.department || '',
      date: cert.date || cert.issueDate || '',
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      url: cert.url || ''
    }));
  } else if (data.rms_certification_count || data.Rms_certification_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const certificationCount = data.rms_certification_count || data.Rms_certification_count;
    unified.certifications = [];
    for (let i = 0; i < certificationCount; i++) {
      unified.certifications.push({
        id: `cert_${i}`,
        name: data[`rms_certification_${i}_name`] || data[`Rms_certification_${i}_name`] || '',
        issuer: data[`rms_certification_${i}_department`] || data[`rms_certification_${i}_issuer`] || data[`Rms_certification_${i}_department`] || data[`Rms_certification_${i}_issuer`] || '',
        date: data[`rms_certification_${i}_date`] || data[`Rms_certification_${i}_date`] || ''
      });
    }
  }

  // Parse coursework
  if (data.coursework && Array.isArray(data.coursework)) {
    unified.coursework = data.coursework.map((course: any) => ({
      id: course.id || `course_${Date.now()}`,
      name: course.name || course.title || course.courseName || '',
      institution: course.institution || course.school || '',
      date: course.date || course.completionDate || '',
      description: course.description || ''
    }));
  } else if (data.rms_coursework_count || data.Rms_coursework_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const courseworkCount = data.rms_coursework_count || data.Rms_coursework_count;
    unified.coursework = [];
    for (let i = 0; i < courseworkCount; i++) {
      unified.coursework.push({
        id: `course_${i}`,
        name: data[`rms_coursework_${i}_name`] || data[`Rms_coursework_${i}_name`] || data[`rms_coursework_${i}_title`] || data[`Rms_coursework_${i}_title`] || '',
        institution: data[`rms_coursework_${i}_institution`] || data[`Rms_coursework_${i}_institution`] || '',
        date: data[`rms_coursework_${i}_date`] || data[`Rms_coursework_${i}_date`] || '',
        description: data[`rms_coursework_${i}_description`] || data[`Rms_coursework_${i}_description`] || ''
      });
    }
  } else {
    unified.coursework = [];
  }

  // Parse awards - using any type since AwardEntry interface is not imported
  if (data.awards && Array.isArray(data.awards)) {
    unified.awards = data.awards.map((award: any) => ({
      id: award.id || `award_${Date.now()}`,
      title: award.title || award.name || '',
      issuer: award.issuer || award.organization || award.issuingOrganization || '',
      date: award.date || award.issueDate || '',
      description: award.description || ''
    }));
  } else if (data.rms_award_count || data.Rms_award_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const awardCount = data.rms_award_count || data.Rms_award_count;
    unified.awards = [];
    for (let i = 0; i < awardCount; i++) {
      unified.awards.push({
        id: `award_${i}`,
        title: data[`rms_award_${i}_title`] || data[`Rms_award_${i}_title`] || data[`rms_award_${i}_name`] || data[`Rms_award_${i}_name`] || '',
        issuer: data[`rms_award_${i}_issuer`] || data[`Rms_award_${i}_issuer`] || data[`rms_award_${i}_organization`] || data[`Rms_award_${i}_organization`] || '',
        date: data[`rms_award_${i}_date`] || data[`Rms_award_${i}_date`] || '',
        description: data[`rms_award_${i}_description`] || data[`Rms_award_${i}_description`] || ''
      });
    }
  } else {
    unified.awards = [];
  }

  // Parse languages - using any type since LanguageEntry interface is not imported
  if (data.languages && Array.isArray(data.languages)) {
    unified.languages = data.languages.map((lang: any) => ({
      id: lang.id || `lang_${Date.now()}`,
      language: lang.language || lang.name || '',
      proficiency: lang.proficiency || lang.level || lang.fluency || ''
    }));
  } else if (data.rms_language_count || data.Rms_language_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const languageCount = data.rms_language_count || data.Rms_language_count;
    unified.languages = [];
    for (let i = 0; i < languageCount; i++) {
      unified.languages.push({
        id: `lang_${i}`,
        language: data[`rms_language_${i}_language`] || data[`Rms_language_${i}_language`] || data[`rms_language_${i}_name`] || data[`Rms_language_${i}_name`] || '',
        proficiency: data[`rms_language_${i}_proficiency`] || data[`Rms_language_${i}_proficiency`] || data[`rms_language_${i}_level`] || data[`Rms_language_${i}_level`] || ''
      });
    }
  } else {
    unified.languages = [];
  }

  // Parse publications - using any type since PublicationEntry interface is not imported
  if (data.publications && Array.isArray(data.publications)) {
    unified.publications = data.publications.map((pub: any) => ({
      id: pub.id || `pub_${Date.now()}`,
      title: pub.title || '',
      publisher: pub.publisher || pub.journal || pub.venue || '',
      date: pub.date || pub.publishDate || pub.publicationDate || '',
      authors: pub.authors || pub.author || '',
      url: pub.url || pub.link || '',
      description: pub.description || pub.abstract || ''
    }));
  } else if (data.rms_publication_count || data.Rms_publication_count) {
    // Handle RMS format - try both lowercase and capitalized field names
    const publicationCount = data.rms_publication_count || data.Rms_publication_count;
    unified.publications = [];
    for (let i = 0; i < publicationCount; i++) {
      unified.publications.push({
        id: `pub_${i}`,
        title: data[`rms_publication_${i}_title`] || data[`Rms_publication_${i}_title`] || '',
        publisher: data[`rms_publication_${i}_publisher`] || data[`Rms_publication_${i}_publisher`] || data[`rms_publication_${i}_journal`] || data[`Rms_publication_${i}_journal`] || '',
        date: data[`rms_publication_${i}_date`] || data[`Rms_publication_${i}_date`] || '',
        authors: data[`rms_publication_${i}_authors`] || data[`Rms_publication_${i}_authors`] || data[`rms_publication_${i}_author`] || data[`Rms_publication_${i}_author`] || '',
        url: data[`rms_publication_${i}_url`] || data[`Rms_publication_${i}_url`] || '',
        description: data[`rms_publication_${i}_description`] || data[`Rms_publication_${i}_description`] || ''
      });
    }
  } else {
    unified.publications = [];
  }

  return unified;
};

const ResumeEditorArea = React.memo(function ResumeEditorArea({ resume }: ResumeEditorAreaProps) {
  const pathname = usePathname();
  const { initializeResume, resumeData, saveStatus, resumeId } = useResumeStore();

  // Initialize store with resume data
  useEffect(() => {
    if (resume?.id && resumeId !== resume.id) {
      // Check if data field has actual content (more than just empty object)
      const hasDataContent = resume?.data && Object.keys(resume.data).length > 0;

      let unifiedData: UnifiedResumeData;
      if (hasDataContent) {
        unifiedData = resume.data;
      } else if (resume?.rmsRawData && Object.keys(resume.rmsRawData).length > 0) {
        unifiedData = parseToUnifiedFormat(resume);
      } else {
        unifiedData = parseToUnifiedFormat(resume);
      }

      initializeResume(resume.id, unifiedData);
    }
  }, [resume?.id, resumeId, initializeResume]);

  // Preload all form components on mount to prevent flash on cold loads
  useEffect(() => {
    // Start preloading components immediately after mount
    const preloadComponents = async () => {
      try {
        // Preload the most commonly used forms first
        await Promise.all([
          import('./forms/contact-form'),
          import('./forms/experience-form'),
          import('./forms/education-form'),
          import('./forms/skills-form')
        ]);

        // Then preload the less common ones
        setTimeout(() => {
          Promise.all([
            import('./forms/projects-form'),
            import('./forms/involvement-form'),
            import('./forms/coursework-form'),
            import('./forms/certifications-form'),
            import('./forms/summary-form')
          ]);
        }, 100);
      } catch (error) {
        // Silently handle preload errors
        console.debug('Component preload failed:', error);
      }
    };

    preloadComponents();
  }, []);

  // Determine which section to show based on the current route
  const section = pathname.split('/').pop() || 'summary';

  // Handler functions - convert between string and SummaryData as needed
  const handleSummaryChange = useCallback(async (summaryData: SummaryData) => {
    // Convert SummaryData to string for store compatibility
    const summaryString = summaryDataToString(summaryData);
    if (process.env.NODE_ENV === 'development') {
      console.log('Summary changed:', summaryString);
    }
    // You might want to also update the store with the actual summary data here
    // updateSection('summary', summaryString);
  }, []);

  const handleContactChange = useCallback(async (contactInfo: ContactFormData) => {
    // Compatibility layer - store handles the actual saving
    if (process.env.NODE_ENV === 'development') {
      console.log('Contact info changed:', contactInfo);
    }
  }, []);

  const handleExperienceChange = useCallback(async (experiences: ExperienceEntry[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Experience changed:', experiences);
    }
  }, []);

  const handleEducationChange = useCallback(async (education: EducationEntry[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Education changed:', education);
    }
  }, []);

  const handleSkillsChange = useCallback(async (skills: SkillEntry[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Skills changed:', skills);
    }
  }, []);

  const handleProjectsChange = useCallback(async (projects: ProjectEntry[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Projects changed:', projects);
    }
  }, []);

  const handleInvolvementChange = useCallback(async (involvements: InvolvementEntry[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Involvement changed:', involvements);
    }
  }, []);

  const handleCourseworkChange = useCallback(async (coursework: CourseworkEntry[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Coursework changed:', coursework);
    }
  }, []);

  const handleCertificationsChange = useCallback(async (certifications: CertificationEntry[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Certifications changed:', certifications);
    }
  }, []);

  // Render the appropriate form based on the current section
  const renderSection = () => {
    switch (section) {
      case 'summary':
        return (
          <SummaryForm
            key={`summary-${resume.id}`}
            initialData={stringToSummaryData(resumeData.summary)}
            onSave={handleSummaryChange}
          />
        );

      case 'contact':
        return (
          <ContactForm
            key={`contact-${resume.id}`} // Force re-mount when resume changes
            initialData={resumeData.contactInfo}
            onSave={handleContactChange}
          />
        );

      case 'experience':
        return (
          <ExperienceForm
            key={`experience-${resume.id}`}
            initialData={resumeData.experiences}
            onSave={handleExperienceChange}
          />
        );

      case 'education':
        return (
          <EducationForm
            key={`education-${resume.id}`}
            initialData={resumeData.education}
            onSave={handleEducationChange}
          />
        );

      case 'skills':
        return (
          <SkillsForm
            key={`skills-${resume.id}`}
            initialData={resumeData.skills}
            onSave={handleSkillsChange}
          />
        );

      case 'projects':
        return (
          <ProjectsForm
            key={`projects-${resume.id}`}
            initialData={resumeData.projects}
            onSave={handleProjectsChange}
          />
        );

      case 'involvement':
        return (
          <InvolvementForm
            key={`involvement-${resume.id}`}
            initialData={resumeData.involvements}
            onSave={handleInvolvementChange}
          />
        );

      case 'coursework':
        return (
          <CourseworkForm
            key={`coursework-${resume.id}`}
            initialData={resumeData.coursework}
            onSave={handleCourseworkChange}
          />
        );

      case 'certifications':
        return (
          <CertificationsForm
            key={`certifications-${resume.id}`}
            initialData={resumeData.certifications}
            onSave={handleCertificationsChange}
          />
        );

      case 'preview':
        return (
          <ResumePreview
            resumeData={resumeData}
            resumeId={resume.id}
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Section not found</p>
          </div>
        );
    }
  };

  return (
    <FormWrapper className="w-full">
      <div className="resume-editor-content">
        {renderSection()}
      </div>

      {/* Save status indicators */}
      {saveStatus.isSaving && (
        <div className="resume-save-indicator resume-save-indicator--saving">
          Saving... ({saveStatus.pendingSections.length} pending)
        </div>
      )}

      {saveStatus.error && (
        <div className="resume-save-indicator resume-save-indicator--error">
          {saveStatus.error}
        </div>
      )}
    </FormWrapper>
  );
});

export default ResumeEditorArea;