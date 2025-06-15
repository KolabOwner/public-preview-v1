// HTML-based PDF generator that replicates the styling from the Puppeteer template


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
      city?: string;
      state?: string;
      country?: string;
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
      highlights?: string[];
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
    projects?: Array<{
      title?: string;
      organization?: string;
      startDate?: string;
      endDate?: string;
      url?: string;
      description?: string;
      technologies?: string[];
    }>;
    certifications?: Array<{
      name?: string;
      organization?: string;
      date?: string;
      expiryDate?: string;
    }>;
    achievements?: string[];
  };
}

// Import the vector font generator
import { generateResumePDFWithVectorFonts } from "@/lib/features/pdf/generator/vector-fonts";

// Alternative: Generate PDF with better text rendering (server-side approach)
export function generateResumePDFWithStyling(resumeData: ResumeData): Blob {
  // Use the new vector font generator for better font quality
  return generateResumePDFWithVectorFonts(resumeData);
}
