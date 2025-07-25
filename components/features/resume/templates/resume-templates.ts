// lib/features/resume/templates/resume-templates.ts
import { DocumentSettings } from '@/components/features/dashboard/resume-header-bar';
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
    name: 'Standard Professional',
    description: 'Classic professional layout with traditional formatting - the gold standard for most industries',
    category: 'professional',
    defaults: {
      fontFamily: 'Merriweather',
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
        nameStyle: 'normal',
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
      fontFamily: 'Inter',
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
        name: 1.8,
        contact: 0.65,
        sectionHeader: 1.0,
        jobTitle: 0.85,
        body: 0.75,
        detail: 0.65,
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
          section: '0.02em',
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
        muted: '#9ca3af',
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
    name: 'Compact',
    description: 'Clean and compact template for experienced professionals - designed to fit 20% more content per page',
    category: 'minimal',
    defaults: {
      fontFamily: 'Merriweather',
      fontSize: 10,
      lineHeight: 1.4,
      sectionSpacing: 1.2,
      primaryColor: '#000000',
      textColor: '#000000',
      showDividers: true,
      useIndent: false,
    },
    styles: {
      fontScales: {
        name: 1.6,
        contact: 0.7,
        sectionHeader: 1.0,
        jobTitle: 0.85,
        body: 0.8,
        detail: 0.7,
      },
      layout: {
        sectionSpacing: 1.2,
        bulletSpacing: 0.3,
        headerAlignment: 'center',
        contactAlignment: 'center',
        bodyAlignment: 'left',
        useDividers: true,
        dividerStyle: 'solid',
        useIndentation: false,
        iconStyle: 'none',
      },
      typography: {
        nameStyle: 'normal',
        sectionStyle: 'uppercase',
        letterSpacing: {
          name: '0.02em',
          section: '0.05em',
          body: '0.01em',
        },
        fontWeights: {
          name: 500,
          section: 500,
          title: 500,
          body: 400,
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
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Professional template with blue top border and clean formatting',
    category: 'professional',
    defaults: {
      fontFamily: 'Inter',
      fontSize: 11,
      lineHeight: 1.3,
      sectionSpacing: 0.8,
      primaryColor: '#3b82f6',
      textColor: '#000000',
      showDividers: false,
      useIndent: false,
    },
    styles: {
      fontScales: {
        name: 1.6,
        contact: 0.7,
        sectionHeader: 1.0,
        jobTitle: 0.85,
        body: 0.8,
        detail: 0.7,
      },
      layout: {
        sectionSpacing: 0.8,
        bulletSpacing: 0.3,
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
          name: '-0.025em',
          section: 'normal',
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
        primary: '#000000',
        secondary: '#000000',
        text: '#000000',
        muted: '#9ca3af',
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
};
// Template validation interface
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
// Validate template configuration
export function validateTemplate(template: ResumeTemplate): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  // Check required fields
  if (!template.id) errors.push('Template missing id');
  if (!template.name) errors.push('Template missing name');
  if (!template.description) errors.push('Template missing description');
  // Validate font scales
  const scales = template.styles.fontScales;
  if (!scales.name || scales.name <= 0) errors.push('Invalid name font scale');
  if (!scales.body || scales.body <= 0) errors.push('Invalid body font scale');
  // Validate colors
  const colors = template.styles.colors;
  const colorFields = ['primary', 'secondary', 'text', 'muted', 'accent'];
  colorFields.forEach(field => {
    const color = colors[field as keyof typeof colors];
    if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) {
      errors.push(`Invalid ${field} color: ${color}`);
    }
  });
  // Check for potential issues
  if (scales.name > 2) warnings.push('Name font scale unusually large');
  if (scales.body < 0.5) warnings.push('Body font scale potentially too small');
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
// Enhanced template application function
export function applyTemplateToSettings(
  templateId: string,
  currentSettings: DocumentSettings,
  options: {
    preserveUserPreferences?: boolean;
    validateTemplate?: boolean;
    logChanges?: boolean;
  } = {}
): DocumentSettings {
  const {
    preserveUserPreferences = true,
    validateTemplate: shouldValidateTemplate = true,
    logChanges = false
  } = options;
  // Get template
  const template = RESUME_TEMPLATES[templateId];
  if (!template) {
    console.error(`Template ${templateId} not found. Available templates:`, Object.keys(RESUME_TEMPLATES));
    return currentSettings;
  }
  // Validate template if requested
  if (shouldValidateTemplate) {
    const validation = validateTemplate(template);
    if (!validation.isValid) {
      console.error(`Template ${templateId} validation failed:`, validation.errors);
      return currentSettings;
    }
    if (validation.warnings.length > 0) {
      console.warn(`Template ${templateId} validation warnings:`, validation.warnings);
    }
  }
  // Build new settings
  const newSettings: DocumentSettings = {
    ...currentSettings,
    ...template.defaults,
  };
  // Preserve critical user preferences if requested
  if (preserveUserPreferences) {
    (newSettings as any).zoom = currentSettings.zoom;
    (newSettings as any).paperSize = currentSettings.paperSize;
    (newSettings as any).viewAsPages = currentSettings.viewAsPages;
    // Preserve margins if user has customized them significantly
    const defaultMargins = { top: 0.75, right: 0.75, bottom: 0.75, left: 0.75 };
    const hasCustomMargins = Object.values(currentSettings.margins).some(
      (value, index) => Math.abs(value - Object.values(defaultMargins)[index]) > 0.1
    );
    if (hasCustomMargins) {
      (newSettings as any).margins = currentSettings.margins;
      if (logChanges) {
        console.log('Preserving custom margins:', currentSettings.margins);
      }
    }
  }
  // Log changes if requested
  if (logChanges) {
    const changes: Record<string, any> = {};
    Object.keys(template.defaults).forEach(key => {
      const oldValue = currentSettings[key as keyof DocumentSettings];
      const newValue = newSettings[key as keyof DocumentSettings];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { from: oldValue, to: newValue };
      }
    });
    if (Object.keys(changes).length > 0) {
    }
  }
  return newSettings;
}
// Helper function to get template metadata
export function getTemplateMetadata(templateId: string) {
  const template = RESUME_TEMPLATES[templateId];
  if (!template) return null;
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    isPremium: templateId !== 'professional',
    features: {
      hasCustomColors: template.styles.colors.primary !== '#000000',
      hasDecorations: template.styles.decorations.useShadows || template.styles.decorations.useRoundedCorners,
      hasCustomSpacing: template.styles.layout.sectionSpacing !== 0.75,
      hasCustomTypography: template.styles.typography.nameStyle !== 'normal' || template.styles.typography.sectionStyle !== 'normal',
      dividerStyle: template.styles.layout.dividerStyle,
      iconStyle: template.styles.layout.iconStyle,
    }
  };
}
// Helper function to compare templates
export function compareTemplates(templateId1: string, templateId2: string) {
  const template1 = RESUME_TEMPLATES[templateId1];
  const template2 = RESUME_TEMPLATES[templateId2];
  if (!template1 || !template2) {
    return null;
  }
  return {
    fontScaleDifference: {
      name: template2.styles.fontScales.name - template1.styles.fontScales.name,
      body: template2.styles.fontScales.body - template1.styles.fontScales.body,
    },
    layoutDifferences: {
      spacingChange: template2.styles.layout.sectionSpacing - template1.styles.layout.sectionSpacing,
      alignmentChange: template1.styles.layout.headerAlignment !== template2.styles.layout.headerAlignment,
      dividersChange: template1.styles.layout.useDividers !== template2.styles.layout.useDividers,
    },
    visualChanges: {
      colorSchemeChange: template1.styles.colors.primary !== template2.styles.colors.primary,
      decorationsChange: template1.styles.decorations.useShadows !== template2.styles.decorations.useShadows,
      typographyChange: template1.styles.typography.nameStyle !== template2.styles.typography.nameStyle,
    }
  };
}
