// components/resume/utils/component-loader.ts

export const preloadFormComponents = async () => {
  try {
    // Preload high-priority components first
    await Promise.all([
      import('../forms/contact-form'),
      import('../forms/experience-form'),
      import('../forms/education-form'),
      import('../forms/skills-form')
    ]);

    // Preload remaining components with delay
    setTimeout(() => {
      Promise.all([
        import('../forms/projects-form'),
        import('../forms/involvement-form'),
        import('../forms/coursework-form'),
        import('../forms/certifications-form'),
        import('../forms/summary-form')
      ]);
    }, 100);
  } catch (error) {
    console.debug('Component preload failed:', error);
  }
};