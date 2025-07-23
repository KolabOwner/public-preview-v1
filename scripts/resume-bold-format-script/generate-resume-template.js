#!/usr/bin/env node

/**
 * Resume Bold Format Generator Script
 * 
 * This script generates a comprehensive, bold resume template
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
const BOLD_RESUME_DATA = {
  contact: {
    fullName: "Emma Thompson",
    firstName: "Emma",
    lastName: "Thompson",
    email: "emma.thompson@email.com",
    phone: "(555) 345-6789",
    city: "Portland",
    state: "OR",
    country: "United States",
    linkedin: "linkedin.com/in/emma-thompson"
  },

  summary: "Dynamic Marketing Director with 8+ years of expertise in digital marketing, brand strategy, and team leadership. Proven track record of driving revenue growth through innovative campaigns, data-driven insights, and cross-functional collaboration. Passionate about building authentic brand experiences and developing high-performing marketing teams.",

  experiences: [
    {
      id: "exp1",
      position: "Marketing Director",
      company: "TechForward Inc",
      location: "Portland, OR",
      dateBegin: "2022-04-01",
      dateEnd: "Present",
      description: "Lead comprehensive marketing strategy for B2B SaaS company, managing $3M annual marketing budget and driving 150% increase in qualified leads year-over-year. • Developed and executed integrated digital marketing campaigns across multiple channels including content marketing, social media, email, and paid advertising, resulting in 85% improvement in customer acquisition cost efficiency. • Built and mentored high-performing marketing team of 12 professionals, implementing agile marketing methodologies and establishing clear KPIs and performance metrics that improved team productivity by 40%."
    },
    {
      id: "exp2", 
      position: "Senior Marketing Manager",
      company: "GrowthTech Solutions",
      location: "Seattle, WA",
      dateBegin: "2019-08-01",
      dateEnd: "2022-03-31",
      description: "Managed end-to-end digital marketing operations for fast-growing startup, focusing on demand generation and brand awareness initiatives that contributed to 300% company growth during tenure. • Developed content marketing strategy and editorial calendar, producing high-quality blog posts, whitepapers, and case studies that increased organic website traffic by 200% and established thought leadership in the industry. • Executed successful product launches and go-to-market campaigns for 5 major product releases, coordinating cross-functional teams and achieving average of 40% above target for new feature adoption rates. • Optimized conversion funnel through A/B testing and user experience improvements, increasing website conversion rate from 2.1% to 4.8% and improving overall customer journey and engagement metrics. • Managed relationships with external agencies, freelancers, and marketing technology vendors, ensuring efficient resource allocation and maintaining high-quality standards across all marketing deliverables."
    },
    {
      id: "exp3",
      position: "Digital Marketing Specialist",
      company: "InnovateMarketing Agency",
      location: "San Francisco, CA", 
      dateBegin: "2017-01-01",
      dateEnd: "2019-07-31",
      description: "Executed digital marketing campaigns for diverse portfolio of B2B and B2C clients across technology, healthcare, and e-commerce sectors, managing multiple concurrent projects and client relationships. • Developed and implemented comprehensive social media strategies across LinkedIn, Twitter, Facebook, and Instagram, increasing average client follower growth by 180% and engagement rates by 220% within first year. • Created and optimized Google Ads and Facebook advertising campaigns with total monthly ad spend of $150K+, consistently achieving below-target CPC and above-target conversion rates for client accounts. • Conducted thorough competitor analysis and market research to identify opportunities and inform strategic recommendations, contributing to successful client retention rate of 95% and average account growth of 35%. • Collaborated with creative team to develop compelling marketing assets including landing pages, email templates, and social media graphics, ensuring brand consistency and message alignment across all client touchpoints."
    }
  ],

  education: [
    {
      id: "edu1",
      qualification: "Bachelor of Arts",
      fieldOfStudy: "Marketing and Communications",
      institution: "University of Oregon",
      location: "Eugene, OR",
      date: "2016-06-01",
      dateFormat: "YYYY",
      gpa: "3.7/4.0"
    }
  ],

  skills: [
    {
      id: "skill1",
      category: "Digital Marketing",
      keywords: "SEO, SEM, Content Marketing, Social Media Marketing, Email Marketing"
    },
    {
      id: "skill2", 
      category: "Analytics & Tools",
      keywords: "Google Analytics, HubSpot, Salesforce, Tableau, Google Ads, Facebook Ads"
    },
    {
      id: "skill3",
      category: "Strategy & Leadership",
      keywords: "Brand Strategy, Campaign Management, Team Leadership, Budget Management"
    },
    {
      id: "skill4",
      category: "Creative & Content",
      keywords: "Copywriting, Adobe Creative Suite, Canva, Video Marketing, Webinar Production"
    }
  ],

  involvement: []
};

// Bold template document settings (exact match to bold template from resume-templates.ts)
const BOLD_DOCUMENT_SETTINGS = {
  zoom: 120,
  fontFamily: "Inter",
  primaryColor: "#3b82f6",
  textColor: "#000000",
  fontSize: 11,
  lineHeight: 1.3,
  sectionSpacing: 0.8,
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
      generateResumeCSS: generateBoldResumeCSS,
      generateResumeStyles: generateBoldResumeStyles
    };
  } catch (error) {
    console.warn('Could not load application styles, using fallback');
    return {
      generateResumeCSS: generateBoldResumeCSS,
      generateResumeStyles: generateBoldResumeStyles
    };
  }
}

/**
 * Bold template styles generation (exact match to bold template from resume-templates.ts)
 */
