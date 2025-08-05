// lib/features/resume/styles/resume-styles.ts

import { DocumentSettings } from '@/components/features/dashboard/resume-header-bar';

// Font mapping for cross-platform compatibility
export const FONT_FAMILY_MAP: Record<string, string> = {
  'Calibri': 'Calibri, "Gill Sans", "Gill Sans MT", sans-serif',
  'Times New Roman': '"Times New Roman", Times, serif',
  'Arial': 'Arial, Helvetica, sans-serif',
  'Helvetica': 'Helvetica, Arial, sans-serif',
  'Georgia': 'Georgia, "Times New Roman", serif',
  'Merriweather': '"Merriweather", Georgia, serif',
  'Source Sans Pro': '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
  'Roboto': '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
  'Inter': '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
};

// Resume style configuration
export interface ResumeStyleConfig {
  fontSizes: {
    name: number;
    contact: number;
    sectionHeader: number;
    jobTitle: number;
    body: number;
    detail: number;
  };
  lineHeights: {
    name: number;
    contact: number;
    sectionHeader: number;
    jobTitle: number;
    body: number;
  };
  spacing: {
    sectionGap: number;
    blockGap: number;
    bulletGap: number;
    headerMarginTop: number;
    headerMarginBottom: number;
    documentPadding: string;
  };
  colors: {
    text: string;
    primary: string;
    secondary: string;
    divider: string;
    accent: string;
    muted: string;
  };
  typography: {
    fontFamily: string;
    letterSpacing: {
      name: string;
      section: string;
      body: string;
    };
    textTransform: {
      name: string;
      section: string;
    };
    fontWeights: {
      name: number;
      section: number;
      title: number;
      body: number;
    };
  };
  layout: {
    showDividers: boolean;
    useIndent: boolean;
    bulletIndent: string;
    dividerStyle: string;
    iconStyle: string;
    textAlign: {
      name: string;
      contact: string;
      body: string;
    };
  };
  decorations: {
    useShadows: boolean;
    useRoundedCorners: boolean;
    borderRadius: string;
    shadowIntensity: string;
  };
}

// Import template definitions
import { RESUME_TEMPLATES } from '../templates/resume-templates';

