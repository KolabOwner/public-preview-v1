'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { useSimpleJob } from '@/contexts/simple-job-context';
import { useResumeData } from '@/contexts/resume-data-context';
import ResumeHeaderBar, { ResumeHeaderBarRef } from '@/components/layout/resume-header-bar';
import SimpleJobPanel from '@/components/resume/panels/simple-job-panel';
import SimpleKeywordsPanel from '@/components/resume/panels/simple-keywords-panel';
import SharePanel from "@/components/resume/panels/share-panel";
import { getDefaultSectionOrder, getSectionTitle, sectionHasContent } from '../sections/resume-sections';
import { useResumeFont, useResumeStyles, useResumeTheme } from '@/components/hooks/use-resume-styles';
import { generateResumePDFAsync } from "@/lib/features/pdf/pdf-generator";

interface SimpleResumePreviewProps {
  resumeData: any;
  resumeId: string;
  showJobPanels?: boolean;
  className?: string;
  initialTemplate?: string;
}

// [Keep all the existing memoized components from the original file: ResumeSection, BulletList]
const ResumeSection = memo(({
  title,
  children,
  styles
}: {
  title: string;
  children: React.ReactNode;
  styles: any;
}) => (
  <section>
    <h2 className="resume-section-header" style={styles.sectionHeader}>
      {title}
    </h2>
    {children}
  </section>
));

ResumeSection.displayName = 'ResumeSection';

const BulletList = memo(({
  items,
  styles
}: {
  items: string[];
  styles: any;
}) => (
  <ul className="resume-bullet-list" style={styles.bulletList}>
    {items.map((item, index) => (
      <li key={index} style={styles.bulletItem}>{item}</li>
    ))}
  </ul>
));

BulletList.displayName = 'BulletList';

