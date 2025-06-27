// src/components/layout/cover-letter-header-bar.tsx
import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, memo } from 'react';
import {
  ChevronDown,
  FileText,
  Download,
  Settings,
  Palette,
  Type,
  AlignLeft,
  FileDown
} from 'lucide-react';

export interface CoverLetterSettings {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly textColor: string;
  readonly template: string;
}

export interface CoverLetterHeaderBarRef {
  closeAllDropdowns: () => void;
}

export interface CoverLetterHeaderBarProps {
  settings: CoverLetterSettings;
  onSettingChange: (setting: keyof CoverLetterSettings, value: CoverLetterSettings[keyof CoverLetterSettings]) => void;
  onDownloadPDF?: () => Promise<void> | void;
  onDownloadDOCX?: () => Promise<void> | void;
  onTemplateChange?: (template: string) => Promise<void> | void;
  isDarkMode?: boolean;
  disabled?: boolean;
  className?: string;
}

type DropdownId = 'download' | 'adjustments';

const FONT_OPTIONS = [
  { value: 'Georgia', label: 'Georgia', category: 'serif' },
  { value: 'Times New Roman', label: 'Times New Roman', category: 'serif' },
  { value: 'Arial', label: 'Arial', category: 'sans-serif' },
  { value: 'Helvetica', label: 'Helvetica', category: 'sans-serif' },
  { value: 'Calibri', label: 'Calibri', category: 'sans-serif' }
] as const;

const TEMPLATE_OPTIONS = [
  'Professional',
  'Modern',
  'Traditional',
  'Creative',
  'Executive'
] as const;

const CoverLetterHeaderBar = memo(forwardRef<CoverLetterHeaderBarRef, CoverLetterHeaderBarProps>(({
  settings,
  onSettingChange,
  onDownloadPDF,
  onDownloadDOCX,
  onTemplateChange,
  isDarkMode = false,
  disabled = false,
  className = ''
}, ref) => {
  const [activeDropdown, setActiveDropdown] = useState<DropdownId | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback((dropdownId: DropdownId) => {
    setActiveDropdown(current => current === dropdownId ? null : dropdownId);
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  useImperativeHandle(ref, () => ({
    closeAllDropdowns
  }), [closeAllDropdowns]);

  const handleAsync = useCallback(async (
    key: string,
    asyncFn: () => Promise<void> | void
  ) => {
    try {
      setLoadingStates(prev => ({ ...prev, [key]: true }));
      await asyncFn();
    } catch (error) {
      console.error(`Error in ${key}:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const handleDownloadPDF = useCallback(() =>
    handleAsync('downloadPDF', () => onDownloadPDF?.()),
    [handleAsync, onDownloadPDF]
  );

  const handleDownloadDOCX = useCallback(() =>
    handleAsync('downloadDOCX', () => onDownloadDOCX?.()),
    [handleAsync, onDownloadDOCX]
  );

  const handleTemplateChange = useCallback((template: string) => {
    handleAsync('templateChange', () => onTemplateChange?.(template));
    closeAllDropdowns();
  }, [handleAsync, onTemplateChange, closeAllDropdowns]);

  const themeClasses = 'bg-white/95 dark:bg-gray-800 backdrop-blur-sm border-slate-200 dark:border-gray-600 text-gray-900 dark:text-gray-100';

  return (
    <div
      ref={containerRef}
      className={`${themeClasses} rounded-lg border shadow-sm flex-shrink-0 w-full mb-4 ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Adjustments */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('adjustments')}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            aria-label="Document adjustments"
            aria-expanded={activeDropdown === 'adjustments'}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Adjustments</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === 'adjustments' ? 'rotate-180' : ''}`} />
          </button>

          {activeDropdown === 'adjustments' && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg shadow-xl p-4 z-50 min-w-[280px]">
              {/* Template Selection */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 mb-2">
                  Template
                </label>
                <div className="space-y-1">
                  {TEMPLATE_OPTIONS.map(template => (
                    <button
                      key={template}
                      onClick={() => handleTemplateChange(template)}
                      className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        settings.template === template 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                {/* Font Selection */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 mb-2">
                    Font
                  </label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => onSettingChange('fontFamily', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    style={{ fontFamily: settings.fontFamily }}
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 mb-2">
                    Font Size: {settings.fontSize}pt
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="14"
                    step="0.5"
                    value={settings.fontSize}
                    onChange={(e) => onSettingChange('fontSize', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Line Height */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 mb-2">
                    Line Height: {settings.lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => onSettingChange('lineHeight', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => onSettingChange('textColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{settings.textColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Download Button */}
        <div className="relative flex">
          <button
            onClick={handleDownloadPDF}
            disabled={loadingStates.downloadPDF}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-l-md transition-colors disabled:opacity-50"
            aria-label="Download PDF"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF</span>
            {loadingStates.downloadPDF && (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
          </button>

          <button
            onClick={() => toggleDropdown('download')}
            className="px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md border-l border-blue-700 transition-colors"
            aria-label="More download options"
            aria-expanded={activeDropdown === 'download'}
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {activeDropdown === 'download' && (
            <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg shadow-xl py-2 z-50 min-w-[180px]">
              <button
                onClick={() => {
                  handleDownloadDOCX();
                  toggleDropdown('download');
                }}
                disabled={loadingStates.downloadDOCX}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Download .DOCX</span>
                {loadingStates.downloadDOCX && (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-auto" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}));

CoverLetterHeaderBar.displayName = 'CoverLetterHeaderBar';

export default CoverLetterHeaderBar;