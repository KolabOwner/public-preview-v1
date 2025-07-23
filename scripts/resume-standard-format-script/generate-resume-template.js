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

// Comprehensive resume data that follows the application's data structure
const STANDARD_RESUME_DATA = {
  contact: {
    fullName: "Alex Chen",
    firstName: "Alex",
    lastName: "Chen",
    email: "alex.chen@email.com",
    phone: "(555) 987-6543",
    city: "Austin",
    state: "TX",
    country: "United States",
    linkedin: "linkedin.com/in/alex-chen-cfo"
  },

  summary: "Accomplished Chief Financial Officer with 8+ years of progressive finance leadership experience driving strategic growth, operational excellence, and shareholder value creation. Former corporate finance manager who built expertise across financial planning, investor relations, and organizational transformation. Proven track record of leading companies through scaling challenges, fundraising processes, and complex business transitions while maintaining strong financial controls and governance.",

  experiences: [
    {
      id: "exp1",
      position: "Chief Financial Officer",
      company: "GreenTech Solutions",
      location: "Austin, TX",
      dateBegin: "2021-11-01",
      dateEnd: "Present",
      description: "Lead all financial operations for $50M revenue clean energy company, overseeing accounting, FP&A, treasury, and investor relations while driving strategic initiatives that doubled company valuation to $200M. • Successfully raised $25M Series B funding round by developing comprehensive financial models, investor presentations, and due diligence materials, enabling aggressive expansion into 5 new markets. • Implemented advanced financial planning and budgeting processes that improved forecast accuracy by 40% and reduced month-end close time from 15 days to 5 days. • Led acquisition integration of two competitor companies totaling $12M, managing due diligence, deal structuring, and post-merger financial consolidation that achieved 95% of projected synergies. • Built finance team from 3 to 12 professionals, establishing scalable processes and systems that supported 150% revenue growth while maintaining operating margins above 20%. • Developed board reporting and governance frameworks, presenting quarterly financial results to board of directors and key investors while ensuring SOX compliance and audit readiness."
    },
    {
      id: "exp2", 
      position: "Finance Director",
      company: "Austin Manufacturing Corp",
      location: "Austin, TX",
      dateBegin: "2019-06-01",
      dateEnd: "2021-10-31",
      description: "Managed financial planning, analysis, and reporting for $200M industrial manufacturing company, leading strategic initiatives that improved EBITDA margins by 5% and reduced working capital by $8M. • Developed comprehensive 3-year strategic plan and annual budgets, working closely with operations leadership to identify growth opportunities and cost optimization initiatives. • Led implementation of new ERP system (SAP) across 4 manufacturing facilities, managing $2M project budget and ensuring seamless transition that improved financial reporting accuracy and operational visibility. • Restructured debt portfolio and banking relationships, negotiating new $15M credit facility with improved terms that reduced interest expenses by $400K annually. • Established cost accounting and profitability analysis frameworks that identified unprofitable product lines, leading to strategic decisions that improved overall margins by 8%. • Managed team of 8 finance professionals across accounting, FP&A, and treasury functions, implementing performance management systems that reduced staff turnover by 30%."
    },
    {
      id: "exp3",
      position: "Corporate Finance Manager",
      company: "Regional Investment Bank",
      location: "Dallas, TX", 
      dateBegin: "2017-03-01",
      dateEnd: "2019-05-31",
      description: "Performed financial analysis and strategic advisory services for middle-market clients while developing expertise in M&A transactions, capital raising, and financial restructuring. • Executed 15+ M&A transactions totaling $300M+ in deal value, managing financial due diligence, valuation analysis, and deal structuring for both buy-side and sell-side engagements. • Prepared detailed financial models and investment memoranda for private equity and strategic acquirers, achieving successful transaction completion rate of 85% above industry average. • Led capital raising initiatives for client companies, including debt refinancing and equity investments ranging from $5M to $50M, helping clients optimize capital structure and reduce cost of capital. • Conducted comprehensive financial and operational assessments for distressed companies, developing turnaround strategies that restored profitability for 80% of engagements. • Built strong relationships with institutional investors, lenders, and strategic partners, creating valuable network that supported successful deal execution and client value creation."
    }
  ],

  education: [
    {
      id: "edu1",
      qualification: "Master of Business Administration",
      fieldOfStudy: "Finance",
      institution: "University of Texas at Austin",
      location: "Austin, TX",
      date: "2016-12-01",
      dateFormat: "YYYY",
      gpa: "3.9/4.0"
    }
  ],

  skills: [
    {
      id: "skill1",
      category: "Financial Leadership",
      keywords: "Strategic Planning, Financial Modeling, Investor Relations, Board Reporting, Fundraising"
    },
    {
      id: "skill2", 
      category: "Corporate Finance",
      keywords: "M&A, Capital Structure, Debt & Equity Financing, Valuation, Due Diligence"
    },
    {
      id: "skill3",
      category: "Operations & Systems",
      keywords: "ERP Implementation, Financial Controls, SOX Compliance, Process Optimization"
    },
    {
      id: "skill4",
      category: "Team Leadership",
      keywords: "Organizational Development, Performance Management, Change Management, Talent Acquisition"
    },
    {
      id: "skill5",
      category: "Technical Skills",
      keywords: "Advanced Excel, SAP, QuickBooks, Tableau, Financial Reporting, GAAP"
    }
  ],



};

// Default document settings that match the application
const DEFAULT_DOCUMENT_SETTINGS = {
  zoom: 120,
  fontFamily: "Merriweather",
  primaryColor: "#1f2937",
  textColor: "#1f2937",
  fontSize: 11,
  lineHeight: 1.3,
  sectionSpacing: 1,
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


        <!-- Skills -->
        ${resumeData.skills && resumeData.skills.length > 0 ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Technical Skills</h2>
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
    const pngPath = path.join(__dirname, 'business-4.png');
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