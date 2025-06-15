// lib/rms-metadata-formatter.ts
// Utility to format parsed resume data into RMS metadata for ExifTool

export interface RMSMetadataOutput {
  // Producer is PDF metadata, not RMS metadata
  producer?: string;
  rms_schema_detail: string;
  rms_version?: string;
  
  // Contact fields
  rms_contact_fullName?: string;
  rms_contact_givenNames?: string;
  rms_contact_lastName?: string;
  rms_contact_email?: string;
  rms_contact_phone?: string;
  rms_contact_city?: string;
  rms_contact_state?: string;
  rms_contact_country?: string;
  rms_contact_linkedin?: string;
  rms_contact_github?: string;
  rms_contact_website?: string;
  
  // Summary
  rms_summary?: string;
  
  // Counts
  rms_experience_count?: number;
  rms_education_count?: number;
  rms_skill_count?: number;
  rms_project_count?: number;
  rms_involvement_count?: number;
  rms_certification_count?: number;
  
  // All indexed fields
  [key: string]: any;
}

/**
 * Convert parsed resume data to RMS metadata format for ExifTool
 */
export function formatResumeDataToRMS(resumeData: any): RMSMetadataOutput {
  const rmsData: RMSMetadataOutput = {
    producer: 'rms_v2.0.1', // Producer indicates RMS version compliance
    rms_schema_detail: 'https://github.com/rezi-io/resume-standard',
    rms_version: 'v2.0.1',
  };
  
  // If we already have RMS formatted data, use it directly
  if (resumeData.rmsRawData) {
    return { ...rmsData, ...resumeData.rmsRawData };
  }
  
  const parsedData = resumeData.parsedData || resumeData;
  
  // Contact Information
  if (parsedData.contactInfo) {
    const contact = parsedData.contactInfo;
    
    rmsData.rms_contact_fullName = contact.fullName || '';
    rmsData.rms_contact_givenNames = contact.firstName || contact.givenNames || '';
    rmsData.rms_contact_lastName = contact.lastName || '';
    rmsData.rms_contact_email = contact.email || '';
    rmsData.rms_contact_phone = contact.phone || '';
    
    // Parse location
    if (contact.location) {
      const locationParts = contact.location.split(',').map(s => s.trim());
      if (locationParts.length >= 1) rmsData.rms_contact_city = locationParts[0];
      if (locationParts.length >= 2) rmsData.rms_contact_state = locationParts[1];
      if (locationParts.length >= 3) rmsData.rms_contact_country = locationParts[2];
    } else {
      rmsData.rms_contact_city = contact.city || '';
      rmsData.rms_contact_state = contact.state || '';
      rmsData.rms_contact_country = contact.country || '';
    }
    
    rmsData.rms_contact_linkedin = contact.linkedin || '';
    rmsData.rms_contact_github = contact.github || '';
    rmsData.rms_contact_website = contact.website || '';
  }
  
  // Summary
  rmsData.rms_summary = parsedData.summary || '';
  
  // Experience
  if (parsedData.experiences && Array.isArray(parsedData.experiences)) {
    rmsData.rms_experience_count = parsedData.experiences.length;
    
    parsedData.experiences.forEach((exp: any, index: number) => {
      const prefix = `rms_experience_${index}`;
      
      rmsData[`${prefix}_company`] = exp.company || '';
      rmsData[`${prefix}_role`] = exp.title || exp.role || '';
      rmsData[`${prefix}_location`] = exp.location || '';
      rmsData[`${prefix}_dateBegin`] = formatDate(exp.startDate);
      rmsData[`${prefix}_dateEnd`] = exp.current ? 'Present' : formatDate(exp.endDate);
      rmsData[`${prefix}_isCurrent`] = String(!!exp.current);
      
      // Format description with bullet points
      let description = exp.description || '';
      if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
        description = exp.responsibilities.map(r => `• ${r}`).join('\n');
      } else if (exp.bulletPoints && Array.isArray(exp.bulletPoints)) {
        description = exp.bulletPoints.map(b => `• ${b}`).join('\n');
      }
      rmsData[`${prefix}_description`] = description;
    });
  } else {
    rmsData.rms_experience_count = 0;
  }
  
  // Education
  if (parsedData.education && Array.isArray(parsedData.education)) {
    rmsData.rms_education_count = parsedData.education.length;
    
    parsedData.education.forEach((edu: any, index: number) => {
      const prefix = `rms_education_${index}`;
      
      rmsData[`${prefix}_institution`] = edu.school || edu.institution || '';
      
      // Combine degree and field of study
      let qualification = edu.degree || '';
      if (edu.fieldOfStudy) {
        qualification = qualification ? `${qualification} in ${edu.fieldOfStudy}` : edu.fieldOfStudy;
      }
      rmsData[`${prefix}_qualification`] = qualification;
      
      rmsData[`${prefix}_location`] = edu.location || '';
      rmsData[`${prefix}_date`] = formatDate(edu.endDate) || formatDate(edu.graduationDate) || '';
      rmsData[`${prefix}_isGraduate`] = String(!edu.current);
      rmsData[`${prefix}_score`] = edu.gpa || '';
      rmsData[`${prefix}_scoreType`] = edu.gpa ? 'GPA' : '';
      rmsData[`${prefix}_description`] = edu.description || '';
    });
  } else {
    rmsData.rms_education_count = 0;
  }
  
  // Skills
  if (parsedData.skillCategories && Array.isArray(parsedData.skillCategories)) {
    rmsData.rms_skill_count = parsedData.skillCategories.length;
    
    parsedData.skillCategories.forEach((category: any, index: number) => {
      const prefix = `rms_skill_${index}`;
      
      rmsData[`${prefix}_category`] = category.name || 'Skills';
      
      // Convert skills array to comma-separated string
      let keywords = '';
      if (category.skills && Array.isArray(category.skills)) {
        keywords = category.skills.map((s: any) => s.name || s).join(', ');
      }
      rmsData[`${prefix}_keywords`] = keywords;
    });
  } else if (parsedData.skills && Array.isArray(parsedData.skills)) {
    // Handle flat skills array
    rmsData.rms_skill_count = 1;
    rmsData.rms_skill_0_category = 'Skills';
    rmsData.rms_skill_0_keywords = parsedData.skills.join(', ');
  } else {
    rmsData.rms_skill_count = 0;
  }
  
  // Projects
  if (parsedData.projects && Array.isArray(parsedData.projects)) {
    rmsData.rms_project_count = parsedData.projects.length;
    
    parsedData.projects.forEach((proj: any, index: number) => {
      const prefix = `rms_project_${index}`;
      
      rmsData[`${prefix}_title`] = proj.title || '';
      rmsData[`${prefix}_organization`] = proj.organization || '';
      rmsData[`${prefix}_description`] = proj.description || '';
      rmsData[`${prefix}_url`] = proj.url || '';
      
      if (proj.startDate) {
        rmsData[`${prefix}_dateBegin`] = formatDate(proj.startDate);
      }
      if (proj.endDate) {
        rmsData[`${prefix}_dateEnd`] = formatDate(proj.endDate);
      }
    });
  } else {
    rmsData.rms_project_count = 0;
  }
  
  // Involvements
  if (parsedData.involvements && Array.isArray(parsedData.involvements)) {
    rmsData.rms_involvement_count = parsedData.involvements.length;
    
    parsedData.involvements.forEach((inv: any, index: number) => {
      const prefix = `rms_involvement_${index}`;
      
      rmsData[`${prefix}_organization`] = inv.organization || '';
      rmsData[`${prefix}_role`] = inv.role || '';
      rmsData[`${prefix}_location`] = inv.location || '';
      rmsData[`${prefix}_description`] = inv.description || '';
      
      if (inv.startDate) {
        rmsData[`${prefix}_dateBegin`] = formatDate(inv.startDate);
      }
      if (inv.endDate) {
        rmsData[`${prefix}_dateEnd`] = formatDate(inv.endDate);
      }
    });
  } else {
    rmsData.rms_involvement_count = 0;
  }
  
  // Certifications
  if (parsedData.certifications && Array.isArray(parsedData.certifications)) {
    rmsData.rms_certification_count = parsedData.certifications.length;
    
    parsedData.certifications.forEach((cert: any, index: number) => {
      const prefix = `rms_certification_${index}`;
      
      rmsData[`${prefix}_name`] = cert.name || '';
      rmsData[`${prefix}_issuer`] = cert.issuer || cert.organization || '';
      rmsData[`${prefix}_date`] = formatDate(cert.date) || formatDate(cert.issueDate) || '';
    });
  } else {
    rmsData.rms_certification_count = 0;
  }
  
  // Clean up empty values
  Object.keys(rmsData).forEach(key => {
    if (rmsData[key] === '' || rmsData[key] === undefined || rmsData[key] === null) {
      delete rmsData[key];
    }
  });
  
  return rmsData;
}

/**
 * Format date string for RMS
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  if (dateStr.toLowerCase() === 'present') return 'Present';
  
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
    }
  } catch {
    // If parsing fails, return original string
  }
  
  return dateStr;
}