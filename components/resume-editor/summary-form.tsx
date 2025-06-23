// components/resume/summary-form.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useResumeData } from "@/contexts/resume-data-context";
import { generateSummaryAPI } from '@/lib/features/api/summary';

export interface SummaryData {
  summary: string;
  positionHighlight: boolean;
  position: string;
  skillsHighlight: string;
}

interface SummaryFormProps {
  autoSave?: boolean;
  onSaveSuccess?: () => void;
}

const cleanValue = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  const emptyValues = ['n/a', 'N/A', 'none', 'None', 'NONE', 'null', 'NULL', '-', '--', 'NA', 'na', 'undefined'];
  return emptyValues.includes(trimmed) ? '' : trimmed;
};

export default function SummaryForm({ autoSave = false, onSaveSuccess }: SummaryFormProps) {
  const {
    resumeData,
    processedData,
    updateResumeData,
    saveResumeData,
    loading: contextLoading
  } = useResumeData();

  const [summaryData, setSummaryData] = useState<SummaryData>({
    summary: '',
    positionHighlight: true,
    position: '',
    skillsHighlight: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState({ show: false, message: '', error: false });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAlternatives, setAiAlternatives] = useState<string[]>([]);
  const [currentAlternativeIndex, setCurrentAlternativeIndex] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Helper function to get field value with both capitalizations
  const getResumeField = useCallback((fieldName: string): any => {
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
          summary: cleanValue(existingSummary) || prev.summary,
          positionHighlight: existingPositionHighlight !== undefined ? existingPositionHighlight !== false : prev.positionHighlight,
          position: cleanValue(existingTargetPosition) || positions[0] || prev.position,
          skillsHighlight: cleanValue(existingSkillsHighlight) || extractedSkills || prev.skillsHighlight
        };

        if (JSON.stringify(newData) !== JSON.stringify(prev)) {
          return newData;
        }
        return prev;
      });
    }
  }, [resumeData?.id]);

  const validate = (): boolean => {
    const errs = new Set<string>();
    if (!summaryData.summary.trim()) errs.add('summary');
    setErrors(errs);
    return errs.size === 0;
  };

  const update = (field: keyof SummaryData, value: any) => {
    setSummaryData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);

    if (errors.has(field)) {
      setErrors(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  const handleSave = useCallback(async () => {
    if (!validate()) {
      setToast({ show: true, message: 'Please write a professional summary', error: true });
      setTimeout(() => setToast({ show: false, message: '', error: false }), 3000);
      return;
    }

    setIsSaving(true);
    try {
      const useCapital = resumeData && Object.keys(resumeData).some(key => key.startsWith('Rms_'));

      const updates: any = {};
      updates[useCapital ? 'Rms_summary' : 'rms_summary'] = summaryData.summary;
      updates['summary_position_highlight'] = summaryData.positionHighlight;
      updates['summary_target_position'] = summaryData.positionHighlight ? summaryData.position : '';
      updates['summary_skills_highlight'] = summaryData.skillsHighlight;

      updateResumeData(updates);
      await saveResumeData();

      setHasChanges(false);
      setToast({ show: true, message: 'Summary saved successfully', error: false });

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('Save error:', error);
      setToast({ show: true, message: 'Failed to save summary', error: true });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast({ show: false, message: '', error: false }), 3000);
    }
  }, [summaryData, resumeData, updateResumeData, saveResumeData, onSaveSuccess, validate]);

  const handleAIWrite = async () => {
    const hasExperience = positions.length > 0;
    const hasSkills = extractedSkills.length > 0;

    if (!hasExperience && !hasSkills) {
      setToast({ show: true, message: 'Please add experience or skills to your resume first', error: true });
      setTimeout(() => setToast({ show: false, message: '', error: false }), 3000);
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
          fullName: resumeData['Rms_contact_fullName'] || '',
          email: resumeData['Rms_contact_email'] || ''
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

      setToast({ show: true, message: 'Summary generated successfully!', error: false });

      if (autoSave) {
        setTimeout(() => handleSave(), 500);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setToast({
        show: true,
        message: error instanceof Error ? error.message : 'Failed to generate summary',
        error: true
      });
    } finally {
      setAiLoading(false);
      setTimeout(() => setToast({ show: false, message: '', error: false }), 3000);
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

  // Auto-save effect
  useEffect(() => {
    if (autoSave && hasChanges && summaryData.summary && !errors.has('summary')) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [summaryData.summary, autoSave, hasChanges, handleSave]);

  const hasEnoughContent = positions.length > 0 || extractedSkills.length > 0;

  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading resume data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Summary Form */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
              WRITE A PROFESSIONAL <span className="font-bold">SUMMARY</span>
            </h3>

            <textarea
              value={summaryData.summary}
              onChange={(e) => update('summary', e.target.value)}
              placeholder="Experienced global early-stage executive with economics and mathematics degree from the University of Wisconsin. Passion for building inspiring companies people love through industry-leading design, development, branding, and making big bets."
              rows={6}
              className={`
                w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-md
                text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors duration-200
                ${errors.has('summary') 
                  ? 'border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'}
              `}
            />

            {/* AI Alternatives Navigation */}
            {showAlternatives && aiAlternatives.length > 1 && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Alternative {currentAlternativeIndex + 1} of {aiAlternatives.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigateAlternative('prev')}
                      disabled={currentAlternativeIndex === 0}
                      className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => navigateAlternative('next')}
                      disabled={currentAlternativeIndex === aiAlternatives.length - 1}
                      className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving || contextLoading}
                className={`
                  px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                  rounded-md font-medium text-sm uppercase tracking-wide
                  transition-colors duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              >
                {isSaving ? 'SAVING...' : 'SAVE SUMMARY INFO'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Writer */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              AI Summary Writer
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              AI writer helps you to write your summary for a{' '}
              <span className="text-blue-600 dark:text-blue-400">targeted job position</span>.
              Strange result? Just regenerate!
            </p>

            {/* Position Toggle & Dropdown */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">
                    POSITION HIGHLIGHT *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">from resume</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={summaryData.positionHighlight}
                        onChange={(e) => update('positionHighlight', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 dark:bg-gray-600 peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <select
                  value={summaryData.position}
                  onChange={(e) => update('position', e.target.value)}
                  disabled={!summaryData.positionHighlight}
                  className={`
                    w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border rounded-md
                    text-gray-900 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors duration-200
                    ${!summaryData.positionHighlight ? 'opacity-50 cursor-not-allowed' : ''}
                    border-gray-300 dark:border-gray-600
                  `}
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

              {/* Skills Highlight */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase mb-3 block">
                  SKILLS HIGHLIGHT *
                </label>
                <input
                  type="text"
                  value={summaryData.skillsHighlight}
                  onChange={(e) => update('skillsHighlight', e.target.value)}
                  placeholder="Enter skill"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
              </div>

              {/* AI Writer Button */}
              <button
                onClick={handleAIWrite}
                disabled={aiLoading || !hasEnoughContent}
                className={`
                  w-full flex items-center justify-center gap-2 px-4 py-3
                  ${hasEnoughContent 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
                  rounded-md font-medium text-sm uppercase tracking-wide
                  transition-colors duration-200
                `}
              >
                <Sparkles className="h-4 w-4" />
                {aiLoading ? 'GENERATING...' : 'AI WRITER READY'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`
          fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg text-white text-sm
          transform transition-all duration-300 z-50
          ${toast.error ? 'bg-red-600' : 'bg-green-600'}
        `}>
          {toast.message}
        </div>
      )}
    </div>
  );
}