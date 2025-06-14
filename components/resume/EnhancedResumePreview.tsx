'use client';

// components/resume/EnhancedResumePreview.tsx
import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/auth';
import { generateResumePDF } from '@/lib/pdf-generator';
import Spinner from '@/components/ui/spinner';
import { 
  ArrowDownTrayIcon, 
  PrinterIcon, 
  DocumentTextIcon,
  SwatchIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface StyleOptions {
  fontFamily: string;
  primaryColor: string;
  fontSize: string;
  spacing: string;
  template: string;
}

const defaultStyleOptions: StyleOptions = {
  fontFamily: 'merriweather',
  primaryColor: '#2563eb', // blue-600
  fontSize: 'medium',
  spacing: 'comfortable',
  template: 'professional'
};

interface EnhancedResumePreviewProps {
  resumeId: string;
  showControls?: boolean;
  className?: string;
}

export default function EnhancedResumePreview({ 
  resumeId, 
  showControls = true,
  className = ''
}: EnhancedResumePreviewProps) {
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [styleOptions, setStyleOptions] = useState<StyleOptions>(defaultStyleOptions);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    async function fetchResume() {
      if (!resumeId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const resumeRef = doc(db, 'resumes', resumeId);
        const resumeSnap = await getDoc(resumeRef);
        
        if (!resumeSnap.exists()) {
          throw new Error('Resume not found');
        }
        
        const data = resumeSnap.data();
        setResumeData(data);
      } catch (err: any) {
        console.error('Error fetching resume:', err);
        setError(err.message || 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    }
    
    fetchResume();
  }, [resumeId]);
  
  const handleDownloadPDF = () => {
    if (!resumeData) return;
    
    try {
      // Generate PDF with styling options
      const pdfBlob = generateResumePDF(resumeData);
      
      // Create a URL for the blob
      const url = URL.createObjectURL(pdfBlob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.title || 'Resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
  const handlePrint = () => {
    if (!previewContainerRef.current) return;
    
    // Open a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print your resume.');
      return;
    }
    
    // Write print-optimized HTML to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Resume - ${resumeData?.title || 'Resume'}</title>
          <style>
            body {
              font-family: ${styleOptions.fontFamily === 'helvetica' ? 'Helvetica, Arial' : styleOptions.fontFamily === 'times' ? 'Times New Roman, serif' : 'Calibri, sans-serif'};
              color: #333;
              line-height: 1.5;
              padding: 0;
              margin: 0;
            }
            .resume-container {
              max-width: 8.5in;
              margin: 0 auto;
              padding: ${styleOptions.spacing === 'compact' ? '0.5in' : styleOptions.spacing === 'comfortable' ? '0.75in' : '1in'};
            }
            h1, h2, h3 {
              color: ${styleOptions.primaryColor};
              margin-top: 0;
            }
            h1 {
              font-size: ${styleOptions.fontSize === 'small' ? '20px' : styleOptions.fontSize === 'medium' ? '24px' : '28px'};
              margin-bottom: 8px;
            }
            h2 {
              font-size: ${styleOptions.fontSize === 'small' ? '16px' : styleOptions.fontSize === 'medium' ? '18px' : '22px'};
              border-bottom: 1px solid ${styleOptions.primaryColor};
              padding-bottom: 4px;
              margin-top: 16px;
            }
            h3 {
              font-size: ${styleOptions.fontSize === 'small' ? '14px' : styleOptions.fontSize === 'medium' ? '16px' : '18px'};
              margin-bottom: 4px;
              margin-top: 12px;
            }
            .contact-info {
              margin-bottom: 16px;
            }
            .section {
              margin-bottom: ${styleOptions.spacing === 'compact' ? '12px' : styleOptions.spacing === 'comfortable' ? '20px' : '28px'};
            }
            .experience-item, .education-item, .project-item {
              margin-bottom: ${styleOptions.spacing === 'compact' ? '8px' : styleOptions.spacing === 'comfortable' ? '16px' : '24px'};
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
            }
            .item-title {
              font-weight: bold;
            }
            .item-date {
              color: #666;
            }
            .skills-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .skill-item {
              background: rgba(${parseInt(styleOptions.primaryColor.slice(1, 3), 16)}, 
                               ${parseInt(styleOptions.primaryColor.slice(3, 5), 16)}, 
                               ${parseInt(styleOptions.primaryColor.slice(5, 7), 16)}, 0.1);
              padding: 4px 8px;
              border-radius: 4px;
              font-size: ${styleOptions.fontSize === 'small' ? '12px' : styleOptions.fontSize === 'medium' ? '14px' : '16px'};
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .resume-container {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            ${previewContainerRef.current.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 bg-white rounded-lg border shadow-sm ${className}`}>
        <div className="text-center">
          <Spinner size="lg" color="primary" className="mb-4" />
          <p className="text-gray-500">Loading resume preview...</p>
        </div>
      </div>
    );
  }
  
  if (error || !resumeData) {
    return (
      <div className={`flex items-center justify-center h-96 bg-white rounded-lg border shadow-sm ${className}`}>
        <div className="text-center p-6">
          <DocumentTextIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load preview</h3>
          <p className="text-gray-500 mb-4">{error || 'Resume data not available'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  const { parsedData } = resumeData;
  if (!parsedData) {
    return (
      <div className={`flex items-center justify-center h-96 bg-white rounded-lg border shadow-sm ${className}`}>
        <div className="text-center p-6">
          <DocumentTextIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Resume Content</h3>
          <p className="text-gray-500">This resume doesn't have any content yet.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg border shadow-sm overflow-hidden ${className}`}>
      {showControls && (
        <div className="border-b px-4 py-3 flex justify-between items-center bg-gray-50">
          <h3 className="text-base font-medium text-gray-900">Resume Preview</h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowStyleEditor(!showStyleEditor)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <SwatchIcon className="h-4 w-4 mr-1.5" />
              <span>Style</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PrinterIcon className="h-4 w-4 mr-1.5" />
              <span>Print</span>
            </button>
            
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      )}
      
      {showStyleEditor && (
        <div className="border-b bg-gray-50 p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Style Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Font Family</label>
                <select
                  value={styleOptions.fontFamily}
                  onChange={(e) => setStyleOptions({...styleOptions, fontFamily: e.target.value})}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="helvetica">Helvetica</option>
                  <option value="times">Times New Roman</option>
                  <option value="calibri">Calibri</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                <select
                  value={styleOptions.fontSize}
                  onChange={(e) => setStyleOptions({...styleOptions, fontSize: e.target.value})}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Spacing</label>
                <select
                  value={styleOptions.spacing}
                  onChange={(e) => setStyleOptions({...styleOptions, spacing: e.target.value})}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="compact">Compact</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Primary Color</label>
            <div className="flex items-center space-x-3">
              {['#2563eb', '#16a34a', '#dc2626', '#4f46e5', '#0891b2', '#4b5563'].map((color) => (
                <button
                  key={color}
                  className={`h-6 w-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    styleOptions.primaryColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setStyleOptions({...styleOptions, primaryColor: color})}
                  aria-label={`Set color to ${color}`}
                />
              ))}
              
              <input
                type="color"
                value={styleOptions.primaryColor}
                onChange={(e) => setStyleOptions({...styleOptions, primaryColor: e.target.value})}
                className="h-6 w-6 rounded border-0"
                aria-label="Custom color"
              />
            </div>
          </div>
        </div>
      )}
      
      <div 
        ref={previewContainerRef}
        className="p-8 max-h-[800px] overflow-y-auto"
        style={{
          fontFamily: styleOptions.fontFamily === 'helvetica' ? 'Helvetica, Arial, sans-serif' 
                    : styleOptions.fontFamily === 'times' ? 'Times New Roman, serif' 
                    : 'Calibri, sans-serif'
        }}
      >
        {/* Header with Contact Info */}
        <div className="text-center mb-6">
          <h1 
            className="text-2xl font-bold" 
            style={{ 
              color: styleOptions.primaryColor,
              fontSize: styleOptions.fontSize === 'small' ? '1.5rem' : styleOptions.fontSize === 'medium' ? '1.875rem' : '2.25rem'
            }}
          >
            {parsedData.contactInfo.fullName || 'Your Name'}
          </h1>
          
          <div className="mt-2 text-gray-600 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {parsedData.contactInfo.email && (
              <span>{parsedData.contactInfo.email}</span>
            )}
            {parsedData.contactInfo.phone && (
              <span>{parsedData.contactInfo.phone}</span>
            )}
            {parsedData.contactInfo.location && (
              <span>{parsedData.contactInfo.location}</span>
            )}
            {parsedData.contactInfo.linkedin && (
              <span>linkedin.com/in/{parsedData.contactInfo.linkedin}</span>
            )}
            {parsedData.contactInfo.website && (
              <span>{parsedData.contactInfo.website}</span>
            )}
          </div>
        </div>
        
        {/* Summary */}
        {parsedData.summary && (
          <div className="mb-6">
            <h2 
              className="text-lg font-semibold mb-2" 
              style={{ 
                color: styleOptions.primaryColor,
                borderBottom: `2px solid ${styleOptions.primaryColor}`,
                paddingBottom: '0.25rem',
                fontSize: styleOptions.fontSize === 'small' ? '1.125rem' : styleOptions.fontSize === 'medium' ? '1.25rem' : '1.5rem'
              }}
            >
              Professional Summary
            </h2>
            <p 
              className="text-gray-700" 
              style={{
                fontSize: styleOptions.fontSize === 'small' ? '0.875rem' : styleOptions.fontSize === 'medium' ? '1rem' : '1.125rem',
                lineHeight: styleOptions.spacing === 'compact' ? '1.4' : styleOptions.spacing === 'comfortable' ? '1.6' : '1.8'
              }}
            >
              {parsedData.summary}
            </p>
          </div>
        )}
        
        {/* Experience */}
        {parsedData.experiences && parsedData.experiences.length > 0 && (
          <div className="mb-6">
            <h2 
              className="text-lg font-semibold mb-3" 
              style={{ 
                color: styleOptions.primaryColor,
                borderBottom: `2px solid ${styleOptions.primaryColor}`,
                paddingBottom: '0.25rem',
                fontSize: styleOptions.fontSize === 'small' ? '1.125rem' : styleOptions.fontSize === 'medium' ? '1.25rem' : '1.5rem'
              }}
            >
              Experience
            </h2>
            
            <div 
              className="space-y-4" 
              style={{
                marginBottom: styleOptions.spacing === 'compact' ? '1rem' : styleOptions.spacing === 'comfortable' ? '1.5rem' : '2rem' 
              }}
            >
              {parsedData.experiences.map((exp: any, index: number) => (
                <div key={exp.id || index} className="mb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <h3 
                        className="font-bold" 
                        style={{
                          color: styleOptions.primaryColor,
                          fontSize: styleOptions.fontSize === 'small' ? '1rem' : styleOptions.fontSize === 'medium' ? '1.125rem' : '1.25rem'
                        }}
                      >
                        {exp.title}
                      </h3>
                      <div 
                        className="text-gray-700" 
                        style={{
                          fontSize: styleOptions.fontSize === 'small' ? '0.875rem' : styleOptions.fontSize === 'medium' ? '1rem' : '1.125rem'
                        }}
                      >
                        {exp.company}{exp.location ? `, ${exp.location}` : ''}
                      </div>
                    </div>
                    <div 
                      className="text-gray-600 mt-1 sm:mt-0" 
                      style={{
                        fontSize: styleOptions.fontSize === 'small' ? '0.75rem' : styleOptions.fontSize === 'medium' ? '0.875rem' : '1rem'
                      }}
                    >
                      {exp.startDate && (
                        <>
                          {new Date(exp.startDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                          {' — '}
                          {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          }) : ''}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <ul
                    className="mt-2 text-gray-700 list-disc pl-5 space-y-1"
                    style={{
                      fontSize: styleOptions.fontSize === 'small' ? '0.875rem' : styleOptions.fontSize === 'medium' ? '1rem' : '1.125rem',
                      lineHeight: styleOptions.spacing === 'compact' ? '1.4' : styleOptions.spacing === 'comfortable' ? '1.6' : '1.8'
                    }}
                  >
                    {exp.description &&
                      exp.description
                        .replace(/([.!?])\s+/g, "$1\n") // Convert all sentence endings to newlines
                        .split('\n')
                        .filter(line => line.trim())
                        .map((line, i) => (
                          <li key={i}>
                            {line.replace(/^[•\-]\s*/, '')}
                          </li>
                        ))
                    }
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Education */}
        {parsedData.education && parsedData.education.length > 0 && (
          <div className="mb-6">
            <h2 
              className="text-lg font-semibold mb-3" 
              style={{ 
                color: styleOptions.primaryColor,
                borderBottom: `2px solid ${styleOptions.primaryColor}`,
                paddingBottom: '0.25rem',
                fontSize: styleOptions.fontSize === 'small' ? '1.125rem' : styleOptions.fontSize === 'medium' ? '1.25rem' : '1.5rem'
              }}
            >
              Education
            </h2>
            
            <div 
              className="space-y-4" 
              style={{
                marginBottom: styleOptions.spacing === 'compact' ? '1rem' : styleOptions.spacing === 'comfortable' ? '1.5rem' : '2rem' 
              }}
            >
              {parsedData.education.map((edu: any, index: number) => (
                <div key={edu.id || index} className="mb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <h3 
                        className="font-bold" 
                        style={{
                          color: styleOptions.primaryColor,
                          fontSize: styleOptions.fontSize === 'small' ? '1rem' : styleOptions.fontSize === 'medium' ? '1.125rem' : '1.25rem'
                        }}
                      >
                        {edu.school}
                      </h3>
                      <div 
                        className="text-gray-700" 
                        style={{
                          fontSize: styleOptions.fontSize === 'small' ? '0.875rem' : styleOptions.fontSize === 'medium' ? '1rem' : '1.125rem'
                        }}
                      >
                        {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                        {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                      </div>
                    </div>
                    <div 
                      className="text-gray-600 mt-1 sm:mt-0" 
                      style={{
                        fontSize: styleOptions.fontSize === 'small' ? '0.75rem' : styleOptions.fontSize === 'medium' ? '0.875rem' : '1rem'
                      }}
                    >
                      {edu.endDate && (
                        new Date(edu.endDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })
                      )}
                    </div>
                  </div>
                  
                  {edu.description && (
                    <p 
                      className="mt-2 text-gray-700" 
                      style={{
                        fontSize: styleOptions.fontSize === 'small' ? '0.875rem' : styleOptions.fontSize === 'medium' ? '1rem' : '1.125rem',
                        lineHeight: styleOptions.spacing === 'compact' ? '1.4' : styleOptions.spacing === 'comfortable' ? '1.6' : '1.8'
                      }}
                    >
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Skills */}
        {parsedData.skillCategories && parsedData.skillCategories.length > 0 && (
          <div className="mb-6">
            <h2 
              className="text-lg font-semibold mb-3" 
              style={{ 
                color: styleOptions.primaryColor,
                borderBottom: `2px solid ${styleOptions.primaryColor}`,
                paddingBottom: '0.25rem',
                fontSize: styleOptions.fontSize === 'small' ? '1.125rem' : styleOptions.fontSize === 'medium' ? '1.25rem' : '1.5rem'
              }}
            >
              Skills
            </h2>
            
            <div className="space-y-3">
              {parsedData.skillCategories.map((category: any, index: number) => (
                <div key={category.id || index} className="mb-2">
                  {category.name !== 'Skills' && (
                    <h3 
                      className="font-medium mb-1" 
                      style={{
                        color: styleOptions.primaryColor,
                        fontSize: styleOptions.fontSize === 'small' ? '1rem' : styleOptions.fontSize === 'medium' ? '1.125rem' : '1.25rem'
                      }}
                    >
                      {category.name}
                    </h3>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill: any, skillIndex: number) => (
                      <span 
                        key={skill.id || skillIndex}
                        className="rounded px-2 py-1"
                        style={{
                          backgroundColor: `${styleOptions.primaryColor}15`,
                          color: styleOptions.primaryColor,
                          fontSize: styleOptions.fontSize === 'small' ? '0.75rem' : styleOptions.fontSize === 'medium' ? '0.875rem' : '1rem'
                        }}
                      >
                        {skill.name}
                        {skill.level ? ` (${skill.level})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Projects */}
        {parsedData.projects && parsedData.projects.length > 0 && (
          <div className="mb-6">
            <h2 
              className="text-lg font-semibold mb-3" 
              style={{ 
                color: styleOptions.primaryColor,
                borderBottom: `2px solid ${styleOptions.primaryColor}`,
                paddingBottom: '0.25rem',
                fontSize: styleOptions.fontSize === 'small' ? '1.125rem' : styleOptions.fontSize === 'medium' ? '1.25rem' : '1.5rem'
              }}
            >
              Projects
            </h2>
            
            <div 
              className="space-y-4" 
              style={{
                marginBottom: styleOptions.spacing === 'compact' ? '1rem' : styleOptions.spacing === 'comfortable' ? '1.5rem' : '2rem' 
              }}
            >
              {parsedData.projects.map((project: any, index: number) => (
                <div key={project.id || index} className="mb-3">
                  <h3 
                    className="font-bold" 
                    style={{
                      color: styleOptions.primaryColor,
                      fontSize: styleOptions.fontSize === 'small' ? '1rem' : styleOptions.fontSize === 'medium' ? '1.125rem' : '1.25rem'
                    }}
                  >
                    {project.title}
                    {project.organization && ` • ${project.organization}`}
                  </h3>
                  
                  <p 
                    className="mt-1 text-gray-700" 
                    style={{
                      fontSize: styleOptions.fontSize === 'small' ? '0.875rem' : styleOptions.fontSize === 'medium' ? '1rem' : '1.125rem',
                      lineHeight: styleOptions.spacing === 'compact' ? '1.4' : styleOptions.spacing === 'comfortable' ? '1.6' : '1.8'
                    }}
                  >
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}