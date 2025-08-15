'use client';

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase-config';
import { DocumentSettings } from '@/components/features/dashboard/resume-header-bar';

export interface ResumeDocumentSettings extends DocumentSettings {
  template: string;
  lastUpdated: string;
  version: number;
}

/**
 * Client-side service for managing resume document settings in Firestore
 */
export class DocumentSettingsClient {
  private static COLLECTION = 'resumes';
  private static SETTINGS_FIELD = 'documentSettings';
  private static CURRENT_VERSION = 1;
  private static CACHE_DURATION = 3600000; // 1 hour
  private static memoryCache = new Map<string, { data: ResumeDocumentSettings; timestamp: number }>();

  /**
   * Save document settings for a resume to Firestore with optimistic caching
   */
  static async saveSettings(
    resumeId: string,
    settings: DocumentSettings,
    template: string
  ): Promise<boolean> {
    try {
      const settingsData: ResumeDocumentSettings = {
        ...settings,
        template,
        lastUpdated: new Date().toISOString(),
        version: this.CURRENT_VERSION,
      };

      // Optimistically update cache first for immediate UI response
      this.cacheSettings(resumeId, settingsData);

      const resumeRef = doc(db, this.COLLECTION, resumeId);
      await updateDoc(resumeRef, {
        [this.SETTINGS_FIELD]: settingsData,
        updatedAt: new Date().toISOString(),
      });


      return true;
    } catch (error) {
      console.error('Error saving document settings:', error);
      // Remove from cache if save failed
      this.memoryCache.delete(resumeId);
      if (typeof window !== 'undefined') {
        try {
          const cacheKey = `resume-cache-${resumeId}`;
          localStorage.removeItem(cacheKey);
        } catch (localError) {
          console.warn('Failed to clear cache after save error:', localError);
        }
      }
      return false;
    }
  }

  /**
   * Load document settings for a resume from Firestore with aggressive caching
   */
  static async loadSettings(resumeId: string): Promise<ResumeDocumentSettings | null> {
    try {
      // Check memory cache first (fastest)
      const cached = this.memoryCache.get(resumeId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('Loading from memory cache for resume', resumeId);
        return cached.data;
      }

      // Check localStorage cache (fast)
      if (typeof window !== 'undefined') {
        try {
          const cacheKey = `resume-cache-${resumeId}`;
          const localCached = localStorage.getItem(cacheKey);
          if (localCached) {
            const parsedCache = JSON.parse(localCached);
            if (parsedCache.timestamp && Date.now() - parsedCache.timestamp < this.CACHE_DURATION) {
              console.log('Loading from localStorage cache for resume', resumeId);
              const settings = this.validateAndMigrate(parsedCache.settings);
              // Update memory cache
              this.memoryCache.set(resumeId, { data: settings, timestamp: Date.now() });
              return settings;
            }
          }
        } catch (localError) {
          console.warn('Failed to load from localStorage cache:', localError);
        }
      }

      // Load from Firestore (slower)
      console.log('Loading from Firestore for resume', resumeId);
      const resumeRef = doc(db, this.COLLECTION, resumeId);
      const resumeSnap = await getDoc(resumeRef);

      if (!resumeSnap.exists()) {
        console.warn(`Resume ${resumeId} not found`);
        return null;
      }

      const resumeData = resumeSnap.data();
      const settings = resumeData[this.SETTINGS_FIELD];

      if (!settings) {
        // No settings found, return default professional template settings
        const defaultSettings = this.getDefaultSettings();
        // Cache the defaults
        this.cacheSettings(resumeId, defaultSettings);
        return defaultSettings;
      }

      // Validate and migrate settings if needed
      const validatedSettings = this.validateAndMigrate(settings);
      
      // Cache the loaded settings
      this.cacheSettings(resumeId, validatedSettings);
      
      return validatedSettings;
    } catch (error) {
      console.error('Error loading document settings:', error);
      return null;
    }
  }

