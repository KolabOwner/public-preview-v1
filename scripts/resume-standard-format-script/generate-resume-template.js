#!/usr/bin/env node

/**
 * Resume Standard Format Generator Script
 * 
 * This script generates a comprehensive, professional resume template
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

// Career Change - AFTER Kolab scenario
const STANDARD_RESUME_DATA = {
  contact: {
    fullName: "Aisha Patel",
    firstName: "Aisha",
    lastName: "Patel",
    email: "aisha.patel@email.com",
    phone: "(555) 345-6789",
    city: "Austin",
    state: "TX",
    country: "United States",
    linkedin: "linkedin.com/in/aishapatel"
  },

  summary: "Customer-focused product strategist with 6+ years of experience driving user-centric marketing initiatives and data-driven decision making. Proven track record of analyzing customer behavior, optimizing user experiences, and collaborating cross-functionally to deliver measurable business outcomes. Expert in leveraging market research and analytics to inform product strategy and drive 25% improvement in customer engagement metrics. Ready to apply deep customer insights and strategic thinking to accelerate product growth and innovation.",

  experiences: [
    {
      id: "exp1",
      position: "Senior Product Marketing Specialist",
      company: "TechFlow Solutions",
      location: "Austin, TX",
      dateBegin: "2021-03-01",
      dateEnd: "Present",
      description: "Drive customer-centric product positioning and go-to-market strategy for B2B software platform serving 10K+ users. • Developed user persona frameworks and customer journey mapping that informed product roadmap decisions, resulting in 35% increase in user engagement. • Collaborated cross-functionally with engineering, design, and sales teams to prioritize feature development based on customer feedback and market analysis. • Implemented data-driven A/B testing strategy for product messaging and user onboarding flows, improving conversion rates by 28%. • Led customer research initiatives including user interviews and behavioral analysis to drive product strategy and feature prioritization."
    },
    {
      id: "exp2", 
      position: "Product Marketing Coordinator",
      company: "Creative Agency Plus",
      location: "Austin, TX",
      dateBegin: "2019-01-01",
      dateEnd: "2021-02-28",
      description: "Managed product positioning and customer experience optimization for 20+ client digital products and services. • Conducted competitive analysis and market research to identify product differentiation opportunities, informing strategic positioning for client launches. • Collaborated with design and development teams to ensure user-centered approach in campaign execution and product messaging. • Implemented customer feedback collection systems and analyzed user behavior data to drive product improvement recommendations. • Coordinated product launch strategies and tracked success metrics, achieving 92% client satisfaction rate."
    },
    {
      id: "exp3",
      position: "Customer Insights Analyst",
      company: "Local Retail Group",
      location: "Austin, TX",
      dateBegin: "2018-06-01",
      dateEnd: "2018-12-31",
      description: "Analyzed customer behavior and market trends across 12 retail locations to inform product merchandising and user experience decisions. • Conducted customer research through surveys and behavioral analysis, generating actionable insights that improved in-store customer experience by 20%. • Collaborated with operations teams to optimize product placement and customer journey based on data analysis. • Created comprehensive customer behavior reports and presented findings to leadership team, influencing strategic product positioning decisions. • Developed customer segmentation framework that enhanced targeted marketing effectiveness."
    }
  ],

  education: [
    {
      id: "edu1",
      qualification: "Bachelor of Business Administration",
      fieldOfStudy: "Marketing",
      institution: "University of Texas at Austin",
      location: "Austin, TX",
      date: "2018-05-01",
      dateFormat: "YYYY",
      gpa: "3.2/4.0"
    }
  ],

  skills: [
    {
      id: "skill1",
      category: "Product Strategy",
      keywords: "User Research, Customer Journey Mapping, Product Positioning, Go-to-Market Strategy"
    },
    {
      id: "skill2", 
      category: "Analytics & Research",
      keywords: "A/B Testing, Behavioral Analysis, Market Research, Data-Driven Decision Making"
    },
    {
      id: "skill3",
      category: "Cross-Functional Leadership",
      keywords: "Stakeholder Management, Product Roadmap Planning, Customer Insights, Feature Prioritization"
    },
    {
      id: "skill4",
      category: "Technical Tools",
      keywords: "Google Analytics, Mixpanel, Figma, SQL, Product Management Platforms"
    }
  ],

  projects: [
    {
      id: "proj1",
      title: "SaaS Product Competitive Intelligence Platform",
      organization: "Independent Product Strategy Project",
      description: "Built comprehensive competitive analysis framework for SaaS product positioning and feature gap identification. • Researched 15 B2B software companies to map product feature matrices, pricing strategies, and user experience patterns. • Developed strategic product positioning recommendations based on competitive landscape analysis and market opportunity assessment. • Created data visualization dashboard with actionable insights for product roadmap prioritization and go-to-market strategy optimization.",
      startDate: "2023-01-01",
      endDate: "2023-03-01",
      url: ""
    },
    {
      id: "proj2",
      title: "Customer Journey Optimization Study",
      organization: "Product Management Certification Project",
      description: "Designed and executed comprehensive user research study to identify friction points in customer onboarding experience. • Conducted 25+ user interviews and analyzed behavioral data to map complete customer journey from acquisition to activation. • Identified 5 key optimization opportunities that could potentially improve conversion rates by 30%. • Presented findings and strategic recommendations to cross-functional team, demonstrating product thinking and user-centric approach.",
      startDate: "2023-06-01",
      endDate: "2023-08-01",
      url: ""
    }
  ],

  involvements: [
    {
      id: "inv1",
      role: "Product Strategy Committee Lead",
      organization: "Austin Young Professionals Network",
      location: "Austin, TX",
      startDate: "2022-01-01",
      endDate: "Present",
      description: "Lead strategic product development initiatives for professional networking platform serving 2,000+ members. • Spearhead user research and feedback collection to inform platform feature roadmap and member experience optimization strategies. • Collaborate cross-functionally with technology and events teams to prioritize product enhancements based on member behavior data and engagement metrics. • Drive strategic planning sessions for community growth initiatives, applying product thinking methodologies to increase member retention by 40%.",
      current: true,
      bulletPoints: [
        "Spearhead user research and feedback collection to inform platform feature roadmap and member experience optimization strategies.",
        "Collaborate cross-functionally with technology and events teams to prioritize product enhancements based on member behavior data and engagement metrics.",
        "Drive strategic planning sessions for community growth initiatives, applying product thinking methodologies to increase member retention by 40%."
      ]
    }
  ]
};

// Default document settings that match the application
const DEFAULT_DOCUMENT_SETTINGS = {
  zoom: 120,
  fontFamily: "Merriweather",
  primaryColor: "#1f2937",
  textColor: "#1f2937",
  fontSize: 9.5,
  lineHeight: 1.2,
  sectionSpacing: 0.8,
  paperSize: "Letter",
  margins: {
    top: 0.5,
    right: 0.5,
    bottom: 0.5,
    left: 0.5
  },
  showIcons: false,
  showDividers: true,
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
      generateResumeCSS: generateSimplifiedResumeCSS,
      generateResumeStyles: generateSimplifiedResumeStyles
    };
  } catch (error) {
    console.warn('Could not load application styles, using fallback');
    return {
      generateResumeCSS: generateSimplifiedResumeCSS,
      generateResumeStyles: generateSimplifiedResumeStyles
    };
  }
}

/**
 * Simplified version of the resume styles generation
 */
