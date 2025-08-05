import { jsPDF } from 'jspdf';
import type { ResumeData } from '../types/pdf-types';
import { createPDFConfiguration, getPaperSizeDimensions, getTemplateFontScales, type PDFConfiguration } from './pdf-config';
import { FontManager } from './font-manager';
import {
  HeaderRenderer,
  SummaryRenderer,
  ExperienceRenderer,
  EducationRenderer,
  SkillsRenderer,
  ProjectsRenderer,
  CertificationsRenderer,
  InvolvementRenderer,
  CourseworkRenderer
} from './section-renderers';

/**
 * PDF builder class that coordinates all PDF generation
 */
export class PDFBuilder {
  private doc: jsPDF;
  private config: PDFConfiguration;
  private customFontsLoaded = false;
  private pageWidth: number;
  private pageHeight: number;
  private contentWidth: number;
  private yPosition: number;

  constructor(resumeData: ResumeData) {
    // Create PDF document
    const paperSize = getPaperSizeDimensions(resumeData.documentSettings?.paperSize || 'Letter');
    
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: resumeData.documentSettings?.paperSize === 'A4' ? 'a4' : 'letter',
      compress: true,
      putOnlyUsedFonts: true,
    });
    
    // Initialize configuration
    this.config = createPDFConfiguration(resumeData);
    
    // Apply template-specific font scales
    if (resumeData.template) {
      const fontScales = getTemplateFontScales(resumeData.template);
      Object.keys(this.config.fonts).forEach(fontKey => {
        const key = fontKey as keyof typeof this.config.fonts;
        const scale = fontScales[fontKey] || 1;
        this.config.fonts[key] = {
          ...this.config.fonts[key],
          size: this.config.fonts[key].size * scale
        };
      });
    }
    
    // Set page dimensions
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.contentWidth = this.pageWidth - this.config.margins.left - this.config.margins.right;
    this.yPosition = this.config.margins.top;
  }

  /**
   * Load custom fonts with timeout
   */
  private async loadCustomFonts(): Promise<boolean> {
    if (this.customFontsLoaded) return true;
    
    const fontFamily = this.config.fonts.body.family;
    
    if (fontFamily === 'merriweather' || fontFamily === 'merriweatherSans') {
      try {
        // Set timeout for font loading
        const timeoutPromise = new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Font loading timeout')), 8000)
        );
        
        const loadPromise = FontManager.addCustomFonts(this.doc, fontFamily as any);
        
        this.customFontsLoaded = await Promise.race([loadPromise, timeoutPromise]).catch(() => {
          console.warn(`[PDF] Font loading failed for ${fontFamily}`);
          return false;
        }) ?? false;
        
        if (!this.customFontsLoaded) {
          console.warn(`[PDF] Custom fonts ${fontFamily} not available, using fallback`);
          this.fallbackToStandardFonts();
        } else {
          console.log(`[PDF] Custom fonts ${fontFamily} loaded successfully`);
        }
        
        return this.customFontsLoaded;
      } catch (error) {
        console.warn('[PDF] Failed to load custom fonts, using fallback:', error);
        this.fallbackToStandardFonts();
        return false;
      }
    }
    
    return true; // Standard fonts don't need loading
  }

  /**
   * Fallback to standard fonts
   */
  private fallbackToStandardFonts(): void {
    const standardFamily = FontManager.getStandardFontFallback(this.config.fonts.body.family);
    
    // Update all font definitions to use standard fonts
    Object.keys(this.config.fonts).forEach(key => {
      const fontKey = key as keyof typeof this.config.fonts;
      this.config.fonts[fontKey] = {
        ...this.config.fonts[fontKey],
        family: standardFamily
      };
    });
  }

  /**
   * Convert RMS data to structured format for rendering
   */
  private convertRMSToStructured(rmsData: any): any {
    const structured: any = {
      contactInfo: {},
      summary: '',
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      involvements: [],
      awards: [],
      languages: [],
      coursework: [],
      publications: []
    };
    
    // Extract contact info
    structured.contactInfo = {
      fullName: rmsData.rms_contact_fullname || rmsData.rms_contact_fullName,
      email: rmsData.rms_contact_email,
      phone: rmsData.rms_contact_phone,
      linkedin: rmsData.rms_contact_linkedin,
      website: rmsData.rms_contact_website,
      city: rmsData.rms_contact_city,
      state: rmsData.rms_contact_state,
      country: rmsData.rms_contact_country
    };
    
    // Extract summary
    structured.summary = rmsData.rms_summary || '';
    
    // Extract experiences
    const expCount = parseInt(rmsData.rms_experience_count || '0');
    for (let i = 0; i < expCount; i++) {
      const exp = {
        company: rmsData[`rms_experience_${i}_company`],
        title: rmsData[`rms_experience_${i}_role`],
        startDate: rmsData[`rms_experience_${i}_datebegin`] || rmsData[`rms_experience_${i}_dateBegin`],
        endDate: rmsData[`rms_experience_${i}_dateend`] || rmsData[`rms_experience_${i}_dateEnd`],
        current: rmsData[`rms_experience_${i}_iscurrent`] || rmsData[`rms_experience_${i}_isCurrent`],
        description: rmsData[`rms_experience_${i}_description`],
        location: rmsData[`rms_experience_${i}_location`]
      };
      if (exp.company || exp.title) {
        structured.experiences.push(exp);
      }
    }
    
    // Extract education
    const eduCount = parseInt(rmsData.rms_education_count || '0');
    for (let i = 0; i < eduCount; i++) {
      const edu = {
        institution: rmsData[`rms_education_${i}_institution`],
        qualification: rmsData[`rms_education_${i}_qualification`],
        location: rmsData[`rms_education_${i}_location`],
        date: rmsData[`rms_education_${i}_date`],
        score: rmsData[`rms_education_${i}_score`],
        scoreType: rmsData[`rms_education_${i}_scoreType`]
      };
      if (edu.institution || edu.qualification) {
        structured.education.push(edu);
      }
    }
    
    // Extract skills
    const skillCount = parseInt(rmsData.rms_skill_count || '0');
    for (let i = 0; i < skillCount; i++) {
      const skill = {
        category: rmsData[`rms_skill_${i}_category`] || 'Skills',
        keywords: rmsData[`rms_skill_${i}_keywords`] || ''
      };
      if (skill.keywords) {
        structured.skills.push(skill);
      }
    }
    
    return structured;
  }


  /**
   * Get section order based on resume data or use default
   */
  private getSectionOrder(resumeData: ResumeData): string[] {
    if (resumeData.sectionOrder && resumeData.sectionOrder.length > 0) {
      return resumeData.sectionOrder;
    }
    
    // Default section order
    return [
      'header',
      'summary',
      'experiences',
      'education',
      'skills',
      'projects',
      'certifications',
      'involvements',
      'coursework'
    ];
  }

  /**
   * Render a specific section based on its type
   */
  private renderSection(sectionType: string, data: any): void {
    switch (sectionType) {
      case 'header':
        if (data.contactInfo) {
          const headerRenderer = new HeaderRenderer(this.doc, this.config, this.yPosition, this.customFontsLoaded);
          this.yPosition = headerRenderer.render(data.contactInfo);
        }
        break;
        
      case 'summary':
        if (data.summary) {
          const summaryRenderer = new SummaryRenderer(this.doc, this.config, this.yPosition, this.customFontsLoaded);
          this.yPosition = summaryRenderer.render(data.summary);
        }
        break;
        
      case 'experiences':
        if (data.experiences && data.experiences.length > 0) {
          const experienceRenderer = new ExperienceRenderer(this.doc, this.config, this.yPosition, this.customFontsLoaded);
          this.yPosition = experienceRenderer.render(data.experiences);
        }
        break;
        
      case 'education':
        if (data.education && data.education.length > 0) {
          const educationRenderer = new EducationRenderer(this.doc, this.config, this.yPosition, this.customFontsLoaded);
          this.yPosition = educationRenderer.render(data.education);
        }
        break;
        
      case 'skills':
        if (data.skills && data.skills.length > 0) {
          const skillsRenderer = new SkillsRenderer(this.doc, this.config, this.yPosition, this.customFontsLoaded);
          this.yPosition = skillsRenderer.render(data.skills);
        }
        break;
        
      case 'projects':
        if (data.projects && data.projects.length > 0) {
          const projectsRenderer = new ProjectsRenderer(this.doc, this.config, this.yPosition, this.customFontsLoaded);
          this.yPosition = projectsRenderer.render(data.projects);
        }
        break;
        
      case 'certifications':
        if (data.certifications && data.certifications.length > 0) {
          const certificationsRenderer = new CertificationsRenderer(this.doc, this.config, this.yPosition, this.customFontsLoaded);
          this.yPosition = certificationsRenderer.render(data.certifications);
        }
        break;
        
      case 'involvements':
        if (data.involvements && data.involvements.length > 0) {
          const involvementRenderer = new InvolvementRenderer(this.doc, this.config, this.yPosition, this.customFontsLoaded);
          this.yPosition = involvementRenderer.render(data.involvements);
        }
        break;
        
      case 'coursework':
        if (data.coursework && data.coursework.length > 0) {
          const courseworkRenderer = new CourseworkRenderer(this.doc, this.config, this.yPosition, this.customFontsLoaded);
          this.yPosition = courseworkRenderer.render(data.coursework);
        }
        break;
        
      default:
        console.warn(`Unknown section type: ${sectionType}`);
        break;
    }
  }

  /**
   * Generate the PDF document
   */
  public async generate(resumeData: ResumeData): Promise<Blob> {
    // Load fonts first
    await this.loadCustomFonts().catch(err => {
      console.warn('Font loading failed, continuing with standard fonts:', err);
    });
    
    return this.renderDocument(resumeData);
  }

  /**
   * Generate the PDF document synchronously
   */
  public generateSync(resumeData: ResumeData): Blob {
    // Load fonts (this will be async but we'll handle it)
    this.loadCustomFonts().catch(err => {
      console.warn('Font loading failed, continuing with standard fonts:', err);
    });
    
    return this.renderDocument(resumeData);
  }

  /**
   * Render the complete document
   */
  private renderDocument(resumeData: ResumeData): Blob {
    // Convert RMS data to structured format for rendering
    const structuredData = this.convertRMSToStructured(resumeData.parsedData);
    
    // Get section order
    const sectionOrder = this.getSectionOrder(resumeData);
    
    // Render each section in order
    sectionOrder.forEach(sectionType => {
      this.renderSection(sectionType, structuredData);
    });
    
    // Generate the PDF blob
    return this.doc.output('blob');
  }

  /**
   * Get the current document instance (for advanced use cases)
   */
  public getDocument(): jsPDF {
    return this.doc;
  }

  /**
   * Get the current configuration
   */
  public getConfiguration(): PDFConfiguration {
    return this.config;
  }

  /**
   * Get the current Y position
   */
  public getCurrentYPosition(): number {
    return this.yPosition;
  }
}