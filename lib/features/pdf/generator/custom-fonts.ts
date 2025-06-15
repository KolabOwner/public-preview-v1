// lib/pdf-generator-custom.ts
// PDF generator with custom font support (Merriweather, etc.)

import { jsPDF } from 'jspdf';
import { addCustomFonts, FONT_PRESETS, getFontName } from "@/lib/features/pdf/generator/fonts/config";


interface ResumeData {
  title: string;
  template?: string;
  fontSize?: 'small' | 'medium' | 'large';
  fontStyle?: 'elegant' | 'modern' | 'classic' | 'professional';
  parsedData: any;
  rmsRawData?: any;
}

// Helper to format location
function formatLocation(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(', ');
}

// Helper to wrap text properly
function splitTextToLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = doc.getTextWidth(testLine);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Helper to parse bullet points from text
function parseBulletPoints(text: string): string[] {
  if (!text) return [];
  
  // Handle different bullet point formats
  const lines = text
    .split(/[\n•·\-\*]/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // If no bullet points found, treat the whole text as one item
  if (lines.length === 0 && text.trim()) {
    return [text.trim()];
  }
  
  return lines;
}

export async function generateResumePDFWithCustomFonts(resumeData: ResumeData): Promise<Blob> {
  const { parsedData, fontStyle = 'elegant' } = resumeData;
  const contactInfo = parsedData.contactInfo || {};
  
  // Create PDF with proper settings for custom fonts
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
    compress: true,
    putOnlyUsedFonts: true,
  });
  
  // Load custom fonts based on style
  let customFontsLoaded = false;
  if (fontStyle !== 'professional') {
    try {
      const fontFamily = fontStyle === 'modern' ? 'merriweatherSans' : 'merriweather';
      customFontsLoaded = await addCustomFonts(doc, fontFamily);
    } catch (error) {
      console.warn('Failed to load custom fonts, falling back to default fonts:', error);
    }
  }
  
  // Get font preset
  const preset = FONT_PRESETS[fontStyle];
  
  // Set margins
  const margins = {
    top: 36,
    right: 36,
    bottom: 36,
    left: 36
  };
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const contentWidth = pageWidth - margins.left - margins.right;
  let yPosition = margins.top;
  
  // Colors (using RGB for better compatibility)
  const colors = {
    text: { r: 51, g: 51, b: 51 },      // #333333
    black: { r: 0, g: 0, b: 0 },        // #000000
    gray: { r: 102, g: 102, b: 102 },   // #666666
    accent: { r: 0, g: 0, b: 0 }        // Can be customized
  };
  
  // Helper function to set font with custom font support
  const setFont = (fontDef: typeof preset.heading) => {
    const fontName = customFontsLoaded 
      ? getFontName(fontDef.family, fontDef.weight)
      : fontDef.family === 'merriweather' || fontDef.family === 'merriweatherSans' 
        ? 'helvetica' // Fallback if custom fonts failed
        : fontDef.family;
    
    doc.setFontSize(fontDef.size);
    
    if (customFontsLoaded && (fontDef.family === 'merriweather' || fontDef.family === 'merriweatherSans')) {
      // Use custom font
      doc.setFont(fontName);
    } else {
      // Use standard font with style
      const style = fontDef.weight >= 700 ? 'bold' : 'normal';
      doc.setFont(fontName, style);
    }
  };
  
  // Helper function to add text with proper font
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const fontDef = options.font || preset.body;
    setFont(fontDef);
    
    const color = options.color || colors.text;
    doc.setTextColor(color.r, color.g, color.b);
    
    const alignOptions: any = {};
    if (options.align) alignOptions.align = options.align;
    
    doc.text(text, x, y, alignOptions);
    return y + fontDef.size * 1.2;
  };
  
  // Helper to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, options: any = {}) => {
    const fontDef = options.font || preset.body;
    setFont(fontDef);
    
    const lines = splitTextToLines(doc, text, maxWidth);
    const lineHeight = fontDef.size * 1.2;
    
    lines.forEach((line, index) => {
      addText(line, x, y + (index * lineHeight), options);
    });
    
    return y + (lines.length * lineHeight);
  };
  
  // Add name (centered)
  const name = contactInfo.fullName || 'YOUR NAME';
  yPosition = addText(name.toUpperCase(), pageWidth / 2, yPosition, {
    font: preset.heading,
    color: colors.black,
    align: 'center'
  });
  
  yPosition += 6;
  
  // Add contact info (centered)
  const contactItems = [];
  const location = formatLocation(
    contactInfo.location,
    contactInfo.city,
    contactInfo.state,
    contactInfo.country
  );
  
  if (location) contactItems.push(location);
  if (contactInfo.email) contactItems.push(contactInfo.email);
  if (contactInfo.phone) contactItems.push(contactInfo.phone);
  if (contactInfo.linkedin) {
    const linkedinHandle = contactInfo.linkedin.replace(/^.*\/in\//, '');
    contactItems.push(`linkedin.com/in/${linkedinHandle}`);
  }
  if (contactInfo.website) contactItems.push(contactInfo.website);
  
  if (contactItems.length > 0) {
    const contactText = contactItems.join(' • ');
    yPosition = addText(contactText, pageWidth / 2, yPosition, {
      font: preset.accent,
      color: colors.gray,
      align: 'center'
    });
  }
  
  yPosition += 12;
  
  // Add section heading helper
  const addSectionHeading = (heading: string) => {
    // Check for page overflow
    if (yPosition > pageHeight - margins.bottom - 20) {
      doc.addPage();
      yPosition = margins.top;
    }
    
    yPosition += 8;
    setFont(preset.subheading);
    doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
    doc.text(heading.toUpperCase(), margins.left, yPosition);
    yPosition += 3;
    
    // Add underline
    doc.setLineWidth(0.75);
    doc.setDrawColor(colors.black.r, colors.black.g, colors.black.b);
    doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
    yPosition += 6;
  };
  
  // Professional Summary
  if (parsedData.summary) {
    addSectionHeading('PROFESSIONAL SUMMARY');
    yPosition = addWrappedText(parsedData.summary, margins.left, yPosition, contentWidth, {
      font: preset.body,
      color: colors.text
    });
    yPosition += 8;
  }
  
  // Experience
  if (parsedData.experiences && parsedData.experiences.length > 0) {
    addSectionHeading('PROFESSIONAL EXPERIENCE');
    
    parsedData.experiences.forEach((exp: any, index: number) => {
      // Check for page overflow
      if (yPosition > pageHeight - margins.bottom - 60) {
        doc.addPage();
        yPosition = margins.top;
      }
      
      // Job title
      yPosition = addText(exp.title || exp.role || '', margins.left, yPosition, {
        font: { ...preset.subheading, size: preset.subheading.size - 1 },
        color: colors.black
      });
      
      // Company, location, and dates
      const companyLine = [];
      if (exp.company) companyLine.push(exp.company);
      if (exp.location) companyLine.push(exp.location);
      
      const dateRange = [];
      if (exp.startDate) dateRange.push(exp.startDate);
      if (exp.current) {
        dateRange.push('Present');
      } else if (exp.endDate) {
        dateRange.push(exp.endDate);
      }
      
      if (companyLine.length > 0) {
        const leftText = companyLine.join(', ');
        const rightText = dateRange.join(' – '); // Em dash for dates
        
        addText(leftText, margins.left, yPosition, {
          font: preset.body,
          color: colors.text
        });
        
        if (rightText) {
          setFont(preset.accent);
          const textWidth = doc.getTextWidth(rightText);
          addText(rightText, pageWidth - margins.right - textWidth, yPosition, {
            font: preset.accent,
            color: colors.gray
          });
        }
        
        yPosition += preset.body.size * 1.2;
      }
      
      // Description or bullet points
      if (exp.description) {
        yPosition += 4;
        const bullets = parseBulletPoints(exp.description);
        
        bullets.forEach((bullet: string) => {
          // Bullet symbol
          addText('•', margins.left + 10, yPosition, {
            font: preset.body,
            color: colors.text
          });
          
          // Bullet text
          yPosition = addWrappedText(bullet, margins.left + 20, yPosition, contentWidth - 20, {
            font: preset.body,
            color: colors.text
          });
          yPosition += 2;
        });
      }
      
      if (index < parsedData.experiences.length - 1) {
        yPosition += 10;
      }
    });
    
    yPosition += 8;
  }
  
  // Education
  if (parsedData.education && parsedData.education.length > 0) {
    addSectionHeading('EDUCATION');
    
    parsedData.education.forEach((edu: any, index: number) => {
      // School name
      yPosition = addText(edu.school || edu.institution || '', margins.left, yPosition, {
        font: { ...preset.subheading, size: preset.subheading.size - 1 },
        color: colors.black
      });
      
      // Degree and date
      const degreeParts = [];
      if (edu.degree) degreeParts.push(edu.degree);
      if (edu.fieldOfStudy) degreeParts.push(edu.fieldOfStudy);
      
      if (degreeParts.length > 0) {
        const leftText = degreeParts.join(' in ');
        const rightText = edu.endDate || edu.graduationDate || '';
        
        addText(leftText, margins.left, yPosition, {
          font: preset.body,
          color: colors.text
        });
        
        if (rightText) {
          setFont(preset.accent);
          const textWidth = doc.getTextWidth(rightText);
          addText(rightText, pageWidth - margins.right - textWidth, yPosition, {
            font: preset.accent,
            color: colors.gray
          });
        }
        
        yPosition += preset.body.size * 1.2;
      }
      
      // Additional info
      const additionalInfo = [];
      if (edu.gpa) additionalInfo.push(`GPA: ${edu.gpa}`);
      if (edu.location) additionalInfo.push(edu.location);
      
      if (additionalInfo.length > 0) {
        yPosition = addText(additionalInfo.join(' • '), margins.left, yPosition, {
          font: preset.accent,
          color: colors.gray
        });
      }
      
      if (index < parsedData.education.length - 1) {
        yPosition += 8;
      }
    });
    
    yPosition += 8;
  }
  
  // Skills
  if (parsedData.skillCategories && parsedData.skillCategories.length > 0) {
    addSectionHeading('SKILLS');
    
    parsedData.skillCategories.forEach((category: any) => {
      const skillNames = category.skills.map((s: any) => s.name || s).join(', ');
      
      if (category.name && category.name !== 'Skills') {
        // Category name
        setFont({ ...preset.body, weight: 700 });
        const categoryWidth = doc.getTextWidth(category.name + ': ');
        doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
        doc.text(category.name + ': ', margins.left, yPosition);
        
        // Skills
        yPosition = addWrappedText(skillNames, margins.left + categoryWidth, yPosition, contentWidth - categoryWidth, {
          font: preset.body,
          color: colors.text
        });
      } else {
        yPosition = addWrappedText(skillNames, margins.left, yPosition, contentWidth, {
          font: preset.body,
          color: colors.text
        });
      }
      
      yPosition += 4;
    });
  }
  
  // Projects
  if (parsedData.projects && parsedData.projects.length > 0) {
    addSectionHeading('PROJECTS');
    
    parsedData.projects.forEach((project: any, index: number) => {
      yPosition = addText(project.title || '', margins.left, yPosition, {
        font: { ...preset.subheading, size: preset.subheading.size - 1 },
        color: colors.black
      });
      
      if (project.description) {
        yPosition = addWrappedText(project.description, margins.left, yPosition, contentWidth, {
          font: preset.body,
          color: colors.text
        });
      }
      
      if (index < parsedData.projects.length - 1) {
        yPosition += 6;
      }
    });
  }
  
  // Set document properties
  doc.setProperties({
    title: resumeData.title || 'Resume',
    author: contactInfo.fullName || 'Resume Owner',
    creator: 'Resume Builder Pro with RMS',
    keywords: 'resume, cv, professional',
  });
  
  return doc.output('blob');
}