'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { useJobInfo } from '@/contexts/job-info-context';
import ResumeHeaderBar, { ResumeHeaderBarRef } from '@/components/layout/resume-header-bar';
import JobInfoPanel from '@/components/resume/panels/job-info-panel';
import KeywordTargetingPanel from '@/components/resume/panels/keyword-targeting-panel';
import ATSScorePanel from '@/components/resume/panels/ats-score-panel';
import SharePanel from "@/components/resume/panels/share-panel";
import { JobInfoProvider } from '@/contexts/job-info-context';
import { getDefaultSectionOrder, getSectionTitle, sectionHasContent } from '../sections/resume-sections';
import { InlineDraggableSection, InlineDraggableSectionsContainer } from '../sections/inline-draggable-section';
import { useResumeFont, useResumeStyles, useResumeTheme } from '@/components/hooks/use-resume-styles';
import { generateResumePDFAsync } from "@/lib/features/pdf/pdf-generator";

interface SimplifiedResumePreviewProps {
  resumeData: any;
  resumeId: string;
  showJobPanels?: boolean;
  className?: string;
  initialTemplate?: string;
}

// Memoized components
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

export default function SimplifiedResumePreview({
  resumeData,
  resumeId,
  showJobPanels = true,
  className = "",
  initialTemplate = 'professional'
}: SimplifiedResumePreviewProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const headerBarRef = useRef<ResumeHeaderBarRef>(null);

  // State
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    updateSetting,
    changeTemplate,
  } = useResumeStyles({
    initialTemplate,
    persistSettings: true,
    storageKey: `resume-settings-${resumeId}`,
  });

  // Load custom fonts
  useResumeFont(documentSettings.fontFamily);

  // Get theme colors based on dark mode
  const theme = useResumeTheme(isDarkMode);

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
    // Job panel will trigger a reload of job info
    window.location.reload();
  }, []);

  const handleJobUpdate = useCallback(() => {
    // Keyword panel update button clicked
  }, []);

  const handleDownloadPDF = async () => {
    try {
      const contact = resumeData?.contact || resumeData?.contactInfo || {};
      const fullName = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Resume';

      const resumeDataForPDF = {
        title: resumeData?.title || 'Resume',
        template: currentTemplate,
        fontStyle: documentSettings.fontFamily === 'Times New Roman' ? 'professional' : 'elegant',
        fontSize: documentSettings.fontSize < 9 ? 'small' :
                  documentSettings.fontSize > 12 ? 'large' : 'medium',
        documentSettings,
        parsedData: resumeData,
        rmsRawData: resumeData?.rmsRawData
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
      <div className={`w-full max-w-4xl mx-auto p-8 ${className}`}>
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

  // Extract data safely
  const contact = resumeData.contact || resumeData.contactInfo || {};
  const fullName = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Your Name';

  // Resume content component
  const ResumeContent = memo(() => {
    // Safe array access helper
    const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];

    // Section components map
    const sectionComponents: Record<string, React.ReactNode> = {
      summary: resumeData.summary && (
        <ResumeSection key="summary" title={getSectionTitle('summary', currentTemplate)} styles={inlineStyles}>
          <p className="resume-summary" style={inlineStyles.bodyText}>
            {resumeData.summary}
          </p>
        </ResumeSection>
      ),

      experience: safeArray(resumeData.experience).length > 0 && (
        <ResumeSection key="experience" title={getSectionTitle('experience', currentTemplate)} styles={inlineStyles}>
          {safeArray(resumeData.experience).map((exp: any, idx: number) => (
            <div key={exp.id || idx} className="resume-experience-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              <div style={{ marginBottom: '0.05rem' }}>
                <h3 className="resume-job-title" style={inlineStyles.jobTitle}>
                  {decodeHTMLEntities(exp.position || exp.title || 'Position')}
                </h3>
              </div>
              <div className="resume-company" style={inlineStyles.bodyText}>
                <span>{decodeHTMLEntities(exp.company || 'Company')}</span>
                <span className="resume-date" style={inlineStyles.date}>
                  {formatDate(exp.dateBegin || exp.startDate)} - {formatDate(exp.dateEnd || exp.endDate)}
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

      education: safeArray(resumeData.education).length > 0 && (
        <ResumeSection key="education" title={getSectionTitle('education', currentTemplate)} styles={inlineStyles}>
          {safeArray(resumeData.education).map((edu: any, idx: number) => (
            <div key={edu.id || idx} className="resume-education-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              <div className="resume-degree-title" style={inlineStyles.jobTitle}>
                {edu.qualification && edu.fieldOfStudy ?
                  `${edu.qualification} in ${edu.fieldOfStudy}` :
                  edu.qualification || edu.degree || 'Degree'}
              </div>
              <div className="resume-school-info" style={inlineStyles.bodyText}>
                {edu.institution || edu.school || 'Institution'}
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

      skills: safeArray(resumeData.skills).length > 0 && (
        <ResumeSection key="skills" title={getSectionTitle('skills', currentTemplate)} styles={inlineStyles}>
          {safeArray(resumeData.skills).map((category: any, idx: number) => (
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

      projects: safeArray(resumeData.projects).length > 0 && (
        <ResumeSection key="projects" title={getSectionTitle('projects', currentTemplate)} styles={inlineStyles}>
          {safeArray(resumeData.projects).map((project: any, idx: number) => (
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
              {project.repository && (
                <div className="resume-skills-category" style={{ ...inlineStyles.detailText, marginTop: `${resumeStyles.spacing.bulletGap}rem` }}>
                  <span style={{ fontWeight: 700 }}>Repository:</span>{' '}
                  {project.repository}
                </div>
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
                <p style={{ ...inlineStyles.detailText, fontStyle: 'italic' }}>
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

      involvement: safeArray(resumeData.involvement).length > 0 && (
        <ResumeSection key="involvement" title={getSectionTitle('involvement', currentTemplate)} styles={inlineStyles}>
          {safeArray(resumeData.involvement).map((inv: any, idx: number) => (
            <div key={inv.id || idx} className="resume-involvement-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
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
                />
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
              <div className="resume-company" style={inlineStyles.bodyText}>
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

  // Main resume preview content
  const resumePreviewContent = (
    <div className="w-full">
      <style>{resumeCSS}</style>

      <ResumeHeaderBar
        ref={headerBarRef}
        documentSettings={documentSettings}
        onDocumentSettingChange={updateSetting}
        onDownloadPDF={handleDownloadPDF}
        onAutoAdjust={handleAutoAdjust}
        onTemplateChange={handleTemplateChange}
        sectionOrder={sectionOrder}
        onSectionOrderChange={handleSectionOrderChange}
        isDarkMode={isDarkMode}
        className="no-print"
      />

      <div
        className="p-8 rounded-xl transition-colors duration-200"
        style={{
          backgroundColor: theme.background,
          minHeight: `calc(${paperDimensions.height}px * ${documentSettings.zoom / 100} + 4rem)`
        }}
      >
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

  // Render job panel wrapped in its own JobInfoContext check
  const JobPanelWrapper = () => {
    const { jobInfo, isLoading } = useJobInfo();
    
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

    // Check if job info exists
    if (jobInfo && jobInfo.title) {
      return (
        <KeywordTargetingPanel
          onJobUpdate={handleJobUpdate}
          className="shadow-lg"
        />
      );
    }

    return (
      <JobInfoPanel
        onComplete={handleJobComplete}
        className="shadow-lg"
      />
    );
  };

  // Layout with or without job panels
  if (showJobPanels && user?.uid) {
    return (
      <JobInfoProvider resumeId={resumeId} userId={user?.uid}>
        <div className={`w-full ${className}`}>
          <div className="flex gap-4">
            <div className="w-[1034px] flex-shrink-0">
              {resumePreviewContent}
            </div>
            <div className="w-72 flex-shrink-0">
              <div className="space-y-6">
                <ATSScorePanel
                  resumeData={resumeData}
                  resumeId={resumeId}
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
      </JobInfoProvider>
    );
  }

  return <div className={`w-full max-w-4xl mx-auto ${className}`}>{resumePreviewContent}</div>;
}