// Generate complete style configuration from document settings and template
export function generateResumeStyles(
  settings: DocumentSettings,
  templateId = 'professional'
): ResumeStyleConfig {
  const baseFontSize = settings.fontSize;
  const template = RESUME_TEMPLATES[templateId];

  // Fallback to professional template if template not found
  const templateConfig = template || RESUME_TEMPLATES.professional;
  const styles = templateConfig.styles;

  return {
    fontSizes: {
      name: baseFontSize * styles.fontScales.name,
      contact: baseFontSize * styles.fontScales.contact,
      sectionHeader: baseFontSize * styles.fontScales.sectionHeader,
      jobTitle: baseFontSize * styles.fontScales.jobTitle,
      body: baseFontSize * styles.fontScales.body,
      detail: baseFontSize * styles.fontScales.detail,
    },
    lineHeights: {
      name: 1.2,
      contact: templateId === 'bold' ? 1.2 : settings.lineHeight,
      sectionHeader: templateId === 'bold' ? 1.0 : 1.2,
      jobTitle: templateId === 'bold' ? 1.2 : 1.2,
      body: templateId === 'bold' ? 1.2 : settings.lineHeight,
    },
    spacing: {
      sectionGap: settings.sectionSpacing,
      blockGap: templateId === 'bold' ? 0.2 : settings.sectionSpacing * 0.5,
      bulletGap: styles.layout.bulletSpacing,
      headerMarginTop: settings.sectionSpacing * 0.5,
      headerMarginBottom: templateId === 'modern' ? 0 : templateId === 'minimal' ? 0 : templateId === 'bold' ? 0.2 : settings.sectionSpacing * 0.3,
      documentPadding: `${settings.margins.top}in ${settings.margins.right}in ${settings.margins.bottom}in ${settings.margins.left}in`,
    },
    colors: {
      text: styles.colors.text,
      primary: styles.colors.primary,
      secondary: styles.colors.secondary,
      divider: styles.colors.muted,
      accent: styles.colors.accent,
      muted: styles.colors.muted,
    },
    typography: {
      fontFamily: FONT_FAMILY_MAP[settings.fontFamily] || settings.fontFamily,
      letterSpacing: {
        name: styles.typography.letterSpacing.name,
        section: styles.typography.letterSpacing.section,
        body: styles.typography.letterSpacing.body,
      },
      textTransform: {
        name: styles.typography.nameStyle,
        section: styles.typography.sectionStyle,
      },
      fontWeights: {
        name: styles.typography.fontWeights.name,
        section: styles.typography.fontWeights.section,
        title: styles.typography.fontWeights.title,
        body: styles.typography.fontWeights.body,
      },
    },
    layout: {
      showDividers: styles.layout.useDividers,
      useIndent: styles.layout.useIndentation,
      bulletIndent: styles.layout.useIndentation ? '2rem' : '1.25rem',
      dividerStyle: styles.layout.dividerStyle,
      iconStyle: styles.layout.iconStyle,
      textAlign: {
        name: styles.layout.headerAlignment,
        contact: styles.layout.contactAlignment,
        body: styles.layout.bodyAlignment,
      },
    },
    decorations: {
      useShadows: styles.decorations.useShadows,
      useRoundedCorners: styles.decorations.useRoundedCorners,
      borderRadius: styles.decorations.borderRadius,
      shadowIntensity: styles.decorations.shadowIntensity,
    },
  };
}

// Generate CSS variables for dynamic styling
export function generateCSSVariables(styles: ResumeStyleConfig): string {
  // Generate shadow styles based on intensity
  const getShadowStyle = (intensity: string) => {
    switch (intensity) {
      case 'light': return '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
      case 'medium': return '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
      case 'heavy': return '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)';
      default: return 'none';
    }
  };

  return `
    :root {
      /* Font Sizes */
      --resume-font-size-name: ${styles.fontSizes.name}pt;
      --resume-font-size-contact: ${styles.fontSizes.contact}pt;
      --resume-font-size-section: ${styles.fontSizes.sectionHeader}pt;
      --resume-font-size-title: ${styles.fontSizes.jobTitle}pt;
      --resume-font-size-body: ${styles.fontSizes.body}pt;
      --resume-font-size-detail: ${styles.fontSizes.detail}pt;

      /* Line Heights */
      --resume-line-height-name: ${styles.lineHeights.name};
      --resume-line-height-contact: ${styles.lineHeights.contact};
      --resume-line-height-section: ${styles.lineHeights.sectionHeader};
      --resume-line-height-title: ${styles.lineHeights.jobTitle};
      --resume-line-height-body: ${styles.lineHeights.body};

      /* Spacing */
      --resume-spacing-section: ${styles.spacing.sectionGap}rem;
      --resume-spacing-block: ${styles.spacing.blockGap}rem;
      --resume-spacing-bullet: ${styles.spacing.bulletGap}rem;
      --resume-spacing-header-top: ${styles.spacing.headerMarginTop}rem;
      --resume-spacing-header-bottom: ${styles.spacing.headerMarginBottom}rem;

      /* Colors */
      --resume-color-text: ${styles.colors.text};
      --resume-color-primary: ${styles.colors.primary};
      --resume-color-secondary: ${styles.colors.secondary};
      --resume-color-divider: ${styles.colors.divider};
      --resume-color-accent: ${styles.colors.accent};
      --resume-color-muted: ${styles.colors.muted};

      /* Typography */
      --resume-font-family: ${styles.typography.fontFamily};
      --resume-letter-spacing-name: ${styles.typography.letterSpacing.name};
      --resume-letter-spacing-section: ${styles.typography.letterSpacing.section};
      --resume-letter-spacing-body: ${styles.typography.letterSpacing.body};
      --resume-font-weight-name: ${styles.typography.fontWeights.name};
      --resume-font-weight-section: ${styles.typography.fontWeights.section};
      --resume-font-weight-title: ${styles.typography.fontWeights.title};
      --resume-font-weight-body: ${styles.typography.fontWeights.body};
      --resume-text-transform-name: ${styles.typography.textTransform.name};
      --resume-text-transform-section: ${styles.typography.textTransform.section};

      /* Layout */
      --resume-bullet-indent: ${styles.layout.bulletIndent};
      --resume-text-align-name: ${styles.layout.textAlign.name};
      --resume-text-align-contact: ${styles.layout.textAlign.contact};
      --resume-text-align-body: ${styles.layout.textAlign.body};

      /* Decorations */
      --resume-border-radius: ${styles.decorations.borderRadius};
      --resume-box-shadow: ${styles.decorations.useShadows ? getShadowStyle(styles.decorations.shadowIntensity) : 'none'};
    }
  `;
}

