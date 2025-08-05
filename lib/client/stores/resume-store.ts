// lib/client/stores/resume-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/config/firebase-config'

interface SaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  pendingSections: string[];
  error: string | null;
}

interface ResumeStore {
  // Core state
  resumeId: string | null;
  resumeData: any; // RMS format data
  originalData: any; // RMS format data
  saveStatus: SaveStatus;

  // Actions
  initializeResume: (resumeId: string, data: any) => void;
  updateField: (fieldKey: string, value: any) => void;
  markFieldClean: (fieldKey: string) => void;
  markAllClean: () => void;
  saveChanges: () => Promise<void>;
  revertField: (fieldKey: string) => void;
  revertAll: () => void;
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
      resumeData: {},
      originalData: {},
      saveStatus: {
        isSaving: false,
        lastSaved: null,
        pendingSections: [],
        error: null
      },


      // Initialize resume data
      initializeResume: (resumeId: string, data: any) => {
        set((state) => {
          if (state.resumeId !== resumeId) {
            state.resumeId = resumeId;
            state.resumeData = { ...data };
            state.originalData = { ...data };
            state.saveStatus = {
              isSaving: false,
              lastSaved: null,
              pendingSections: [],
              error: null
            };
          }
        });
      },

      // Update a specific RMS field
      updateField: (fieldKey: string, value: any) => {
        set((state) => {
          state.resumeData[fieldKey] = value;
          state.saveStatus.error = null;
        });
      },

      // Mark a field as clean (saved)
      markFieldClean: (fieldKey: string) => {
        set((state) => {
          state.originalData[fieldKey] = state.resumeData[fieldKey];
        });
      },

      // Mark all fields as clean
      markAllClean: () => {
        set((state) => {
          state.originalData = { ...state.resumeData };
          state.saveStatus.pendingSections = [];
          state.saveStatus.lastSaved = new Date();
        });
      },

      // Save changes to Firebase
      saveChanges: async () => {
        const state = get();
        if (!state.resumeId) {
          return;
        }

        set((state) => {
          state.saveStatus.isSaving = true;
          state.saveStatus.error = null;
        });

        try {
          const resumeRef = doc(db, 'resumes', state.resumeId);

          await updateDoc(resumeRef, {
            parsedData: state.resumeData,
            updatedAt: serverTimestamp()
          });

          set((state) => {
            state.originalData = { ...state.resumeData };
            state.saveStatus.lastSaved = new Date();
            state.saveStatus.isSaving = false;
          });

        } catch (error) {
          console.error('Error saving resume:', error);
          set((state) => {
            state.saveStatus.error = 'Failed to save changes';
            state.saveStatus.isSaving = false;
          });
          throw error;
        }
      },

      // Revert a specific field to its last saved state
      revertField: (fieldKey: string) => {
        set((state) => {
          state.resumeData[fieldKey] = state.originalData[fieldKey];
        });
      },

      // Revert all fields to their last saved state
      revertAll: () => {
        set((state) => {
          state.resumeData = { ...state.originalData };
          state.saveStatus.error = null;
        });
      }
    })),
    {
      name: 'resume-store'
    }
  )
);