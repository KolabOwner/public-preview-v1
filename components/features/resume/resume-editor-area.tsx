// components/resume/resume-editor-area.tsx
'use client';

import React, { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useResumeStore } from '@/lib/client/stores/resume-store';
import FormWrapper from './wrappers/form-wrapper';
import { FormComponents } from './components/form-components';
import { parseToUnifiedFormat } from './utils/data-parsers';
import { stringToSummaryData, summaryDataToString } from './utils/summary-utils';
import { preloadFormComponents } from './utils/component-loader';
import type { UnifiedResumeData, SummaryData, ResumeDocument } from '@/lib/client/stores/types';

// Export types for use in lazy-loaded components
export type {
  ContactFormData,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  ProjectEntry,
  InvolvementEntry,
  CourseworkEntry,
  CertificationEntry
} from '@/lib/client/stores/types';

interface ResumeEditorAreaProps {
  resume: ResumeDocument;
}

function ResumePreview(props: { resumeData: UnifiedResumeData, resumeId: string }) {
  return null;
}

export const ResumeEditorArea = React.memo(function ResumeEditorArea({ resume }: ResumeEditorAreaProps) {
  const pathname = usePathname();
  const { initializeResume, resumeData, saveStatus, resumeId } = useResumeStore();

  // Initialize store with resume data
  useEffect(() => {
    if (resume?.id && resumeId !== resume.id) {
      console.log('ResumeEditorArea - initializing with resume:', resume);

      const unifiedData = determineUnifiedData(resume);
      console.log('ResumeEditorArea - unified data being passed to store:', unifiedData);

      initializeResume(resume.id, unifiedData);
    }
  }, [resume?.id, resumeId, initializeResume, resume]);

  // Preload components
  useEffect(() => {
    preloadFormComponents();
  }, []);

  const section = pathname.split('/').pop() || 'summary';

  // Event handlers
  const createChangeHandler = useCallback((logMessage: string) =>
    async (data: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(logMessage, data);
      }
    }, []
  );

  const handleSummaryChange = useCallback(async (summaryData: SummaryData) => {
    const summaryString = summaryDataToString(summaryData);
    if (process.env.NODE_ENV === 'development') {
      console.log('Summary changed:', summaryString);
    }
  }, []);

  const handlers = {
    contact: createChangeHandler('Contact info changed:'),
    experience: createChangeHandler('Experience changed:'),
    education: createChangeHandler('Education changed:'),
    skills: createChangeHandler('Skills changed:'),
    projects: createChangeHandler('Projects changed:'),
    involvement: createChangeHandler('Involvement changed:'),
    coursework: createChangeHandler('Coursework changed:'),
    certifications: createChangeHandler('Certifications changed:')
  };

  // Section rendering
  const renderSection = () => {
    const key = `${section}-${resume.id}`;

    switch (section) {
      case 'summary':
        return (
          <FormComponents.SummaryForm
            initialData={stringToSummaryData(resumeData.summary)}
            onSave={handleSummaryChange}
          />
        );

      case 'contact':
        return (
          <FormComponents.ContactForm
            key={key}
            initialData={resumeData.contactInfo}
            onSave={handlers.contact}
          />
        );

      case 'experience':
        return (
          <FormComponents.ExperienceForm
            key={key}
            initialData={resumeData.experiences}
            onSave={handlers.experience}
          />
        );

      case 'education':
        return (
          <FormComponents.EducationForm
            key={key}
            initialData={resumeData.education}
            onSave={handlers.education}
          />
        );

      case 'skills':
        return (
          <FormComponents.SkillsForm
            key={key}
            initialData={resumeData.skills}
            onSave={handlers.skills}
          />
        );

      case 'projects':
        return (
          <FormComponents.ProjectsForm
            key={key}
            initialData={resumeData.projects}
            onSave={handlers.projects}
          />
        );

      case 'involvement':
        return (
          <FormComponents.InvolvementForm
            key={key}
            initialData={resumeData.involvements}
            onSave={handlers.involvement}
          />
        );

      case 'coursework':
        return (
          <FormComponents.CourseworkForm
            key={key}
            initialData={resumeData.coursework}
            onSave={handlers.coursework}
          />
        );

      case 'certifications':
        return (
          <FormComponents.CertificationsForm
            key={key}
            initialData={resumeData.certifications}
            onSave={handlers.certifications}
          />
        );

      case 'preview':
        return (
          <ResumePreview
            resumeData={resumeData}
            resumeId={resume.id}
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Section not found</p>
          </div>
        );
    }
  };

  return (
    <FormWrapper className="w-full">
      <div className="resume-editor-content">
        {renderSection()}
      </div>

      {/* Save status indicators */}
      {saveStatus.isSaving && (
        <div className="resume-save-indicator resume-save-indicator--saving">
          Saving... ({saveStatus.pendingSections.length} pending)
        </div>
      )}

      {saveStatus.error && (
        <div className="resume-save-indicator resume-save-indicator--error">
          {saveStatus.error}
        </div>
      )}
    </FormWrapper>
  );
});

// Helper function to determine unified data from resume
function determineUnifiedData(resume: ResumeDocument): UnifiedResumeData {
  const hasDataContent = resume?.data && Object.keys(resume.data).length > 0;
  console.log('ResumeEditorArea - hasDataContent:', hasDataContent);

  if (hasDataContent) {
    const isUnifiedFormat = resume.data.contactInfo && typeof resume.data.contactInfo === 'object';
    console.log('ResumeEditorArea - isUnifiedFormat:', isUnifiedFormat);

    if (isUnifiedFormat) {
      console.log('ResumeEditorArea - using resume.data as unified:', resume.data);
      return resume.data;
    } else {
      console.log('ResumeEditorArea - parsing resume.data as RMS format:', resume.data);
      return parseToUnifiedFormat(resume.data);
    }
  } else {
    console.log('ResumeEditorArea - parsing rmsRawData:', resume?.rmsRawData);
    return parseToUnifiedFormat(resume?.rmsRawData || resume);
  }
}