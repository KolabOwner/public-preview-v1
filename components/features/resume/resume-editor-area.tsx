// components/resume/resume-editor-tabs-area.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "@/config/firebase-config";
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import dynamic from 'next/dynamic';

// Export types for use in lazy-loaded components
export type { ContactFormData } from './forms/contact-form';
export type { ExperienceEntry } from './forms/experience-form';
export type { EducationEntry } from './forms/education-form';
export type { SkillEntry } from './forms/skills-form';
export type { ProjectEntry } from './forms/projects-form';
export type { InvolvementEntry } from './forms/involvement-form';
export type { CourseworkEntry } from './forms/coursework-form';
export type { CertificationEntry } from './forms/certifications-form';

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

// Re-import types that are used in this file
import type { ContactFormData } from './forms/contact-form';
import type { ExperienceEntry } from './forms/experience-form';
import type { EducationEntry } from './forms/education-form';
import type { SkillEntry } from './forms/skills-form';
import type { ProjectEntry } from './forms/projects-form';
import type { InvolvementEntry } from './forms/involvement-form';
import type { CourseworkEntry } from './forms/coursework-form';
import type { CertificationEntry } from './forms/certifications-form';

// Unified Resume Data Structure
interface UnifiedResumeData {
  contactInfo: ContactFormData;
  summary: string;
  experiences: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  involvements: InvolvementEntry[];
  coursework: CourseworkEntry[];
  certifications: CertificationEntry[];
  awards: AwardEntry[];
  languages: LanguageEntry[];
  publications: PublicationEntry[];
}

