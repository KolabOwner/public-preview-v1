// hooks/use-typography.ts
import { useCallback, useMemo } from 'react';
import { typographyConfig, ResumeTemplate, FontSize } from '@/lib/typography-config';

interface UseTypographyOptions {
  template?: ResumeTemplate;
  size?: FontSize;
  isDarkMode?: boolean;
}

export function useTypography({
  template = 'professional',
  size = 'medium',
  isDarkMode = false
}: UseTypographyOptions = {}) {
  // Get template configuration
  const templateConfig = useMemo(() => {
    return typographyConfig.resumeTemplates[template];
  }, [template]);

  // Get font families based on template
  const fontFamilies = useMemo(() => {
    const { headingFont, bodyFont } = templateConfig;
    
    return {
      heading: typographyConfig.fontFamilies.serif[headingFont as keyof typeof typographyConfig.fontFamilies.serif] ||
               typographyConfig.fontFamilies.sansSerif[headingFont as keyof typeof typographyConfig.fontFamilies.sansSerif],
      body: typographyConfig.fontFamilies.sansSerif[bodyFont as keyof typeof typographyConfig.fontFamilies.sansSerif] ||
            typographyConfig.fontFamilies.serif[bodyFont as keyof typeof typographyConfig.fontFamilies.serif]
    };
  }, [templateConfig]);

  // Get font sizes based on size preference
  const fontSizes = useMemo(() => {
    return {
      name: typographyConfig.resumeFontSizes.name[size],
      sectionHeader: typographyConfig.resumeFontSizes.sectionHeader[size],
      jobTitle: typographyConfig.resumeFontSizes.jobTitle[size],
      body: typographyConfig.resumeFontSizes.body[size],
      detail: typographyConfig.resumeFontSizes.detail[size]
    };
  }, [size]);

  // Generate CSS variables for typography
  const getCSSVariables = useCallback(() => {
    return {
      '--resume-font-heading': fontFamilies.heading,
      '--resume-font-body': fontFamilies.body,
      '--resume-size-name': `${fontSizes.name}pt`,
      '--resume-size-section': `${fontSizes.sectionHeader}pt`,
      '--resume-size-title': `${fontSizes.jobTitle}pt`,
      '--resume-size-body': `${fontSizes.body}pt`,
      '--resume-size-detail': `${fontSizes.detail}pt`,
      '--resume-weight-heading': templateConfig.weights.heading,
      '--resume-weight-subheading': templateConfig.weights.subheading,
      '--resume-weight-body': templateConfig.weights.body,
      '--resume-weight-light': templateConfig.weights.light,
      '--resume-line-height-heading': typographyConfig.lineHeights.resumeHeading,
      '--resume-line-height-body': typographyConfig.lineHeights.resumeBody,
      '--resume-letter-spacing-name': typographyConfig.letterSpacing.resumeName,
      '--resume-letter-spacing-section': typographyConfig.letterSpacing.resumeSection,
      '--resume-letter-spacing-body': typographyConfig.letterSpacing.resumeBody
    };
  }, [fontFamilies, fontSizes, templateConfig]);

  // Generate inline styles for elements
  const getStyles = useCallback(() => {
    const baseColor = isDarkMode ? '#f3f4f6' : '#111827';
    const mutedColor = isDarkMode ? '#d1d5db' : '#6b7280';
    
    return {
      name: {
        fontFamily: fontFamilies.heading,
        fontSize: `${fontSizes.name}pt`,
        fontWeight: templateConfig.weights.heading,
        lineHeight: typographyConfig.lineHeights.resumeHeading,
        letterSpacing: typographyConfig.letterSpacing.resumeName,
        color: baseColor
      },
      sectionHeader: {
        fontFamily: fontFamilies.heading,
        fontSize: `${fontSizes.sectionHeader}pt`,
        fontWeight: templateConfig.weights.heading,
        lineHeight: typographyConfig.lineHeights.resumeHeading,
        letterSpacing: typographyConfig.letterSpacing.resumeSection,
        textTransform: 'uppercase' as const,
        color: baseColor
      },
      jobTitle: {
        fontFamily: fontFamilies.body,
        fontSize: `${fontSizes.jobTitle}pt`,
        fontWeight: templateConfig.weights.subheading,
        lineHeight: typographyConfig.lineHeights.resumeBody,
        color: baseColor
      },
      body: {
        fontFamily: fontFamilies.body,
        fontSize: `${fontSizes.body}pt`,
        fontWeight: templateConfig.weights.body,
        lineHeight: typographyConfig.lineHeights.resumeBody,
        letterSpacing: typographyConfig.letterSpacing.resumeBody,
        color: baseColor
      },
      detail: {
        fontFamily: fontFamilies.body,
        fontSize: `${fontSizes.detail}pt`,
        fontWeight: templateConfig.weights.body,
        lineHeight: typographyConfig.lineHeights.resumeBody,
        color: mutedColor
      }
    };
  }, [fontFamilies, fontSizes, templateConfig, isDarkMode]);

  // Apply professional typography features
  const applyProfessionalFeatures = useCallback((element: HTMLElement) => {
    if (!element) return;
    
    // Apply OpenType features
    Object.assign(element.style, typographyConfig.fontFeatures.professional);
    
    // Apply optical sizing for variable fonts
    if (CSS.supports('font-optical-sizing', 'auto')) {
      element.style.fontOpticalSizing = 'auto';
    }
    
    // Apply font smoothing
    element.style.webkitFontSmoothing = 'antialiased';
    element.style.MozOsxFontSmoothing = 'grayscale';
    
    // Apply text rendering
    element.style.textRendering = 'optimizeLegibility';
  }, []);

  return {
    template,
    size,
    fontFamilies,
    fontSizes,
    templateConfig,
    getCSSVariables,
    getStyles,
    applyProfessionalFeatures,
    config: typographyConfig
  };
}