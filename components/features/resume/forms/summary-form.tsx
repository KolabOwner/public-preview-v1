'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Save, Loader2, FileText, AlertCircle, Target, Cpu, RefreshCw, BookOpen } from "lucide-react";
import { useResumeData } from "@/contexts/resume-data-context";
import { generateSummaryAPI } from '@/lib/client/api/summary';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Textarea } from '@/components/shared/textarea';
import { Switch } from '@/components/shared/switch';
import { useToast } from '@/lib/client/hooks/ui/use-toast';

export interface SummaryData {
  summary: string;
  positionHighlight: boolean;
  position: string;
  skillsHighlight: string;
}

interface SummaryFormProps {
  initialData?: string;
  onSave?: (summary: string) => Promise<void>;
  onSaveSuccess?: () => void;
}

const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  const emptyValues = ['n/a', 'N/A', 'none', 'None', 'NONE', 'null', 'NULL', '-', '--', 'NA', 'na', 'undefined'];
  return emptyValues.includes(trimmed) ? '' : trimmed;
};

// Clean data to ensure no undefined values for Firestore
const cleanDataForFirestore = (data: SummaryData) => {
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

  const [summaryData, setSummaryData] = useState<SummaryData>({
    summary: '',
    positionHighlight: true,
    position: '',
    skillsHighlight: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAlternatives, setAiAlternatives] = useState<string[]>([]);
  const [currentAlternativeIndex, setCurrentAlternativeIndex] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

  // Initialize summary data from context or props
  useEffect(() => {
    const existingSummary = initialData || getResumeField('rms_summary') || processedData?.summary;
    const existingPositionHighlight = getResumeField('summary_position_highlight');
    const existingTargetPosition = getResumeField('summary_target_position');
    const existingSkillsHighlight = getResumeField('summary_skills_highlight');

    if (existingSummary || (resumeData && Object.keys(resumeData).length > 0)) {
      setSummaryData(prev => {
        const summaryText = cleanValue(typeof existingSummary === 'string' ? existingSummary : String(existingSummary || ''));
        const newData = {
          summary: summaryText || prev.summary,
          positionHighlight: existingPositionHighlight !== undefined ? existingPositionHighlight !== false : prev.positionHighlight,
          position: cleanValue(typeof existingTargetPosition === 'string' ? existingTargetPosition : String(existingTargetPosition || '')) || positions[0] || prev.position,
          skillsHighlight: cleanValue(typeof existingSkillsHighlight === 'string' ? existingSkillsHighlight : String(existingSkillsHighlight || '')) || extractedSkills || prev.skillsHighlight
        };

        if (JSON.stringify(newData) !== JSON.stringify(prev)) {
          setWordCount(calculateWordCount(newData.summary));
          return newData;
        }
        return prev;
      });
    }
  }, [initialData, resumeData?.id, extractedSkills, getResumeField, positions, processedData?.summary, resumeData, calculateWordCount]);

  // Validation with comprehensive checks
  const validate = useCallback((): boolean => {
    const errs = new Set<string>();

    if (!summaryData.summary.trim()) {
      errs.add('summary');
    } else if (summaryData.summary.trim().length < 50) {
      errs.add('summary_too_short');
    } else if (summaryData.summary.trim().length > 1000) {
      errs.add('summary_too_long');
    }

    if (summaryData.positionHighlight && !summaryData.position.trim()) {
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

      // Track unsaved changes
      setHasUnsavedChanges(true);

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

  // Enhanced save function with better error handling
  const handleSave = useCallback(async () => {
    if (!validate()) {
      const errorMessages: string[] = [];
      if (errors.has('summary')) errorMessages.push('Professional summary is required');
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

    setIsSaving(true);
    try {
      // If onSave prop is provided, use it instead of the internal save logic
      if (onSave) {
        await onSave(summaryData.summary);
      } else {
        // Internal save logic
        const useCapital = resumeData && Object.keys(resumeData).some(key => key.startsWith('Rms_'));
        const cleanedData = cleanDataForFirestore(summaryData);

        const updates: Record<string, string | boolean> = {};
        updates[useCapital ? 'Rms_summary' : 'rms_summary'] = cleanedData.summary;
        updates['summary_position_highlight'] = cleanedData.positionHighlight;
        updates['summary_target_position'] = cleanedData.positionHighlight ? cleanedData.position : '';
        updates['summary_skills_highlight'] = cleanedData.skillsHighlight;

        updateResumeData(updates);
        await saveResumeData();
      }

      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Summary saved successfully",
      });

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('Summary save error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save summary",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [summaryData, resumeData, updateResumeData, saveResumeData, onSave, onSaveSuccess, validate, errors, toast]);

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
        setHasUnsavedChanges(true);

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
    if (errors.has('summary')) return 'Professional summary is required';
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
    <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
      isSaving 
        ? 'opacity-75 pointer-events-none border-corporate-amber-300 dark:border-corporate-amber-600' 
        : 'border-corporate-navy-200 dark:border-corporate-navy-700 hover:border-corporate-amber-300 dark:hover:border-corporate-amber-600/50'
    }`}>
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-corporate-gold-50/30 via-white to-corporate-amber-50/20 dark:from-corporate-navy-900 dark:via-corporate-navy-800 dark:to-corporate-navy-900" aria-hidden="true" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.02),transparent_50%)]" aria-hidden="true" />

      <div className="relative">
        {/* Header */}
        <div className="px-6 py-4 bg-white/90 dark:bg-corporate-navy-800/90 backdrop-blur-sm border-b-2 border-corporate-navy-100 dark:border-corporate-navy-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-corporate-navy-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-corporate-gold-500 to-corporate-amber-500 rounded-lg shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span>Professional Summary</span>
            {hasUnsavedChanges && (
              <div className="w-2 h-2 bg-corporate-amber-500 rounded-full animate-pulse" title="Unsaved changes" />
            )}
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
        <div className="relative bg-white/80 dark:bg-corporate-navy-900/90 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-8">
            {/* Main Summary Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Textarea */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100 flex items-center justify-between">
                  <span>
                    Professional Summary <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                  </span>
                  <span className="text-xs text-corporate-navy-500 dark:text-gray-400">
                    {summaryData.summary.length}/1000 characters
                  </span>
                </Label>
                <div className={`
                  rounded-lg border-2 transition-all duration-200
                  ${errors.size > 0
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Textarea
                    value={summaryData.summary}
                    onChange={(e) => update('summary', e.target.value)}
                    placeholder="Write a compelling professional summary that highlights your key achievements, skills, and career objectives. Example: Experienced software engineer with 5+ years developing scalable web applications. Proven track record of leading cross-functional teams and delivering high-quality solutions that drive business growth."
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 p-4 resize-none min-h-[180px]"
                    rows={8}
                    disabled={isSaving}
                    maxLength={1000}
                  />
                </div>
                {errors.size > 0 && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
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

                    <div className={`
                      flex items-center rounded-lg border-2 transition-all duration-200
                      ${!summaryData.positionHighlight || positions.length === 0 ? 'opacity-50' : ''}
                      ${errors.has('position_required') 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                      }
                      ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                    `}>
                      <Target className="h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 mr-2 flex-shrink-0" />
                      <select
                        value={summaryData.position}
                        onChange={(e) => update('position', e.target.value)}
                        disabled={!summaryData.positionHighlight || positions.length === 0 || isSaving}
                        className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 px-0 pr-3 w-full"
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
                    <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                      Skills Highlight
                    </Label>
                    <div className={`
                      flex items-center rounded-lg border-2 transition-all duration-200
                      ${'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'}
                      ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                    `}>
                      <Cpu className="h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 mr-2 flex-shrink-0" />
                      <Input
                        value={summaryData.skillsHighlight}
                        onChange={(e) => update('skillsHighlight', e.target.value)}
                        placeholder="Enter key skills"
                        className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-0 pr-3"
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
          <div className="flex justify-end items-center p-6 md:p-8 pt-0 border-t-2 border-corporate-navy-100 dark:border-corporate-navy-700">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-400 hover:to-corporate-amber-400 text-white font-semibold px-8 py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Summary
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}