function generateBoldResumeStyles(settings) {
  const baseFontSize = settings.fontSize;
  
  return {
    fontSizes: {
      name: baseFontSize * 1.6,
      contact: baseFontSize * 0.7,
      sectionHeader: baseFontSize * 1.0,
      jobTitle: baseFontSize * 0.85,
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
      sectionGap: 0.8, // sectionSpacing from template
      blockGap: 0.4, // sectionSpacing * 0.5
      bulletGap: 0.3, // bulletSpacing from template
      headerMarginTop: 0.4,
      headerMarginBottom: 0.24,
    },
    colors: {
      text: "#000000",
      primary: "#000000",
      secondary: "#000000",
      muted: "#6b7280",
      accent: "#000000",
    },
    layout: {
      bulletIndent: '1.25rem',
      headerAlignment: 'left', // exact from template
      contactAlignment: 'left', // exact from template
      bodyAlignment: 'left', // exact from template
      useDividers: false, // exact from template
      dividerStyle: 'solid', // exact from template
      useIndentation: false, // exact from template
    },
    typography: {
      nameStyle: 'normal', // exact from template
      sectionStyle: 'normal', // exact from template
      letterSpacing: {
        name: '-0.025em', // exact from template
        section: 'normal', // exact from template
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
      useShadows: false, // exact from template
      useRoundedCorners: false, // exact from template
      borderRadius: '0', // exact from template
      shadowIntensity: 'none', // exact from template
    }
  };
}

/**
 * Generate the complete CSS for the bold resume
 */
function generateBoldResumeCSS(styles) {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: "${BOLD_DOCUMENT_SETTINGS.fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif;
      color: ${styles.colors.text};
      line-height: ${styles.lineHeights.body};
      background: white;
    }
    
    .resume-container {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      padding: ${BOLD_DOCUMENT_SETTINGS.margins.top}in ${BOLD_DOCUMENT_SETTINGS.margins.right}in ${BOLD_DOCUMENT_SETTINGS.margins.bottom}in ${BOLD_DOCUMENT_SETTINGS.margins.left}in;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      border: 10px solid black;
    }
    
    .resume-name {
      font-size: ${styles.fontSizes.name}pt;
      font-weight: 600;
      color: ${styles.colors.text};
      margin-bottom: ${styles.spacing.headerMarginBottom}rem;
      text-align: left;
      line-height: ${styles.lineHeights.name};
      letter-spacing: -0.025em;
      border-bottom: 1px solid #9ca3af;
      padding-bottom: 0.5rem;
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
      padding-bottom: 2px;
      border-bottom: 1px solid #737373;
      text-transform: none;
      letter-spacing: 0.05em;
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
      color: ${styles.colors.primary};
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
 * Generate the complete HTML for the bold resume
 */
function generateResumeHTML(resumeData, styles) {
  const css = generateBoldResumeCSS(styles);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${resumeData.contact.fullName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
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
                        <h3 class="resume-job-title">${exp.position} | ${exp.company} | ${exp.location} | ${formatDate(exp.dateBegin)} - ${formatDate(exp.dateEnd)}</h3>
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
                        ${edu.qualification}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''} | ${edu.institution}${edu.location ? ` | ${edu.location}` : ''}${edu.date ? ` | ${formatDate(edu.date, edu.dateFormat)}` : ''}
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
 * Main function to generate the bold resume
 */
async function generateResumeTemplate() {
  console.log('🚀 Starting bold resume template generation...');
  
  try {
    // Load styles
    console.log('📋 Loading bold resume styles...');
    const { generateResumeCSS } = await loadResumeStyles();
    
    // Generate styles
    const styles = generateBoldResumeStyles(BOLD_DOCUMENT_SETTINGS);
    console.log('✅ Bold styles generated successfully');
    
    // Generate HTML
    console.log('🎨 Generating HTML content...');
    const html = generateResumeHTML(BOLD_RESUME_DATA, styles);
    
    // Save HTML file
    const htmlPath = path.join(__dirname, 'bold-resume-template.html');
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
    const pdfPath = path.join(__dirname, 'bold-resume-template.pdf');
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
    const pngPath = path.join(__dirname, 'BoldTemplate.png');
    await fs.writeFile(pngPath, screenshotBuffer);
    console.log(`✅ PNG saved to: ${pngPath}`);
    
    await browser.close();
    
    // Generate summary
    console.log('\n📊 Bold Resume Template Summary:');
    console.log(`👤 Name: ${BOLD_RESUME_DATA.contact.fullName}`);
    console.log(`💼 Experience Items: ${BOLD_RESUME_DATA.experiences.length}`);
    console.log(`🎓 Education Items: ${BOLD_RESUME_DATA.education.length}`);
    console.log(`🛠️  Skill Categories: ${BOLD_RESUME_DATA.skills.length}`);
    
    console.log('\n🎉 Bold resume template generated successfully!');
    console.log('📁 Output files:');
    console.log(`   - HTML: ${htmlPath}`);
    console.log(`   - PDF: ${pdfPath}`);
    console.log(`   - PNG: ${pngPath}`);
    
  } catch (error) {
    console.error('❌ Error generating bold resume template:', error);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  generateResumeTemplate,
  BOLD_RESUME_DATA,
  BOLD_DOCUMENT_SETTINGS,
  generateResumeHTML,
  formatDate,
  parseBulletPoints
};

// Run the script if called directly
if (require.main === module) {
  generateResumeTemplate();
}