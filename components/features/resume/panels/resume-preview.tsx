'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { AlertCircle, MapPin, Mail, Phone, Linkedin } from "lucide-react";
import { useToast } from "@/lib/client/hooks/ui/use-toast";
import { useAuth } from '@/contexts/firebase-auth-context';
import { useJobInfo } from '@/contexts/job-info-context';

import JobInfoPanel from "@/components/features/resume/panels/job-info-panel";
import ATSScorePanel from "@/components/features/resume/panels/ats-score-panel";
import SharePanel from "@/components/features/resume/panels/share-panel";
import { getDefaultSectionOrder, getSectionTitle } from '../sections/resume-sections';
import { InlineDraggableSection, InlineDraggableSectionsContainer } from '../sections/inline-draggable-section';
import { useResumeFont, useResumeStyles, useResumeTheme } from '@/lib/client/hooks/resume/use-resume-styles';
import { generateResumePDFAsync, ResumeData } from "@/lib/server/services/resume/pdf-generator";
import { ContactInfo } from "@/contexts/resume-data-context";
import ResumeHeaderBar, {ResumeHeaderBarRef} from "@/components/features/dashboard/resume-header-bar";
import KeywordTargetingPanel from "@/components/features/resume/panels/keyword-targeting-panel";
import ResumeEditorPanel from "@/components/features/resume/panels/resume-editor-panel";
import BulletList from "@/components/features/resume/panels/editable-bullet-list";


interface ResumePreviewProps {
  resumeData: Record<string, any>;
  resumeId: string;
  showJobPanels?: boolean;
  className?: string;
  initialTemplate?: string;
  onBulletAdded?: (experienceIndex: number, newBullet: string) => void;
  typewriterBullet?: {experienceIndex: number, bullet: string} | null;
  onTypewriterComplete?: (experienceIndex: number, newBullet: string) => void;
}

// Memoized components
const ResumeSection = memo(({
  title,
  children,
  styles
}: {
  title: string;
  children: React.ReactNode;
  styles: Record<string, any>;
}) => (
  <section>
    <h2 className="resume-section-header" style={styles.sectionHeader}>
      {title}
    </h2>
    {children}
  </section>
));

ResumeSection.displayName = 'ResumeSection';


// Contact icon component
const ContactIcon = memo(({ type, size = "0.9em", color }: { type: 'location' | 'email' | 'phone' | 'linkedin'; size?: string; color?: string }) => {
  const iconStyle = {
    width: size,
    height: size,
    fill: color || 'currentColor',
    stroke: 'white',
    strokeWidth: '0.5px',
    marginTop: '-2px',
    flexShrink: 0
  };

  switch (type) {
    case 'location':
      return <MapPin style={iconStyle} />;
    case 'email':
      return <Mail style={iconStyle} />;
    case 'phone':
      return <Phone style={iconStyle} />;
    case 'linkedin':
      return <Linkedin style={iconStyle} />;
    default:
      return null;
  }
});

ContactIcon.displayName = 'ContactIcon';

