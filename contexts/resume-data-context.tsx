// src/contexts/ResumeDataContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/lib/core/auth/firebase-config";

import {
  FormSection,
  ResumeData,
  ProcessedResumeData,
  Experience,
  Education,
  Skill,
  Project,
  Certification,
  Involvement
} from '@/types/resume';
import { useAuth } from "@/contexts/firebase-auth-context";
import { StorageService } from "@/lib/core/database/services/storage-service";


interface ResumeDataContextType {
  resumeData: ResumeData | null;
  processedData: ProcessedResumeData;
  loading: boolean;
  populatedSections: FormSection[];
  fetchResumeData: (id: string) => Promise<void>;
  updateResumeData: (updates: Partial<ResumeData>) => void;
  saveResumeData: () => Promise<void>;
  getPopulatedSections: () => FormSection[];
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

  // Transform nested data to flattened format
  const transformNestedToFlattened = (nestedData: any): Partial<ResumeData> => {
    if (!nestedData) return {};

    const flattenedData: any = {
      title: nestedData.title || '',
      rms_summary: nestedData.summary || '',
      experience_count: (nestedData.experience?.length || 0).toString(),
      education_count: (nestedData.education?.length || 0).toString(),
      skill_count: (nestedData.skills?.length || 0).toString(),
      project_count: (nestedData.projects?.length || 0).toString(),
      certification_count: (nestedData.certifications?.length || 0).toString()
    };

    // Contact details
    if (nestedData.contact) {
      Object.entries(nestedData.contact).forEach(([key, value]) => {
        flattenedData[`rms_contact_${key}`] = value || '';
      });
    }

    // Array fields
    const arrayFields = ['experience', 'education', 'skills', 'projects', 'certifications'];
    arrayFields.forEach(field => {
      if (Array.isArray(nestedData[field])) {
        nestedData[field].forEach((item: any, index: number) => {
          Object.entries(item).forEach(([key, value]) => {
            const prefix = `rms_${field}_${index}_`;
            flattenedData[`${prefix}${key}`] = value || '';
          });
        });
      }
    });

    return flattenedData;
  };

