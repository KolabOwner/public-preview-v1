// This is a simplified PDF generator that will be expanded later
// with more advanced features like custom templates and styling

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { typographyConfig } from './typography-config';
import { generateResumePDFWithStyling } from './pdf-generator-html';

interface ResumeData {
  title: string;
  template?: string;
  fontSize?: 'small' | 'medium' | 'large';
  parsedData: {
    contactInfo?: {
      fullName?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      website?: string;
    };
    summary?: string;
    experiences?: Array<{
      company?: string;
      title?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description?: string;
    }>;
    education?: Array<{
      school?: string;
      degree?: string;
      fieldOfStudy?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      gpa?: string;
      description?: string;
    }>;
    skillCategories?: Array<{
      name?: string;
      skills?: Array<{
        name?: string;
        level?: string;
      }>;
    }>;
  };
}

export function generateResumePDF(resumeData: ResumeData): Blob {
  // Always use the new styled PDF generator
  return generateResumePDFWithStyling(resumeData);
}