// Helper function to prepare resume text for cover letter generation
export function prepareResumeForCoverLetter(resumeData: any): string {
  const sections: string[] = [];

  // Add contact information - handle both nested and rmsRawData formats
  if (resumeData.contact || resumeData.contactInfo || resumeData.rmsRawData) {
    const contact = resumeData.contact || resumeData.contactInfo || 
      (resumeData.rmsRawData ? {
        fullName: resumeData.rmsRawData.rms_contact_fullname,
        firstName: resumeData.rmsRawData.rms_contact_givennames,
        lastName: resumeData.rmsRawData.rms_contact_lastname,
        email: resumeData.rmsRawData.rms_contact_email,
        phone: resumeData.rmsRawData.rms_contact_phone,
        linkedin: resumeData.rmsRawData.rms_contact_linkedin,
      } : {});
    
    const name = contact.fullName || 
      `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    if (name) sections.push(`Name: ${name}`);
    if (contact.email) sections.push(`Email: ${contact.email}`);
    if (contact.phone) sections.push(`Phone: ${contact.phone}`);
    if (contact.linkedin) sections.push(`LinkedIn: ${contact.linkedin}`);
  }

  // Add summary
  if (resumeData.summary || (resumeData.rmsRawData && resumeData.rmsRawData.rms_summary && resumeData.rmsRawData.rms_summary !== 'n/a')) {
    sections.push(`\nPROFESSIONAL SUMMARY:\n${resumeData.summary || resumeData.rmsRawData.rms_summary}`);
  }

  // Add key experiences (limit to most recent 3)
  if (resumeData.experience && resumeData.experience.length > 0) {
    sections.push('\nKEY EXPERIENCE:');
    resumeData.experience.slice(0, 3).forEach((exp: any) => {
      sections.push(`\n${exp.position || exp.title} at ${exp.company}`);
      if (exp.dateBegin && exp.dateEnd) {
        sections.push(`${exp.dateBegin} - ${exp.dateEnd}`);
      }
      if (exp.description) {
        // Extract key achievements/bullets
        const bullets = exp.description.split('\n').filter((line: string) => line.trim());
        bullets.slice(0, 3).forEach((bullet: string) => sections.push(`• ${bullet.trim()}`));
      }
    });
  } else if (resumeData.rmsRawData && resumeData.rmsRawData.rms_experience_count) {
    sections.push('\nKEY EXPERIENCE:');
    const expCount = Math.min(resumeData.rmsRawData.rms_experience_count, 3);
    for (let i = 0; i < expCount; i++) {
      const role = resumeData.rmsRawData[`rms_experience_${i}_role`];
      const company = resumeData.rmsRawData[`rms_experience_${i}_company`];
      const dateBegin = resumeData.rmsRawData[`rms_experience_${i}_datebegin`];
      const dateEnd = resumeData.rmsRawData[`rms_experience_${i}_dateend`];
      const description = resumeData.rmsRawData[`rms_experience_${i}_description`];
      
      if (role && company) {
        sections.push(`\n${role} at ${company}`);
        if (dateBegin && dateEnd) {
          sections.push(`${dateBegin} - ${dateEnd}`);
        }
        if (description) {
          // Extract first 3 bullet points
          const bullets = description.split('•').filter((b: string) => b.trim());
          bullets.slice(0, 3).forEach((bullet: string) => {
            sections.push(`• ${bullet.trim()}`);
          });
        }
      }
    }
  }

  // Add education
  if (resumeData.education && resumeData.education.length > 0) {
    sections.push('\nEDUCATION:');
    resumeData.education.forEach((edu: any) => {
      const degree = edu.qualification && edu.fieldOfStudy ?
        `${edu.qualification} in ${edu.fieldOfStudy}` :
        edu.qualification || edu.degree || 'Degree';
      sections.push(`${degree} - ${edu.institution || edu.school}`);
      if (edu.gpa && parseFloat(edu.gpa) >= 3.5) {
        sections.push(`GPA: ${edu.gpa}`);
      }
    });
  } else if (resumeData.rmsRawData && resumeData.rmsRawData.rms_education_count) {
    sections.push('\nEDUCATION:');
    const eduCount = resumeData.rmsRawData.rms_education_count;
    for (let i = 0; i < eduCount; i++) {
      const qualification = resumeData.rmsRawData[`rms_education_${i}_qualification`];
      const institution = resumeData.rmsRawData[`rms_education_${i}_institution`];
      const minor = resumeData.rmsRawData[`rms_education_${i}_minor`];
      
      if (qualification && institution) {
        const degree = minor && minor !== 'n/a' ? 
          `${qualification}, Minor in ${minor}` : 
          qualification;
        sections.push(`${degree} - ${institution}`);
      }
    }
  }

  // Add top skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    sections.push('\nTOP SKILLS:');
    resumeData.skills.forEach((skillCategory: any) => {
      if (skillCategory.keywords) {
        sections.push(`${skillCategory.category}: ${skillCategory.keywords}`);
      }
    });
  } else if (resumeData.rmsRawData && resumeData.rmsRawData.rms_skill_count) {
    sections.push('\nTOP SKILLS:');
    const skillCount = resumeData.rmsRawData.rms_skill_count;
    for (let i = 0; i < skillCount; i++) {
      const category = resumeData.rmsRawData[`rms_skill_${i}_category`];
      const keywords = resumeData.rmsRawData[`rms_skill_${i}_keywords`];
      
      if (category && keywords) {
        sections.push(`${category}: ${keywords}`);
      }
    }
  }

  // Add notable achievements/projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    sections.push('\nNOTABLE PROJECTS:');
    resumeData.projects.slice(0, 2).forEach((project: any) => {
      sections.push(`• ${project.title || project.name}: ${project.description?.substring(0, 100)}...`);
    });
  } else if (resumeData.rmsRawData && resumeData.rmsRawData.rms_project_count) {
    sections.push('\nNOTABLE PROJECTS:');
    const projectCount = Math.min(resumeData.rmsRawData.rms_project_count, 2);
    for (let i = 0; i < projectCount; i++) {
      const title = resumeData.rmsRawData[`rms_project_${i}_title`];
      const description = resumeData.rmsRawData[`rms_project_${i}_description`];
      
      if (title && description) {
        sections.push(`• ${title}: ${description.substring(0, 100)}...`);
      }
    }
  }

  return sections.join('\n');
}

// Helper to extract key highlights from resume
export function extractResumeHighlights(resumeData: any) {
  const highlights = {
    skills: [] as string[],
    education: '',
    experiences: [] as string[],
  };

  // Extract top skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    resumeData.skills.forEach((category: any) => {
      if (category.keywords) {
        const skills = category.keywords.split(',').map((s: string) => s.trim());
        highlights.skills.push(...skills.slice(0, 3));
      }
    });
    highlights.skills = highlights.skills.slice(0, 5); // Limit to top 5
  }

  // Extract education
  if (resumeData.education && resumeData.education.length > 0) {
    const edu = resumeData.education[0];
    highlights.education = edu.qualification && edu.fieldOfStudy ?
      `${edu.qualification} in ${edu.fieldOfStudy}` :
      edu.qualification || edu.degree || '';
  }

  // Extract key experiences
  if (resumeData.experience && resumeData.experience.length > 0) {
    resumeData.experience.slice(0, 2).forEach((exp: any) => {
      if (exp.position && exp.company) {
        highlights.experiences.push(`${exp.position} at ${exp.company}`);
      }
    });
  }

  return highlights;
}