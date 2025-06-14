// lib/typography-config.ts
export const typographyConfig = {
  // Font families with fallbacks
  fontFamilies: {
    serif: {
      merriweather: "'Merriweather', Georgia, 'Times New Roman', serif",
      georgia: "Georgia, 'Times New Roman', serif",
      playfair: "'Playfair Display', Georgia, serif"
    },
    sansSerif: {
      inter: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      sourceSansPro: "'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      openSans: "'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      roboto: "'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    },
    mono: {
      jetbrains: "'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace",
      consolas: "Consolas, Monaco, 'Courier New', monospace"
    }
  },

  // Font weights mapping
  fontWeights: {
    thin: 100,
    extralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  },

  // Resume-specific font sizes (in pts for PDF compatibility)
  resumeFontSizes: {
    name: {
      small: 18,
      medium: 20,
      large: 24
    },
    sectionHeader: {
      small: 12,
      medium: 14,
      large: 16
    },
    jobTitle: {
      small: 11,
      medium: 12,
      large: 14
    },
    body: {
      small: 10,
      medium: 11,
      large: 12
    },
    detail: {
      small: 9,
      medium: 10,
      large: 11
    }
  },

  // Line heights for optimal readability
  lineHeights: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.8,
    // Resume-specific
    resumeHeading: 1.2,
    resumeBody: 1.4
  },

  // Letter spacing adjustments
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    // Resume-specific
    resumeName: '0.02em',
    resumeSection: '0.05em',
    resumeBody: '0.01em'
  },

  // Professional resume spacing (in mm for PDF, rem for web)
  resumeSpacing: {
    margin: {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15
    },
    sectionGap: 12,
    paragraphGap: 8,
    bulletIndent: 5,
    lineGap: 4,
    // Web-specific spacing in rem
    web: {
      sectionGap: '1.5rem',
      paragraphGap: '1rem',
      bulletGap: '0.5rem',
      lineGap: '0.25rem'
    }
  },

  // OpenType features
  fontFeatures: {
    professional: {
      'font-feature-settings': '"kern" 1, "liga" 1, "calt" 1, "onum" 1',
      'font-variant-ligatures': 'common-ligatures discretionary-ligatures'
    },
    basic: {
      'font-feature-settings': '"kern" 1, "liga" 1'
    }
  },

  // Font loading optimization
  fontDisplay: {
    critical: 'block', // For essential UI fonts
    body: 'swap',      // For body text
    optional: 'optional' // For decorative fonts
  },

  // Resume templates with font pairings
  resumeTemplates: {
    professional: {
      headingFont: 'merriweather',
      bodyFont: 'inter',
      weights: {
        heading: 700,
        subheading: 600,
        body: 400,
        light: 300
      }
    },
    modern: {
      headingFont: 'sourceSansPro',
      bodyFont: 'sourceSansPro',
      weights: {
        heading: 700,
        subheading: 600,
        body: 400,
        light: 300
      }
    },
    classic: {
      headingFont: 'georgia',
      bodyFont: 'georgia',
      weights: {
        heading: 700,
        subheading: 600,
        body: 400,
        light: 400
      }
    },
    minimalist: {
      headingFont: 'inter',
      bodyFont: 'inter',
      weights: {
        heading: 600,
        subheading: 500,
        body: 400,
        light: 300
      }
    }
  }
};

// Type definitions
export type FontFamily = keyof typeof typographyConfig.fontFamilies.serif | 
                        keyof typeof typographyConfig.fontFamilies.sansSerif | 
                        keyof typeof typographyConfig.fontFamilies.mono;

export type FontWeight = keyof typeof typographyConfig.fontWeights;
export type FontSize = 'small' | 'medium' | 'large';
export type ResumeTemplate = keyof typeof typographyConfig.resumeTemplates;

// Helper functions
export function getFontFamily(family: string, type: 'serif' | 'sansSerif' | 'mono' = 'sansSerif'): string {
  const families = typographyConfig.fontFamilies[type];
  return families[family as keyof typeof families] || families[Object.keys(families)[0] as keyof typeof families];
}

export function getResumeFontSize(element: keyof typeof typographyConfig.resumeFontSizes, size: FontSize = 'medium'): number {
  return typographyConfig.resumeFontSizes[element][size];
}

export function getResumeTemplate(template: ResumeTemplate) {
  return typographyConfig.resumeTemplates[template];
}