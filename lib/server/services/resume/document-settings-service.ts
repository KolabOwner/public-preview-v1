// lib/server/services/resume/document-settings-service.ts

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase-config';
import { DocumentSettings } from '@/components/features/dashboard/resume-header-bar';

export interface ResumeDocumentSettings extends DocumentSettings {
  template: string;
  lastUpdated: string;
  version: number;
}

/**
 * Service for managing resume document settings in Firestore
 */
export class DocumentSettingsService {
  private static COLLECTION = 'resumes';
  private static SETTINGS_FIELD = 'documentSettings';
  private static CURRENT_VERSION = 1;

  /**
   * Save document settings for a resume to Firestore
   */
  static async saveSettings(
    resumeId: string,
    settings: DocumentSettings,
    template: string
  ): Promise<boolean> {
    try {
      const resumeRef = doc(db, this.COLLECTION, resumeId);

      const settingsData: ResumeDocumentSettings = {
        ...settings,
        template,
        lastUpdated: new Date().toISOString(),
        version: this.CURRENT_VERSION,
      };

      await updateDoc(resumeRef, {
        [this.SETTINGS_FIELD]: settingsData,
        updatedAt: new Date().toISOString(),
      });

      console.log(`Document settings saved for resume ${resumeId}`, {
        template,
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
      });

      return true;
    } catch (error) {
      console.error('Error saving document settings:', error);
      return false;
    }
  }

  /**
   * Load document settings for a resume from Firestore
   */
  static async loadSettings(resumeId: string): Promise<ResumeDocumentSettings | null> {
    try {
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
        return this.getDefaultSettings();
      }

      // Validate and migrate settings if needed
      return this.validateAndMigrate(settings);
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
      zoom: 115,
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
