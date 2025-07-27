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
import { DocumentSettingsClient } from '@/lib/client/services/resume/document-settings-client';
import { useTemplateChangeBatch } from './use-debounced-batch';


interface UseResumeStylesOptions {
  initialSettings?: Partial<DocumentSettings>;
  initialTemplate?: string;
  onSettingsChange?: (settings: DocumentSettings) => void;
  persistSettings?: boolean;
  storageKey?: string;
  resumeId?: string;
  syncWithFirestore?: boolean;
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

  // Loading states
  isLoadingFromFirestore: boolean;
  hasLoadedFromFirestore: boolean;
  isReady: boolean;

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
    resumeId,
    syncWithFirestore = true,
  } = options;

  // Check if we have cached data available synchronously
  const hasCachedData = useCallback((): boolean => {
    if (!persistSettings || typeof window === 'undefined' || !resumeId) {
      return false;
    }

    try {
      const cacheKey = `resume-cache-${resumeId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        // Check if cache is recent (within 1 hour)
        if (parsedCache.timestamp && Date.now() - parsedCache.timestamp < 3600000) {
          return true;
        }
      }
    } catch (error) {
      // Ignore cache errors
    }

    return false;
  }, [persistSettings, resumeId]);

  // Load persisted settings with resumeId-specific caching for faster loading
  const loadPersistedSettings = useCallback((): { settings: Partial<DocumentSettings>; template: string; hasCachedData: boolean } => {
    if (!persistSettings || typeof window === 'undefined') {
      return { settings: {}, template: 'professional', hasCachedData: false };
    }

    try {
      // First try resumeId-specific cache (fastest)
      if (resumeId) {
        const cacheKey = `resume-cache-${resumeId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          // Check if cache is recent (within 1 hour)
          if (parsedCache.timestamp && Date.now() - parsedCache.timestamp < 3600000) {
            return {
              settings: parsedCache.settings || {},
              template: parsedCache.template || 'professional',
              hasCachedData: true
            };
          }
        }
      }

      // Fall back to regular localStorage
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        return {
          settings: parsedSettings,
          template: 'professional', // Default fallback
          hasCachedData: false
        };
      }
    } catch (error) {
      console.warn('Failed to load persisted settings:', error);
    }

    return { settings: {}, template: 'professional', hasCachedData: false };
  }, [persistSettings, storageKey, resumeId]);

  // Initialize settings with persisted values, defaults, and initial overrides
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>(() => {
    const { settings: persisted } = loadPersistedSettings();
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
    // Load template from cache first for immediate rendering
    const { template: cachedTemplate } = loadPersistedSettings();
    
    // Priority: initialTemplate > cachedTemplate > 'professional'
    if (initialTemplate && initialTemplate !== 'professional') {
      console.log(`Using initial template: ${initialTemplate}`);
      return initialTemplate;
    }
    
    if (cachedTemplate && cachedTemplate !== 'professional') {
      console.log(`Using cached template: ${cachedTemplate}`);
      return cachedTemplate;
    }
    
    return 'professional';
  });

  // Initialize loading states based on whether we have cached data
  const initialHasCachedData = useMemo(() => hasCachedData(), [hasCachedData]);
  const [isLoadingFromFirestore, setIsLoadingFromFirestore] = useState(false);
  const [hasLoadedFromFirestore, setHasLoadedFromFirestore] = useState(
    !resumeId || !syncWithFirestore || initialHasCachedData
  );

  // Load settings from Firestore when resumeId is available
  useEffect(() => {
    if (!resumeId || !syncWithFirestore || hasLoadedFromFirestore || typeof window === 'undefined') {
      return;
    }

    const loadFirestoreSettings = async () => {
      try {
        // Only show loading if we don't have cached data
        if (!initialHasCachedData) {
          setIsLoadingFromFirestore(true);
        }
        
        const firestoreSettings = await DocumentSettingsClient.loadSettings(resumeId);
        
        if (firestoreSettings) {
          console.log(`Loading settings from Firestore for resume ${resumeId}`, {
            template: firestoreSettings.template,
            fontSize: firestoreSettings.fontSize,
            fontFamily: firestoreSettings.fontFamily,
          });
          
          // Extract template and settings separately
          const { template, lastUpdated, version, ...settings } = firestoreSettings;
          
          // Only update if the Firestore data is actually different from current state
          const settingsChanged = JSON.stringify(settings) !== JSON.stringify(documentSettings) ||
                                template !== currentTemplate;
          
          if (settingsChanged) {
            console.log('Firestore data differs from cache, updating UI');
            setDocumentSettings(settings);
            setCurrentTemplate(template);
            
            // Cache the loaded settings for faster subsequent loads
            if (persistSettings) {
              try {
                const cacheKey = `resume-cache-${resumeId}`;
                const cacheData = {
                  settings,
                  template,
                  timestamp: Date.now()
                };
                localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                // Clear old localStorage key since Firestore is the source of truth
                localStorage.removeItem(storageKey);
              } catch (error) {
                console.warn('Failed to update cache:', error);
              }
            }
          } else {
            console.log('Firestore data matches cache, no UI update needed');
          }
        } else {
          console.log(`No Firestore settings found for resume ${resumeId}, initializing with defaults`);
          // Initialize with professional template defaults only if not already set
          const needsInitialization = currentTemplate !== 'professional' || 
                                     documentSettings.fontFamily !== 'Merriweather';
          
          if (needsInitialization) {
            const defaultSettings = {
              ...DEFAULT_SETTINGS,
              ...initialSettings,
            };
            setDocumentSettings(defaultSettings);
            setCurrentTemplate('professional');
            
            // Save initial settings to Firestore in background
            DocumentSettingsClient.saveSettings(resumeId, defaultSettings, 'professional')
              .catch(error => console.warn('Failed to initialize Firestore settings:', error));
          }
        }
        
        setHasLoadedFromFirestore(true);
      } catch (error) {
        console.error('Error loading settings from Firestore:', error);
        setHasLoadedFromFirestore(true);
      } finally {
        setIsLoadingFromFirestore(false);
      }
    };

    // If we have cached data, load immediately without delay
    // Otherwise, small delay to allow initial render
    const delay = initialHasCachedData ? 0 : 50;
    const timeoutId = setTimeout(loadFirestoreSettings, delay);
    return () => clearTimeout(timeoutId);
  }, [resumeId, syncWithFirestore, hasLoadedFromFirestore, persistSettings, storageKey, initialSettings, documentSettings, currentTemplate, initialHasCachedData]);

  // Persist settings when they change
  useEffect(() => {
    if (!hasLoadedFromFirestore) {
      // Don't persist until we've loaded from Firestore first
      return;
    }

    if (persistSettings && typeof window !== 'undefined') {
      // If syncing with Firestore, use that as primary storage
      if (resumeId && syncWithFirestore) {
        // Debounce Firestore saves to avoid too many writes
        const timeoutId = setTimeout(async () => {
          try {
            await DocumentSettingsClient.saveSettings(resumeId, documentSettings, currentTemplate);
          } catch (error) {
            console.warn('Failed to persist settings to Firestore:', error);
            // Fallback to localStorage
            try {
              localStorage.setItem(storageKey, JSON.stringify(documentSettings));
            } catch (localError) {
              console.warn('Failed to persist to localStorage:', localError);
            }
          }
        }, 1000); // 1 second debounce
        
        return () => clearTimeout(timeoutId);
      } else {
        // Use localStorage for non-Firestore synced resumes
        try {
          localStorage.setItem(storageKey, JSON.stringify(documentSettings));
        } catch (error) {
          console.warn('Failed to persist settings:', error);
        }
      }
    }
  }, [documentSettings, currentTemplate, persistSettings, storageKey, resumeId, syncWithFirestore, hasLoadedFromFirestore]);

  // Notify parent component of settings changes
  useEffect(() => {
    onSettingsChange?.(documentSettings);
  }, [documentSettings, onSettingsChange]);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof DocumentSettings>(
    key: K,
    value: DocumentSettings[K]
  ) => {
    setDocumentSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: value,
      };
      
      // If syncing with Firestore and we have a resumeId, save immediately for critical settings
      if (resumeId && syncWithFirestore && hasLoadedFromFirestore) {
        // For font changes and other critical visual settings, save immediately
        const criticalSettings = ['fontFamily', 'fontSize', 'primaryColor', 'textColor'];
        if (criticalSettings.includes(key as string)) {
          DocumentSettingsClient.saveSettings(resumeId, newSettings, currentTemplate)
            .catch(error => console.warn('Failed to save critical setting to Firestore:', error));
        }
      }
      
      return newSettings;
    });
  }, [resumeId, syncWithFirestore, hasLoadedFromFirestore, currentTemplate]);

  // Update multiple settings
  const updateSettings = useCallback((settings: Partial<DocumentSettings>) => {
    setDocumentSettings(prev => ({
      ...prev,
      ...settings,
    }));
  }, []);

  // Batched template change handler for optimal Firestore performance
  const templateBatch = useTemplateChangeBatch(
    async (templateId: string, settings: DocumentSettings) => {
      if (resumeId && syncWithFirestore && hasLoadedFromFirestore) {
        await DocumentSettingsClient.saveSettings(resumeId, settings, templateId);
        if (process.env.NODE_ENV === 'development') {
          console.log(`Template ${templateId} persisted to Firestore for resume ${resumeId}`);
        }
      }
    }
  );

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
      
      // Log template application for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Applying template "${template.name}" (${templateId})`, {
          previousTemplate: currentTemplate,
          templateDefaults: template.defaults,
          appliedSettings: newSettings
        });
      }

      // Update settings and template immediately for UI responsiveness
      setDocumentSettings(newSettings);
      setCurrentTemplate(templateId);
      
      // Batch template change to prevent rapid Firestore writes
      if (resumeId && syncWithFirestore && hasLoadedFromFirestore) {
        templateBatch.addToBatch(templateId, { templateId, settings: newSettings });
      }

      // Trigger callback if provided
      onSettingsChange?.(newSettings);

      return true;
    } catch (error) {
      console.error('Error applying template:', error);
      return false;
    }
  }, [documentSettings, currentTemplate, onSettingsChange, resumeId, syncWithFirestore, hasLoadedFromFirestore, templateBatch]);

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
  const inlineStyles = useMemo(() => generateInlineStyles(styles, currentTemplate), [styles, currentTemplate]);

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

  // Computed loading state - ready when not loading or when no Firestore sync needed or when we have cached data
  const isReady = !isLoadingFromFirestore && (hasLoadedFromFirestore || !resumeId || !syncWithFirestore || initialHasCachedData);

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

    // Loading states
    isLoadingFromFirestore,
    hasLoadedFromFirestore,
    isReady,

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
      'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
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
