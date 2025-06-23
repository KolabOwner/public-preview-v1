'use client';

import React, { useState, useEffect } from 'react';
import { Users, Save, Loader2, Info, PlusCircle, Trash2, ChevronLeft, ChevronRight, AlertCircle, MapPin, Building2, Plus, X, Sparkles } from "lucide-react";

export interface InvolvementEntry {
  id: string;
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bulletPoints: string[];
}

interface InvolvementFormProps {
  initialData: any[]; // Accept any format from database
  onSave: (data: InvolvementEntry[]) => Promise<void>;
  autoSave?: boolean;
}

const cleanValue = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  const emptyValues = ['n/a', 'N/A', 'none', 'None', 'NONE', 'null', 'NULL', '-', '--', 'NA', 'na', 'undefined'];
  return emptyValues.includes(trimmed) ? '' : trimmed;
};

export default function InvolvementForm({ initialData, onSave, autoSave = false }: InvolvementFormProps) {
  const [involvementEntries, setInvolvementEntries] = useState<InvolvementEntry[]>([]);
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
    const processedData = initialData.map((inv: any) => {
      // Parse bullet points from description if bulletPoints array is empty
      let bulletPoints = inv.bulletPoints?.filter(Boolean) || [];

      if (bulletPoints.length === 0 && inv.description) {
        // Split by various bullet point formats: •, -, *, or newline followed by these
        const points = inv.description
          .split(/(?:^|\n)\s*[•\-\*]\s*|(?<=[.!?])\s*•\s*/)
          .map((point: string) => point.trim())
          .filter((point: string) => point.length > 0);

        bulletPoints = points;
      }

      return {
        id: inv.id || `inv-${Date.now()}-${Math.random()}`,
        organization: cleanValue(inv.organization) || "",
        role: cleanValue(inv.role || inv.position) || "",
        location: cleanValue(inv.location) || "",
        startDate: cleanValue(inv.startDate) || "",
        endDate: cleanValue(inv.endDate) || "",
        current: inv.current || false,
        description: cleanValue(inv.description || inv.activities) || "",
        bulletPoints
      };
    });

    setInvolvementEntries(processedData.length > 0 ? processedData : [{
      id: `inv-${Date.now()}`,
      organization: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      bulletPoints: []
    }]);
    setCurrentEntryIndex(0);
  }, [initialData]);

  const current = involvementEntries[currentEntryIndex];
  if (!current) return null;

  const validate = (entry: InvolvementEntry): Set<string> => {
    const errs = new Set<string>();
    if (!entry.organization.trim()) errs.add('organization');
    if (!entry.role.trim()) errs.add('role');
    if (!entry.startDate.trim()) errs.add('startDate');
    if (!entry.current && !entry.endDate.trim()) errs.add('endDate');
    return errs;
  };

  const update = (field: keyof InvolvementEntry, value: any) => {
    setInvolvementEntries(prev => prev.map((e, i) => i === currentEntryIndex ? { ...e, [field]: value } : e));

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
    involvementEntries.forEach(e => {
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
      const formattedEntries = involvementEntries
        .filter(e => e.organization && e.role)
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
      setToast({ show: true, message: 'Involvement saved successfully', error: false });
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

  const addInvolvementEntry = () => {
    setInvolvementEntries([...involvementEntries, {
      id: `inv-${Date.now()}`,
      organization: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      bulletPoints: []
    }]);
    setCurrentEntryIndex(involvementEntries.length);
  };

  const removeCurrentEntry = () => {
    if (involvementEntries.length <= 1) return;
    setInvolvementEntries(prev => prev.filter((_, i) => i !== currentEntryIndex));
    setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1));
  };

  const err = errors[current.id] || new Set();

  const headerTitle = current.role && current.organization
    ? `${current.role} at ${current.organization}`
    : current.organization || "New Involvement";

  return (
    <div className="bg-white dark:bg-[#2c3442] rounded-lg overflow-hidden border border-gray-200 dark:border-transparent shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-b border-gray-200 dark:border-[#1e252f]">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
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
              {currentEntryIndex + 1} / {involvementEntries.length}
            </span>
            <button
              onClick={() => setCurrentEntryIndex(Math.min(involvementEntries.length - 1, currentEntryIndex + 1))}
              disabled={currentEntryIndex === involvementEntries.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            {involvementEntries.length > 1 && (
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
        {/* Organization & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              ORGANIZATION <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                value={current.organization}
                onChange={(e) => update('organization', e.target.value)}
                placeholder="e.g., Student Government Association"
                className={`
                  w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                  text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                  focus:outline-none focus:ring-2 
                  transition-all duration-200
                  ${err.has('organization') 
                    ? 'border-red-500 focus:ring-red-500/30' 
                    : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
                `}
              />
            </div>
            {err.has('organization') && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                This field is required
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              ROLE / POSITION <span className="text-red-500">*</span>
            </label>
            <input
              value={current.role}
              onChange={(e) => update('role', e.target.value)}
              placeholder="e.g., Treasurer, Volunteer, Team Captain"
              className={`
                w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 
                transition-all duration-200
                ${err.has('role') 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
              `}
            />
            {err.has('role') && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                This field is required
              </p>
            )}
          </div>
        </div>

        {/* Location & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              LOCATION
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                value={current.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="e.g., Boston, MA"
                className="
                  w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
                  text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50
                  transition-colors
                "
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              TIME PERIOD
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  value={current.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  placeholder="Sept 2022"
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
                  placeholder={current.current ? "Present" : "May 2023"}
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
        </div>

        {/* Activities Description */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              DESCRIPTION OF ACTIVITIES
              {current.bulletPoints.length > 0 && (
                <span className="ml-2 text-gray-500 dark:text-gray-500 normal-case">
                  ({current.bulletPoints.length} activit{current.bulletPoints.length !== 1 ? 'ies' : 'y'})
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
                  placeholder="Describe your responsibilities, achievements, and impact..."
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
                  No activities added yet. Add your involvement details below.
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
                  Add your first activity
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <Info className="h-4 w-4" />
            <span>Use bullet points to highlight specific achievements or responsibilities.</span>
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
          onClick={addInvolvementEntry}
          className="
            text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
            flex items-center gap-2
            transition-colors
          "
        >
          <Plus className="h-4 w-4" />
          Add Another Involvement
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
              SAVE INVOLVEMENT
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