export default function SimpleResumePreview({
  resumeData,
  resumeId,
  showJobPanels = true,
  className = "",
  initialTemplate = 'professional'
}: SimpleResumePreviewProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentResumeId, checkJobInfo, jobInfo, isLoading: jobLoading } = useSimpleJob();
  const { fetchResumeData, processedData, loading: contextLoading } = useResumeData();
  const headerBarRef = useRef<ResumeHeaderBarRef>(null);

  // State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasJobInfo, setHasJobInfo] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sectionOrder, setSectionOrder] = useState<string[]>(() =>
    getDefaultSectionOrder(initialTemplate)
  );

  // Resume styles hook
  const {
    documentSettings,
    currentTemplate,
    styles: resumeStyles,
    css: resumeCSS,
    inlineStyles,
    paperDimensions,
    scaledDimensions,
    updateSetting,
    changeTemplate,
    templates,
  } = useResumeStyles({
    initialTemplate,
    persistSettings: true,
    storageKey: `resume-settings-${resumeId}`,
  });

  // Load custom fonts
  useResumeFont(documentSettings.fontFamily);

  // Get theme colors based on dark mode
  const theme = useResumeTheme(isDarkMode);

  // Initialize job context and check for existing job info
  useEffect(() => {
    const initializeJobContext = async () => {
      if (!resumeId || !user?.uid || !showJobPanels) {
        setIsInitializing(false);
        return;
      }

      try {
        setIsInitializing(true);
        
        // Set the current resume ID in context
        setCurrentResumeId(resumeId);
        
        // Check if job info exists
        const status = await checkJobInfo(resumeId);
        setHasJobInfo(status.hasJobInfo);
        
      } catch (error) {
        console.error('[SimpleResumePreview] Error initializing:', error);
        setHasJobInfo(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeJobContext();
  }, [resumeId, user?.uid, showJobPanels, setCurrentResumeId, checkJobInfo]);

  // Fetch resume data - only if not already provided as prop
  useEffect(() => {
    if (resumeId && !resumeData) {
      fetchResumeData(resumeId);
    }
  }, [resumeId, resumeData, fetchResumeData]);

  // Check for dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || mediaQuery.matches;
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener('change', handleChange);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  // Handlers
  const handleJobComplete = useCallback(() => {
    setHasJobInfo(true);
  }, []);

  const handleJobUpdate = useCallback(() => {
    setHasJobInfo(false);
  }, []);

  const handleDownloadPDF = async () => {
    try {
      const contact = currentResumeData.contactInfo || {};
      const fullName = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Resume';

      const resumeDataForPDF = {
        title: currentResumeData.title || 'Resume',
        template: currentTemplate,
        fontStyle: documentSettings.fontFamily === 'Times New Roman' ? 'professional' : 'elegant',
        fontSize: documentSettings.fontSize < 9 ? 'small' :
                  documentSettings.fontSize > 12 ? 'large' : 'medium',
        documentSettings,
        parsedData: currentResumeData,
        rmsRawData: currentResumeData.rmsRawData
      };

      const pdfBlob = await generateResumePDFAsync(resumeDataForPDF);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Downloaded",
        description: "Your resume has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // [Keep all the utility functions from the original file]
  const decodeHTMLEntities = (text: string): string => {
    if (!text) return '';
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  const parseBulletPoints = (text: string): string[] => {
    if (!text) return [];
    const decodedText = decodeHTMLEntities(text);

    if (decodedText.includes('\n')) {
      const lines = decodedText
        .split('\n')
        .map(line => line.replace(/^[•·\-\*]\s*/, '').trim())
        .filter(Boolean);
      if (lines.length > 1) {
        return lines;
      }
    }

    if (decodedText.includes('•') || decodedText.includes('·')) {
      return decodedText
        .split(/[•·]/)
        .map(item => item.trim())
        .filter(Boolean);
    }

    return [decodedText];
  };

  const formatDate = (date: string | Date | null | undefined, format?: string) => {
    if (!date) return '';

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

    return String(date);
  };

  const handleSectionOrderChange = useCallback((newOrder: string[]) => {
    setSectionOrder(newOrder);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`resume-section-order-${resumeId}`, JSON.stringify(newOrder));
    }
  }, [resumeId]);

  const handleAutoAdjust = async () => {
    try {
      toast({
        title: "Auto-adjust Applied",
        description: "Resume layout has been automatically optimized.",
      });
    } catch (error) {
      console.error('Error auto-adjusting resume:', error);
    }
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

  const handleExploreScore = () => {
    toast({
      title: "Score Analysis",
      description: "Resume score analysis coming soon!",
    });
  };

  // Use processedData from context or fallback to prop
  const currentResumeData = processedData || resumeData;

  // Early return if no data
  if (!currentResumeData || (contextLoading && !resumeData)) {
    return (
      <div className={`w-full max-w-4xl mx-auto p-8 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">
              {contextLoading && !resumeData ? 'Loading Resume...' : 'No Resume Data'}
            </h3>
            <p className="text-yellow-700 mt-1">
              {contextLoading && !resumeData
                ? 'Please wait while we load your resume data.' 
                : 'No resume data is available to preview. Please add some information in the other sections first.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from currentResumeData - handle both formats
  const contact = currentResumeData.contact || currentResumeData.contactInfo || {};
  const fullName = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Your Name';

  // [Include the entire ResumeContent component from the original file]
  const ResumeContent = memo(() => {
    // Section components map with dynamic titles
    const sectionComponents: Record<string, React.ReactNode> = {
      summary: sectionHasContent('summary', currentResumeData) && (
        <ResumeSection key="summary" title={getSectionTitle('summary', currentTemplate)} styles={inlineStyles}>
          <p className="resume-summary" style={inlineStyles.bodyText}>
            {currentResumeData.summary}
          </p>
        </ResumeSection>
      ),

      experience: sectionHasContent('experience', currentResumeData) && currentResumeData.experience && (
        <ResumeSection key="experience" title={getSectionTitle('experience', currentTemplate)} styles={inlineStyles}>
          {(Array.isArray(currentResumeData.experience) ? currentResumeData.experience : []).map((exp: any, idx: number) => (
            <div key={exp.id || idx} className="resume-experience-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              <div style={{ marginBottom: '0.05rem' }}>
                <h3 className="resume-job-title" style={inlineStyles.jobTitle}>
                  {decodeHTMLEntities(exp.position || 'Position')}
                </h3>
              </div>
              <div className="resume-company" style={inlineStyles.bodyText}>
                <span>{decodeHTMLEntities(exp.company || 'Company')}</span>
                <span className="resume-date" style={inlineStyles.date}>
                  {formatDate(exp.dateBegin)} - {formatDate(exp.dateEnd)}
                  {exp.location && `, ${decodeHTMLEntities(exp.location)}`}
                </span>
              </div>
              {exp.description && (
                <BulletList
                  items={parseBulletPoints(exp.description)}
                  styles={inlineStyles}
                />
              )}
            </div>
          ))}
        </ResumeSection>
      ),

      // [Include all other section components from the original file]
      education: sectionHasContent('education', currentResumeData) && currentResumeData.education && (
        <ResumeSection key="education" title={getSectionTitle('education', currentTemplate)} styles={inlineStyles}>
          {(Array.isArray(currentResumeData.education) ? currentResumeData.education : []).map((edu: any, idx: number) => (
            <div key={edu.id || idx} className="resume-education-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              <div className="resume-degree-title" style={inlineStyles.jobTitle}>
                {edu.qualification && edu.fieldOfStudy ?
                  `${edu.qualification} in ${edu.fieldOfStudy}` :
                  edu.qualification || 'Degree'}
              </div>
              <div className="resume-school-info" style={inlineStyles.bodyText}>
                {edu.institution || 'Institution'}
                {edu.location && ` • ${edu.location}`}
                {edu.date && ` • ${formatDate(edu.date, edu.dateFormat)}`}
              </div>
              {edu.gpa && (
                <div className="resume-detail-text" style={inlineStyles.detailText}>
                  GPA: {edu.gpa}
                </div>
              )}
            </div>
          ))}
        </ResumeSection>
      ),

      skills: sectionHasContent('skills', currentResumeData) && currentResumeData.skills && (
        <ResumeSection key="skills" title={getSectionTitle('skills', currentTemplate)} styles={inlineStyles}>
          {(Array.isArray(currentResumeData.skills) ? currentResumeData.skills : []).map((category: any, idx: number) => (
            <div key={category.id || idx} className="resume-skills-category" style={{ ...inlineStyles.bodyText, marginBottom: `${resumeStyles.spacing.bulletGap}rem` }}>
              <span className="resume-skills-title" style={{ fontWeight: 700 }}>
                {category.category}:
              </span>
              <span>
                {' '}
                {category.keywords || ''}
              </span>
            </div>
          ))}
        </ResumeSection>
      ),

      projects: sectionHasContent('projects', currentResumeData) && currentResumeData.projects && (
        <ResumeSection key="projects" title={getSectionTitle('projects', currentTemplate)} styles={inlineStyles}>
          {(Array.isArray(currentResumeData.projects) ? currentResumeData.projects : []).map((project: any, idx: number) => (
            <div key={project.id || idx} className="resume-project-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
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
              {project.organization && (
                <div className="resume-company" style={{ ...inlineStyles.bodyText, marginBottom: `${resumeStyles.spacing.bulletGap}rem` }}>
                  {decodeHTMLEntities(project.organization)}
                </div>
              )}
              {project.description && (
                <BulletList
                  items={parseBulletPoints(project.description)}
                  styles={inlineStyles}
                />
              )}
            </div>
          ))}
        </ResumeSection>
      ),
    };

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
            <div className="resume-contact" style={inlineStyles.contact}>
              {contact.city && contact.state && (
                <>
                  <span>{contact.city}, {contact.state}</span>
                  {contact.country && contact.country !== 'United States' && <span>, {contact.country}</span>}
                  {(contact.email || contact.phone || contact.linkedin) && <span> • </span>}
                </>
              )}
              {contact.email && (
                <>
                  <span>{contact.email}</span>
                  {(contact.phone || contact.linkedin) && <span> • </span>}
                </>
              )}
              {contact.phone && (
                <>
                  <span>{contact.phone}</span>
                  {contact.linkedin && <span> • </span>}
                </>
              )}
              {contact.linkedin && (
                <span>in/{contact.linkedin.replace(/^.*\/in\//, '')}</span>
              )}
            </div>
          </header>

          {/* Render sections in custom order */}
          {sectionOrder
            .filter(sectionId => sectionComponents[sectionId])
            .map(sectionId => sectionComponents[sectionId])
          }
        </div>
      </div>
    );
  });

  ResumeContent.displayName = 'ResumeContent';

  // Main resume preview content
  const resumePreviewContent = (
    <div className="w-full">
      {/* Inject dynamic CSS */}
      <style>{resumeCSS}</style>

      {/* Resume Header Bar */}
      <ResumeHeaderBar
        ref={headerBarRef}
        resumeScore={jobInfo?.atsScore || 90}
        documentSettings={documentSettings}
        onDocumentSettingChange={updateSetting}
        onDownloadPDF={handleDownloadPDF}
        onAutoAdjust={handleAutoAdjust}
        onTemplateChange={handleTemplateChange}
        onExploreScore={handleExploreScore}
        sectionOrder={sectionOrder}
        onSectionOrderChange={handleSectionOrderChange}
        isDarkMode={isDarkMode}
        className="no-print"
      />

      {/* Resume Preview Container */}
      <div
        className="p-8 rounded-xl transition-colors duration-200"
        style={{
          backgroundColor: theme.background,
          minHeight: `calc(${paperDimensions.height}px * ${documentSettings.zoom / 100} + 4rem)`
        }}
      >
        {/* Resume Document */}
        <div
          className="shadow-2xl overflow-hidden transition-transform duration-200"
          style={{
            transform: `scale(${documentSettings.zoom / 100})`,
            transformOrigin: 'top center',
            width: `${paperDimensions.width}px`,
            height: `${paperDimensions.height}px`,
            margin: '0 auto',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box',
            outline: `15px solid ${theme.border}`,
            outlineOffset: '1px',
            boxShadow: theme.shadow,
          }}
        >
          <ResumeContent />
        </div>
      </div>
    </div>
  );

  // Render job panel
  const renderJobPanel = () => {
    if (!showJobPanels || !user?.uid) {
      return null;
    }

    if (isInitializing || jobLoading) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    if (hasJobInfo) {
      return (
        <SimpleKeywordsPanel
          onUpdate={handleJobUpdate}
          className="shadow-lg"
        />
      );
    }

    return (
      <SimpleJobPanel
        onComplete={handleJobComplete}
        className="shadow-lg"
      />
    );
  };

  // Layout with or without job panels
  if (showJobPanels && user?.uid) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex gap-4">
          <div className="w-[1034px] flex-shrink-0">
            {resumePreviewContent}
          </div>
          <div className="w-72 flex-shrink-0">
            <div>
              {renderJobPanel()}
              {!isInitializing && !jobLoading && (
                <SharePanel
                  resumeId={resumeId}
                  className="mt-6 shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className={`w-full max-w-4xl mx-auto ${className}`}>{resumePreviewContent}</div>;
}