// src/lib/utilities.ts
// Comprehensive utilities for RMS data manipulation and conversion

import type { RMSData } from './schema';

export class RMSUtilities {
  /**
   * Convert RMS data to a human-readable format
   */
  static toReadableFormat(rmsData: RMSData): any {
    const readable: any = {
      contact: {},
      summary: rmsData.rms_summary,
      experiences: [],
      education: [],
      skills: [],
      certifications: [],
      projects: [],
      awards: [],
      publications: [],
      references: []
    };

    // Extract contact information
    Object.keys(rmsData).forEach(key => {
      if (key.startsWith('rms_contact_')) {
        const field = key.replace('rms_contact_', '');
        readable.contact[field] = rmsData[key as keyof RMSData];
      }
    });

    // Extract sections
    const sections = [
      'experience', 'education', 'skill', 'certification',
      'project', 'award', 'publication', 'reference'
    ];

    sections.forEach(section => {
      const countKey = `rms_${section}_count` as keyof RMSData;
      const count = rmsData[countKey] as number || 0;
      const sectionArray = readable[`${section}s`] || readable[section];

      for (let i = 0; i < count; i++) {
        const item: any = {};

        Object.keys(rmsData).forEach(key => {
          if (key.startsWith(`rms_${section}_${i}_`)) {
            const field = key.replace(`rms_${section}_${i}_`, '');
            item[field] = rmsData[key as keyof RMSData];
          }
        });

        if (Object.keys(item).length > 0) {
          sectionArray.push(item);
        }
      }
    });

    return readable;
  }

  /**
   * Convert readable format back to RMS format
   */
  static fromReadableFormat(readable: any): Partial<RMSData> {
    const rmsData: any = {
      Producer: 'rms_v2.0.1',
      rms_schema_detail: 'https://github.com/rezi-io/resume-standard'
    };

    // Convert contact info
    if (readable.contact) {
      Object.keys(readable.contact).forEach(key => {
        rmsData[`rms_contact_${key}`] = readable.contact[key];
      });
    }

    // Convert summary
    if (readable.summary) {
      rmsData.rms_summary = readable.summary;
    }

    // Convert sections
    const sectionMappings = [
      { readable: 'experiences', rms: 'experience' },
      { readable: 'education', rms: 'education' },
      { readable: 'skills', rms: 'skill' },
      { readable: 'certifications', rms: 'certification' },
      { readable: 'projects', rms: 'project' },
      { readable: 'awards', rms: 'award' },
      { readable: 'publications', rms: 'publication' },
      { readable: 'references', rms: 'reference' }
    ];

    sectionMappings.forEach(({ readable: readableKey, rms }) => {
      const items = readable[readableKey];
      if (Array.isArray(items)) {
        rmsData[`rms_${rms}_count`] = items.length;

        items.forEach((item, index) => {
          Object.keys(item).forEach(field => {
            rmsData[`rms_${rms}_${index}_${field}`] = item[field];
          });
        });
      }
    });

    return rmsData;
  }

  /**
   * Extract specific section data
   */
  static extractSection(rmsData: RMSData, section: string): any[] {
    const countKey = `rms_${section}_count` as keyof RMSData;
    const count = rmsData[countKey] as number || 0;
    const items = [];

    for (let i = 0; i < count; i++) {
      const item: any = {};

      Object.keys(rmsData).forEach(key => {
        if (key.startsWith(`rms_${section}_${i}_`)) {
          const field = key.replace(`rms_${section}_${i}_`, '');
          item[field] = rmsData[key as keyof RMSData];
        }
      });

      if (Object.keys(item).length > 0) {
        items.push(item);
      }
    }

    return items;
  }

  /**
   * Generate a text summary from RMS data
   */
  static generateTextSummary(rmsData: RMSData): string {
    const readable = this.toReadableFormat(rmsData);
    let summary = '';

    // Contact info
    if (readable.contact.fullName) {
      summary += `${readable.contact.fullName}\n`;
      if (readable.contact.email) summary += `${readable.contact.email}\n`;
      if (readable.contact.phone) summary += `${readable.contact.phone}\n`;
      if (readable.contact.city || readable.contact.state) {
        summary += `${[readable.contact.city, readable.contact.state, readable.contact.country]
          .filter(Boolean).join(', ')}\n`;
      }
      summary += '\n';
    }

    // Summary
    if (readable.summary) {
      summary += `SUMMARY\n${readable.summary}\n\n`;
    }

    // Experience
    if (readable.experiences.length > 0) {
      summary += 'EXPERIENCE\n';
      readable.experiences.forEach((exp: any) => {
        summary += `${exp.role} at ${exp.company}\n`;
        summary += `${exp.dateBegin} - ${exp.dateEnd}`;
        if (exp.location) summary += ` | ${exp.location}`;
        summary += '\n';
        if (exp.description) summary += `${exp.description}\n`;
        summary += '\n';
      });
    }

    // Education
    if (readable.education.length > 0) {
      summary += 'EDUCATION\n';
      readable.education.forEach((edu: any) => {
        summary += `${edu.institution}\n`;
        summary += `${edu.qualification}`;
        if (edu.date) summary += `, ${edu.date}`;
        summary += '\n';
        if (edu.score && edu.scoreType) {
          summary += `${edu.scoreType}: ${edu.score}\n`;
        }
        summary += '\n';
      });
    }

    // Skills
    if (readable.skills.length > 0) {
      summary += 'SKILLS\n';
      readable.skills.forEach((skill: any) => {
        summary += `${skill.category}: ${skill.keywords}\n`;
      });
    }

    return summary.trim();
  }