// Generate complete CSS stylesheet for resume
export function generateResumeCSS(styles: ResumeStyleConfig, templateId = 'professional'): string {
  // Helper function to get divider styles
  const getDividerStyle = (dividerType: string, color: string, templateId?: string) => {
    const thickness = templateId === 'minimal' ? '2px' : '1px';
    switch (dividerType) {
      case 'dotted': return `border-bottom: ${thickness} dotted ${color};`;
      case 'dashed': return `border-bottom: ${thickness} dashed ${color};`;
      case 'double': return `border-bottom: 3px double ${color};`;
      case 'solid':
      default: return `border-bottom: ${thickness} solid ${color};`;
    }
  };

  // Add template-specific top border for Bold template
  const topBorderStyle = templateId === 'bold'
    ? `border-top: 4px solid ${styles.colors.primary};`
    : '';

  return `
    ${generateCSSVariables(styles)}

    /* Reset and Base Styles */
    .resume-container {
      font-family: var(--resume-font-family) !important;
      color: var(--resume-color-text) !important;
      ${topBorderStyle}
      ${styles.decorations.useShadows ? 'box-shadow: var(--resume-box-shadow) !important;' : ''}
      ${styles.decorations.useRoundedCorners ? 'border-radius: var(--resume-border-radius) !important;' : ''}
    }

    .resume-container * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: inherit !important;
      color: inherit !important;
    }

    /* Name Styles */
    .resume-name {
      font-size: var(--resume-font-size-name) !important;
      line-height: var(--resume-line-height-name) !important;
      font-weight: var(--resume-font-weight-name) !important;
      text-transform: var(--resume-text-transform-name) !important;
      text-align: var(--resume-text-align-name) !important;
      letter-spacing: var(--resume-letter-spacing-name) !important;
      margin-bottom: var(--resume-spacing-header-bottom) !important;
      color: ${templateId === 'modern' ? '#2563eb' : 'var(--resume-color-text)'} !important;
      ${templateId === 'bold' ? 'border-bottom: 1px solid #9ca3af; padding-bottom: 0.75rem; margin-bottom: 1.2rem;' : ''}
    }

    /* Contact Styles */
    .resume-contact {
      font-size: var(--resume-font-size-contact) !important;
      line-height: var(--resume-line-height-contact) !important;
      text-align: var(--resume-text-align-contact) !important;
      margin-bottom: var(--resume-spacing-section) !important;
      color: ${templateId === 'bold' || templateId === 'minimal' ? 'var(--resume-color-text)' : 'var(--resume-color-muted)'} !important;
    }

    /* Section Header Styles */
    .resume-section-header {
      font-size: var(--resume-font-size-section) !important;
      line-height: var(--resume-line-height-section) !important;
      font-weight: var(--resume-font-weight-section) !important;
      text-transform: var(--resume-text-transform-section) !important;
      letter-spacing: var(--resume-letter-spacing-section) !important;
      margin-top: var(--resume-spacing-header-top) !important;
      margin-bottom: var(--resume-spacing-header-bottom) !important;
      padding-bottom: 2px !important;
      color: var(--resume-color-primary) !important;
      ${styles.layout.showDividers ? getDividerStyle(styles.layout.dividerStyle, styles.colors.divider, templateId) : ''}
    }

    /* Title Styles (Job, Degree, Project) */
    .resume-job-title,
    .resume-degree-title,
    .resume-project-title,
    .resume-involvement-title {
      font-size: var(--resume-font-size-title) !important;
      line-height: var(--resume-line-height-title) !important;
      font-weight: var(--resume-font-weight-title) !important;
      color: var(--resume-color-secondary) !important;
    }

    /* Company and School Names */
    .resume-company,
    .resume-school-info {
      font-size: var(--resume-font-size-body) !important;
      line-height: var(--resume-line-height-body) !important;
      font-weight: ${templateId === 'modern' ? '600' : templateId === 'minimal' ? '600' : templateId === 'bold' ? '600' : '400'} !important;
      color: var(--resume-color-text) !important;
      font-style: normal !important;
    }

    /* Body Text Styles */
    .resume-summary,
    .resume-body-text {
      font-size: var(--resume-font-size-body) !important;
      line-height: var(--resume-line-height-body) !important;
      font-weight: 400 !important;
      letter-spacing: var(--resume-letter-spacing-body) !important;
      text-align: var(--resume-text-align-body) !important;
      color: var(--resume-color-text) !important;
    }

    /* Detail Text Styles */
    .resume-detail-text,
    .resume-date {
      font-size: var(--resume-font-size-body) !important;
      line-height: var(--resume-line-height-body) !important;
      font-weight: 400 !important;
      color: var(--resume-color-muted) !important;
    }

    .resume-date {
      font-style: normal !important;
      font-weight: ${templateId === 'minimal' ? '600' : '600'} !important;
      color: var(--resume-color-text) !important;
      font-size: var(--resume-font-size-body) !important;
    }

    /* List Styles */
    .resume-bullet-list {
      margin-left: 0.75rem !important;
      list-style: none !important;
    }

    .resume-bullet-list li {
      position: relative !important;
      margin-bottom: var(--resume-spacing-bullet) !important;
      padding-left: 0 !important;
      line-height: var(--resume-line-height-body) !important;
      font-size: var(--resume-font-size-body) !important;
      font-weight: 400 !important;
      letter-spacing: var(--resume-letter-spacing-body) !important;
      text-align: var(--resume-text-align-body) !important;
      color: var(--resume-color-text) !important;
    }

    .resume-bullet-list li:before {
      content: "•" !important;
      position: absolute !important;
      left: -0.5rem !important;
      color: var(--resume-color-text) !important;
      font-weight: bold !important;
      font-size: ${templateId === 'modern' ? '0.8em' : templateId === 'bold' ? '0.7em' : '1em'} !important;
    }

    /* Block Spacing */
    .resume-experience-block,
    .resume-education-block,
    .resume-project-block,
    .resume-involvement-block {
      margin-bottom: var(--resume-spacing-block) !important;
      ${styles.decorations.useRoundedCorners ? 'border-radius: var(--resume-border-radius) !important;' : ''}
    }

    .resume-experience-block:last-child,
    .resume-education-block:last-child,
    .resume-project-block:last-child,
    .resume-involvement-block:last-child {
      margin-bottom: 0 !important;
    }

    /* Skills Styles */
    .resume-skills-category {
      font-size: var(--resume-font-size-body) !important;
      line-height: var(--resume-line-height-body) !important;
      margin-bottom: var(--resume-spacing-bullet) !important;
      font-weight: 400 !important;
    }

    .resume-skills-title {
      font-weight: 400 !important;
      display: none !important;
      color: var(--resume-color-secondary) !important;
    }

    /* Summary Styles */
    .resume-summary {
      text-align: var(--resume-text-align-body) !important;
      margin-bottom: 0 !important;
      font-weight: 400 !important;
    }

    /* Icons Styles (if using icons) */
    .resume-contact-icon,
    .resume-section-icon {
      color: var(--resume-color-accent) !important;
      margin-right: 0.5rem !important;
      ${styles.layout.iconStyle === 'none' ? 'display: none !important;' : ''}
    }

    /* Print Styles */
    @media print {
      .resume-container {
        width: 100% !important;
        height: auto !important;
        transform: none !important;
        outline: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }

      .no-print {
        display: none !important;
      }

      /* Ensure colors print properly */
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  `;
}

