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
  FileDown,
  Minus,
  Plus
} from 'lucide-react';

export interface CoverLetterSettings {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly textColor: string;
  readonly template: string;
  readonly zoom?: number;
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
        <div className="flex items-center">
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

      {/* Expanding Adjustments Panel */}
      {activeDropdown === 'adjustments' && (
        <div className="border-t border-slate-200 dark:border-gray-600 bg-surface-1-1">
          <div className="flex select-none flex-wrap items-center justify-start gap-y-2 font-semibold opacity-1 py-2 px-6 transition-all duration-300 ease-in-out">
            {/* Font Size Controls */}
            <div className="flex items-center">
              <button
                onClick={() => onSettingChange('fontSize', Math.max(8, settings.fontSize - 1))}
                className="relative flat block h-[32px] min-w-[36px] rounded-md text-[16px] disabled:hover:bg-transparent [&:not(.flat)]:disabled:bg-neutral-100 [&:not(.flat)]:disabled:text-neutral-400 hover:bg-neutral-200/50 [&:not(.flat)]:hover:bg-neutral-200/50 [&:not(.flat)]:bg-neutral-100 flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
                <div className="normal-case pointer-events-none h-fit z-50 bg-surface-3 px-2 py-1 text-sm font-normal leading-5 text-surface-3-label transition-opacity rounded before:border-surface-3 before:absolute before:border-[6px] before:border-l-transparent before:border-r-transparent before:border-t-transparent before:left-1/2 before:-translate-x-1/2 before:-top-[12px] w-fit min-w-fit whitespace-pre opacity-0 absolute">
                  Decrease font size
                </div>
              </button>
              <div className="w-7 text-center text-[16px]">
                <span className="text-[12px]">{settings.fontSize}</span>
              </div>
              <button
                onClick={() => onSettingChange('fontSize', Math.min(24, settings.fontSize + 1))}
                className="relative flat block h-[32px] min-w-[36px] rounded-md text-[16px] disabled:hover:bg-transparent [&:not(.flat)]:disabled:bg-neutral-100 [&:not(.flat)]:disabled:text-neutral-400 hover:bg-neutral-200/50 [&:not(.flat)]:hover:bg-neutral-200/50 [&:not(.flat)]:bg-neutral-100 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
                <div className="normal-case pointer-events-none h-fit z-50 bg-surface-3 px-2 py-1 text-sm font-normal leading-5 text-surface-3-label transition-opacity rounded before:border-surface-3 before:absolute before:border-[6px] before:border-l-transparent before:border-r-transparent before:border-t-transparent before:left-1/2 before:-translate-x-1/2 before:-top-[12px] w-fit min-w-fit whitespace-pre opacity-0 absolute">
                  Increase font size
                </div>
              </button>
            </div>

            <hr className="mx-1 h-6 border-l border-surface-2-stroke" />

            {/* Line Height Control */}
            <div className="flex items-center">
              <div className="group relative origin-bottom-left text-[16px]">
                <button
                  className="flex h-[32px] w-full items-center rounded-md px-[8px] hover:bg-button-text-hover disabled:hover:bg-transparent hover:bg-neutral-200/50"
                  onClick={() => {
                    const nextHeight = settings.lineHeight === 1.0 ? 1.5 : settings.lineHeight === 1.5 ? 2.0 : 1.0;
                    onSettingChange('lineHeight', nextHeight);
                  }}
                >
                  <Type className="w-[18px] h-[18px] flex items-center justify-center" />
                  <span className="font-semibold uppercase w-fit text-center text-[12px]">
                    <div className="px-1">{settings.lineHeight.toFixed(1)}</div>
                  </span>
                  <ChevronDown className="w-[18px] h-[18px] flex items-center justify-center" />
                  <div className="normal-case pointer-events-none h-fit z-50 bg-surface-3 px-2 py-1 text-sm font-normal leading-5 text-surface-3-label transition-opacity rounded before:border-surface-3 before:absolute before:border-[6px] before:border-l-transparent before:border-r-transparent before:border-t-transparent before:left-1/2 before:-translate-x-1/2 before:-top-[12px] w-fit min-w-fit whitespace-pre opacity-0 absolute">
                    Line height
                  </div>
                </button>
              </div>
            </div>

            <hr className="mx-1 h-6 border-l border-surface-2-stroke" />

            {/* Zoom Control */}
            <div className="flex items-center">
              <div className="group relative origin-bottom-left text-[16px]">
                <button
                  className="flex h-[32px] w-full items-center rounded-md px-[8px] hover:bg-button-text-hover disabled:hover:bg-transparent hover:bg-neutral-200/50"
                  onClick={() => {
                    const currentZoomPercent = Math.round((settings.zoom || 1) * 100);
                    const nextZoom = currentZoomPercent === 100 ? 1.17 : currentZoomPercent === 117 ? 1.5 : 1.0;
                    onSettingChange('zoom', nextZoom);
                  }}
                >
                  <span className="font-semibold uppercase w-fit text-center text-[12px]">
                    <div className="px-1">{Math.round((settings.zoom || 1) * 100)}%</div>
                  </span>
                  <ChevronDown className="w-[18px] h-[18px] flex items-center justify-center" />
                  <div className="normal-case pointer-events-none h-fit z-50 bg-surface-3 px-2 py-1 text-sm font-normal leading-5 text-surface-3-label transition-opacity rounded before:border-surface-3 before:absolute before:border-[6px] before:border-l-transparent before:border-r-transparent before:border-t-transparent before:left-1/2 before:-translate-x-1/2 before:-top-[12px] w-fit min-w-fit whitespace-pre opacity-0 absolute">
                    Zoom
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}));

CoverLetterHeaderBar.displayName = 'CoverLetterHeaderBar';

export default CoverLetterHeaderBar;