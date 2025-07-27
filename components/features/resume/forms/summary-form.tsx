'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Save, Loader2, FileText, AlertCircle, Target, Cpu, BookOpen } from "lucide-react";
import { useResumeData } from "@/contexts/resume-data-context";
import { generateSummaryAPI } from '@/lib/client/api/summary';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Textarea } from '@/components/shared/textarea';
import { Switch } from '@/components/shared/switch';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useResumeStore } from '@/lib/client/stores/resume-store';
import '../styles/form-styles.css';

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

const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  const emptyValues = ['n/a', 'N/A', 'none', 'None', 'NONE', 'null', 'NULL', '-', '--', 'NA', 'na', 'undefined'];
  return emptyValues.includes(trimmed) ? '' : trimmed;
};

// Convert store format to form format
const convertToFormFormat = (data: SummaryData | undefined): SummaryData => {
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
const convertToStoreFormat = (data: SummaryData): SummaryData => {
  return {
    summary: data.summary || '',
    positionHighlight: data.positionHighlight || false,
    position: data.position || '',
    skillsHighlight: data.skillsHighlight || '',
  };
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
  const { updateSection, saveSection, isSectionDirty, saveStatus } = useResumeStore();
  const previousDataRef = useRef<string>('');

  const isDirty = isSectionDirty('summary');
  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('summary');

  const [summaryData, setSummaryData] = useState<SummaryData>(
    convertToFormFormat(initialData)
  );
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAlternatives, setAiAlternatives] = useState<string[]>([]);
  const [currentAlternativeIndex, setCurrentAlternativeIndex] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Helper function to get field value with both capitalizations
  const getResumeField = useCallback((fieldName: string): string | boolean | number | undefined => {
    if (!resumeData) return undefined;
    if (resumeData[fieldName] !== undefined) return resumeData[fieldName];
    const capitalField = fieldName.replace('rms_', 'Rms_');
    return resumeData[capitalField];
  }, [resumeData]);

  // Extract positions from resume data
  const positions = useMemo(() => {
    if (processedData?.experience?.length > 0) {
      return processedData.experience
        .map(exp => exp.position)
        .filter(pos => pos && pos.trim())
        .filter((pos, index, self) => self.indexOf(pos) === index)
        .slice(0, 10); // Limit to 10 most recent positions
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

  // Calculate word count
  const calculateWordCount = useCallback((text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }, []);

  // Reset form when initialData changes (when switching resumes)
  useEffect(() => {
    const formData = convertToFormFormat(initialData);
    setSummaryData(formData);
    setWordCount(calculateWordCount(formData.summary));
    previousDataRef.current = JSON.stringify(formData);
    
    // Only update store if there's actual data
    if (formData.summary) {
      updateSection('summary', formData.summary);
    }
  }, [initialData, calculateWordCount, updateSection]);

  // Initialize summary data from context or props - keeping existing logic for backward compatibility
  useEffect(() => {
    if (!initialData) {
      const existingSummary = getResumeField('rms_summary') || processedData?.summary;
      const existingPositionHighlight = getResumeField('summary_position_highlight');
      const existingTargetPosition = getResumeField('summary_target_position');
      const existingSkillsHighlight = getResumeField('summary_skills_highlight');

      if (existingSummary || (resumeData && Object.keys(resumeData).length > 0)) {
        const summaryText = cleanValue(typeof existingSummary === 'string' ? existingSummary : String(existingSummary || ''));
        const newData = {
          summary: summaryText || '',
          positionHighlight: existingPositionHighlight !== undefined ? existingPositionHighlight !== false : true,
          position: cleanValue(typeof existingTargetPosition === 'string' ? existingTargetPosition : String(existingTargetPosition || '')) || positions[0] || '',
          skillsHighlight: cleanValue(typeof existingSkillsHighlight === 'string' ? existingSkillsHighlight : String(existingSkillsHighlight || '')) || extractedSkills || ''
        };

        setSummaryData(newData);
        setWordCount(calculateWordCount(newData.summary));
        previousDataRef.current = JSON.stringify(newData);
      }
    }
  }, [initialData, resumeData?.id, extractedSkills, getResumeField, positions, processedData?.summary, resumeData, calculateWordCount]);

  // Update store when form data changes (no auto-save) - using ref to prevent infinite loops
  useEffect(() => {
    const currentData = JSON.stringify(summaryData);
    const initialDataString = JSON.stringify(convertToFormFormat(initialData));
    
    // Only update if data actually changed from both previous and initial
    if (currentData !== previousDataRef.current && currentData !== initialDataString) {
      previousDataRef.current = currentData;
      // For summary section, we just need the summary string
      updateSection('summary', summaryData.summary);
    }
  }, [summaryData, updateSection, initialData]);

  // Validation with comprehensive checks - summary is optional
  const validate = useCallback((): boolean => {
    const errs = new Set<string>();

    // Only validate if summary has content
    if (summaryData.summary.trim()) {
      if (summaryData.summary.trim().length < 50) {
        errs.add('summary_too_short');
      } else if (summaryData.summary.trim().length > 1000) {
        errs.add('summary_too_long');
      }
    }

    // Only validate position if position highlight is enabled and there's content
    if (summaryData.positionHighlight && summaryData.summary.trim() && !summaryData.position.trim()) {
      errs.add('position_required');
    }

    setErrors(errs);
    return errs.size === 0;
  }, [summaryData]);

  // Update field with change tracking
  const update = useCallback((field: keyof SummaryData, value: SummaryData[keyof SummaryData]) => {
    setSummaryData(prev => {
      const newData = { ...prev, [field]: value };

      // Update word count if summary changed
      if (field === 'summary' && typeof value === 'string') {
        setWordCount(calculateWordCount(value));
      }

      return newData;
    });

    // Clear related errors
    if (errors.has(field)) {
      setErrors(prev => {
        const next = new Set(prev);
        next.delete(field);
        if (field === 'summary') {
          next.delete('summary_too_short');
          next.delete('summary_too_long');
        }
        if (field === 'position') {
          next.delete('position_required');
        }
        return next;
      });
    }
  }, [errors, calculateWordCount]);

  // Manual save function matching the established pattern
  const handleManualSave = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validate()) {
      const errorMessages: string[] = [];
      if (errors.has('summary_too_short')) errorMessages.push('Summary should be at least 50 characters');
      if (errors.has('summary_too_long')) errorMessages.push('Summary should not exceed 1000 characters');
      if (errors.has('position_required')) errorMessages.push('Position is required when position highlight is enabled');

      toast({
        title: "Validation Error",
        description: errorMessages.join('. '),
        variant: "destructive",
      });
      return;
    }

    try {
      const storeData = convertToStoreFormat(summaryData);
      
      // If onSave prop is provided, use it instead of the internal save logic
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
      
      await saveSection('summary'); // Save to Zustand store
      
      toast({
        title: "Success",
        description: "Summary saved successfully",
      });

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('Manual save error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save summary",
        variant: "destructive",
      });
    }
  }, [summaryData, resumeData, updateResumeData, saveResumeData, onSave, onSaveSuccess, validate, errors, toast, saveSection]);

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

      const response = await generateSummaryAPI({
        resumeData: resumeDataForAI,
        targetPosition: summaryData.positionHighlight ? summaryData.position : undefined,
        skillsHighlight: summaryData.skillsHighlight || extractedSkills,
        existingSummary: summaryData.summary,
      });

      if (response.summary) {
        update('summary', response.summary);

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
      update('summary', aiAlternatives[index]);
      setCurrentAlternativeIndex(index);
    }
  }, [aiAlternatives, update]);

  // Navigate through alternatives
  const navigateAlternative = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? Math.min(currentAlternativeIndex + 1, aiAlternatives.length - 1)
      : Math.max(currentAlternativeIndex - 1, 0);
    handleAlternativeSelect(newIndex);
  }, [currentAlternativeIndex, aiAlternatives.length, handleAlternativeSelect]);

  // Check if there's enough content for AI generation
  const hasEnoughContent = positions.length > 0 || extractedSkills.length > 0;

  // Get error messages
  const getErrorMessage = useCallback(() => {
    if (errors.has('summary_too_short')) return 'Summary should be at least 50 characters (currently ' + summaryData.summary.length + ')';
    if (errors.has('summary_too_long')) return 'Summary should not exceed 1000 characters (currently ' + summaryData.summary.length + ')';
    if (errors.has('position_required')) return 'Position is required when position highlight is enabled';
    return '';
  }, [errors, summaryData.summary.length]);

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
      {/* Background gradient effect */}
      <div className="resume-form-background" aria-hidden="true" />

      {/* Subtle pattern overlay */}
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

          {/* Word count indicator */}
          <div className="flex items-center gap-2 text-sm text-corporate-navy-600 dark:text-gray-400">
            <BookOpen className="h-4 w-4" />
            <span className={wordCount > 100 ? 'text-corporate-amber-600 dark:text-corporate-amber-400 font-medium' : ''}>
              {wordCount} words
            </span>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleManualSave} className="space-y-6" aria-busy={isSaving}>
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
                    {summaryData.summary.length}/1000 characters
                  </span>
                </Label>
                <div className={`resume-input-container ${errors.size > 0 ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                  <Textarea
                    value={summaryData.summary}
                    onChange={(e) => update('summary', e.target.value)}
                    placeholder="Write a compelling professional summary that highlights your key achievements, skills, and career objectives. Example: Experienced software engineer with 5+ years developing scalable web applications. Proven track record of leading cross-functional teams and delivering high-quality solutions that drive business growth."
                    className="resume-textarea p-4 resize-none min-h-[180px]"
                    rows={8}
                    disabled={isSaving}
                    maxLength={1000}
                  />
                </div>
                {errors.size > 0 && (
                  <p className="resume-error-message">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {getErrorMessage()}
                  </p>
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
                        <Switch
                          checked={summaryData.positionHighlight}
                          onCheckedChange={(checked) => update('positionHighlight', checked)}
                          disabled={isSaving || positions.length === 0}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-corporate-gold-500 data-[state=checked]:to-corporate-amber-500"
                        />
                      </div>
                    </div>

                    <div className={`resume-input-container ${!summaryData.positionHighlight || positions.length === 0 ? 'opacity-50' : ''} ${errors.has('position_required') ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                      <Target className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                      <select
                        value={summaryData.position}
                        onChange={(e) => update('position', e.target.value)}
                        disabled={!summaryData.positionHighlight || positions.length === 0 || isSaving}
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
                  </div>

                  {/* Skills Highlight */}
                  <div className="space-y-2">
                    <Label className="resume-label">
                      Skills Highlight
                    </Label>
                    <div className={`resume-input-container ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                      <Cpu className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                      <Input
                        value={summaryData.skillsHighlight}
                        onChange={(e) => update('skillsHighlight', e.target.value)}
                        placeholder="Enter key skills"
                        className="resume-input px-0 pr-3"
                        disabled={isSaving}
                      />
                    </div>
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
            <div className="flex items-center gap-2">
              {isDirty && (
                <span className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <div className="resume-section-dirty-dot" />
                  Unsaved changes
                </span>
              )}
              {!isDirty && saveStatus.lastSaved && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <div className="resume-section-clean-dot" />
                  Saved
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                type="submit"
                disabled={isSaving || !isDirty}
                className="resume-button-primary"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="resume-button-icon animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="resume-button-icon" />
                    Save Summary
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