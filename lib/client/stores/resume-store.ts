import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/config/firebase-config'

// Types from existing resume editor
export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  country: string;
  state: string;
  city: string;
  showEmail: boolean;
  showPhone: boolean;
  showLinkedin: boolean;
  showWebsite: boolean;
  showLocation: boolean;
  showCountry: boolean;
  showState: boolean;
  showCity: boolean;
}

export interface ExperienceEntry {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  bulletPoints: string[];
}

export interface EducationEntry {
  id?: string;
  institution: string;
  qualification: string;
  location?: string;
  date?: Date;
  dateFormat?: string;
  minor?: string;
  score?: string;
  scoreType?: string;
  description?: string;
}

export interface SkillEntry {
  id?: string;
  category: string;
  keywords: string;
}

export interface ProjectEntry {
  id?: string;
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  url?: string;
  description?: string;
  bulletPoints: string[];
}

export interface InvolvementEntry {
  id?: string;
  organization: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  bulletPoints: string[];
}

export interface CourseworkEntry {
  id?: string;
  name: string;
  institution: string;
  date?: string;
  description?: string;
}

export interface CertificationEntry {
  id?: string;
  name: string;
  issuer: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface AwardEntry {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

export interface PublicationEntry {
  id: string;
  title: string;
  publisher: string;
  date: string;
  authors: string;
  url?: string;
  description?: string;
}

export interface UnifiedResumeData {
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

// Dirty tracking types
export type SectionKey = keyof UnifiedResumeData;
export type DirtyState = Record<SectionKey, boolean>;

export interface SaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  pendingSections: SectionKey[];
  error: string | null;
}

interface ResumeStore {
  // Core state
  resumeId: string | null;
  resumeData: UnifiedResumeData;
  originalData: UnifiedResumeData;
  dirtyState: DirtyState;
  saveStatus: SaveStatus;
  
  // Actions
  initializeResume: (resumeId: string, data: UnifiedResumeData) => void;
  updateSection: <T extends SectionKey>(section: T, data: UnifiedResumeData[T]) => void;
  markSectionClean: (section: SectionKey) => void;
  markAllClean: () => void;
  saveSection: (section: SectionKey) => Promise<void>;
  saveAllDirty: () => Promise<void>;
  revertSection: (section: SectionKey) => void;
  revertAll: () => void;
  
  // Computed getters
  isDirty: () => boolean;
  isSectionDirty: (section: SectionKey) => boolean;
  getDirtySections: () => SectionKey[];
  hasUnsavedChanges: () => boolean;
}

// Default empty resume data
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

// Default dirty state
const createDefaultDirtyState = (): DirtyState => ({
  contactInfo: false,
  summary: false,
  experiences: false,
  education: false,
  skills: false,
  projects: false,
  involvements: false,
  coursework: false,
  certifications: false,
  awards: false,
  languages: false,
  publications: false
});

// Helper function to convert unified format to RMS raw format for Firebase compatibility
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
      raw[`Rms_involvement_${index}_description`] = inv.description || '';
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

export const useResumeStore = create<ResumeStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      resumeId: null,
      resumeData: createDefaultResumeData(),
      originalData: createDefaultResumeData(),
      dirtyState: createDefaultDirtyState(),
      saveStatus: {
        isSaving: false,
        lastSaved: null,
        pendingSections: [],
        error: null
      },

      // Initialize resume data
      initializeResume: (resumeId: string, data: UnifiedResumeData) => {
        set((state) => {
          // Only initialize if actually switching to a different resume
          if (state.resumeId !== resumeId) {
            state.resumeId = resumeId;
            state.resumeData = { ...data };
            state.originalData = { ...data };
            state.dirtyState = createDefaultDirtyState();
            state.saveStatus = {
              isSaving: false,
              lastSaved: null,
              pendingSections: [],
              error: null
            };
          }
        });
      },

      // Update a specific section and mark it dirty
      updateSection: <T extends SectionKey>(section: T, data: UnifiedResumeData[T]) => {
        set((state) => {
          state.resumeData[section] = data;
          state.dirtyState[section] = true;
          state.saveStatus.error = null;
        });
      },

      // Mark a section as clean (saved)
      markSectionClean: (section: SectionKey) => {
        set((state) => {
          state.dirtyState[section] = false;
          // Handle both object and primitive types
          const data = state.resumeData[section];
          (state.originalData as any)[section] = typeof data === 'object' && data !== null 
            ? Array.isArray(data) ? [...data] : { ...data }
            : data;
          state.saveStatus.pendingSections = state.saveStatus.pendingSections.filter(s => s !== section);
        });
      },

      // Mark all sections as clean
      markAllClean: () => {
        set((state) => {
          state.dirtyState = createDefaultDirtyState();
          state.originalData = { ...state.resumeData };
          state.saveStatus.pendingSections = [];
          state.saveStatus.lastSaved = new Date();
        });
      },

      // Save a specific section to Firebase
      saveSection: async (section: SectionKey) => {
        const state = get();
        if (!state.resumeId || !state.dirtyState[section]) {
          return;
        }

        set((state) => {
          state.saveStatus.isSaving = true;
          state.saveStatus.error = null;
          if (!state.saveStatus.pendingSections.includes(section)) {
            state.saveStatus.pendingSections.push(section);
          }
        });

        try {
          const resumeRef = doc(db, 'resumes', state.resumeId);
          const rawData = convertToRawFormat(state.resumeData);

          await updateDoc(resumeRef, {
            rmsRawData: rawData,
            data: state.resumeData,
            updatedAt: serverTimestamp()
          });

          set((state) => {
            state.dirtyState[section] = false;
            // Handle both object and primitive types
            const data = state.resumeData[section];
            (state.originalData as any)[section] = typeof data === 'object' && data !== null 
              ? Array.isArray(data) ? [...data] : { ...data }
              : data;
            state.saveStatus.pendingSections = state.saveStatus.pendingSections.filter(s => s !== section);
            state.saveStatus.lastSaved = new Date();
            state.saveStatus.isSaving = state.saveStatus.pendingSections.length > 0;
          });

        } catch (error) {
          console.error('Error saving section:', error);
          set((state) => {
            state.saveStatus.error = `Failed to save ${section}`;
            state.saveStatus.pendingSections = state.saveStatus.pendingSections.filter(s => s !== section);
            state.saveStatus.isSaving = state.saveStatus.pendingSections.length > 0;
          });
          throw error;
        }
      },

      // Save all dirty sections using batched writes
      saveAllDirty: async () => {
        const state = get();
        if (!state.resumeId) {
          return;
        }

        const dirtySections = Object.entries(state.dirtyState)
          .filter(([_, isDirty]) => isDirty)
          .map(([section, _]) => section as SectionKey);

        if (dirtySections.length === 0) {
          return;
        }

        set((state) => {
          state.saveStatus.isSaving = true;
          state.saveStatus.error = null;
          state.saveStatus.pendingSections = [...dirtySections];
        });

        try {
          // Use batched write for better performance
          const batch = writeBatch(db);
          const resumeRef = doc(db, 'resumes', state.resumeId);
          const rawData = convertToRawFormat(state.resumeData);

          batch.update(resumeRef, {
            rmsRawData: rawData,
            data: state.resumeData,
            updatedAt: serverTimestamp()
          });

          await batch.commit();

          set((state) => {
            // Mark all dirty sections as clean
            dirtySections.forEach(section => {
              state.dirtyState[section] = false;
              // Handle both object and primitive types
              const data = state.resumeData[section];
              (state.originalData as any)[section] = typeof data === 'object' && data !== null 
                ? Array.isArray(data) ? [...data] : { ...data }
                : data;
            });
            state.saveStatus.pendingSections = [];
            state.saveStatus.lastSaved = new Date();
            state.saveStatus.isSaving = false;
          });

        } catch (error) {
          console.error('Error saving resume:', error);
          set((state) => {
            state.saveStatus.error = 'Failed to save changes';
            state.saveStatus.pendingSections = [];
            state.saveStatus.isSaving = false;
          });
          throw error;
        }
      },

      // Revert a specific section to its last saved state
      revertSection: (section: SectionKey) => {
        set((state) => {
          // Handle both object and primitive types
          const data = state.originalData[section];
          (state.resumeData as any)[section] = typeof data === 'object' && data !== null 
            ? Array.isArray(data) ? [...data] : { ...data }
            : data;
          state.dirtyState[section] = false;
        });
      },

      // Revert all sections to their last saved state
      revertAll: () => {
        set((state) => {
          state.resumeData = { ...state.originalData };
          state.dirtyState = createDefaultDirtyState();
          state.saveStatus.error = null;
        });
      },

      // Computed getters
      isDirty: () => {
        const state = get();
        return Object.values(state.dirtyState).some(isDirty => isDirty);
      },

      isSectionDirty: (section: SectionKey) => {
        const state = get();
        return state.dirtyState[section];
      },

      getDirtySections: () => {
        const state = get();
        return Object.entries(state.dirtyState)
          .filter(([_, isDirty]) => isDirty)
          .map(([section, _]) => section as SectionKey);
      },

      hasUnsavedChanges: () => {
        const state = get();
        return Object.values(state.dirtyState).some(isDirty => isDirty);
      }
    })),
    {
      name: 'resume-store'
    }
  )
);