'use client';

/**
 * SummaryForm Component
 *
 * Features:
 * - Auto-save: Updates store in memory every 2 seconds (doesn't persist to database)
 * - Manual save: Persists to database via Save button or Ctrl+S
 * - Validation: Real-time validation with helpful error messages
 * - Keyboard shortcuts: Save (Ctrl+S), Undo (Ctrl+Z)
 * - Enhanced with better UX patterns from experience/involvement forms
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sparkles, Save, Loader2, FileText, AlertCircle, Target,
  Cpu, BookOpen, Undo2, Check, Clock, ChevronLeft, ChevronRight
} from "lucide-react";
import { useResumeData } from "@/contexts/resume-data-context";
import { generateSummaryAPI } from '@/lib/client/api/summary';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Textarea } from '@/components/shared/textarea';
import { Switch } from '@/components/shared/switch';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useResumeStore } from '@/lib/client/stores/resume-store';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';

// Schema for summary form
const summarySchema = z.object({
  summary: z.string().max(1000, "Summary should not exceed 1000 characters"),
  positionHighlight: z.boolean(),
  position: z.string(),
  skillsHighlight: z.string(),
});

// TypeScript types inferred from schema
type SummaryFormData = z.infer<typeof summarySchema>;

export interface SummaryData {
  summary: string;
  positionHighlight: boolean;
  position: string;
  skillsHighlight: string;
}

interface SummaryFormProps {
  initialData?: SummaryData;
  onSave?: (data: SummaryData) => Promise<void>;
  onSaveSuccess?: () => void;
}

const PLACEHOLDER_VALUES = ['n/a', 'N/A', 'none', 'None', 'NONE', 'null', 'NULL', '-', '--', 'NA', 'na', 'undefined'];
const AUTO_SAVE_DELAY = 2000;

const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return PLACEHOLDER_VALUES.includes(trimmed) ? '' : trimmed;
};

// Convert store format to form format
const convertToFormFormat = (data: SummaryData | undefined): SummaryFormData => {
  if (!data) {
    return {
      summary: '',
      positionHighlight: true,
      position: '',
      skillsHighlight: ''
    };
  }

  return {
    summary: cleanValue(data.summary),
    positionHighlight: data.positionHighlight ?? true,
    position: cleanValue(data.position),
    skillsHighlight: cleanValue(data.skillsHighlight)
  };
};

// Convert form format to store format
const convertToStoreFormat = (data: SummaryFormData): SummaryData => {
  return {
    summary: data.summary || '',
    positionHighlight: data.positionHighlight || false,
    position: data.position || '',
    skillsHighlight: data.skillsHighlight || '',
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

export default function SummaryForm({ initialData, onSave, onSaveSuccess }: SummaryFormProps) {
  const {
    resumeData,
    processedData,
    updateResumeData,
    saveResumeData,
    loading: contextLoading
  } = useResumeData();
  const { toast } = useToast();
  const {
    updateSection,
    saveSection,
    saveStatus,
    revertSection
  } = useResumeStore();

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAlternatives, setAiAlternatives] = useState<string[]>([]);
  const [currentAlternativeIndex, setCurrentAlternativeIndex] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('summary');

  // Initialize form
  const defaultFormValues = useMemo(() =>
    convertToFormFormat(initialData),
    [initialData]
  );

  const form = useForm<SummaryFormData>({
    resolver: zodResolver(summarySchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur',
  });

  const { control, formState: { errors, isDirty }, watch, setValue, reset, getValues, trigger } = form;

  // Watch current entry
  const currentEntry = watch();

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
        updateSection('summary', storeData.summary);
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
    isFirstRender.current = true;
  }, [initialData, reset, defaultFormValues]);

  // Extract positions from resume data
  const positions = useMemo(() => {
    if (processedData?.experience?.length > 0) {
      return processedData.experience
        .map(exp => exp.position)
        .filter(pos => pos && pos.trim())
        .filter((pos, index, self) => self.indexOf(pos) === index)
        .slice(0, 10);
    }

    if (resumeData) {
      const extractedPositions: string[] = [];
      const experienceCount = parseInt(resumeData['Rms_experience_count'] || '0');

      for (let i = 0; i < experienceCount; i++) {
        const position = resumeData[`Rms_experience_${i}_role`];
        if (position && position !== 'n/a') {
          extractedPositions.push(position);
        }
      }

      return extractedPositions
        .filter((pos, index, self) => self.indexOf(pos) === index)
        .slice(0, 10);
    }

    return [];
  }, [processedData, resumeData]);

  // Extract skills from resume data
  const extractedSkills = useMemo(() => {
    if (processedData?.skills?.length > 0) {
      return processedData.skills
        .map(skill => skill.keywords)
        .filter(Boolean)
        .join(', ');
    }

    if (resumeData) {
      const skills: string[] = [];
      const skillCount = parseInt(resumeData['Rms_skill_count'] || '0');

      for (let i = 0; i < skillCount; i++) {
        const keywords = resumeData[`Rms_skill_${i}_keywords`];
        if (keywords && keywords !== 'n/a') {
          skills.push(keywords);
        }
      }

      return skills.join(', ');
    }

    return '';
  }, [processedData, resumeData]);

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
      } else {
        // Internal save logic for backward compatibility
        const useCapital = resumeData && Object.keys(resumeData).some(key => key.startsWith('Rms_'));
        const updates: Record<string, string | boolean> = {};
        updates[useCapital ? 'Rms_summary' : 'rms_summary'] = storeData.summary;
        updates['summary_position_highlight'] = storeData.positionHighlight;
        updates['summary_target_position'] = storeData.positionHighlight ? storeData.position : '';
        updates['summary_skills_highlight'] = storeData.skillsHighlight;

        updateResumeData(updates);
        await saveResumeData();
      }

      updateSection('summary', storeData.summary);
      await saveSection('summary');

      // Reset form state with current values to mark as clean
      reset(formData);

      toast({
        title: "Success",
        description: "Summary saved successfully",
      });

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save summary",
        variant: "destructive",
      });
    }
  }, [trigger, getValues, onSave, onSaveSuccess, resumeData, updateResumeData, saveResumeData, updateSection, saveSection, reset, toast]);

  const handleUndo = useCallback(() => {
    revertSection('summary');
    reset(defaultFormValues);
    toast({
      title: "Changes reverted",
      description: "Summary section restored to last saved state",
    });
  }, [revertSection, reset, defaultFormValues, toast]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    save: handleManualSave,
    undo: handleUndo,
  });

  // Enhanced AI generation with better error handling and data preparation
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
    setShowAlternatives(false);
    setAiAlternatives([]);
    setCurrentAlternativeIndex(0);

    try {
      // Prepare experience data
      const experienceData = [];
      if (resumeData) {
        const experienceCount = parseInt(resumeData['Rms_experience_count'] || '0');
        for (let i = 0; i < experienceCount; i++) {
          const company = resumeData[`Rms_experience_${i}_company`];
          const position = resumeData[`Rms_experience_${i}_role`];
          const dateBegin = resumeData[`Rms_experience_${i}_dateBegin`];
          const dateEnd = resumeData[`Rms_experience_${i}_dateEnd`];
          const description = resumeData[`Rms_experience_${i}_description`];
          const location = resumeData[`Rms_experience_${i}_location`];

          if (company && company !== 'n/a') {
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

      // Prepare education data
      const educationData = [];
      if (resumeData) {
        const educationCount = parseInt(resumeData['Rms_education_count'] || '0');
        for (let i = 0; i < educationCount; i++) {
          const institution = resumeData[`Rms_education_${i}_institution`];
          const qualification = resumeData[`Rms_education_${i}_qualification`];
          const fieldOfStudy = resumeData[`Rms_education_${i}_fieldOfStudy`];
          const date = resumeData[`Rms_education_${i}_date`];
          const minor = resumeData[`Rms_education_${i}_minor`];

          if (institution && institution !== 'n/a') {
            educationData.push({
              institution,
              degree: qualification || '',
              field: fieldOfStudy || (minor && minor !== 'n/a' ? minor : ''),
              graduationDate: date || ''
            });
          }
        }
      }

      // Prepare comprehensive resume data for AI
      const resumeDataForAI = {
        contact: processedData?.contact || {
          fullName: resumeData?.['Rms_contact_fullName'] || '',
          email: resumeData?.['Rms_contact_email'] || ''
        },
        workExperience: experienceData.length > 0 ? experienceData :
          (processedData?.experience?.map(exp => ({
            company: exp.company,
            position: exp.position,
            duration: `${exp.dateBegin} - ${exp.dateEnd || 'Present'}`,
            description: exp.description,
            location: exp.location
          })) || []),
        education: educationData.length > 0 ? educationData :
          (processedData?.education?.map(edu => ({
            institution: edu.institution,
            degree: edu.qualification,
            field: edu.fieldOfStudy,
            graduationDate: edu.date
          })) || []),
        skills: extractedSkills ? extractedSkills.split(',').map(s => s.trim()) : [],
        projects: processedData?.projects || [],
        certifications: processedData?.certifications || []
      };

      const formData = getValues();
      const response = await generateSummaryAPI({
        resumeData: resumeDataForAI,
        targetPosition: formData.positionHighlight ? formData.position : undefined,
        skillsHighlight: formData.skillsHighlight || extractedSkills,
        existingSummary: formData.summary,
      });

      if (response.summary) {
        setValue('summary', response.summary, { shouldDirty: true });

        if (response.alternatives && response.alternatives.length > 0) {
          setAiAlternatives([response.summary, ...response.alternatives]);
          setShowAlternatives(true);
          setCurrentAlternativeIndex(0);
        }

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

  // Handle alternative selection
  const handleAlternativeSelect = useCallback((index: number) => {
    if (aiAlternatives[index]) {
      setValue('summary', aiAlternatives[index], { shouldDirty: true });
      setCurrentAlternativeIndex(index);
    }
  }, [aiAlternatives, setValue]);

  // Navigate through alternatives
  const navigateAlternative = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? Math.min(currentAlternativeIndex + 1, aiAlternatives.length - 1)
      : Math.max(currentAlternativeIndex - 1, 0);
    handleAlternativeSelect(newIndex);
  }, [currentAlternativeIndex, aiAlternatives.length, handleAlternativeSelect]);

  // Check if there's enough content for AI generation
  const hasEnoughContent = positions.length > 0 || extractedSkills.length > 0;

  // Calculate word count
  const wordCount = useMemo(() => {
    const words = currentEntry.summary.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }, [currentEntry.summary]);

  // Show loading state
  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-corporate-amber-500 mx-auto mb-3" />
          <p className="text-corporate-navy-600 dark:text-gray-400 text-sm">Loading resume data...</p>
        </div>
      </div>
    );
  }

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
            <span>Professional Summary</span>
          </h2>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              <AutoSaveIndicator status={autoSaveStatus} />
            </AnimatePresence>

            {/* Word count indicator */}
            <div className="flex items-center gap-2 text-sm text-corporate-navy-600 dark:text-gray-400">
              <BookOpen className="h-4 w-4" />
              <span className={wordCount > 100 ? 'text-corporate-amber-600 dark:text-corporate-amber-400 font-medium' : ''}>
                {wordCount} words
              </span>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-8">
            {/* Main Summary Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Textarea */}
              <div className="space-y-2">
                <Label className="resume-label flex items-center justify-between">
                  <span>
                    Professional Summary
                  </span>
                  <span className="text-xs text-corporate-navy-500 dark:text-gray-400">
                    {currentEntry.summary.length}/1000 characters
                  </span>
                </Label>
                <Controller
                  name="summary"
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${errors.summary ? 'resume-input-container--error' : ''}`}>
                      <Textarea
                        {...field}
                        placeholder="Write a compelling professional summary that highlights your key achievements, skills, and career objectives. Example: Experienced software engineer with 5+ years developing scalable web applications. Proven track record of leading cross-functional teams and delivering high-quality solutions that drive business growth."
                        className="resume-textarea p-4 resize-none min-h-[180px]"
                        rows={8}
                        disabled={isSaving}
                        maxLength={1000}
                      />
                    </div>
                  )}
                />
                {errors.summary && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.summary.message}</span>
                  </motion.p>
                )}
              </div>

              {/* AI Alternatives Navigation */}
              {showAlternatives && aiAlternatives.length > 1 && (
                <div className="bg-corporate-amber-50/50 dark:bg-corporate-amber-900/20 rounded-xl p-4 border-2 border-corporate-amber-200 dark:border-corporate-amber-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-corporate-amber-800 dark:text-corporate-amber-300">
                      AI Alternative {currentAlternativeIndex + 1} of {aiAlternatives.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateAlternative('prev')}
                        disabled={currentAlternativeIndex === 0}
                        className="hover:bg-corporate-amber-100 dark:hover:bg-corporate-amber-900/30 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4 text-corporate-amber-700 dark:text-corporate-amber-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateAlternative('next')}
                        disabled={currentAlternativeIndex === aiAlternatives.length - 1}
                        className="hover:bg-corporate-amber-100 dark:hover:bg-corporate-amber-900/30 disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4 text-corporate-amber-700 dark:text-corporate-amber-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiAlternatives.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleAlternativeSelect(index)}
                        className={`px-3 py-1 text-xs rounded-full transition-all ${
                          index === currentAlternativeIndex
                            ? 'bg-corporate-amber-200 dark:bg-corporate-amber-800 text-corporate-amber-900 dark:text-corporate-amber-100'
                            : 'bg-corporate-amber-100 dark:bg-corporate-amber-900/40 text-corporate-amber-700 dark:text-corporate-amber-300 hover:bg-corporate-amber-150 dark:hover:bg-corporate-amber-900/60'
                        }`}
                      >
                        Option {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Summary Writer */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 dark:bg-corporate-navy-800/90 rounded-xl p-6 border-2 border-corporate-navy-100 dark:border-corporate-navy-700 space-y-6 sticky top-6">
                <div>
                  <h3 className="text-lg font-semibold text-corporate-navy-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-corporate-amber-500" />
                    AI Summary Writer
                  </h3>
                  <p className="text-sm text-corporate-navy-600 dark:text-gray-400">
                    Generate a professional summary tailored to your{' '}
                    <span className="text-corporate-amber-600 dark:text-corporate-amber-400 font-medium">target position</span>{' '}
                    and highlighting your key skills.
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
                          name="positionHighlight"
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
                      name="position"
                      control={control}
                      render={({ field }) => (
                        <div className={`resume-input-container ${!currentEntry.positionHighlight || positions.length === 0 ? 'opacity-50' : ''} ${errors.position ? 'resume-input-container--error' : ''}`}>
                          <Target className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                          <select
                            {...field}
                            disabled={!currentEntry.positionHighlight || positions.length === 0 || isSaving}
                            className="resume-input px-0 pr-3 w-full"
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
                    {errors.position && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="resume-error-message"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.position.message}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Skills Highlight */}
                  <div className="space-y-2">
                    <Label className="resume-label">
                      Skills Highlight
                    </Label>
                    <Controller
                      name="skillsHighlight"
                      control={control}
                      render={({ field }) => (
                        <div className={`resume-input-container`}>
                          <Cpu className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                          <Input
                            {...field}
                            placeholder="Enter key skills"
                            className="resume-input px-0 pr-3"
                            disabled={isSaving}
                          />
                        </div>
                      )}
                    />
                  </div>

                  {/* AI Writer Button */}
                  <Button
                    onClick={handleAIWrite}
                    disabled={aiLoading || !hasEnoughContent || isSaving}
                    className={`
                      w-full flex items-center justify-center gap-2 h-12
                      ${hasEnoughContent 
                        ? 'bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-400 hover:to-corporate-amber-400 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
                      font-medium text-sm uppercase tracking-wide
                      transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-md
                    `}
                  >
                    <Sparkles className="h-4 w-4" />
                    {aiLoading ? 'GENERATING...' : 'AI WRITER READY'}
                  </Button>
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