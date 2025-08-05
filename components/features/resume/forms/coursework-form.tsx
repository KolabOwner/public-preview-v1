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
 * - Enhanced Lexical editor for descriptions with AI bullet generation
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
  BookOpen, Save, Loader2, Plus, ChevronLeft, ChevronRight, AlertCircle,
  Trash2, Undo2, Check, Clock
} from "lucide-react";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, EditorState, $createParagraphNode, $createTextNode } from 'lexical';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';
import { useUnsavedChangesProtection } from '@/lib/client/hooks/resume/use-unsaved-changes-protection';
import UnsavedChangesModal from '../modals/unsaved-changes-modal';

// Schema for a single coursework entry
const courseworkEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Course name is required"),
  institution: z.string().min(1, "Institution is required"),
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

// RMS Coursework data interface
interface RMSCourseworkData {
  [key: string]: any; // RMS format data with keys like rms_coursework_0_name, etc.
  rms_coursework_count?: number;
}

interface CourseworkFormProps {
  initialData: RMSCourseworkData;
  onSave?: (data: RMSCourseworkData) => Promise<void>;
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

// Extract coursework entries from RMS data
const extractCourseworkFromRMS = (rmsData: RMSCourseworkData): CourseworkFormEntry[] => {
  const count = rmsData.rms_coursework_count || 0;
  const entries: CourseworkFormEntry[] = [];

  for (let i = 0; i < count; i++) {
    const entry: CourseworkFormEntry = {
      id: `coursework_${i}`,
      name: cleanValue(rmsData[`rms_coursework_${i}_name`]),
      institution: cleanValue(rmsData[`rms_coursework_${i}_institution`]),
      date: cleanValue(rmsData[`rms_coursework_${i}_date`]),
      description: (() => {
        const desc = cleanValue(rmsData[`rms_coursework_${i}_description`]);
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
    name: '',
    institution: '',
    date: '',
    description: '',
  }];
};

// Convert form data back to RMS format
const convertToRMSFormat = (formData: CourseworkFormData): RMSCourseworkData => {
  const rmsData: RMSCourseworkData = {
    rms_coursework_count: formData.entries.length
  };

  formData.entries.forEach((entry, i) => {
    rmsData[`rms_coursework_${i}_name`] = entry.name || '';
    rmsData[`rms_coursework_${i}_institution`] = entry.institution || '';
    rmsData[`rms_coursework_${i}_date`] = entry.date || '';
    rmsData[`rms_coursework_${i}_description`] = entry.description || '';
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

export default function CourseworkForm({ initialData, onSave }: CourseworkFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with RMS data
  const defaultFormValues = useMemo(() => ({
    entries: extractCourseworkFromRMS(initialData)
  }), [initialData]);

  const form = useForm<CourseworkFormData>({
    resolver: zodResolver(courseworkSchema),
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
        description: "Coursework information saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save coursework information",
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
      description: "Coursework section restored to initial state",
    });
  }, [reset, defaultFormValues, toast]);

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
  const headerTitle = currentEntry?.name && currentEntry?.institution
    ? `${currentEntry.name} - ${currentEntry.institution}`
    : currentEntry?.name || "New Coursework Entry";

  // Field error helpers
  const getFieldError = (field: keyof CourseworkFormEntry) => {
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
        <form onSubmit={handleSubmit(handleManualSave)} className="space-y-6 pt-6">
          {/* Add key to force re-render when switching entries */}
          <div key={`entry-${activeIndex}`}>
            {/* Course Name & Institution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>COURSE NAME</strong> <span className="resume-label-required">*</span>
                  </span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.name`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldError('name') ? 'resume-input-container--error' : ''}`}>
                      <Input
                        {...field}
                        placeholder="e.g., Introduction to Computer Systems"
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
                        placeholder="e.g., University of Wisconsin, Madison"
                        className="resume-input"
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
            </div>

            {/* Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <Label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal text-sm leading-5">
                  <span className="cursor-default">
                    <strong>DATE</strong>
                  </span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.date`}
                  control={control}
                  render={({ field }) => (
                    <div className="resume-input-container">
                      <Input
                        {...field}
                        placeholder="e.g., Spring 2024"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
              </div>
              <div></div> {/* Empty div for grid spacing */}
            </div>

            {/* Description Field with AI Header - Similar to Experience Form */}
            <div className="grid gap-y-1">
              <div className="inline-block w-full">
                <div className="flex items-end justify-between">
                  <label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal">
                    <span className="cursor-default text-sm leading-5">
                      <strong>What did you learn</strong> in this course?
                    </span>
                  </label>
                  <div className="flex-shrink-0">
                    <div className="flex flex-col lg:flex-row justify-between pl-4 px-1.5 py-1.5 gap-x-4 gap-y-2">
                      <div className="flex flex-row items-center flex-1">
                        <div>
                          <div className="w-4 h-4 text-corporate-amber-500">💡</div>
                        </div>
                        <div className="text-sm leading-5 text-gray-500 font-normal ml-1">
                          Focus on relevant skills, concepts, and projects from this course.
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
                      const bulletPoints = field.value ? field.value.split('•').filter(p => p.trim()) : [''];

                      const handleBulletChange = (index: number, newContent: string) => {
                        const updatedPoints = [...bulletPoints];
                        updatedPoints[index] = newContent;
                        const newValue = updatedPoints.filter(p => p.trim()).map(p => `• ${p.trim()}`).join('\n');
                        field.onChange(newValue);
                      };

                      return (
                        <div className="w-full p-3">
                          {bulletPoints.map((point, index) => {
                            const initialConfig = {
                              namespace: `CourseworkEditor-${index}`,
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
                                <div className="flex-1">
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
                                      placeholder={index === 0 ? <div className="text-gray-400 dark:text-gray-500">Describe key concepts, skills, and projects...</div> : null}
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
                onClick={addNewCoursework}
                disabled={isSaving}
                className="resume-button-secondary"
                title="Add new coursework (Cmd/Ctrl+Shift+N)"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
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
        title="Unsaved Coursework Changes"
        description="You have unsaved changes to your coursework. What would you like to do?"
      />
    </div>
  );
}