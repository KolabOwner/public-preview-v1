// lib/features/resume/templates/resume-templates.ts

import { DocumentSettings } from '@/components/layout/resume-header-bar';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'modern' | 'creative' | 'minimal' | 'executive' | 'academic' | 'technical';
  defaults: Partial<DocumentSettings>;
  styles: {
    fontScales: {
      name: number;
      contact: number;
      sectionHeader: number;
      jobTitle: number;
      body: number;
      detail: number;
    };
    layout: {
      sectionSpacing: number;
      bulletSpacing: number;
      headerAlignment: 'left' | 'center' | 'right';
      contactAlignment: 'left' | 'center' | 'right';
      bodyAlignment: 'left' | 'justify';
      useDividers: boolean;
      dividerStyle: 'solid' | 'dotted' | 'dashed' | 'double';
      useIndentation: boolean;
      iconStyle: 'none' | 'minimal' | 'decorative';
    };
    typography: {
      nameStyle: 'uppercase' | 'capitalize' | 'normal';
      sectionStyle: 'uppercase' | 'capitalize' | 'normal';
      letterSpacing: {
        name: string;
        section: string;
        body: string;
      };
      fontWeights: {
        name: number;
        section: number;
        title: number;
        body: number;
      };
    };
    colors: {
      primary: string;
      secondary: string;
      text: string;
      muted: string;
      accent: string;
    };
    decorations: {
      useShadows: boolean;
      useRoundedCorners: boolean;
      borderRadius: string;
      shadowIntensity: 'none' | 'light' | 'medium' | 'heavy';
    };
  };
}

