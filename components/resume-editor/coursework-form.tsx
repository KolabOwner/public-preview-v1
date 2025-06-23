'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Loader2, PlusCircle, ChevronLeft, ChevronRight, AlertCircle, Plus, X, Calendar, GraduationCap, Lightbulb, PenTool } from "lucide-react";

export interface CourseworkEntry {
  id: string;
  courseName: string;
  institution: string;
  date: string;
  skill: string;
  application: string;
}

interface CourseworkFormProps {
  initialData: any[]; // Accept any format from database
  onSave: (data: CourseworkEntry[]) => Promise<void>;
  autoSave?: boolean;
}

const cleanValue = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  const emptyValues = ['n/a', 'N/A', 'none', 'None', 'NONE', 'null', 'NULL', '-', '--', 'NA', 'na', 'undefined'];
  return emptyValues.includes(trimmed) ? '' : trimmed;
};

export default function CourseworkForm({ initialData, onSave, autoSave = false }: CourseworkFormProps) {
  const [courseworkEntries, setCourseworkEntries] = useState<CourseworkEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Set<string>>>({});
  const [toast, setToast] = useState({ show: false, message: '', error: false });

  useEffect(() => {
    const processedData = initialData.map((course: any) => ({
      id: course.id || `course-${Date.now()}-${Math.random()}`,
      courseName: cleanValue(course.courseName || course.name || course.title) || "",
      institution: cleanValue(course.institution || course.school || course.university) || "",
      date: cleanValue(course.date || course.year || course.when) || "",
      skill: cleanValue(course.skill || course.skillLearned || course.keySkill) || "",
      application: cleanValue(course.application || course.howApplied || course.description) || ""
    }));

    setCourseworkEntries(processedData.length > 0 ? processedData : [{
      id: `course-${Date.now()}`,
      courseName: '',
      institution: '',
      date: '',
      skill: '',
      application: ''
    }]);
    setCurrentEntryIndex(0);
  }, [initialData]);

  const current = courseworkEntries[currentEntryIndex];
  if (!current) return null;

  const validate = (entry: CourseworkEntry): Set<string> => {
    const errs = new Set<string>();
    if (!entry.courseName.trim()) errs.add('courseName');
    if (!entry.institution.trim()) errs.add('institution');
    if (!entry.date.trim()) errs.add('date');
    if (!entry.skill.trim()) errs.add('skill');
    return errs;
  };

  const update = (field: keyof CourseworkEntry, value: string) => {
    setCourseworkEntries(prev => prev.map((e, i) => i === currentEntryIndex ? { ...e, [field]: value } : e));

    // Clear field error
    setErrors(prev => {
      const next = { ...prev };
      if (next[current.id]) {
        next[current.id].delete(field);
        if (next[current.id].size === 0) delete next[current.id];
      }
      return next;
    });
  };

  const handleSave = async () => {
    const allErrors: Record<string, Set<string>> = {};
    courseworkEntries.forEach(e => {
      const errs = validate(e);
      if (errs.size > 0) allErrors[e.id] = errs;
    });

    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      setToast({ show: true, message: 'Please fill required fields', error: true });
      setTimeout(() => setToast({ show: false, message: '', error: false }), 2000);
      return;
    }

    setIsSaving(true);
    try {
      const validEntries = courseworkEntries.filter(e => e.courseName.trim() && e.institution.trim());
      await onSave(validEntries);
      setToast({ show: true, message: 'Coursework saved successfully', error: false });
    } catch {
      setToast({ show: true, message: 'Failed to save', error: true });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast({ show: false, message: '', error: false }), 2000);
    }
  };

  const addCourseworkEntry = () => {
    setCourseworkEntries([...courseworkEntries, {
      id: `course-${Date.now()}`,
      courseName: '',
      institution: '',
      date: '',
      skill: '',
      application: ''
    }]);
    setCurrentEntryIndex(courseworkEntries.length);
  };

  const removeCurrentEntry = () => {
    if (courseworkEntries.length <= 1) return;
    setCourseworkEntries(prev => prev.filter((_, i) => i !== currentEntryIndex));
    setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1));
  };

  const err = errors[current.id] || new Set();
  const headerTitle = current.courseName || `Coursework ${currentEntryIndex + 1}`;

  return (
    <div className="bg-white dark:bg-[#2c3442] rounded-lg overflow-hidden border border-gray-200 dark:border-transparent shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-b border-gray-200 dark:border-[#1e252f]">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {headerTitle}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1))}
              disabled={currentEntryIndex === 0}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {currentEntryIndex + 1} / {courseworkEntries.length}
            </span>
            <button
              onClick={() => setCurrentEntryIndex(Math.min(courseworkEntries.length - 1, currentEntryIndex + 1))}
              disabled={currentEntryIndex === courseworkEntries.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            {courseworkEntries.length > 1 && (
              <>
                <div className="w-px h-5 bg-gray-300 dark:bg-[#3a4452] mx-1" />
                <button
                  onClick={removeCurrentEntry}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6">
        {/* Course Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            WHAT WAS THE COURSE <span className="font-bold">NAME</span>? <span className="text-red-500">*</span>
          </label>
          <input
            value={current.courseName}
            onChange={(e) => update('courseName', e.target.value)}
            placeholder="Introduction to Computer Systems"
            className={`
              w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 
              transition-all duration-200
              ${err.has('courseName') 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
            `}
          />
          {err.has('courseName') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
        </div>

        {/* Institution */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            <span className="font-bold">WHERE</span> DID YOU TAKE THE COURSE? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              value={current.institution}
              onChange={(e) => update('institution', e.target.value)}
              placeholder="University of Wisconsin, Madison"
              className={`
                w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 
                transition-all duration-200
                ${err.has('institution') 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
              `}
            />
          </div>
          {err.has('institution') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            <span className="font-bold">WHEN</span> DID YOU TAKE THE COURSE? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              value={current.date}
              onChange={(e) => update('date', e.target.value)}
              placeholder="2025"
              className={`
                w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 
                transition-all duration-200
                ${err.has('date') 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
              `}
            />
          </div>
          {err.has('date') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
        </div>

        {/* Key Skill */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            WHAT <span className="font-bold">SKILL</span> DID YOU USE? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              value={current.skill}
              onChange={(e) => update('skill', e.target.value)}
              placeholder="Teamwork"
              className={`
                w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 
                transition-all duration-200
                ${err.has('skill') 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
              `}
            />
          </div>
          {err.has('skill') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
        </div>

        {/* Skill Application */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            HOW WAS THAT SKILL <span className="font-bold">APPLIED</span>?
          </label>
          <div className="relative">
            <PenTool className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <textarea
              value={current.application}
              onChange={(e) => update('application', e.target.value)}
              placeholder="• Coordinating on code with a small group of people&#10;• Weekly team meetings to discuss progress and challenges&#10;• Collaborative problem-solving on complex algorithms&#10;• Peer code reviews and constructive feedback"
              rows={5}
              className="
                w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none
                transition-colors
              "
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Describe specific examples of how you applied this skill during the course.
          </p>
        </div>

        {/* Course Preview Card */}
        {(current.courseName || current.skill) && (
          <div className="bg-gray-50 dark:bg-[#1e252f] rounded-lg p-4 border border-gray-200 dark:border-[#3a4452]">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-[#2c3442] rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {current.courseName || "Course Name"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {current.institution && <span>{current.institution}</span>}
                  {current.institution && current.date && <span className="mx-2">•</span>}
                  {current.date && <span>{current.date}</span>}
                </p>
                {current.skill && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {current.skill}
                    </span>
                  </div>
                )}
                {current.application && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">
                    {current.application}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-t border-gray-200 dark:border-[#1e252f] flex justify-between items-center">
        <button
          onClick={addCourseworkEntry}
          className="
            text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
            flex items-center gap-2
            transition-colors
          "
        >
          <Plus className="h-4 w-4" />
          Add Another Course
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            flex items-center gap-2 px-6 py-2.5
            bg-blue-600 hover:bg-blue-700 text-white
            rounded-md font-medium text-sm uppercase tracking-wide
            transition-all
            ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              SAVING...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              SAVE TO COURSEWORK LIST
            </>
          )}
        </button>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`
          fixed bottom-4 right-4 px-3 py-2 rounded-md shadow-lg text-white text-sm
          transform transition-all duration-300 z-50
          ${toast.error ? 'bg-red-600' : 'bg-green-600'}
        `}>
          {toast.message}
        </div>
      )}
    </div>
  );
}