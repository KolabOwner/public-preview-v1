// This is a simplified PDF generator that will be expanded later
// with more advanced features like custom templates and styling

import 'jspdf-autotable';
import { generateResumePDFWithVectorFonts } from "@/lib/features/pdf/generator/vector-fonts";
import { generateResumePDFWithRMS } from "@/lib/features/pdf/generator/with-rms";
import { generateResumePDFWithCustomFonts } from "@/lib/features/pdf/generator/custom-fonts";



interface ResumeData {
  title: string;
  template?: string;
  fontSize?: 'small' | 'medium' | 'large';
  fontStyle?: 'elegant' | 'modern' | 'classic' | 'professional';
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
  // Use vector fonts for better quality
  return generateResumePDFWithVectorFonts(resumeData);
}

// Export async version with RMS metadata embedding and custom fonts
export async function generateResumePDFAsync(resumeData: ResumeData): Promise<Blob> {
  // Check if we're in a browser environment (where API calls work)
  if (typeof window !== 'undefined') {
    try {
      // Try to generate with RMS metadata and custom fonts
      return await generateResumePDFWithRMS(resumeData);
    } catch (error) {
      console.warn('Failed to generate PDF with RMS metadata, falling back to custom fonts:', error);
    }
  }
  
  // Fall back to custom fonts if supported, otherwise vector fonts
  if (resumeData.fontStyle && resumeData.fontStyle !== 'professional') {
    try {
      return await generateResumePDFWithCustomFonts(resumeData);
    } catch (error) {
      console.warn('Failed to load custom fonts, falling back to vector fonts:', error);
    }
  }
  
  // Final fallback to vector fonts
  return generateResumePDFWithVectorFonts(resumeData);
}