export const RESUME_TEMPLATES: Record<string, ResumeTemplate> = {
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Classic professional layout with traditional formatting',
    category: 'professional',
    defaults: {
      fontFamily: 'Times New Roman',
      fontSize: 11,
      lineHeight: 1.2,
      sectionSpacing: 0.75,
      primaryColor: '#000000',
      textColor: '#000000',
      showDividers: true,
      useIndent: false,
    },
    styles: {
      fontScales: {
        name: 1.35,
        contact: 0.614,
        sectionHeader: 0.941,
        jobTitle: 0.818,
        body: 0.695,
        detail: 0.609,
      },
      layout: {
        sectionSpacing: 0.75,
        bulletSpacing: 0.25,
        headerAlignment: 'center',
        contactAlignment: 'center',
        bodyAlignment: 'justify',
        useDividers: true,
        dividerStyle: 'solid',
        useIndentation: false,
        iconStyle: 'none',
      },
      typography: {
        nameStyle: 'uppercase',
        sectionStyle: 'uppercase',
        letterSpacing: {
          name: '0.05em',
          section: '0.05em',
          body: 'normal',
        },
        fontWeights: {
          name: 700,
          section: 700,
          title: 700,
          body: 400,
        },
      },
      colors: {
        primary: '#000000',
        secondary: '#333333',
        text: '#000000',
        muted: '#666666',
        accent: '#0066cc',
      },
      decorations: {
        useShadows: false,
        useRoundedCorners: false,
        borderRadius: '0',
        shadowIntensity: 'none',
      },
    },
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean modern design with subtle styling',
    category: 'modern',
    defaults: {
      fontFamily: 'Source Sans Pro',
      fontSize: 10,
      lineHeight: 1.4,
      sectionSpacing: 1,
      primaryColor: '#2563eb',
      textColor: '#1f2937',
      showDividers: false,
      useIndent: false,
    },
    styles: {
      fontScales: {
        name: 1.5,
        contact: 0.7,
        sectionHeader: 1.1,
        jobTitle: 0.9,
        body: 0.8,
        detail: 0.7,
      },
      layout: {
        sectionSpacing: 1,
        bulletSpacing: 0.3,
        headerAlignment: 'left',
        contactAlignment: 'left',
        bodyAlignment: 'left',
        useDividers: false,
        dividerStyle: 'solid',
        useIndentation: false,
        iconStyle: 'minimal',
      },
      typography: {
        nameStyle: 'normal',
        sectionStyle: 'uppercase',
        letterSpacing: {
          name: '-0.025em',
          section: '0.1em',
          body: 'normal',
        },
        fontWeights: {
          name: 600,
          section: 600,
          title: 600,
          body: 400,
        },
      },
      colors: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        text: '#1f2937',
        muted: '#6b7280',
        accent: '#3b82f6',
      },
      decorations: {
        useShadows: true,
        useRoundedCorners: true,
        borderRadius: '0.25rem',
        shadowIntensity: 'light',
      },
    },
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and expressive design for creative professionals',
    category: 'creative',
    defaults: {
      fontFamily: 'Merriweather',
      fontSize: 10,
      lineHeight: 1.5,
      sectionSpacing: 1.25,
      primaryColor: '#dc2626',
      textColor: '#111827',
      showDividers: true,
      useIndent: true,
    },
    styles: {
      fontScales: {
        name: 1.6,
        contact: 0.8,
        sectionHeader: 1.2,
        jobTitle: 1.0,
        body: 0.85,
        detail: 0.75,
      },
      layout: {
        sectionSpacing: 1.25,
        bulletSpacing: 0.35,
        headerAlignment: 'left',
        contactAlignment: 'left',
        bodyAlignment: 'left',
        useDividers: true,
        dividerStyle: 'dotted',
        useIndentation: true,
        iconStyle: 'decorative',
      },
      typography: {
        nameStyle: 'capitalize',
        sectionStyle: 'capitalize',
        letterSpacing: {
          name: '-0.05em',
          section: 'normal',
          body: 'normal',
        },
        fontWeights: {
          name: 700,
          section: 700,
          title: 600,
          body: 300,
        },
      },
      colors: {
        primary: '#dc2626',
        secondary: '#ef4444',
        text: '#111827',
        muted: '#4b5563',
        accent: '#f59e0b',
      },
      decorations: {
        useShadows: true,
        useRoundedCorners: true,
        borderRadius: '0.5rem',
        shadowIntensity: 'medium',
      },
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and minimalist design with focus on content',
    category: 'minimal',
    defaults: {
      fontFamily: 'Helvetica',
      fontSize: 10,
      lineHeight: 1.6,
      sectionSpacing: 1.5,
      primaryColor: '#000000',
      textColor: '#000000',
      showDividers: false,
      useIndent: false,
    },
    styles: {
      fontScales: {
        name: 1.4,
        contact: 0.7,
        sectionHeader: 1.0,
        jobTitle: 0.9,
        body: 0.8,
        detail: 0.7,
      },
      layout: {
        sectionSpacing: 1.5,
        bulletSpacing: 0.4,
        headerAlignment: 'left',
        contactAlignment: 'left',
        bodyAlignment: 'left',
        useDividers: false,
        dividerStyle: 'solid',
        useIndentation: false,
        iconStyle: 'none',
      },
      typography: {
        nameStyle: 'normal',
        sectionStyle: 'normal',
        letterSpacing: {
          name: '0.02em',
          section: '0.05em',
          body: '0.01em',
        },
        fontWeights: {
          name: 400,
          section: 400,
          title: 500,
          body: 300,
        },
      },
      colors: {
        primary: '#000000',
        secondary: '#000000',
        text: '#000000',
        muted: '#737373',
        accent: '#000000',
      },
      decorations: {
        useShadows: false,
        useRoundedCorners: false,
        borderRadius: '0',
        shadowIntensity: 'none',
      },
    },
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    description: 'Sophisticated design for senior-level positions',
    category: 'executive',
    defaults: {
      fontFamily: 'Georgia',
      fontSize: 11,
      lineHeight: 1.3,
      sectionSpacing: 1,
      primaryColor: '#1e3a8a',
      textColor: '#1e293b',
      showDividers: true,
      useIndent: false,
    },
    styles: {
      fontScales: {
        name: 1.45,
        contact: 0.65,
        sectionHeader: 0.95,
        jobTitle: 0.85,
        body: 0.75,
        detail: 0.65,
      },
      layout: {
        sectionSpacing: 1,
        bulletSpacing: 0.3,
        headerAlignment: 'center',
        contactAlignment: 'center',
        bodyAlignment: 'justify',
        useDividers: true,
        dividerStyle: 'double',
        useIndentation: false,
        iconStyle: 'minimal',
      },
      typography: {
        nameStyle: 'uppercase',
        sectionStyle: 'uppercase',
        letterSpacing: {
          name: '0.1em',
          section: '0.08em',
          body: '0.02em',
        },
        fontWeights: {
          name: 700,
          section: 600,
          title: 600,
          body: 400,
        },
      },
      colors: {
        primary: '#1e3a8a',
        secondary: '#1e40af',
        text: '#1e293b',
        muted: '#475569',
        accent: '#7c3aed',
      },
      decorations: {
        useShadows: false,
        useRoundedCorners: false,
        borderRadius: '0',
        shadowIntensity: 'none',
      },
    },
  },
  academic: {
    id: 'academic',
    name: 'Academic',
    description: 'Traditional academic CV format',
    category: 'academic',
    defaults: {
      fontFamily: 'Times New Roman',
      fontSize: 11,
      lineHeight: 1.5,
      sectionSpacing: 0.5,
      primaryColor: '#000000',
      textColor: '#000000',
      showDividers: true,
      useIndent: true,
    },
    styles: {
      fontScales: {
        name: 1.3,
        contact: 0.7,
        sectionHeader: 1.0,
        jobTitle: 0.9,
        body: 0.8,
        detail: 0.7,
      },
      layout: {
        sectionSpacing: 0.5,
        bulletSpacing: 0.2,
        headerAlignment: 'left',
        contactAlignment: 'left',
        bodyAlignment: 'justify',
        useDividers: true,
        dividerStyle: 'solid',
        useIndentation: true,
        iconStyle: 'none',
      },
      typography: {
        nameStyle: 'normal',
        sectionStyle: 'uppercase',
        letterSpacing: {
          name: 'normal',
          section: '0.05em',
          body: 'normal',
        },
        fontWeights: {
          name: 700,
          section: 700,
          title: 600,
          body: 400,
        },
      },
      colors: {
        primary: '#000000',
        secondary: '#000000',
        text: '#000000',
        muted: '#525252',
        accent: '#000000',
      },
      decorations: {
        useShadows: false,
        useRoundedCorners: false,
        borderRadius: '0',
        shadowIntensity: 'none',
      },
    },
  },
  technical: {
    id: 'technical',
    name: 'Technical',
    description: 'Optimized for technical roles with focus on skills',
    category: 'technical',
    defaults: {
      fontFamily: 'Roboto',
      fontSize: 10,
      lineHeight: 1.4,
      sectionSpacing: 0.75,
      primaryColor: '#059669',
      textColor: '#111827',
      showDividers: false,
      useIndent: false,
    },
    styles: {
      fontScales: {
        name: 1.4,
        contact: 0.7,
        sectionHeader: 1.0,
        jobTitle: 0.9,
        body: 0.8,
        detail: 0.7,
      },
      layout: {
        sectionSpacing: 0.75,
        bulletSpacing: 0.25,
        headerAlignment: 'left',
        contactAlignment: 'left',
        bodyAlignment: 'left',
        useDividers: false,
        dividerStyle: 'solid',
        useIndentation: false,
        iconStyle: 'minimal',
      },
      typography: {
        nameStyle: 'normal',
        sectionStyle: 'uppercase',
        letterSpacing: {
          name: '-0.025em',
          section: '0.05em',
          body: 'normal',
        },
        fontWeights: {
          name: 500,
          section: 600,
          title: 500,
          body: 400,
        },
      },
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        text: '#111827',
        muted: '#6b7280',
        accent: '#06b6d4',
      },
      decorations: {
        useShadows: false,
        useRoundedCorners: true,
        borderRadius: '0.125rem',
        shadowIntensity: 'none',
      },
    },
  },
};

