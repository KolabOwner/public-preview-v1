'use client';

/**
 * ExperienceForm Component
 *
 * Features:
 * - Auto-save: Updates store in memory every 2 seconds (doesn't persist to database)
 * - Manual save: Persists to database via Save button or Ctrl+S
 * - Navigation: Switch between multiple experience entries
 * - Validation: Real-time validation with helpful error messages
 * - Keyboard shortcuts: Save (Ctrl+S), Undo (Ctrl+Z), New (Ctrl+Shift+N), Navigate (Arrow keys)
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
  Plus, X, ChevronLeft, ChevronRight, Save, Loader2, Trash2,
  GripVertical, Briefcase, AlertCircle, Undo2, Check, Clock
} from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useResumeStore, type ExperienceEntry } from '@/lib/client/stores/resume-store';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';

// Schema definitions
const bulletPointSchema = z.object({
  value: z.string(),
});

const experienceEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  bulletPoints: z.array(bulletPointSchema).optional(),
}).refine(data => data.current || !!data.endDate?.trim(), {
  message: "End date is required unless it's a current position",
  path: ["endDate"],
});

const experienceSchema = z.object({
  entries: z.array(experienceEntrySchema),
});

type BulletPoint = z.infer<typeof bulletPointSchema>;
type ExperienceFormEntry = Omit<z.infer<typeof experienceEntrySchema>, 'bulletPoints'> & {
  bulletPoints: BulletPoint[];
};
type ExperienceFormData = z.infer<typeof experienceSchema>;

interface ExperienceFormProps {
  initialData: ExperienceEntry[];
  onSave?: (data: ExperienceEntry[]) => Promise<void>;
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

const convertToFormFormat = (entries: ExperienceEntry[]): ExperienceFormEntry[] => {
  return entries.map(entry => ({
    ...entry,
    id: entry.id || crypto.randomUUID(),
    title: cleanValue(entry.title),
    company: cleanValue(entry.company),
    location: cleanValue(entry.location),
    startDate: cleanValue(entry.startDate),
    endDate: cleanValue(entry.endDate),
    bulletPoints: entry.bulletPoints?.length
      ? entry.bulletPoints.map(bp => ({ value: bp }))
      : [{ value: '' }],
  }));
};

const convertToStoreFormat = (formData: ExperienceFormData): ExperienceEntry[] => {
  return formData.entries.map(entry => ({
    id: entry.id || crypto.randomUUID(),
    title: entry.title || '',
    company: entry.company || '',
    location: entry.location || '',
    startDate: entry.startDate || '',
    endDate: entry.endDate || '',
    current: entry.current || false,
    bulletPoints: entry.bulletPoints
      ? entry.bulletPoints.map(bp => bp.value).filter(v => v?.trim())
      : [],
  }));
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

export default function ExperienceForm({ initialData, onSave }: ExperienceFormProps) {
  const { toast } = useToast();
  const {
    updateSection,
    saveSection,
    saveStatus,
    revertSection
  } = useResumeStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('experiences');

  // Initialize form
  const defaultFormValues = useMemo(() => ({
    entries: initialData?.length > 0
      ? convertToFormFormat(initialData)
      : [{
          id: crypto.randomUUID(),
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          bulletPoints: [{ value: '' }]
        }]
  }), [initialData]);

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur',
  });

  const { control, handleSubmit, formState: { errors, isDirty }, watch, setValue, reset, getValues, trigger } = form;

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "entries",
  });

  // Watch current entry
  const currentEntry = watch(`entries.${activeIndex}`);

  // Set up auto-save with debouncing
  // Auto-save only updates the store in memory, doesn't persist to database
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        const formData = getValues();
        const storeData = convertToStoreFormat(formData);
        // Only update the store, don't save to Firebase yet
        updateSection('experiences', storeData);
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(null), 3000);
      } catch (error) {
        setAutoSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    }, AUTO_SAVE_DELAY);
  }, [getValues, updateSection]);

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
      const formData = getValues();
      const storeData = convertToStoreFormat(formData);

      if (onSave) {
        await onSave(storeData);
      }

      updateSection('experiences', storeData);
      await saveSection('experiences');

      // Reset form state with current values to mark as clean
      reset({ entries: formData.entries });

      toast({
        title: "Success",
        description: "Experience information saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save experience information",
        variant: "destructive",
      });
    }
  }, [trigger, getValues, onSave, updateSection, saveSection, toast]);

  const handleUndo = useCallback(() => {
    revertSection('experiences');
    reset(defaultFormValues);
    toast({
      title: "Changes reverted",
      description: "Experience section restored to last saved state",
    });
  }, [revertSection, reset, defaultFormValues, toast]);

  const addNewExperience = useCallback(() => {
    const newEntry = {
      id: crypto.randomUUID(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bulletPoints: [{ value: '' }]
    };
    append(newEntry);
    setActiveIndex(fields.length);
  }, [append, fields.length]);

  const removeExperience = useCallback((index: number) => {
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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    save: handleManualSave,
    undo: handleUndo,
    newEntry: addNewExperience,
    prev: navigatePrev,
    next: navigateNext,
  });

  // Header title
  const headerTitle = currentEntry?.title && currentEntry?.company
    ? `${currentEntry.title} at ${currentEntry.company}`
    : "New Experience Entry";

  // Field error helpers
  const getFieldError = (field: keyof ExperienceFormEntry) => {
    return errors.entries?.[activeIndex]?.[field];
  };

  // Handle current position toggle
  const handleCurrentToggle = useCallback((checked: boolean) => {
    if (checked) {
      setValue(`entries.${activeIndex}.endDate`, '', {
        shouldValidate: false,
        shouldDirty: true
      });
    }
  }, [activeIndex, setValue]);

  return (
    <div className={`resume-form-container ${isSaving ? 'resume-form-container--saving' : ''} ${isDirty ? 'resume-form-container--dirty' : ''}`}>
      <div className="resume-form-background" aria-hidden="true" />
      <div className="resume-form-pattern" aria-hidden="true" />

      <div className="resume-form-content">
        {/* Header */}
        <div className="resume-form-header">
          <h2 className="resume-form-title">
            <div className="resume-form-icon">
              <Briefcase className="h-4 w-4 text-white" />
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
                    onClick={() => removeExperience(activeIndex)}
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
        <form onSubmit={handleSubmit(handleManualSave)} className="space-y-6">
          {/* Add key to force re-render when switching entries */}
          <div key={`entry-${activeIndex}`}>
            {/* Job Title & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="resume-label">
                  Job Title <span className="resume-label-required">*</span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.title`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldError('title') ? 'resume-input-container--error' : ''}`}>
                      <Input
                        {...field}
                        placeholder="e.g., Software Engineer"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
                {getFieldError('title') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {getFieldError('title')?.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="resume-label">
                  Company <span className="resume-label-required">*</span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.company`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldError('company') ? 'resume-input-container--error' : ''}`}>
                      <Input
                        {...field}
                        placeholder="e.g., Google Inc."
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
                {getFieldError('company') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {getFieldError('company')?.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Location & Time Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="resume-label">Location</Label>
                <Controller
                  name={`entries.${activeIndex}.location`}
                  control={control}
                  render={({ field }) => (
                    <div className="resume-input-container">
                      <Input
                        {...field}
                        placeholder="e.g., New York, NY"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
              </div>

              {/* Time Period Container - Consistent with other form containers */}
              <div className="space-y-2">
                <Label className="resume-label">
                  Time Period <span className="resume-label-required">*</span>
                </Label>
                <div className="flex items-start gap-2">
                  {/* Start Date Container */}
                  <div className="flex-grow">
                    <div className={`resume-input-container ${getFieldError('startDate') ? 'resume-input-container--error' : ''}`}>
                      <Controller
                        name={`entries.${activeIndex}.startDate`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Jan 2023"
                            className="resume-input"
                            disabled={isSaving}
                          />
                        )}
                      />
                    </div>
                    {getFieldError('startDate') && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="resume-error-message mt-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">Required</span>
                      </motion.p>
                    )}
                  </div>

                  {/* End Date Container */}
                  <div className="flex-grow">
                    <div className={`resume-input-container ${getFieldError('endDate') && !currentEntry?.current ? 'resume-input-container--error' : ''}`}>
                      <Controller
                        name={`entries.${activeIndex}.endDate`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={currentEntry?.current ? "Present" : "Dec 2023"}
                            disabled={currentEntry?.current || isSaving}
                            className={`resume-input ${currentEntry?.current ? 'opacity-50' : ''}`}
                          />
                        )}
                      />
                    </div>
                    {getFieldError('endDate') && !currentEntry?.current && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="resume-error-message mt-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">Required</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Current Position Toggle */}
                  <div className="flex flex-col items-center pt-2 gap-1">
                    <Controller
                      name={`entries.${activeIndex}.current`}
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleCurrentToggle(checked);
                          }}
                          disabled={isSaving}
                          className="scale-75"
                        />
                      )}
                    />
                    <Label className="text-xs text-center">Current</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Bullet Points */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="resume-label">Key Achievements & Responsibilities</Label>
                <span className="text-xs text-gray-500">
                  Tip: Press Enter to add a new point
                </span>
              </div>

              <div className="space-y-3">
                {currentEntry?.bulletPoints?.map((_, bulletIndex) => (
                  <div
                    key={`bullet-${bulletIndex}`}
                    className="resume-bullet-item group"
                  >
                    <GripVertical className="resume-bullet-grip" />
                    <div className="resume-bullet-input flex-grow">
                      <Controller
                        name={`entries.${activeIndex}.bulletPoints.${bulletIndex}.value`}
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="• Describe your achievement or responsibility..."
                            className="resume-textarea min-h-[60px]"
                            rows={2}
                            disabled={isSaving}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                const newBulletPoints = [...(currentEntry?.bulletPoints || []), { value: '' }];
                                setValue(`entries.${activeIndex}.bulletPoints`, newBulletPoints);
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newBulletPoints = currentEntry?.bulletPoints?.filter((_, i) => i !== bulletIndex) || [];
                        if (newBulletPoints.length === 0) {
                          newBulletPoints.push({ value: '' });
                        }
                        setValue(`entries.${activeIndex}.bulletPoints`, newBulletPoints);
                      }}
                      disabled={isSaving || currentEntry?.bulletPoints?.length === 1}
                      className="resume-bullet-remove opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newBulletPoints = [...(currentEntry?.bulletPoints || []), { value: '' }];
                    setValue(`entries.${activeIndex}.bulletPoints`, newBulletPoints);
                  }}
                  disabled={isSaving}
                  className="resume-button-secondary w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Achievement
                </Button>
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
                onClick={addNewExperience}
                disabled={isSaving}
                className="resume-button-secondary"
                title="Add new experience (Cmd/Ctrl+Shift+N)"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
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
    </div>
  );
}