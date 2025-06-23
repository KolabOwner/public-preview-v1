// Consolidated Resume Data Context

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import { useAuth } from "@/contexts/firebase-auth-context";

// Form sections enum
export type FormSection =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'coursework'
  | 'involvement';

// Experience/Work History
export interface Experience {
  company: string;
  position: string;
  location?: string;
  dateBegin: string;
  dateEnd: string;
  isCurrent?: boolean;
  description: string;
}

// Education
export interface Education {
  institution: string;
  qualification: string; // degree type
  fieldOfStudy?: string;
  date: string;
  isGraduate?: boolean;
  gpa?: string;
  location?: string;
  minor?: string;
  activities?: string;
  description?: string;
}

// Skills
export interface Skill {
  category: string;
  keywords: string;
}

// Projects
export interface Project {
  name: string;
  title: string;
  role?: string;
  organization?: string;
  description: string;
  dateBegin?: string;
  dateEnd?: string;
  url?: string;
  repository?: string;
}

// Certifications
export interface Certification {
  name: string;
  date: string;
  issuer: string;
  description?: string;
}

// Involvement/Activities
export interface Involvement {
  organization: string;
  role: string;
  location?: string;
  dateBegin: string;
  dateEnd: string;
  description?: string;
}

// Section completion status
export interface SectionStatus {
  isComplete: boolean;
}

// Contact Information
export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

// Processed/Structured Resume Data
export interface ProcessedResumeData {
  contact: ContactInfo;
  contactInfo?: ContactInfo; // alias for compatibility
  title?: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  coursework: Coursework[];
  involvement: Involvement[];
  languages?: Language[];
  awards?: Award[];
  publications?: Publication[];
  volunteer?: Volunteer[];
  references?: Reference[];
  rmsRawData?: any;
}

// Coursework
export interface Coursework {
  course: string;
  institution: string;
  date?: string;
  description?: string;
}

// Language
export interface Language {
  name: string;
  proficiency?: string;
}

// Award
export interface Award {
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

// Publication
export interface Publication {
  title: string;
  authors?: string;
  journal?: string;
  date?: string;
  url?: string;
  description?: string;
}

// Volunteer
export interface Volunteer {
  organization: string;
  role: string;
  location?: string;
  dateBegin?: string;
  dateEnd?: string;
  description?: string;
}

// Reference
export interface Reference {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

// Raw/Flattened Resume Data (as stored in database)
export interface ResumeData {
  // Core fields
  id: string;
  title: string;
  document_id?: string;
  user_id?: string;
  extracted_text?: string;

  // Section completion tracking
  sections?: Record<FormSection, SectionStatus>;

  // Summary
  rms_summary?: string;

  // Contact fields (flattened)
  rms_contact_fullName?: string;
  rms_contact_email?: string;
  rms_contact_phone?: string;
  rms_contact_location?: string;
  rms_contact_city?: string;
  rms_contact_state?: string;
  rms_contact_linkedin?: string;
  rms_contact_github?: string;
  rms_contact_website?: string;

  // Array counts
  experience_count?: string;
  education_count?: string;
  skill_count?: string;
  project_count?: string;
  certification_count?: string;
  coursework_count?: string;
  involvement_count?: string;

