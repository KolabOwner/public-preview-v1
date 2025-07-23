#!/usr/bin/env node

/**
 * Resume Modern Format Generator Script
 * 
 * This script generates a comprehensive, modern resume template
 * using the same styling and components as the resume preview system.
 * 
 * Features:
 * - Professional summary
 * - Three+ experience items
 * - Education section
 * - Skills with 4+ categories
 * - Projects and involvement
 * - PDF generation using Puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Comprehensive resume data that follows the application's data structure
const MODERN_RESUME_DATA = {
  contact: {
    fullName: "Alex Chen",
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen@email.com",
    phone: "(555) 789-0123",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    linkedin: "linkedin.com/in/alex-chen-engineer"
  },

  summary: "Senior Software Engineer with 8+ years of experience building scalable systems and leading high-performing teams. Expert in full-stack development, cloud architecture, and DevOps practices. Proven track record of delivering mission-critical applications, mentoring junior engineers, and driving technical excellence across organizations.",

  experiences: [
    {
      id: "exp1",
      position: "Senior Software Engineer",
      company: "CloudScale Technologies",
      location: "San Francisco, CA",
      dateBegin: "2022-03-01",
      dateEnd: "Present",
      description: "Lead development of microservices architecture serving 10M+ daily users, improving system performance by 40% and reducing infrastructure costs by $2M annually. • Architect and implement distributed systems using Kubernetes, Docker, and AWS, ensuring 99.9% uptime for mission-critical applications. • Mentor team of 6 junior engineers, establishing code review standards and technical best practices that reduced bug reports by 35% and improved deployment velocity by 50%. • Drive architectural decisions for scalable backend systems, implementing event-driven architecture that handles 1B+ daily transactions with sub-100ms latency."
    },
    {
      id: "exp2", 
      position: "Software Engineer",
      company: "DataFlow Systems",
      location: "San Francisco, CA",
      dateBegin: "2019-06-01",
      dateEnd: "2022-02-28",
      description: "Developed scalable data processing pipelines handling 500TB+ daily throughput using Python, Apache Spark, and Kafka, enabling real-time analytics for enterprise clients. • Built RESTful APIs and GraphQL services used by 50+ internal applications, implementing authentication, rate limiting, and comprehensive monitoring solutions. • Led migration from monolithic architecture to microservices, reducing deployment time from 2 hours to 15 minutes and improving system reliability. • Collaborated with product managers and designers to deliver user-facing features for web and mobile applications, serving over 1M active users. • Implemented automated testing frameworks achieving 95% code coverage and reducing production incidents by 60%."
    },
    {
      id: "exp3",
      position: "Software Engineer",
      company: "TechStart Inc",
      location: "Palo Alto, CA", 
      dateBegin: "2017-01-15",
      dateEnd: "2019-05-31",
      description: "Developed full-stack applications using React, Node.js, and PostgreSQL, delivering core product features that increased user engagement by 25%. • Implemented automated testing frameworks and CI/CD pipelines, reducing manual testing time by 60% and achieving 95% code coverage across all modules. • Optimized database queries and application performance, reducing page load times by 45% and improving overall user experience metrics. • Contributed to open-source projects and maintained internal development tools used by 20+ engineers across the organization."
    }
  ],

  education: [
    {
      id: "edu1",
      qualification: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      institution: "Stanford University",
      location: "Stanford, CA",
      date: "2016-06-01",
      dateFormat: "YYYY",
      gpa: "3.8/4.0"
    }
  ],

  skills: [
    {
      id: "skill1",
      category: "Programming Languages",
      keywords: "Python, JavaScript, TypeScript, Java, Go, SQL, GraphQL"
    },
    {
      id: "skill2", 
      category: "Frameworks & Libraries",
      keywords: "React, Node.js, Django, FastAPI, Spring Boot, Express.js"
    },
    {
      id: "skill3",
      category: "Cloud & DevOps",
      keywords: "AWS, Docker, Kubernetes, Terraform, CI/CD, Jenkins, GitHub Actions"
    },
    {
      id: "skill4",
      category: "Databases & Tools",
      keywords: "PostgreSQL, MongoDB, Redis, Apache Kafka, Elasticsearch, Git"
    },
    {
      id: "skill5",
      category: "Leadership & Architecture",
      keywords: "Technical Leadership, System Design, Code Review, Mentoring"
    }
  ],

  involvement: [
    {
      id: "inv1",
      role: "Tech Lead & Mentor",
      organization: "San Francisco Engineering Collective",
      location: "San Francisco, CA",
      dateBegin: "2023-01-01",
      dateEnd: "Present",
      description: "Lead technical workshops and mentorship programs for 200+ software engineers in the Bay Area. • Organize monthly technical talks on system design, cloud architecture, and engineering best practices. • Mentor junior engineers through structured career development programs, helping 15+ engineers advance to senior roles. • Contribute to open-source projects and advocate for engineering excellence across the tech community."
    }
  ]
};

// Modern template document settings (exact match to modern template in resume-templates.ts)
const MODERN_DOCUMENT_SETTINGS = {
  zoom: 120,
  fontFamily: "Inter",
  primaryColor: "#2563eb",
  textColor: "#1f2937",
  fontSize: 10,
  lineHeight: 1.4,
  sectionSpacing: 1,
  paperSize: "Letter",
  margins: {
    top: 0.5,
    right: 0.5,
    bottom: 0.5,
    left: 0.5
  },
  showIcons: false,
  showDividers: false,
  useIndent: false,
  viewAsPages: true
};

/**
 * Load the resume styles system from the application
 */
