#!/usr/bin/env node

/**
 * Resume Compact Format Generator Script
 * 
 * This script generates a comprehensive, compact resume template
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
const COMPACT_RESUME_DATA = {
  contact: {
    fullName: "Sarah Rodriguez",
    firstName: "Sarah",
    lastName: "Rodriguez",
    email: "sarah.rodriguez@email.com",
    phone: "(555) 234-5678",
    city: "Austin",
    state: "TX",
    country: "United States",
    linkedin: "linkedin.com/in/sarah-rodriguez"
  },

  summary: "Experienced Data Scientist with 7+ years of expertise in machine learning, statistical analysis, and data visualization. Proven track record of developing predictive models and delivering data-driven insights that optimize business performance and drive strategic decision-making across diverse industries.",

  experiences: [
    {
      id: "exp1",
      position: "Senior Data Scientist",
      company: "DataFlow Analytics",
      location: "Austin, TX",
      dateBegin: "2021-08-01",
      dateEnd: "Present",
      description: "Lead data science initiatives for Fortune 500 clients, developing machine learning models that improved customer retention by 35% and reduced churn prediction accuracy to 94%. • Built end-to-end ML pipelines using Python, TensorFlow, and scikit-learn, processing 10+ million data points daily and enabling real-time predictive analytics for business operations. • Collaborated with cross-functional teams including product managers, engineers, and business stakeholders to translate complex analytical findings into actionable business recommendations and strategic initiatives. • Mentored junior data scientists and established best practices for model deployment, version control, and performance monitoring using MLOps frameworks and cloud infrastructure."
    },
    {
      id: "exp2", 
      position: "Data Scientist",
      company: "TechInsights Corporation",
      location: "Dallas, TX",
      dateBegin: "2019-02-01",
      dateEnd: "2021-07-31",
      description: "Developed sophisticated predictive models for financial services clients using advanced statistical techniques and machine learning algorithms, resulting in 25% improvement in fraud detection accuracy. • Created comprehensive data visualization dashboards using Tableau and Power BI, enabling stakeholders to monitor KPIs and make data-driven decisions with real-time business intelligence insights. • Implemented A/B testing frameworks and statistical analysis procedures to measure campaign effectiveness and optimize marketing spend allocation, leading to 40% increase in ROI. • Designed and executed data collection strategies, data cleaning processes, and feature engineering pipelines that improved model performance and reduced training time by 30%. • Presented analytical findings and recommendations to C-level executives and board members, translating complex statistical concepts into clear business narratives and actionable insights."
    },
    {
      id: "exp3",
      position: "Junior Data Analyst",
      company: "Analytics Solutions Inc",
      location: "Houston, TX", 
      dateBegin: "2017-06-01",
      dateEnd: "2019-01-31",
      description: "Performed comprehensive data analysis and statistical modeling for retail and e-commerce clients, focusing on customer behavior analysis, sales forecasting, and inventory optimization strategies. • Developed automated reporting systems using SQL, Python, and R that reduced manual reporting time by 60% while increasing data accuracy and consistency across multiple business units. • Conducted exploratory data analysis and created data quality assessments to identify trends, patterns, and anomalies in large datasets, supporting evidence-based business decision making. • Collaborated with database administrators and IT teams to optimize data warehouse performance and implement efficient ETL processes for seamless data integration from multiple sources. • Participated in client meetings and stakeholder presentations to communicate analytical findings and provide recommendations for business process improvements and strategic planning initiatives."
    }
  ],

  education: [
    {
      id: "edu1",
      qualification: "Master of Science",
      fieldOfStudy: "Data Science",
      institution: "University of Texas at Austin",
      location: "Austin, TX",
      date: "2017-05-01",
      dateFormat: "YYYY",
      gpa: "3.85/4.0"
    }
  ],

  skills: [
    {
      id: "skill1",
      category: "Programming Languages",
      keywords: "Python, R, SQL, Java, Scala, JavaScript, MATLAB"
    },
    {
      id: "skill2", 
      category: "Machine Learning & AI",
      keywords: "TensorFlow, PyTorch, scikit-learn, Keras, XGBoost, Random Forest"
    },
    {
      id: "skill3",
      category: "Data Tools & Platforms",
      keywords: "Hadoop, Spark, AWS, Azure, Google Cloud, Tableau, Power BI"
    },
    {
      id: "skill4",
      category: "Databases & Storage",
      keywords: "PostgreSQL, MongoDB, Cassandra, Redis, Snowflake, BigQuery"
    },
    {
      id: "skill5",
      category: "Statistical Analysis",
      keywords: "Hypothesis Testing, Regression Analysis, Time Series, Bayesian Methods"
    }
  ],

  involvement: []
};

// Compact template document settings (exact match to minimal template from resume-templates.ts)
const COMPACT_DOCUMENT_SETTINGS = {
  zoom: 120,
  fontFamily: "Merriweather",
  primaryColor: "#000000",
  textColor: "#000000",
  fontSize: 10,
  lineHeight: 1.4,
  sectionSpacing: 1.2,
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
      generateResumeCSS: generateCompactResumeCSS,
      generateResumeStyles: generateCompactResumeStyles
    };
  } catch (error) {
    console.warn('Could not load application styles, using fallback');
    return {
      generateResumeCSS: generateCompactResumeCSS,
      generateResumeStyles: generateCompactResumeStyles
    };
  }
}

/**
 * Compact template styles generation (exact match to minimal template from resume-templates.ts)
 */
