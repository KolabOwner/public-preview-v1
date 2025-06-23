import React, { useState, useEffect } from 'react';
import { GraduationCap, CalendarIcon, Save, Loader2, AlertCircle, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { format, parseISO } from 'date-fns';

export interface EducationEntry {
  id: string;
  institution: string;
  qualification: string;
  location?: string;
  date: Date | null;
  dateFormat?: string;
  dateTS?: number;
  isGraduate?: boolean;
  minor?: string;
  score?: string;
  scoreType?: string;
  description?: string;
  details?: string; // Keep for backward compatibility
}

interface EducationFormProps {
  initialData: any[]; // Accept any format from database
  onSave: (data: EducationEntry[]) => Promise<void>;
  autoSave?: boolean;
}

const DATE_FORMAT_OPTIONS = [
  { value: "YYYY", label: "Year only (2024)" },
  { value: "MMMM YYYY", label: "Month Year (December 2024)" },
  { value: "MM/YYYY", label: "MM/YYYY (12/2024)" }
];

const cleanValue = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-', 'NA'].includes(trimmed) ? '' : trimmed;
};

export default function EducationForm({ initialData, onSave, autoSave = false }: EducationFormProps) {
  // Component handles multiple data formats:
  // 1. Standard EducationEntry format
  // 2. Firestore format with different field names (school, degree, etc.)
  // 3. RMS format with prefixed fields (rms_education_0_institution, etc.)
  // 4. Date as number (year only), Date object, or timestamp

  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Set<string>>>({});
  const [showCalendar, setShowCalendar] = useState(false);
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

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showCalendar && !target.closest('.date-picker-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  useEffect(() => {
    const processedData = initialData.map((edu: any) => {
      const parsedEntry: EducationEntry = {
        id: edu.id || `edu-${Date.now()}-${Math.random()}`,
        institution: cleanValue(edu.institution || edu.rms_education_0_institution || edu.school) || "",
        qualification: cleanValue(edu.qualification || edu.rms_education_0_qualification || edu.degree) || "",
        location: cleanValue(edu.location || edu.rms_education_0_location) || "",
        minor: cleanValue(edu.minor || edu.rms_education_0_minor || edu.fieldOfStudy) || "",
        score: cleanValue(edu.score || edu.rms_education_0_score || edu.gpa) || "",
        scoreType: cleanValue(edu.scoreType || edu.rms_education_0_scoreType || edu.gpaScale || "") || "",
        description: cleanValue(edu.description || edu.rms_education_0_description || edu.details) || "",
        isGraduate: edu.isGraduate !== undefined ? edu.isGraduate : (edu.rms_education_0_isGraduate !== undefined ? edu.rms_education_0_isGraduate : true),
        dateFormat: edu.dateFormat || edu.rms_education_0_dateFormat || "YYYY",
        dateTS: edu.dateTS || edu.rms_education_0_dateTS,
        date: null
      };

      // Handle date parsing - multiple formats
      const dateValue = edu.date || edu.rms_education_0_date;
      const tsValue = edu.dateTS || edu.rms_education_0_dateTS;

      if (tsValue && typeof tsValue === 'number') {
        // Use timestamp if available (it's in milliseconds)
        parsedEntry.date = new Date(tsValue);
      } else if (dateValue) {
        if (typeof dateValue === 'number') {
          // If date is just a year number (e.g., 2021)
          parsedEntry.date = new Date(dateValue, 0, 1); // January 1st of that year
        } else if (dateValue instanceof Date) {
          parsedEntry.date = dateValue;
        } else if (typeof dateValue === 'string') {
          try {
            parsedEntry.date = parseISO(dateValue);
          } catch (error) {
            // Try parsing as year
            const yearNum = parseInt(dateValue);
            if (!isNaN(yearNum) && yearNum > 1900 && yearNum < 2100) {
              parsedEntry.date = new Date(yearNum, 0, 1);
            }
          }
        }
      } else if (edu.endDate) {
        try {
          parsedEntry.date = typeof edu.endDate === 'string' ? parseISO(edu.endDate) : null;
        } catch (error) {
          console.error('Error parsing endDate:', error);
        }
      }

      return parsedEntry;
    });

    setEducationEntries(processedData.length > 0 ? processedData : [{
      id: `edu-${Date.now()}`,
      institution: "",
      qualification: "",
      date: null,
      dateFormat: "YYYY",
      isGraduate: true,
      description: "",
      location: "",
      minor: "",
      score: "",
      scoreType: "",
    }]);
    setCurrentEntryIndex(0);
  }, [initialData]);

  const current = educationEntries[currentEntryIndex];
  if (!current) return null;

  const validate = (entry: EducationEntry): Set<string> => {
    const errs = new Set<string>();
    if (!entry.institution.trim()) errs.add('institution');
    if (!entry.qualification.trim()) errs.add('qualification');
    if (!entry.date) errs.add('date');
    // Only require scoreType if score is provided
    if (entry.score && !entry.scoreType) errs.add('scoreType');
    return errs;
  };

  const update = (field: keyof EducationEntry, value: any) => {
    setEducationEntries(prev => prev.map((e, i) => i === currentEntryIndex ? { ...e, [field]: value } : e));

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
    educationEntries.forEach(e => {
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
      // Format entries for saving
      // Output format matches the RMS data structure:
      // - date: number (year only) when dateFormat is "YYYY"
      // - dateTS: timestamp in milliseconds
      // - All empty values are removed
      const formattedEntries = educationEntries
        .filter(e => e.institution && e.qualification)
        .map(entry => {
          const formatted: any = {
            ...entry,
            // Add timestamp
            dateTS: entry.date ? entry.date.getTime() : undefined,
          };

          // Store year as number if format is YYYY
          if (entry.dateFormat === 'YYYY' && entry.date) {
            formatted.date = entry.date.getFullYear();
          } else {
            formatted.date = entry.date;
          }

          // Clean empty values before saving
          const cleanedEntry: any = {};
          Object.entries(formatted).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
              cleanedEntry[key] = value;
            }
          });

          return cleanedEntry;
        });

      await onSave(formattedEntries);
      setToast({ show: true, message: 'Education saved successfully', error: false });
    } catch {
      setToast({ show: true, message: 'Failed to save', error: true });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast({ show: false, message: '', error: false }), 2000);
    }
  };

  const addEducationEntry = () => {
    setEducationEntries([...educationEntries, {
      id: `edu-${Date.now()}`,
      institution: "",
      qualification: "",
      date: null,
      dateFormat: "YYYY",
      isGraduate: true,
      description: "",
      location: "",
      minor: "",
      score: "",
      scoreType: "",
    }]);
    setCurrentEntryIndex(educationEntries.length);
  };

  const removeCurrentEntry = () => {
    if (educationEntries.length <= 1) return;
    setEducationEntries(prev => prev.filter((_, i) => i !== currentEntryIndex));
    setCurrentEntryIndex(Math.max(0, currentEntryIndex - 1));
  };

  const err = errors[current.id] || new Set();

  const getFormattedDateString = (date: Date | null, dateFormat: string | undefined): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "Pick a date";
    }

    try {
      switch (dateFormat) {
        case "YYYY":
          return date.getFullYear().toString();
        case "MM/YYYY":
          return format(date, "MM/yyyy");
        case "MMMM YYYY":
        default:
          return format(date, "MMMM yyyy");
      }
    } catch (error) {
      return "Pick a date";
    }
  };

  const headerTitle = current.qualification && current.institution
    ? `${current.qualification} at ${current.institution}`
    : "New Education Entry";

  return (
    <div className="bg-white dark:bg-[#2c3442] rounded-lg overflow-hidden border border-gray-200 dark:border-transparent shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-b border-gray-200 dark:border-[#1e252f]">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
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
              {currentEntryIndex + 1} / {educationEntries.length}
            </span>
            <button
              onClick={() => setCurrentEntryIndex(Math.min(educationEntries.length - 1, currentEntryIndex + 1))}
              disabled={currentEntryIndex === educationEntries.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#2c3442] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            {educationEntries.length > 1 && (
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
        {/* Institution & Qualification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              WHICH <span className="font-bold">INSTITUTION</span> DID YOU ATTEND? *
            </label>
            <input
              value={current.institution}
              onChange={(e) => update('institution', e.target.value)}
              placeholder="e.g., State University"
              className={`
                w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 
                transition-all duration-200
                ${err.has('institution') 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
              `}
            />
            {err.has('institution') && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                This field is required
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              WHAT <span className="font-bold">DEGREE</span> DID YOU EARN? *
            </label>
            <input
              value={current.qualification}
              onChange={(e) => update('qualification', e.target.value)}
              placeholder="e.g., B.S. in Computer Science"
              className={`
                w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 
                transition-all duration-200
                ${err.has('qualification') 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
              `}
            />
            {err.has('qualification') && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                This field is required
              </p>
            )}
          </div>
        </div>

        {/* Date & Date Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              WHEN DID YOU <span className="font-bold">GRADUATE</span>? *
            </label>
            <div className="relative date-picker-container">
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className={`
                  w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                  text-left flex items-center justify-between
                  focus:outline-none focus:ring-2 
                  transition-all duration-200
                  ${err.has('date') 
                    ? 'border-red-500 focus:ring-red-500/30' 
                    : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
                  ${!current.date ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}
                `}
              >
                <span className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {getFormattedDateString(current.date, current.dateFormat)}
                </span>
              </button>
              {showCalendar && (
                <div className="absolute z-50 mt-1 bg-white dark:bg-[#2c3442] border border-gray-200 dark:border-[#3a4452] rounded-md shadow-lg p-4">
                  {current.dateFormat === 'YYYY' ? (
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={current.date ? current.date.getFullYear().toString() : ''}
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        if (!isNaN(year) && year >= 1900 && year <= 2100) {
                          update('date', new Date(year, 0, 1));
                        }
                        setShowCalendar(false);
                      }}
                      placeholder="Year"
                      autoFocus
                      className="px-3 py-2 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md text-gray-900 dark:text-white w-32"
                    />
                  ) : (
                    <input
                      type="date"
                      value={current.date ? format(current.date, 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const newDate = e.target.value ? new Date(e.target.value) : null;
                        update('date', newDate);
                        setShowCalendar(false);
                      }}
                      autoFocus
                      className="px-3 py-2 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md text-gray-900 dark:text-white"
                    />
                  )}
                </div>
              )}
            </div>
            {err.has('date') && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                This field is required
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              HOW SHOULD THE <span className="font-bold">DATE</span> BE DISPLAYED?
            </label>
            <select
              value={current.dateFormat}
              onChange={(e) => update('dateFormat', e.target.value)}
              className="
                w-full px-4 py-3 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                transition-colors
              "
            >
              {DATE_FORMAT_OPTIONS.map(format => (
                <option key={format.value} value={format.value}>{format.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Minor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              WHERE IS THE <span className="font-bold">INSTITUTION</span> LOCATED?
            </label>
            <input
              value={current.location || ""}
              onChange={(e) => update('location', e.target.value)}
              placeholder="e.g., City, State"
              className="
                w-full px-4 py-3 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                transition-colors
              "
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              WHAT WAS YOUR <span className="font-bold">MINOR</span>?
            </label>
            <input
              value={current.minor || ""}
              onChange={(e) => update('minor', e.target.value)}
              placeholder="e.g., Mathematics"
              className="
                w-full px-4 py-3 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                transition-colors
              "
            />
          </div>
        </div>

        {/* Score & Score Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              WHAT <span className="font-bold">SCORE</span> DID YOU ACHIEVE?
            </label>
            <input
              value={current.score || ""}
              onChange={(e) => update('score', e.target.value)}
              placeholder="e.g., 3.8"
              className="
                w-full px-4 py-3 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                transition-colors
              "
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              WHAT <span className="font-bold">TYPE</span> OF SCORE IS IT?
              {current.score && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              value={current.scoreType || ""}
              onChange={(e) => update('scoreType', e.target.value)}
              placeholder="e.g., GPA, Percentage, out of 4.0"
              className={`
                w-full px-4 py-3 bg-white dark:bg-[#1e252f] border rounded-md
                text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
                focus:outline-none focus:ring-2 
                transition-colors
                ${err.has('scoreType') 
                  ? 'border-red-500 focus:ring-red-500/30' 
                  : 'border-gray-300 dark:border-[#3a4452] focus:ring-blue-500/50'}
              `}
            />
            {err.has('scoreType') && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Required when score is provided
              </p>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            ADDITIONAL <span className="font-bold">DETAILS</span>
          </label>
          <textarea
            value={current.description || ""}
            onChange={(e) => update('description', e.target.value)}
            placeholder="e.g., Thesis title, Relevant Coursework, Honors..."
            rows={3}
            className="
              w-full px-4 py-3 bg-white dark:bg-[#1e252f] border border-gray-300 dark:border-[#3a4452] rounded-md
              text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              transition-colors resize-none
            "
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-[#252d3a] border-t border-gray-200 dark:border-[#1e252f] flex justify-between items-center">
        <button
          onClick={addEducationEntry}
          className="
            text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
            flex items-center gap-2
            transition-colors
          "
        >
          <Plus className="h-4 w-4" />
          Add Another Education
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
              SAVE EDUCATION
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