// Paper size configurations
export const PAPER_SIZES = {
  Letter: { width: 816, height: 1056 }, // 8.5" x 11" at 96 DPI
  A4: { width: 794, height: 1123 },     // 210mm x 297mm at 96 DPI
  Legal: { width: 816, height: 1344 },  // 8.5" x 14" at 96 DPI
};

// Export function to get paper dimensions
export function getPaperDimensions(paperSize: string) {
  return PAPER_SIZES[paperSize as keyof typeof PAPER_SIZES] || PAPER_SIZES.Letter;
}

// Utility to convert pt to px
export function ptToPx(pt: number): number {
  return pt * 1.33333; // 1pt = 1.33333px at 96 DPI
}

// Utility to convert px to pt
export function pxToPt(px: number): number {
  return px / 1.33333;
}

// Generate inline styles object for React components
export function generateInlineStyles(styles: ResumeStyleConfig, templateId = 'professional') {
  return {
    container: {
      fontFamily: styles.typography.fontFamily,
      color: styles.colors.text,
      ...(styles.decorations.useShadows && {
        boxShadow: styles.decorations.shadowIntensity === 'light'
          ? '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
          : styles.decorations.shadowIntensity === 'medium'
          ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
          : styles.decorations.shadowIntensity === 'heavy'
          ? '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)'
          : 'none'
      }),
      ...(styles.decorations.useRoundedCorners && {
        borderRadius: styles.decorations.borderRadius
      }),
    },
    name: {
      fontSize: `${styles.fontSizes.name}pt`,
      lineHeight: styles.lineHeights.name,
      fontWeight: 700, // font-bold
      textTransform: styles.typography.textTransform.name as any,
      textAlign: styles.layout.textAlign.name as any,
      letterSpacing: styles.typography.letterSpacing.name,
      marginBottom: templateId === 'modern' ? '0.4rem' : templateId === 'minimal' ? '0rem' : templateId === 'bold' ? '0.2rem' : `${styles.spacing.headerMarginBottom}rem`,
      color: 'rgb(46, 61, 80)', // Exact color from HTML
      ...(templateId === 'bold' && {
        borderBottom: '1px solid #9ca3af',
        paddingBottom: '0.75rem',
        marginBottom: '1.2rem'
      }),
    },
    contact: {
      fontSize: `${styles.fontSizes.contact}pt`,
      lineHeight: styles.lineHeights.contact,
      fontWeight: 300, // font-weight: 300
      textAlign: styles.layout.textAlign.contact as any,
      marginBottom: `${styles.spacing.sectionGap}rem`,
      color: 'rgb(46, 61, 80)', // Exact color from HTML
    },
    sectionHeader: {
      fontSize: `${styles.fontSizes.sectionHeader}pt`,
      lineHeight: styles.lineHeights.sectionHeader,
      fontWeight: 600, // font-weight: 600
      textTransform: styles.typography.textTransform.section as any,
      letterSpacing: styles.typography.letterSpacing.section,
      marginTop: `${styles.spacing.headerMarginTop}rem`,
      marginBottom: templateId === 'bold' ? '0.2rem' : `${styles.spacing.headerMarginBottom}rem`,
      paddingBottom: '2px',
      color: 'rgb(46, 61, 80)', // Exact color from HTML
      ...(styles.layout.showDividers && {
        borderBottom: styles.layout.dividerStyle === 'dotted'
          ? `${templateId === 'minimal' ? '2px' : '1px'} dotted ${styles.colors.divider}`
          : styles.layout.dividerStyle === 'dashed'
          ? `${templateId === 'minimal' ? '2px' : '1px'} dashed ${styles.colors.divider}`
          : styles.layout.dividerStyle === 'double'
          ? `3px double ${styles.colors.divider}`
          : `${templateId === 'minimal' ? '2px' : '1px'} solid ${styles.colors.divider}`
      }),
    },
    jobTitle: {
      fontSize: `${styles.fontSizes.jobTitle}pt`,
      lineHeight: styles.lineHeights.jobTitle,
      fontWeight: 600, // font-semibold
      color: 'rgb(46, 61, 80)', // Exact color from HTML
    },
    company: {
      fontSize: `${styles.fontSizes.body}pt`,
      lineHeight: styles.lineHeights.body,
      fontWeight: 600, // font-semibold
      color: 'rgb(46, 61, 80)', // Exact color from HTML
      fontStyle: 'normal' as const,
    },
    bodyText: {
      fontSize: `${styles.fontSizes.body}pt`,
      lineHeight: styles.lineHeights.body,
      fontWeight: 100, // font-weight: 100 (very light for descriptions)
      letterSpacing: styles.typography.letterSpacing.body,
      textAlign: styles.layout.textAlign.body as any,
      color: 'rgb(46, 61, 80)', // Exact color from HTML
      fontStyle: 'normal' as const, // Ensure no italic styling
    },
    detailText: {
      fontSize: `${styles.fontSizes.body}pt`,
      lineHeight: styles.lineHeights.body,
      fontWeight: 400, // font-weight: 400 for skills text
      color: 'rgb(46, 61, 80)', // Exact color from HTML
      fontStyle: 'normal' as const, // Ensure no italic styling
    },
    date: {
      fontSize: `${styles.fontSizes.detail}pt`,
      lineHeight: styles.lineHeights.body,
      fontWeight: 400, // Normal weight for dates/locations
      fontStyle: 'normal' as const,
      ...(templateId === 'modern' ? {} : { float: 'right' as const }),
      color: 'rgb(46, 61, 80)', // Exact color from HTML
    },
    bulletList: {
      marginLeft: '0.75rem',
      listStyle: 'none',
    },
    bulletItem: {
      position: 'relative' as const,
      marginBottom: `${styles.spacing.bulletGap}rem`,
      lineHeight: styles.lineHeights.body,
      fontSize: `${styles.fontSizes.body}pt`,
      fontWeight: 400,
      letterSpacing: styles.typography.letterSpacing.body,
      textAlign: styles.layout.textAlign.body as any,
      color: templateId === 'modern' ? styles.colors.text : styles.colors.muted,
    },
    bulletPoint: {
      color: styles.colors.text,
      fontWeight: 'bold' as const,
      fontSize: templateId === 'modern' ? '0.8em' : templateId === 'bold' ? '0.7em' : '1em',
    },
    skillsTitle: {
      fontWeight: 400,
      color: styles.colors.secondary,
      display: 'none',
    },
    icon: {
      color: styles.colors.accent,
      marginRight: '0.5rem',
      ...(styles.layout.iconStyle === 'none' && { display: 'none' }),
    },
    block: {
      marginBottom: `${styles.spacing.blockGap}rem`,
      ...(styles.decorations.useRoundedCorners && {
        borderRadius: styles.decorations.borderRadius
      }),
    },
  };
}
