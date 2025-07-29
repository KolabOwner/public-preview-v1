'use client';

/**
 * EducationForm Component
 *
 * Features:
 * - Auto-save: Updates store in memory every 2 seconds (doesn't persist to database)
 * - Manual save: Persists to database via Save button or Ctrl+S
 * - Navigation: Switch between multiple education entries
 * - Validation: Real-time validation with helpful error messages
 * - Keyboard shortcuts: Save (Ctrl+S), Undo (Ctrl+Z), New (Ctrl+Shift+N), Navigate (Arrow keys)
 * - Smart location extraction from institution field
 *
 * Uses React Hook Form's isDirty state for proper dirty tracking instead of
 * the store's broken implementation.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  GraduationCap, CalendarIcon, Save, Loader2, ChevronLeft, ChevronRight,
  Plus, Trash2, AlertCircle, Undo2, Check, Clock
} from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shared/popover';
import { Calendar } from '@/components/shared/calendar';
import { format } from 'date-fns';
import { cn } from "@/components/shared";
import { useResumeStore, type EducationEntry } from '@/lib/client/stores/resume-store';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';

// Schema definitions
const educationEntrySchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution is required"),
  qualification: z.string().min(1, "Qualification is required"),
  location: z.string().optional(),
  date: z.date().optional().nullable(),
  dateFormat: z.string().optional(),
  minor: z.string().optional(),
  score: z.string().optional(),
  scoreType: z.string().optional(),
  description: z.string().optional(),
}).refine(data => data.score ? !!data.scoreType?.trim() : true, {
  message: "Score type is required when a score is provided",
  path: ["scoreType"],
});

const educationSchema = z.object({
  entries: z.array(educationEntrySchema),
});

type EducationFormEntry = z.infer<typeof educationEntrySchema>;
type EducationFormData = z.infer<typeof educationSchema>;

interface EducationFormProps {
  initialData: EducationEntry[];
  onSave?: (data: EducationEntry[]) => Promise<void>;
}

// Constants
const PLACEHOLDER_VALUES = ['n/a', 'N/A', 'none', 'null', '-', 'NA'];
const AUTO_SAVE_DELAY = 2000;

// Helper functions
const cleanValue = (value: any): string => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return PLACEHOLDER_VALUES.includes(trimmed) ? '' : trimmed;
};

const parseDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === 'number') return new Date(dateValue);
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
};

const extractInstitutionAndLocation = (institutionRaw: string) => {
  if (!institutionRaw.includes(',')) {
    return { institution: institutionRaw, location: '' };
  }

  const parts = institutionRaw.split(',');
  return {
    institution: parts[0].trim(),
    location: parts.slice(1).join(',').trim()
  };
};

// Convert store format to form format
const convertToFormFormat = (entries: EducationEntry[]): EducationFormEntry[] => {
  return entries.map(entry => {
    const institutionRaw = cleanValue(entry.institution);
    const { institution, location: extractedLocation } = extractInstitutionAndLocation(institutionRaw);
    const existingLocation = cleanValue(entry.location);

    return {
      ...entry,
      id: entry.id || crypto.randomUUID(),
      institution,
      qualification: cleanValue(entry.qualification),
      location: existingLocation || extractedLocation,
      date: parseDate(entry.date),
      dateFormat: cleanValue(entry.dateFormat) || 'MMMM yyyy',
      minor: cleanValue(entry.minor),
      score: cleanValue(entry.score),
      scoreType: cleanValue(entry.scoreType),
      description: cleanValue(entry.description),
    };
  });
};

// Convert form format to store format
const convertToStoreFormat = (formData: EducationFormData): EducationEntry[] => {
  return formData.entries.map(entry => {
    const { institution, location: extractedLocation } = extractInstitutionAndLocation(entry.institution || '');

    return {
      id: entry.id || crypto.randomUUID(),
      institution: institution || '',
      qualification: entry.qualification || '',
      location: entry.location || extractedLocation || '',
      date: entry.date || null,
      dateFormat: entry.dateFormat || 'MMMM yyyy',
      minor: entry.minor || '',
      score: entry.score || '',
      scoreType: entry.scoreType || '',
      description: entry.description || '',
    };
  });
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

export default function EducationForm({ initialData, onSave }: EducationFormProps) {
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

  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('education');

  // Initialize form
  const defaultFormValues = useMemo(() => ({
    entries: initialData?.length > 0
      ? convertToFormFormat(initialData)
      : [{
          id: crypto.randomUUID(),
          institution: '',
          qualification: '',
          location: '',
          date: null,
          dateFormat: 'MMMM yyyy',
          minor: '',
          score: '',
          scoreType: '',
          description: '',
        }]
  }), [initialData]);

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
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
        const storeData = convertToStoreFormat(formData);
        // Only update the store, don't save to Firebase yet
        updateSection('education', storeData);
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

      updateSection('education', storeData);
      await saveSection('education');

      // Reset form state with current values to mark as clean
      reset({ entries: formData.entries });

      toast({
        title: "Success",
        description: "Education information saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save education information",
        variant: "destructive",
      });
    }
  }, [trigger, getValues, onSave, updateSection, saveSection, reset, toast]);

  const handleUndo = useCallback(() => {
    revertSection('education');
    reset(defaultFormValues);
    toast({
      title: "Changes reverted",
      description: "Education section restored to last saved state",
    });
  }, [revertSection, reset, defaultFormValues, toast]);

  const addNewEntry = useCallback(() => {
    const newEntry = {
      id: crypto.randomUUID(),
      institution: '',
      qualification: '',
      location: '',
      date: undefined,
      dateFormat: 'MMMM yyyy',
      minor: '',
      score: '',
      scoreType: '',
      description: '',
    };
    append(newEntry);
    setActiveIndex(fields.length);
  }, [append, fields.length]);

  const removeEntry = useCallback((index: number) => {
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

  // Handle institution name changes to extract location if present
  const handleInstitutionBlur = useCallback((value: string) => {
    if (value.includes(',')) {
      const { institution, location } = extractInstitutionAndLocation(value);
      setValue(`entries.${activeIndex}.institution`, institution);

      // Only update location if it's currently empty
      const currentLocation = getValues(`entries.${activeIndex}.location`);
      if (!currentLocation?.trim()) {
        setValue(`entries.${activeIndex}.location`, location);
      }
    }
  }, [activeIndex, setValue, getValues]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    save: handleManualSave,
    undo: handleUndo,
    newEntry: addNewEntry,
    prev: navigatePrev,
    next: navigateNext,
  });

  // Header title
  const headerTitle = currentEntry?.qualification && currentEntry?.institution
    ? `${currentEntry.qualification} at ${currentEntry.institution}`
    : "New Education Entry";

  // Field error helpers
  const getFieldError = (field: keyof EducationFormEntry) => {
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
              <GraduationCap className="h-4 w-4 text-white" />
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
                    onClick={() => removeEntry(activeIndex)}
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
        <div onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleManualSave();
          }
        }}>
          <div className="space-y-6">
            {/* Add key to force re-render when switching entries */}
            <div key={`education-${activeIndex}`}>
              {/* Institution & Qualification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label className="resume-label">
                    Institution <span className="resume-label-required">*</span>
                  </Label>
                  <Controller
                    name={`entries.${activeIndex}.institution`}
                    control={control}
                    render={({ field }) => (
                      <div className={`resume-input-container ${getFieldError('institution') ? 'resume-input-container--error' : ''}`}>
                        <Input
                          {...field}
                          placeholder="e.g., University of Wisconsin-Madison"
                          className="resume-input"
                          onBlur={(e) => {
                            field.onBlur();
                            handleInstitutionBlur(e.target.value);
                          }}
                          disabled={isSaving}
                        />
                      </div>
                    )}
                  />
                  {getFieldError('institution') && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="resume-error-message"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {getFieldError('institution')?.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="resume-label">
                    Qualification <span className="resume-label-required">*</span>
                  </Label>
                  <Controller
                    name={`entries.${activeIndex}.qualification`}
                    control={control}
                    render={({ field }) => (
                      <div className={`resume-input-container ${getFieldError('qualification') ? 'resume-input-container--error' : ''}`}>
                        <Input
                          {...field}
                          placeholder="e.g., Bachelor of Science in Computer Science"
                          className="resume-input"
                          disabled={isSaving}
                        />
                      </div>
                    )}
                  />
                  {getFieldError('qualification') && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="resume-error-message"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {getFieldError('qualification')?.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label className="resume-label">
                    Graduation Date
                  </Label>
                  <div className={`resume-input-container ${getFieldError('date') ? 'resume-input-container--error' : ''}`}>
                    <Controller
                      name={`entries.${activeIndex}.date`}
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left font-normal hover:bg-transparent border-0 bg-transparent focus:ring-0 h-auto py-2",
                                !field.value && "text-gray-400"
                              )}
                              disabled={isSaving}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
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

                <div className="space-y-2">
                  <Label className="resume-label">Location</Label>
                  <Controller
                    name={`entries.${activeIndex}.location`}
                    control={control}
                    render={({ field }) => (
                      <div className="resume-input-container">
                        <Input
                          {...field}
                          placeholder="e.g., Madison, WI"
                          className="resume-input"
                          disabled={isSaving}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Minor Field */}
              <div className="grid grid-cols-1 mb-6">
                <div className="space-y-2">
                  <Label className="resume-label">Minor / Concentration</Label>
                  <Controller
                    name={`entries.${activeIndex}.minor`}
                    control={control}
                    render={({ field }) => (
                      <div className="resume-input-container">
                        <Input
                          {...field}
                          placeholder="e.g., Mathematics"
                          className="resume-input"
                          disabled={isSaving}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Score & Score Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label className="resume-label">Score</Label>
                  <Controller
                    name={`entries.${activeIndex}.score`}
                    control={control}
                    render={({ field }) => (
                      <div className="resume-input-container">
                        <Input
                          {...field}
                          placeholder="e.g., 3.8"
                          className="resume-input"
                          disabled={isSaving}
                        />
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="resume-label">
                    Score Type
                    {currentEntry?.score && <span className="resume-label-required">*</span>}
                  </Label>
                  <Controller
                    name={`entries.${activeIndex}.scoreType`}
                    control={control}
                    render={({ field }) => (
                      <div className={`resume-input-container ${getFieldError('scoreType') ? 'resume-input-container--error' : ''}`}>
                        <Input
                          {...field}
                          placeholder="e.g., GPA"
                          className="resume-input"
                          disabled={isSaving}
                        />
                      </div>
                    )}
                  />
                  {getFieldError('scoreType') && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="resume-error-message"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {getFieldError('scoreType')?.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="resume-label">Additional Details</Label>
                <Controller
                  name={`entries.${activeIndex}.description`}
                  control={control}
                  render={({ field }) => (
                    <div className="resume-input-container">
                      <Textarea
                        {...field}
                        placeholder="e.g., Dean's List, Relevant coursework, Thesis title, Activities..."
                        className="resume-textarea min-h-[100px]"
                        rows={4}
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
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
                  onClick={addNewEntry}
                  disabled={isSaving}
                  className="resume-button-secondary"
                  title="Add new education (Cmd/Ctrl+Shift+N)"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>

                <Button
                  type="button"
                  onClick={handleManualSave}
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
          </div>
        </div>
      </div>
    </div>
  );
}