// lib/pdf-generator-vector.ts

import { jsPDF } from 'jspdf';

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

export function generateResumePDFWithVectorFonts(resumeData: ResumeData): Blob {
  const { parsedData } = resumeData;
  const contactInfo = parsedData.contactInfo || {};
  
  // Create PDF with proper settings for vector fonts
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
    compress: true, // Enable compression
    putOnlyUsedFonts: true, // Only embed used fonts
  });
  
  // Enable font subsetting for smaller file size
  doc.internal.scaleFactor = 1.33;
  
  // Set margins (0.5 inches = 36pt for better readability)
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
  
  // Font configuration with proper embedding
  const fonts = {
    name: { size: 18, family: 'helvetica', style: 'bold' },
    sectionHeading: { size: 11, family: 'helvetica', style: 'bold' },
    jobTitle: { size: 11, family: 'helvetica', style: 'bold' },
    body: { size: 10, family: 'helvetica', style: 'normal' },
    small: { size: 9, family: 'helvetica', style: 'normal' }
  };
  
  // Colors (using RGB for better compatibility)
  const colors = {
    text: { r: 51, g: 51, b: 51 }, // #333333
    black: { r: 0, g: 0, b: 0 },     // #000000
    gray: { r: 102, g: 102, b: 102 } // #666666
  };
  
  // Helper function to add text with proper font embedding
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const font = options.font || fonts.body;
    doc.setFontSize(font.size);
    doc.setFont(font.family, font.style);
    
    const color = options.color || colors.text;
    doc.setTextColor(color.r, color.g, color.b);
    
    // Handle alignment
    const alignOptions: any = {};
    if (options.align) alignOptions.align = options.align;
    
    doc.text(text, x, y, alignOptions);
    return y + font.size * 1.2;
  };
  
  // Helper to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, options: any = {}) => {
    const font = options.font || fonts.body;
    doc.setFontSize(font.size);
    doc.setFont(font.family, font.style);
    
    const lines = splitTextToLines(doc, text, maxWidth);
    const lineHeight = font.size * 1.2;
    
    lines.forEach((line, index) => {
      addText(line, x, y + (index * lineHeight), options);
    });
    
    return y + (lines.length * lineHeight);
  };
  
  // Add name (centered)
  const name = contactInfo.fullName || 'YOUR NAME';
  yPosition = addText(name.toUpperCase(), pageWidth / 2, yPosition, {
    font: fonts.name,
    color: colors.black,
    align: 'center'
  });
  
  yPosition += 6; // Small gap
  
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
      font: fonts.small,
      color: colors.gray,
      align: 'center'
    });
  }
  
  yPosition += 12; // Section gap
  
  // Add section heading helper
  const addSectionHeading = (heading: string) => {
    // Check for page overflow
    if (yPosition > pageHeight - margins.bottom - 20) {
      doc.addPage();
      yPosition = margins.top;
    }
    
    yPosition += 8; // Top margin
    doc.setFontSize(fonts.sectionHeading.size);
    doc.setFont(fonts.sectionHeading.family, fonts.sectionHeading.style);
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
      font: fonts.body,
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
      
      // Job title and company
      yPosition = addText(exp.title || exp.role || '', margins.left, yPosition, {
        font: fonts.jobTitle,
        color: colors.black
      });
      
      // Company, location, and dates on same line
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
        const rightText = dateRange.join(' - ');
        
        // Left aligned company info
        addText(leftText, margins.left, yPosition, {
          font: fonts.body,
          color: colors.text
        });
        
        // Right aligned dates
        if (rightText) {
          doc.setFontSize(fonts.body.size);
          doc.setFont(fonts.body.family, fonts.body.style);
          const textWidth = doc.getTextWidth(rightText);
          addText(rightText, pageWidth - margins.right - textWidth, yPosition, {
            font: fonts.body,
            color: colors.gray
          });
        }
        
        yPosition += fonts.body.size * 1.2;
      }
      
      // Description or bullet points
      if (exp.description) {
        yPosition += 4; // Small gap before bullets
        
        // Parse bullet points
        const bullets = parseBulletPoints(exp.description);
        
        bullets.forEach((bullet: string) => {
          // Add bullet symbol
          addText('•', margins.left + 10, yPosition, {
            font: fonts.body,
            color: colors.text
          });
          
          // Add bullet text (wrapped)
          yPosition = addWrappedText(bullet, margins.left + 20, yPosition, contentWidth - 20, {
            font: fonts.body,
            color: colors.text
          });
          yPosition += 2; // Small gap between bullets
        });
      }
      
      if (index < parsedData.experiences.length - 1) {
        yPosition += 10; // Gap between experiences
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
        font: fonts.jobTitle,
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
          font: fonts.body,
          color: colors.text
        });
        
        if (rightText) {
          doc.setFontSize(fonts.body.size);
          doc.setFont(fonts.body.family, fonts.body.style);
          const textWidth = doc.getTextWidth(rightText);
          addText(rightText, pageWidth - margins.right - textWidth, yPosition, {
            font: fonts.body,
            color: colors.gray
          });
        }
        
        yPosition += fonts.body.size * 1.2;
      }
      
      // Additional info (GPA, location, etc.)
      const additionalInfo = [];
      if (edu.gpa) additionalInfo.push(`GPA: ${edu.gpa}`);
      if (edu.location) additionalInfo.push(edu.location);
      
      if (additionalInfo.length > 0) {
        yPosition = addText(additionalInfo.join(' • '), margins.left, yPosition, {
          font: fonts.small,
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
        // Category name in bold
        doc.setFontSize(fonts.body.size);
        doc.setFont(fonts.body.family, 'bold');
        doc.setTextColor(colors.black.r, colors.black.g, colors.black.b);
        const categoryWidth = doc.getTextWidth(category.name + ': ');
        doc.text(category.name + ': ', margins.left, yPosition);
        
        // Skills in normal text
        yPosition = addWrappedText(skillNames, margins.left + categoryWidth, yPosition, contentWidth - categoryWidth, {
          font: fonts.body,
          color: colors.text
        });
      } else {
        // Just skills without category
        yPosition = addWrappedText(skillNames, margins.left, yPosition, contentWidth, {
          font: fonts.body,
          color: colors.text
        });
      }
      
      yPosition += 4;
    });
  }
  
  // Projects (if any)
  if (parsedData.projects && parsedData.projects.length > 0) {
    addSectionHeading('PROJECTS');
    
    parsedData.projects.forEach((project: any, index: number) => {
      // Project title
      yPosition = addText(project.title || '', margins.left, yPosition, {
        font: fonts.jobTitle,
        color: colors.black
      });
      
      // Description
      if (project.description) {
        yPosition = addWrappedText(project.description, margins.left, yPosition, contentWidth, {
          font: fonts.body,
          color: colors.text
        });
      }
      
      if (index < parsedData.projects.length - 1) {
        yPosition += 6;
      }
    });
  }
  
  // Set document properties for better compatibility
  doc.setProperties({
    title: resumeData.title || 'Resume',
    author: contactInfo.fullName || 'Resume Owner',
    creator: 'Resume Builder Pro with RMS',
    keywords: 'resume, cv, professional',
  });
  
  // Return the PDF as blob
  return doc.output('blob');
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