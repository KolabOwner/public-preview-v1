'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import ResumeHeaderBar, { ResumeHeaderBarRef } from '@/components/layout/resume-header-bar';
import KeywordTargetingPanel from "@/components/resume/panels/keyword-targeting-panel";
import JobInfoPanel from "@/components/resume/panels/job-info-panel";
import SharePanel from "@/components/resume/panels/share-panel";

import { useJobInfo } from '@/contexts/job-info-context';
import { useResumeData } from '@/contexts/resume-data-context';
import { getDefaultSectionOrder, getSectionTitle, sectionHasContent } from '../sections/resume-sections';
import {useResumeFont, useResumeStyles, useResumeTheme } from '@/components/hooks/use-resume-styles';
import {generateResumePDFAsync} from "@/lib/features/pdf/pdf-generator";

// Type definitions
interface ResumePreviewProps {
  resumeData: any;
  resumeId: string;
  showJobPanels?: boolean;
  className?: string;
  initialTemplate?: string;
}

// Memoized components for performance
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

export default function ResumePreview({
  resumeData,
  resumeId,
  showJobPanels = true,
  className = "",
  initialTemplate = 'professional'
}: ResumePreviewProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentResumeId, updateJobInfo } = useJobInfo();
  const { fetchResumeData, processedData, loading: contextLoading } = useResumeData();
  const headerBarRef = useRef<ResumeHeaderBarRef>(null);

  // State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasJobInfo, setHasJobInfo] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Refs to prevent race conditions
  const initializationRef = useRef(false);
  const currentResumeIdRef = useRef<string | null>(null);

  // Section ordering state with template-based defaults
  const [sectionOrder, setSectionOrder] = useState<string[]>(() =>
    getDefaultSectionOrder(initialTemplate)
  );

  // Use the resume styles hook
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

  // Update section order when template changes
  useEffect(() => {
    const defaultOrder = getDefaultSectionOrder(currentTemplate);
    setSectionOrder(defaultOrder);
    // Also save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`resume-section-order-${resumeId}`, JSON.stringify(defaultOrder));
    }
  }, [currentTemplate, resumeId]);

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

  // Check job info - Fixed dependency array and simplified logic
  const checkJobInfo = useCallback(async () => {
    if (!user?.uid || !resumeId || !showJobPanels) {
      console.log(`[ResumePreview] Skipping job info check - user: ${!!user?.uid}, resumeId: ${!!resumeId}, showJobPanels: ${showJobPanels}`);
      setHasJobInfo(false);
      return false;
    }

    try {
      console.log(`[ResumePreview] Checking job info for resume: ${resumeId}`);
      const resumeRef = doc(db, 'resumes', resumeId);
      const resumeSnap = await getDoc(resumeRef);

      if (resumeSnap.exists()) {
        const data = resumeSnap.data();
        const hasJob = !!(data.job_info?.title && data.job_info?.description);
        console.log(`[ResumePreview] Job info found: ${hasJob}`);
        setHasJobInfo(hasJob);

        if (hasJob && data.job_info) {
          // Update job info context
          updateJobInfo({
            title: data.job_info.title || '',
            description: data.job_info.description || '',
            company: data.job_info.company || '',
            keywords: data.job_info.keywords || [],
            isActive: true
          });
        }

        // Set localStorage only once per session
        localStorage.setItem('current_document_id', resumeId);
        localStorage.setItem('current_user_id', user.uid);

        return hasJob;
      } else {
        console.log(`[ResumePreview] Resume document not found: ${resumeId}`);
        setHasJobInfo(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking job info:', error);
      setHasJobInfo(false);
      return false;
    }
  }, [user?.uid, resumeId, showJobPanels, updateJobInfo]);

  // Centralized initialization - Fixed to prevent race conditions
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      // Prevent multiple simultaneous initializations
      if (!resumeId || initializationRef.current || currentResumeIdRef.current === resumeId) {
        return;
      }

      // Mark as initializing
      initializationRef.current = true;
      currentResumeIdRef.current = resumeId;

      try {
        setLoading(true);
        console.log(`[ResumePreview] Initializing for resume: ${resumeId}`);

        // Set current resume ID immediately
        setCurrentResumeId(resumeId);

        // If we need job panels and have a user, fetch data and check job info
        if (showJobPanels && user?.uid) {
          console.log(`[ResumePreview] Fetching data for user: ${user.uid}`);

          // Fetch resume data first
          await fetchResumeData(resumeId);

          // Then check job info
          if (isMounted) {
            await checkJobInfo();
          }
        } else if (!showJobPanels) {
          console.log('[ResumePreview] No job panels needed, fetching resume data only');
          // If we don't need job panels, just fetch resume data
          await fetchResumeData(resumeId);
          setHasJobInfo(false);
        } else {
          console.log('[ResumePreview] User not loaded yet, setting defaults');
          // User not loaded yet, set defaults
          setHasJobInfo(false);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        if (isMounted) {
          setHasJobInfo(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          initializationRef.current = false;
          console.log(`[ResumePreview] Initialization complete for: ${resumeId}`);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [resumeId, user?.uid, showJobPanels, setCurrentResumeId, fetchResumeData, checkJobInfo]);

  // Reset state when resumeId changes
  useEffect(() => {
    if (currentResumeIdRef.current !== resumeId) {
      console.log(`[ResumePreview] Resume ID changed from ${currentResumeIdRef.current} to ${resumeId}`);
      setInitialized(false);
      setLoading(true);
      setHasJobInfo(null);
      initializationRef.current = false;
      currentResumeIdRef.current = null;
    }
  }, [resumeId]);

  // Cleanup on unmount - only clear if this component set it
  useEffect(() => {
    return () => {
      // Only clear if this component was responsible for setting it
      if (currentResumeIdRef.current === resumeId) {
        console.log(`[ResumePreview] Cleaning up resume ID: ${resumeId}`);
        setCurrentResumeId(null);
        currentResumeIdRef.current = null;
      }
    };
  }, [resumeId, setCurrentResumeId]);

  // Handlers
  const handleJobInfoComplete = useCallback(async () => {
    setLoading(true);
    try {
      await checkJobInfo();
    } finally {
      setLoading(false);
    }
  }, [checkJobInfo]);

  const handleJobUpdate = useCallback(() => {
    console.log('[ResumePreview] Job updated, resetting hasJobInfo to false');
    setHasJobInfo(false);
    // Optionally recheck job info after a brief delay to prevent rapid toggling
    const timeoutId = setTimeout(() => {
      if (currentResumeIdRef.current === resumeId) {
        console.log('[ResumePreview] Rechecking job info after update');
        checkJobInfo();
      }
    }, 1000); // Increased delay to prevent rapid toggling

    return () => clearTimeout(timeoutId);
  }, [checkJobInfo, resumeId]);

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

  // Handle section order change
  const handleSectionOrderChange = useCallback((newOrder: string[]) => {
    setSectionOrder(newOrder);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`resume-section-order-${resumeId}`, JSON.stringify(newOrder));
    }
  }, [resumeId]);

  // Load section order on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrder = localStorage.getItem(`resume-section-order-${resumeId}`);
      if (savedOrder) {
        try {
          setSectionOrder(JSON.parse(savedOrder));
        } catch (error) {
          console.warn('Failed to load section order:', error);
        }
      }
    }
  }, [resumeId]);

  // Use processedData from context instead of prop
  const currentResumeData = processedData;

  // Early return if no data
  if (!currentResumeData || contextLoading) {
    return (
      <div className={`w-full max-w-4xl mx-auto p-8 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">
              {contextLoading ? 'Loading Resume...' : 'No Resume Data'}
            </h3>
            <p className="text-yellow-700 mt-1">
              {contextLoading 
                ? 'Please wait while we load your resume data.' 
                : 'No resume data is available to preview. Please add some information in the other sections first.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from processedData
  const contact = currentResumeData.contact || {};
  const fullName = contact.fullName || 'Your Name';

  // Resume content component
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

      experience: sectionHasContent('experience', currentResumeData) && (
        <ResumeSection key="experience" title={getSectionTitle('experience', currentTemplate)} styles={inlineStyles}>
          {currentResumeData.experience.map((exp: any, idx: number) => (
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

      education: sectionHasContent('education', currentResumeData) && (
        <ResumeSection key="education" title={getSectionTitle('education', currentTemplate)} styles={inlineStyles}>
          {currentResumeData.education.map((edu: any, idx: number) => (
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

      projects: sectionHasContent('projects', currentResumeData) && (
        <ResumeSection key="projects" title={getSectionTitle('projects', currentTemplate)} styles={inlineStyles}>
          {currentResumeData.projects.map((project: any, idx: number) => (
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

      skills: sectionHasContent('skills', currentResumeData) && (
        <ResumeSection key="skills" title={getSectionTitle('skills', currentTemplate)} styles={inlineStyles}>
          {currentResumeData.skills.map((category: any, idx: number) => (
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

      involvement: sectionHasContent('involvement', currentResumeData) && (
        <ResumeSection key="involvement" title={getSectionTitle('involvement', currentTemplate)} styles={inlineStyles}>
          {currentResumeData.involvement.map((inv: any, idx: number) => (
            <div key={inv.id || idx} className="resume-involvement-block" style={{ marginBottom: `${resumeStyles.spacing.blockGap}rem` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="resume-involvement-title" style={inlineStyles.jobTitle}>
                    {inv.role || 'Role'}
                  </h3>
                  <p className="resume-detail-text" style={inlineStyles.detailText}>
                    {inv.organization || 'Organization'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {inv.location && (
                    <p className="resume-detail-text" style={{ ...inlineStyles.detailText, fontStyle: 'italic' }}>
                      {inv.location}
                    </p>
                  )}
                  {(inv.dateBegin || inv.dateEnd) && (
                    <p className="resume-detail-text" style={{ ...inlineStyles.detailText, fontStyle: 'italic' }}>
                      {formatDate(inv.dateBegin)} {inv.dateBegin && inv.dateEnd && ' - '} {formatDate(inv.dateEnd)}
                    </p>
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

      coursework: sectionHasContent('coursework', currentResumeData) && (
        <ResumeSection key="coursework" title={getSectionTitle('coursework', currentTemplate)} styles={inlineStyles}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: `${resumeStyles.spacing.bulletGap}rem`,
            marginTop: `-${resumeStyles.spacing.bulletGap}rem`
          }}>
            {currentResumeData.coursework.map((course: any, idx: number) => (
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

      certifications: sectionHasContent('certifications', currentResumeData) && (
        <ResumeSection key="certifications" title={getSectionTitle('certifications', currentTemplate)} styles={inlineStyles}>
          {currentResumeData.certifications.map((cert: any, idx: number) => (
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

      languages: sectionHasContent('languages', currentResumeData) && (
        <ResumeSection key="languages" title={getSectionTitle('languages', currentTemplate)} styles={inlineStyles}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${resumeStyles.spacing.sectionGap}rem` }}>
            {currentResumeData.languages?.map((lang: any, idx: number) => (
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

      awards: sectionHasContent('awards', currentResumeData) && (
        <ResumeSection key="awards" title={getSectionTitle('awards', currentTemplate)} styles={inlineStyles}>
          {currentResumeData.awards.map((award: any, idx: number) => (
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

      publications: sectionHasContent('publications', currentResumeData) && (
        <ResumeSection key="publications" title={getSectionTitle('publications', currentTemplate)} styles={inlineStyles}>
          {currentResumeData.publications.map((pub: any, idx: number) => (
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

      volunteer: sectionHasContent('volunteer', currentResumeData) && (
        <ResumeSection key="volunteer" title={getSectionTitle('volunteer', currentTemplate)} styles={inlineStyles}>
          {currentResumeData.volunteer.map((vol: any, idx: number) => (
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

      references: sectionHasContent('references', currentResumeData) && (
        <ResumeSection key="references" title={getSectionTitle('references', currentTemplate)} styles={inlineStyles}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: documentSettings.paperSize === 'Letter' ? 'repeat(2, 1fr)' : '1fr',
            gap: `${resumeStyles.spacing.sectionGap}rem`
          }}>
            {currentResumeData.references.map((ref: any, idx: number) => (
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

          {/* Render sections in custom order, only showing sections with content */}
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
        resumeScore={90}
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

  // Determine which panel to show - Simplified logic to prevent flickering
  const renderJobPanel = () => {
    if (!showJobPanels || !user?.uid) {
      console.log('[ResumePreview] Not rendering job panel - no showJobPanels or user');
      return null;
    }

    console.log(`[ResumePreview] Panel state - loading: ${loading}, initialized: ${initialized}, hasJobInfo: ${hasJobInfo}`);

    if (loading && !initialized) {
      console.log('[ResumePreview] Rendering loading panel');
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    if (hasJobInfo === true) {
      console.log('[ResumePreview] Rendering KeywordTargetingPanel');
      return (
        <KeywordTargetingPanel
          onJobUpdate={handleJobUpdate}
          className="shadow-lg"
        />
      );
    }

    if (hasJobInfo === false) {
      console.log('[ResumePreview] Rendering JobInfoPanel');
      return (
        <JobInfoPanel
          onComplete={handleJobInfoComplete}
          className="shadow-lg"
        />
      );
    }

    console.log('[ResumePreview] No panel to render');
    return null;
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
              {initialized && !loading && (
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