function generateSimplifiedResumeStyles(settings) {
  const baseFontSize = settings.fontSize;
  
  return {
    fontSizes: {
      name: baseFontSize * 1.6,
      contact: baseFontSize * 0.614,
      sectionHeader: baseFontSize * 0.941,
      jobTitle: baseFontSize * 0.818,
      body: baseFontSize * 0.695,
      detail: baseFontSize * 0.609,
    },
    lineHeights: {
      name: 1.2,
      contact: settings.lineHeight,
      sectionHeader: 1.2,
      jobTitle: 1.2,
      body: settings.lineHeight,
    },
    spacing: {
      sectionGap: settings.sectionSpacing,
      blockGap: settings.sectionSpacing * 0.5,
      bulletGap: 0.25,
      headerMarginTop: settings.sectionSpacing * 0.5,
      headerMarginBottom: settings.sectionSpacing * 0.3,
    },
    colors: {
      text: settings.textColor,
      primary: settings.primaryColor,
      secondary: "#374151",
      muted: "#6b7280",
    },
    layout: {
      bulletIndent: '1.25rem',
    }
  };
}

/**
 * Generate the complete CSS for the resume
 */
function generateSimplifiedResumeCSS(styles) {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: "${DEFAULT_DOCUMENT_SETTINGS.fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif;
      color: ${styles.colors.text};
      line-height: ${styles.lineHeights.body};
      background: white;
    }
    
    .resume-container {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      padding: ${DEFAULT_DOCUMENT_SETTINGS.margins.top}in ${DEFAULT_DOCUMENT_SETTINGS.margins.right}in ${DEFAULT_DOCUMENT_SETTINGS.margins.bottom}in ${DEFAULT_DOCUMENT_SETTINGS.margins.left}in;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      border: 10px solid black;
    }
    
    .resume-name {
      font-size: ${styles.fontSizes.name}pt;
      font-weight: 700;
      color: ${styles.colors.primary};
      margin-bottom: ${styles.spacing.headerMarginBottom}rem;
      text-align: center;
      line-height: ${styles.lineHeights.name};
    }
    
    .resume-contact {
      font-size: ${styles.fontSizes.contact}pt;
      color: ${styles.colors.muted};
      text-align: center;
      margin-bottom: ${styles.spacing.sectionGap}rem;
      line-height: ${styles.lineHeights.contact};
    }
    
    .resume-section-header {
      font-size: ${styles.fontSizes.sectionHeader}pt;
      font-weight: 600;
      color: ${styles.colors.primary};
      margin-top: ${styles.spacing.headerMarginTop}rem;
      margin-bottom: ${styles.spacing.headerMarginBottom}rem;
      padding-bottom: 2px;
      border-bottom: 1px solid ${styles.colors.muted};
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
    
    .resume-company,
    .resume-school-info {
      font-size: ${styles.fontSizes.body}pt;
      font-style: italic;
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
      color: ${styles.colors.text};
      font-weight: bold;
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
 * Generate the complete HTML for the resume
 */
function generateResumeHTML(resumeData, styles) {
  const css = generateSimplifiedResumeCSS(styles);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${resumeData.contact.fullName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet">
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

        <!-- Summary -->
        ${resumeData.summary ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Summary</h2>
            <p class="resume-summary">${resumeData.summary}</p>
        </section>
        ` : ''}

        <!-- Experience -->
        ${resumeData.experiences && resumeData.experiences.length > 0 ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Experience</h2>
            ${resumeData.experiences.map(exp => `
                <div class="resume-experience-block">
                    <div class="block-spacing">
                        <h3 class="resume-job-title">${exp.position}</h3>
                    </div>
                    <div class="resume-company">
                        <span>${exp.company}</span>
                        <span class="resume-date">
                            ${formatDate(exp.dateBegin)} - ${formatDate(exp.dateEnd)}${exp.location ? `, ${exp.location}` : ''}
                        </span>
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
                        ${edu.qualification}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                    </div>
                    <div class="resume-school-info">
                        ${edu.institution}${edu.location ? ` • ${edu.location}` : ''}${edu.date ? ` • ${formatDate(edu.date, edu.dateFormat)}` : ''}
                    </div>
                    ${edu.gpa ? `
                        <div class="resume-detail-text">GPA: ${edu.gpa}</div>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Certifications -->
        ${resumeData.certifications && resumeData.certifications.length > 0 ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Certifications</h2>
            ${resumeData.certifications.map(cert => `
                <div class="resume-education-block">
                    <div class="resume-degree-title">${cert.name}</div>
                    <div class="resume-school-info">
                        ${cert.issuer}${cert.date ? ` • ${formatDate(cert.date, 'MMM YYYY')}` : ''}${cert.credentialId ? ` • ID: ${cert.credentialId}` : ''}
                    </div>
                </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Projects -->
        ${resumeData.projects && resumeData.projects.length > 0 ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Projects</h2>
            ${resumeData.projects.map(project => `
                <div class="resume-project-block">
                    <div class="block-spacing">
                        <h3 class="resume-project-title">${project.title}</h3>
                    </div>
                    <div class="resume-company">
                        <span>${project.organization}</span>
                        <span class="resume-date">
                            ${formatDate(project.startDate)} - ${formatDate(project.endDate)}
                        </span>
                    </div>
                    ${project.description ? `
                        <ul class="resume-bullet-list">
                            ${parseBulletPoints(project.description).map(bullet => 
                                `<li>${bullet}</li>`
                            ).join('')}
                        </ul>
                    ` : ''}
                    ${project.url ? `
                        <div class="resume-detail-text">GitHub: ${project.url}</div>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}


        <!-- Involvement -->
        ${resumeData.involvements && resumeData.involvements.length > 0 ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Involvement</h2>
            ${resumeData.involvements.map(involvement => `
                <div class="resume-involvement-block">
                    <div class="block-spacing">
                        <h3 class="resume-involvement-title">${involvement.role}</h3>
                    </div>
                    <div class="resume-company">
                        <span>${involvement.organization}</span>
                        <span class="resume-date">
                            ${formatDate(involvement.startDate)} - ${formatDate(involvement.endDate)}${involvement.location ? `, ${involvement.location}` : ''}
                        </span>
                    </div>
                    ${involvement.description ? `
                        <ul class="resume-bullet-list">
                            ${parseBulletPoints(involvement.description).map(bullet => 
                                `<li>${bullet}</li>`
                            ).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Skills -->
        ${resumeData.skills && resumeData.skills.length > 0 ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Skills</h2>
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
 * Main function to generate the resume
 */
async function generateResumeTemplate() {
  console.log('🚀 Starting resume template generation...');
  
  try {
    // Load styles
    console.log('📋 Loading resume styles...');
    const { generateResumeCSS } = await loadResumeStyles();
    
    // Generate styles
    const styles = generateSimplifiedResumeStyles(DEFAULT_DOCUMENT_SETTINGS);
    console.log('✅ Styles generated successfully');
    
    // Generate HTML
    console.log('🎨 Generating HTML content...');
    const html = generateResumeHTML(STANDARD_RESUME_DATA, styles);
    
    // Save HTML file
    const htmlPath = path.join(__dirname, 'standard-resume-template.html');
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
    const pdfPath = path.join(__dirname, 'standard-resume-template.pdf');
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
    const pngPath = path.join(__dirname, 'resume-after-pivot.png');
    await fs.writeFile(pngPath, screenshotBuffer);
    console.log(`✅ PNG saved to: ${pngPath}`);
    
    await browser.close();
    
    // Generate summary
    console.log('\n📊 Resume Template Summary:');
    console.log(`👤 Name: ${STANDARD_RESUME_DATA.contact.fullName}`);
    console.log(`💼 Experience Items: ${STANDARD_RESUME_DATA.experiences.length}`);
    console.log(`🎓 Education Items: ${STANDARD_RESUME_DATA.education.length}`);
    console.log(`🛠️  Skill Categories: ${STANDARD_RESUME_DATA.skills.length}`);
    
    console.log('\n🎉 Resume template generated successfully!');
    console.log('📁 Output files:');
    console.log(`   - HTML: ${htmlPath}`);
    console.log(`   - PDF: ${pdfPath}`);
    console.log(`   - PNG: ${pngPath}`);
    
  } catch (error) {
    console.error('❌ Error generating resume template:', error);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  generateResumeTemplate,
  STANDARD_RESUME_DATA,
  DEFAULT_DOCUMENT_SETTINGS,
  generateResumeHTML,
  formatDate,
  parseBulletPoints
};

// Run the script if called directly
if (require.main === module) {
  generateResumeTemplate();
}