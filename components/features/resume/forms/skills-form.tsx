'use client';

/**
 * SkillsForm Component
 *
 * Features:
 * - Auto-save: Updates store in memory every 2 seconds (doesn't persist to database)
 * - Manual save: Persists to database via Save button or Ctrl+S
 * - Navigation: Switch between multiple skill entries
 * - Validation: Real-time validation with helpful error messages
 * - Keyboard shortcuts: Save (Ctrl+S), Undo (Ctrl+Z), New (Ctrl+Shift+N), Navigate (Arrow keys)
 * - Enhanced with better UX patterns from experience/involvement forms
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2, ChevronDown, ChevronRight, Plus, MoreHorizontal,
  GripVertical, Sparkles, AlertCircle,
  Palette, Check, Clock
} from "lucide-react";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, EditorState } from 'lexical';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { Button } from '@/components/shared/button';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';
import { useUnsavedChangesProtection } from '@/lib/client/hooks/resume/use-unsaved-changes-protection';
import UnsavedChangesModal from '../modals/unsaved-changes-modal';

// Schema for a single skill entry
const skillEntrySchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, "Skill category is required."),
  keywords: z.string().min(1, "Skills list is required."),
});

// Schema for the entire form
const skillsSchema = z.object({
  entries: z.array(skillEntrySchema),
});

// TypeScript types inferred from schemas
type SkillFormEntry = z.infer<typeof skillEntrySchema>;
type SkillsFormData = z.infer<typeof skillsSchema>;

// RMS Skills data interface
interface RMSSkillsData {
  [key: string]: any; // RMS format data with keys like rms_skill_0_category, etc.
  rms_skill_count?: number;
}

interface SkillsFormProps {
  initialData: RMSSkillsData;
  onSave?: (data: RMSSkillsData) => Promise<void>;
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

// Extract skills entries from RMS data
const extractSkillsFromRMS = (rmsData: RMSSkillsData): SkillFormEntry[] => {
  const count = rmsData.rms_skill_count || 0;
  const entries: SkillFormEntry[] = [];

  for (let i = 0; i < count; i++) {
    const entry: SkillFormEntry = {
      id: `skill_${i}`,
      category: cleanValue(rmsData[`rms_skill_${i}_category`]),
      keywords: cleanValue(rmsData[`rms_skill_${i}_keywords`]),
    };
    entries.push(entry);
  }

  return entries.length > 0 ? entries : [{
    id: crypto.randomUUID(),
    category: '',
    keywords: '',
  }];
};

// Convert form data back to RMS format
const convertToRMSFormat = (formData: SkillsFormData): RMSSkillsData => {
  const rmsData: RMSSkillsData = {
    rms_skill_count: formData.entries.length
  };

  formData.entries.forEach((entry, i) => {
    rmsData[`rms_skill_${i}_category`] = entry.category || '';
    rmsData[`rms_skill_${i}_keywords`] = entry.keywords || '';
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



export default function SkillsForm({ initialData, onSave }: SkillsFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize form with RMS data
  const defaultFormValues = useMemo(() => ({
    entries: extractSkillsFromRMS(initialData)
  }), [initialData]);

  const form = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
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
        description: "Skills saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save skills",
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
      description: "Skills section restored to initial state",
    });
  }, [reset, defaultFormValues, toast]);

  const addNewSkillCategory = useCallback(() => {
    const newEntry = {
      id: crypto.randomUUID(),
      category: '',
      keywords: ''
    };
    append(newEntry);
    setActiveIndex(fields.length);
  }, [append, fields.length]);

  const removeSkillCategory = useCallback((index: number) => {
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
    newEntry: addNewSkillCategory,
    prev: navigatePrev,
    next: navigateNext,
  });


  // Header title
  const headerTitle = currentEntry?.category
    ? `${currentEntry.category}`
    : "New Skill Category";

  // Field error helpers
  const getFieldErrorMessage = (field: keyof SkillFormEntry): string | undefined => {
    const error = errors.entries?.[activeIndex]?.[field];
    if (error && typeof error === 'object' && 'message' in error) {
      return error.message as string;
    }
    return undefined;
  };

  // Helper to parse skills for preview
  const parseSkills = (keywords: string): string[] => {
    if (!keywords) return [];
    return keywords
      .split(/[,\n]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  };

  const skillsList = parseSkills(currentEntry?.keywords || '');

  return (
    <div className={`resume-form-container ${isSaving ? 'resume-form-container--saving' : ''} ${isDirty ? 'resume-form-container--dirty' : ''}`}>
      <div className="resume-form-background" aria-hidden="true" />
      <div className="resume-form-pattern" aria-hidden="true" />

      <div className="flex h-full">
        {/* Left Panel - Skills List */}
        <div className="w-80 border-r border-corporate-navy-200 dark:border-corporate-navy-700 bg-white/90 dark:bg-corporate-navy-800/90 backdrop-blur-sm">
          {/* Panel Header */}
          <div className="flex flex-row items-center justify-between gap-2 px-6 py-4 border-b border-corporate-navy-100 dark:border-corporate-navy-700">
            <div 
              className="flex w-full flex-row items-center gap-2 cursor-pointer" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              role="button"
              tabIndex={0}
            >
              {isCollapsed ? (
                <ChevronRight className="transition-all duration-200 ease-in-out text-corporate-navy-600 dark:text-corporate-amber-400" />
              ) : (
                <ChevronDown className="transition-all duration-200 ease-in-out text-corporate-navy-600 dark:text-corporate-amber-400" />
              )}
              <div className="w-full text-lg font-semibold leading-7 text-corporate-navy-900 dark:text-gray-100">Your Skills</div>
            </div>
            <div className="group relative flex-shrink-0">
              <Button
                type="button" 
                onClick={addNewSkillCategory}
                disabled={isSaving}
                size="sm"
                className="h-6 w-6 p-0 bg-corporate-gold-500 hover:bg-corporate-amber-500 text-white"
                title="Add new skill category"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Skills List */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.section
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-px pb-6">
                  <div className="flex flex-col gap-px">
                    {fields.map((field, index) => (
                      <div key={field.id} className="group/listitem">
                        <div 
                          className={`relative flex w-full flex-grow flex-row items-center cursor-pointer transition-colors ${
                            index === activeIndex 
                              ? 'bg-corporate-amber-50 dark:bg-corporate-navy-700' 
                              : 'hover:bg-corporate-amber-25 dark:hover:bg-corporate-navy-750'
                          }`}
                          onClick={() => setActiveIndex(index)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="group/item relative flex w-full flex-col items-start gap-px">
                            <div className="relative w-full">
                              <div className="flex w-full flex-row items-stretch justify-between gap-4 px-6 py-3">
                                <div className="w-6 group absolute left-0 top-0 z-50 flex h-full items-center justify-center text-corporate-navy-400 dark:text-corporate-amber-400/70 opacity-0 hover:cursor-grab group-hover/listitem:opacity-100">
                                  <button 
                                    type="button" 
                                    className="relative flex items-center justify-center transition transition-200 text-corporate-navy-600 hover:text-corporate-amber-500 dark:text-corporate-amber-400 dark:hover:text-corporate-amber-300 bg-transparent px-2 py-1 min-h-8 rounded-md w-8 hover:cursor-grab"
                                  >
                                    <GripVertical className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex w-full flex-col items-start gap-0.5">
                                  <div className="block max-w-full overflow-hidden text-ellipsis text-base font-semibold leading-6 whitespace-nowrap text-corporate-navy-900 dark:text-gray-100">
                                    {watch(`entries.${index}.category`) || `Skill ${index + 1}`}
                                  </div>
                                  <div className="block max-w-full overflow-hidden text-ellipsis text-sm font-normal leading-5 text-corporate-navy-600 dark:text-gray-300 whitespace-nowrap">
                                    {watch(`entries.${index}.keywords`) || 'No skills added yet'}
                                  </div>
                                </div>
                                <div className="hover:text-corporate-amber-500 flex items-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (fields.length > 1) {
                                        removeSkillCategory(index);
                                      }
                                    }}
                                    disabled={fields.length <= 1}
                                    className="h-6 w-6 cursor-pointer group relative flex items-center justify-center text-corporate-navy-400 hover:text-red-500 dark:text-corporate-amber-400/70 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete skill category"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Main Form Area */}
        <div className="flex-1 relative">
          <div className="resume-form-content">
            {/* Header for Current Skill Category */}
            <div className="resume-form-header">
              <h2 className="resume-form-title">
                <div className="resume-form-icon">
                  <Palette className="h-4 w-4 text-white" />
                </div>
                <span className="truncate pr-4">{headerTitle}</span>
              </h2>

              <div className="flex items-center gap-4">
                <AnimatePresence mode="wait">
                  <AutoSaveIndicator status={autoSaveStatus} />
                </AnimatePresence>
              </div>
            </div>

            {/* Main Form Content */}
            <div className="p-6">
              <div className="bg-white/90 dark:bg-corporate-navy-800/90 rounded-lg border border-corporate-navy-200 dark:border-corporate-navy-700 p-4 lg:p-6 relative">
                <div className="opacity-100">
                  <form>
                    <div className="relative grid items-end gap-x-6 gap-y-4 sm:grid-cols-2">
                      <div className="relative sm:col-span-2">
                        {/* AI Skills Explorer Button */}
                        <div className="absolute bottom-0 right-0 p-2 z-50 md:p-0 md:-top-3 md:right-0">
                          <button 
                            type="button" 
                            className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition transition-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed border-0 bg-corporate-gold-500 active:bg-corporate-amber-600 focus:bg-corporate-amber-400 text-white hover:bg-corporate-amber-500 px-2 py-1 min-h-8 leading-4 rounded-md text-xs rounded-full"
                          >
                            <Sparkles className="w-[18px] h-[18px] mr-1" />
                            <span className="px-1">AI Skills Explorer</span>
                          </button>
                        </div>
                        
                        {/* Form Field */}
                        <div className="grid gap-y-1">
                          <div className="inline-block w-full">
                            <div className="flex items-end justify-between">
                              <label className="uppercase flex items-center text-corporate-navy-900 dark:text-gray-100 font-normal">
                                <span className="cursor-default text-sm leading-5">
                                  Enter the <strong>skills</strong> you possess
                                </span>
                                <span className="cursor-default text-sm leading-5 ml-1 text-red-500"> *</span>
                              </label>
                            </div>
                          </div>
                          
                          {/* Lexical Skills Input */}
                          <div className="relative">
                            <div className="relative rounded-sm bg-transparent min-h-12">
                              <Controller
                                name={`entries.${activeIndex}.keywords`}
                                control={control}
                                render={({ field }) => {
                                  const initialConfig = {
                                    namespace: `SkillsEditor-${activeIndex}`,
                                    nodes: [],
                                    onError: (error: Error) => {
                                      console.error('Lexical error:', error);
                                    },
                                    editorState: field.value ? JSON.stringify({
                                      root: {
                                        children: [{
                                          children: [{
                                            detail: 0,
                                            format: 0,
                                            mode: "normal",
                                            style: "",
                                            text: field.value,
                                            type: "text",
                                            version: 1
                                          }],
                                          direction: "ltr",
                                          format: "",
                                          indent: 0,
                                          type: "paragraph",
                                          version: 1
                                        }],
                                        direction: "ltr",
                                        format: "",
                                        indent: 0,
                                        type: "root",
                                        version: 1
                                      }
                                    }) : undefined,
                                  };

                                  return (
                                    <div className="pb-24 lg:pb-12 rounded border-2 border-corporate-navy-200 dark:border-corporate-navy-600 px-4 pt-3.5 pb-12 z-10 relative whitespace-pre-wrap outline-none focus-within:border-corporate-gold-400 dark:focus-within:border-corporate-amber-400 min-h-12 bg-white dark:bg-corporate-navy-800">
                                      <LexicalComposer initialConfig={initialConfig} key={activeIndex}>
                                        <PlainTextPlugin
                                          contentEditable={
                                            <ContentEditable
                                              className="outline-none bg-transparent min-h-[120px] p-0 resize-none text-base leading-6 font-normal text-corporate-navy-900 dark:text-gray-100"
                                              style={{
                                                fontSize: '16px',
                                                lineHeight: '1.5',
                                                wordBreak: 'break-word',
                                                userSelect: 'text',
                                                whiteSpace: 'pre-wrap'
                                              }}
                                            />
                                          }
                                          placeholder={
                                            <div className="absolute top-0 left-0 pointer-events-none text-corporate-navy-400 dark:text-gray-400 text-base leading-6">
                                              Customer Service, Food Safety, Fast-Paced Work, Team Collaboration, Cash Handling, Order Accuracy, Time Management, Multitasking, Strong Work Ethic, Reliable Attendance, Quick Learner, Adaptability, Communication, Problem-Solving, Attention to Detail
                                            </div>
                                          }
                                          ErrorBoundary={LexicalErrorBoundary}
                                        />
                                        <OnChangePlugin
                                          onChange={(editorState: EditorState) => {
                                            editorState.read(() => {
                                              const root = $getRoot();
                                              const text = root.getTextContent();
                                              field.onChange(text);
                                            });
                                          }}
                                        />
                                        <HistoryPlugin />
                                      </LexicalComposer>
                                    </div>
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Save Button */}
                    <div className="mt-6 flex justify-end">
                      <Button
                        type="submit"
                        onClick={(e) => {
                          e.preventDefault();
                          handleManualSave();
                        }}
                        disabled={isSaving || !isDirty}
                        className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition transition-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed border-0 bg-corporate-gold-500 active:bg-corporate-amber-600 focus:bg-corporate-amber-400 text-white hover:bg-corporate-amber-500 px-3 py-2.5 h-10 leading-5 rounded-md text-[14px] w-full md:w-auto"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <span className="px-1">Save to Skills list</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showModal}
        onClose={handleCancelNavigation}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardAndContinue}
        onCancel={handleCancelNavigation}
        title="Unsaved Skills Changes"
        description="You have unsaved changes to your skills. What would you like to do?"
      />
    </div>
  );
}