  // Dynamic flattened fields for arrays
  // Experience fields: rms_experience_0_company, rms_experience_0_position, etc.
  // Education fields: rms_education_0_institution, rms_education_0_qualification, etc.
  // Skills fields: rms_skill_0_category, rms_skill_0_keywords, etc.
  // Projects fields: rms_project_0_name, rms_project_0_title, etc.
  // Certifications fields: rms_certification_0_name, rms_certification_0_date, etc.
  // Involvement fields: rms_involvement_0_organization, rms_involvement_0_role, etc.
  [key: string]: any; // Allow dynamic fields
}

interface ResumeDataContextType {
  resumeData: ResumeData | null;
  processedData: ProcessedResumeData;
  loading: boolean;
  populatedSections: FormSection[];
  fetchResumeData: (id: string) => Promise<void>;
  updateResumeData: (updates: Partial<ResumeData>) => void;
  saveResumeData: () => Promise<void>;
  getPopulatedSections: () => FormSection[];
  getExtractedTextForKeywords: () => string;
  isKeywordAnalysisReady: boolean;
}

const defaultProcessedData: ProcessedResumeData = {
  contact: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  coursework: [],
  involvement: []
};

const ResumeDataContext = createContext<ResumeDataContextType | undefined>(undefined);

interface ResumeDataProviderProps {
  children: ReactNode;
}

export const ResumeDataProvider: React.FC<ResumeDataProviderProps> = ({ children }) => {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedResumeData>(defaultProcessedData);
  const [loading, setLoading] = useState<boolean>(false);
  const [populatedSections, setPopulatedSections] = useState<FormSection[]>(['contact', 'summary', 'experience', 'education', 'skills']);

  const { user } = useAuth();

  // Helper to get RMS field with both capitalizations (Rms_ and rms_)
  const getRmsField = useCallback((data: any, fieldName: string): any => {
    if (!data) return undefined;
    // Try with capital R first (primary format from ExifTool)
    if (data[fieldName] !== undefined) return data[fieldName];
    // Try with lowercase r (from Gemini parsing)
    const lowerField = fieldName.replace('Rms_', 'rms_');
    if (data[lowerField] !== undefined) return data[lowerField];
    // Return undefined if neither exists
    return undefined;
  }, []);

  // Convert RMS data to processed format
  const processRmsData = useCallback((rmsData: any): ProcessedResumeData => {
    if (!rmsData) return defaultProcessedData;

    const processed: ProcessedResumeData = { ...defaultProcessedData };

    // Contact info - handle "n/a" values
    const getContactField = (fieldName: string) => {
      const value = getRmsField(rmsData, fieldName);
      return (value && value !== 'n/a') ? value : '';
    };

    processed.contact = {
      fullName: getContactField('Rms_contact_fullName') || 
                getContactField('Rms_contact_givenNames') || 
                getContactField('Rms_contact_firstName') || '',
      email: getContactField('Rms_contact_email') || '',
      phone: getContactField('Rms_contact_phone') || '',
      location: getRmsField(rmsData, 'Rms_contact_city') && getRmsField(rmsData, 'Rms_contact_state')
        ? `${getRmsField(rmsData, 'Rms_contact_city')}, ${getRmsField(rmsData, 'Rms_contact_state')}`
        : getContactField('Rms_contact_location') || '',
      linkedin: getContactField('Rms_contact_linkedin') || '',
      github: getContactField('Rms_contact_github') || '',
      website: getContactField('Rms_contact_website') || ''
    };

    // Summary
    const summaryValue = getRmsField(rmsData, 'Rms_summary');
    processed.summary = (summaryValue && summaryValue !== 'n/a') ? summaryValue : '';

    // Experience
    const expCount = parseInt(getRmsField(rmsData, 'Rms_experience_count') || '0');
    processed.experience = [];
    for (let i = 0; i < expCount; i++) {
      const exp: Experience = {
        company: getRmsField(rmsData, `Rms_experience_${i}_company`) || '',
        position: getRmsField(rmsData, `Rms_experience_${i}_role`) || 
                 getRmsField(rmsData, `Rms_experience_${i}_title`) || 
                 getRmsField(rmsData, `Rms_experience_${i}_position`) || '',
        location: getRmsField(rmsData, `Rms_experience_${i}_location`) || '',
        dateBegin: getRmsField(rmsData, `Rms_experience_${i}_dateBegin`) || 
                  getRmsField(rmsData, `Rms_experience_${i}_dates`) || '',
        dateEnd: getRmsField(rmsData, `Rms_experience_${i}_dateEnd`) || '',
        isCurrent: getRmsField(rmsData, `Rms_experience_${i}_isCurrent`) === true || 
                  getRmsField(rmsData, `Rms_experience_${i}_isCurrent`) === 'true',
        description: getRmsField(rmsData, `Rms_experience_${i}_description`) || ''
      };
      // Only add if has meaningful content
      if (Object.values(exp).some(v => v && v !== 'n/a')) {
        processed.experience.push(exp);
      }
    }

    // Education
    const eduCount = parseInt(getRmsField(rmsData, 'Rms_education_count') || '0');
    processed.education = [];
    for (let i = 0; i < eduCount; i++) {
      const edu: Education = {
        institution: getRmsField(rmsData, `Rms_education_${i}_institution`) || '',
        qualification: getRmsField(rmsData, `Rms_education_${i}_qualification`) || 
                      getRmsField(rmsData, `Rms_education_${i}_degree`) || '',
        fieldOfStudy: getRmsField(rmsData, `Rms_education_${i}_fieldOfStudy`) || '',
        date: getRmsField(rmsData, `Rms_education_${i}_date`) || 
              getRmsField(rmsData, `Rms_education_${i}_dates`) || '',
        isGraduate: getRmsField(rmsData, `Rms_education_${i}_isGraduate`) === true || 
                   getRmsField(rmsData, `Rms_education_${i}_isGraduate`) === 'true',
        gpa: getRmsField(rmsData, `Rms_education_${i}_gpa`) || 
             getRmsField(rmsData, `Rms_education_${i}_score`) || '',
        location: getRmsField(rmsData, `Rms_education_${i}_location`) || '',
        minor: getRmsField(rmsData, `Rms_education_${i}_minor`) || '',
        activities: getRmsField(rmsData, `Rms_education_${i}_activities`) || '',
        description: getRmsField(rmsData, `Rms_education_${i}_description`) || ''
      };
      if (Object.values(edu).some(v => v && v !== 'n/a')) {
        processed.education.push(edu);
      }
    }

    // Skills
    const skillCount = parseInt(getRmsField(rmsData, 'Rms_skill_count') || '0');
    processed.skills = [];
    for (let i = 0; i < skillCount; i++) {
      const skill: Skill = {
        category: getRmsField(rmsData, `Rms_skill_${i}_category`) || '',
        keywords: getRmsField(rmsData, `Rms_skill_${i}_keywords`) || ''
      };
      if (skill.category !== 'n/a' && skill.keywords !== 'n/a' && (skill.category || skill.keywords)) {
        processed.skills.push(skill);
      }
    }

    // Projects
    const projCount = parseInt(getRmsField(rmsData, 'Rms_project_count') || '0');
    processed.projects = [];
    for (let i = 0; i < projCount; i++) {
      const proj: Project = {
        name: getRmsField(rmsData, `Rms_project_${i}_name`) || getRmsField(rmsData, `Rms_project_${i}_title`) || '',
        title: getRmsField(rmsData, `Rms_project_${i}_title`) || getRmsField(rmsData, `Rms_project_${i}_name`) || '',
        role: getRmsField(rmsData, `Rms_project_${i}_role`) || '',
        organization: getRmsField(rmsData, `Rms_project_${i}_organization`) || '',
        description: getRmsField(rmsData, `Rms_project_${i}_description`) || '',
        dateBegin: getRmsField(rmsData, `Rms_project_${i}_dateBegin`) || '',
        dateEnd: getRmsField(rmsData, `Rms_project_${i}_dateEnd`) || '',
        url: getRmsField(rmsData, `Rms_project_${i}_url`) || '',
        repository: getRmsField(rmsData, `Rms_project_${i}_repository`) || ''
      };
      if (Object.values(proj).some(v => v && v !== 'n/a')) {
        processed.projects.push(proj);
      }
    }

    // Certifications
    const certCount = parseInt(getRmsField(rmsData, 'Rms_certification_count') || '0');
    processed.certifications = [];
    for (let i = 0; i < certCount; i++) {
      const cert: Certification = {
        name: getRmsField(rmsData, `Rms_certification_${i}_name`) || '',
        date: getRmsField(rmsData, `Rms_certification_${i}_date`) || '',
        issuer: getRmsField(rmsData, `Rms_certification_${i}_issuer`) || getRmsField(rmsData, `Rms_certification_${i}_department`) || '',
        description: getRmsField(rmsData, `Rms_certification_${i}_description`) || ''
      };
      if (Object.values(cert).some(v => v && v !== 'n/a')) {
        processed.certifications.push(cert);
      }
    }

    // Involvement
    const invCount = parseInt(getRmsField(rmsData, 'Rms_involvement_count') || '0');
    processed.involvement = [];
    for (let i = 0; i < invCount; i++) {
      const inv: Involvement = {
        organization: getRmsField(rmsData, `Rms_involvement_${i}_organization`) || '',
        role: getRmsField(rmsData, `Rms_involvement_${i}_role`) || '',
        location: getRmsField(rmsData, `Rms_involvement_${i}_location`) || '',
        dateBegin: getRmsField(rmsData, `Rms_involvement_${i}_dateBegin`) || 
                  getRmsField(rmsData, `Rms_involvement_${i}_dates`) || '',
        dateEnd: getRmsField(rmsData, `Rms_involvement_${i}_dateEnd`) || '',
        description: getRmsField(rmsData, `Rms_involvement_${i}_description`) || ''
      };
      // Include if has organization, role, or description (don't require all fields)
      if (inv.organization || inv.role || inv.description) {
        processed.involvement.push(inv);
      }
    }

    return processed;
  }, [getRmsField]);

  // Generate extracted text for keyword analysis
  const generateExtractedText = useCallback((data: ProcessedResumeData): string => {
    const sections: string[] = [];
    
    // Contact info
    if (data.contact) {
      sections.push(Object.values(data.contact).filter(Boolean).join(' '));
    }
    
    // Summary
    if (data.summary) {
      sections.push(data.summary);
    }
    
    // Experience
    data.experience?.forEach(exp => {
      sections.push([exp.position, exp.company, exp.location, exp.description].filter(Boolean).join(' '));
    });
    
    // Education
    data.education?.forEach(edu => {
      sections.push([edu.institution, edu.qualification, edu.fieldOfStudy, edu.location].filter(Boolean).join(' '));
    });
    
    // Skills
    data.skills?.forEach(skill => {
      sections.push([skill.category, skill.keywords].filter(Boolean).join(' '));
    });
    
    // Projects
    data.projects?.forEach(proj => {
      sections.push([proj.name || proj.title, proj.description].filter(Boolean).join(' '));
    });
    
    // Involvement
    data.involvement?.forEach(inv => {
      sections.push([inv.organization, inv.role, inv.description].filter(Boolean).join(' '));
    });
    
    return sections.join(' ').trim();
  }, []);

  // Check if resume data is ready for keyword analysis
  const isKeywordAnalysisReady = useMemo(() => {
    if (!resumeData) return false;
    
    const hasContent = resumeData.extracted_text || 
                      processedData.summary || 
                      processedData.experience.length > 0 ||
                      processedData.education.length > 0 ||
                      processedData.skills.length > 0;
    
    return !!hasContent;
  }, [resumeData, processedData]);

  // Fetch resume data from Firebase
  const fetchResumeData = async (id: string) => {
    setLoading(true);
    try {
      const userId = user?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const resumeRef = doc(db, 'resumes', id);
      const resumeSnap = await getDoc(resumeRef);

      if (resumeSnap.exists()) {
        const firestoreData = resumeSnap.data();
        
        // Extract RMS data (the new primary format)
        const rmsData = firestoreData.rmsRawData || {};
        
        // Process RMS data to get structured format
        const processed = processRmsData(rmsData);
        
        // Generate extracted text
        const extractedText = generateExtractedText(processed);
        
        const resumeDataWithId: ResumeData = {
          ...rmsData,
          id,
          title: firestoreData.title || 'Untitled Resume',
          document_id: id,
          user_id: userId,
          extracted_text: extractedText,
          sections: createDefaultSections(rmsData)
        };
        
        setResumeData(resumeDataWithId);
      } else {
        setResumeData(createEmptyResume(id));
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      setResumeData(createEmptyResume(id));
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const createDefaultSections = useCallback((data: any): Record<FormSection, { isComplete: boolean }> => ({
    contact: { isComplete: Boolean(getRmsField(data, 'Rms_contact_fullName') || 
                                  getRmsField(data, 'Rms_contact_email') ||
                                  getRmsField(data, 'Rms_contact_phone')) },
    experience: { isComplete: parseInt(getRmsField(data, 'Rms_experience_count') || '0') > 0 },
    education: { isComplete: parseInt(getRmsField(data, 'Rms_education_count') || '0') > 0 },
    skills: { isComplete: parseInt(getRmsField(data, 'Rms_skill_count') || '0') > 0 },
    projects: { isComplete: parseInt(getRmsField(data, 'Rms_project_count') || getRmsField(data, 'Rms_projects_count') || '0') > 0 },
    certifications: { isComplete: parseInt(getRmsField(data, 'Rms_certification_count') || getRmsField(data, 'Rms_certifications_count') || '0') > 0 },
    coursework: { isComplete: false },
    involvement: { isComplete: parseInt(getRmsField(data, 'Rms_involvement_count') || '0') > 0 },
    summary: { isComplete: Boolean(getRmsField(data, 'Rms_summary')) }
  }), [getRmsField]);

  const createEmptyResume = (id: string): ResumeData => ({
    id,
    title: "New Resume",
    sections: {
      contact: { isComplete: false },
      experience: { isComplete: false },
      education: { isComplete: false },
      skills: { isComplete: false },
      projects: { isComplete: false },
      certifications: { isComplete: false },
      coursework: { isComplete: false },
      involvement: { isComplete: false },
      summary: { isComplete: false }
    }
  });

  // Determine populated sections
  const getPopulatedSections = useCallback((): FormSection[] => {
    if (!processedData) return ['contact'];

    const sections: FormSection[] = ['contact']; // Always include contact

    const sectionChecks: Record<FormSection, boolean> = {
      contact: true,
      summary: !!processedData.summary?.trim(),
      experience: processedData.experience.length > 0,
      education: processedData.education.length > 0,
      skills: processedData.skills.length > 0,
      projects: processedData.projects.length > 0,
      certifications: processedData.certifications.length > 0,
      coursework: processedData.coursework.length > 0,
      involvement: processedData.involvement.length > 0
    };

    Object.entries(sectionChecks).forEach(([section, hasContent]) => {
      if (hasContent && !sections.includes(section as FormSection)) {
        sections.push(section as FormSection);
      }
    });

    // Default sections if only contact exists
    if (sections.length <= 1) {
      sections.push('summary', 'experience', 'education', 'skills');
    }

    return sections;
  }, [processedData]);

  // Update resume data
  const updateResumeData = (updates: Partial<ResumeData>) => {
    setResumeData(prevData => {
      if (!prevData) return null;
      return { ...prevData, ...updates };
    });
  };

  // Get extracted text for keyword analysis
  const getExtractedTextForKeywords = useCallback((): string => {
    // Prefer cached extracted_text if available
    if (resumeData?.extracted_text) {
      return resumeData.extracted_text;
    }

    // Generate from processed data
    if (processedData) {
      return generateExtractedText(processedData);
    }

    console.warn('No content available for keyword analysis');
    return '';
  }, [resumeData, processedData, generateExtractedText]);

  // Save resume data
  const saveResumeData = async () => {
    if (!resumeData || !user?.uid) return;

    setLoading(true);
    try {
      const resumeRef = doc(db, 'resumes', resumeData.id);
      await updateDoc(resumeRef, {
        ...resumeData,
        rmsRawData: resumeData, // Store the flattened data as rmsRawData
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (resumeData) {
      const processed = processRmsData(resumeData);
      setProcessedData(processed);
    }
  }, [resumeData, processRmsData]);

  useEffect(() => {
    const sections = getPopulatedSections();
    setPopulatedSections(sections);
  }, [getPopulatedSections]);

  const value: ResumeDataContextType = {
    resumeData,
    processedData,
    loading,
    populatedSections,
    fetchResumeData,
    updateResumeData,
    saveResumeData,
    getPopulatedSections,
    getExtractedTextForKeywords,
    isKeywordAnalysisReady
  };

  return (
    <ResumeDataContext.Provider value={value}>
      {children}
    </ResumeDataContext.Provider>
  );
};

export const useResumeData = (): ResumeDataContextType => {
  const context = useContext(ResumeDataContext);
  if (!context) {
    throw new Error('useResumeData must be used within a ResumeDataProvider');
  }
  return context;
};