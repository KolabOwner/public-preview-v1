// src/components/features/dashboard/cover-letter-header-bar.tsx
'use client';

import React, {
  useState,
  useCallback,
  memo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  ChevronDown,
  Minus,
  Plus,
  Type,
  AlignLeft,
  FileDown,
  Settings,
} from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal, Separator } from "@radix-ui/react-dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Button } from "@/components/shared/button";
import { Label } from "@radix-ui/react-label";

// ==================== TYPES & INTERFACES ====================

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
  isDarkMode?: boolean;
  disabled?: boolean;
  className?: string;
}

// ==================== CONSTANTS ====================

const FONT_OPTIONS = [
  { value: "Georgia", label: "Georgia", category: "serif" },
  { value: "Times New Roman", label: "Times New Roman", category: "serif" },
  { value: "Arial", label: "Arial", category: "sans-serif" },
  { value: "Helvetica", label: "Helvetica", category: "sans-serif" },
  { value: "Roboto", label: "Roboto", category: "sans-serif" },
  { value: "Source Sans Pro", label: "Source Sans Pro", category: "sans-serif" },
] as const;

const LINE_HEIGHT_OPTIONS = [1.0, 1.15, 1.2, 1.5, 1.8, 2.0] as const;

const ZOOM_OPTIONS = [
  { value: 100, label: "100%" },
  { value: 117, label: "117%" },
  { value: 133, label: "133%" },
  { value: 150, label: "150%" },
] as const;

const FONT_SIZE_CONFIG = {
  MIN: 8,
  MAX: 24,
  STEP: 1,
} as const;

// ==================== CUSTOM HOOKS ====================

