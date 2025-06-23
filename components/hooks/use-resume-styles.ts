// hooks/use-resume-styles.ts

import { useState, useCallback, useMemo, useEffect } from 'react';
import { DocumentSettings } from '@/components/layout/resume-header-bar';
import {
  generateInlineStyles,
  generateResumeCSS,
  generateResumeStyles, getPaperDimensions,
  ResumeStyleConfig
} from '../resume/styles/resume-styles';
import {RESUME_TEMPLATES} from "@/lib/features/api/config/constants";
import {applyTemplateToSettings, getTemplateStyles} from "@/components/resume/templates/resume-templates";

// Resume template types
export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  isCustom?: boolean;
}


interface UseResumeStylesOptions {
  initialSettings?: Partial<DocumentSettings>;
  initialTemplate?: string;
  onSettingsChange?: (settings: DocumentSettings) => void;
  persistSettings?: boolean;
  storageKey?: string;
}

interface UseResumeStylesReturn {
  // Settings
  documentSettings: DocumentSettings;
  currentTemplate: string;

  // Styles
  styles: ResumeStyleConfig;
  css: string;
  inlineStyles: ReturnType<typeof generateInlineStyles>;

  // Dimensions
  paperDimensions: { width: number; height: number };
  scaledDimensions: { width: number; height: number };

  // Actions
  updateSetting: <K extends keyof DocumentSettings>(key: K, value: DocumentSettings[K]) => void;
  updateSettings: (settings: Partial<DocumentSettings>) => void;
  changeTemplate: (templateId: string) => void;
  resetSettings: () => void;

  // Template info
  templates: typeof RESUME_TEMPLATES;
  templateInfo: ResumeTemplate | null;
}

const DEFAULT_SETTINGS: DocumentSettings = {
  zoom: 100,
  fontFamily: 'Merriweather',
  primaryColor: '#000000',
  textColor: '#000000',
  fontSize: 11,
  lineHeight: 1.2,
  sectionSpacing: 0.75,
  paperSize: 'Letter',
  showIcons: false,
  showDividers: true,
  useIndent: false,
  viewAsPages: true,
};

export function useResumeStyles(options: UseResumeStylesOptions = {}): UseResumeStylesReturn {
  const {
    initialSettings = {},
    initialTemplate = 'professional',
    onSettingsChange,
    persistSettings = true,
    storageKey = 'resume-document-settings',
  } = options;

  // Load persisted settings if available
  const loadPersistedSettings = useCallback((): Partial<DocumentSettings> => {
    if (!persistSettings || typeof window === 'undefined') {
      return {};
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load persisted settings:', error);
    }

    return {};
  }, [persistSettings, storageKey]);

  // Initialize settings with persisted values, defaults, and initial overrides
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...loadPersistedSettings(),
    ...initialSettings,
  }));

  const [currentTemplate, setCurrentTemplate] = useState(initialTemplate);

  // Persist settings when they change
  useEffect(() => {
    if (persistSettings && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(documentSettings));
      } catch (error) {
        console.warn('Failed to persist settings:', error);
      }
    }
  }, [documentSettings, persistSettings, storageKey]);

  // Notify parent component of settings changes
  useEffect(() => {
    onSettingsChange?.(documentSettings);
  }, [documentSettings, onSettingsChange]);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof DocumentSettings>(
    key: K,
    value: DocumentSettings[K]
  ) => {
    setDocumentSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Update multiple settings
  const updateSettings = useCallback((settings: Partial<DocumentSettings>) => {
    setDocumentSettings(prev => ({
      ...prev,
      ...settings,
    }));
  }, []);

  // Change template
  const changeTemplate = useCallback((templateId: string) => {
    const newSettings = applyTemplateToSettings(templateId, documentSettings);
    setDocumentSettings(newSettings);
    setCurrentTemplate(templateId);
  }, [documentSettings]);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setDocumentSettings(DEFAULT_SETTINGS);
    setCurrentTemplate('professional');

    if (persistSettings && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('Failed to clear persisted settings:', error);
      }
    }
  }, [persistSettings, storageKey]);

  // Generate styles based on current settings and template
  const styles = useMemo(() => {
    const templateStyles = getTemplateStyles(currentTemplate, documentSettings);
    return generateResumeStyles(documentSettings, currentTemplate);
  }, [documentSettings, currentTemplate]);

  // Generate CSS
  const css = useMemo(() => generateResumeCSS(styles), [styles]);

  // Generate inline styles
  const inlineStyles = useMemo(() => generateInlineStyles(styles), [styles]);

  // Get paper dimensions
  const paperDimensions = useMemo(() =>
    getPaperDimensions(documentSettings.paperSize),
    [documentSettings.paperSize]
  );

  // Calculate scaled dimensions
  const scaledDimensions = useMemo(() => ({
    width: paperDimensions.width * (documentSettings.zoom / 100),
    height: paperDimensions.height * (documentSettings.zoom / 100),
  }), [paperDimensions, documentSettings.zoom]);

  // Get current template info
  const templateInfo = useMemo(() =>
    RESUME_TEMPLATES[currentTemplate] || null,
    [currentTemplate]
  );

  return {
    // Settings
    documentSettings,
    currentTemplate,

    // Styles
    styles,
    css,
    inlineStyles,

    // Dimensions
    paperDimensions,
    scaledDimensions,

    // Actions
    updateSetting,
    updateSettings,
    changeTemplate,
    resetSettings,

    // Template info
    templates: RESUME_TEMPLATES,
    templateInfo,
  };
}

