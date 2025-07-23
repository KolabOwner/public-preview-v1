'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Save, Loader2, FileText, AlertCircle, Target, Cpu } from "lucide-react";
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

export default function SummaryForm({ onSaveSuccess }: SummaryFormProps) {
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

  // Helper function to get field value with both capitalizations
  const getResumeField = useCallback((fieldName: string): string | boolean | number | undefined => {
    if (!resumeData) return undefined;
    if (resumeData[fieldName] !== undefined) return resumeData[fieldName];
    const capitalField = fieldName.replace('rms_', 'Rms_');
    return resumeData[capitalField];
  }, [resumeData]);

  const positions = useMemo(() => {
    if (processedData?.experience?.length > 0) {
      return processedData.experience
        .map(exp => exp.position)
        .filter(pos => pos && pos.trim())
        .filter((pos, index, self) => self.indexOf(pos) === index);
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

      return extractedPositions.filter((pos, index, self) => self.indexOf(pos) === index);
    }

    return [];
  }, [processedData, resumeData]);

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

  // Initialize summary data from context
  useEffect(() => {
    const existingSummary = getResumeField('rms_summary') || processedData?.summary;
    const existingPositionHighlight = getResumeField('summary_position_highlight');
    const existingTargetPosition = getResumeField('summary_target_position');
    const existingSkillsHighlight = getResumeField('summary_skills_highlight');

    if (existingSummary || (resumeData && Object.keys(resumeData).length > 0)) {
      setSummaryData(prev => {
        const newData = {
          summary: cleanValue(typeof existingSummary === 'string' ? existingSummary : String(existingSummary || '')) || prev.summary,
          positionHighlight: existingPositionHighlight !== undefined ? existingPositionHighlight !== false : prev.positionHighlight,
          position: cleanValue(typeof existingTargetPosition === 'string' ? existingTargetPosition : String(existingTargetPosition || '')) || positions[0] || prev.position,
          skillsHighlight: cleanValue(typeof existingSkillsHighlight === 'string' ? existingSkillsHighlight : String(existingSkillsHighlight || '')) || extractedSkills || prev.skillsHighlight
        };

        if (JSON.stringify(newData) !== JSON.stringify(prev)) {
          return newData;
        }
        return prev;
      });
    }
  }, [resumeData?.id, extractedSkills, getResumeField, positions, processedData?.summary, resumeData]);

  const validate = useCallback((): boolean => {
    const errs = new Set<string>();
    if (!summaryData.summary.trim()) errs.add('summary');
    setErrors(errs);
    return errs.size === 0;
  }, [summaryData.summary]);

  const update = (field: keyof SummaryData, value: SummaryData[keyof SummaryData]) => {
    setSummaryData(prev => ({ ...prev, [field]: value }));

    if (errors.has(field)) {
      setErrors(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  // Manual save
  const handleSave = useCallback(async () => {
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please write a professional summary",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const useCapital = resumeData && Object.keys(resumeData).some(key => key.startsWith('Rms_'));
      const cleanedData = cleanDataForFirestore(summaryData);

      const updates: Record<string, string | boolean> = {};
      updates[useCapital ? 'Rms_summary' : 'rms_summary'] = cleanedData.summary;
      updates['summary_position_highlight'] = cleanedData.positionHighlight;
      updates['summary_target_position'] = cleanedData.positionHighlight ? cleanedData.position : '';
      updates['summary_skills_highlight'] = cleanedData.skillsHighlight;

      updateResumeData(updates);
      await saveResumeData();

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
        description: "Failed to save summary",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [summaryData, resumeData, updateResumeData, saveResumeData, onSaveSuccess, validate, toast]);

  const handleAIWrite = async () => {
    const hasExperience = positions.length > 0;
    const hasSkills = extractedSkills.length > 0;

    if (!hasExperience && !hasSkills) {
      toast({
        title: "Missing Data",
        description: "Please add experience or skills to your resume first",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);
    setShowAlternatives(false);
    setAiAlternatives([]);
    setCurrentAlternativeIndex(0);

    try {
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

      update('summary', response.summary);

      if (response.alternatives && response.alternatives.length > 0) {
        setAiAlternatives([response.summary, ...response.alternatives]);
        setShowAlternatives(true);
      }

      toast({
        title: "Success",
        description: "Summary generated successfully!",
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate summary',
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAlternativeSelect = (index: number) => {
    if (aiAlternatives[index]) {
      update('summary', aiAlternatives[index]);
      setCurrentAlternativeIndex(index);
    }
  };

  const navigateAlternative = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? Math.min(currentAlternativeIndex + 1, aiAlternatives.length - 1)
      : Math.max(currentAlternativeIndex - 1, 0);
    handleAlternativeSelect(newIndex);
  };

  const hasEnoughContent = positions.length > 0 || extractedSkills.length > 0;

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
          </h2>
        </div>

        {/* Form Content */}
        <div className="relative bg-white/80 dark:bg-corporate-navy-900/90 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-8">
            {/* Main Summary Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Textarea */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Professional Summary <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                </Label>
                <div className={`
                  rounded-lg border-2 transition-all duration-200
                  ${errors.has('summary') 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Textarea
                    value={summaryData.summary}
                    onChange={(e) => update('summary', e.target.value)}
                    placeholder="Experienced global early-stage executive with economics and mathematics degree from the University of Wisconsin. Passion for building inspiring companies people love through industry-leading design, development, branding, and making big bets."
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 p-4 resize-none min-h-[180px]"
                    rows={8}
                    disabled={isSaving}
                  />
                </div>
                {errors.has('summary') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Please write a professional summary
                  </p>
                )}
              </div>

              {/* AI Alternatives Navigation */}
              {showAlternatives && aiAlternatives.length > 1 && (
                <div className="bg-corporate-amber-50/50 dark:bg-corporate-amber-900/20 rounded-xl p-4 border-2 border-corporate-amber-200 dark:border-corporate-amber-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-corporate-amber-800 dark:text-corporate-amber-300">
                      Alternative {currentAlternativeIndex + 1} of {aiAlternatives.length}
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
                </div>
              )}
            </div>

            {/* AI Summary Writer */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 dark:bg-corporate-navy-800/90 rounded-xl p-6 border-2 border-corporate-navy-100 dark:border-corporate-navy-700 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-corporate-navy-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-corporate-amber-500" />
                    AI Summary Writer
                  </h3>
                  <p className="text-sm text-corporate-navy-600 dark:text-gray-400">
                    AI writer helps you to write your summary for a{' '}
                    <span className="text-corporate-amber-600 dark:text-corporate-amber-400 font-medium">targeted job position</span>.
                    Strange result? Just regenerate!
                  </p>
                </div>

                {/* Position Toggle & Dropdown */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                        Position Highlight
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-corporate-navy-500 dark:text-gray-400">from resume</span>
                        <Switch
                          checked={summaryData.positionHighlight}
                          onCheckedChange={(checked) => update('positionHighlight', checked)}
                          disabled={isSaving}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-corporate-gold-500 data-[state=checked]:to-corporate-amber-500"
                        />
                      </div>
                    </div>

                    <div className={`
                      flex items-center rounded-lg border-2 transition-all duration-200
                      ${!summaryData.positionHighlight ? 'opacity-50' : ''}
                      ${'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'}
                      ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                    `}>
                      <Target className="h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 mr-2 flex-shrink-0" />
                      <select
                        value={summaryData.position}
                        onChange={(e) => update('position', e.target.value)}
                        disabled={!summaryData.positionHighlight || isSaving}
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