  // Process resume data into structured format
  const processResumeData = (data: ResumeData): ProcessedResumeData => {
    const processed: ProcessedResumeData = { ...defaultProcessedData };

    // Contact info
    processed.contact = {
      fullName: data.rms_contact_fullName || '',
      email: data.rms_contact_email || '',
      phone: data.rms_contact_phone || '',
      location: data.rms_contact_location ||
        (data.rms_contact_city && data.rms_contact_state
          ? `${data.rms_contact_city}, ${data.rms_contact_state}`
          : ''),
      linkedin: data.rms_contact_linkedin || '',
      github: data.rms_contact_github || '',
      website: data.rms_contact_website || ''
    };

    processed.summary = data.rms_summary || '';

    // Process array fields
    const processArrayField = <T extends Record<string, any>>(
      fieldName: string,
      countKey: string,
      transformer: (data: any, index: number) => T
    ): T[] => {
      const count = parseInt(data[countKey] || '0');
      const items: T[] = [];

      for (let i = 0; i < count; i++) {
        try {
          items.push(transformer(data, i));
        } catch (error) {
          console.error(`Error processing ${fieldName} item ${i}:`, error);
        }
      }

      return items;
    };

    processed.experience = processArrayField<Experience>(
      'experience',
      'experience_count',
      (data, i) => {
        const prefix = `rms_experience_${i}_`;
        return {
          company: data[`${prefix}company`] || '',
          position: data[`${prefix}position`] || data[`${prefix}role`] || '',
          location: data[`${prefix}location`] || '',
          dateBegin: data[`${prefix}dateBegin`] || '',
          dateEnd: data[`${prefix}dateEnd`] || '',
          isCurrent: data[`${prefix}isCurrent`] === 'true',
          description: data[`${prefix}description`] || ''
        };
      }
    );

    processed.education = processArrayField<Education>(
      'education',
      'education_count',
      (data, i) => {
        const prefix = `rms_education_${i}_`;
        return {
          institution: data[`${prefix}institution`] || '',
          qualification: data[`${prefix}qualification`] || '',
          fieldOfStudy: data[`${prefix}fieldOfStudy`] || '',
          date: data[`${prefix}date`] || '',
          isGraduate: data[`${prefix}isGraduate`] === 'true',
          gpa: data[`${prefix}gpa`] || data[`${prefix}score`] || '',
          location: data[`${prefix}location`] || '',
          minor: data[`${prefix}minor`] || '',
          activities: data[`${prefix}activities`] || '',
          description: data[`${prefix}description`] || ''
        };
      }
    );

    processed.skills = processArrayField<Skill>(
      'skills',
      'skill_count',
      (data, i) => {
        const prefix = `rms_skill_${i}_`;
        return {
          category: data[`${prefix}category`] || '',
          keywords: data[`${prefix}keywords`] || ''
        };
      }
    );

    processed.projects = processArrayField<Project>(
      'projects',
      'project_count',
      (data, i) => {
        const prefix = `rms_project_${i}_`;
        return {
          name: data[`${prefix}name`] || data[`${prefix}title`] || '',
          title: data[`${prefix}title`] || data[`${prefix}name`] || '',
          role: data[`${prefix}role`] || '',
          organization: data[`${prefix}organization`] || '',
          description: data[`${prefix}description`] || '',
          dateBegin: data[`${prefix}dateBegin`] || '',
          dateEnd: data[`${prefix}dateEnd`] || '',
          url: data[`${prefix}url`] || '',
          repository: data[`${prefix}repository`] || ''
        };
      }
    );

    processed.certifications = processArrayField<Certification>(
      'certifications',
      'certification_count',
      (data, i) => {
        const prefix = `rms_certification_${i}_`;
        return {
          name: data[`${prefix}name`] || '',
          date: data[`${prefix}date`] || '',
          issuer: data[`${prefix}issuer`] || data[`${prefix}department`] || '',
          description: data[`${prefix}description`] || ''
        };
      }
    );

    processed.involvement = processArrayField<Involvement>(
      'involvement',
      'involvement_count',
      (data, i) => {
        const prefix = `rms_involvement_${i}_`;
        return {
          organization: data[`${prefix}organization`] || '',
          role: data[`${prefix}role`] || '',
          location: data[`${prefix}location`] || '',
          dateBegin: data[`${prefix}dateBegin`] || '',
          dateEnd: data[`${prefix}dateEnd`] || '',
          description: data[`${prefix}description`] || ''
        };
      }
    );

    return processed;
  };

  // Determine populated sections
  const getPopulatedSections = (): FormSection[] => {
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
  };

  // Helper function to generate extracted text from parsed data
  const generateExtractedText = (parsedData: any): string => {
    if (!parsedData) return '';
    
    const sections: string[] = [];
    
    // Contact info
    if (parsedData.contactInfo) {
      const contact = parsedData.contactInfo;
      sections.push([contact.fullName, contact.email, contact.phone, contact.location].filter(Boolean).join(' '));
    }
    
    // Summary/Objective
    if (parsedData.summary || parsedData.objective) {
      sections.push(parsedData.summary || parsedData.objective);
    }
    
    // Experience
    const experienceArray = parsedData.experiences || parsedData.experience || [];
    if (experienceArray.length > 0) {
      experienceArray.forEach((exp: any) => {
        sections.push([exp.position || exp.role, exp.company, exp.location, exp.description].filter(Boolean).join(' '));
      });
    }
    
    // Education
    if (parsedData.education?.length > 0) {
      parsedData.education.forEach((edu: any) => {
        sections.push([edu.institution, edu.degree || edu.qualification, edu.fieldOfStudy, edu.description].filter(Boolean).join(' '));
      });
    }
    
    // Skills
    const skillsArray = parsedData.skillCategories || parsedData.skills || [];
    if (skillsArray.length > 0) {
      skillsArray.forEach((category: any) => {
        sections.push([category.category, category.keywords].filter(Boolean).join(' '));
      });
    }
    
    // Projects
    if (parsedData.projects?.length > 0) {
      parsedData.projects.forEach((proj: any) => {
        sections.push([proj.name || proj.title, proj.description].filter(Boolean).join(' '));
      });
    }
    
    // Involvements
    if (parsedData.involvements?.length > 0) {
      parsedData.involvements.forEach((inv: any) => {
        sections.push([inv.organization, inv.role, inv.description].filter(Boolean).join(' '));
      });
    }
    
    return sections.join(' ').trim();
  };