  /**
   * Update template for a resume
   */
  static async updateTemplate(
    resumeId: string,
    templateId: string,
    settings: DocumentSettings
  ): Promise<boolean> {
    try {
      console.log(`Updating template to ${templateId} for resume ${resumeId}`);
      return await this.saveSettings(resumeId, settings, templateId);
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  }

  /**
   * Check if resume has custom settings
   */
  static async hasCustomSettings(resumeId: string): Promise<boolean> {
    try {
      const resumeRef = doc(db, this.COLLECTION, resumeId);
      const resumeSnap = await getDoc(resumeRef);

      if (!resumeSnap.exists()) return false;

      const resumeData = resumeSnap.data();
      return !!resumeData[this.SETTINGS_FIELD];
    } catch (error) {
      console.error('Error checking custom settings:', error);
      return false;
    }
  }

  /**
   * Get default settings (professional template)
   */
  private static getDefaultSettings(): ResumeDocumentSettings {
    return {
      zoom: 120,
      fontFamily: 'Merriweather',
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
      template: 'professional',
      lastUpdated: new Date().toISOString(),
      version: this.CURRENT_VERSION,
    };
  }

  /**
   * Get optimized settings for targeted resumes
   */
  static getTargetedResumeSettings(): ResumeDocumentSettings {
    return {
      zoom: 120,
      fontFamily: 'Merriweather',
      primaryColor: '#000000',
      textColor: '#000000',
      fontSize: 11,
      lineHeight: 1.5,  // Optimized for readability
      sectionSpacing: 1,  // Better section separation
      paperSize: 'Letter',
      margins: {
        top: 0.5,    // Narrow margins for more content space
        right: 0.5,
        bottom: 0.5,
        left: 0.5,
      },
      showIcons: false,
      showDividers: true,
      useIndent: false,
      viewAsPages: true,
      template: 'professional',
      lastUpdated: new Date().toISOString(),
      version: this.CURRENT_VERSION,
    };
  }

  /**
   * Validate and migrate settings from older versions
   */
  private static validateAndMigrate(settings: any): ResumeDocumentSettings {
    const defaultSettings = this.getDefaultSettings();

    // Ensure all required fields are present
    const migratedSettings: ResumeDocumentSettings = {
      ...defaultSettings,
      ...settings,
      version: this.CURRENT_VERSION,
      lastUpdated: new Date().toISOString(),
    };

    // Validate specific fields
    if (!migratedSettings.template || typeof migratedSettings.template !== 'string') {
      migratedSettings.template = 'professional';
    }

    if (!migratedSettings.fontFamily || typeof migratedSettings.fontFamily !== 'string') {
      (migratedSettings as any).fontFamily = 'Merriweather';
    }

    if (typeof migratedSettings.fontSize !== 'number' || migratedSettings.fontSize < 6 || migratedSettings.fontSize > 16) {
      (migratedSettings as any).fontSize = 11;
    }

    if (typeof migratedSettings.zoom !== 'number' || migratedSettings.zoom < 50 || migratedSettings.zoom > 200) {
      (migratedSettings as any).zoom = 120;
    }

    // Validate margins
    if (!migratedSettings.margins || typeof migratedSettings.margins !== 'object') {
      (migratedSettings as any).margins = defaultSettings.margins;
    } else {
      const { top, right, bottom, left } = migratedSettings.margins;
      if (typeof top !== 'number' || top < 0 || top > 2) migratedSettings.margins.top = 0.75;
      if (typeof right !== 'number' || right < 0 || right > 2) migratedSettings.margins.right = 0.75;
      if (typeof bottom !== 'number' || bottom < 0 || bottom > 2) migratedSettings.margins.bottom = 0.75;
      if (typeof left !== 'number' || left < 0 || left > 2) migratedSettings.margins.left = 0.75;
    }

    return migratedSettings;
  }

  /**
   * Reset settings to default (professional template)
   */
  static async resetToDefault(resumeId: string): Promise<boolean> {
    try {
      const defaultSettings = this.getDefaultSettings();
      return await this.saveSettings(resumeId, defaultSettings, 'professional');
    } catch (error) {
      console.error('Error resetting to default:', error);
      return false;
    }
  }

  /**
   * Cache settings in both memory and localStorage
   */
  private static cacheSettings(resumeId: string, settings: ResumeDocumentSettings): void {
    // Memory cache
    this.memoryCache.set(resumeId, { data: settings, timestamp: Date.now() });
    
    // localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const cacheKey = `resume-cache-${resumeId}`;
        const cacheData = {
          settings: settings,
          template: settings.template,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Failed to cache settings in localStorage:', error);
      }
    }
  }

  /**
   * Clear cache for a specific resume
   */
  static clearCache(resumeId: string): void {
    this.memoryCache.delete(resumeId);
    if (typeof window !== 'undefined') {
      try {
        const cacheKey = `resume-cache-${resumeId}`;
        localStorage.removeItem(cacheKey);
      } catch (error) {
        console.warn('Failed to clear localStorage cache:', error);
      }
    }
  }

  /**
   * Pre-warm cache with settings (useful for optimistic updates)
   */
  static prewarmCache(resumeId: string, settings: ResumeDocumentSettings): void {
    this.cacheSettings(resumeId, settings);
  }

  /**
   * Get template usage statistics (for analytics)
   */
  static async getTemplateStats(resumeId: string): Promise<{ template: string; lastUpdated: string } | null> {
    try {
      const settings = await this.loadSettings(resumeId);
      if (!settings) return null;

      return {
        template: settings.template,
        lastUpdated: settings.lastUpdated,
      };
    } catch (error) {
      console.error('Error getting template stats:', error);
      return null;
    }
  }
}