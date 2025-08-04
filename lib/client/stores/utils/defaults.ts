// lib/client/stores/utils/defaults.ts
import type { UnifiedResumeData, DirtyState } from '../types';

export const createDefaultResumeData = (): UnifiedResumeData => ({
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

export const createDefaultDirtyState = (): DirtyState => ({
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