  // Fetch resume data
  const fetchResumeData = async (id: string) => {
    setLoading(true);
    try {
      const userId = user?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Fetch directly from Firestore
      const resumeRef = doc(db, 'resumes', id);
      const resumeSnap = await getDoc(resumeRef);

      if (resumeSnap.exists()) {
        const firestoreData = resumeSnap.data();
        
        // Check if this is the expected format with parsedData and rmsRawData
        if (firestoreData.parsedData || firestoreData.rmsRawData) {
          // Use rmsRawData for the flattened format
          const rawData = firestoreData.rmsRawData || {};
          
          // Generate extracted text from parsedData
          const extractedText = generateExtractedText(firestoreData.parsedData);
          
          const resumeDataWithId: ResumeData = {
            ...rawData,
            id,
            title: firestoreData.title || 'Untitled Resume',
            document_id: id,
            user_id: userId,
            extracted_text: extractedText,
            sections: createDefaultSections(rawData)
          };
          
          setResumeData(resumeDataWithId);
        } else {
          // Fallback to old format handling
          const data = await StorageService.getDocumentData(userId, id);
          
          if (data) {
            const isNestedFormat = Array.isArray(data.experience) ||
                                  Array.isArray(data.education) ||
                                  Array.isArray(data.skills);

            let resumeDataWithId: ResumeData;

            if (isNestedFormat) {
              const flattenedData = transformNestedToFlattened(data);
              const extractedText = generateExtractedText(data);
              resumeDataWithId = {
                ...flattenedData,
                id,
                title: data.title || 'Untitled Resume',
                document_id: id,
                user_id: userId,
                extracted_text: extractedText,
                sections: data.sections || createDefaultSections(data)
              } as ResumeData;
            } else {
              // For old flattened format, reconstruct parsed data for text extraction
              const processedForText = processResumeData(data);
              const extractedText = generateExtractedText({
                contactInfo: processedForText.contact,
                summary: processedForText.summary,
                experiences: processedForText.experience,
                education: processedForText.education,
                skillCategories: processedForText.skills,
                projects: processedForText.projects,
                involvements: processedForText.involvement
              });
              resumeDataWithId = {
                ...data,
                id,
                title: data.title || 'Untitled Resume',
                document_id: id,
                user_id: userId,
                extracted_text: extractedText,
                sections: data.sections || createDefaultSections(data)
              } as ResumeData;
            }

            setResumeData(resumeDataWithId);
          } else {
            setResumeData(createEmptyResume(id));
          }
        }
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
  const createDefaultSections = (data: any): Record<FormSection, { isComplete: boolean }> => ({
    contact: { isComplete: Boolean(data.contact || data.rms_contact_fullName) },
    experience: { isComplete: Boolean(data.experience?.length || parseInt(data.experience_count || '0')) },
    education: { isComplete: Boolean(data.education?.length || parseInt(data.education_count || '0')) },
    skills: { isComplete: Boolean(data.skills?.length || parseInt(data.skill_count || '0')) },
    projects: { isComplete: Boolean(data.projects?.length || parseInt(data.project_count || '0')) },
    certifications: { isComplete: Boolean(data.certifications?.length || parseInt(data.certification_count || '0')) },
    coursework: { isComplete: false },
    involvement: { isComplete: false },
    summary: { isComplete: Boolean(data.summary || data.rms_summary) }
  });

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

  // Update resume data
  const updateResumeData = (updates: Partial<ResumeData>) => {
    setResumeData(prevData => {
      if (!prevData) return null;
      return { ...prevData, ...updates };
    });
  };

  // Save resume data
  const saveResumeData = async () => {
    if (!resumeData || !user?.uid) return;

    setLoading(true);
    try {
      await StorageService.updateDocument(user.uid, resumeData.id, resumeData);
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
      const processed = processResumeData(resumeData);
      setProcessedData(processed);
    }
  }, [resumeData]);

  useEffect(() => {
    const sections = getPopulatedSections();
    setPopulatedSections(sections);
  }, [processedData]);

  const value: ResumeDataContextType = {
    resumeData,
    processedData,
    loading,
    populatedSections,
    fetchResumeData,
    updateResumeData,
    saveResumeData,
    getPopulatedSections
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