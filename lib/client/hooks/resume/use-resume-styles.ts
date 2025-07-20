// hooks/use-resume-styles.ts

import { useState, useCallback, useMemo, useEffect } from 'react';
import { DocumentSettings } from '@/components/features/dashboard/resume-header-bar';
import {
  generateInlineStyles,
  generateResumeCSS,
  generateResumeStyles,
  getPaperDimensions,
  ResumeStyleConfig
} from '@/components/features/resume/styles/resume-styles';
import { RESUME_TEMPLATES, applyTemplateToSettings, ResumeTemplate, validateTemplate } from "@/components/features/resume/templates/resume-templates";


interface UseResumeStylesOptions {
  initialSettings?: Partial<DocumentSettings>;
  initialTemplate?: string;
  onSettingsChange?: (settings: DocumentSettings) => void;
  persistSettings?: boolean;
  storageKey?: string;
}

interface TemplateApplicationResult {
  success: boolean;
  templateId: string;
  templateName: string;
  errors?: string[];
  warnings?: string[];
  appliedChanges?: Record<string, any>;
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
  changeTemplate: (templateId: string) => Promise<boolean>;
  resetSettings: () => void;
  previewTemplate: (templateId: string) => ResumeStyleConfig | null;
  getTemplatePreview: (templateId: string) => TemplateApplicationResult | null;

  // Template info
  templates: typeof RESUME_TEMPLATES;
  templateInfo: ResumeTemplate | null;
  
  // Validation
  validateCurrentTemplate: () => { isValid: boolean; errors: string[]; warnings: string[] };
}

const DEFAULT_SETTINGS: DocumentSettings = {
  zoom: 120,
  fontFamily: 'Merriweather', // Professional template default
  primaryColor: '#000000',
  textColor: '#000000',
  fontSize: 11,
  lineHeight: 1.2,
  sectionSpacing: 0.75,
  paperSize: 'Letter',
  margins: {
    top: 0.75,
    right: 0.75,
    bottom: 0.75,
    left: 0.75,
  },
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
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>(() => {
    const persisted = loadPersistedSettings();
    // If no persisted zoom setting, use the new default of 120
    const persistedWithDefaults = {
      ...persisted,
      zoom: persisted.zoom || 120,
    };
    return {
      ...DEFAULT_SETTINGS,
      ...persistedWithDefaults,
      ...initialSettings,
    };
  });

  const [currentTemplate, setCurrentTemplate] = useState(() => {
    // Always default to 'professional' template unless explicitly overridden
    if (initialTemplate && initialTemplate !== 'professional') {
      console.log(`Using initial template: ${initialTemplate}`);
      return initialTemplate;
    }
    return 'professional';
  });

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

  // Change template with comprehensive error handling and validation
  const changeTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    try {
      // Validate template exists
      if (!RESUME_TEMPLATES[templateId]) {
        console.error(`Template "${templateId}" not found. Available templates:`, Object.keys(RESUME_TEMPLATES));
        return false;
      }

      // Get template configuration
      const template = RESUME_TEMPLATES[templateId];
      
      // Apply template defaults while preserving critical user settings
      const newSettings = applyTemplateToSettings(templateId, documentSettings, {
        preserveUserPreferences: true,
        validateTemplate: true,
        logChanges: process.env.NODE_ENV === 'development'
      });
      
      // Log template application for debugging
      console.log(`Applying template "${template.name}" (${templateId})`, {
        previousTemplate: currentTemplate,
        templateDefaults: template.defaults,
        appliedSettings: newSettings
      });

      // Update settings and template
      setDocumentSettings(newSettings);
      setCurrentTemplate(templateId);

      // Trigger callback if provided
      onSettingsChange?.(newSettings);

      return true;
    } catch (error) {
      console.error('Error applying template:', error);
      return false;
    }
  }, [documentSettings, currentTemplate, onSettingsChange]);

  // Reset to defaults with professional template
  const resetSettings = useCallback(() => {
    const resetDefaults = {
      ...DEFAULT_SETTINGS,
      // Ensure professional template defaults are applied
      fontFamily: 'Merriweather',
      fontSize: 11,
      lineHeight: 1.2,
      sectionSpacing: 0.75,
      primaryColor: '#000000',
      textColor: '#000000',
      showDividers: true,
      useIndent: false,
    };
    
    setDocumentSettings(resetDefaults);
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

  // Preview template without applying it
  const previewTemplate = useCallback((templateId: string): ResumeStyleConfig | null => {
    try {
      const template = RESUME_TEMPLATES[templateId];
      if (!template) {
        console.warn(`Template ${templateId} not found for preview`);
        return null;
      }

      // Generate preview settings
      const previewSettings = applyTemplateToSettings(templateId, documentSettings, {
        preserveUserPreferences: true,
        validateTemplate: true,
        logChanges: false
      });

      // Generate and return preview styles
      return generateResumeStyles(previewSettings, templateId);
    } catch (error) {
      console.error('Error generating template preview:', error);
      return null;
    }
  }, [documentSettings]);

  // Get detailed template preview information
  const getTemplatePreview = useCallback((templateId: string): TemplateApplicationResult | null => {
    try {
      const template = RESUME_TEMPLATES[templateId];
      if (!template) {
        return {
          success: false,
          templateId,
          templateName: 'Unknown',
          errors: [`Template ${templateId} not found`]
        };
      }

      // Validate template
      const validation = validateTemplate(template);
      
      // Preview settings changes
      const previewSettings = applyTemplateToSettings(templateId, documentSettings, {
        preserveUserPreferences: true,
        validateTemplate: false,
        logChanges: false
      });

      // Calculate changes
      const changes: Record<string, any> = {};
      Object.keys(template.defaults).forEach(key => {
        const oldValue = documentSettings[key as keyof DocumentSettings];
        const newValue = previewSettings[key as keyof DocumentSettings];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes[key] = { from: oldValue, to: newValue };
        }
      });

      return {
        success: validation.isValid,
        templateId,
        templateName: template.name,
        errors: validation.errors,
        warnings: validation.warnings,
        appliedChanges: changes
      };
    } catch (error) {
      console.error('Error generating template preview info:', error);
      return {
        success: false,
        templateId,
        templateName: 'Unknown',
        errors: ['Preview generation failed']
      };
    }
  }, [documentSettings]);

  // Validate current template
  const validateCurrentTemplate = useCallback(() => {
    const template = RESUME_TEMPLATES[currentTemplate];
    if (!template) {
      return {
        isValid: false,
        errors: [`Current template ${currentTemplate} not found`],
        warnings: []
      };
    }

    return validateTemplate(template);
  }, [currentTemplate]);

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
    previewTemplate,
    getTemplatePreview,

    // Template info
    templates: RESUME_TEMPLATES,
    templateInfo,
    
    // Validation
    validateCurrentTemplate,
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