function generateCompactResumeStyles(settings) {
  const baseFontSize = settings.fontSize;
  
  return {
    fontSizes: {
      name: baseFontSize * 1.6, // exact from template
      contact: baseFontSize * 0.7, // exact from template
      sectionHeader: baseFontSize * 1.0, // exact from template
      jobTitle: baseFontSize * 0.85, // exact from template
      body: baseFontSize * 0.8, // exact from template
      detail: baseFontSize * 0.7, // exact from template
    },
    lineHeights: {
      name: 1.2,
      contact: settings.lineHeight,
      sectionHeader: 1.2,
      jobTitle: 1.2,
      body: settings.lineHeight,
    },
    spacing: {
      sectionGap: 1.2, // sectionSpacing from template
      blockGap: 0.6, // sectionSpacing * 0.5
      bulletGap: 0.3, // bulletSpacing from template
      headerMarginTop: 0.6,
      headerMarginBottom: 0.36,
    },
    colors: {
      text: "#000000", // exact from template
      primary: "#000000", // exact from template
      secondary: "#000000", // exact from template
      muted: "#737373", // exact from template
      accent: "#000000", // exact from template
    },
    layout: {
      bulletIndent: '1.25rem',
      headerAlignment: 'center', // exact from template
      contactAlignment: 'center', // exact from template
      bodyAlignment: 'left', // exact from template
      useDividers: true, // exact from template
      dividerStyle: 'solid', // exact from template
      useIndentation: false, // exact from template
    },
    typography: {
      nameStyle: 'normal', // exact from template
      sectionStyle: 'uppercase', // exact from template
      letterSpacing: {
        name: '0.02em', // exact from template
        section: '0.05em', // exact from template
        body: '0.01em', // exact from template
      },
      fontWeights: {
        name: 500, // exact from template
        section: 500, // exact from template
        title: 500, // exact from template
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
 * Generate the complete CSS for the compact resume
 */
function generateCompactResumeCSS(styles) {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: "${COMPACT_DOCUMENT_SETTINGS.fontFamily}", -apple-system, BlinkMacSystemFont, sans-serif;
      color: ${styles.colors.text};
      line-height: ${styles.lineHeights.body};
      background: white;
    }
    
    .resume-container {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      padding: ${COMPACT_DOCUMENT_SETTINGS.margins.top}in ${COMPACT_DOCUMENT_SETTINGS.margins.right}in ${COMPACT_DOCUMENT_SETTINGS.margins.bottom}in ${COMPACT_DOCUMENT_SETTINGS.margins.left}in;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
      border: 10px solid black;
    }
    
    .resume-name {
      font-size: ${styles.fontSizes.name}pt;
      font-weight: 500;
      color: ${styles.colors.primary};
      margin-bottom: ${styles.spacing.headerMarginBottom}rem;
      text-align: center;
      line-height: ${styles.lineHeights.name};
      letter-spacing: 0.02em;
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
      font-weight: 500;
      color: ${styles.colors.primary};
      margin-top: ${styles.spacing.headerMarginTop}rem;
      margin-bottom: ${styles.spacing.headerMarginBottom}rem;
      padding-bottom: 2px;
      border-bottom: 1px solid ${styles.colors.muted};
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .resume-job-title,
    .resume-degree-title,
    .resume-project-title,
    .resume-involvement-title {
      font-size: ${styles.fontSizes.jobTitle}pt;
      font-weight: 500;
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
      font-weight: 500;
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
 * Generate the complete HTML for the compact resume
 */
function generateResumeHTML(resumeData, styles) {
  const css = generateCompactResumeCSS(styles);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${resumeData.contact.fullName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;500;700&display=swap" rel="stylesheet">
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
                        <h3 class="resume-job-title">${exp.position} | ${exp.company}${exp.location ? ` | ${exp.location}` : ''} | ${formatDate(exp.dateBegin)} - ${formatDate(exp.dateEnd)}</h3>
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

        <!-- Leadership & Involvement -->
        ${resumeData.involvement && resumeData.involvement.length > 0 ? `
        <section class="section-margin">
            <h2 class="resume-section-header">Leadership & Involvement</h2>
            ${resumeData.involvement.map(inv => `
                <div class="resume-involvement-block">
                    <div class="resume-involvement-title">${inv.role}</div>
                    <div class="resume-detail-text">
                        ${inv.location ? `${inv.location} • ` : ''}
                        ${inv.organization ? `${inv.organization} • ` : ''}
                        ${(inv.dateBegin || inv.dateEnd) ? `${formatDate(inv.dateBegin)} - ${formatDate(inv.dateEnd)}` : ''}
                    </div>
                    ${inv.description ? `
                        <ul class="resume-bullet-list">
                            ${parseBulletPoints(inv.description).map(bullet => 
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
 * Main function to generate the compact resume
 */
async function generateResumeTemplate() {
  console.log('🚀 Starting compact resume template generation...');
  
  try {
    // Load styles
    console.log('📋 Loading compact resume styles...');
    const { generateResumeCSS } = await loadResumeStyles();
    
    // Generate styles
    const styles = generateCompactResumeStyles(COMPACT_DOCUMENT_SETTINGS);
    console.log('✅ Compact styles generated successfully');
    
    // Generate HTML
    console.log('🎨 Generating HTML content...');
    const html = generateResumeHTML(COMPACT_RESUME_DATA, styles);
    
    // Save HTML file
    const htmlPath = path.join(__dirname, 'compact-resume-template.html');
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
    const pdfPath = path.join(__dirname, 'compact-resume-template.pdf');
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
    const pngPath = path.join(__dirname, 'CompactTemplate.png');
    await fs.writeFile(pngPath, screenshotBuffer);
    console.log(`✅ PNG saved to: ${pngPath}`);
    
    await browser.close();
    
    // Generate summary
    console.log('\n📊 Compact Resume Template Summary:');
    console.log(`👤 Name: ${COMPACT_RESUME_DATA.contact.fullName}`);
    console.log(`💼 Experience Items: ${COMPACT_RESUME_DATA.experiences.length}`);
    console.log(`🎓 Education Items: ${COMPACT_RESUME_DATA.education.length}`);
    console.log(`🛠️  Skill Categories: ${COMPACT_RESUME_DATA.skills.length}`);
    console.log(`🏆 Involvement: ${COMPACT_RESUME_DATA.involvement.length}`);
    
    console.log('\n🎉 Compact resume template generated successfully!');
    console.log('📁 Output files:');
    console.log(`   - HTML: ${htmlPath}`);
    console.log(`   - PDF: ${pdfPath}`);
    console.log(`   - PNG: ${pngPath}`);
    
  } catch (error) {
    console.error('❌ Error generating compact resume template:', error);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  generateResumeTemplate,
  COMPACT_RESUME_DATA,
  COMPACT_DOCUMENT_SETTINGS,
  generateResumeHTML,
  formatDate,
  parseBulletPoints
};

// Run the script if called directly
if (require.main === module) {
  generateResumeTemplate();
}