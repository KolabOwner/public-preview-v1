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
 * - Firestore-compatible timestamp handling
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
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';
import { useUnsavedChangesProtection } from '@/lib/client/hooks/resume/use-unsaved-changes-protection';
import UnsavedChangesModal from '../modals/unsaved-changes-modal';

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

// RMS Education data interface
interface RMSEducationData {
  [key: string]: any; // RMS format data with keys like rms_education_0_institution, etc.
  rms_education_count?: number;
}

interface EducationFormProps {
  initialData: RMSEducationData;
  onSave?: (data: RMSEducationData) => Promise<void>;
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

const parseDate = (dateValue: any, yearValue?: any): Date | null => {
  if (!dateValue && !yearValue) return null;

  // If we have a year value, prefer that to avoid timezone issues with education dates
  // Creates July 1st of the year to avoid timezone display problems
  if (yearValue && typeof yearValue === 'number' && yearValue > 1900) {
    return new Date(yearValue, 6, 1); // July 1st of the year (month is 0-indexed)
  }

  if (dateValue instanceof Date) return dateValue;

  if (typeof dateValue === 'number') {
    // If it's a 4-digit year, create a mid-year date
    if (dateValue > 1900 && dateValue < 3000) {
      return new Date(dateValue, 6, 1); // July 1st of the year
    }

    // Handle timestamps - add 12 hours to avoid timezone display issues
    const timestamp = dateValue > 1e10 ? dateValue : dateValue * 1000;
    const date = new Date(timestamp);
    date.setUTCHours(12, 0, 0, 0); // Set to noon UTC to avoid timezone issues
    return date;
  }

  if (typeof dateValue === 'string') {
    const parsed = parseInt(dateValue);
    if (!isNaN(parsed) && parsed > 1900 && parsed < 3000) {
      return new Date(parsed, 6, 1); // July 1st of the year
    }

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

// Extract education entries from RMS data
const extractEducationFromRMS = (rmsData: RMSEducationData): EducationFormEntry[] => {
  const count = rmsData.rms_education_count || 0;
  const entries: EducationFormEntry[] = [];

  for (let i = 0; i < count; i++) {
    const institutionRaw = cleanValue(rmsData[`rms_education_${i}_institution`]);
    const { institution, location: extractedLocation } = extractInstitutionAndLocation(institutionRaw);
    const existingLocation = cleanValue(rmsData[`rms_education_${i}_location`]);

    const entry: EducationFormEntry = {
      id: `education_${i}`,
      institution,
      qualification: cleanValue(rmsData[`rms_education_${i}_qualification`]),
      location: existingLocation || extractedLocation,
      date: parseDate(
        rmsData[`rms_education_${i}_datets`],
        rmsData[`rms_education_${i}_date`]
      ),
      dateFormat: typeof rmsData[`rms_education_${i}_dateformat`] === 'string'
        ? rmsData[`rms_education_${i}_dateformat`]
        : 'MMMM yyyy',
      minor: cleanValue(rmsData[`rms_education_${i}_minor`]),
      score: cleanValue(rmsData[`rms_education_${i}_score`]),
      scoreType: cleanValue(rmsData[`rms_education_${i}_scoretype`]),
      description: cleanValue(rmsData[`rms_education_${i}_description`]),
    };
    entries.push(entry);
  }

  return entries.length > 0 ? entries : [{
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
  }];
};

// Convert form data back to RMS format
const convertToRMSFormat = (formData: EducationFormData): RMSEducationData => {
  const rmsData: RMSEducationData = {
    rms_education_count: formData.entries.length
  };

  formData.entries.forEach((entry, i) => {
    rmsData[`rms_education_${i}_institution`] = entry.institution || '';
    rmsData[`rms_education_${i}_qualification`] = entry.qualification || '';
    rmsData[`rms_education_${i}_location`] = entry.location || '';
    rmsData[`rms_education_${i}_date`] = entry.date ? entry.date.getFullYear() : '';
    // Store timestamp at noon UTC to avoid timezone issues on retrieval
    rmsData[`rms_education_${i}_datets`] = entry.date ? Math.floor(entry.date.getTime() / 1000) : '';
    rmsData[`rms_education_${i}_dateformat`] = entry.dateFormat || 'MMMM yyyy';
    rmsData[`rms_education_${i}_minor`] = entry.minor || '';
    rmsData[`rms_education_${i}_score`] = entry.score || '';
    rmsData[`rms_education_${i}_scoretype`] = entry.scoreType || '';
    rmsData[`rms_education_${i}_description`] = entry.description || '';
    rmsData[`rms_education_${i}_isgraduate`] =
      entry.qualification?.toLowerCase().includes('bachelor') ||
      entry.qualification?.toLowerCase().includes('master') ||
      entry.qualification?.toLowerCase().includes('phd') ||
      false;
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

export default function EducationForm({ initialData, onSave }: EducationFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with RMS data
  const defaultFormValues = useMemo(() => ({
    entries: extractEducationFromRMS(initialData)
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
        description: "Education information saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save education information",
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
      description: "Education section restored to initial state",
    });
  }, [reset, defaultFormValues, toast]);

  const addNewEntry = useCallback(() => {
    const newEntry = {
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
        <form onSubmit={handleSubmit(handleManualSave)} className="space-y-6 pt-6">
          {/* Add key to force re-render when switching entries */}
          <div key={`education-${activeIndex}`}>
            {/* Institution & Qualification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>INSTITUTION</strong> <span className="resume-label-required">*</span>
                  </span>
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

              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>QUALIFICATION</strong> <span className="resume-label-required">*</span>
                  </span>
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
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>GRADUATION DATE</strong>
                  </span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.date`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldError('date') ? 'resume-input-container--error' : ''}`}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-left font-normal hover:bg-transparent border-0 focus:ring-0 h-10 sm:h-12 text-base font-semibold px-3",
                              "text-corporate-navy-900 dark:text-gray-100",
                              "resume-date-input",
                              !field.value && "text-corporate-navy-400 dark:text-gray-500"
                            )}
                            disabled={isSaving}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70" />
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
                    <strong>LOCATION</strong>
                  </span>
                </Label>
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
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>MINOR / CONCENTRATION</strong>
                  </span>
                </Label>
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
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>SCORE</strong>
                  </span>
                </Label>
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

              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>SCORE TYPE</strong>
                    {currentEntry?.score && <span className="resume-label-required">*</span>}
                  </span>
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
            <div className="space-y-1">
              <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                <span className="cursor-default">
                  <strong>ADDITIONAL DETAILS</strong>
                </span>
              </Label>
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
        title="Unsaved Education Changes"
        description="You have unsaved changes to your education information. What would you like to do?"
      />
    </div>
  );
}