  /**
   * Calculate resume completeness score
   */
  static calculateCompleteness(rmsData: RMSData): {
    score: number;
    missing: string[];
    suggestions: string[];
  } {
    const requiredFields = [
      'rms_contact_fullName',
      'rms_contact_email',
      'rms_contact_phone',
      'rms_summary',
      'rms_experience_count',
      'rms_education_count',
      'rms_skill_count'
    ];

    const missing: string[] = [];
    const suggestions: string[] = [];
    let fieldCount = 0;
    let filledCount = 0;

    // Check required fields
    requiredFields.forEach(field => {
      fieldCount++;
      if (rmsData[field as keyof RMSData]) {
        filledCount++;
      } else {
        missing.push(field.replace('rms_', '').replace(/_/g, ' '));
      }
    });

    // Check experience details
    const expCount = rmsData.rms_experience_count || 0;
    if (expCount > 0) {
      for (let i = 0; i < expCount; i++) {
        const expFields = ['company', 'role', 'description', 'dateBegin', 'dateEnd'];
        expFields.forEach(field => {
          fieldCount++;
          if (rmsData[`rms_experience_${i}_${field}` as keyof RMSData]) {
            filledCount++;
          }
        });
      }
    } else {
      suggestions.push('Add work experience entries');
    }

    // Check education details
    const eduCount = rmsData.rms_education_count || 0;
    if (eduCount === 0) {
      suggestions.push('Add education information');
    }

    // Check skills
    const skillCount = rmsData.rms_skill_count || 0;
    if (skillCount === 0) {
      suggestions.push('Add skills section');
    }

    // Check for LinkedIn
    if (!rmsData.rms_contact_linkedin) {
      suggestions.push('Add LinkedIn profile');
    }

    // Check for location
    if (!rmsData.rms_contact_city && !rmsData.rms_contact_country) {
      suggestions.push('Add location information');
    }

    const score = Math.round((filledCount / fieldCount) * 100);

    return { score, missing, suggestions };
  }

  /**
   * Convert Unix timestamp to formatted date
   */
  static formatTimestamp(timestamp: number, format = 'MMMM YYYY'): string {
    const date = new Date(timestamp);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (format === 'MMMM YYYY') {
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    } else if (format === 'YYYY') {
      return date.getFullYear().toString();
    }

    return date.toLocaleDateString();
  }

  /**
   * Parse date string to timestamp
   */
  static parseDate(dateStr: string): number | null {
    if (!dateStr || dateStr === 'n/a' || dateStr === 'Present') {
      return null;
    }

    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.getTime();
  }

  /**
   * Sanitize and validate email
   */
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Format phone number
   */
  static formatPhone(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
  }

  /**
   * Generate search keywords from RMS data
   */
  static generateSearchKeywords(rmsData: RMSData): string[] {
    const keywords = new Set<string>();

    // Add name
    if (rmsData.rms_contact_fullName) {
      keywords.add(rmsData.rms_contact_fullName.toLowerCase());
    }

    // Add skills
    const skillCount = rmsData.rms_skill_count || 0;
    for (let i = 0; i < skillCount; i++) {
      const skillKeywords = rmsData[`rms_skill_${i}_keywords` as keyof RMSData] as string;
      if (skillKeywords) {
        skillKeywords.split(',').forEach(keyword => {
          keywords.add(keyword.trim().toLowerCase());
        });
      }
    }

    // Add job titles
    const expCount = rmsData.rms_experience_count || 0;
    for (let i = 0; i < expCount; i++) {
      const role = rmsData[`rms_experience_${i}_role` as keyof RMSData] as string;
      if (role) {
        keywords.add(role.toLowerCase());
      }
    }

    // Add education
    const eduCount = rmsData.rms_education_count || 0;
    for (let i = 0; i < eduCount; i++) {
      const qualification = rmsData[`rms_education_${i}_qualification` as keyof RMSData] as string;
      if (qualification) {
        keywords.add(qualification.toLowerCase());
      }
    }

    return Array.from(keywords);
  }
}