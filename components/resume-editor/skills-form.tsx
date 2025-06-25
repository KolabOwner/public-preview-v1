'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Save, Loader2, Info, ListChecks, ChevronLeft, ChevronRight, AlertCircle, Plus, X } from "lucide-react";

export interface SkillEntry {
  id: string;
  category: string;
  keywords: string;
}

interface SkillsFormProps {
  initialData: any[]; // Accept any format from database
  onSave: (data: SkillEntry[]) => Promise<void>;
  autoSave?: boolean;
}

const cleanValue = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  const emptyValues = ['n/a', 'N/A', 'none', 'None', 'NONE', 'null', 'NULL', '-', '--', 'NA', 'na', 'undefined'];
  return emptyValues.includes(trimmed) ? '' : trimmed;
};

export default function SkillsForm({ initialData, onSave, autoSave = false }: SkillsFormProps) {
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Set<string>>>({});
  const [toast, setToast] = useState({ show: false, message: '', error: false });

  useEffect(() => {
    const processedData = initialData.map((skill: any) => ({
      id: skill.id || `skill-${Date.now()}-${Math.random()}`,
      category: cleanValue(skill.category || skill.skillCategory || skill.name) || '',
      keywords: cleanValue(skill.keywords || skill.skills || skill.items) || ''
    }));

    setSkillEntries(processedData.length > 0 ? processedData : [{
      id: `skill-${Date.now()}`,
      category: '',
      keywords: ''
    }]);
    setCurrentEntryIndex(0);
  }, [initialData]);

  const current = skillEntries[currentEntryIndex];
  if (!current) return null;

  const validate = (entry: SkillEntry): Set<string> => {
    const errs = new Set<string>();
    if (!entry.category.trim()) errs.add('category');
    if (!entry.keywords.trim()) errs.add('keywords');
    return errs;
  };

  const update = (field: keyof SkillEntry, value: string) => {
    setSkillEntries(prev => prev.map((e, i) => i === currentEntryIndex ? { ...e, [field]: value } : e));

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
    skillEntries.forEach(e => {
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
      const validEntries = skillEntries.filter(e => e.category.trim() && e.keywords.trim());
      await onSave(validEntries);
      setToast({ show: true, message: 'Skills saved successfully', error: false });
    } catch {
      setToast({ show: true, message: 'Failed to save', error: true });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast({ show: false, message: '', error: false }), 2000);
    }
  };

  const addSkillEntry = () => {
    setSkillEntries([...skillEntries, {
      id: `skill-${Date.now()}`,
      category: '',
      keywords: ''
    }]);
    setCurrentEntryIndex(skillEntries.length);
  };

  const removeCurrentEntry = () => {
    if (skillEntries.length <= 1) return;
    setSkillEntries(prev => prev.filter((_, i) => i !== currentEntryIndex));
    setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1));
  };

  const err = errors[current.id] || new Set();
  const headerTitle = current.category || "New Skill Category";

  // Format keywords for display - show preview of skills
  const getSkillsPreview = (keywords: string): string => {
    const skills = keywords.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    if (skills.length === 0) return "";
    if (skills.length <= 3) return skills.join(", ");
    return `${skills.slice(0, 3).join(", ")} +${skills.length - 3} more`;
  };

  return (
    <div className="bg-white dark:bg-[#2c3442] rounded-lg overflow-hidden border border-gray-200 dark:border-transparent shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-b border-gray-200 dark:border-[#1e252f]">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>{headerTitle}</span>
            {current.keywords && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                • {getSkillsPreview(current.keywords)}
              </span>
            )}
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
              {currentEntryIndex + 1} / {skillEntries.length}
            </span>
            <button
              onClick={() => setCurrentEntryIndex(Math.min(skillEntries.length - 1, currentEntryIndex + 1))}
              disabled={currentEntryIndex === skillEntries.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            {skillEntries.length > 1 && (
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
        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            WHICH <span className="font-bold">CATEGORY</span> OF SKILLS? <span className="text-red-500">*</span>
          </label>
          <input
            value={current.category}
            onChange={(e) => update('category', e.target.value)}
            placeholder="e.g., Programming Languages, Design Tools, Soft Skills"
            className={`
              w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 
              transition-all duration-200
              ${err.has('category') 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
            `}
          />
          {err.has('category') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
        </div>

        {/* Keywords/Skills */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            WHAT <span className="font-bold">SKILLS</span> ARE IN THIS CATEGORY? <span className="text-red-500">*</span>
          </label>
          <textarea
            value={current.keywords}
            onChange={(e) => update('keywords', e.target.value)}
            placeholder="e.g., JavaScript, React, Node.js, TypeScript&#10;OR&#10;Figma&#10;Adobe XD&#10;Sketch&#10;Wireframing"
            rows={6}
            className={`
              w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 resize-none
              transition-all duration-200
              ${err.has('keywords') 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
            `}
          />
          {err.has('keywords') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
          <div className="mt-2 flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Enter skills separated by commas or on new lines. Group related skills together in each category.</span>
          </div>
        </div>

        {/* Skills Preview */}
        {current.keywords && (
          <div className="bg-gray-50 dark:bg-[#1e252f] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                SKILLS PREVIEW
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {current.keywords.split(/[,\n]/).map((skill, index) => {
                const trimmedSkill = skill.trim();
                if (!trimmedSkill) return null;
                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white dark:bg-[#2c3442] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#3a4452]"
                  >
                    {trimmedSkill}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-t border-gray-200 dark:border-[#1e252f] flex justify-between items-center">
        <button
          onClick={addSkillEntry}
          className="
            text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
            flex items-center gap-2
            transition-colors
          "
        >
          <Plus className="h-4 w-4" />
          Add Another Category
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
              SAVE SKILLS
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