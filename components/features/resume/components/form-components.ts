// components/resume/components/form-components.ts
import dynamic from 'next/dynamic';

// Dynamic imports with consistent SSR settings
export const FormComponents = {
  ContactForm: dynamic(() => import('../forms/contact-form'), { ssr: false }),
  ExperienceForm: dynamic(() => import('../forms/experience-form'), { ssr: false }),
  EducationForm: dynamic(() => import('../forms/education-form'), { ssr: false }),
  SkillsForm: dynamic(() => import('../forms/skills-form'), { ssr: false }),
  ProjectsForm: dynamic(() => import('../forms/projects-form'), { ssr: false }),
  InvolvementForm: dynamic(() => import('../forms/involvement-form'), { ssr: false }),
  CourseworkForm: dynamic(() => import('../forms/coursework-form'), { ssr: false }),
  CertificationsForm: dynamic(() => import('../forms/certifications-form'), { ssr: false }),
  SummaryForm: dynamic(() => import('../forms/summary-form'), { ssr: false })
};