// Helper function to apply template to document settings
export function applyTemplateToSettings(
  templateId: string,
  currentSettings: DocumentSettings
): DocumentSettings {
  const template = RESUME_TEMPLATES[templateId];
  if (!template) {
    console.warn(`Template ${templateId} not found`);
    return currentSettings;
  }

  return {
    ...currentSettings,
    ...template.defaults,
    // Preserve zoom and paper size from current settings
    zoom: currentSettings.zoom,
    paperSize: currentSettings.paperSize,
    viewAsPages: currentSettings.viewAsPages,
  };
}

// Get template styles with overrides
export function getTemplateStyles(
  templateId: string,
  documentSettings: DocumentSettings
) {
  const template = RESUME_TEMPLATES[templateId] || RESUME_TEMPLATES.professional;
  const styles = template.styles;

  // Apply font size scales to document settings base font size
  const fontSizes = {
    name: documentSettings.fontSize * styles.fontScales.name,
    contact: documentSettings.fontSize * styles.fontScales.contact,
    sectionHeader: documentSettings.fontSize * styles.fontScales.sectionHeader,
    jobTitle: documentSettings.fontSize * styles.fontScales.jobTitle,
    body: documentSettings.fontSize * styles.fontScales.body,
    detail: documentSettings.fontSize * styles.fontScales.detail,
  };

  return {
    fontSizes,
    lineHeights: {
      name: 1.2,
      contact: documentSettings.lineHeight,
      sectionHeader: 1.2,
      jobTitle: 1.2,
      body: documentSettings.lineHeight,
    },
    spacing: {
      sectionGap: documentSettings.sectionSpacing,
      blockGap: documentSettings.sectionSpacing * 0.5,
      bulletGap: styles.layout.bulletSpacing,
      headerMarginTop: documentSettings.sectionSpacing * 0.5,
      headerMarginBottom: documentSettings.sectionSpacing * 0.3,
    },
    colors: {
      primary: documentSettings.primaryColor || styles.colors.primary,
      text: documentSettings.textColor || styles.colors.text,
      secondary: styles.colors.secondary,
      muted: styles.colors.muted,
      accent: styles.colors.accent,
    },
    typography: {
      ...styles.typography,
      fontFamily: documentSettings.fontFamily,
    },
    layout: {
      ...styles.layout,
      useDividers: documentSettings.showDividers,
      useIndentation: documentSettings.useIndent,
    },
    decorations: styles.decorations,
  };
}

