'use client';

/**
 * SummaryForm Component - Natural, Clean Design
 *
 * Features:
 * - Clean, intuitive interface
 * - Lexical editor for better text editing
 * - AI Summary Writer integration
 * - Auto-save functionality
 * - Natural, modern styling
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sparkles, Save, Loader2, AlertCircle, Check, Clock, Undo2, FileText
} from "lucide-react";
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, EditorState, $createParagraphNode, $createTextNode } from 'lexical';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useResumeData } from "@/contexts/resume-data-context";
import { generateSummaryAPI } from '@/lib/client/api/summary';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useResumeStore } from '@/lib/client/stores/resume-store';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';
import { useUnsavedChangesProtection } from '@/lib/client/hooks/resume/use-unsaved-changes-protection';
import UnsavedChangesModal from '../modals/unsaved-changes-modal';

// Schema definition
const summarySchema = z.object({
  rms_summary: z.string().max(1000, "Summary should not exceed 1000 characters"),
  rms_summary_position_highlight: z.boolean(),
  rms_summary_target_position: z.string().optional(),
  rms_summary_skills_highlight: z.string().optional(),
});

type SummaryFormData = z.infer<typeof summarySchema>;

// RMS Summary data interface
interface RMSSummaryData {
  [key: string]: any;
  rms_summary?: string;
  rms_summary_position_highlight?: boolean;
  rms_summary_target_position?: string;
  rms_summary_skills_highlight?: string;
}

interface SummaryFormProps {
  initialData?: RMSSummaryData;
  onSave?: (data: RMSSummaryData) => Promise<void>;
}

// Constants
const PLACEHOLDER_VALUES = ['n/a', 'N/A', 'none', 'null', '-', 'NA'];
const AUTO_SAVE_DELAY = 2000;

// Helper functions
const cleanRMSValue = (value: any): string => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return PLACEHOLDER_VALUES.includes(trimmed) ? '' : trimmed;
};

// Extract summary data from RMS format
const extractSummaryFromRMS = (rmsData: RMSSummaryData | undefined): SummaryFormData => {
  if (!rmsData) {
    return {
      rms_summary: '',
      rms_summary_position_highlight: true,
      rms_summary_target_position: '',
      rms_summary_skills_highlight: '',
    };
  }

  return {
    rms_summary: cleanRMSValue(rmsData.rms_summary),
    rms_summary_position_highlight: rmsData.rms_summary_position_highlight ?? true,
    rms_summary_target_position: cleanRMSValue(rmsData.rms_summary_target_position),
    rms_summary_skills_highlight: cleanRMSValue(rmsData.rms_summary_skills_highlight),
  };
};

// Convert form data back to RMS format
const convertToRMSFormat = (formData: SummaryFormData): RMSSummaryData => {
  return {
    rms_summary: formData.rms_summary || '',
    rms_summary_position_highlight: formData.rms_summary_position_highlight ?? true,
    rms_summary_target_position: formData.rms_summary_target_position || '',
    rms_summary_skills_highlight: formData.rms_summary_skills_highlight || '',
  };
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
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};

export default function SummaryForm({ initialData, onSave }: SummaryFormProps) {
  const { toast } = useToast();
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize form with RMS data
  const defaultFormValues = useMemo(() =>
    extractSummaryFromRMS(initialData),
    [initialData]
  );

  const form = useForm<SummaryFormData>({
    resolver: zodResolver(summarySchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur',
  });

  const { control, handleSubmit, formState: { errors, isDirty }, watch, setValue, reset, getValues, trigger } = form;

  // Watch form data
  const formData = watch();

  // Set up auto-save with debouncing
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        const currentData = getValues();
        const rmsData = convertToRMSFormat(currentData);
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

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Reset form when initialData changes
  useEffect(() => {
    reset(defaultFormValues);
    isFirstRender.current = true;
  }, [initialData, reset, defaultFormValues]);

  // Unsaved changes protection
  const {
    showModal,
    handleSaveAndContinue,
    handleDiscardAndContinue,
    handleCancelNavigation
  } = useUnsavedChangesProtection({ isDirty });

  // Extract positions from initial data
  const positions = useMemo(() => {
    if (!initialData) return [];
    
    const extractedPositions: string[] = [];
    const experienceCount = parseInt(initialData['rms_experience_count'] || '0');

    for (let i = 0; i < experienceCount; i++) {
      const position = cleanRMSValue(initialData[`rms_experience_${i}_role`]);
      if (position) {
        extractedPositions.push(position);
      }
    }

    return extractedPositions
      .filter((pos, index, self) => self.indexOf(pos) === index)
      .slice(0, 10);
  }, [initialData]);

  // Extract skills from initial data
  const extractedSkills = useMemo(() => {
    if (!initialData) return '';
    
    const skills: string[] = [];
    const skillCount = parseInt(initialData['rms_skill_count'] || '0');

    for (let i = 0; i < skillCount; i++) {
      const keywords = cleanRMSValue(initialData[`rms_skill_${i}_keywords`]);
      if (keywords) {
        skills.push(keywords);
      }
    }

    return skills.join(', ');
  }, [initialData]);

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
      const currentData = getValues();
      const rmsData = convertToRMSFormat(currentData);

      if (onSave) {
        await onSave(rmsData);
      }

      // Reset form state with current values to mark as clean
      reset(currentData);

      toast({
        title: "Success",
        description: "Summary saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save summary",
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
      description: "Summary section restored to initial state",
    });
  }, [reset, defaultFormValues, toast]);

  // Enhanced AI generation
  const handleAIWrite = async () => {
    const hasExperience = positions.length > 0;
    const hasSkills = extractedSkills.length > 0;

    if (!hasExperience && !hasSkills) {
      toast({
        title: "Insufficient Data",
        description: "Please add work experience or skills to your resume first to generate an AI summary",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);

    try {
      // Prepare experience data from initial data
      const experienceData = [];
      if (initialData) {
        const experienceCount = parseInt(initialData['rms_experience_count'] || '0');
        
        for (let i = 0; i < experienceCount; i++) {
          const company = cleanRMSValue(initialData[`rms_experience_${i}_company`]);
          const position = cleanRMSValue(initialData[`rms_experience_${i}_role`]);
          const dateBegin = cleanRMSValue(initialData[`rms_experience_${i}_datebegin`]);
          const dateEnd = cleanRMSValue(initialData[`rms_experience_${i}_dateend`]);
          const description = cleanRMSValue(initialData[`rms_experience_${i}_description`]);
          const location = cleanRMSValue(initialData[`rms_experience_${i}_location`]);

          if (company) {
            experienceData.push({
              company,
              position: position || '',
              duration: `${dateBegin} - ${dateEnd || 'Present'}`,
              description: description || '',
              location: location || ''
            });
          }
        }
      }

      // Prepare comprehensive resume data for AI
      const resumeDataForAI = {
        contact: {
          fullName: initialData ? cleanRMSValue(initialData['rms_contact_fullname']) || '' : '',
          email: initialData ? cleanRMSValue(initialData['rms_contact_email']) || '' : ''
        },
        workExperience: experienceData,
        skills: extractedSkills ? extractedSkills.split(',').map(s => s.trim()) : [],
      };

      const currentFormData = getValues();
      const response = await generateSummaryAPI({
        resumeData: resumeDataForAI,
        targetPosition: currentFormData.rms_summary_position_highlight ? currentFormData.rms_summary_target_position : undefined,
        skillsHighlight: currentFormData.rms_summary_skills_highlight || extractedSkills,
        existingSummary: currentFormData.rms_summary,
      });

      if (response.summary) {
        setValue('rms_summary', response.summary, { shouldDirty: true });

        toast({
          title: "Success",
          description: "AI summary generated successfully! Review and save when ready.",
        });
      } else {
        throw new Error('No summary received from AI service');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Failed to generate summary. Please try again.',
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Check if there's enough content for AI generation
  const hasEnoughContent = positions.length > 0 || extractedSkills.length > 0;

  // Calculate word count
  const wordCount = useMemo(() => {
    const words = formData.rms_summary.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }, [formData.rms_summary]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    save: handleManualSave,
    undo: handleUndo,
  });

  return (
    <div className={`resume-form-container ${isSaving ? 'resume-form-container--saving' : ''} ${isDirty ? 'resume-form-container--dirty' : ''}`}>
      <div className="resume-form-background" aria-hidden="true" />
      <div className="resume-form-pattern" aria-hidden="true" />

      <div className="resume-form-content">
        {/* Header */}
        <div className="resume-form-header">
          <h2 className="resume-form-title">
            <div className="resume-form-icon">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="truncate pr-4">Professional Summary</span>
          </h2>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              <AutoSaveIndicator status={autoSaveStatus} />
            </AnimatePresence>

            {/* Word count indicator */}
            <div className="flex items-center gap-2 text-sm text-corporate-navy-600 dark:text-gray-400">
              <span className={wordCount > 100 ? 'text-corporate-amber-600 dark:text-corporate-amber-400 font-medium' : ''}>
                {wordCount} words
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(handleManualSave)} className="space-y-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Summary Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Description Field with AI Header */}
              <div className="grid gap-y-1">
                <div className="inline-block w-full">
                  <div className="flex items-end justify-between">
                    <label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal">
                      <span className="cursor-default text-sm leading-5">
                        <strong>Professional Summary</strong>
                      </span>
                    </label>
                    <div className="flex-shrink-0">
                      <div className="flex flex-col lg:flex-row justify-between pl-4 px-1.5 py-1.5 gap-x-4 gap-y-2">
                        <div className="flex flex-row items-center flex-1">
                          <div>
                            <div className="w-4 h-4 text-corporate-amber-500">💡</div>
                          </div>
                          <div className="text-sm leading-5 text-gray-500 font-normal ml-1">
                            Write a compelling summary highlighting your key achievements and skills.
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end items-center">
                          <div className="transition-opacity duration-200 opacity-100">
                            <Button
                              type="button"
                              onClick={handleAIWrite}
                              disabled={aiLoading || !hasEnoughContent || isSaving}
                              className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-all duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed border-0 bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-400 hover:to-corporate-amber-400 text-white px-3 py-1 rounded-full text-xs"
                              size="sm"
                            >
                              <div className="mr-1 w-3 h-3">
                                <div className="opacity-100">✨</div>
                              </div>
                              <span>{aiLoading ? 'Generating...' : 'Generate Summary'}</span>
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
                      name="rms_summary"
                      control={control}
                      render={({ field }) => {
                        const initialConfig = {
                          namespace: 'SummaryEditor',
                          nodes: [],
                          onError: (error: Error) => {
                            console.error('Lexical error:', error);
                          },
                          editorState: () => {
                            const root = $getRoot();
                            if (field.value) {
                              const paragraph = $createParagraphNode();
                              const textNode = $createTextNode(field.value);
                              paragraph.append(textNode);
                              root.append(paragraph);
                            }
                          },
                        };

                        return (
                          <div className="w-full p-3">
                            <LexicalComposer initialConfig={initialConfig}>
                              <PlainTextPlugin
                                contentEditable={
                                  <ContentEditable
                                    className="outline-none bg-transparent min-h-[180px] p-0"
                                    style={{
                                      fontSize: '16px',
                                      lineHeight: '1.5'
                                    }}
                                  />
                                }
                                placeholder={<div className="text-gray-400 dark:text-gray-500">Write a compelling professional summary that highlights your key achievements, skills, and career objectives. Example: Experienced software engineer with 5+ years developing scalable web applications...</div>}
                                ErrorBoundary={LexicalErrorBoundary}
                              />
                              <OnChangePlugin
                                onChange={(editorState: EditorState) => {
                                  editorState.read(() => {
                                    const root = $getRoot();
                                    const textContent = root.getTextContent();
                                    if (textContent !== field.value) {
                                      field.onChange(textContent);
                                    }
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

                {errors.rms_summary && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.rms_summary.message}</span>
                  </motion.p>
                )}

                {/* Character count */}
                <div className="text-xs text-gray-500 mt-2">
                  {formData.rms_summary.length}/1000 characters
                </div>
              </div>
            </div>

            {/* AI Summary Writer Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 dark:bg-corporate-navy-800/90 rounded-xl p-6 border-2 border-corporate-navy-100 dark:border-corporate-navy-700 space-y-6 sticky top-6">
                <div>
                  <h3 className="text-lg font-semibold text-corporate-navy-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-corporate-amber-500" />
                    AI Summary Writer
                  </h3>
                  <p className="text-sm text-corporate-navy-600 dark:text-gray-400">
                    Generate a professional summary tailored to your target position and highlighting your key skills.
                  </p>
                </div>

                {/* Position Toggle & Dropdown */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                        Target Position
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-corporate-navy-500 dark:text-gray-400">
                          {positions.length > 0 ? 'from resume' : 'none found'}
                        </span>
                        <Controller
                          name="rms_summary_position_highlight"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSaving || positions.length === 0}
                              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-corporate-gold-500 data-[state=checked]:to-corporate-amber-500"
                            />
                          )}
                        />
                      </div>
                    </div>

                    <Controller
                      name="rms_summary_target_position"
                      control={control}
                      render={({ field }) => (
                        <div className={`resume-input-container ${!formData.rms_summary_position_highlight || positions.length === 0 ? 'opacity-50' : ''}`}>
                          <select
                            {...field}
                            disabled={!formData.rms_summary_position_highlight || positions.length === 0 || isSaving}
                            className="resume-input w-full"
                          >
                            {positions.length === 0 ? (
                              <option value="">No positions found</option>
                            ) : (
                              <>
                                <option value="">Select a position</option>
                                {positions.map((pos, index) => (
                                  <option key={index} value={pos}>{pos}</option>
                                ))}
                              </>
                            )}
                          </select>
                        </div>
                      )}
                    />
                  </div>

                  {/* Skills Highlight */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                      Skills Highlight
                    </Label>
                    <Controller
                      name="rms_summary_skills_highlight"
                      control={control}
                      render={({ field }) => (
                        <div className="resume-input-container">
                          <Input
                            {...field}
                            placeholder="Enter key skills"
                            className="resume-input"
                            disabled={isSaving}
                          />
                        </div>
                      )}
                    />
                  </div>
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
        title="Unsaved Summary Changes"
        description="You have unsaved changes to your professional summary. What would you like to do?"
      />
    </div>
  );
}