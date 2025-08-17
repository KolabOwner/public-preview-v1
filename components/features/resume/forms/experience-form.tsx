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
  Plus, ChevronLeft, ChevronRight, Save, Loader2, Trash2,
  Briefcase, AlertCircle, Undo2, Check, Clock
} from "lucide-react";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, EditorState, $createParagraphNode, $createTextNode, KEY_ENTER_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';
import { useUnsavedChangesProtection } from '@/lib/client/hooks/resume/use-unsaved-changes-protection';
import UnsavedChangesModal from '../modals/unsaved-changes-modal';

// Schema definitions
const experienceEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().optional(),
}).refine(data => data.current || !!data.endDate?.trim(), {
  message: "End date is required unless it's a current position",
  path: ["endDate"],
});

const experienceSchema = z.object({
  entries: z.array(experienceEntrySchema),
});

type ExperienceFormEntry = z.infer<typeof experienceEntrySchema>;
type ExperienceFormData = z.infer<typeof experienceSchema>;

// RMS Experience data interface
interface RMSExperienceData {
  [key: string]: any; // RMS format data with keys like rms_experience_0_company, etc.
  rms_experience_count?: number;
}

interface ExperienceFormProps {
  initialData: RMSExperienceData;
  onSave?: (data: RMSExperienceData) => Promise<void>;
}

// Constants
const PLACEHOLDER_VALUES = ['n/a', 'N/A', 'none', 'null', '-', 'NA'];
const AUTO_SAVE_DELAY = 2000;

// Custom plugin to handle Enter key for creating new bullet points
function EnterKeyPlugin({ onEnterPress }: { onEnterPress: () => void }) {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {
    const unregister = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        if (event) {
          event.preventDefault();
        }
        onEnterPress();
        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    return unregister;
  }, [editor, onEnterPress]);

  return null;
}

// Helper functions
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return PLACEHOLDER_VALUES.includes(trimmed) ? '' : trimmed;
};

// Extract experience entries from RMS data
const extractExperiencesFromRMS = (rmsData: RMSExperienceData): ExperienceFormEntry[] => {
  const count = rmsData.rms_experience_count || 0;
  const entries: ExperienceFormEntry[] = [];

  for (let i = 0; i < count; i++) {
    const entry: ExperienceFormEntry = {
      id: `experience_${i}`,
      title: cleanValue(rmsData[`rms_experience_${i}_role`]),
      company: cleanValue(rmsData[`rms_experience_${i}_company`]),
      location: cleanValue(rmsData[`rms_experience_${i}_location`]),
      startDate: cleanValue(rmsData[`rms_experience_${i}_datebegin`]),
      endDate: cleanValue(rmsData[`rms_experience_${i}_dateend`]),
      current: rmsData[`rms_experience_${i}_iscurrent`] || false,
      description: (() => {
        const desc = cleanValue(rmsData[`rms_experience_${i}_description`]);
        if (!desc) return '';
        
        const lines = desc.split('\n').filter(line => line.trim() !== '');
        const hasExistingBullets = lines.some(line => 
          line.trim().startsWith('•') || 
          line.trim().startsWith('-') || 
          line.trim().startsWith('*')
        );
        
        if (!hasExistingBullets) {
          return lines.map(line => `• ${line.trim()}`).join('\n');
        }
        
        return desc;
      })(),
    };
    entries.push(entry);
  }

  return entries.length > 0 ? entries : [{
    id: crypto.randomUUID(),
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  }];
};

