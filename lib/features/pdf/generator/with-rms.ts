// lib/pdf-generator-with-rms.ts

import { generateResumePDFWithCustomFonts } from "@/lib/features/pdf/generator/custom-fonts";
import { generateResumePDFWithStyling } from "@/lib/features/pdf/generator/html-renderer";
import { formatResumeDataToRMS } from "@/lib/features/pdf/metadata/rms-formatter";
import { generateResumePDFWithVectorFonts } from "@/lib/features/pdf/generator/vector-fonts";


interface ResumeData {
  title: string;
  template?: string;
  fontSize?: 'small' | 'medium' | 'large';
  fontStyle?: 'elegant' | 'modern' | 'classic' | 'professional';
  parsedData: any;
  rmsRawData?: any;
}

/**
 * Generate a PDF with embedded RMS metadata
 */
export async function generateResumePDFWithRMS(resumeData: ResumeData): Promise<Blob> {
  try {
    console.log('[PDF Generator] Starting PDF generation with RMS metadata');
    
    // Step 1: Generate the base PDF with custom fonts or vector fonts
    const pdfBlob = resumeData.fontStyle && resumeData.fontStyle !== 'professional'
      ? await generateResumePDFWithCustomFonts(resumeData)
      : generateResumePDFWithStyling(resumeData);
    console.log(`[PDF Generator] Generated base PDF (${pdfBlob.size} bytes)`);
    
    // Step 2: Format resume data as RMS metadata
    const rmsMetadata = formatResumeDataToRMS(resumeData);
    console.log(`[PDF Generator] Formatted ${Object.keys(rmsMetadata).length} RMS metadata fields`);
    
    // Step 3: Call API to embed RMS metadata
    const formData = new FormData();
    formData.append('file', pdfBlob, 'resume.pdf');
    formData.append('metadata', JSON.stringify(rmsMetadata));
    
    console.log('[PDF Generator] Calling RMS write API...');
    const response = await fetch('/api/resume/write-rms', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('[PDF Generator] RMS write API error:', error);
      // Fall back to returning the PDF without metadata
      console.warn('[PDF Generator] Returning PDF without RMS metadata');
      return pdfBlob;
    }
    
    // Get the PDF with embedded metadata
    const pdfWithRMS = await response.blob();
    const fieldsWritten = response.headers.get('X-RMS-Fields-Written');
    console.log(`[PDF Generator] Successfully embedded ${fieldsWritten} RMS fields`);
    console.log(`[PDF Generator] Final PDF size: ${pdfWithRMS.size} bytes`);
    
    return pdfWithRMS;
    
  } catch (error) {
    console.error('[PDF Generator] Error generating PDF with RMS:', error);
    // Fall back to generating without RMS metadata
    console.warn('[PDF Generator] Falling back to PDF without RMS metadata');
    return generateResumePDFWithVectorFonts(resumeData);
  }
}
