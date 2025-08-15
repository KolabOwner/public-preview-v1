// components/resume/resume-editor-area.tsx

'use client';

import React, { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useResumeStore } from '@/lib/client/stores/resume-store';
import { FormComponents } from './components/form-components';
import { stringToSummaryData, summaryDataToString } from './utils/summary-utils';
import { preloadFormComponents } from './utils/component-loader';
import type { UnifiedResumeData, SummaryData, ResumeDocument } from '@/types/resume-store.types';

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
} from '@/types/resume-store.types';

interface ResumeEditorAreaProps {
  resume: ResumeDocument;
}

function ResumePreview(props: { resumeData: UnifiedResumeData, resumeId: string }) {
  return null;
}

export const ResumeEditorArea = React.memo(function ResumeEditorArea({ resume }: ResumeEditorAreaProps) {
  const pathname = usePathname();
  const { initializeResume, resumeData, saveStatus, resumeId, updateField, saveChanges } = useResumeStore();

  // Initialize store with resume data
  useEffect(() => {
    if (resume?.id && resumeId !== resume.id) {
      console.log('ResumeEditorArea - initializing with resume:', resume);

      const rmsData = getRMSData(resume);
      console.log('ResumeEditorArea - RMS data being passed to store:', rmsData);

      initializeResume(resume.id, rmsData);
    }
  }, [resume?.id, resumeId, initializeResume, resume]);

  // Preload components
  useEffect(() => {
    preloadFormComponents();
  }, []);

  const section = pathname.split('/').pop() || 'summary';

  // Event handlers for RMS data updates
  const createChangeHandler = useCallback((logMessage: string) =>
    async (data: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(logMessage, data);
      }
      // Update individual RMS fields in the store
      Object.keys(data).forEach(fieldKey => {
        if (data[fieldKey] !== undefined) {
          updateField(fieldKey, data[fieldKey]);
        }
      });
      // Save changes
      await saveChanges();
    }, [updateField, saveChanges]
  );

  const handleSummaryChange = useCallback(async (summaryData: Record<string, any>) => {
    // summaryData is in RMS format from the form
    if (process.env.NODE_ENV === 'development') {
      console.log('Summary changed:', summaryData);
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
            initialData={resumeData}
            onSave={handlers.contact}
          />
        );

      case 'experience':
        return (
          <FormComponents.ExperienceForm
            key={key}
            initialData={resumeData}
            onSave={handlers.experience}
          />
        );

      case 'education':
        return (
          <FormComponents.EducationForm
            key={key}
            initialData={resumeData}
            onSave={handlers.education}
          />
        );

      case 'skills':
        return (
          <FormComponents.SkillsForm
            key={key}
            initialData={resumeData}
            onSave={handlers.skills}
          />
        );

      case 'projects':
        return (
          <FormComponents.ProjectsForm
            key={key}
            initialData={resumeData}
            onSave={handlers.projects}
          />
        );

      case 'involvement':
        return (
          <FormComponents.InvolvementForm
            key={key}
            initialData={resumeData}
            onSave={handlers.involvement}
          />
        );

      case 'coursework':
        return (
          <FormComponents.CourseworkForm
            key={key}
            initialData={resumeData}
            onSave={handlers.coursework}
          />
        );

      case 'certifications':
        return (
          <FormComponents.CertificationsForm
            key={key}
            initialData={resumeData}
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
    <div className="w-full">
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
    </div>
  );
});

// Helper function to get RMS data from resume - single source of truth
function getRMSData(resume: ResumeDocument): any {
  console.log('ResumeEditorArea - using parsedData as single source of truth:', resume?.parsedData);
  return resume?.parsedData || {};
}