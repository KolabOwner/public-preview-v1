'use client';

/**
 * CourseworkForm Component
 *
 * Features:
 * - Auto-save: Updates store in memory every 2 seconds (doesn't persist to database)
 * - Manual save: Persists to database via Save button or Ctrl+S
 * - Navigation: Switch between multiple coursework entries
 * - Validation: Real-time validation with helpful error messages
 * - Keyboard shortcuts: Save (Ctrl+S), Undo (Ctrl+Z), New (Ctrl+Shift+N), Navigate (Arrow keys)
 * - Enhanced with better UX patterns from experience/involvement forms
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  BookOpen, Save, Loader2, Plus, ChevronLeft, ChevronRight, AlertCircle, 
  Calendar, GraduationCap, PenTool, Trash2, Undo2, Check, Clock
} from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useResumeStore, type CourseworkEntry } from '@/lib/client/stores/resume-store';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';

// Schema for a single coursework entry
const courseworkEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Course name is required."),
  institution: z.string().min(1, "Institution is required."),
  date: z.string().optional(),
  description: z.string().optional(),
});

// Schema for the entire form
const courseworkSchema = z.object({
  entries: z.array(courseworkEntrySchema),
});

// TypeScript types inferred from schemas
type CourseworkFormEntry = z.infer<typeof courseworkEntrySchema>;
type CourseworkFormData = z.infer<typeof courseworkSchema>;

interface CourseworkFormProps {
  initialData: CourseworkEntry[];
  onSave?: (data: CourseworkEntry[]) => Promise<void>;
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

const convertToFormFormat = (entries: CourseworkEntry[]): CourseworkFormEntry[] => {
  return entries.map(entry => ({
    ...entry,
    id: entry.id || crypto.randomUUID(),
    name: cleanValue(entry.name),
    institution: cleanValue(entry.institution),
    date: cleanValue(entry.date),
    description: cleanValue(entry.description),
  }));
};

const convertToStoreFormat = (formData: CourseworkFormData): CourseworkEntry[] => {
  return formData.entries.map(entry => ({
    id: entry.id || crypto.randomUUID(),
    name: entry.name || '',
    institution: entry.institution || '',
    date: entry.date || '',
    description: entry.description || '',
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

export default function CourseworkForm({ initialData, onSave }: CourseworkFormProps) {
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

  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('coursework');

  // Initialize form
  const defaultFormValues = useMemo(() => ({
    entries: initialData?.length > 0
      ? convertToFormFormat(initialData)
      : [{
          id: crypto.randomUUID(),
          name: '',
          institution: '',
          date: '',
          description: ''
        }]
  }), [initialData]);

  const form = useForm<CourseworkFormData>({
    resolver: zodResolver(courseworkSchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur',
  });

  const { control, formState: { errors, isDirty }, watch, setValue, reset, getValues, trigger } = form;

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
        updateSection('coursework', storeData);
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

      updateSection('coursework', storeData);
      await saveSection('coursework');

      // Reset form state with current values to mark as clean
      reset({ entries: formData.entries });

      toast({
        title: "Success",
        description: "Coursework information saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save coursework information",
        variant: "destructive",
      });
    }
  }, [trigger, getValues, onSave, updateSection, saveSection, reset, toast]);

  const handleUndo = useCallback(() => {
    revertSection('coursework');
    reset(defaultFormValues);
    toast({
      title: "Changes reverted",
      description: "Coursework section restored to last saved state",
    });
  }, [revertSection, reset, defaultFormValues, toast]);

  const addNewCoursework = useCallback(() => {
    const newEntry = {
      id: crypto.randomUUID(),
      name: '',
      institution: '',
      date: '',
      description: ''
    };
    append(newEntry);
    setActiveIndex(fields.length);
  }, [append, fields.length]);

  const removeCoursework = useCallback((index: number) => {
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
    newEntry: addNewCoursework,
    prev: navigatePrev,
    next: navigateNext,
  });

  // Header title
  const headerTitle = currentEntry?.name
    ? `${currentEntry.name}`
    : "New Coursework Entry";

  // Field error helpers
  const getFieldErrorMessage = (field: keyof CourseworkFormEntry): string | undefined => {
    const error = errors.entries?.[activeIndex]?.[field];
    if (error && typeof error === 'object' && 'message' in error) {
      return error.message as string;
    }
    return undefined;
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
              <BookOpen className="h-4 w-4 text-white" />
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
                    onClick={() => removeCoursework(activeIndex)}
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
            <div key={`coursework-${activeIndex}`}>
              {/* Course Name & Institution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label className="resume-label">
                    Course Name <span className="resume-label-required">*</span>
                  </Label>
                  <Controller
                    name={`entries.${activeIndex}.name`}
                    control={control}
                    render={({ field }) => (
                      <div className={`resume-input-container ${getFieldErrorMessage('name') ? 'resume-input-container--error' : ''}`}>
                        <Input
                          {...field}
                          placeholder="Introduction to Computer Systems"
                          className="resume-input"
                          disabled={isSaving}
                        />
                      </div>
                    )}
                  />
                  {getFieldErrorMessage('name') && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="resume-error-message"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>{getFieldErrorMessage('name')}</span>
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="resume-label">
                    Institution <span className="resume-label-required">*</span>
                  </Label>
                  <Controller
                    name={`entries.${activeIndex}.institution`}
                    control={control}
                    render={({ field }) => (
                      <div className={`resume-input-container ${getFieldErrorMessage('institution') ? 'resume-input-container--error' : ''}`}>
                        <GraduationCap className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                        <Input
                          {...field}
                          placeholder="University of Wisconsin, Madison"
                          className="resume-input px-0 pr-3"
                          disabled={isSaving}
                        />
                      </div>
                    )}
                  />
                  {getFieldErrorMessage('institution') && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="resume-error-message"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>{getFieldErrorMessage('institution')}</span>
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2 mb-6">
                <Label className="resume-label">
                  Date
                </Label>
                <Controller
                  name={`entries.${activeIndex}.date`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldErrorMessage('date') ? 'resume-input-container--error' : ''}`}>
                      <Calendar className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                      <Input
                        {...field}
                        placeholder="Spring 2024"
                        className="resume-input px-0 pr-3"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
                {getFieldErrorMessage('date') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldErrorMessage('date')}</span>
                  </motion.p>
                )}
              </div>

                            {/* Description */}
              <div className="space-y-2">
                <Label className="resume-label">
                  Description
                </Label>
                <Controller
                  name={`entries.${activeIndex}.description`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldErrorMessage('description') ? 'resume-input-container--error' : ''} relative`}>
                      <PenTool className="absolute left-3 top-3 h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 flex-shrink-0" />
                      <Textarea
                        {...field}
                        placeholder="Describe key concepts learned, projects completed, or skills developed in this course..."
                        className="resume-textarea pl-10 pr-3 py-3 resize-none min-h-[100px]"
                        rows={4}
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
                {getFieldErrorMessage('description') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldErrorMessage('description')}</span>
                  </motion.p>
                )}
                <p className="text-xs text-corporate-navy-500 dark:text-gray-400">
                  Highlight the most relevant aspects of this coursework for your career goals.
                </p>
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
                onClick={addNewCoursework}
                disabled={isSaving}
                className="resume-button-secondary"
                title="Add new coursework (Cmd/Ctrl+Shift+N)"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>

              <Button
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
  );
}