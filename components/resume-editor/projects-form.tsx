'use client';

import React, { useState, useEffect } from 'react';
import { Code2, Plus, X, ChevronLeft, ChevronRight, Sparkles, Save, Loader2, AlertCircle, ExternalLink, Calendar, Building2 } from "lucide-react";

export interface ProjectEntry {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  current: boolean;
  url: string;
  description: string;
  bulletPoints: string[];
}

interface ProjectsFormProps {
  initialData: any[]; // Accept any format from database
  onSave: (data: ProjectEntry[]) => Promise<void>;
  autoSave?: boolean;
}

const cleanValue = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  const emptyValues = ['n/a', 'N/A', 'none', 'None', 'NONE', 'null', 'NULL', '-', '--', 'NA', 'na', 'undefined'];
  return emptyValues.includes(trimmed) ? '' : trimmed;
};

export default function ProjectsForm({ initialData, onSave, autoSave = false }: ProjectsFormProps) {
  const [projectEntries, setProjectEntries] = useState<ProjectEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Set<string>>>({});
  const [toast, setToast] = useState({ show: false, message: '', error: false });

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
    const processedData = initialData.map((proj: any) => {
      // Parse bullet points from description if bulletPoints array is empty
      let bulletPoints = proj.bulletPoints?.filter(Boolean) || [];

      if (bulletPoints.length === 0 && proj.description) {
        // Split by various bullet point formats: •, -, *, or newline followed by these
        const points = proj.description
          .split(/(?:^|\n)\s*[•\-\*]\s*|(?<=[.!?])\s*•\s*/)
          .map((point: string) => point.trim())
          .filter((point: string) => point.length > 0);

        bulletPoints = points;
      }

      return {
        id: proj.id || `proj-${Date.now()}-${Math.random()}`,
        title: cleanValue(proj.title || proj.name || proj.projectName) || "",
        organization: cleanValue(proj.organization || proj.company || proj.client) || "",
        startDate: cleanValue(proj.startDate || proj.start) || "",
        endDate: cleanValue(proj.endDate || proj.end) || "",
        current: proj.current || false,
        url: cleanValue(proj.url || proj.projectUrl || proj.link) || "",
        description: cleanValue(proj.description) || "",
        bulletPoints
      };
    });

    setProjectEntries(processedData.length > 0 ? processedData : [{
      id: `proj-${Date.now()}`,
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      current: false,
      url: "",
      description: "",
      bulletPoints: []
    }]);
    setCurrentEntryIndex(0);
  }, [initialData]);

  const current = projectEntries[currentEntryIndex];
  if (!current) return null;

  const validate = (entry: ProjectEntry): Set<string> => {
    const errs = new Set<string>();
    if (!entry.title.trim()) errs.add('title');
    if (!entry.organization.trim()) errs.add('organization');
    if (!entry.startDate.trim()) errs.add('startDate');
    if (!entry.current && !entry.endDate.trim()) errs.add('endDate');
    return errs;
  };

  const update = (field: keyof ProjectEntry, value: any) => {
    setProjectEntries(prev => prev.map((e, i) => i === currentEntryIndex ? { ...e, [field]: value } : e));

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
    projectEntries.forEach(e => {
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
      // Format entries with description field for backward compatibility
      const formattedEntries = projectEntries
        .filter(e => e.title && e.organization)
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
      setToast({ show: true, message: 'Projects saved successfully', error: false });
    } catch {
      setToast({ show: true, message: 'Failed to save', error: true });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast({ show: false, message: '', error: false }), 2000);
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

  const addProjectEntry = () => {
    setProjectEntries([...projectEntries, {
      id: `proj-${Date.now()}`,
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      current: false,
      url: "",
      description: "",
      bulletPoints: []
    }]);
    setCurrentEntryIndex(projectEntries.length);
  };

  const removeCurrentEntry = () => {
    if (projectEntries.length <= 1) return;
    setProjectEntries(prev => prev.filter((_, i) => i !== currentEntryIndex));
    setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1));
  };

  const err = errors[current.id] || new Set();

  const headerTitle = current.title || "New Project";

  return (
    <div className="bg-white dark:bg-[#2c3442] rounded-lg overflow-hidden border border-gray-200 dark:border-transparent shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-b border-gray-200 dark:border-[#1e252f]">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
            <Code2 className="h-4 w-4" />
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
              {currentEntryIndex + 1} / {projectEntries.length}
            </span>
            <button
              onClick={() => setCurrentEntryIndex(Math.min(projectEntries.length - 1, currentEntryIndex + 1))}
              disabled={currentEntryIndex === projectEntries.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            {projectEntries.length > 1 && (
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
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            GIVE YOUR PROJECT A <span className="font-bold">TITLE</span> *
          </label>
          <input
            value={current.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Web-Based Musical Instrument"
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
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
        </div>

        {/* Organization */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            IN WHICH <span className="font-bold">ORGANIZATION</span> DID YOU DO {current.title || 'THIS PROJECT'}? *
          </label>
          <input
            value={current.organization}
            onChange={(e) => update('organization', e.target.value)}
            placeholder="Habitat for Humanity"
            className={`
              w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 
              transition-all duration-200
              ${err.has('organization') 
                ? 'border-red-500 focus:ring-red-500/30' 
                : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
            `}
          />
          {err.has('organization') && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              This field is required
            </p>
          )}
        </div>

        {/* Date and URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              <span className="font-bold">WHEN</span> DID YOU DO {current.title || 'THIS PROJECT'}?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  value={current.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  placeholder="June 2025"
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
                  placeholder="June 2025"
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
                  Ongoing
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              PROJECT <span className="font-bold">URL</span>
            </label>
            <div className="relative">
              <input
                value={current.url}
                onChange={(e) => update('url', e.target.value)}
                placeholder="https://www.example.com"
                className="
                  w-full pl-4 pr-10 py-3 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
                  text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  transition-colors
                "
              />
              {current.url && (
                <a
                  href={current.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              NOW DESCRIBE WHAT <span className="font-bold">YOU DID</span>
              {current.bulletPoints.length > 0 && (
                <span className="ml-2 text-gray-500 dark:text-gray-500 normal-case">
                  ({current.bulletPoints.length} bullet point{current.bulletPoints.length !== 1 ? 's' : ''})
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
                  placeholder="Describe what you did..."
                  rows={Math.min(3, Math.ceil(point.length / 80) || 2)}
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
                  No bullet points added yet. Add your project details below.
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
                  Add your first bullet point
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
          onClick={addProjectEntry}
          className="
            text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
            flex items-center gap-2
            transition-colors
          "
        >
          <Plus className="h-4 w-4" />
          Add Another Project
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
              SAVE TO PROJECT LIST
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