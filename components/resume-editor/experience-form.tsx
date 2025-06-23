'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Sparkles, Save } from "lucide-react";

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bulletPoints: string[];
}

interface ExperienceFormProps {
  initialData: ExperienceEntry[];
  onSave: (data: ExperienceEntry[]) => Promise<void>;
  autoSave?: boolean;
}

const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-'].includes(trimmed) ? '' : trimmed;
};

export default function ExperienceForm({ initialData, onSave, autoSave = false }: ExperienceFormProps) {
  const [entries, setEntries] = useState<ExperienceEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Set<string>>>({});

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #9ca3af;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #4a5568;
      }
      .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #5a6578;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const cleaned = initialData.map(e => {
      // Parse bullet points from description if bulletPoints array is empty
      let bulletPoints = e.bulletPoints?.filter(Boolean) || [];

      if (bulletPoints.length === 0 && e.description) {
        // Split by various bullet point formats: •, -, *, or newline followed by these
        const points = e.description
          .split(/(?:^|\n)\s*[•\-\*]\s*|(?<=[.!?])\s*•\s*/)
          .map(point => point.trim())
          .filter(point => point.length > 0);

        // If no bullet points found, try splitting by sentences for very long descriptions
        if (points.length === 1 && points[0].length > 150) {
          const sentences = points[0]
            .split(/(?<=[.!?])\s+(?=[A-Z])/)
            .filter(s => s.trim().length > 0);

          bulletPoints = sentences.length > 1 ? sentences : points;
        } else {
          bulletPoints = points;
        }
      }

      return {
        ...e,
        company: cleanValue(e.company),
        title: cleanValue(e.title),
        location: cleanValue(e.location),
        startDate: cleanValue(e.startDate),
        endDate: cleanValue(e.endDate),
        bulletPoints
      };
    });

    setEntries(cleaned.length ? cleaned : [{
      id: `${Date.now()}`,
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      bulletPoints: []
    }]);
  }, [initialData]);

  const current = entries[activeIndex];
  if (!current) return null;

  const validate = (entry: ExperienceEntry): Set<string> => {
    const errs = new Set<string>();
    if (!entry.company) errs.add('company');
    if (!entry.title) errs.add('title');
    if (!entry.startDate) errs.add('startDate');
    if (!entry.current && !entry.endDate) errs.add('endDate');
    return errs;
  };

  const update = (field: keyof ExperienceEntry, value: any) => {
    setEntries(prev => prev.map((e, i) => i === activeIndex ? { ...e, [field]: value } : e));

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
    entries.forEach(e => {
      const errs = validate(e);
      if (errs.size > 0) allErrors[e.id] = errs;
    });

    if (Object.keys(allErrors).length) {
      setErrors(allErrors);
      return;
    }

    setSaving(true);
    try {
      // Format entries with description field for backward compatibility
      const formattedEntries = entries
        .filter(e => e.company && e.title)
        .map(entry => ({
          ...entry,
          description: entry.bulletPoints.length > 0
            ? entry.bulletPoints
                .filter(point => point.trim().length > 0)
                .map(point => `• ${point.trim()}`)
                .join(' ')
            : ''
        }));

      await onSave(formattedEntries);
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  };

  const addBulletPoint = () => {
    update('bulletPoints', [...current.bulletPoints, '']);
    // Scroll to bottom of bullet points after adding
    setTimeout(() => {
      const container = document.querySelector('.custom-scrollbar');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  };

  const updateBulletPoint = (index: number, value: string) => {
    const updated = [...current.bulletPoints];
    updated[index] = value;
    update('bulletPoints', updated);
  };

  const removeBulletPoint = (index: number) => {
    update('bulletPoints', current.bulletPoints.filter((_, i) => i !== index));
  };

  const err = errors[current.id] || new Set();

  const headerTitle = current.title && current.company
    ? `${current.title} ${current.company}, ${current.startDate} - ${current.endDate || 'Present'}`
    : "New Experience Entry";

  return (
    <div className="bg-white dark:bg-[#2c3442] rounded-lg overflow-hidden border border-gray-200 dark:border-transparent shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-b border-gray-200 dark:border-[#1e252f]">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white font-medium">
            {headerTitle}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {activeIndex + 1} / {entries.length}
            </span>
            <button
              onClick={() => setActiveIndex(Math.min(entries.length - 1, activeIndex + 1))}
              disabled={activeIndex === entries.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            {entries.length > 1 && (
              <>
                <div className="w-px h-5 bg-gray-300 dark:bg-[#3a4452] mx-1" />
                <button
                  onClick={() => {
                    setEntries(prev => prev.filter((_, i) => i !== activeIndex));
                    setActiveIndex(Math.max(0, activeIndex - 1));
                  }}
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
        {/* Role */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            WHAT WAS YOUR ROLE AT {current.company || 'COMPANY'}? *
          </label>
          <input
            value={current.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Software Engineer"
            className={`
              w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 
              transition-all duration-200
              ${err.has('title') 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
            `}
          />
          {err.has('title') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">This field is required</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            FOR WHICH COMPANY DID YOU WORK? *
          </label>
          <input
            value={current.company}
            onChange={(e) => update('company', e.target.value)}
            placeholder="Company A"
            className={`
              w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 
              transition-all duration-200
              ${err.has('company') 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
            `}
          />
          {err.has('company') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">This field is required</p>
          )}
        </div>

        {/* Date and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              HOW LONG WERE YOU WITH {current.company || 'COMPANY'}?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  value={current.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  placeholder="June 2021"
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                    text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none focus:ring-2 
                    transition-all duration-200
                    ${err.has('startDate') 
                      ? 'border-red-500 focus:ring-red-500/30' 
                      : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
                  `}
                />
                {err.has('startDate') && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">Required</p>
                )}
              </div>
              <div className="relative">
                <input
                  value={current.current ? 'Present' : current.endDate}
                  onChange={(e) => update('endDate', e.target.value)}
                  placeholder="Present"
                  disabled={current.current}
                  className={`
                    w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                    text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none focus:ring-2 
                    transition-all duration-200
                    ${current.current ? 'opacity-60' : ''}
                    ${err.has('endDate') && !current.current 
                      ? 'border-red-500 focus:ring-red-500/30' 
                      : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
                  `}
                />
                {err.has('endDate') && !current.current && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">Required</p>
                )}
                <label className="absolute -top-5 right-0 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={current.current}
                    onChange={(e) => {
                      update('current', e.target.checked);
                      if (e.target.checked) update('endDate', 'Present');
                    }}
                    className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e252f] text-blue-600 dark:text-blue-500 focus:ring-blue-500/50"
                  />
                  Current
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              WHERE WAS {current.company || 'COMPANY'} LOCATED?
            </label>
            <input
              value={current.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="New York, NY"
              className="
                w-full px-4 py-3 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                transition-colors
              "
            />
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              WHAT DID YOU DO AT {current.company || 'COMPANY'}?
              {current.bulletPoints.length > 0 && (
                <span className="ml-2 text-gray-500 dark:text-gray-500 normal-case">
                  ({current.bulletPoints.length} achievement{current.bulletPoints.length !== 1 ? 's' : ''})
                </span>
              )}
            </label>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {current.bulletPoints.map((point, index) => (
              <div key={index} className="flex gap-3 group">
                <span className="text-gray-600 dark:text-gray-400 mt-1 select-none">•</span>
                <textarea
                  value={point}
                  onChange={(e) => updateBulletPoint(index, e.target.value)}
                  placeholder="Describe your achievement or responsibility..."
                  rows={Math.min(4, Math.ceil(point.length / 80) || 2)}
                  autoFocus={index === current.bulletPoints.length - 1 && point === ''}
                  className="
                    flex-1 px-3 py-2 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
                    text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    transition-colors
                  "
                />
                <button
                  onClick={() => removeBulletPoint(index)}
                  className="
                    opacity-0 group-hover:opacity-100 mt-2
                    text-gray-500 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400
                    transition-all
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {current.bulletPoints.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-500 text-sm italic mb-4">
                  No bullet points added yet. Add your achievements below.
                </p>
                <button
                  onClick={addBulletPoint}
                  className="
                    inline-flex items-center gap-2 px-4 py-2
                    bg-gray-50 dark:bg-[#1e252f] hover:bg-gray-100 dark:hover:bg-[#252d3a]
                    border border-gray-300 dark:border-[#3a4452] rounded-md
                    text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                    transition-colors
                  "
                >
                  <Plus className="h-4 w-4" />
                  Add your first achievement
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={addBulletPoint}
              className="
                flex items-center gap-2 px-5 py-2.5
                bg-blue-600 hover:bg-blue-700 text-white
                rounded-md font-medium text-sm
                transition-colors
              "
            >
              <Sparkles className="h-4 w-4" />
              GENERATE BULLET
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-t border-gray-200 dark:border-[#1e252f] flex justify-between items-center">
        <button
          onClick={() => {
            setEntries([...entries, {
              id: `${Date.now()}`,
              company: '',
              title: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              description: '',
              bulletPoints: []
            }]);
            setActiveIndex(entries.length);
          }}
          className="
            text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
            flex items-center gap-2
            transition-colors
          "
        >
          <Plus className="h-4 w-4" />
          Add Another Position
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            flex items-center gap-2 px-6 py-2.5
            bg-blue-600 hover:bg-blue-700 text-white
            rounded-md font-medium text-sm uppercase tracking-wide
            transition-all
            ${saving ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          {saving ? 'SAVING...' : 'SAVE TO EXPERIENCE LIST'}
        </button>
      </div>
    </div>
  );
}