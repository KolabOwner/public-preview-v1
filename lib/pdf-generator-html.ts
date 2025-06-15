// HTML-based PDF generator that replicates the styling from the Puppeteer template
import { jsPDF } from 'jspdf';
// Note: html2canvas might need to be imported differently or installed separately
// For now, we'll focus on the pure jsPDF implementation with enhanced styling

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

// Helper function to format dates
function formatDate(dateString?: string, current?: boolean): string {
  if (current) return 'Present';
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

// Helper function to format date range
function formatDateRange(startDate?: string, endDate?: string, current?: boolean): string {
  const start = formatDate(startDate);
  const end = current ? 'Present' : formatDate(endDate);
  
  if (start && end) {
    return `${start} — ${end}`;
  } else if (end) {
    return end;
  }
  return '';
}

// Helper function for location formatting
function formatLocation(location?: string, city?: string, state?: string, country?: string): string {
  const parts = [];
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (country && country !== 'United States') parts.push(country);
  if (parts.length > 0) return parts.join(', ');
  return location || '';
}

// Generate styled HTML content
export function generateResumeHtml(resumeData: ResumeData): string {
  const { parsedData } = resumeData;
  const contactInfo = parsedData.contactInfo || {};
  
  // Format location
  const location = formatLocation(
    contactInfo.location,
    contactInfo.city,
    contactInfo.state,
    contactInfo.country
  );

  // SVG Icons (simplified versions)
  const icons = {
    location: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" style="fill: #333; margin-right: 4px; vertical-align: middle;"><path d="M12 1.1C7.6 1.1 4.1 4.6 4.1 9c0 5.4 7.1 13.3 7.4 13.7.3.3.8.3 1.1 0S20 14.4 20 9c-.1-4.4-3.6-7.9-8-7.9M12 13c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4"></path></svg>',
    email: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" style="fill: #333; margin-right: 4px; vertical-align: middle;"><path d="M20.016 8.016V6L12 11.016 3.984 6v2.016L12 12.985zm0-4.032q.797 0 1.383.609t.586 1.406v12q0 .797-.586 1.406t-1.383.609H3.985q-.797 0-1.383-.609t-.586-1.406v-12q0-.797.586-1.406t1.383-.609z"></path></svg>',
    phone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" style="fill: #333; margin-right: 4px; vertical-align: middle;"><path d="M19.5 0h-15A1.5 1.5 0 0 0 3 1.5v21A1.5 1.5 0 0 0 4.5 24h15a1.5 1.5 0 0 0 1.5-1.5v-21A1.5 1.5 0 0 0 19.5 0M18 18H6V3h12z"></path></svg>',
    linkedin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" style="fill: #333; margin-right: 4px; vertical-align: middle;"><path d="M21.75 0H2.25A2.257 2.257 0 0 0 0 2.25v19.5A2.257 2.257 0 0 0 2.25 24h19.5A2.257 2.257 0 0 0 24 21.75V2.25A2.257 2.257 0 0 0 21.75 0M9 19.5H6V9h3zm-1.5-12C6.67 7.5 6 6.83 6 6s.67-1.5 1.5-1.5S9 5.17 9 6s-.67 1.5-1.5 1.5m12 12h-3v-6c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v6h-3V9h3v1.861C14.119 10.013 15.066 9 16.125 9c1.866 0 3.375 1.678 3.375 3.75z"></path></svg>'
  };

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${contactInfo.fullName || 'Resume'}</title>
      <style>
        /* Base styles - matching the Puppeteer template */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Times New Roman', Times, serif;
        }
        
        body {
          background: white;
          color: #333333;
          line-height: 1.3;
          font-size: 9.5pt;
        }
        
        .document-container {
          width: 816px;
          padding: 0.4in 0.4in;
          background: white;
          box-sizing: border-box;
          margin: 0 auto;
        }
        
        /* Header */
        .header {
          text-align: center;
          margin-bottom: 8px;
        }
        
        .name {
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        
        .contact-info {
          display: flex;
          justify-content: center;
          gap: 8px;
          font-size: 9.5pt;
          color: #333333;
          flex-wrap: wrap;
        }
        
        .contact-item {
          display: inline-flex;
          align-items: center;
        }
        
        /* Section headings */
        .section-heading {
          font-weight: bold;
          font-size: 10pt;
          text-transform: uppercase;
          margin-top: 10px;
          margin-bottom: 4px;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
        }
        
        /* Experience blocks */
        .job-title {
          font-weight: bold;
          margin-top: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 10pt;
        }
        
        .company {
          margin-bottom: 1px;
          font-size: 9.5pt;
        }
        
        .date {
          text-align: right;
          font-size: 9.5pt;
        }
        
        .bullet-list {
          padding-left: 12px;
          margin-top: 1px;
        }
        
        .bullet-list li {
          list-style-type: none;
          position: relative;
          margin-bottom: 3px;
          line-height: 1.3;
          font-family: 'Times New Roman', Times, serif;
          font-weight: 400;
          font-size: 9.5pt;
          color: #333333;
          padding-left: 2px;
        }
        
        .bullet-list li:before {
          content: "•";
          position: absolute;
          left: -10px;
          color: #333333;
        }
        
        /* Education and other sections */
        .education-block {
          margin-top: 4px;
        }
        
        .degree {
          font-weight: bold;
          font-size: 9.5pt;
        }
        
        .school-info {
          display: flex;
          justify-content: space-between;
          line-height: 1.3;
          font-size: 9.5pt;
        }
        
        /* Skills section */
        .skills-category {
          margin-top: 4px;
          margin-bottom: 4px;
          line-height: 1.3;
          font-weight: 400;
          color: #333333;
          font-size: 9.5pt;
        }
        
        .skills-title {
          font-weight: bold;
          display: inline;
        }
        
        /* Projects section */
        .project-block {
          margin-top: 6px;
        }
        
        .project-title {
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          font-size: 10pt;
        }
        
        .project-details {
          font-size: 9.5pt;
          margin-bottom: 1px;
        }
        
        /* Certifications section */
        .certification-item {
          margin-bottom: 3px;
          line-height: 1.3;
          font-size: 9.5pt;
        }
        
        /* Achievements section */
        .achievement-list {
          padding-left: 12px;
          margin-top: 1px;
        }
        
        .achievement-list li {
          list-style-type: none;
          position: relative;
          margin-bottom: 3px;
          line-height: 1.3;
          font-family: 'Times New Roman', Times, serif;
          font-weight: 400;
          font-size: 9.5pt;
          color: #333333;
          padding-left: 2px;
        }
        
        .achievement-list li:before {
          content: "•";
          position: absolute;
          left: -10px;
          color: #333333;
        }
        
        /* Summary section */
        .summary-text {
          margin-top: 3px;
          margin-bottom: 8px;
          line-height: 1.3;
          color: #333333;
          font-weight: 400;
          font-size: 9.5pt;
        }
        
        /* Print optimization */
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .document-container {
            width: 100%;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="document-container">
        <!-- Header -->
        <div class="header">
          <div class="name">${contactInfo.fullName || 'YOUR NAME'}</div>
          <div class="contact-info">
            ${location ? `
              <span class="contact-item">
                ${icons.location}
                ${location}
              </span>
              <span>•</span>
            ` : ''}
            ${contactInfo.email ? `
              <span class="contact-item">
                ${icons.email}
                ${contactInfo.email}
              </span>
              ${contactInfo.phone || contactInfo.linkedin || contactInfo.website ? '<span>•</span>' : ''}
            ` : ''}
            ${contactInfo.phone ? `
              <span class="contact-item">
                ${icons.phone}
                ${contactInfo.phone}
              </span>
              ${contactInfo.linkedin || contactInfo.website ? '<span>•</span>' : ''}
            ` : ''}
            ${contactInfo.linkedin ? `
              <span class="contact-item">
                ${icons.linkedin}
                linkedin.com/in/${contactInfo.linkedin.replace(/^.*\/in\//, '')}
              </span>
              ${contactInfo.website ? '<span>•</span>' : ''}
            ` : ''}
            ${contactInfo.website ? `
              <span class="contact-item">
                ${contactInfo.website}
              </span>
            ` : ''}
          </div>
        </div>
        
        ${parsedData.summary ? `
          <!-- Summary Section -->
          <div class="section-heading">PROFESSIONAL SUMMARY</div>
          <p class="summary-text">${parsedData.summary}</p>
        ` : ''}
        
        ${parsedData.experiences && parsedData.experiences.length > 0 ? `
          <!-- Experience Section -->
          <div class="section-heading">EXPERIENCE</div>
          ${parsedData.experiences.map(job => `
            <div class="job-title">${job.title || 'Position'}</div>
            <div class="company" style="overflow: hidden;">
              <span style="float: left;">${job.company || 'Company'}</span>
              <span class="date" style="float: right;">${formatDateRange(job.startDate, job.endDate, job.current)}${job.location ? `, ${job.location}` : ''}</span>
            </div>
            ${job.highlights && job.highlights.length > 0 ? `
              <ul class="bullet-list">
                ${job.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
              </ul>
            ` : job.description ? `
              <ul class="bullet-list">
                ${job.description.split('•').map(point => point.trim()).filter(Boolean).map(point => `<li>${point}</li>`).join('')}
              </ul>
            ` : ''}
          `).join('')}
        ` : ''}
        
        ${parsedData.education && parsedData.education.length > 0 ? `
          <!-- Education Section -->
          <div class="section-heading">EDUCATION</div>
          ${parsedData.education.map(edu => `
            <div class="education-block">
              <div class="degree">${edu.degree || 'Degree'}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</div>
              <div class="school-info">
                <div>${edu.school || 'School'}${edu.location ? ` • ${edu.location}` : ''}</div>
                <div>${formatDateRange(edu.startDate, edu.endDate, edu.current)}</div>
              </div>
              ${edu.gpa ? `<div style="font-size: 9.5pt;">GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        ` : ''}
        
        ${parsedData.skillCategories && parsedData.skillCategories.length > 0 ? `
          <!-- Skills Section -->
          <div class="section-heading">SKILLS</div>
          ${parsedData.skillCategories.map(category => `
            <div class="skills-category">
              <span class="skills-title">${category.name || 'Skills'}:</span>
              <span>${category.skills?.map(s => s.name).filter(Boolean).join(', ') || ''}</span>
            </div>
          `).join('')}
        ` : ''}
        
        ${parsedData.projects && parsedData.projects.length > 0 ? `
          <!-- Projects Section -->
          <div class="section-heading">PROJECTS</div>
          ${parsedData.projects.map(project => `
            <div class="project-block">
              <div class="project-title">
                <span>${project.title || 'Project'}</span>
                <span class="date">${formatDateRange(project.startDate, project.endDate)}</span>
              </div>
              ${project.organization ? `
                <div class="project-details">${project.organization}</div>
              ` : ''}
              ${project.description ? `
                <ul class="bullet-list">
                  ${project.description.split('•').map(point => point.trim()).filter(Boolean).map(point => `<li>${point}</li>`).join('')}
                </ul>
              ` : ''}
              ${project.technologies && project.technologies.length > 0 ? `
                <div class="project-details" style="margin-top: 2px;">
                  <strong>Technologies:</strong> ${project.technologies.join(', ')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        ` : ''}
        
        ${parsedData.achievements && parsedData.achievements.length > 0 ? `
          <!-- Achievements Section -->
          <div class="section-heading">KEY ACHIEVEMENTS</div>
          <ul class="achievement-list">
            ${parsedData.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
          </ul>
        ` : ''}
        
        ${parsedData.certifications && parsedData.certifications.length > 0 ? `
          <!-- Certifications Section -->
          <div class="section-heading">CERTIFICATIONS</div>
          ${parsedData.certifications.map(cert => `
            <div class="certification-item">
              <span style="font-weight: bold;">${cert.name}</span>
              ${cert.organization ? ` • ${cert.organization}` : ''}
              ${cert.date ? ` • ${cert.date}` : ''}
              ${cert.expiryDate ? ` • Expires: ${cert.expiryDate}` : ''}
            </div>
          `).join('')}
        ` : ''}
      </div>
    </body>
    </html>
  `;

  return html;
}

// Generate PDF using HTML content
export async function generateResumePDFFromHtml(resumeData: ResumeData): Promise<Blob> {
  // Generate the HTML
  const html = generateResumeHtml(resumeData);
  
  // Create a temporary container to render the HTML
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = html;
  document.body.appendChild(container);
  
  try {
    // Use html2canvas to convert HTML to canvas
    const canvas = await html2canvas(container.querySelector('.document-container') as HTMLElement, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Convert canvas to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    });
    
    // Calculate dimensions
    const imgWidth = 612; // Letter width in points
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Clean up
    document.body.removeChild(container);
    
    // Return as blob
    return pdf.output('blob');
  } catch (error) {
    // Clean up on error
    document.body.removeChild(container);
    throw error;
  }
}

// Import the vector font generator
import { generateResumePDFWithVectorFonts } from './pdf-generator-vector';

// Alternative: Generate PDF with better text rendering (server-side approach)
export function generateResumePDFWithStyling(resumeData: ResumeData): Blob {
  // Use the new vector font generator for better font quality
  return generateResumePDFWithVectorFonts(resumeData);
}

// Legacy function - kept for backward compatibility but uses vector fonts
export function generateResumePDFWithStylingLegacy(resumeData: ResumeData): Blob {
  const { parsedData } = resumeData;
  const contactInfo = parsedData.contactInfo || {};
  
  // Create PDF with Letter format
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });
  
  // Set margins (0.4 inches = 28.8pt)
  const margins = {
    top: 28.8,
    right: 28.8,
    bottom: 28.8,
    left: 28.8
  };
  
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - margins.left - margins.right;
  let yPosition = margins.top;
  
  // Font settings matching the HTML template
  const fonts = {
    name: { size: 16, weight: 'bold' },
    sectionHeading: { size: 10, weight: 'bold' },
    jobTitle: { size: 10, weight: 'bold' },
    body: { size: 9.5, weight: 'normal' },
    small: { size: 9.5, weight: 'normal' }
  };
  
  // Colors
  const colors = {
    text: '#333333',
    black: '#000000'
  };
  
  // Helper function to add text with proper styling
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    doc.setFontSize(options.size || fonts.body.size);
    doc.setFont('times', options.weight || 'normal');
    doc.setTextColor(options.color || colors.text);
    doc.text(text, x, y, options);
    return y + (options.size || fonts.body.size) * 1.3;
  };
  
  // Add name (centered, uppercase)
  const name = (contactInfo.fullName || 'YOUR NAME').toUpperCase();
  yPosition = addText(name, pageWidth / 2, yPosition, {
    size: fonts.name.size,
    weight: fonts.name.weight,
    align: 'center'
  });
  
  yPosition += 4; // Small gap
  
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
  if (contactInfo.linkedin) contactItems.push(`linkedin.com/in/${contactInfo.linkedin.replace(/^.*\/in\//, '')}`);
  if (contactInfo.website) contactItems.push(contactInfo.website);
  
  if (contactItems.length > 0) {
    yPosition = addText(contactItems.join(' • '), pageWidth / 2, yPosition, {
      size: fonts.small.size,
      align: 'center'
    });
  }
  
  yPosition += 8; // Section gap
  
  // Add section heading helper
  const addSectionHeading = (heading: string) => {
    yPosition += 10; // Top margin
    doc.setFontSize(fonts.sectionHeading.size);
    doc.setFont('times', fonts.sectionHeading.weight);
    doc.setTextColor(colors.black);
    doc.text(heading.toUpperCase(), margins.left, yPosition);
    yPosition += 2;
    // Add underline
    doc.setLineWidth(0.5);
    doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
    yPosition += 4;
  };
  
  // Professional Summary
  if (parsedData.summary) {
    addSectionHeading('PROFESSIONAL SUMMARY');
    const summaryLines = doc.splitTextToSize(parsedData.summary, contentWidth);
    doc.setFontSize(fonts.body.size);
    doc.setFont('times', 'normal');
    doc.text(summaryLines, margins.left, yPosition);
    yPosition += summaryLines.length * fonts.body.size * 1.3 + 8;
  }
  
  // Experience
  if (parsedData.experiences && parsedData.experiences.length > 0) {
    addSectionHeading('EXPERIENCE');
    
    parsedData.experiences.forEach((job) => {
      // Job title
      doc.setFontSize(fonts.jobTitle.size);
      doc.setFont('times', fonts.jobTitle.weight);
      doc.text(job.title || 'Position', margins.left, yPosition);
      yPosition += fonts.jobTitle.size * 1.3;
      
      // Company on left, date and location on right
      doc.setFontSize(fonts.body.size);
      doc.setFont('times', 'normal');
      doc.text(job.company || 'Company', margins.left, yPosition);
      
      const dateText = formatDateRange(job.startDate, job.endDate, job.current);
      const locationDateText = dateText + (job.location ? `, ${job.location}` : '');
      if (locationDateText) {
        const textWidth = doc.getTextWidth(locationDateText);
        doc.text(locationDateText, pageWidth - margins.right - textWidth, yPosition);
      }
      yPosition += fonts.body.size * 1.3 + 1;
      
      // Highlights or description
      const bulletIndent = margins.left + 12;
      if (job.highlights && job.highlights.length > 0) {
        job.highlights.forEach((highlight) => {
          doc.text('•', margins.left + 2, yPosition);
          const highlightLines = doc.splitTextToSize(highlight, contentWidth - 12);
          doc.text(highlightLines, bulletIndent, yPosition);
          yPosition += highlightLines.length * fonts.body.size * 1.3 + 3;
        });
      } else if (job.description) {
        // Parse bullet points separated by • character
        const bulletPoints = job.description.split('•').map((point: string) => point.trim()).filter(Boolean);
        bulletPoints.forEach((point) => {
          doc.text('•', margins.left + 2, yPosition);
          const pointLines = doc.splitTextToSize(point, contentWidth - 12);
          doc.text(pointLines, bulletIndent, yPosition);
          yPosition += pointLines.length * fonts.body.size * 1.3 + 3;
        });
      }
      
      yPosition += 3; // Extra space between jobs
    });
  }
  
  // Education
  if (parsedData.education && parsedData.education.length > 0) {
    addSectionHeading('EDUCATION');
    
    parsedData.education.forEach((edu) => {
      // Degree
      doc.setFontSize(fonts.body.size);
      doc.setFont('times', 'bold');
      const degreeText = `${edu.degree || 'Degree'}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}`;
      doc.text(degreeText, margins.left, yPosition);
      yPosition += fonts.body.size * 1.3;
      
      // School and dates
      doc.setFont('times', 'normal');
      const schoolText = `${edu.school || 'School'}${edu.location ? ` • ${edu.location}` : ''}`;
      doc.text(schoolText, margins.left, yPosition);
      
      const eduDateText = formatDateRange(edu.startDate, edu.endDate, edu.current);
      if (eduDateText) {
        const dateWidth = doc.getTextWidth(eduDateText);
        doc.text(eduDateText, pageWidth - margins.right - dateWidth, yPosition);
      }
      yPosition += fonts.body.size * 1.3;
      
      // GPA if present
      if (edu.gpa) {
        doc.text(`GPA: ${edu.gpa}`, margins.left, yPosition);
        yPosition += fonts.body.size * 1.3;
      }
      
      yPosition += 4; // Extra space between education entries
    });
  }
  
  // Skills
  if (parsedData.skillCategories && parsedData.skillCategories.length > 0) {
    addSectionHeading('SKILLS');
    
    parsedData.skillCategories.forEach((category) => {
      if (!category.skills || category.skills.length === 0) return;
      
      // Category name in bold
      doc.setFont('times', 'bold');
      doc.text(`${category.name || 'Skills'}:`, margins.left, yPosition);
      
      // Skills list
      doc.setFont('times', 'normal');
      const skillsText = category.skills.map(s => s.name).filter(Boolean).join(', ');
      const categoryWidth = doc.getTextWidth(`${category.name || 'Skills'}: `);
      const skillsLines = doc.splitTextToSize(skillsText, contentWidth - categoryWidth);
      
      // First line continues after category name
      if (skillsLines.length > 0) {
        doc.text(skillsLines[0], margins.left + categoryWidth, yPosition);
        yPosition += fonts.body.size * 1.3;
        
        // Additional lines
        for (let i = 1; i < skillsLines.length; i++) {
          doc.text(skillsLines[i], margins.left, yPosition);
          yPosition += fonts.body.size * 1.3;
        }
      }
      
      yPosition += 4; // Space between skill categories
    });
  }
  
  // Projects
  if (parsedData.projects && parsedData.projects.length > 0) {
    addSectionHeading('PROJECTS');
    
    parsedData.projects.forEach((project) => {
      // Project title and dates
      doc.setFontSize(fonts.jobTitle.size);
      doc.setFont('times', 'bold');
      doc.text(project.title || 'Project', margins.left, yPosition);
      
      const projectDateText = formatDateRange(project.startDate, project.endDate);
      if (projectDateText) {
        const dateWidth = doc.getTextWidth(projectDateText);
        doc.text(projectDateText, pageWidth - margins.right - dateWidth, yPosition);
      }
      yPosition += fonts.jobTitle.size * 1.3;
      
      // Organization
      if (project.organization) {
        doc.setFontSize(fonts.body.size);
        doc.setFont('times', 'normal');
        doc.text(project.organization, margins.left, yPosition);
        yPosition += fonts.body.size * 1.3;
      }
      
      // Description
      if (project.description) {
        // Parse bullet points separated by • character
        const bulletPoints = project.description.split('•').map((point: string) => point.trim()).filter(Boolean);
        bulletPoints.forEach((point) => {
          doc.text('•', margins.left + 2, yPosition);
          const pointLines = doc.splitTextToSize(point, contentWidth - 12);
          doc.text(pointLines, margins.left + 12, yPosition);
          yPosition += pointLines.length * fonts.body.size * 1.3 + 2;
        });
      }
      
      // Technologies
      if (project.technologies && project.technologies.length > 0) {
        doc.setFont('times', 'bold');
        doc.text('Technologies:', margins.left, yPosition);
        doc.setFont('times', 'normal');
        const techText = project.technologies.join(', ');
        const techLabelWidth = doc.getTextWidth('Technologies: ');
        doc.text(techText, margins.left + techLabelWidth, yPosition);
        yPosition += fonts.body.size * 1.3;
      }
      
      yPosition += 3; // Extra space between projects
    });
  }
  
  // Achievements
  if (parsedData.achievements && parsedData.achievements.length > 0) {
    addSectionHeading('KEY ACHIEVEMENTS');
    
    parsedData.achievements.forEach((achievement) => {
      doc.text('•', margins.left + 2, yPosition);
      const achievementLines = doc.splitTextToSize(achievement, contentWidth - 12);
      doc.text(achievementLines, margins.left + 12, yPosition);
      yPosition += achievementLines.length * fonts.body.size * 1.3 + 3;
    });
  }
  
  // Certifications
  if (parsedData.certifications && parsedData.certifications.length > 0) {
    addSectionHeading('CERTIFICATIONS');
    
    parsedData.certifications.forEach((cert) => {
      doc.setFont('times', 'bold');
      doc.text(cert.name || 'Certification', margins.left, yPosition);
      
      doc.setFont('times', 'normal');
      const certDetails = [];
      if (cert.organization) certDetails.push(cert.organization);
      if (cert.date) certDetails.push(cert.date);
      if (cert.expiryDate) certDetails.push(`Expires: ${cert.expiryDate}`);
      
      if (certDetails.length > 0) {
        const detailsText = ` • ${certDetails.join(' • ')}`;
        const nameWidth = doc.getTextWidth(cert.name || 'Certification');
        doc.text(detailsText, margins.left + nameWidth, yPosition);
      }
      
      yPosition += fonts.body.size * 1.3 + 3;
    });
  }
  
  // Check for page overflow and add new pages as needed
  if (yPosition > doc.internal.pageSize.height - margins.bottom) {
    doc.addPage();
    yPosition = margins.top;
  }
  
  return doc.output('blob');
}