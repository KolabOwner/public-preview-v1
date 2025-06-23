// lib/features/resume/sections/resume-sections.ts

export interface SectionConfig {
  id: string;
  title: string;
  alternativeTitles?: string[];
  icon?: string;
  description?: string;
  required?: boolean;
  defaultOrder?: number;
  category?: 'primary' | 'additional' | 'optional';
}

export const RESUME_SECTIONS: Record<string, SectionConfig> = {
  summary: {
    id: 'summary',
    title: 'Professional Summary',
    alternativeTitles: ['Summary', 'Profile', 'Objective', 'Career Summary'],
    icon: 'FileText',
    description: 'Brief overview of your professional background and goals',
    required: false,
    defaultOrder: 1,
    category: 'primary',
  },
  experience: {
    id: 'experience',
    title: 'Experience',
    alternativeTitles: ['Work Experience', 'Professional Experience', 'Employment History'],
    icon: 'Briefcase',
    description: 'Your work history and professional experiences',
    required: true,
    defaultOrder: 2,
    category: 'primary',
  },
  education: {
    id: 'education',
    title: 'Education',
    alternativeTitles: ['Academic Background', 'Educational Background', 'Qualifications'],
    icon: 'GraduationCap',
    description: 'Your educational qualifications and degrees',
    required: true,
    defaultOrder: 3,
    category: 'primary',
  },
  skills: {
    id: 'skills',
    title: 'Skills',
    alternativeTitles: ['Technical Skills', 'Core Competencies', 'Expertise'],
    icon: 'Zap',
    description: 'Your professional and technical skills',
    required: true,
    defaultOrder: 4,
    category: 'primary',
  },
  projects: {
    id: 'projects',
    title: 'Projects',
    alternativeTitles: ['Key Projects', 'Notable Projects', 'Portfolio'],
    icon: 'Folder',
    description: 'Significant projects you have worked on',
    required: false,
    defaultOrder: 5,
    category: 'additional',
  },
  involvement: {
    id: 'involvement',
    title: 'Involvement',
    alternativeTitles: ['Activities', 'Leadership', 'Extracurricular Activities'],
    icon: 'Users',
    description: 'Leadership roles and organizational involvement',
    required: false,
    defaultOrder: 6,
    category: 'additional',
  },
  certifications: {
    id: 'certifications',
    title: 'Certifications',
    alternativeTitles: ['Licenses & Certifications', 'Professional Certifications', 'Credentials'],
    icon: 'Award',
    description: 'Professional certifications and licenses',
    required: false,
    defaultOrder: 7,
    category: 'additional',
  },
  coursework: {
    id: 'coursework',
    title: 'Relevant Coursework',
    alternativeTitles: ['Academic Coursework', 'Key Courses', 'Course Highlights'],
    icon: 'BookOpen',
    description: 'Relevant academic courses',
    required: false,
    defaultOrder: 8,
    category: 'optional',
  },
  languages: {
    id: 'languages',
    title: 'Languages',
    alternativeTitles: ['Language Skills', 'Linguistic Abilities'],
    icon: 'Globe',
    description: 'Languages you speak and proficiency levels',
    required: false,
    defaultOrder: 9,
    category: 'optional',
  },
  awards: {
    id: 'awards',
    title: 'Awards & Honors',
    alternativeTitles: ['Achievements', 'Recognition', 'Accomplishments'],
    icon: 'Trophy',
    description: 'Awards, honors, and recognition received',
    required: false,
    defaultOrder: 10,
    category: 'optional',
  },
  publications: {
    id: 'publications',
    title: 'Publications',
    alternativeTitles: ['Research', 'Published Work', 'Papers'],
    icon: 'FileText',
    description: 'Published articles, papers, or research',
    required: false,
    defaultOrder: 11,
    category: 'optional',
  },
  volunteer: {
    id: 'volunteer',
    title: 'Volunteer Experience',
    alternativeTitles: ['Community Service', 'Volunteer Work', 'Social Impact'],
    icon: 'Heart',
    description: 'Volunteer work and community service',
    required: false,
    defaultOrder: 12,
    category: 'optional',
  },
  references: {
    id: 'references',
    title: 'References',
    alternativeTitles: ['Professional References', 'Recommendations'],
    icon: 'UserCheck',
    description: 'Professional references and contacts',
    required: false,
    defaultOrder: 13,
    category: 'optional',
  },
};

