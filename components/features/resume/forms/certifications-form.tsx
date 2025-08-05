'use client';

/**
 * CertificationsForm Component
 *
 * Features:
 * - Auto-save: Updates store in memory every 2 seconds (doesn't persist to database)
 * - Manual save: Persists to database via Save button or Ctrl+S
 * - Navigation: Switch between multiple certification entries
 * - Validation: Real-time validation with helpful error messages
 * - Keyboard shortcuts: Save (Ctrl+S), Undo (Ctrl+Z), New (Ctrl+Shift+N), Navigate (Arrow keys)
 * - Enhanced styling and layout consistent with experience form
 *
 * The save button is always enabled when changes are made, allowing users to
 * manually persist changes even after auto-save has updated the in-memory store.
 *
 * Note: We use React Hook Form's isDirty state instead of the store's dirty tracking
 * because RHF properly tracks form modifications against initial values.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Award, Save, Loader2, Plus, ChevronLeft, ChevronRight, AlertCircle,
  Calendar, Trash2, Building2, Undo2, Check, Clock, ExternalLink
} from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';
import { useUnsavedChangesProtection } from '@/lib/client/hooks/resume/use-unsaved-changes-protection';
import UnsavedChangesModal from '../modals/unsaved-changes-modal';

// Schema for a single certification entry
const certificationEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Certificate name is required"),
  issuer: z.string().min(1, "Issuing organization is required"),
  date: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// Schema for the entire form
const certificationsSchema = z.object({
  entries: z.array(certificationEntrySchema),
});

// TypeScript types inferred from schemas
type CertificationFormEntry = z.infer<typeof certificationEntrySchema>;
type CertificationsFormData = z.infer<typeof certificationsSchema>;

// RMS Certification data interface
interface RMSCertificationData {
  [key: string]: any; // RMS format data with keys like rms_certification_0_name, etc.
  rms_certification_count?: number;
}

interface CertificationsFormProps {
  initialData: RMSCertificationData;
  onSave?: (data: RMSCertificationData) => Promise<void>;
}

// Constants
const PLACEHOLDER_VALUES = ['n/a', 'N/A', 'none', 'null', '-', 'NA'];
const AUTO_SAVE_DELAY = 2000;

// Helper functions
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return PLACEHOLDER_VALUES.includes(trimmed) ? '' : trimmed;
};

// Extract certification entries from RMS data
const extractCertificationsFromRMS = (rmsData: RMSCertificationData): CertificationFormEntry[] => {
  const count = rmsData.rms_certification_count || 0;
  const entries: CertificationFormEntry[] = [];

  for (let i = 0; i < count; i++) {
    const entry: CertificationFormEntry = {
      id: `certification_${i}`,
      name: cleanValue(rmsData[`rms_certification_${i}_name`]),
      issuer: cleanValue(rmsData[`rms_certification_${i}_issuer`]),
      date: cleanValue(rmsData[`rms_certification_${i}_date`]),
      expiryDate: cleanValue(rmsData[`rms_certification_${i}_expirydate`]),
      credentialId: cleanValue(rmsData[`rms_certification_${i}_credentialid`]),
      url: cleanValue(rmsData[`rms_certification_${i}_url`]),
    };
    entries.push(entry);
  }

  return entries.length > 0 ? entries : [{
    id: crypto.randomUUID(),
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    credentialId: '',
    url: '',
  }];
};

// Convert form data back to RMS format
const convertToRMSFormat = (formData: CertificationsFormData): RMSCertificationData => {
  const rmsData: RMSCertificationData = {
    rms_certification_count: formData.entries.length
  };

  formData.entries.forEach((entry, i) => {
    rmsData[`rms_certification_${i}_name`] = entry.name || '';
    rmsData[`rms_certification_${i}_issuer`] = entry.issuer || '';
    rmsData[`rms_certification_${i}_date`] = entry.date || '';
    rmsData[`rms_certification_${i}_expirydate`] = entry.expiryDate || '';
    rmsData[`rms_certification_${i}_credentialid`] = entry.credentialId || '';
    rmsData[`rms_certification_${i}_url`] = entry.url || '';
  });

  return rmsData;
};

// Auto-save indicator component
const AutoSaveIndicator = ({ status }: { status: 'saving' | 'saved' | 'error' | null }) => {
  if (!status) return null;

  const config = {
    saving: { icon: Clock, text: 'Auto-saving...', className: 'text-blue-600' },
    saved: { icon: Check, text: 'Changes auto-saved', className: 'text-green-600' },
    error: { icon: AlertCircle, text: 'Auto-save failed', className: 'text-red-600' },
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </motion.div>
  );
};

// Custom hook for keyboard shortcuts
const useKeyboardShortcuts = (callbacks: {
  save: () => void;
  undo: () => void;
  newEntry: () => void;
  prev: () => void;
  next: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            callbacks.save();
            break;
          case 'z':
            e.preventDefault();
            callbacks.undo();
            break;
          case 'n':
            if (e.shiftKey) {
              e.preventDefault();
              callbacks.newEntry();
            }
            break;
        }
      }

      const target = e.target as HTMLElement;
      if (!['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            callbacks.prev();
            break;
          case 'ArrowRight':
            e.preventDefault();
            callbacks.next();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};

export default function CertificationsForm({ initialData, onSave }: CertificationsFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with RMS data
  const defaultFormValues = useMemo(() => ({
    entries: extractCertificationsFromRMS(initialData)
  }), [initialData]);

  const form = useForm<CertificationsFormData>({
    resolver: zodResolver(certificationsSchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur',
  });

  const { control, handleSubmit, formState: { errors, isDirty }, watch, setValue, reset, getValues, trigger } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // Watch current entry
  const currentEntry = watch(`entries.${activeIndex}`);

  // Set up auto-save with debouncing
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        const formData = getValues();
        const rmsData = convertToRMSFormat(formData);
        // Auto-save via onSave callback if provided
        if (onSave) {
          await onSave(rmsData);
        }
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(null), 3000);
      } catch (error) {
        setAutoSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    }, AUTO_SAVE_DELAY);
  }, [getValues, onSave]);

  // Trigger auto-save on form changes (but not on mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const subscription = watch(() => {
      debouncedAutoSave();
    });

    return () => subscription.unsubscribe();
  }, [watch, debouncedAutoSave]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Reset form when switching resumes
  useEffect(() => {
    reset(defaultFormValues);
    setActiveIndex(0);
    isFirstRender.current = true;
  }, [initialData, reset, defaultFormValues]);

  // Unsaved changes protection
  const {
    showModal,
    handleSaveAndContinue,
    handleDiscardAndContinue,
    handleCancelNavigation
  } = useUnsavedChangesProtection({ isDirty });

  // Handlers
  const handleManualSave = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const formData = getValues();
      const rmsData = convertToRMSFormat(formData);

      if (onSave) {
        await onSave(rmsData);
      }

      // Reset form state with current values to mark as clean
      reset({ entries: formData.entries });

      toast({
        title: "Success",
        description: "Certifications saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save certifications",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [trigger, getValues, onSave, reset, toast]);

  const handleUndo = useCallback(() => {
    reset(defaultFormValues);
    toast({
      title: "Changes reverted",
      description: "Certifications section restored to initial state",
    });
  }, [reset, defaultFormValues, toast]);

  const addNewCertification = useCallback(() => {
    const newEntry = {
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    };
    append(newEntry);
    setActiveIndex(fields.length);
  }, [append, fields.length]);

  const removeCertification = useCallback((index: number) => {
    if (fields.length > 1) {
      remove(index);
      setActiveIndex(Math.max(0, Math.min(index - 1, fields.length - 2)));
    }
  }, [remove, fields.length]);

  const navigatePrev = useCallback(() => {
    setActiveIndex(prev => Math.max(0, prev - 1));
  }, []);

  const navigateNext = useCallback(() => {
    setActiveIndex(prev => Math.min(fields.length - 1, prev + 1));
  }, [fields.length]);

  const handleUrlBlur = useCallback((value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
      return `https://${trimmedValue}`;
    }
    return trimmedValue;
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    save: handleManualSave,
    undo: handleUndo,
    newEntry: addNewCertification,
    prev: navigatePrev,
    next: navigateNext,
  });

  // Header title
  const headerTitle = currentEntry?.name && currentEntry?.issuer
    ? `${currentEntry.name} - ${currentEntry.issuer}`
    : currentEntry?.name || "New Certification Entry";

  // Field error helpers
  const getFieldError = (field: keyof CertificationFormEntry) => {
    return errors.entries?.[activeIndex]?.[field];
  };

  return (
    <div className={`resume-form-container ${isSaving ? 'resume-form-container--saving' : ''} ${isDirty ? 'resume-form-container--dirty' : ''}`}>
      <div className="resume-form-background" aria-hidden="true" />
      <div className="resume-form-pattern" aria-hidden="true" />

      <div className="resume-form-content">
        {/* Header */}
        <div className="resume-form-header">
          <h2 className="resume-form-title">
            <div className="resume-form-icon">
              <Award className="h-4 w-4 text-white" />
            </div>
            <span className="truncate pr-4">{headerTitle}</span>
          </h2>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              <AutoSaveIndicator status={autoSaveStatus} />
            </AnimatePresence>

            <div className="resume-form-nav">
              <Button
                variant="ghost"
                size="icon"
                onClick={navigatePrev}
                disabled={activeIndex === 0 || isSaving}
                className="resume-form-nav-button"
                title="Previous entry (← or Ctrl+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="resume-form-nav-counter">
                {activeIndex + 1} / {fields.length}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={navigateNext}
                disabled={activeIndex === fields.length - 1 || isSaving}
                className="resume-form-nav-button"
                title="Next entry (→ or Ctrl+→)"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {fields.length > 1 && (
                <>
                  <div className="resume-form-nav-divider" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCertification(activeIndex)}
                    disabled={isSaving}
                    className="resume-form-delete-button"
                    title="Delete this entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(handleManualSave)} className="space-y-6 pt-6">
          {/* Add key to force re-render when switching entries */}
          <div key={`entry-${activeIndex}`}>
            {/* Certificate Name & Issuer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>CERTIFICATE NAME</strong> <span className="resume-label-required">*</span>
                  </span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.name`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldError('name') ? 'resume-input-container--error' : ''}`}>
                      <Input
                        {...field}
                        placeholder="e.g., Project Management Professional (PMP)"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
                {getFieldError('name') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {getFieldError('name')?.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>ISSUING ORGANIZATION</strong> <span className="resume-label-required">*</span>
                  </span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.issuer`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldError('issuer') ? 'resume-input-container--error' : ''}`}>
                      <Input
                        {...field}
                        placeholder="e.g., Project Management Institute"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
                {getFieldError('issuer') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {getFieldError('issuer')?.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Issue Date & Expiry Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>ISSUE DATE</strong> <span className="resume-label-required">*</span>
                  </span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.date`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldError('date') ? 'resume-input-container--error' : ''}`}>
                      <Input
                        {...field}
                        placeholder="e.g., January 2025"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
                {getFieldError('date') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {getFieldError('date')?.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>EXPIRY DATE</strong>
                  </span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.expiryDate`}
                  control={control}
                  render={({ field }) => (
                    <div className="resume-input-container">
                      <Input
                        {...field}
                        placeholder="e.g., December 2027"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Credential ID & URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>CREDENTIAL ID</strong>
                  </span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.credentialId`}
                  control={control}
                  render={({ field }) => (
                    <div className="resume-input-container">
                      <Input
                        {...field}
                        placeholder="e.g., ABC123XYZ"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>CREDENTIAL URL</strong>
                  </span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.url`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container relative ${getFieldError('url') ? 'resume-input-container--error' : ''}`}>
                      <Input
                        {...field}
                        placeholder="e.g., https://www.credential-provider.com/verify/ABC123XYZ"
                        className="resume-input pr-10"
                        type="url"
                        onBlur={(e) => {
                          const processedUrl = handleUrlBlur(e.target.value);
                          field.onChange(processedUrl);
                        }}
                        disabled={isSaving}
                      />
                      {field.value && (
                        <a
                          href={field.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Open credential in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                />
                {getFieldError('url') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {getFieldError('url')?.message}
                  </motion.p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="resume-form-actions">
            <div className="flex items-center gap-3">
              {isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleUndo}
                  disabled={isSaving}
                  size="sm"
                  title="Undo changes (Cmd/Ctrl+Z)"
                >
                  <Undo2 className="h-4 w-4 mr-1" />
                  Undo
                </Button>
              )}

              {isDirty && !autoSaveStatus && (
                <span className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <div className="resume-section-dirty-dot" />
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={addNewCertification}
                disabled={isSaving}
                className="resume-button-secondary"
                title="Add new certification (Cmd/Ctrl+Shift+N)"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Certificate
              </Button>

              <Button
                type="submit"
                disabled={isSaving || !isDirty}
                className="resume-button-primary"
                title="Save all changes permanently (Cmd/Ctrl+S)"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <UnsavedChangesModal
        isOpen={showModal}
        onClose={handleCancelNavigation}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardAndContinue}
        onCancel={handleCancelNavigation}
        title="Unsaved Certification Changes"
        description="You have unsaved changes to your certifications. What would you like to do?"
      />
    </div>
  );
}