async function loadResumeStyles() {
  const stylesPath = path.join(__dirname, '../../components/features/resume/styles/resume-styles.ts');
  
  try {
    // Read the TypeScript file and extract the functions we need
    const stylesContent = await fs.readFile(stylesPath, 'utf8');
    
    // For this script, we'll create simplified versions of the styling functions
    // that produce the same output as the application
    return {
      generateResumeCSS: generateModernResumeCSS,
      generateResumeStyles: generateModernResumeStyles
    };
  } catch (error) {
    console.warn('Could not load application styles, using fallback');
    return {
      generateResumeCSS: generateModernResumeCSS,
      generateResumeStyles: generateModernResumeStyles
    };
  }
}

/**
 * Modern template styles generation (exact match to modern template from resume-templates.ts)
 */
function generateModernResumeStyles(settings) {
  const baseFontSize = settings.fontSize;
  
  return {
    fontSizes: {
      name: baseFontSize * 1.8,
      contact: baseFontSize * 0.7,
      sectionHeader: baseFontSize * 1.1,
      jobTitle: baseFontSize * 0.9,
      body: baseFontSize * 0.8,
      detail: baseFontSize * 0.7,
    },
    lineHeights: {
      name: 1.2,
      contact: settings.lineHeight,
      sectionHeader: 1.2,
      jobTitle: 1.2,
      body: settings.lineHeight,
    },
    spacing: {
      sectionGap: 1, // sectionSpacing from template
      blockGap: 0.5, // sectionSpacing * 0.5
      bulletGap: 0.3, // bulletSpacing from template
      headerMarginTop: 0.5,
      headerMarginBottom: 0.3,
    },
    colors: {
      text: "#1f2937", // exact from template
      primary: "#2563eb", // exact from template
      secondary: "#3b82f6", // exact from template
      muted: "#9ca3af", // exact from template
      accent: "#3b82f6", // exact from template
    },
    layout: {
      bulletIndent: '1.25rem',
      headerAlignment: 'left', // exact from template
      contactAlignment: 'left', // exact from template
      bodyAlignment: 'left', // exact from template
      useDividers: false, // exact from template
      useIndentation: false, // exact from template
    },
    typography: {
      nameStyle: 'normal', // exact from template
      sectionStyle: 'uppercase', // exact from template
      letterSpacing: {
        name: '-0.025em', // exact from template
        section: '0.02em', // exact from template
        body: 'normal', // exact from template
      },
      fontWeights: {
        name: 600, // exact from template
        section: 600, // exact from template
        title: 600, // exact from template
        body: 400, // exact from template
      },
    },
    decorations: {
      useShadows: true, // exact from template
      useRoundedCorners: true, // exact from template
      borderRadius: '0.25rem', // exact from template
      shadowIntensity: 'light', // exact from template
    }
  };
}