// Get section title based on template and preferences
export function getSectionTitle(
  sectionId: string,
  template?: string,
  customTitle?: string
): string {
  if (customTitle) return customTitle;

  const section = RESUME_SECTIONS[sectionId];
  if (!section) return sectionId.toUpperCase();

  // Template-specific title variations
  const templateTitles: Record<string, Record<string, string>> = {
    professional: {
      summary: 'PROFESSIONAL SUMMARY',
      experience: 'EXPERIENCE',
      education: 'EDUCATION',
      skills: 'SKILLS',
    },
    modern: {
      summary: 'Profile',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Core Skills',
    },
    creative: {
      summary: 'About Me',
      experience: 'My Journey',
      education: 'Learning Path',
      skills: 'What I Bring',
    },
    academic: {
      summary: 'Research Interests',
      experience: 'Academic Appointments',
      education: 'Educational Background',
      skills: 'Research Skills',
      publications: 'Selected Publications',
    },
  };

  if (template && templateTitles[template]?.[sectionId]) {
    return templateTitles[template][sectionId];
  }

  return section.title.toUpperCase();
}

// Get default section order for a template
export function getDefaultSectionOrder(template?: string): string[] {
  const templateOrders: Record<string, string[]> = {
    professional: [
      'summary',
      'experience',
      'education',
      'skills',
      'certifications',
      'projects',
      'involvement',
    ],
    modern: [
      'summary',
      'experience',
      'skills',
      'education',
      'projects',
      'certifications',
      'involvement',
    ],
    creative: [
      'summary',
      'skills',
      'experience',
      'projects',
      'education',
      'involvement',
    ],
    minimal: [
      'experience',
      'education',
      'skills',
      'projects',
    ],
    executive: [
      'summary',
      'experience',
      'education',
      'skills',
      'awards',
      'certifications',
    ],
    academic: [
      'summary',
      'education',
      'experience',
      'publications',
      'skills',
      'awards',
      'coursework',
    ],
    technical: [
      'summary',
      'skills',
      'experience',
      'projects',
      'education',
      'certifications',
    ],
  };

  if (template && templateOrders[template]) {
    return templateOrders[template];
  }

  // Default order
  return Object.values(RESUME_SECTIONS)
    .sort((a, b) => (a.defaultOrder || 99) - (b.defaultOrder || 99))
    .map(section => section.id);
}

// Check if a section has content - Updated for consolidated context format
export function sectionHasContent(sectionId: string, resumeData: any): boolean {
  if (!resumeData) return false;
  
  const checks: Record<string, (data: any) => boolean> = {
    summary: (data) => !!(data.summary && data.summary.trim()),
    experience: (data) => !!(data.experience && data.experience.length > 0),
    education: (data) => !!(data.education && data.education.length > 0),
    skills: (data) => !!(data.skills && data.skills.length > 0),
    projects: (data) => !!(data.projects && data.projects.length > 0),
    involvement: (data) => !!(data.involvement && data.involvement.length > 0),
    certifications: (data) => !!(data.certifications && data.certifications.length > 0),
    coursework: (data) => !!(data.coursework && data.coursework.length > 0),
    languages: (data) => !!(data.languages && data.languages.length > 0),
    awards: (data) => !!(data.awards && data.awards.length > 0),
    publications: (data) => !!(data.publications && data.publications.length > 0),
    volunteer: (data) => !!(data.volunteer && data.volunteer.length > 0),
    references: (data) => !!(data.references && data.references.length > 0),
  };

  const checkFn = checks[sectionId];
  return checkFn ? checkFn(resumeData) : false;
}

// Get visible sections (sections that have content)
export function getVisibleSections(resumeData: any, sectionOrder: string[]): string[] {
  return sectionOrder.filter(sectionId => sectionHasContent(sectionId, resumeData));
}

// Section visibility settings
export interface SectionVisibility {
  [sectionId: string]: boolean;
}

// Get section categories for grouping in UI
export function getSectionsByCategory() {
  const categories = {
    primary: [] as SectionConfig[],
    additional: [] as SectionConfig[],
    optional: [] as SectionConfig[],
  };

  Object.values(RESUME_SECTIONS).forEach(section => {
    const category = section.category || 'optional';
    categories[category].push(section);
  });

  return categories;
}

// Export section IDs for easy reference
export const SECTION_IDS = {
  SUMMARY: 'summary',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  PROJECTS: 'projects',
  INVOLVEMENT: 'involvement',
  CERTIFICATIONS: 'certifications',
  COURSEWORK: 'coursework',
  LANGUAGES: 'languages',
  AWARDS: 'awards',
  PUBLICATIONS: 'publications',
  VOLUNTEER: 'volunteer',
  REFERENCES: 'references',
} as const;

export type SectionId = typeof SECTION_IDS[keyof typeof SECTION_IDS];