// Additional utility hooks

export function useResumeFont(fontFamily: string) {
  useEffect(() => {
    // Check if font needs to be loaded
    if (typeof window === 'undefined') return;

    const fontMap = {
      'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap',
      'Source Sans Pro': 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap',
      'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    };

    const fontUrl = fontMap[fontFamily as keyof typeof fontMap];
    if (!fontUrl) return;

    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (existingLink) return;

    // Create and append font link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);

    // Cleanup
    return () => {
      // Don't remove the font as other components might be using it
    };
  }, [fontFamily]);
}

export function useResumeTheme(isDarkMode: boolean) {
  return useMemo(() => ({
    background: isDarkMode ? '#1a202c' : '#f7fafc',
    surface: isDarkMode ? '#2d3748' : '#ffffff',
    border: isDarkMode ? '#4a5568' : '#e2e8f0',
    text: {
      primary: isDarkMode ? '#f7fafc' : '#1a202c',
      secondary: isDarkMode ? '#e2e8f0' : '#4a5568',
      muted: isDarkMode ? '#cbd5e0' : '#718096',
    },
    shadow: isDarkMode
      ? '0 0 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.15)'
      : '0 0 20px rgba(0, 0, 0, 0.1), 0 0 40px rgba(0, 0, 0, 0.05)',
  }), [isDarkMode]);
}

// Export commonly used style presets
export const STYLE_PRESETS = {
  compact: {
    fontSize: 10,
    lineHeight: 1.15,
    sectionSpacing: 0.5,
  },
  standard: {
    fontSize: 11,
    lineHeight: 1.2,
    sectionSpacing: 0.75,
  },
  relaxed: {
    fontSize: 12,
    lineHeight: 1.5,
    sectionSpacing: 1,
  },
  spacious: {
    fontSize: 12,
    lineHeight: 1.6,
    sectionSpacing: 1.25,
  },
} as const;

// Export font presets for quick access
export const FONT_PRESETS = {
  serif: ['Times New Roman', 'Georgia', 'Merriweather'],
  sansSerif: ['Arial', 'Helvetica', 'Roboto', 'Source Sans Pro'],
  professional: ['Times New Roman', 'Calibri', 'Arial'],
  modern: ['Source Sans Pro', 'Roboto', 'Helvetica'],
  creative: ['Merriweather', 'Georgia', 'Source Sans Pro'],
} as const;