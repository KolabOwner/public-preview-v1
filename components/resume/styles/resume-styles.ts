// lib/features/resume/styles/resume-styles.ts

import { DocumentSettings } from '@/components/layout/resume-header-bar';

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
};

// Font size scales based on professional PDF standards
export const FONT_SIZE_SCALES = {
  professional: {
    name: 1.35,        // 14.84pt from 11pt base
    contact: 0.614,    // 6.75pt from 11pt base
    sectionHeader: 0.941, // 10.35pt from 11pt base
    jobTitle: 0.818,   // 9pt from 11pt base
    body: 0.695,       // 7.65pt from 11pt base
    detail: 0.609,     // 6.7pt from 11pt base
  },
  modern: {
    name: 1.5,
    contact: 0.7,
    sectionHeader: 1.1,
    jobTitle: 0.9,
    body: 0.8,
    detail: 0.7,
  },
  creative: {
    name: 1.6,
    contact: 0.8,
    sectionHeader: 1.2,
    jobTitle: 1.0,
    body: 0.85,
    detail: 0.75,
  },
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
  };
  layout: {
    showDividers: boolean;
    useIndent: boolean;
    bulletIndent: string;
    textAlign: {
      name: string;
      contact: string;
      body: string;
    };
  };
}

// Generate complete style configuration from document settings
export function generateResumeStyles(
  settings: DocumentSettings,
  template: string = 'professional'
): ResumeStyleConfig {
  const baseFontSize = settings.fontSize;
  const scale = FONT_SIZE_SCALES[template as keyof typeof FONT_SIZE_SCALES] || FONT_SIZE_SCALES.professional;

  return {
    fontSizes: {
      name: baseFontSize * scale.name,
      contact: baseFontSize * scale.contact,
      sectionHeader: baseFontSize * scale.sectionHeader,
      jobTitle: baseFontSize * scale.jobTitle,
      body: baseFontSize * scale.body,
      detail: baseFontSize * scale.detail,
    },
    lineHeights: {
      name: 1.2,
      contact: settings.lineHeight,
      sectionHeader: 1.2,
      jobTitle: 1.2,
      body: settings.lineHeight,
    },
    spacing: {
      sectionGap: settings.sectionSpacing,
      blockGap: settings.sectionSpacing * 0.5,
      bulletGap: settings.sectionSpacing * 0.25,
      headerMarginTop: settings.sectionSpacing * 0.5,
      headerMarginBottom: settings.sectionSpacing * 0.3,
      documentPadding: '0.75in',
    },
    colors: {
      text: settings.textColor,
      primary: settings.primaryColor,
      secondary: settings.textColor,
      divider: settings.textColor,
    },
    typography: {
      fontFamily: FONT_FAMILY_MAP[settings.fontFamily] || settings.fontFamily,
      letterSpacing: {
        name: '0.05em',
        section: '0.05em',
        body: 'normal',
      },
      textTransform: {
        name: 'uppercase',
        section: 'uppercase',
      },
    },
    layout: {
      showDividers: settings.showDividers,
      useIndent: settings.useIndent,
      bulletIndent: settings.useIndent ? '1.5rem' : '0.75rem',
      textAlign: {
        name: 'center',
        contact: 'center',
        body: 'justify',
      },
    },
  };
}

