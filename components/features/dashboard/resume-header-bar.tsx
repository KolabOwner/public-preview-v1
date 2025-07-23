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
  FileText,
  Minus,
  Plus,
  Type,
  Palette,
  AlignLeft,
  Indent,
  FileDown,
  Share2,
  Eye,
  User,
  Settings,
  Zap,
  MoreHorizontal
} from "lucide-react";



import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal, Separator } from "@radix-ui/react-dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Switch } from "@radix-ui/react-switch";
import { Button } from "@/components/shared/button";
import {Label} from "@radix-ui/react-label";
import TemplateGallerySidebar from "@/components/features/dashboard/template-gallery-sidebar";

// ==================== TYPES & INTERFACES ====================

export interface DocumentSettings {
  readonly zoom: number;
  readonly fontFamily: string;
  readonly primaryColor: string;
  readonly textColor: string;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly sectionSpacing: number;
  readonly paperSize: string;
  readonly margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  readonly showIcons: boolean;
  readonly showDividers: boolean;
  readonly useIndent: boolean;
  readonly viewAsPages: boolean;
}

export interface ResumeHeaderBarRef {
  expand: () => void;
  collapse: () => void;
  toggle: () => void;
  closeAllDropdowns: () => void;
}

export interface ResumeHeaderBarProps {
  documentSettings: DocumentSettings;
  onDocumentSettingChange:
    (setting: keyof DocumentSettings, value: DocumentSettings[keyof DocumentSettings]) => void;
  onDownloadPDF?: () => Promise<void> | void;
  onDownloadDOCX?: () => Promise<void> | void;
  onSaveToDrive?: () => Promise<void> | void;
  onAutoAdjust?: () => Promise<void> | void;
  onTemplateChange?: (template: string) => Promise<void> | void;
  sectionOrder?: string[];
  onSectionOrderChange?: (newOrder: string[]) => void;
  isDarkMode?: boolean;
  isAutoAdjusting?: boolean;
  disabled?: boolean;
  className?: string;
  selectedTemplate?: string;
  resumeId?: string;
  "data-testid"?: string;
}

type DropdownId =
  | "download"
  | "font"
  | "lineHeight"
  | "sectionSpacing"
  | "paperSize"
  | "margins"
  | "zoom"
  | "textColor"
  | "accentColor"
  | "sectionOrder";

// ==================== CONSTANTS ====================

const FONT_OPTIONS = [
  { value: "Merriweather", label: "Merriweather", category: "serif" },
  {
    value: "Source Sans Pro",
    label: "Source Sans Pro",
    category: "sans-serif",
  },
  { value: "Roboto", label: "Roboto", category: "sans-serif" },
  { value: "Georgia", label: "Georgia", category: "serif" },
  { value: "Arial", label: "Arial", category: "sans-serif" },
  { value: "Times New Roman", label: "Times New Roman", category: "serif" },
  { value: "Helvetica", label: "Helvetica", category: "sans-serif" },
] as const;


const PAPER_SIZE_OPTIONS = [
  { value: "Letter", label: "Letter (8.5×11)", dimensions: "8.5×11" },
  { value: "A4", label: "A4 (210×297mm)", dimensions: "210×297mm" },
  { value: "Legal", label: "Legal (8.5×14)", dimensions: "8.5×14" },
] as const;

const LINE_HEIGHT_OPTIONS = [1, 1.15, 1.2, 1.5, 1.8, 2] as const;
const SECTION_SPACING_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

const MARGIN_OPTIONS = [
  { value: 0.5, label: "Narrow", description: "0.5 inch" },
  { value: 0.75, label: "Normal", description: "0.75 inch" },
  { value: 1, label: "Wide", description: "1 inch" },
  { value: 1.25, label: "Extra Wide", description: "1.25 inch" },
] as const;

const ZOOM_CONFIG = {
  MIN: 50,
  MAX: 200,
  STEP: 5,
  DEFAULT: 120,
} as const;

const FONT_SIZE_CONFIG = {
  MIN: 6,
  MAX: 16,
  STEP: 0.5,
} as const;

// ==================== CUSTOM HOOKS ====================

const useDropdownManager = () => {
  const [activeDropdown, setActiveDropdown] = useState<DropdownId | null>(null);

  const toggleDropdown = useCallback((dropdownId: DropdownId) => {
    setActiveDropdown((current) => (current === dropdownId ? null : dropdownId));
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setActiveDropdown(null);
  }, []);


  return {
    activeDropdown,
    toggleDropdown,
    closeAllDropdowns,
  };
};

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