const useAsyncHandler = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleAsync = useCallback(
    async (
      key: string,
      asyncFn?: () => Promise<void> | void
    ) => {
      if (!asyncFn) return;
      try {
        setLoadingStates((prev) => ({ ...prev, [key]: true }));
        await asyncFn();
      } catch (error) {
        console.error(`Error in ${key}:`, error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    []
  );

  return { loadingStates, handleAsync };
};

// ==================== MAIN COMPONENT ====================

const CoverLetterHeaderBar = memo(
  forwardRef<CoverLetterHeaderBarRef, CoverLetterHeaderBarProps>(
    (
      {
        settings,
        onSettingChange,
        onDownloadPDF,
        onDownloadDOCX,
        isDarkMode = false,
        disabled = false,
        className = "",
      },
      ref
    ) => {
      const [isExpanded, setIsExpanded] = useState(false);
      const { loadingStates, handleAsync } = useAsyncHandler();

      useImperativeHandle(
        ref,
        () => ({
          closeAllDropdowns: () => {
            setIsExpanded(false);
          },
        }),
        []
      );

      const handleSettingChange = useCallback(<K extends keyof CoverLetterSettings>(
        key: K,
        value: CoverLetterSettings[K]
      ) => {
        onSettingChange(key, value);
      }, [onSettingChange]);

      const handleFontSizeChange = useCallback(
        (delta: number) => {
          const newSize = Math.max(
            FONT_SIZE_CONFIG.MIN,
            Math.min(FONT_SIZE_CONFIG.MAX, settings.fontSize + delta)
          );
          handleSettingChange("fontSize", newSize);
        },
        [settings.fontSize, handleSettingChange]
      );

      const handleAsyncClick = (key: string, asyncFn?: () => Promise<void> | void) => handleAsync(key, asyncFn);

      const themeClasses = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700";
      const expandedPanelClasses = "bg-gray-50/80 dark:bg-gray-900/60 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700";
      const buttonBaseClasses = "bg-white dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs tracking-wide";
      const dropdownMenuClasses = "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200";
      const dropdownItemClasses = "hover:bg-gray-100 dark:hover:bg-gray-700";

      // Calculate current zoom percentage
      const currentZoomPercent = settings.zoom ? Math.round(settings.zoom * 100) : 100;

      return (
        <TooltipProvider>
          <div
            className={`${themeClasses} rounded-lg border shadow-lg flex-shrink-0 w-full mb-4 relative transition-all duration-200 ${
              disabled ? "opacity-50 pointer-events-none" : ""
            } ${className}`}
            style={{ position: "relative", zIndex: 1 }}
          >
            {/* Main Toolbar */}
            <div className="flex flex-row flex-wrap items-center justify-between gap-4 px-4 py-4 xl:flex-nowrap">
              {/* Left Section */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsExpanded(!isExpanded)}
                      variant={isExpanded ? "secondary" : "outline"}
                      size="sm"
                      aria-expanded={isExpanded}
                      className={`${buttonBaseClasses} data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-700 gap-2`}
                    >
                      <Settings size={16}/>
                      <span>Adjustments</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isExpanded ? "Hide" : "Show"} adjustment options</TooltipContent>
                </Tooltip>

              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleAsyncClick("downloadPDF", onDownloadPDF)}
                        disabled={loadingStates.downloadPDF}
                        size="default"
                        className="rounded-r-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold tracking-wide gap-2"
                      >
                        <FileDown size={16}/>
                        <span>Download PDF</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download as PDF</TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" className="rounded-l-none w-8 border-l border-blue-700 bg-blue-600 hover:bg-blue-700 text-white">
                            <ChevronDown size={16}/>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>More download options</TooltipContent>
                    </Tooltip>
                    <DropdownMenuPortal>
                      <DropdownMenuContent
                        align="end"
                        className={`${dropdownMenuClasses} min-w-[180px] p-2 rounded-md shadow-lg z-50`}
                        sideOffset={4}
                      >
                        <DropdownMenuItem
                          onClick={() => handleAsyncClick("downloadDOCX", onDownloadDOCX)}
                          disabled={loadingStates.downloadDOCX}
                          className={`${dropdownItemClasses} gap-2 px-3 py-2 text-sm rounded cursor-pointer outline-none flex items-center`}
                        >
                          <FileDown size={16}/>
                          <span>Download .DOCX</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Expandable Settings Panel */}
            <div
              className={`${expandedPanelClasses} transition-all duration-300 ease-in-out ${
                isExpanded ? "py-3 opacity-100" : "py-0 opacity-0 max-h-0 overflow-hidden"
              }`}
              aria-hidden={!isExpanded}
            >
              <div className="px-6 flex flex-wrap items-center gap-3" role="toolbar">
                {/* Font Controls */}
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={`${buttonBaseClasses} w-32 justify-between`}>
                            <span className="truncate text-xs">{settings.fontFamily}</span>
                            <ChevronDown size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Font Family</TooltipContent>
                    </Tooltip>
                    <DropdownMenuPortal>
                      <DropdownMenuContent
                        className={`${dropdownMenuClasses} min-w-[200px] p-2 rounded-md shadow-lg z-50`}
                        sideOffset={4}
                        align="start"
                      >
                        {FONT_OPTIONS.map((font) => (
                          <DropdownMenuItem
                            key={font.value}
                            onClick={() => handleSettingChange("fontFamily", font.value)}
                            style={{ fontFamily: font.value }}
                            className={`${dropdownItemClasses} px-3 py-2 text-sm rounded cursor-pointer outline-none`}
                          >
                            {font.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  </DropdownMenu>

                  <div className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleFontSizeChange(-FONT_SIZE_CONFIG.STEP)}
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          disabled={settings.fontSize <= FONT_SIZE_CONFIG.MIN}
                        >
                          <Minus size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Decrease font size</TooltipContent>
                    </Tooltip>
                    <div className="w-12 text-center text-sm font-semibold">{settings.fontSize}pt</div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleFontSizeChange(FONT_SIZE_CONFIG.STEP)}
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          disabled={settings.fontSize >= FONT_SIZE_CONFIG.MAX}
                        >
                          <Plus size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Increase font size</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                {/* Line Height Control */}
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={`${buttonBaseClasses} w-24 justify-between`}>
                            <AlignLeft size={14} />
                            <span className="text-xs">{settings.lineHeight}</span>
                            <ChevronDown size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Line Height</TooltipContent>
                    </Tooltip>
                    <DropdownMenuPortal>
                      <DropdownMenuContent
                        className={`${dropdownMenuClasses} min-w-[120px] p-2 rounded-md shadow-lg z-50`}
                        sideOffset={4}
                        align="start"
                      >
                        {LINE_HEIGHT_OPTIONS.map((height) => (
                          <DropdownMenuItem
                            key={height}
                            onClick={() => handleSettingChange("lineHeight", height)}
                            className={`${dropdownItemClasses} px-3 py-2 text-sm rounded cursor-pointer outline-none`}
                          >
                            {height}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  </DropdownMenu>
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                {/* Text Color Picker */}
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="text-color-picker" className="cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1">
                        <Type size={16} />
                        <div className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: settings.textColor }}/>
                        <input
                          id="text-color-picker"
                          type="color"
                          value={settings.textColor}
                          onChange={(e) => handleSettingChange('textColor', e.target.value)}
                          className="sr-only"
                        />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>Text Color</TooltipContent>
                  </Tooltip>
                </div>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

                {/* Zoom Control */}
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={`${buttonBaseClasses} w-20 justify-between`}>
                            <span className="text-xs">{currentZoomPercent}%</span>
                            <ChevronDown size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Zoom</TooltipContent>
                    </Tooltip>
                    <DropdownMenuPortal>
                      <DropdownMenuContent
                        className={`${dropdownMenuClasses} min-w-[120px] p-2 rounded-md shadow-lg z-50`}
                        sideOffset={4}
                        align="start"
                      >
                        {ZOOM_OPTIONS.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleSettingChange("zoom", option.value / 100)}
                            className={`${dropdownItemClasses} px-3 py-2 text-sm rounded cursor-pointer outline-none`}
                          >
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>
      );
    }
  )
);

CoverLetterHeaderBar.displayName = "CoverLetterHeaderBar";
export default CoverLetterHeaderBar;