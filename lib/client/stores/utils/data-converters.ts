// lib/client/stores/utils/data-converters.ts
import type { UnifiedResumeData } from '../types';

// Helper functions for RMS conversion
const convertContactInfo = (contactInfo: UnifiedResumeData['contactInfo'], raw: any) => {
  if (!contactInfo) return;

  raw.Rms_contact_fullName = contactInfo.fullName || '';
  raw.Rms_contact_email = contactInfo.email || '';
  raw.Rms_contact_phone = contactInfo.phone || '';
  raw.Rms_contact_linkedin = contactInfo.linkedin || '';
  raw.Rms_contact_website = contactInfo.website || '';
  raw.Rms_contact_country = contactInfo.country || '';
  raw.Rms_contact_state = contactInfo.state || '';
  raw.Rms_contact_city = contactInfo.city || '';
};

const convertExperiences = (experiences: UnifiedResumeData['experiences'], raw: any) => {
  if (!experiences || !Array.isArray(experiences)) {
    raw.Rms_experience_count = 0;
    return;
  }

  raw.Rms_experience_count = experiences.length;
  experiences.forEach((exp, index) => {
    raw[`Rms_experience_${index}_role`] = exp.title || '';
    raw[`Rms_experience_${index}_company`] = exp.company || '';
    raw[`Rms_experience_${index}_location`] = exp.location || '';
    raw[`Rms_experience_${index}_dateBegin`] = exp.startDate || '';
    raw[`Rms_experience_${index}_dateEnd`] = exp.endDate || '';
    raw[`Rms_experience_${index}_isCurrent`] = exp.current || false;

    const description = exp.bulletPoints && Array.isArray(exp.bulletPoints)
      ? exp.bulletPoints.join('\n')
      : '';
    raw[`Rms_experience_${index}_description`] = description;
  });
};

const convertEducation = (education: UnifiedResumeData['education'], raw: any) => {
  if (!education || !Array.isArray(education)) {
    raw.Rms_education_count = 0;
    return;
  }

  raw.Rms_education_count = education.length;
  education.forEach((edu, index) => {
    raw[`Rms_education_${index}_institution`] = edu.institution || '';
    raw[`Rms_education_${index}_qualification`] = edu.qualification || '';
    raw[`Rms_education_${index}_location`] = edu.location || '';
    raw[`Rms_education_${index}_date`] = edu.date || '';
    raw[`Rms_education_${index}_score`] = edu.score || '';
    raw[`Rms_education_${index}_scoreType`] = edu.scoreType || '';
  });
};

const convertSkills = (skills: UnifiedResumeData['skills'], raw: any) => {
  if (!skills || !Array.isArray(skills)) {
    raw.Rms_skill_count = 0;
    return;
  }

  raw.Rms_skill_count = skills.length;
  skills.forEach((skill, index) => {
    raw[`Rms_skill_${index}_category`] = skill.category || '';
    raw[`Rms_skill_${index}_keywords`] = skill.keywords || '';
  });
};

const convertProjects = (projects: UnifiedResumeData['projects'], raw: any) => {
  if (!projects || !Array.isArray(projects)) {
    raw.Rms_project_count = 0;
    return;
  }

  raw.Rms_project_count = projects.length;
  projects.forEach((proj, index) => {
    raw[`Rms_project_${index}_title`] = proj.title || '';
    raw[`Rms_project_${index}_organization`] = proj.organization || '';
    raw[`Rms_project_${index}_url`] = proj.url || '';
    raw[`Rms_project_${index}_description`] = proj.description || '';
  });
};

const convertInvolvements = (involvements: UnifiedResumeData['involvements'], raw: any) => {
  if (!involvements || !Array.isArray(involvements)) {
    raw.Rms_involvement_count = 0;
    return;
  }

  raw.Rms_involvement_count = involvements.length;
  involvements.forEach((inv, index) => {
    raw[`Rms_involvement_${index}_organization`] = inv.organization || '';
    raw[`Rms_involvement_${index}_role`] = inv.role || '';
    raw[`Rms_involvement_${index}_location`] = inv.location || '';
    raw[`Rms_involvement_${index}_dateBegin`] = inv.startDate || '';
    raw[`Rms_involvement_${index}_dateEnd`] = inv.endDate || '';
    raw[`Rms_involvement_${index}_description`] = inv.description || '';
  });
};

const convertCertifications = (certifications: UnifiedResumeData['certifications'], raw: any) => {
  if (!certifications || !Array.isArray(certifications)) {
    raw.Rms_certification_count = 0;
    return;
  }

  raw.Rms_certification_count = certifications.length;
  certifications.forEach((cert, index) => {
    raw[`Rms_certification_${index}_name`] = cert.name || '';
    raw[`Rms_certification_${index}_department`] = cert.issuer || '';
    raw[`Rms_certification_${index}_date`] = cert.date || '';
  });
};

// Main conversion function
export const convertToRawFormat = (unifiedData: UnifiedResumeData): any => {
  const raw: any = {};

  // Convert each section
  convertContactInfo(unifiedData.contactInfo, raw);
  raw.Rms_summary = unifiedData.summary || '';
  convertExperiences(unifiedData.experiences, raw);
  convertEducation(unifiedData.education, raw);
  convertSkills(unifiedData.skills, raw);
  convertProjects(unifiedData.projects, raw);
  convertInvolvements(unifiedData.involvements, raw);
  convertCertifications(unifiedData.certifications, raw);

  return raw;
};