// Convert form data back to RMS format
const convertToRMSFormat = (formData: ExperienceFormData): RMSExperienceData => {
  const rmsData: RMSExperienceData = {
    rms_experience_count: formData.entries.length
  };

  formData.entries.forEach((entry, i) => {
    rmsData[`rms_experience_${i}_role`] = entry.title || '';
    rmsData[`rms_experience_${i}_company`] = entry.company || '';
    rmsData[`rms_experience_${i}_location`] = entry.location || '';
    rmsData[`rms_experience_${i}_datebegin`] = entry.startDate || '';
    rmsData[`rms_experience_${i}_dateend`] = entry.endDate || '';
    rmsData[`rms_experience_${i}_iscurrent`] = entry.current || false;
    rmsData[`rms_experience_${i}_description`] = entry.description || '';
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

export default function ExperienceForm({ initialData, onSave }: ExperienceFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with RMS data
  const defaultFormValues = useMemo(() => ({
    entries: extractExperiencesFromRMS(initialData)
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
        description: "Experience information saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save experience information",
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
      description: "Experience section restored to initial state",
    });
  }, [reset, defaultFormValues, toast]);

  const addNewExperience = useCallback(() => {
    const newEntry = {
      id: crypto.randomUUID(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
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
        <form onSubmit={handleSubmit(handleManualSave)} className="space-y-6 pt-6">
          {/* Add key to force re-render when switching entries */}
          <div key={`entry-${activeIndex}`}>
            {/* Job Title & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>JOB TITLE</strong> <span className="resume-label-required">*</span>
                  </span>
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

              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>COMPANY</strong> <span className="resume-label-required">*</span>
                  </span>
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
                        placeholder="e.g., New York, NY"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
              </div>

              {/* Time Period Container - Consistent with other form containers */}
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>TIME PERIOD</strong> <span className="resume-label-required">*</span>
                  </span>
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

            {/* Description Field with AI Header */}
            <div className="grid gap-y-1">
              <div className="inline-block w-full">
                <div className="flex items-end justify-between">
                  <label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal">
                    <span className="cursor-default text-sm leading-5">
                      <strong>What did you do</strong> at {currentEntry?.company || 'this company'}?
                    </span>
                  </label>
                  <div className="flex-shrink-0">
                    <div className="flex flex-col lg:flex-row justify-between pl-4 px-1.5 py-1.5 gap-x-4 gap-y-2">
                      <div className="flex flex-row items-center flex-1">
                        <div>
                          <div className="w-4 h-4 text-corporate-amber-500">💡</div>
                        </div>
                        <div className="text-sm leading-5 text-gray-500 font-normal ml-1">
                          Aim for a balanced mix of descriptive and key number bullet points.
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end items-center">
                        <div className="transition-opacity duration-200 opacity-100">
                          <Button
                            type="button"
                            className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-all duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed border-0 bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-400 hover:to-corporate-amber-400 text-white px-3 py-1 rounded-full text-xs"
                            disabled={isSaving}
                            size="sm"
                          >
                            <div className="mr-1 w-3 h-3">
                              <div className="opacity-100">✨</div>
                            </div>
                            <span>Generate Bullet</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="resume-input-container resume-date-input !min-h-64 md:!min-h-44">
                  <Controller
                    name={`entries.${activeIndex}.description`}
                    control={control}
                    render={({ field }) => {
                      const bulletPoints = field.value ? field.value.split('•').slice(1) : [''];

                      const handleBulletChange = (index: number, newContent: string) => {
                        const updatedPoints = [...bulletPoints];
                        updatedPoints[index] = newContent;
                        const newValue = updatedPoints.map(p => `• ${p.trim()}`).join('\n');
                        field.onChange(newValue);
                      };

                      const handleAddNewBullet = (currentIndex: number) => {
                        const updatedPoints = [...bulletPoints];
                        // Insert a new empty bullet point after the current one
                        updatedPoints.splice(currentIndex + 1, 0, '');
                        const newValue = updatedPoints.map(p => `• ${p.trim()}`).join('\n');

                        field.onChange(newValue);

                        // Focus on the new bullet point after React re-renders
                        const focusNewBullet = () => {
                          const newBulletEditor = document.querySelector(`[data-lexical-editor="ExperienceEditor-${currentIndex + 1}"] [contenteditable]`);
                          
                          if (newBulletEditor) {
                            (newBulletEditor as HTMLElement).focus();
                            // Set cursor at the beginning
                            const selection = window.getSelection();
                            const range = document.createRange();
                            if (newBulletEditor.firstChild) {
                              range.setStart(newBulletEditor.firstChild, 0);
                            } else {
                              range.setStart(newBulletEditor, 0);
                            }
                            range.collapse(true);
                            selection?.removeAllRanges();
                            selection?.addRange(range);
                            return true;
                          }
                          return false;
                        };

                        // Try multiple times with increasing delays
                        setTimeout(() => {
                          if (!focusNewBullet()) {
                            setTimeout(() => {
                              if (!focusNewBullet()) {
                                setTimeout(focusNewBullet, 500);
                              }
                            }, 200);
                          }
                        }, 50);
                      };

                      const addNewBullet = () => {
                        const newValue = field.value ? `${field.value}\n• ` : '• ';
                        field.onChange(newValue);
                      };

                      return (
                        <div className="w-full p-3">
                          {bulletPoints.map((point, index) => {
                            const initialConfig = {
                              namespace: `ExperienceEditor-${index}`,
                              nodes: [],
                              onError: (error: Error) => {
                                console.error('Lexical error:', error);
                              },
                              editorState: () => {
                                const root = $getRoot();
                                if (point.trim()) {
                                  const paragraph = $createParagraphNode();
                                  const textNode = $createTextNode(point.trim());
                                  paragraph.append(textNode);
                                  root.append(paragraph);
                                }
                              },
                            };

                            return (
                              <div key={index} className="flex items-start leading-[1.5] mb-1">
                                <span className="flex-shrink-0 pr-1 w-3 text-gray-600 dark:text-gray-400">•</span>
                                <div className="flex-1" data-lexical-editor={`ExperienceEditor-${index}`}>
                                  <LexicalComposer initialConfig={initialConfig}>
                                    <PlainTextPlugin
                                      contentEditable={
                                        <ContentEditable
                                          className="outline-none bg-transparent min-h-[1.5em] p-0"
                                          style={{
                                            fontSize: '16px',
                                            lineHeight: '1.5'
                                          }}
                                        />
                                      }
                                      placeholder={index === 0 ? <div className="text-gray-400 dark:text-gray-500">Describe your achievements and responsibilities...</div> : null}
                                      ErrorBoundary={LexicalErrorBoundary}
                                    />
                                    <OnChangePlugin
                                      onChange={(editorState: EditorState, editor) => {
                                        editorState.read(() => {
                                          const root = $getRoot();
                                          const textContent = root.getTextContent();
                                          
                                          // Only trigger change if content actually changed, not just selection
                                          const currentContent = point.trim();
                                          if (textContent !== currentContent) {
                                            handleBulletChange(index, textContent);
                                          }
                                        });
                                      }}
                                    />
                                    <EnterKeyPlugin 
                                      onEnterPress={() => handleAddNewBullet(index)}
                                    />
                                    <HistoryPlugin />
                                  </LexicalComposer>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                  />
                </div>
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

      <UnsavedChangesModal
        isOpen={showModal}
        onClose={handleCancelNavigation}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardAndContinue}
        onCancel={handleCancelNavigation}
        title="Unsaved Experience Changes"
        description="You have unsaved changes to your work experience. What would you like to do?"
      />
    </div>
  );
}