export default function ResumePreview({
  resumeData,
  resumeId,
  showJobPanels = true,
  className = "",
  initialTemplate = 'professional',
  onBulletAdded,
  typewriterBullet,
  onTypewriterComplete
}: ResumePreviewProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const headerBarRef = useRef<ResumeHeaderBarRef>(null);

  // State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>(() =>
    getDefaultSectionOrder(initialTemplate)
  );
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [bulletUpdateTrigger, setBulletUpdateTrigger] = useState(0);

  // Resume styles hook
  const {
    documentSettings,
    currentTemplate,
    styles: resumeStyles,
    css: resumeCSS,
    inlineStyles,
    paperDimensions,
    updateSetting,
    changeTemplate,
    isLoadingFromFirestore,
    isReady,
  } = useResumeStyles({
    initialTemplate,
    persistSettings: true,
    storageKey: `resume-settings-${resumeId}`,
    resumeId: resumeId,
    syncWithFirestore: true,
  });

  // Load custom fonts
  useResumeFont(documentSettings.fontFamily);

  // Get theme colors based on dark mode
  const theme = useResumeTheme(isDarkMode);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handlers
  const handleJobComplete = useCallback(() => {
    // Job panel will trigger a reload of job info
    window.location.reload();
  }, []);

  const handleJobUpdate = useCallback(() => {
    // Keyword panel update button clicked
  }, []);

  const handleBulletAdded = useCallback((experienceIndex: number, newBullet: string) => {
    // Update parent component's state
    onBulletAdded?.(experienceIndex, newBullet);
    // Trigger re-render of resume preview
    setBulletUpdateTrigger(prev => prev + 1);
  }, [onBulletAdded]);


  // Helper: Sanitize filename
  function sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_');
  }

  function getFontSize(fontSize: number): 'small' | 'medium' | 'large' | undefined {
    if (fontSize < 9) return 'small';
    if (fontSize > 12) return 'large';
    if (fontSize >= 9 && fontSize <= 12) return 'medium';
    return undefined; // fallback, though this line is technically unreachable
  }

  // The main function
  const handleDownloadPDF = async () => {
    try {
      // Extract contact info for filename
      const contact: ContactInfo = resumeData?.contact || resumeData?.contactInfo || {};
      const fullName = contact.fullName?.trim() || 'Resume';

      // Prepare data for PDF generator with complete template and document settings
      const resumeDataForPDF: ResumeData = {
        title: resumeData?.title || 'Resume',
        template: currentTemplate,
        fontStyle:
          documentSettings.fontFamily === 'Merriweather'
            ? 'elegant'
            : documentSettings.fontFamily === 'Times New Roman'
            ? 'professional'
            : 'modern',
        fontSize: getFontSize(documentSettings.fontSize), // strictly typed!
        parsedData: resumeData,
        // Add document settings for PDF generation (only supported properties)
        documentSettings: {
          fontFamily: documentSettings.fontFamily,
          fontSize: documentSettings.fontSize,
          margins: documentSettings.margins,
          paperSize: documentSettings.paperSize as "Letter" | "A4" | undefined,
        },
        sectionOrder: sectionOrder,
      };
  
      // Generate PDF Blob
      const pdfBlob = await generateResumePDFAsync(resumeDataForPDF);
  
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      const safeFilename = sanitizeFilename(fullName) || 'Resume';
      link.href = url;
      link.download = `${safeFilename}_Resume.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  
      // Success toast
      toast({
        title: "PDF Downloaded",
        description: "Your resume has been downloaded successfully.",
      });
    } catch (error) {
      // Error handling
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Utility functions
  const decodeHTMLEntities = (text: string): string => {
    if (!text) return '';
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  const parseBulletPoints = (text: string): string[] => {
    if (!text) return [];
    const decodedText = decodeHTMLEntities(text);

    // First try splitting by line breaks to preserve original formatting
    let splitPoints = decodedText.split(/\n/g);
    
    // If no line breaks found, try splitting by bullet markers with spaces around them
    if (splitPoints.length === 1) {
      splitPoints = decodedText.split(/\s+•\s+/g);
    }
    
    const bulletPoints = splitPoints
      .map((point: string) => point.trim())
      .filter((point: string) => point.length > 0)
      .map((point: string) => {
        // Clean up any leading markers
        const cleaned = point.replace(/^[•·▪-]\s*/, '').trim();
        // Don't auto-add periods as they may already be there
        return cleaned;
      })
      .filter((point: string) => point.length > 1); // Filter out single characters
    
    // Ensure at least one bullet point if text exists
    if (bulletPoints.length === 0 && decodedText) {
      return [decodedText.replace(/^[•·▪-]\s*/, '').trim()];
    }
    
    return bulletPoints;
  };

  const formatDate = (date: string | Date | null | undefined, format?: string) => {
    if (!date) return '';

    // Handle Firestore Timestamp objects
    if (typeof date === 'object' && date !== null && 'seconds' in date) {
      const dateObj = new Date((date as any).seconds * 1000);
      if (format === 'MMM YYYY') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
      } else if (format === 'YYYY') {
        return dateObj.getFullYear().toString();
      } else {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
      }
    }

    if (typeof date === 'string') {
      if (date.toLowerCase() === 'present') return 'Present';
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return date;

      if (format === 'MMM YYYY') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
      } else if (format === 'YYYY') {
        return dateObj.getFullYear().toString();
      } else {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
      }
    }

    // Handle Date objects
    if (date instanceof Date) {
      if (format === 'MMM YYYY') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
      } else if (format === 'YYYY') {
        return date.getFullYear().toString();
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
      }
    }

    return String(date);
  };

  const handleSectionOrderChange = useCallback((newOrder: string[]) => {
    setSectionOrder(newOrder);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`resume-section-order-${resumeId}`, JSON.stringify(newOrder));
    }
  }, [resumeId]);

  const handleSectionReorder = useCallback((dragIndex: number, dropIndex: number) => {
    const newOrder = [...sectionOrder];
    const [draggedSection] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, draggedSection);
    handleSectionOrderChange(newOrder);
  }, [sectionOrder, handleSectionOrderChange]);

  const handleAutoAdjust = async () => {
    toast({
      title: "Auto-adjust Applied",
      description: "Resume layout has been automatically optimized.",
    });
  };

  const handleTemplateChange = async (templateId: string) => {
    try {
      changeTemplate(templateId);
      const templateName = templateId.charAt(0).toUpperCase() + templateId.slice(1).toLowerCase();
      toast({
        title: "Template Changed",
        description: `Resume template changed to ${templateName}.`,
      });
    } catch (error) {
      console.error('Error changing template:', error);
    }
  };



  // Early return if no data
  if (!resumeData) {
    return (
      <div className={`w-full max-w-7xl mx-auto p-8 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">No Resume Data</h3>
            <p className="text-yellow-700 mt-1">
              No resume data is available to preview. Please add some information in the other sections first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Extract contact data from RMS format
  const contact = {
    fullName: resumeData.rms_contact_fullname || resumeData.rms_contact_fullName || 'Your Name',
    email: resumeData.rms_contact_email || '',
    phone: resumeData.rms_contact_phone || '',
    linkedin: resumeData.rms_contact_linkedin || '',
    city: resumeData.rms_contact_city || '',
    state: resumeData.rms_contact_state || '',
    country: resumeData.rms_contact_country || resumeData.rms_contact_countrycode || ''
  };
  
  const fullName = contact.fullName;

  // Resume content component
  const ResumeContent = memo(() => {
    // Extract experience data from RMS format
    const experienceCount = resumeData.rms_experience_count || 0;
    const experiences = [];
    for (let i = 0; i < experienceCount; i++) {
      experiences.push({
        id: `exp_${i}`,
        company: resumeData[`rms_experience_${i}_company`] || '',
        title: resumeData[`rms_experience_${i}_role`] || '',
        position: resumeData[`rms_experience_${i}_role`] || '',
        location: resumeData[`rms_experience_${i}_location`] || '',
        dateBegin: resumeData[`rms_experience_${i}_datebegin`] || '',
        dateEnd: resumeData[`rms_experience_${i}_dateend`] || '',
        startDate: resumeData[`rms_experience_${i}_datebegin`] || '',
        endDate: resumeData[`rms_experience_${i}_dateend`] || '',
        description: resumeData[`rms_experience_${i}_description`] || '',
        bulletPoints: (resumeData[`rms_experience_${i}_description`] || '').split('\n').filter((p: string) => p.trim()),
        isCurrent: resumeData[`rms_experience_${i}_iscurrent`] || false
      });
    }

    // Extract education data from RMS format
    const educationCount = resumeData.rms_education_count || 0;
    const education = [];
    for (let i = 0; i < educationCount; i++) {
      education.push({
        id: `edu_${i}`,
        institution: resumeData[`rms_education_${i}_institution`] || '',
        school: resumeData[`rms_education_${i}_institution`] || '',
        qualification: resumeData[`rms_education_${i}_qualification`] || '',
        degree: resumeData[`rms_education_${i}_qualification`] || '',
        location: resumeData[`rms_education_${i}_location`] || '',
        date: resumeData[`rms_education_${i}_date`] || '',
        gpa: resumeData[`rms_education_${i}_gpa`] || '',
        isGraduate: resumeData[`rms_education_${i}_isgraduate`] || false
      });
    }

    // Extract skills data from RMS format
    const skillCount = resumeData.rms_skill_count || 0;
    const skills = [];
    for (let i = 0; i < skillCount; i++) {
      skills.push({
        id: `skill_${i}`,
        category: resumeData[`rms_skill_${i}_category`] || '',
        name: resumeData[`rms_skill_${i}_category`] || '',
        keywords: resumeData[`rms_skill_${i}_keywords`] || '',
        skills: resumeData[`rms_skill_${i}_keywords`] || ''
      });
    }
    
    // Debug skills extraction
    if (skills.length > 0) {
      console.log('🔍 Skills extracted in preview:', skills.map(s => ({ 
        category: s.category, 
        keywords: s.keywords?.substring(0, 30) + '...' 
      })));
    }

    // Extract involvement data from RMS format
    const involvementCount = resumeData.rms_involvement_count || 0;
    const involvement = [];
    for (let i = 0; i < involvementCount; i++) {
      involvement.push({
        id: `inv_${i}`,
        organization: resumeData[`rms_involvement_${i}_organization`] || '',
        role: resumeData[`rms_involvement_${i}_role`] || '',
        location: resumeData[`rms_involvement_${i}_location`] || '',
        dateBegin: resumeData[`rms_involvement_${i}_datebegin`] || '',
        dateEnd: resumeData[`rms_involvement_${i}_dateend`] || '',
        description: resumeData[`rms_involvement_${i}_description`] || ''
      });
    }

    // Extract projects data from RMS format  
    const projectCount = resumeData.rms_project_count || 0;
    const projects = [];
    for (let i = 0; i < projectCount; i++) {
      projects.push({
        id: `project_${i}`,
        title: resumeData[`rms_project_${i}_title`] || '',
        name: resumeData[`rms_project_${i}_title`] || '',
        description: resumeData[`rms_project_${i}_description`] || '',
        url: resumeData[`rms_project_${i}_url`] || '',
        repository: resumeData[`rms_project_${i}_url`] || '',
        dateBegin: resumeData[`rms_project_${i}_dateBegin`] || '',
        dateEnd: resumeData[`rms_project_${i}_dateEnd`] || '',
        organization: resumeData[`rms_project_${i}_organization`] || ''
      });
    }

    // Safe array access helper
    const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];

    // Section components map
    const sectionComponents: Record<string, React.ReactNode> = {
      summary: resumeData.rms_summary && (
        <ResumeSection key="summary" title={getSectionTitle('summary', currentTemplate)} styles={inlineStyles}>
          <p className="resume-summary" style={inlineStyles.bodyText}>
            {resumeData.rms_summary}
          </p>
        </ResumeSection>
      ),

      experience: experiences.length > 0 && (
        <ResumeSection key="experience" title={getSectionTitle('experience', currentTemplate)} styles={inlineStyles}>
          {experiences.map((exp: any, idx: number) => (
            <div key={exp.id || idx} className="resume-experience-block" style={{ marginBottom: currentTemplate === 'alternative' ? '2rem' : `${resumeStyles.spacing.blockGap}rem` }}>
              {currentTemplate === 'modern' ? (
                <>
                  <div style={{ marginBottom: '0.1rem' }}>
                    <span className="resume-job-title" style={{ ...inlineStyles.jobTitle, color: '#2563eb' }}>
                      {decodeHTMLEntities(exp.position || exp.title || 'Position')}
                    </span>
                    <span style={{ ...inlineStyles.bodyText, margin: '0 0.4rem' }}>|</span>
                    <span className="resume-company" style={{ ...inlineStyles.company, fontStyle: 'normal', color: '#1f2937', fontWeight: 600, fontSize: `${parseFloat(inlineStyles.company.fontSize) * 1.05}pt` }}>
                      {decodeHTMLEntities(exp.company || 'Company')}
                    </span>
                  </div>
                  <div style={{ ...inlineStyles.detailText, marginBottom: '0.2rem', color: '#9ca3af' }}>
                    {formatDate(exp.dateBegin || exp.startDate)} - {formatDate(exp.dateEnd || exp.endDate)}
                    {exp.location && `, ${decodeHTMLEntities(exp.location)}`}
                  </div>
                </>
              ) : currentTemplate === 'minimal' || currentTemplate === 'bold' ? (
                <>
                  <div style={{ marginBottom: '0.1rem', lineHeight: '1.2' }}>
                    <span className="resume-job-title" style={{ ...inlineStyles.jobTitle, fontWeight: 500 }}>
                      {decodeHTMLEntities(exp.position || exp.title || 'Position')}
                    </span>
                    <span style={{ ...inlineStyles.bodyText, margin: '0 0.4rem', fontWeight: 400 }}> | </span>
                    <span className="resume-company" style={{ ...inlineStyles.company, fontStyle: 'normal' }}>
                      {decodeHTMLEntities(exp.company || 'Company')}
                    </span>
                    <span style={{ ...inlineStyles.bodyText, margin: '0 0.4rem', fontWeight: 400 }}> | </span>
                    <span style={{ ...inlineStyles.bodyText, fontWeight: 600 }}>
                      {exp.location ? decodeHTMLEntities(exp.location) : 'Location'}
                    </span>
                    <span style={{ ...inlineStyles.bodyText, margin: '0 0.4rem', fontWeight: 400 }}> | </span>
                    <span style={{ ...inlineStyles.bodyText, fontWeight: 600 }}>
                      {formatDate(exp.dateBegin || exp.startDate)} - {formatDate(exp.dateEnd || exp.endDate)}
                    </span>
                  </div>
                </>
              ) : currentTemplate === 'alternative' ? (
                <>
                  {/* Two-column layout for Alternative template */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'start' }}>
                    {/* Left column: Job title, dates */}
                    <div style={{ paddingRight: '0.5rem' }}>
                      <h3 style={{ ...inlineStyles.jobTitle, marginBottom: '0.1rem', fontSize: `${resumeStyles.fontSizes.jobTitle * 0.9}pt`, fontStyle: 'normal', fontFamily: 'inherit', fontWeight: 700 }}>
                        {decodeHTMLEntities(exp.position || exp.title || 'Position')}
                      </h3>
                      <div style={{ ...inlineStyles.detailText, fontSize: `${resumeStyles.fontSizes.detail * 0.95}pt`, color: '#6b7280' }}>
                        {formatDate(exp.dateBegin || exp.startDate)} - {formatDate(exp.dateEnd || exp.endDate)}
                      </div>
                    </div>
                    
                    {/* Right column: Company, location, description */}
                    <div>
                      <div style={{ position: 'relative', paddingLeft: '1rem' }}>
                        <div style={{ 
                          position: 'absolute', 
                          left: 0, 
                          top: '0.2rem', 
                          width: '6px', 
                          height: '6px', 
                          backgroundColor: '#9ca3af', 
                          borderRadius: '50%' 
                        }} />
                        <div style={{ ...inlineStyles.bodyText, marginBottom: '0.1rem', fontSize: `${resumeStyles.fontSizes.body * 0.9}pt`, fontStyle: 'normal' }}>
                          <span style={{ fontWeight: 700, fontStyle: 'normal' }}>{decodeHTMLEntities(exp.company || 'Company')}</span>
                          {exp.location && (
                            <>
                              <span style={{ margin: '0 0.3rem' }}>|</span>
                              <span style={{ fontStyle: 'normal' }}>{decodeHTMLEntities(exp.location)}</span>
                            </>
                          )}
                        </div>
                        {(exp.bulletPoints || exp.description) && (
                          <div style={{ ...inlineStyles.bodyText, fontSize: `${resumeStyles.fontSizes.body * 0.85}pt`, lineHeight: 1.3 }}>
                            {/* Convert bullet points to single paragraph */}
                            {exp.bulletPoints && exp.bulletPoints.length > 0 
                              ? exp.bulletPoints.join(' ') 
                              : exp.description || ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '0.05rem' }}>
                    <h3 className="resume-job-title" style={inlineStyles.jobTitle}>
                      {decodeHTMLEntities(exp.position || exp.title || 'Position')}
                    </h3>
                  </div>
                  <div className="resume-company" style={{
                    ...inlineStyles.company,
                    fontWeight: 600,
                    fontStyle: 'normal',
                    color: '#000000'
                  }}>
                    <span style={{
                      fontWeight: 600,
                      fontStyle: 'normal',
                      color: '#000000'
                    }}>{decodeHTMLEntities(exp.company || 'Company')}</span>
                    <span className="resume-date" style={{
                      ...inlineStyles.date,
                      fontWeight: 600,
                      fontStyle: 'normal',
                      color: '#000000'
                    }}>
                      {formatDate(exp.dateBegin || exp.startDate)} - {formatDate(exp.dateEnd || exp.endDate)}
                      {exp.location && `, ${decodeHTMLEntities(exp.location)}`}
                    </span>
                  </div>
                </>
              )}
              {exp.description && currentTemplate !== 'alternative' && (
                <BulletList
                  items={parseBulletPoints(exp.description || '')}
                  styles={inlineStyles}
                  key={`${exp.id}-${bulletUpdateTrigger}`}
                  typewriterText={typewriterBullet?.experienceIndex === idx ? typewriterBullet.bullet : undefined}
                  isTypewriting={typewriterBullet?.experienceIndex === idx}
                  onTypewriterComplete={onTypewriterComplete ? () => onTypewriterComplete(idx, typewriterBullet?.bullet || '') : undefined}
                />
              )}
            </div>
          ))}
        </ResumeSection>
      ),

      education: education.length > 0 && (
        <ResumeSection key="education" title={getSectionTitle('education', currentTemplate)} styles={inlineStyles}>
          {education.map((edu: any, idx: number) => {
            // Parse institution name to extract location if present
            let institutionName = edu.institution || edu.school || 'Institution';
            let location = edu.location;
            
            // Check if institution contains comma (indicating embedded location)
            if (institutionName.includes(',') && !location) {
              const parts = institutionName.split(',');
              institutionName = parts[0].trim();
              location = parts.slice(1).join(',').trim();
            } else if (institutionName.includes(',')) {
              // Even if location exists, extract just the institution name
              const parts = institutionName.split(',');
              institutionName = parts[0].trim();
            }
            
            return (
              <div key={edu.id || idx} className="resume-education-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
                {currentTemplate === 'modern' ? (
                  <>
                    <div style={{ marginBottom: '0.1rem' }}>
                      <span className="resume-degree-title" style={{ ...inlineStyles.jobTitle, color: '#2563eb' }}>
                        {edu.qualification && edu.fieldOfStudy ?
                          `${edu.qualification} in ${edu.fieldOfStudy}` :
                          edu.qualification || edu.degree || 'Degree'}
                      </span>
                      <span style={{ ...inlineStyles.bodyText, margin: '0 0.4rem' }}>|</span>
                      <span className="resume-school-info" style={{ ...inlineStyles.company, fontStyle: 'normal', color: '#1f2937', fontWeight: 600, fontSize: `${parseFloat(inlineStyles.company.fontSize) * 1.05}pt` }}>
                        {institutionName}
                      </span>
                    </div>
                    <div style={{ ...inlineStyles.detailText, marginBottom: '0.2rem', color: '#9ca3af' }}>
                      {edu.date && formatDate(edu.date, edu.dateFormat)}
                      {location && edu.date && `, `}
                      {location}
                    </div>
                    {edu.gpa && (
                      <div className="resume-detail-text" style={{ ...inlineStyles.detailText, color: '#9ca3af' }}>
                        GPA: {edu.gpa}
                      </div>
                    )}
                  </>
                ) : currentTemplate === 'alternative' ? (
                  <>
                    {/* Two-column layout for Alternative template - Education */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'start' }}>
                      {/* Left column: Degree */}
                      <div style={{ paddingRight: '0.5rem' }}>
                        <div className="resume-degree-title" style={{ ...inlineStyles.jobTitle, fontSize: `${resumeStyles.fontSizes.jobTitle * 0.9}pt` }}>
                          {edu.qualification && edu.fieldOfStudy ?
                            `${edu.qualification} in ${edu.fieldOfStudy}` :
                            edu.qualification || edu.degree || 'Degree'}
                        </div>
                      </div>
                      
                      {/* Right column: School, location, date, GPA */}
                      <div>
                        <div className="resume-school-info" style={{ ...inlineStyles.bodyText, marginBottom: '0.1rem', fontSize: `${resumeStyles.fontSizes.body * 0.9}pt`, fontStyle: 'normal' }}>
                          <span style={{ fontWeight: 500, fontStyle: 'normal' }}>{institutionName}</span>
                          {location && (
                            <>
                              <span style={{ margin: '0 0.3rem' }}>|</span>
                              <span style={{ fontStyle: 'normal' }}>{location}</span>
                            </>
                          )}
                        </div>
                        <div style={{ ...inlineStyles.detailText, fontSize: `${resumeStyles.fontSizes.detail * 0.85}pt` }}>
                          {edu.date && formatDate(edu.date, edu.dateFormat)}
                          {edu.gpa && edu.date && <span style={{ margin: '0 0.3rem' }}>|</span>}
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                        </div>
                      </div>
                    </div>
                  </>
                ) : currentTemplate === 'minimal' || currentTemplate === 'bold' ? (
                  <>
                    <div style={{ marginBottom: '0.1rem', lineHeight: '1.1' }}>
                      <span className="resume-degree-title" style={{ ...inlineStyles.jobTitle, fontWeight: 500 }}>
                        {edu.qualification && edu.fieldOfStudy ?
                          `${edu.qualification} in ${edu.fieldOfStudy}` :
                          edu.qualification || edu.degree || 'Degree'}
                      </span>
                      {edu.minor && (
                        <>
                          <span style={{ ...inlineStyles.bodyText, margin: '0 0.4rem', fontWeight: 400 }}> | </span>
                          <span style={{ ...inlineStyles.bodyText, fontWeight: 400 }}>
                            Minor: {edu.minor}
                          </span>
                        </>
                      )}
                      <span style={{ ...inlineStyles.bodyText, margin: '0 0.4rem', fontWeight: 400 }}> | </span>
                      <span className="resume-school-info" style={{ ...inlineStyles.bodyText, fontStyle: 'normal', fontWeight: 400 }}>
                        {institutionName}
                      </span>
                      <span style={{ ...inlineStyles.bodyText, margin: '0 0.4rem', fontWeight: 400 }}> | </span>
                      <span style={{ ...inlineStyles.bodyText, fontWeight: 600 }}>
                        {edu.date ? formatDate(edu.date, edu.dateFormat) : 'Graduation Date'}
                      </span>
                    </div>
                    {(edu.gpa || location || edu.description) && (
                      <div style={{ ...inlineStyles.detailText, marginBottom: '0.1rem', lineHeight: '1.1' }}>
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                        {edu.gpa && location && <span style={{ margin: '0 0.4rem' }}> | </span>}
                        {location && <span>{location}</span>}
                        {(edu.gpa || location) && edu.description && <span style={{ margin: '0 0.4rem' }}> | </span>}
                        {edu.description && <span>{edu.description}</span>}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="resume-degree-title" style={inlineStyles.jobTitle}>
                      {edu.qualification && edu.fieldOfStudy ?
                        `${edu.qualification} in ${edu.fieldOfStudy}` :
                        edu.qualification || edu.degree || 'Degree'}
                    </div>
                    <div className="resume-school-info" style={inlineStyles.bodyText}>
                      {institutionName}
                      {location && ` • ${location}`}
                      {edu.date && ` • ${formatDate(edu.date, edu.dateFormat)}`}
                    </div>
                    {edu.gpa && (
                      <div className="resume-detail-text" style={inlineStyles.detailText}>
                        GPA: {edu.gpa}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </ResumeSection>
      ),

      skills: skills.length > 0 && (
        <ResumeSection key="skills" title={getSectionTitle('skills', currentTemplate)} styles={inlineStyles}>
          {skills.map((category: any, idx: number) => (
            <div key={category.id || idx} className="resume-skills-category" style={{ ...inlineStyles.bodyText, marginBottom: `${resumeStyles.spacing.bulletGap}rem` }}>
              <span className="resume-skills-title" style={{ fontWeight: 700 }}>
                {category.category || category.name}:
              </span>
              <span>
                {' '}
                {category.keywords || category.skills || ''}
              </span>
            </div>
          ))}
        </ResumeSection>
      ),

      projects: projects.length > 0 && (
        <ResumeSection key="projects" title={getSectionTitle('projects', currentTemplate)} styles={inlineStyles}>
          {projects.map((project: any, idx: number) => (
            <div key={project.id || idx} className="resume-project-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              {currentTemplate === 'alternative' ? (
                <>
                  {/* Two-column layout for Alternative template - Projects */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'start' }}>
                    {/* Left column: Project title */}
                    <div style={{ paddingRight: '0.5rem' }}>
                      <h3 className="resume-project-title" style={{ ...inlineStyles.jobTitle, fontSize: `${resumeStyles.fontSizes.jobTitle * 0.9}pt` }}>
                        {project.title || project.name || 'Project'}
                      </h3>
                    </div>
                    
                    {/* Right column: URL, dates, description */}
                    <div>
                      {(project.url || project.repository || project.dateBegin || project.dateEnd) && (
                        <div className="resume-company" style={{ ...inlineStyles.company, marginBottom: '0.1rem', fontSize: `${resumeStyles.fontSizes.body * 0.9}pt`, fontStyle: 'normal' }}>
                          {(project.url || project.repository) && (
                            <span style={{ fontWeight: 500, fontStyle: 'normal' }}>{project.url || project.repository}</span>
                          )}
                          {(project.url || project.repository) && (project.dateBegin || project.dateEnd) && (
                            <span style={{ margin: '0 0.3rem' }}>•</span>
                          )}
                          {(project.dateBegin || project.dateEnd) && (
                            <span style={{ fontStyle: 'normal' }}>{formatDate(project.dateBegin)} {project.dateBegin && project.dateEnd && '—'} {formatDate(project.dateEnd)}</span>
                          )}
                        </div>
                      )}
                      {project.description && (
                        <div style={{ ...inlineStyles.bodyText, fontSize: `${resumeStyles.fontSizes.body * 0.85}pt`, lineHeight: 1.3 }}>
                          {/* Convert bullet points to single paragraph */}
                          {parseBulletPoints(project.description).join(' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '0.05rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h3 className="resume-project-title" style={inlineStyles.jobTitle}>
                        {project.title || project.name || 'Project'}
                      </h3>
                      {(project.dateBegin || project.dateEnd) && (
                        <span className="resume-date" style={inlineStyles.date}>
                          {formatDate(project.dateBegin)} {project.dateBegin && project.dateEnd && '—'} {formatDate(project.dateEnd)}
                        </span>
                      )}
                    </div>
                  </div>
                  {(project.url || project.repository) && (
                    <div className="resume-company" style={{ ...inlineStyles.company, marginBottom: `${resumeStyles.spacing.bulletGap}rem` }}>
                      {project.url || project.repository}
                    </div>
                  )}
                  {project.description && (
                    <BulletList
                      items={parseBulletPoints(project.description)}
                      styles={inlineStyles}
                      key={`project-${project.id || idx}-${bulletUpdateTrigger}`}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </ResumeSection>
      ),

      certifications: safeArray(resumeData.certifications).length > 0 && (
        <ResumeSection key="certifications" title={getSectionTitle('certifications', currentTemplate)} styles={inlineStyles}>
          {safeArray(resumeData.certifications).map((cert: any, idx: number) => (
            <div key={cert.id || idx} style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={inlineStyles.jobTitle}>
                    {cert.name || 'Certification'}
                  </h3>
                  <p style={inlineStyles.detailText}>
                    {cert.issuer || 'Issuing Organization'}
                  </p>
                </div>
                <p className="resume-date" style={inlineStyles.date}>
                  {formatDate(cert.date)}
                </p>
              </div>
              {cert.description && (
                <p style={{ ...inlineStyles.detailText, marginTop: `${resumeStyles.spacing.bulletGap}rem` }}>
                  {cert.description}
                </p>
              )}
            </div>
          ))}
        </ResumeSection>
      ),

      involvement: involvement.length > 0 && (
        <ResumeSection key="involvement" title={getSectionTitle('involvement', currentTemplate)} styles={inlineStyles}>
          {involvement.map((inv: any, idx: number) => (
            <div key={inv.id || idx} className="resume-involvement-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              {currentTemplate === 'alternative' ? (
                <>
                  {/* Two-column layout for Alternative template - Involvement */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', alignItems: 'start' }}>
                    {/* Left column: Role title, dates */}
                    <div style={{ paddingRight: '0.5rem' }}>
                      <div style={{ position: 'relative', paddingLeft: '1rem' }}>
                        <div style={{ 
                          position: 'absolute', 
                          left: 0, 
                          top: '0.2rem', 
                          width: '6px', 
                          height: '6px', 
                          backgroundColor: '#9ca3af', 
                          borderRadius: '50%' 
                        }} />
                        <h3 className="resume-involvement-title" style={{ ...inlineStyles.jobTitle, marginBottom: '0.1rem', fontSize: `${resumeStyles.fontSizes.jobTitle * 0.9}pt` }}>
                          {inv.role || 'Role'}
                        </h3>
                        <div style={{ ...inlineStyles.detailText, fontSize: `${resumeStyles.fontSizes.detail * 0.85}pt` }}>
                          {formatDate(inv.dateBegin)}{inv.dateBegin && inv.dateEnd && ' - '}{formatDate(inv.dateEnd)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right column: Organization, location, description */}
                    <div>
                      <div style={{ ...inlineStyles.bodyText, marginBottom: '0.1rem', fontSize: `${resumeStyles.fontSizes.body * 0.9}pt`, fontStyle: 'normal' }}>
                        {inv.organization && <span style={{ fontWeight: 500, fontStyle: 'normal' }}>{inv.organization}</span>}
                        {inv.organization && inv.location && <span style={{ margin: '0 0.3rem' }}>|</span>}
                        {inv.location && <span style={{ fontStyle: 'normal' }}>{inv.location}</span>}
                      </div>
                      {inv.description && (
                        <div style={{ ...inlineStyles.bodyText, fontSize: `${resumeStyles.fontSizes.body * 0.85}pt`, lineHeight: 1.3 }}>
                          {/* Convert bullet points to single paragraph */}
                          {parseBulletPoints(inv.description).join(' ')}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Role title */}
                  <div className="flex gap-2">
                    <h3 className="resume-involvement-title" style={inlineStyles.jobTitle}>
                      {inv.role || 'Role'}
                    </h3>
                  </div>
                  
                  {/* Location, Organization, and Dates on same line with bullet separators */}
                  <div className="flex justify-between gap-2 font-semibold">
                    <div className="flex flex-wrap" style={{ ...inlineStyles.detailText, fontWeight: 'normal', fontSize: '0.65em', lineHeight: '1.5' }}>
                      {inv.location && (
                        <span className="flex before:mr-1 before:ml-1 before:content-['•'] before:first:hidden before:first:ml-0">
                          {inv.location}
                        </span>
                      )}
                      {inv.organization && (
                        <span className="flex before:mr-1 before:ml-1 before:content-['•'] before:first:hidden before:first:ml-0">
                          {inv.organization}
                        </span>
                      )}
                      {(inv.dateBegin || inv.dateEnd) && (
                        <span className="flex before:mr-1 before:ml-1 before:content-['•'] before:first:hidden before:first:ml-0">
                          {formatDate(inv.dateBegin)}{inv.dateBegin && inv.dateEnd && ' - '}{formatDate(inv.dateEnd)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {inv.description && (
                    <BulletList
                      items={parseBulletPoints(inv.description)}
                      styles={inlineStyles}
                      key={`involvement-${inv.id || idx}-${bulletUpdateTrigger}`}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </ResumeSection>
      ),

      coursework: safeArray(resumeData.coursework).length > 0 && (
        <ResumeSection key="coursework" title={getSectionTitle('coursework', currentTemplate)} styles={inlineStyles}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: `${resumeStyles.spacing.bulletGap}rem`,
            marginTop: `-${resumeStyles.spacing.bulletGap}rem`
          }}>
            {safeArray(resumeData.coursework).map((course: any, idx: number) => (
              <div key={course.id || idx} style={inlineStyles.detailText}>
                <span style={{ fontWeight: 700 }}>
                  {course.name}
                </span>
                {course.department && (
                  <span style={{ fontWeight: 400 }}> - {course.department}</span>
                )}
              </div>
            ))}
          </div>
        </ResumeSection>
      ),

      awards: safeArray(resumeData.awards).length > 0 && (
        <ResumeSection key="awards" title={getSectionTitle('awards', currentTemplate)} styles={inlineStyles}>
          {safeArray(resumeData.awards).map((award: any, idx: number) => (
            <div key={award.id || idx} style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={inlineStyles.jobTitle}>
                    {award.title || award.name || 'Award'}
                  </h3>
                  <p style={inlineStyles.detailText}>
                    {award.issuer || award.organization || 'Issuing Organization'}
                  </p>
                  {award.description && (
                    <p style={{ ...inlineStyles.bodyText, marginTop: `${resumeStyles.spacing.bulletGap}rem` }}>
                      {award.description}
                    </p>
                  )}
                </div>
                {award.date && (
                  <p style={{ ...inlineStyles.detailText, fontStyle: 'italic', marginLeft: '1rem' }}>
                    {formatDate(award.date)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </ResumeSection>
      ),

      publications: safeArray(resumeData.publications).length > 0 && (
        <ResumeSection key="publications" title={getSectionTitle('publications', currentTemplate)} styles={inlineStyles}>
          {safeArray(resumeData.publications).map((pub: any, idx: number) => (
            <div key={pub.id || idx} style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              <div style={inlineStyles.bodyText}>
                <span style={{ fontWeight: 700 }}>{pub.title}</span>
                {pub.authors && <span> - {pub.authors}</span>}
                {pub.journal && <span>, {pub.journal}</span>}
                {pub.date && <span>, {formatDate(pub.date)}</span>}
              </div>
              {pub.description && (
                <p style={{ ...inlineStyles.detailText, marginTop: `${resumeStyles.spacing.bulletGap}rem` }}>
                  {pub.description}
                </p>
              )}
            </div>
          ))}
        </ResumeSection>
      ),

      languages: safeArray(resumeData.languages).length > 0 && (
        <ResumeSection key="languages" title={getSectionTitle('languages', currentTemplate)} styles={inlineStyles}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${resumeStyles.spacing.sectionGap}rem` }}>
            {safeArray(resumeData.languages).map((lang: any, idx: number) => (
              <div key={lang.id || idx} style={inlineStyles.bodyText}>
                <span style={{ fontWeight: 700 }}>
                  {lang.name}
                </span>
                {lang.proficiency && (
                  <span style={{ fontWeight: 400 }}> - {lang.proficiency}</span>
                )}
              </div>
            ))}
          </div>
        </ResumeSection>
      ),

      volunteer: safeArray(resumeData.volunteer).length > 0 && (
        <ResumeSection key="volunteer" title={getSectionTitle('volunteer', currentTemplate)} styles={inlineStyles}>
          {safeArray(resumeData.volunteer).map((vol: any, idx: number) => (
            <div key={vol.id || idx} className="resume-experience-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              <div style={{ marginBottom: '0.05rem' }}>
                <h3 className="resume-job-title" style={inlineStyles.jobTitle}>
                  {decodeHTMLEntities(vol.role || vol.title || 'Volunteer Position')}
                </h3>
              </div>
              <div className="resume-company" style={inlineStyles.company}>
                <span>{decodeHTMLEntities(vol.organization || 'Organization')}</span>
                <span className="resume-date" style={inlineStyles.date}>
                  {formatDate(vol.startDate)} - {formatDate(vol.endDate || (vol.current ? 'Present' : ''))}
                  {vol.location && `, ${decodeHTMLEntities(vol.location)}`}
                </span>
              </div>
              {vol.description && (
                <BulletList
                  items={parseBulletPoints(vol.description)}
                  styles={inlineStyles}
                  key={`volunteer-${vol.id || idx}-${bulletUpdateTrigger}`}
                />
              )}
            </div>
          ))}
        </ResumeSection>
      ),

      references: safeArray(resumeData.references).length > 0 && (
        <ResumeSection key="references" title={getSectionTitle('references', currentTemplate)} styles={inlineStyles}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: documentSettings.paperSize === 'Letter' ? 'repeat(2, 1fr)' : '1fr',
            gap: `${resumeStyles.spacing.sectionGap}rem`
          }}>
            {safeArray(resumeData.references).map((ref: any, idx: number) => (
              <div key={ref.id || idx}>
                <div style={{ ...inlineStyles.bodyText, fontWeight: 700 }}>
                  {ref.name}
                </div>
                {ref.title && (
                  <div style={inlineStyles.detailText}>{ref.title}</div>
                )}
                {ref.company && (
                  <div style={inlineStyles.detailText}>{ref.company}</div>
                )}
                {ref.email && (
                  <div style={inlineStyles.detailText}>{ref.email}</div>
                )}
                {ref.phone && (
                  <div style={inlineStyles.detailText}>{ref.phone}</div>
                )}
              </div>
            ))}
          </div>
        </ResumeSection>
      ),
    };

    // Alternative template uses two-column layout
    if (currentTemplate === 'alternative') {
      return (
        <div className="resume-container" style={inlineStyles.container}>
          {/* Triangular gradient background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '35%',
            zIndex: -1,
            overflow: 'hidden'
          }}>
            {/* Left triangle - light blue */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(147, 197, 253, 0.1)',
              clipPath: 'polygon(0% 0%, 40% 0%, 40% 50%, 0% 100%)',
              zIndex: -2
            }} />
            
            {/* Right triangle - light green */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(134, 239, 172, 0.1)',
              clipPath: 'polygon(40% 0%, 100% 0%, 100% 100%, 40% 50%)',
              zIndex: -1
            }} />
          </div>
          
          <div style={{
            padding: resumeStyles.spacing.documentPadding,
            minHeight: '11in',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            {/* Contact Information - Always First */}
            <header>
              {/* Split name into first and last for Alternative template */}
              {(() => {
                const nameParts = fullName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                
                return (
                  <div>
                    <div className="resume-name" style={{
                      ...inlineStyles.name,
                      fontSize: `${resumeStyles.fontSizes.name * 1.1}pt`,
                      lineHeight: 1.1,
                      marginBottom: '0.1rem'
                    }}>
                      {firstName}
                    </div>
                    {lastName && (
                      <div className="resume-name" style={{
                        ...inlineStyles.name,
                        fontSize: `${resumeStyles.fontSizes.name * 1.1}pt`,
                        lineHeight: 1.1,
                        marginBottom: '0.3rem'
                      }}>
                        {lastName}
                      </div>
                    )}
                  </div>
                );
              })()}
              
              <div className={`resume-contact ${documentSettings.showIcons ? 'flex flex-row items-center gap-1 flex-wrap' : ''}`} style={{
                ...inlineStyles.contact,
                paddingBottom: '1rem',
                ...(documentSettings.showIcons && {
                  justifyContent: 'center'
                })
              }}>
                {contact.city && contact.state && (
                  <span className={documentSettings.showIcons ? 'flex flex-row items-center gap-1' : ''}>
                    {documentSettings.showIcons && <ContactIcon type="location" color={inlineStyles.contact.color} />}
                    <span>{contact.city}, {contact.state}</span>
                    {contact.country && contact.country !== 'United States' && <span>, {contact.country}</span>}
                    {!documentSettings.showIcons && (contact.email || contact.phone || contact.linkedin) && <span> • </span>}
                  </span>
                )}
                {contact.email && (
                  <span className={documentSettings.showIcons ? 'flex flex-row items-center gap-1' : ''}>
                    {documentSettings.showIcons && <ContactIcon type="email" color={inlineStyles.contact.color} />}
                    <span>{contact.email}</span>
                    {!documentSettings.showIcons && (contact.phone || contact.linkedin) && <span> • </span>}
                  </span>
                )}
                {contact.phone && (
                  <span className={documentSettings.showIcons ? 'flex flex-row items-center gap-1' : ''}>
                    {documentSettings.showIcons && <ContactIcon type="phone" color={inlineStyles.contact.color} />}
                    <span>{contact.phone}</span>
                    {!documentSettings.showIcons && contact.linkedin && <span> • </span>}
                  </span>
                )}
                {contact.linkedin && (
                  <span className={documentSettings.showIcons ? 'flex flex-row items-center gap-1' : ''}>
                    {documentSettings.showIcons && <ContactIcon type="linkedin" color={inlineStyles.contact.color} />}
                    <span>in/{contact.linkedin.replace(/^.*\/in\//, '')}</span>
                  </span>
                )}
              </div>
            </header>

            {/* Two-column layout for sections */}
            <InlineDraggableSectionsContainer>
              {sectionOrder
                .filter(sectionId => sectionComponents[sectionId])
                .map((sectionId, index) => (
                  <InlineDraggableSection
                    key={sectionId}
                    sectionId={sectionId}
                    index={index}
                    onReorder={handleSectionReorder}
                    className="mb-4 mt-3"
                    style={{ minHeight: '2rem' }}
                  >
                    {sectionComponents[sectionId]}
                  </InlineDraggableSection>
                ))
              }
            </InlineDraggableSectionsContainer>
          </div>
        </div>
      );
    }

    // Default layout for other templates
    return (
      <div className="resume-container" style={inlineStyles.container}>
        <div style={{
          padding: resumeStyles.spacing.documentPadding,
          minHeight: '11in',
          boxSizing: 'border-box'
        }}>
          {/* Contact Information - Always First */}
          <header>
            <h1 className="resume-name" style={inlineStyles.name}>
              {fullName}
            </h1>
            <div className={`resume-contact ${documentSettings.showIcons ? 'flex flex-row items-center gap-1 flex-wrap' : ''}`} style={{
              ...inlineStyles.contact,
              ...(documentSettings.showIcons && {
                justifyContent: 'center'
              })
            }}>
              {contact.city && contact.state && (
                <span className={documentSettings.showIcons ? 'flex flex-row items-center gap-1' : ''}>
                  {documentSettings.showIcons && <ContactIcon type="location" color={inlineStyles.contact.color} />}
                  <span>{contact.city}, {contact.state}</span>
                  {contact.country && contact.country !== 'United States' && <span>, {contact.country}</span>}
                  {!documentSettings.showIcons && (contact.email || contact.phone || contact.linkedin) && <span> • </span>}
                </span>
              )}
              {contact.email && (
                <span className={documentSettings.showIcons ? 'flex flex-row items-center gap-1' : ''}>
                  {documentSettings.showIcons && <ContactIcon type="email" color={inlineStyles.contact.color} />}
                  <span>{contact.email}</span>
                  {!documentSettings.showIcons && (contact.phone || contact.linkedin) && <span> • </span>}
                </span>
              )}
              {contact.phone && (
                <span className={documentSettings.showIcons ? 'flex flex-row items-center gap-1' : ''}>
                  {documentSettings.showIcons && <ContactIcon type="phone" color={inlineStyles.contact.color} />}
                  <span>{contact.phone}</span>
                  {!documentSettings.showIcons && contact.linkedin && <span> • </span>}
                </span>
              )}
              {contact.linkedin && (
                <span className={documentSettings.showIcons ? 'flex flex-row items-center gap-1' : ''}>
                  {documentSettings.showIcons && <ContactIcon type="linkedin" color={inlineStyles.contact.color} />}
                  <span>in/{contact.linkedin.replace(/^.*\/in\//, '')}</span>
                </span>
              )}
            </div>
          </header>

          {/* Render sections with inline drag handles */}
          <InlineDraggableSectionsContainer>
            {sectionOrder
              .filter(sectionId => sectionComponents[sectionId])
              .map((sectionId, index) => (
                <InlineDraggableSection
                  key={sectionId}
                  sectionId={sectionId}
                  index={index}
                  onReorder={handleSectionReorder}
                  className="mb-2 mt-4"
                >
                  {sectionComponents[sectionId]}
                </InlineDraggableSection>
              ))
            }
          </InlineDraggableSectionsContainer>
        </div>
      </div>
    );
  });

  ResumeContent.displayName = 'ResumeContent';

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Resume skeleton */}
      <div
        className="p-4 lg:p-8 rounded-xl"
        style={{
          backgroundColor: theme.background,
          minHeight: `calc(${paperDimensions.height}px * ${documentSettings.zoom / 100} + 4rem)`
        }}
      >
        <div
          className="shadow-2xl overflow-hidden max-w-full bg-white"
          style={{
            transform: `scale(${documentSettings.zoom / 100})`,
            transformOrigin: 'top center',
            width: `${paperDimensions.width}px`,
            height: `${paperDimensions.height}px`,
            margin: '0 auto',
            boxSizing: 'border-box',
            outlineOffset: '1px',
            boxShadow: theme.shadow,
            maxWidth: '100%',
          }}
        >
          <div className="p-12 space-y-6">
            {/* Name skeleton */}
            <div className="text-center space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
            </div>
            
            {/* Section skeletons */}
            {[1, 2, 3, 4].map((section) => (
              <div key={section} className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                <div className="border-b border-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Main resume preview content
  const resumePreviewContent = (
    <div className="w-full">
      <style>{resumeCSS}</style>

      {/* Only show skeleton on first load when no cached data exists and truly loading */}
      {isLoadingFromFirestore && !isReady ? (
        <LoadingSkeleton />
      ) : (
        <>
          <ResumeHeaderBar
            ref={headerBarRef}
            documentSettings={documentSettings}
            onDocumentSettingChange={updateSetting}
            onDownloadPDF={handleDownloadPDF}
            onAutoAdjust={handleAutoAdjust}
            onTemplateChange={handleTemplateChange}
            selectedTemplate={currentTemplate}
            resumeId={resumeId}
            sectionOrder={sectionOrder}
            onSectionOrderChange={handleSectionOrderChange}
            isDarkMode={isDarkMode}
            className="no-print"
          />

          <div
            className={`p-4 lg:p-8 rounded-xl transition-all duration-300 ${isReady ? 'opacity-100' : 'opacity-75'}`}
            style={{
              backgroundColor: theme.background,
              minHeight: `calc(${paperDimensions.height}px * ${documentSettings.zoom / 100} + 4rem)`
            }}
          >
            <div
              className="shadow-2xl overflow-hidden transition-all duration-300 max-w-full"
              style={{
                transform: `scale(${documentSettings.zoom / 100})`,
                transformOrigin: 'top center',
                width: `${paperDimensions.width}px`,
                height: `${paperDimensions.height}px`,
                margin: '0 auto',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
                outlineOffset: '1px',
                boxShadow: theme.shadow,
                maxWidth: '100%',
              }}
            >
              <ResumeContent />
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Render the job panel wrapped in its own JobInfoContext check
  const JobPanelWrapper = () => {
    const { jobInfo, isLoading, hasJobInfo } = useJobInfo();

    if (!showJobPanels || !user?.uid) {
      return null;
    }

    if (isLoading) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    // Show a keywords panel when job info exists (either with or without analysis)
    if (hasJobInfo || (jobInfo && jobInfo.title)) {
      return (
        <KeywordTargetingPanel
          onJobUpdate={handleJobUpdate}
          className="shadow-lg"
        />
      );
    }

    // Default to the job info panel when no job info exists
    return (
      <JobInfoPanel
        resumeId={resumeId}
        onComplete={handleJobComplete}
        className="shadow-lg"
      />
    );
  };

  if (showJobPanels && user?.uid) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
            {resumePreviewContent}
          </div>
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="space-y-6">
              <ATSScorePanel
                resumeData={resumeData}
                resumeId={resumeId}
                className="shadow-lg"
              />
              <ResumeEditorPanel
                resumeData={resumeData}
                resumeId={resumeId}
                onBulletAdded={handleBulletAdded}
                className="shadow-lg"
              />
              <JobPanelWrapper />
              <SharePanel
                resumeId={resumeId}
                className="shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className={`w-full max-w-6xl xl:max-w-7xl mx-auto ${className}`}>{resumePreviewContent}</div>;
}