// Generate CSS variables for dynamic styling
export function generateCSSVariables(styles: ResumeStyleConfig): string {
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
      
      /* Typography */
      --resume-font-family: ${styles.typography.fontFamily};
      --resume-letter-spacing-name: ${styles.typography.letterSpacing.name};
      --resume-letter-spacing-section: ${styles.typography.letterSpacing.section};
      --resume-letter-spacing-body: ${styles.typography.letterSpacing.body};
      
      /* Layout */
      --resume-bullet-indent: ${styles.layout.bulletIndent};
    }
  `;
}

// Generate complete CSS stylesheet for resume
export function generateResumeCSS(styles: ResumeStyleConfig): string {
  return `
    ${generateCSSVariables(styles)}
    
    /* Reset and Base Styles */
    .resume-container * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: var(--resume-font-family) !important;
      color: var(--resume-color-text) !important;
    }
    
    /* Name Styles */
    .resume-name {
      font-size: var(--resume-font-size-name) !important;
      line-height: var(--resume-line-height-name) !important;
      font-weight: 700 !important;
      text-transform: ${styles.typography.textTransform.name} !important;
      text-align: ${styles.layout.textAlign.name} !important;
      letter-spacing: var(--resume-letter-spacing-name) !important;
      margin-bottom: var(--resume-spacing-header-bottom) !important;
    }
    
    /* Contact Styles */
    .resume-contact {
      font-size: var(--resume-font-size-contact) !important;
      line-height: var(--resume-line-height-contact) !important;
      text-align: ${styles.layout.textAlign.contact} !important;
      margin-bottom: var(--resume-spacing-section) !important;
    }
    
    /* Section Header Styles */
    .resume-section-header {
      font-size: var(--resume-font-size-section) !important;
      line-height: var(--resume-line-height-section) !important;
      font-weight: 700 !important;
      text-transform: ${styles.typography.textTransform.section} !important;
      letter-spacing: var(--resume-letter-spacing-section) !important;
      margin-top: var(--resume-spacing-header-top) !important;
      margin-bottom: var(--resume-spacing-header-bottom) !important;
      padding-bottom: 2px !important;
      ${styles.layout.showDividers ? `border-bottom: 1px solid var(--resume-color-divider);` : ''}
    }
    
    /* Title Styles (Job, Degree, Project) */
    .resume-job-title,
    .resume-degree-title,
    .resume-project-title,
    .resume-involvement-title {
      font-size: var(--resume-font-size-title) !important;
      line-height: var(--resume-line-height-title) !important;
      font-weight: 700 !important;
    }
    
    /* Body Text Styles */
    .resume-company,
    .resume-school-info,
    .resume-summary,
    .resume-body-text {
      font-size: var(--resume-font-size-body) !important;
      line-height: var(--resume-line-height-body) !important;
      font-weight: 400 !important;
    }
    
    /* Detail Text Styles */
    .resume-detail-text,
    .resume-date {
      font-size: var(--resume-font-size-detail) !important;
      line-height: var(--resume-line-height-body) !important;
      font-weight: 400 !important;
    }
    
    .resume-date {
      font-style: italic !important;
      float: right !important;
    }
    
    /* List Styles */
    .resume-bullet-list {
      margin-left: var(--resume-bullet-indent) !important;
      list-style: none !important;
    }
    
    .resume-bullet-list li {
      position: relative !important;
      margin-bottom: var(--resume-spacing-bullet) !important;
      padding-left: 0 !important;
      line-height: var(--resume-line-height-body) !important;
      font-size: var(--resume-font-size-body) !important;
      text-align: ${styles.layout.textAlign.body} !important;
    }
    
    .resume-bullet-list li:before {
      content: "•" !important;
      position: absolute !important;
      left: -0.75rem !important;
      color: var(--resume-color-text) !important;
    }
    
    /* Block Spacing */
    .resume-experience-block,
    .resume-education-block,
    .resume-project-block,
    .resume-involvement-block {
      margin-bottom: var(--resume-spacing-block) !important;
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
    }
    
    .resume-skills-title {
      font-weight: 700 !important;
      display: inline !important;
    }
    
    /* Summary Styles */
    .resume-summary {
      text-align: ${styles.layout.textAlign.body} !important;
      margin-bottom: 0 !important;
    }
    
    /* Print Styles */
    @media print {
      .resume-container {
        width: 100% !important;
        height: auto !important;
        transform: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      
      .no-print {
        display: none !important;
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
export function generateInlineStyles(styles: ResumeStyleConfig) {
  return {
    container: {
      fontFamily: styles.typography.fontFamily,
      color: styles.colors.text,
    },
    name: {
      fontSize: `${styles.fontSizes.name}pt`,
      lineHeight: styles.lineHeights.name,
      fontWeight: 700,
      textTransform: styles.typography.textTransform.name as any,
      textAlign: styles.layout.textAlign.name as any,
      letterSpacing: styles.typography.letterSpacing.name,
      marginBottom: `${styles.spacing.headerMarginBottom}rem`,
    },
    contact: {
      fontSize: `${styles.fontSizes.contact}pt`,
      lineHeight: styles.lineHeights.contact,
      textAlign: styles.layout.textAlign.contact as any,
      marginBottom: `${styles.spacing.sectionGap}rem`,
    },
    sectionHeader: {
      fontSize: `${styles.fontSizes.sectionHeader}pt`,
      lineHeight: styles.lineHeights.sectionHeader,
      fontWeight: 700,
      textTransform: styles.typography.textTransform.section as any,
      letterSpacing: styles.typography.letterSpacing.section,
      marginTop: `${styles.spacing.headerMarginTop}rem`,
      marginBottom: `${styles.spacing.headerMarginBottom}rem`,
      paddingBottom: '2px',
      borderBottom: styles.layout.showDividers ? `1px solid ${styles.colors.divider}` : 'none',
    },
    jobTitle: {
      fontSize: `${styles.fontSizes.jobTitle}pt`,
      lineHeight: styles.lineHeights.jobTitle,
      fontWeight: 700,
    },
    bodyText: {
      fontSize: `${styles.fontSizes.body}pt`,
      lineHeight: styles.lineHeights.body,
      fontWeight: 400,
    },
    detailText: {
      fontSize: `${styles.fontSizes.detail}pt`,
      lineHeight: styles.lineHeights.body,
      fontWeight: 400,
    },
    date: {
      fontSize: `${styles.fontSizes.detail}pt`,
      lineHeight: styles.lineHeights.body,
      fontWeight: 400,
      fontStyle: 'italic' as const,
      float: 'right' as const,
    },
    bulletList: {
      marginLeft: styles.layout.bulletIndent,
      listStyle: 'none',
    },
    bulletItem: {
      position: 'relative' as const,
      marginBottom: `${styles.spacing.bulletGap}rem`,
      lineHeight: styles.lineHeights.body,
      fontSize: `${styles.fontSizes.body}pt`,
      textAlign: styles.layout.textAlign.body as any,
    },
  };
}