const ResumeHeaderBar = memo(
  forwardRef<ResumeHeaderBarRef, ResumeHeaderBarProps>(
    (
      {
        documentSettings,
        onDocumentSettingChange,
        onDownloadPDF,
        onDownloadDOCX,
        onSaveToDrive,
        onAutoAdjust,
        onTemplateChange,
        selectedTemplate,
        resumeId,
        isAutoAdjusting = false,
        disabled = false,
        className = "",
        "data-testid": testId = "resume-header-bar",
      },
      ref
    ) => {
      const [isExpanded, setIsExpanded] = useState(false);
      const [isTemplateSidebarOpen, setIsTemplateSidebarOpen] = useState(false);
      const {
        toggleDropdown,
        closeAllDropdowns,
      } = useDropdownManager();
      const { loadingStates, handleAsync } = useAsyncHandler();

      useImperativeHandle(
        ref,
        () => ({
          expand: () => setIsExpanded(true),
          collapse: () => setIsExpanded(false),
          toggle: () => setIsExpanded((prev) => !prev),
          closeAllDropdowns: () => {
            closeAllDropdowns();
            setIsTemplateSidebarOpen(false);
          },
        }),
        [closeAllDropdowns]
      );

      const handleSettingChange = useCallback(<K extends keyof DocumentSettings>(
        key: K,
        value: DocumentSettings[K]
      ) => {
        onDocumentSettingChange(key, value);
      }, [onDocumentSettingChange]);

      const handleFontSizeChange = useCallback(
        (delta: number) => {
          const newSize = Math.max(
            FONT_SIZE_CONFIG.MIN,
            Math.min(FONT_SIZE_CONFIG.MAX, documentSettings.fontSize + delta)
          );
          handleSettingChange("fontSize", newSize);
        },
        [documentSettings.fontSize, handleSettingChange]
      );

      const handleZoomChange = useCallback(
        (newZoom: number) => {
          const clampedZoom = Math.max(
            ZOOM_CONFIG.MIN,
            Math.min(ZOOM_CONFIG.MAX, newZoom)
          );
          handleSettingChange("zoom", clampedZoom);
        },
        [handleSettingChange]
      );

      const handleAsyncClick = (key: string, asyncFn?: () => Promise<void> | void) => handleAsync(key, asyncFn);

      const themeClasses = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700";
      const expandedPanelClasses = "bg-gray-50/80 dark:bg-gray-900/60 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700";
      const buttonBaseClasses = "bg-white dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs tracking-wide";
      const dropdownMenuClasses = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200";
      const dropdownItemClasses = "focus:bg-gray-100 dark:focus:bg-gray-700";

      return (
        <TooltipProvider>
          <div
            className={`${themeClasses} rounded-lg border shadow-lg flex-shrink-0 w-full mb-4 relative transition-all duration-200 ${
              disabled ? "opacity-50 pointer-events-none" : ""
            } ${className}`}
            style={{ position: "relative", zIndex: 1 }}
            data-testid={testId}
          >
            {/* Main Toolbar */}
            <div className="flex flex-row flex-wrap items-center justify-between gap-4 px-4 py-4 xl:flex-nowrap">
              {/* Left Section */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleAsyncClick("autoAdjust", onAutoAdjust)}
                      variant="outline"
                      size="sm"
                      disabled={isAutoAdjusting || loadingStates.autoAdjust}
                      aria-label="Auto-adjust resume formatting"
                      className={`${buttonBaseClasses} gap-2`}
                    >
                      <Zap size={16} />
                      <span>Auto-adjust</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Automatically optimize resume layout</TooltipContent>
                </Tooltip>

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

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsTemplateSidebarOpen(true)}
                      variant="outline"
                      size="sm"
                      className={`${buttonBaseClasses} gap-2`}
                    >
                      <FileText size={16}/>
                      <span>Templates</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Browse resume templates</TooltipContent>
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
                        className={`${dropdownMenuClasses} min-w-[180px] p-2 rounded-md shadow-lg border z-50`}
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
                          <DropdownMenuItem
                            onClick={() => handleAsyncClick("saveToDrive", onSaveToDrive)}
                            disabled={loadingStates.saveToDrive}
                            className={`${dropdownItemClasses} gap-2 px-3 py-2 text-sm rounded cursor-pointer outline-none flex items-center`}
                          >
                          <Share2 size={16}/>
                          <span>Save to Drive</span>
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
              <div className="px-6 flex flex-wrap items-center gap-4" role="toolbar">
                  {/* Display Options */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => handleSettingChange("showIcons", !documentSettings.showIcons)} variant={documentSettings.showIcons ? "secondary" : "ghost"} size="icon" className="w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-700">
                          <Eye />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{documentSettings.showIcons ? "Hide" : "Show"} section icons</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => handleSettingChange("showDividers", !documentSettings.showDividers)} variant={documentSettings.showDividers ? "secondary" : "ghost"} size="icon" className="w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-700">
                           <MoreHorizontal className="rotate-90" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{documentSettings.showDividers ? "Hide" : "Show"} section dividers</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => handleSettingChange("useIndent", !documentSettings.useIndent)} variant={documentSettings.useIndent ? "secondary" : "ghost"} size="icon" className="w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-700">
                          <Indent />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{documentSettings.useIndent ? "Disable" : "Enable"} paragraph indentation</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                       <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Profile picture options">
                           <User />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent>Add or edit profile picture</TooltipContent>
                    </Tooltip>
                  </div>
                  <Separator className="h-6 bg-gray-300 dark:bg-gray-600" />

                  {/* Font Controls */}
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className={`${buttonBaseClasses} w-36 justify-between`}>
                              <span className="truncate">{documentSettings.fontFamily}</span>
                              <ChevronDown />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Font Family</TooltipContent>
                      </Tooltip>
                      <DropdownMenuPortal>
                        <DropdownMenuContent
                          className={`${dropdownMenuClasses} min-w-[200px] p-2 rounded-md shadow-lg border z-50`}
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
                          <Button onClick={() => handleFontSizeChange(-FONT_SIZE_CONFIG.STEP)} variant="ghost" size="icon" className="w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={documentSettings.fontSize <= FONT_SIZE_CONFIG.MIN}>
                            <Minus />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Decrease font size</TooltipContent>
                      </Tooltip>
                      <div className="w-8 text-center text-sm font-semibold">{documentSettings.fontSize}pt</div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button onClick={() => handleFontSizeChange(FONT_SIZE_CONFIG.STEP)} variant="ghost" size="icon" className="w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={documentSettings.fontSize >= FONT_SIZE_CONFIG.MAX}>
                            <Plus />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Increase font size</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <Separator className="h-6 bg-gray-300 dark:bg-gray-600" />

                  {/* Spacing Controls */}
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                             <Button variant="outline" size="sm" className={`${buttonBaseClasses} w-28 justify-between`}>
                                <AlignLeft />
                                <span>{documentSettings.lineHeight}</span>
                                <ChevronDown />
                              </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Line Height</TooltipContent>
                      </Tooltip>
                      <DropdownMenuPortal>
                        <DropdownMenuContent
                          className={`${dropdownMenuClasses} min-w-[120px] p-2 rounded-md shadow-lg border z-50`}
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
                    <DropdownMenu>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className={`${buttonBaseClasses} w-28 justify-between`}>
                                 <MoreHorizontal />
                                 <span>{documentSettings.sectionSpacing}</span>
                                 <ChevronDown />
                               </Button>
                           </DropdownMenuTrigger>
                         </TooltipTrigger>
                         <TooltipContent>Section Spacing</TooltipContent>
                       </Tooltip>
                      <DropdownMenuPortal>
                        <DropdownMenuContent
                          className={`${dropdownMenuClasses} min-w-[120px] p-2 rounded-md shadow-lg border z-50`}
                          sideOffset={4}
                          align="start"
                        >
                          {SECTION_SPACING_OPTIONS.map((spacing) => (
                            <DropdownMenuItem
                              key={spacing}
                              onClick={() => handleSettingChange("sectionSpacing", spacing)}
                              className={`${dropdownItemClasses} px-3 py-2 text-sm rounded cursor-pointer outline-none`}
                            >
                              {spacing}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenuPortal>
                    </DropdownMenu>
                  </div>
                  <Separator className="h-6 bg-gray-300 dark:bg-gray-600" />

                  {/* Page Layout Controls */}
                  <div className="flex items-center gap-1">
                      <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className={`${buttonBaseClasses} w-32 justify-between`}>
                                    <span>{documentSettings.paperSize}</span>
                                    <ChevronDown/>
                                  </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Paper Size</TooltipContent>
                          </Tooltip>
                          <DropdownMenuPortal>
                            <DropdownMenuContent
                              className={`${dropdownMenuClasses} min-w-[180px] p-2 rounded-md shadow-lg border z-50`}
                              sideOffset={4}
                              align="start"
                            >
                                {PAPER_SIZE_OPTIONS.map(opt => (
                                    <DropdownMenuItem
                                      key={opt.value}
                                      onClick={() => handleSettingChange('paperSize', opt.value)}
                                      className={`${dropdownItemClasses} px-3 py-2 text-sm rounded cursor-pointer outline-none`}
                                    >
                                        {opt.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenuPortal>
                      </DropdownMenu>
                       <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className={`${buttonBaseClasses} w-32 justify-between`}>
                                    <span>Margins</span>
                                    <ChevronDown/>
                                  </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Page Margins</TooltipContent>
                          </Tooltip>
                          <DropdownMenuPortal>
                            <DropdownMenuContent
                              className={`${dropdownMenuClasses} min-w-[200px] p-2 rounded-md shadow-lg border z-50`}
                              sideOffset={4}
                              align="start"
                            >
                                {MARGIN_OPTIONS.map(opt => (
                                    <DropdownMenuItem
                                      key={opt.value}
                                      onClick={() => handleSettingChange('margins', { top: opt.value, right: opt.value, bottom: opt.value, left: opt.value })}
                                      className={`${dropdownItemClasses} px-3 py-2 text-sm rounded cursor-pointer outline-none`}
                                    >
                                        {opt.label} ({opt.description})
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenuPortal>
                      </DropdownMenu>
                  </div>
                  <Separator className="h-6 bg-gray-300 dark:bg-gray-600" />

                  {/* Color Pickers */}
                  <div className="flex items-center gap-2">
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Label htmlFor="text-color-picker" className="cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                                  <Type />
                                  <div className="w-5 h-1 mt-0.5 rounded-sm" style={{ backgroundColor: documentSettings.textColor, border: '1px solid hsl(var(--border))' }}/>
                                  <input id="text-color-picker" type="color" value={documentSettings.textColor} onChange={(e) => handleSettingChange('textColor', e.target.value)} className="sr-only"/>
                              </Label>
                          </TooltipTrigger>
                          <TooltipContent>Text Color</TooltipContent>
                      </Tooltip>
                       <Tooltip>
                          <TooltipTrigger asChild>
                              <Label htmlFor="accent-color-picker" className="cursor-pointer rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                                  <Palette />
                                  <div className="w-5 h-1 mt-0.5 rounded-sm" style={{ backgroundColor: documentSettings.primaryColor, border: '1px solid hsl(var(--border))' }}/>
                                  <input id="accent-color-picker" type="color" value={documentSettings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} className="sr-only"/>
                              </Label>
                          </TooltipTrigger>
                          <TooltipContent>Accent Color</TooltipContent>
                      </Tooltip>
                  </div>
                  <Separator className="h-6 bg-gray-300 dark:bg-gray-600" />

                  {/* Zoom & View Toggle */}
                  <div className="flex items-center gap-2">
                      <div className="flex items-center">
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button onClick={() => handleZoomChange(documentSettings.zoom - ZOOM_CONFIG.STEP)} variant="ghost" size="icon" className="w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={documentSettings.zoom <= ZOOM_CONFIG.MIN}>
                                      <Minus/>
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent>Zoom Out</TooltipContent>
                          </Tooltip>
                          <div className="w-12 text-center text-sm font-semibold">{documentSettings.zoom}%</div>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button onClick={() => handleZoomChange(documentSettings.zoom + ZOOM_CONFIG.STEP)} variant="ghost" size="icon" className="w-8 h-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={documentSettings.zoom >= ZOOM_CONFIG.MAX}>
                                      <Plus/>
                                  </Button>
                              </TooltipTrigger>
                              <TooltipContent>Zoom In</TooltipContent>
                          </Tooltip>
                      </div>
                       <div className="flex items-center space-x-2">
                        <Switch id="view-as-pages-toggle" checked={documentSettings.viewAsPages} onCheckedChange={(checked) => handleSettingChange('viewAsPages', checked)} />
                        <Label htmlFor="view-as-pages-toggle" className="text-xs">Pages</Label>
                      </div>
                  </div>

              </div>
            </div>
          </div>

          {/* Template Gallery Sidebar */}
          <TemplateGallerySidebar
            isOpen={isTemplateSidebarOpen}
            onClose={() => setIsTemplateSidebarOpen(false)}
            onTemplateChange={onTemplateChange}
            selectedTemplate={selectedTemplate}
            disabled={disabled}
            resumeId={resumeId}
          />
        </TooltipProvider>
      );
    }
  )
);

ResumeHeaderBar.displayName = "ResumeHeaderBar";
export default ResumeHeaderBar;
