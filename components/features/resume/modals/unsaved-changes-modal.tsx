'use client';

import React from 'react';
import { AlertTriangle, Save, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/shared/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/shared/dialog';
import { useResumeStore } from '@/lib/client/stores/resume-store';
import { type SectionKey } from '@/lib/client/stores/types';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  dirtySections?: SectionKey[];
}

const getSectionDisplayName = (section: SectionKey): string => {
  const sectionNames: Record<SectionKey, string> = {
    contactInfo: 'Contact Information',
    summary: 'Summary',
    experiences: 'Experience',
    education: 'Education', 
    skills: 'Skills',
    projects: 'Projects',
    involvements: 'Involvement',
    coursework: 'Coursework',
    certifications: 'Certifications',
    awards: 'Awards',
    languages: 'Languages',
    publications: 'Publications'
  };
  return sectionNames[section] || section;
};

export default function UnsavedChangesModal({
  isOpen,
  onClose,
  onSave,
  onDiscard,
  onCancel,
  title = "Unsaved Changes",
  description = "You have unsaved changes that will be lost if you continue.",
  dirtySections
}: UnsavedChangesModalProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const { saveStatus } = useResumeStore();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave();
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    onDiscard();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        {dirtySections && dirtySections.length > 0 && (
          <div className="py-4">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Sections with unsaved changes:
            </p>
            <ul className="space-y-1">
              {dirtySections.map(section => (
                <li key={section} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                  {getSectionDisplayName(section)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDiscard}
            className="w-full sm:w-auto order-2"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Discard Changes
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving || saveStatus.isSaving}
            className="w-full sm:w-auto order-1 sm:order-3 bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-400 hover:to-corporate-amber-400"
          >
            {isSaving || saveStatus.isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}