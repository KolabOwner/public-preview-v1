// components/resume/resume-preview.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, AlertCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/lib/firebase/config";
import ResumeHeaderBar, { DocumentSettings, ResumeHeaderBarRef } from '@/components/layout/resume-header-bar';
import KeywordTargetingPanel from "@/components/resume/panels/keyword-targeting-panel";
import JobInfoPanel from "@/components/resume/panels/job-info-panel";
import SharePanel from "@/components/resume/panels/share-panel";
import { generateResumePDF, generateResumePDFAsync } from '@/lib/pdf-generator';
import { useJobInfo } from '@/contexts/job-info-context';
import { useResumeData } from '@/contexts/resume-data-context';

interface ResumePreviewProps {
  resumeData: any;
  resumeId: string;
  showJobPanels?: boolean;
  className?: string;
}

export default function ResumePreview({
  resumeData,
  resumeId,
  showJobPanels = true,
  className = ""
}: ResumePreviewProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentResumeId, updateJobInfo } = useJobInfo();
  const { updateResumeData, fetchResumeData } = useResumeData();
  const headerBarRef = useRef<ResumeHeaderBarRef>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasJobInfo, setHasJobInfo] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // IMPROVEMENT: Add font loading state
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // IMPROVEMENT: Font loading detection
  useEffect(() => {
    // Check if fonts are already loaded
    const checkFonts = async () => {
      if ('fonts' in document) {
        try {
          // Load specific weights matching PDF
          await Promise.all([
            document.fonts.load('300 1em Merriweather'),
            document.fonts.load('400 1em Merriweather'),
            document.fonts.load('700 1em Merriweather'),
          ]);
          setFontsLoaded(true);
        } catch (err) {
          console.warn('Font loading failed:', err);
          setFontsLoaded(true); // Continue anyway
        }
      } else {
        setFontsLoaded(true); // Fallback for older browsers
      }
    };

    checkFonts();
  }, []);

  // Check for dark mode using CSS media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
                    mediaQuery.matches;
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

  // Check if job info exists in Firestore
  const checkJobInfo = useCallback(async () => {
    console.log('checkJobInfo called with:', { user: !!user, resumeId, showJobPanels });
    if (!user || !resumeId || !showJobPanels) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const resumeRef = doc(db, 'resumes', resumeId);
      const resumeSnap = await getDoc(resumeRef);

      if (resumeSnap.exists()) {
        const data = resumeSnap.data();
        console.log('Resume data from Firestore:', { 
          hasJobInfo: !!data.job_info,
          jobInfo: data.job_info 
        });
        
        const hasJob = !!(data.job_info?.title && data.job_info?.description);
        setHasJobInfo(hasJob);

        // Load job info into context if it exists
        if (hasJob && data.job_info) {
          console.log('Updating job info in context with:', {
            title: data.job_info.title || '',
            description: data.job_info.description || ''
          });
          
          // Ensure resume ID is set before updating job info
          setCurrentResumeId(resumeId);
          
          // Use setTimeout to ensure the resume ID is set in the context
          setTimeout(() => {
            updateJobInfo({
              title: data.job_info.title || '',
              description: data.job_info.description || '',
              company: data.job_info.company || '',
              keywords: data.job_info.keywords || [],
              isActive: true
            });
          }, 0);
        } else {
          console.log('No job info found or incomplete:', { hasJob, jobInfo: data.job_info });
        }

        // Store document ID and user ID for the panels to use
        localStorage.setItem('current_document_id', resumeId);
        if (user?.uid) {
          localStorage.setItem('current_user_id', user.uid);
        }
      } else {
        setHasJobInfo(false);
      }
    } catch (error) {
      console.error('Error checking job info:', error);
      setHasJobInfo(false);
    } finally {
      setLoading(false);
    }
  }, [user, resumeId, showJobPanels, updateJobInfo, setCurrentResumeId]);

  // Job info is now checked in the effect below after resume ID is set

  // Set current resume ID for job info context
  useEffect(() => {
    if (resumeId) {
      setCurrentResumeId(resumeId);
    }
    
    // Cleanup on unmount
    return () => {
      if (resumeId) {
        setCurrentResumeId(null);
      }
    };
  }, [resumeId, setCurrentResumeId]);
  
  // Fetch resume data and check job info after resume ID is set
  useEffect(() => {
    const initializeData = async () => {
      if (resumeId && user) {
        // Fetch resume data for the ResumeDataContext
        await fetchResumeData(resumeId);
        
        // Check job info after resume data is loaded
        await checkJobInfo();
      }
    };
    
    initializeData();
  }, [resumeId, user]); // Separate effect to avoid race conditions

  // Resume data is now fetched directly by the ResumeDataContext

  // Enhanced document settings - now using CSS for styling
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>({
    zoom: 119,
    fontFamily: 'Times New Roman',
    primaryColor: '#000000',
    textColor: '#333333',
    fontSize: 9.5,
    lineHeight: 1.3,
    sectionSpacing: 0.75,
    paperSize: 'Letter',
    showIcons: false,
    showDividers: true,
    useIndent: false,
    viewAsPages: true
  });

  // Effect to update color scheme based on theme for the header bar only
  useEffect(() => {
    if (isDarkMode) {
      setDocumentSettings(prev => ({
        ...prev,
        primaryColor: '#60a5fa',
      }));
    } else {
      setDocumentSettings(prev => ({
        ...prev,
        primaryColor: '#3b82f6',
      }));
    }
  }, [isDarkMode]);

  // Handle job info completion
  const handleJobInfoComplete = useCallback(async () => {
    // Re-check job info from Firestore to get the updated data
    await checkJobInfo();
  }, []);

  // Handle request to update job info
  const handleJobUpdate = useCallback(() => {
    setHasJobInfo(false);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      // Generate PDF using our styled generator with RMS metadata
      const resumeDataForPDF = {
        title: resumeData.title || 'Resume',
        template: 'professional',
        fontSize: 'medium',
        parsedData: resumeData,
        rmsRawData: resumeData.rmsRawData // Include RMS data if available
      };

      // Show loading state
      toast({
        title: "Generating PDF",
        description: "Embedding metadata and creating your resume...",
      });

      // Use async version to embed RMS metadata
      const pdfBlob = await generateResumePDFAsync(resumeDataForPDF);

      // Create download link
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
        description: "Your resume with RMS metadata has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    toast({
      title: "Share Feature",
      description: "Share functionality coming soon!",
    });
  };

  // Handler for document settings changes
  const handleDocumentSettingChange = (
    setting: keyof DocumentSettings,
    value: DocumentSettings[keyof DocumentSettings]
  ) => {
    setDocumentSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // PDF download handler for ResumeHeaderBar
  const handleDownloadPDF = async () => {
    try {
      // Generate PDF using our styled generator
      const resumeDataForPDF = {
        title: resumeData.title || 'Resume',
        template: 'professional',
        fontSize: 'medium',
        parsedData: resumeData
      };

      const pdfBlob = generateResumePDF(resumeDataForPDF);

      // Create download link
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

  // Auto-adjust handler
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

  // Template change handler
  const handleTemplateChange = async (template: string) => {
    try {
      toast({
        title: "Template Changed",
        description: `Resume template changed to ${template}.`,
      });
    } catch (error) {
      console.error('Error changing template:', error);
    }
  };

  // Score exploration handler
  const handleExploreScore = () => {
    toast({
      title: "Score Analysis",
      description: "Resume score analysis coming soon!",
    });
  };

  // Helper function to decode HTML entities
  const decodeHTMLEntities = (text: string): string => {
    if (!text) return '';
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  // Helper function to parse bullet points
  const parseBulletPoints = (text: string): string[] => {
    if (!text) return [];

    // Decode HTML entities first
    const decodedText = decodeHTMLEntities(text);

    // Check if text contains newlines with bullet points
    if (decodedText.includes('\n')) {
      const lines = decodedText
        .split('\n')
        .map(line => line.replace(/^[•·\-\*]\s*/, '').trim())
        .filter(Boolean);
      
      if (lines.length > 1) {
        return lines;
      }
    }

    // Check if there are actual bullet characters (• or ·)
    if (decodedText.includes('•') || decodedText.includes('·')) {
      return decodedText
        .split(/[•·]/)
        .map(item => item.trim())
        .filter(Boolean);
    }

    // Don't split on commas - they're often part of the content (numbers, lists, etc.)
    // If no bullet characters, return as single item
    return [decodedText];
  };

  // Format date helper
  const formatDate = (date: string | Date | null | undefined, format?: string) => {
    if (!date) return '';

    if (typeof date === 'string') {
      if (date.toLowerCase() === 'present') return 'Present';
      if (date.trim() === '') return '';
      return date;
    }

    try {
      if (date instanceof Date) {
        if (format === 'YYYY') {
          return date.getFullYear().toString();
        } else if (format === 'MM/YYYY') {
          return `${date.getMonth() + 1}/${date.getFullYear()}`;
        } else {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          });
        }
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }

    return String(date);
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

  // Extract contact info
  const contact = resumeData.contactInfo || {};
  const fullName = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Your Name';

  // Main layout with conditional job panels
  const resumePreviewContent = (
    <div className="w-full">
      {/* Resume Header Bar with formatting controls */}
      <ResumeHeaderBar
        ref={headerBarRef}
        resumeScore={90}
        documentSettings={documentSettings}
        onDocumentSettingChange={handleDocumentSettingChange}
        onDownloadPDF={handleDownloadPDF}
        onAutoAdjust={handleAutoAdjust}
        onTemplateChange={handleTemplateChange}
        onExploreScore={handleExploreScore}
        isDarkMode={isDarkMode}
        className="no-print"
      />

      {/* Resume Preview with frame-like padding - simulating paper view */}
      <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-xl" style={{ minHeight: 'calc(1056px * 0.75 + 4rem)' }}>
        {/* Inline styles for resume preview */}
        <style jsx>{`
          .resume-preview-container {
            font-family: 'Times New Roman', Times, serif !important;
            color: #333333 !important;
            line-height: 1.3 !important;
            font-size: 9.5pt !important;
          }
          
          .resume-content {
            padding: 0.4in !important;
            background: white;
            font-family: 'Times New Roman', Times, serif !important;
            min-height: 100%;
            box-sizing: border-box;
          }
          
          .resume-name {
            font-size: 16pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            color: #000000 !important;
            margin-bottom: 4px !important;
            text-align: center !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .resume-contact {
            font-size: 9.5pt !important;
            color: #333333 !important;
            text-align: center !important;
            font-family: 'Times New Roman', Times, serif !important;
            margin-bottom: 8px !important;
          }
          
          .contact-separator {
            margin: 0 8px !important;
            color: #333333 !important;
          }
          
          .resume-section-header {
            font-weight: bold !important;
            font-size: 10pt !important;
            text-transform: uppercase !important;
            margin-top: 10px !important;
            margin-bottom: 4px !important;
            border-bottom: 1px solid #000000 !important;
            padding-bottom: 2px !important;
            color: #000000 !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .resume-job-header {
            margin-bottom: 0px !important;
          }
          
          .resume-job-title,
          .resume-degree-title {
            font-weight: bold !important;
            font-size: 10pt !important;
            color: #000000 !important;
            font-family: 'Times New Roman', Times, serif !important;
            margin-bottom: 0px !important;
          }
          
          .resume-company,
          .resume-school {
            font-size: 9.5pt !important;
            margin-bottom: 2px !important;
            color: #333333 !important;
            font-family: 'Times New Roman', Times, serif !important;
            display: block !important;
            overflow: hidden !important;
          }
          
          .resume-date {
            font-size: 9.5pt !important;
            text-align: right !important;
            color: #333333 !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .resume-bullet-list {
            padding-left: 12px !important;
            margin-top: 1px !important;
            list-style: none !important;
          }
          
          .resume-bullet-list li {
            position: relative !important;
            margin-bottom: 3px !important;
            line-height: 1.3 !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-weight: 400 !important;
            font-size: 9.5pt !important;
            color: #333333 !important;
            padding-left: 2px !important;
          }
          
          .resume-bullet-list li:before {
            content: "•" !important;
            position: absolute !important;
            left: -10px !important;
            color: #333333 !important;
          }
          
          .resume-summary {
            margin-top: 3px !important;
            margin-bottom: 8px !important;
            line-height: 1.3 !important;
            color: #333333 !important;
            font-weight: 400 !important;
            font-size: 9.5pt !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .resume-skills-category {
            margin-top: 4px !important;
            margin-bottom: 4px !important;
            line-height: 1.3 !important;
            font-weight: 400 !important;
            color: #333333 !important;
            font-size: 9.5pt !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .resume-skills-title {
            font-weight: bold !important;
            display: inline !important;
            color: #333333 !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .resume-school-info {
            display: flex !important;
            justify-content: space-between !important;
            line-height: 1.3 !important;
            font-size: 9.5pt !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .resume-project-title {
            font-weight: bold !important;
            display: flex !important;
            justify-content: space-between !important;
            font-size: 10pt !important;
            color: #000000 !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .resume-experience-block,
          .resume-education-block {
            margin-bottom: 6px !important;
          }
          
          .resume-preview-container section {
            margin-bottom: 0 !important;
          }
          
          .resume-preview-container section + section {
            margin-top: 10px !important;
          }
        `}</style>

        {/* Resume Document - Styled to match PDF exactly (8.5" x 11" at 96 DPI) */}
        <div
          className="bg-white shadow-2xl overflow-hidden resume-preview-container"
          style={{
            transform: `scale(${documentSettings.zoom / 100})`,
            transformOrigin: 'top center',
            marginBottom: documentSettings.zoom > 100 ? '2rem' : '0',
            width: '816px',
            height: '1056px',
            margin: '0 auto',
            boxSizing: 'border-box',
            outline: '15px solid #64748b',
            outlineOffset: '1px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.1), 0 0 40px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="resume-content">
            {/* Contact Information */}
            <header className="resume-header">
              <h1 className="resume-name">{fullName}</h1>
              <div className="resume-contact">
                {contact.email && <span>{decodeHTMLEntities(contact.email)}</span>}
                {contact.email && contact.phone && <span className="contact-separator">•</span>}
                {contact.phone && <span>{decodeHTMLEntities(contact.phone)}</span>}
                {(contact.email || contact.phone) && (contact.city || contact.state) && <span className="contact-separator">•</span>}
                {(contact.city || contact.state) && (
                  <span>{[contact.city, contact.state].filter(Boolean).map(decodeHTMLEntities).join(', ')}</span>
                )}
                {(contact.linkedin || contact.website) && (
                  <>
                    {(contact.email || contact.phone || contact.city || contact.state) && <span className="contact-separator">•</span>}
                    {contact.linkedin && <span>linkedin.com/in/{decodeHTMLEntities(contact.linkedin).replace(/^.*\/in\//, '')}</span>}
                    {contact.linkedin && contact.website && <span className="contact-separator">•</span>}
                    {contact.website && <span>{decodeHTMLEntities(contact.website)}</span>}
                  </>
                )}
              </div>
            </header>

            {/* Summary */}
            {resumeData.summary && resumeData.summary.trim() && (
              <section>
                <h2 className="resume-section-header">PROFESSIONAL SUMMARY</h2>
                <p className="resume-summary">{decodeHTMLEntities(resumeData.summary)}</p>
              </section>
            )}

            {/* Experience */}
            {resumeData.experiences && resumeData.experiences.length > 0 && (
              <section>
                <h2 className="resume-section-header">EXPERIENCE</h2>
                {resumeData.experiences.map((exp: any, idx: number) => (
                  <div key={exp.id || idx} className="resume-experience-block">
                    <div className="resume-job-header">
                      <h3 className="resume-job-title">{decodeHTMLEntities(exp.title || 'Position')}</h3>
                    </div>
                    <div className="resume-company">
                      <span>{decodeHTMLEntities(exp.company || 'Company')}</span>
                      <span className="resume-date" style={{ float: 'right' }}>
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}{exp.location && `, ${decodeHTMLEntities(exp.location)}`}
                      </span>
                    </div>
                    {exp.description && (
                      <ul className="resume-bullet-list">
                        {parseBulletPoints(exp.description).map((bulletPoint, i) => (
                          <li key={i}>{bulletPoint}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Education */}
            {resumeData.education && resumeData.education.length > 0 && (
              <section>
                <h2 className="resume-section-header">EDUCATION</h2>
                {resumeData.education.map((edu: any, idx: number) => (
                  <div key={edu.id || idx} className="resume-education-block">
                    <div className="resume-degree-title">
                      {edu.degree && edu.fieldOfStudy ?
                        `${edu.degree} in ${edu.fieldOfStudy}` :
                        edu.qualification || edu.degree || 'Degree'}
                    </div>
                    <div className="resume-school-info">
                      {edu.minor && `Minor in ${edu.minor} • `}
                      {edu.institution || edu.school || 'Institution'}
                      {edu.location && ` • ${edu.location}`}
                      {` • ${edu.formattedDate || edu.endDate || formatDate(edu.date || null, edu.dateFormat)}`}
                    </div>
                    {(edu.score || edu.gpa) && (
                      <div className="resume-school">
                        GPA: {edu.score || edu.gpa}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Projects */}
            {resumeData.projects && resumeData.projects.length > 0 && (
              <section>
                <h2 className="resume-section-header">PROJECTS</h2>
                {resumeData.projects.map((project: any, idx: number) => (
                  <div key={project.id || idx}>
                    <div className="resume-project-title">
                      <span>{project.title || 'Project'}</span>
                      {(project.startDate || project.endDate) && (
                        <span className="resume-date">
                          {formatDate(project.startDate)} {project.startDate && project.endDate && '—'} {formatDate(project.endDate || (project.current ? 'Present' : ''))}
                        </span>
                      )}
                    </div>
                    {project.organization && (
                      <div className="resume-company">{decodeHTMLEntities(project.organization)}</div>
                    )}
                    {project.description && (
                      <ul className="resume-bullet-list">
                        {parseBulletPoints(project.description).map((bulletPoint, i) => (
                          <li key={i}>{bulletPoint}</li>
                        ))}
                      </ul>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="resume-skills-category">
                        <span className="resume-skills-title">Technologies:</span>{' '}
                        {Array.isArray(project.technologies)
                          ? project.technologies.join(', ')
                          : project.technologies
                        }
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Involvement */}
            {resumeData.involvements && resumeData.involvements.length > 0 && (
              <section>
                <h2
                  className="resume-section-header"
                  style={{
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: 'calc(8.5pt * var(--resume-scale))',
                    borderBottom: documentSettings.showDividers ? '1px solid #d1d5db' : 'none',
                    paddingBottom: '2px',
                    marginBottom: `${documentSettings.sectionSpacing * 0.75}rem`,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Involvement
                </h2>
                {resumeData.involvements.map((inv: any, idx: number) => (
                  <div key={inv.id || idx} className="mb-2 page-break-avoid">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3
                          className="font-semibold"
                          style={{
                            color: '#000',
                            fontSize: 'calc(7.5pt * var(--resume-scale))',
                            fontWeight: 700
                          }}
                        >
                          {inv.role || 'Role'}
                        </h3>
                        <p
                          style={{
                            color: '#000',
                            fontSize: 'calc(6.7pt * var(--resume-scale))',
                            fontWeight: 400
                          }}
                        >
                          {inv.organization || 'Organization'}
                        </p>
                      </div>
                      <div
                        className="text-right"
                        style={{
                          color: '#000',
                          fontSize: 'calc(6.7pt * var(--resume-scale))',
                          fontWeight: 400,
                          fontStyle: 'italic'
                        }}
                      >
                        {inv.location && <p style={{ color: '#000' }}>{inv.location}</p>}
                        <p style={{ color: '#000' }}>
                          {formatDate(inv.startDate)} - {formatDate(inv.endDate || (inv.current ? 'Present' : ''))}
                        </p>
                      </div>
                    </div>
                    {inv.description && (
                      <ul className="resume-bullet-list">
                        {parseBulletPoints(inv.description).map((bulletPoint, i) => (
                          <li key={i}>{bulletPoint}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Skills */}
            {resumeData.skillCategories && resumeData.skillCategories.length > 0 && (
              <section>
                <h2 className="resume-section-header">SKILLS</h2>
                {resumeData.skillCategories.map((category: any, idx: number) => (
                  <div key={category.id || idx} className="resume-skills-category">
                    <span className="resume-skills-title">{category.name}:</span>
                    <span>
                      {' '}
                      {Array.isArray(category.skills)
                        ? category.skills.map((skill: any) =>
                            typeof skill === 'string' ? skill : skill.name
                          ).join(', ')
                        : category.skills
                      }
                    </span>
                  </div>
                ))}
              </section>
            )}

            {/* Coursework */}
            {resumeData.coursework && resumeData.coursework.length > 0 && (
              <section>
                <h2
                  className="resume-section-header"
                  style={{
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: 'calc(8.5pt * var(--resume-scale))',
                    borderBottom: documentSettings.showDividers ? '1px solid #d1d5db' : 'none',
                    paddingBottom: '2px',
                    marginBottom: `${documentSettings.sectionSpacing * 0.75}rem`,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Relevant Coursework
                </h2>
                <div className="grid grid-cols-2 gap-1">
                  {resumeData.coursework.map((course: any, idx: number) => (
                    <div key={course.id || idx} style={{
                      fontSize: 'calc(6.7pt * var(--resume-scale))',
                      fontWeight: 300
                    }}>
                      <span
                        className="font-medium"
                        style={{
                          color: '#000',
                          fontWeight: 700
                        }}
                      >
                        {course.name}
                      </span>
                      {course.department && (
                        <span style={{ color: '#000', fontWeight: 300 }}> - {course.department}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {resumeData.certifications && resumeData.certifications.length > 0 && (
              <section>
                <h2
                  className="resume-section-header"
                  style={{
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: 'calc(8.5pt * var(--resume-scale))',
                    borderBottom: documentSettings.showDividers ? '1px solid #d1d5db' : 'none',
                    paddingBottom: '2px',
                    marginBottom: `${documentSettings.sectionSpacing * 0.75}rem`,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Certifications
                </h2>
                {resumeData.certifications.map((cert: any, idx: number) => (
                  <div key={cert.id || idx} className="mb-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3
                          className="font-semibold"
                          style={{
                            color: '#000',
                            fontSize: 'calc(7.5pt * var(--resume-scale))',
                            fontWeight: 700
                          }}
                        >
                          {cert.name || cert.title || ''}
                        </h3>
                        <p
                          style={{
                            color: '#000',
                            fontSize: 'calc(6.7pt * var(--resume-scale))',
                            fontWeight: 400
                          }}
                        >
                          {cert.issuer || cert.organization || ''}
                        </p>
                      </div>
                      <p
                        style={{
                          color: '#000',
                          fontSize: 'calc(6.7pt * var(--resume-scale))',
                          fontWeight: 400,
                          fontStyle: 'italic'
                        }}
                      >
                        {formatDate(cert.issueDate || cert.date || cert.endDate || '')}
                      </p>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Languages */}
            {resumeData.languages && resumeData.languages.length > 0 && (
              <section>
                <h2
                  className="resume-section-header"
                  style={{
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: 'calc(8.5pt * var(--resume-scale))',
                    borderBottom: documentSettings.showDividers ? '1px solid #d1d5db' : 'none',
                    paddingBottom: '2px',
                    marginBottom: `${documentSettings.sectionSpacing * 0.75}rem`,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Languages
                </h2>
                <div className="flex flex-wrap gap-3">
                  {resumeData.languages.map((lang: any, idx: number) => (
                    <div key={lang.id || idx} style={{
                      fontSize: 'calc(6.7pt * var(--resume-scale))',
                      fontWeight: 300
                    }}>
                      <span
                        className="font-medium"
                        style={{
                          color: '#000',
                          fontWeight: 700
                        }}
                      >
                        {lang.name}
                      </span>
                      {lang.proficiency && (
                        <span style={{ color: '#000', fontWeight: 300 }}> - {lang.proficiency}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Return layout with or without job panels
  if (showJobPanels && user) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex gap-4">
          {/* Left Side - Resume Preview */}
          <div className="w-[1034px] flex-shrink-0">
            {resumePreviewContent}
          </div>

          {/* Right Side - Conditional Panels */}
          <div className="w-72 flex-shrink-0">
            <div>
              {loading ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : hasJobInfo === false ? (
                <JobInfoPanel
                  onComplete={handleJobInfoComplete}
                  className="shadow-lg"
                />
              ) : hasJobInfo === true ? (
                <KeywordTargetingPanel
                  onJobUpdate={handleJobUpdate}
                  className="shadow-lg"
                />
              ) : null}

              {/* Share Panel Below */}
              {!loading && (
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

  // Return just the resume preview without panels
  return <div className={`w-full max-w-4xl mx-auto ${className}`}>{resumePreviewContent}</div>;
}