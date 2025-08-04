// lib/client/stores/resume-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/config/firebase-config'
import { convertToRawFormat } from './utils/data-converters'
import { createDefaultResumeData, createDefaultDirtyState } from './utils/defaults'
import type { UnifiedResumeData, SectionKey, DirtyState, SaveStatus } from './types'

interface ResumeStore {
  // Core state
  resumeId: string | null;
  resumeData: UnifiedResumeData;
  originalData: UnifiedResumeData;
  dirtyState: DirtyState;
  saveStatus: SaveStatus;

  // Computed properties
  getRawRMSData: () => any;

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

// Helper function to deep clone data
const deepClone = <T>(data: T): T => {
  if (typeof data === 'object' && data !== null) {
    return Array.isArray(data) ? [...data] as T : { ...data };
  }
  return data;
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

      // Computed properties
      getRawRMSData: () => {
        const state = get();
        return convertToRawFormat(state.resumeData);
      },

      // Initialize resume data
      initializeResume: (resumeId: string, data: UnifiedResumeData) => {
        set((state) => {
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
          (state.originalData as any)[section] = deepClone(state.resumeData[section]);
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
            (state.originalData as any)[section] = deepClone(state.resumeData[section]);
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
            dirtySections.forEach(section => {
              state.dirtyState[section] = false;
              (state.originalData as any)[section] = deepClone(state.resumeData[section]);
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
          (state.resumeData as any)[section] = deepClone(state.originalData[section]);
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