/**
 * Generate the complete CSS for the modern resume
 */
function generateModernResumeCSS(styles) {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: "${MODERN_DOCUMENT_SETTINGS.fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif;
      color: ${styles.colors.text};
      line-height: ${styles.lineHeights.body};
      background: white;
    }
    
    .resume-container {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      padding: ${MODERN_DOCUMENT_SETTINGS.margins.top}in ${MODERN_DOCUMENT_SETTINGS.margins.right}in ${MODERN_DOCUMENT_SETTINGS.margins.bottom}in ${MODERN_DOCUMENT_SETTINGS.margins.left}in;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 0.25rem;
      border: 10px solid black;
    }
    
    .resume-name {
      font-size: ${styles.fontSizes.name}pt;
      font-weight: 600;
      color: ${styles.colors.primary};
      margin-bottom: ${styles.spacing.headerMarginBottom}rem;
      text-align: left;
      line-height: ${styles.lineHeights.name};
      letter-spacing: -0.025em;
    }
    
    .resume-contact {
      font-size: ${styles.fontSizes.contact}pt;
      color: ${styles.colors.muted};
      text-align: left;
      margin-bottom: ${styles.spacing.sectionGap}rem;
      line-height: ${styles.lineHeights.contact};
    }
    
    .resume-section-header {
      font-size: ${styles.fontSizes.sectionHeader}pt;
      font-weight: 600;
      color: ${styles.colors.text};
      margin-top: ${styles.spacing.headerMarginTop}rem;
      margin-bottom: ${styles.spacing.headerMarginBottom}rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    
    .resume-job-title,
    .resume-degree-title,
    .resume-project-title,
    .resume-involvement-title {
      font-size: ${styles.fontSizes.jobTitle}pt;
      font-weight: 600;
      color: ${styles.colors.secondary};
      line-height: ${styles.lineHeights.jobTitle};
    }
    
    .resume-job-title .company-name,
    .resume-degree-title .institution-name {
      color: ${styles.colors.text};
    }
    
    .resume-company {
      font-size: ${styles.fontSizes.body}pt;
      font-style: italic;
      color: ${styles.colors.muted};
      line-height: ${styles.lineHeights.body};
    }
    
    .resume-school-info {
      font-size: ${styles.fontSizes.body}pt;
      font-style: normal;
      color: ${styles.colors.text};
      line-height: ${styles.lineHeights.body};
    }
    
    .resume-summary,
    .resume-body-text {
      font-size: ${styles.fontSizes.body}pt;
      line-height: ${styles.lineHeights.body};
      color: ${styles.colors.text};
    }
    
    .resume-detail-text,
    .resume-date {
      font-size: ${styles.fontSizes.detail}pt;
      color: ${styles.colors.muted};
      line-height: ${styles.lineHeights.body};
    }
    
    .resume-date {
      font-style: italic;
      float: right;
    }
    
    .resume-bullet-list {
      margin-left: ${styles.layout.bulletIndent};
      list-style: none;
    }
    
    .resume-bullet-list li {
      position: relative;
      margin-bottom: ${styles.spacing.bulletGap}rem;
      font-size: ${styles.fontSizes.body}pt;
      line-height: ${styles.lineHeights.body};
      color: ${styles.colors.text};
    }
    
    .resume-bullet-list li:before {
      content: "•";
      position: absolute;
      left: -0.75rem;
      color: ${styles.colors.primary};
      font-weight: bold;
      font-size: 0.8em;
    }
    
    .resume-experience-block,
    .resume-education-block,
    .resume-project-block,
    .resume-involvement-block {
      margin-bottom: ${styles.spacing.blockGap}rem;
    }
    
    .resume-skills-category {
      font-size: ${styles.fontSizes.body}pt;
      line-height: ${styles.lineHeights.body};
      margin-bottom: ${styles.spacing.bulletGap}rem;
    }
    
    .resume-skills-title {
      font-weight: 600;
      color: ${styles.colors.secondary};
    }
    
    .section-margin {
      margin-bottom: ${styles.spacing.sectionGap}rem;
    }
    
    .block-spacing {
      margin-bottom: 0.05rem;
    }
    
    .date-location {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    
    @media print {
      body { 
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      .resume-container {
        box-shadow: none;
        margin: 0;
      }
    }
  `;
}

/**
 * Format date strings
 */
function formatDate(date, format = 'MMM YYYY') {
  if (!date) return '';
  if (typeof date === 'string' && date.toLowerCase() === 'present') return 'Present';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return date;
  
  if (format === 'YYYY') {
    return dateObj.getFullYear().toString();
  }
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

/**
 * Parse bullet points from description text
 */
function parseBulletPoints(text) {
  if (!text) return [];
  
  let splitPoints = text.split(/[\n•·▪]/g);
  
  if (splitPoints.length === 1) {
    splitPoints = text.split(/\.(?=[A-Z])/g);
  }
  
  const bulletPoints = splitPoints
    .map(point => point.trim())
    .filter(point => point.length > 0)
    .map(point => {
      let cleaned = point.replace(/^[•·▪?-]\s*/, '');
      if (cleaned && !/[.!?]$/.test(cleaned)) {
        cleaned += '.';
      }
      return cleaned;
    })
    .filter(point => point.length > 1);
  
  if (bulletPoints.length === 0 && text) {
    return [text];
  }
  
  return bulletPoints;
}

/**
 * Generate the complete HTML for the modern resume
 */
function generateResumeHTML(resumeData, styles) {
  const css = generateModernResumeCSS(styles);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${resumeData.contact.fullName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>${css}</style>
</head>
<body>
    <div class="resume-container">
        <!-- Contact Information -->
        <header>
            <h1 class="resume-name">${resumeData.contact.fullName}</h1>
            <div class="resume-contact">
                ${resumeData.contact.city}, ${resumeData.contact.state} • 
                ${resumeData.contact.email} • 
                ${resumeData.contact.phone} • 
                ${resumeData.contact.linkedin}
            </div>
        </header>

        <!-- Professional Summary -->
        ${resumeData.summary ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Professional Summary</h2>
            <p class="resume-summary">${resumeData.summary}</p>
        </section>
        ` : ''}

        <!-- Experience -->
        ${resumeData.experiences && resumeData.experiences.length > 0 ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Professional Experience</h2>
            ${resumeData.experiences.map(exp => `
                <div class="resume-experience-block">
                    <div class="block-spacing">
                        <h3 class="resume-job-title">${exp.position} | <span class="company-name">${exp.company}</span></h3>
                    </div>
                    <div class="resume-company">
                        ${formatDate(exp.dateBegin)} - ${formatDate(exp.dateEnd)}${exp.location ? ` • ${exp.location}` : ''}
                    </div>
                    ${exp.description ? `
                        <ul class="resume-bullet-list">
                            ${parseBulletPoints(exp.description).map(bullet => 
                                `<li>${bullet}</li>`
                            ).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Education -->
        ${resumeData.education && resumeData.education.length > 0 ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Education</h2>
            ${resumeData.education.map(edu => `
                <div class="resume-education-block">
                    <div class="resume-degree-title">
                        ${edu.qualification}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''} | <span class="institution-name">${edu.institution}</span><span class="resume-school-info">${edu.location ? ` | ${edu.location}` : ''}${edu.date ? ` | ${formatDate(edu.date, edu.dateFormat)}` : ''}</span>
                    </div>
                    ${edu.gpa ? `
                        <div class="resume-school-info">GPA: ${edu.gpa}</div>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}


        <!-- Skills -->
        ${resumeData.skills && resumeData.skills.length > 0 ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Expert-Level Skills</h2>
            ${resumeData.skills.map(category => `
                <div class="resume-skills-category">
                    <span class="resume-skills-title">${category.category}:</span>
                    <span> ${category.keywords}</span>
                </div>
            `).join('')}
        </section>
        ` : ''}
    </div>
</body>
</html>
  `;
}

/**
 * Main function to generate the modern resume
 */
async function generateResumeTemplate() {
  console.log('🚀 Starting modern resume template generation...');
  
  try {
    // Load styles
    console.log('📋 Loading modern resume styles...');
    const { generateResumeCSS } = await loadResumeStyles();
    
    // Generate styles
    const styles = generateModernResumeStyles(MODERN_DOCUMENT_SETTINGS);
    console.log('✅ Modern styles generated successfully');
    
    // Generate HTML
    console.log('🎨 Generating HTML content...');
    const html = generateResumeHTML(MODERN_RESUME_DATA, styles);
    
    // Save HTML file
    const htmlPath = path.join(__dirname, 'modern-resume-template.html');
    await fs.writeFile(htmlPath, html);
    console.log(`✅ HTML saved to: ${htmlPath}`);
    
    // Generate PDF using Puppeteer
    console.log('📄 Generating PDF...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for fonts to load
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF with proper settings
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      margin: {
        top: '0in',
        right: '0in', 
        bottom: '0in',
        left: '0in'
      },
      printBackground: true,
      preferCSSPageSize: true
    });
    
    // Save PDF
    const pdfPath = path.join(__dirname, 'modern-resume-template.pdf');
    await fs.writeFile(pdfPath, pdfBuffer);
    console.log(`✅ PDF saved to: ${pdfPath}`);
    
    // Generate PNG screenshot for template showcase
    console.log('📸 Generating PNG screenshot...');
    
    // Set viewport to exact resume dimensions (8.5" x 11" at 96 DPI = 816 x 1056 pixels)
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
    
    // Remove box shadow and margins for clean screenshot
    await page.addStyleTag({
      content: `
        body { margin: 0 !important; padding: 0 !important; }
        .resume-container { 
          box-shadow: none !important; 
          margin: 0 !important;
          width: 100vw !important;
          min-height: 100vh !important;
          height: 100vh !important;
          overflow: hidden !important;
        }
      `
    });
    
    // Take screenshot with fixed dimensions to ensure consistency
    const screenshotBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 816, height: 1056 }
    });
    
    // Save PNG
    const pngPath = path.join(__dirname, 'ModernTemplate.png');
    await fs.writeFile(pngPath, screenshotBuffer);
    console.log(`✅ PNG saved to: ${pngPath}`);
    
    await browser.close();
    
    // Generate summary
    console.log('\n📊 Modern Resume Template Summary:');
    console.log(`👤 Name: ${MODERN_RESUME_DATA.contact.fullName}`);
    console.log(`💼 Experience Items: ${MODERN_RESUME_DATA.experiences.length}`);
    console.log(`🎓 Education Items: ${MODERN_RESUME_DATA.education.length}`);
    console.log(`🛠️  Skill Categories: ${MODERN_RESUME_DATA.skills.length}`);
    console.log(`🏆 Involvement: ${MODERN_RESUME_DATA.involvement.length}`);
    
    console.log('\n🎉 Modern resume template generated successfully!');
    console.log('📁 Output files:');
    console.log(`   - HTML: ${htmlPath}`);
    console.log(`   - PDF: ${pdfPath}`);
    console.log(`   - PNG: ${pngPath}`);
    
  } catch (error) {
    console.error('❌ Error generating modern resume template:', error);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  generateResumeTemplate,
  MODERN_RESUME_DATA,
  MODERN_DOCUMENT_SETTINGS,
  generateResumeHTML,
  formatDate,
  parseBulletPoints
};

// Run the script if called directly
if (require.main === module) {
  generateResumeTemplate();
}