interface AwardEntry {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

interface PublicationEntry {
  id: string;
  title: string;
  publisher: string;
  date: string;
  authors: string;
  url?: string;
  description?: string;
}

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

// Default empty resume data structure
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
  summary: '',
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

// Helper function to parse legacy/RMS format into unified format
const parseToUnifiedFormat = (legacyData: any): UnifiedResumeData => {
  if (!legacyData) return createDefaultResumeData();

  // If it's already in the unified format, return as is
  if (legacyData.contactInfo && !legacyData.parsedData && !legacyData.rmsRawData) {
    return {
      ...createDefaultResumeData(),
      ...legacyData
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

  // Parse summary
  unified.summary = data.summary || data.rms_summary || data.Rms_summary || '';

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

  // Copy over remaining fields
  unified.coursework = data.coursework || [];
  unified.awards = data.awards || [];
  unified.languages = data.languages || [];
  unified.publications = data.publications || [];

  return unified;
};

// Helper function to convert unified format back to RMS raw format for saving
const convertToRawFormat = (unifiedData: UnifiedResumeData): any => {
  const raw: any = {};

  // Convert contact info
  if (unifiedData.contactInfo) {
    raw.Rms_contact_fullName = unifiedData.contactInfo.fullName || '';
    raw.Rms_contact_email = unifiedData.contactInfo.email || '';
    raw.Rms_contact_phone = unifiedData.contactInfo.phone || '';
    raw.Rms_contact_linkedin = unifiedData.contactInfo.linkedin || '';
    raw.Rms_contact_website = unifiedData.contactInfo.website || '';
    raw.Rms_contact_country = unifiedData.contactInfo.country || '';
    raw.Rms_contact_state = unifiedData.contactInfo.state || '';
    raw.Rms_contact_city = unifiedData.contactInfo.city || '';
  }

  // Convert summary
  raw.Rms_summary = unifiedData.summary || '';

  // Convert experiences
  if (unifiedData.experiences && Array.isArray(unifiedData.experiences)) {
    raw.Rms_experience_count = unifiedData.experiences.length;
    unifiedData.experiences.forEach((exp, index) => {
      raw[`Rms_experience_${index}_role`] = exp.title || '';
      raw[`Rms_experience_${index}_company`] = exp.company || '';
      raw[`Rms_experience_${index}_location`] = exp.location || '';
      raw[`Rms_experience_${index}_dateBegin`] = exp.startDate || '';
      raw[`Rms_experience_${index}_dateEnd`] = exp.endDate || '';
      raw[`Rms_experience_${index}_isCurrent`] = exp.current || false;

      // Convert bullet points back to description
      const description = exp.bulletPoints && Array.isArray(exp.bulletPoints)
        ? exp.bulletPoints.join('\n')
        : '';
      raw[`Rms_experience_${index}_description`] = description;
    });
  } else {
    raw.Rms_experience_count = 0;
  }

  // Convert education
  if (unifiedData.education && Array.isArray(unifiedData.education)) {
    raw.Rms_education_count = unifiedData.education.length;
    unifiedData.education.forEach((edu, index) => {
      raw[`Rms_education_${index}_institution`] = edu.institution || '';
      raw[`Rms_education_${index}_qualification`] = edu.qualification || '';
      raw[`Rms_education_${index}_location`] = edu.location || '';
      raw[`Rms_education_${index}_date`] = edu.date || '';
      raw[`Rms_education_${index}_score`] = edu.score || '';
      raw[`Rms_education_${index}_scoreType`] = edu.scoreType || '';
    });
  } else {
    raw.Rms_education_count = 0;
  }

  // Convert skills
  if (unifiedData.skills && Array.isArray(unifiedData.skills)) {
    raw.Rms_skill_count = unifiedData.skills.length;
    unifiedData.skills.forEach((skill, index) => {
      raw[`Rms_skill_${index}_category`] = skill.category || '';
      raw[`Rms_skill_${index}_keywords`] = skill.keywords || '';
    });
  } else {
    raw.Rms_skill_count = 0;
  }

  // Convert projects
  if (unifiedData.projects && Array.isArray(unifiedData.projects)) {
    raw.Rms_project_count = unifiedData.projects.length;
    unifiedData.projects.forEach((proj, index) => {
      raw[`Rms_project_${index}_title`] = proj.title || '';
      raw[`Rms_project_${index}_organization`] = proj.organization || '';
      raw[`Rms_project_${index}_url`] = proj.url || '';
      raw[`Rms_project_${index}_description`] = proj.description || '';
    });
  } else {
    raw.Rms_project_count = 0;
  }

  // Convert involvements
  if (unifiedData.involvements && Array.isArray(unifiedData.involvements)) {
    raw.Rms_involvement_count = unifiedData.involvements.length;
    unifiedData.involvements.forEach((inv, index) => {
      raw[`Rms_involvement_${index}_organization`] = inv.organization || '';
      raw[`Rms_involvement_${index}_role`] = inv.role || '';
      raw[`Rms_involvement_${index}_location`] = inv.location || '';
      raw[`Rms_involvement_${index}_dateBegin`] = inv.startDate || '';
      raw[`Rms_involvement_${index}_dateEnd`] = inv.endDate || '';
    });
  } else {
    raw.Rms_involvement_count = 0;
  }

  // Convert certifications
  if (unifiedData.certifications && Array.isArray(unifiedData.certifications)) {
    raw.Rms_certification_count = unifiedData.certifications.length;
    unifiedData.certifications.forEach((cert, index) => {
      raw[`Rms_certification_${index}_name`] = cert.name || '';
      raw[`Rms_certification_${index}_department`] = cert.issuer || '';
      raw[`Rms_certification_${index}_date`] = cert.date || '';
    });
  } else {
    raw.Rms_certification_count = 0;
  }

  return raw;
};

const ResumeEditorArea = React.memo(function ResumeEditorArea({ resume }: ResumeEditorAreaProps) {
  const pathname = usePathname();
  const params = useParams();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [saveQueue, setSaveQueue] = useState<number>(0);

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

  // Initialize with unified format
  const [resumeData, setResumeData] = useState<UnifiedResumeData>(() => {
    // Check if data field has actual content (more than just empty object)
    const hasDataContent = resume?.data && Object.keys(resume.data).length > 0;

    if (hasDataContent) {
      return resume.data;
    }

    // If data is empty but we have rmsRawData, parse it
    if (resume?.rmsRawData && Object.keys(resume.rmsRawData).length > 0) {
      return parseToUnifiedFormat(resume);
    }

    // Fallback to legacy parsing
    return parseToUnifiedFormat(resume);
  });

  // Reset data when resume changes (when switching between resumes)
  useEffect(() => {
    const hasDataContent = resume?.data && Object.keys(resume.data).length > 0;

    if (hasDataContent) {
      setResumeData(resume.data);
    } else if (resume?.rmsRawData && Object.keys(resume.rmsRawData).length > 0) {
      setResumeData(parseToUnifiedFormat(resume));
    } else {
      setResumeData(parseToUnifiedFormat(resume));
    }
  }, [resume.id]); // Only trigger when resume ID changes

  // Determine which section to show based on the current route
  const section = pathname.split('/').pop() || 'summary';

  // Improved save function with better error handling and logging
  const saveToFirebase = useCallback(async (updatedData: UnifiedResumeData, section?: string) => {
    if (!resume || !resume.id) {
      console.error('Save failed: No resume ID found');
      toast({
        title: "Save Failed",
        description: "No resume ID found. Unable to save changes.",
        variant: "destructive",
      });
      return;
    }

    // Increment save queue
    setSaveQueue(prev => prev + 1);
    setIsSaving(true);

    try {
      console.log(`Saving ${section || 'resume'} data to Firebase:`, {
        resumeId: resume.id,
        dataKeys: Object.keys(updatedData),
        timestamp: new Date().toISOString()
      });

      const resumeRef = doc(db, 'resumes', resume.id);

      // Convert unified data back to raw RMS format
      const rawData = convertToRawFormat(updatedData);

      // Create the update object - save in raw format but keep unified data too
      const updateData = {
        rmsRawData: rawData,  // Save in raw format for compatibility
        data: updatedData,    // Keep unified format for editing
        updatedAt: serverTimestamp()
      };

      console.log('Firebase update payload (raw format):', {
        rmsRawDataKeys: Object.keys(rawData),
        rawData: rawData
      });

      await updateDoc(resumeRef, updateData);

      console.log('Successfully saved to Firebase in raw format');

      // Only show success toast for manual saves, not auto-saves
      if (section) {
        toast({
          title: "Saved Successfully",
          description: `${section} changes have been saved.`,
        });
      }
    } catch (error) {
      console.error('Error saving resume to Firebase:', error);
      toast({
        title: "Save Failed",
        description: `There was an error saving your ${section || 'resume'} changes. Please try again.`,
        variant: "destructive",
      });
      throw error; // Re-throw to let the calling function handle it
    } finally {
      setSaveQueue(prev => Math.max(0, prev - 1));
      setIsSaving(false);
    }
  }, [resume, toast]);

  // Handler functions for each form
  const handleSummaryChange = useCallback(async (summary: string) => {
    const updatedData = { ...resumeData, summary };
    setResumeData(updatedData);
    try {
      await saveToFirebase(updatedData, 'summary');
    } catch (error) {
      // Error already handled in saveToFirebase
    }
  }, [resumeData, saveToFirebase]);

  const handleContactChange = useCallback(async (contactInfo: ContactFormData) => {
    console.log('Contact form data received:', contactInfo);
    const updatedData = { ...resumeData, contactInfo };
    setResumeData(updatedData); // Update local state immediately
    try {
      await saveToFirebase(updatedData, 'contact');
    } catch (error) {
      // Error already handled in saveToFirebase
      // Optionally revert local state on error
      console.error('Failed to save contact info, reverting local state');
    }
  }, [resumeData, saveToFirebase]);

  const handleExperienceChange = useCallback(async (experiences: ExperienceEntry[]) => {
    const updatedData = { ...resumeData, experiences };
    setResumeData(updatedData);
    try {
      await saveToFirebase(updatedData, 'experience');
    } catch (error) {
      // Error already handled in saveToFirebase
    }
  }, [resumeData, saveToFirebase]);

  const handleEducationChange = useCallback(async (education: EducationEntry[]) => {
    const updatedData = { ...resumeData, education };
    setResumeData(updatedData);
    try {
      await saveToFirebase(updatedData, 'education');
    } catch (error) {
      // Error already handled in saveToFirebase
    }
  }, [resumeData, saveToFirebase]);

  const handleSkillsChange = useCallback(async (skills: SkillEntry[]) => {
    const updatedData = { ...resumeData, skills };
    setResumeData(updatedData);
    try {
      await saveToFirebase(updatedData, 'skills');
    } catch (error) {
      // Error already handled in saveToFirebase
    }
  }, [resumeData, saveToFirebase]);

  const handleProjectsChange = useCallback(async (projects: ProjectEntry[]) => {
    const updatedData = { ...resumeData, projects };
    setResumeData(updatedData);
    try {
      await saveToFirebase(updatedData, 'projects');
    } catch (error) {
      // Error already handled in saveToFirebase
    }
  }, [resumeData, saveToFirebase]);

  const handleInvolvementChange = useCallback(async (involvements: InvolvementEntry[]) => {
    const updatedData = { ...resumeData, involvements };
    setResumeData(updatedData);
    try {
      await saveToFirebase(updatedData, 'involvement');
    } catch (error) {
      // Error already handled in saveToFirebase
    }
  }, [resumeData, saveToFirebase]);

  const handleCourseworkChange = useCallback(async (coursework: CourseworkEntry[]) => {
    const updatedData = { ...resumeData, coursework };
    setResumeData(updatedData);
    try {
      await saveToFirebase(updatedData, 'coursework');
    } catch (error) {
      // Error already handled in saveToFirebase
    }
  }, [resumeData, saveToFirebase]);

  const handleCertificationsChange = useCallback(async (certifications: CertificationEntry[]) => {
    const updatedData = { ...resumeData, certifications };
    setResumeData(updatedData);
    try {
      await saveToFirebase(updatedData, 'certifications');
    } catch (error) {
      // Error already handled in saveToFirebase
    }
  }, [resumeData, saveToFirebase]);

  // Render the appropriate form based on the current section
  const renderSection = () => {
    switch (section) {
      case 'summary':
        return (
          <SummaryForm
            initialData={resumeData.summary}
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
    <div className="w-full">
      <div className="resume-editor-content">
        {renderSection()}
      </div>

      {/* Save status indicators */}
      {saveQueue > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
          Saving... ({saveQueue} pending)
        </div>
      )}

      {isSaving && saveQueue === 0 && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          Saved successfully
        </div>
      )}
    </div>
  );
});

export default ResumeEditorArea;