// Template categories with descriptions
export const TEMPLATE_CATEGORIES = {
  professional: {
    name: 'Professional',
    description: 'Traditional formats suitable for most industries',
    icon: 'Briefcase',
  },
  modern: {
    name: 'Modern',
    description: 'Contemporary designs with clean aesthetics',
    icon: 'Zap',
  },
  creative: {
    name: 'Creative',
    description: 'Expressive layouts for creative fields',
    icon: 'Palette',
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple, content-focused designs',
    icon: 'Minus',
  },
  executive: {
    name: 'Executive',
    description: 'Sophisticated formats for leadership roles',
    icon: 'Crown',
  },
  academic: {
    name: 'Academic',
    description: 'Comprehensive CV formats for academia',
    icon: 'GraduationCap',
  },
  technical: {
    name: 'Technical',
    description: 'Skill-focused layouts for tech roles',
    icon: 'Code',
  },
} as const;

// Export template list for UI
export const TEMPLATE_LIST = Object.values(RESUME_TEMPLATES).map(template => ({
  id: template.id,
  name: template.name,
  description: template.description,
  category: template.category,
  preview: {
    fontFamily: template.defaults.fontFamily,
    primaryColor: template.defaults.primaryColor,
    hasIcons: template.styles.layout.iconStyle !== 'none',
    hasDividers: template.defaults.showDividers,
  },
}));