'use client';

import React from 'react';
import { useResumeStore } from '@/lib/client/stores/resume-store';
import { useUnsavedChangesProtection } from '@/lib/client/hooks/resume/use-unsaved-changes-protection';
import UnsavedChangesModal from '../modals/unsaved-changes-modal';

interface FormWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function FormWrapper({ children, className = '' }: FormWrapperProps) {
  const { getDirtySections, saveAllDirty, revertAll } = useResumeStore();
  
  const {
    showModal,
    handleSaveAndContinue,
    handleDiscardAndContinue,
    handleCancelNavigation
  } = useUnsavedChangesProtection();

  const dirtySections = getDirtySections();

  return (
    <div className={className}>
      {children}
      
      <UnsavedChangesModal
        isOpen={showModal}
        onClose={handleCancelNavigation}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardAndContinue}
        onCancel={handleCancelNavigation}
        title="Unsaved Resume Changes"
        description="You have unsaved changes to your resume. What would you like to do?"
        dirtySections={dirtySections}
      />
    </div>
  );
}