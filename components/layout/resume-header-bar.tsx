// src/components/layout/ResumeHeaderBar.tsx
import React, {
useState,
useRef,
useEffect,
useCallback,
useMemo,
memo,
forwardRef,
useImperativeHandle
} from 'react';
import {
ChevronDown,
FileText,
Download,
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
MoreHorizontal,
Settings,
Zap
} from 'lucide-react';

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
resumeScore?: number;
documentSettings: DocumentSettings;
onDocumentSettingChange: (setting: keyof DocumentSettings, value: DocumentSettings[keyof DocumentSettings]) => void;
onDownloadPDF?: () => Promise<void> | void;
onDownloadDOCX?: () => Promise<void> | void;
onSaveToDrive?: () => Promise<void> | void;
onAutoAdjust?: () => Promise<void> | void;
onTemplateChange?: (template: string) => Promise<void> | void;
onExploreScore?: () => void;
sectionOrder?: string[];
onSectionOrderChange?: (newOrder: string[]) => void;
isDarkMode?: boolean;
isAutoAdjusting?: boolean;
disabled?: boolean;
className?: string;
'data-testid'?: string;
}

type DropdownId =
| 'template'
| 'download'
| 'font'
| 'lineHeight'
| 'sectionSpacing'
| 'paperSize'
| 'margins'
| 'zoom'
| 'textColor'
| 'accentColor'
| 'sectionOrder';

type ButtonVariant = 'primary' | 'secondary' | 'active' | 'ghost';
type ButtonSize = 'xs' | 'sm' | 'md';

interface TooltipState {
text: string;
x: number;
y: number;
visible: boolean;
}

// ==================== CONSTANTS ====================

const FONT_OPTIONS = [
{ value: 'Merriweather', label: 'Merriweather', category: 'serif' },
{ value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'sans-serif' },
{ value: 'Roboto', label: 'Roboto', category: 'sans-serif' },
{ value: 'Georgia', label: 'Georgia', category: 'serif' },
{ value: 'Arial', label: 'Arial', category: 'sans-serif' },
{ value: 'Times New Roman', label: 'Times New Roman', category: 'serif' },
{ value: 'Helvetica', label: 'Helvetica', category: 'sans-serif' }
] as const;

const TEMPLATE_OPTIONS = [
'Professional',
'Modern',
'Creative',
'Minimal',
'Executive',
'Academic',
'Technical'
] as const;

const PAPER_SIZE_OPTIONS = [
{ value: 'Letter', label: 'Letter (8.5×11)', dimensions: '8.5×11' },
{ value: 'A4', label: 'A4 (210×297mm)', dimensions: '210×297mm' },
{ value: 'Legal', label: 'Legal (8.5×14)', dimensions: '8.5×14' }
] as const;

const LINE_HEIGHT_OPTIONS = [1, 1.15, 1.2, 1.5, 1.8, 2] as const;
const SECTION_SPACING_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

const MARGIN_OPTIONS = [
  { value: 0.5, label: 'Narrow', description: '0.5 inch' },
  { value: 0.75, label: 'Normal', description: '0.75 inch' },
  { value: 1, label: 'Wide', description: '1 inch' },
  { value: 1.25, label: 'Extra Wide', description: '1.25 inch' }
] as const;

const ZOOM_CONFIG = {
MIN: 50,
MAX: 200,
STEP: 5,
DEFAULT: 120
} as const;

const FONT_SIZE_CONFIG = {
MIN: 6,
MAX: 16,
STEP: 0.5
} as const;

// ==================== CUSTOM HOOKS ====================

const useDropdownManager = () => {
const [activeDropdown, setActiveDropdown] = useState<DropdownId | null>(null);
const containerRef = useRef<HTMLDivElement>(null);
const timeoutRef = useRef<NodeJS.Timeout>();

const openDropdown = useCallback((dropdownId: DropdownId) => {
  setActiveDropdown(dropdownId);
}, []);

const closeDropdown = useCallback(() => {
  setActiveDropdown(null);
}, []);

const toggleDropdown = useCallback((dropdownId: DropdownId) => {
  setActiveDropdown(current => current === dropdownId ? null : dropdownId);
}, []);

const closeAllDropdowns = useCallback(() => {
  setActiveDropdown(null);
}, []);

// Enhanced click outside detection
useEffect(() => {
  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    const target = event.target as Node;
    if (containerRef.current && !containerRef.current.contains(target)) {
      closeDropdown();
    }
  };

  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDropdown();
    }
  };

  if (activeDropdown) {
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleEscapeKey);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('touchstart', handleClickOutside);
    document.removeEventListener('keydown', handleEscapeKey);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, [activeDropdown, closeDropdown]);

return {
  activeDropdown,
  openDropdown,
  closeDropdown,
  toggleDropdown,
  closeAllDropdowns,
  containerRef
};
};

const useTooltipManager = () => {
const [tooltip, setTooltip] = useState<TooltipState>({
  text: '',
  x: 0,
  y: 0,
  visible: false
});
const timeoutRef = useRef<NodeJS.Timeout>();

const showTooltip = useCallback((text: string, event: React.MouseEvent | MouseEvent) => {
  // Early return if no text
  if (!text || !event) {
    return;
  }

  // Clear any existing timeout
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  // Capture the rect immediately while event is still valid
  const target = event.currentTarget as Element;
  if (!target) {
    console.warn('Tooltip target is null');
    return;
  }

  try {
    const rect = target.getBoundingClientRect();

    // Validate rect data
    if (!rect || typeof rect.left !== 'number' || typeof rect.bottom !== 'number') {
      console.warn('Invalid bounding rect for tooltip');
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setTooltip({
        text,
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
        visible: true
      });
    }, 500);
  } catch (error) {
    console.error('Error showing tooltip:', error);
  }
}, []);

const hideTooltip = useCallback(() => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }
  setTooltip(prev => ({ ...prev, visible: false }));
}, []);

useEffect(() => {
  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, []);

return { tooltip, showTooltip, hideTooltip };
};

const useAsyncHandler = () => {
const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

const handleAsync = useCallback(async (
  key: string,
  asyncFn: () => Promise<void> | void
) => {
  try {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    await asyncFn();
  } catch (error) {
    console.error(`Error in ${key}:`, error);
    // Could emit error event or show notification here
  } finally {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }
}, []);

return { loadingStates, handleAsync };
};

// ==================== UI COMPONENTS ====================

interface ActionButtonProps {
children: React.ReactNode;
onClick?: () => void;
variant?: ButtonVariant;
size?: ButtonSize;
disabled?: boolean;
loading?: boolean;
className?: string;
tooltip?: string;
onMouseEnter?: (e: React.MouseEvent) => void;
onMouseLeave?: () => void;
'aria-label'?: string;
'data-testid'?: string;
}

const ActionButton = memo<ActionButtonProps>(({
children,
onClick,
variant = 'secondary',
size = 'sm',
disabled = false,
loading = false,
className = '',
onMouseEnter,
onMouseLeave,
'aria-label': ariaLabel,
'data-testid': testId
}) => {
const baseClasses = "relative flex items-center justify-center font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none transition-all duration-200 whitespace-nowrap rounded-md";

const variantClasses = useMemo(() => ({
  primary: "bg-blue-600 active:bg-blue-700 text-white shadow-sm disabled:bg-blue-300",
  secondary: "bg-transparent active:bg-gray-200 text-gray-900 dark:text-gray-100 disabled:text-gray-400 dark:disabled:text-gray-500",
  active: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 shadow-inner disabled:bg-blue-50 dark:disabled:bg-blue-900/10",
  ghost: "bg-transparent text-gray-600 dark:text-gray-300 disabled:text-gray-300 dark:disabled:text-gray-600"
}), []);

const sizeClasses = useMemo(() => ({
  xs: "px-1.5 py-1 min-h-6 text-xs",
  sm: "px-2 py-1 min-h-8 text-xs",
  md: "px-3 py-2 min-h-9 text-sm"
}), []);

const computedClasses = useMemo(() =>
  `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
    (disabled || loading) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
  }`.trim(),
  [baseClasses, variantClasses, variant, sizeClasses, size, className, disabled, loading]
);

return (
  <button
    type="button"
    onClick={disabled || loading ? undefined : onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    disabled={disabled || loading}
    className={computedClasses}
    aria-label={ariaLabel}
    data-testid={testId}
  >
    {loading ? (
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      children
    )}
  </button>
);
});

ActionButton.displayName = 'ActionButton';

interface DropdownProps {
isOpen: boolean;
onClose: () => void;
children: React.ReactNode;
className?: string;
position?: 'left' | 'right' | 'center';
buttonRef?: React.RefObject<HTMLElement>;
}

const Dropdown = memo<DropdownProps>(({
isOpen,
onClose,
children,
className = '',
position = 'left',
buttonRef
}) => {
const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen && dropdownRef.current) {
    // Auto-focus first focusable element
    const firstFocusable = dropdownRef.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }
}, [isOpen]);

useEffect(() => {
  if (isOpen) {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef?.current && !buttonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }
}, [isOpen, onClose, buttonRef]);

if (!isOpen) return null;

const positionClasses = {
  left: 'left-0',
  right: 'right-0',
  center: 'left-1/2 -translate-x-1/2'
};

return (
  <div
    ref={dropdownRef}
    className={`absolute top-full mt-2 bg-white/95 dark:bg-gray-800 backdrop-blur-sm border border-slate-200 dark:border-gray-600 rounded-lg shadow-xl shadow-slate-300/30 dark:shadow-gray-900/50 py-2 z-[100] min-w-[200px] max-w-[300px] animate-in fade-in-0 zoom-in-95 duration-200 text-gray-900 dark:text-gray-100 ${positionClasses[position]} ${className}`}
    role="menu"
    aria-orientation="vertical"
  >
    {children}
  </div>
);
});

Dropdown.displayName = 'Dropdown';

interface ScoreCircleProps {
score: number;
onClick?: () => void;
size?: number;
strokeWidth?: number;
className?: string;
}

const ScoreCircle = memo<ScoreCircleProps>(({
score,
onClick,
size = 50,
strokeWidth = 7,
className = ''
}) => {
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference - (circumference * Math.max(0, Math.min(100, score))) / 100;

return (
  <div
    className={`relative cursor-pointer flex items-center justify-center transition-transform active:scale-95 ${className}`}
    style={{ width: size, height: size }}
    onClick={onClick}
    role="button"
    tabIndex={0}
    aria-label={`Resume score: ${score}%`}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    }}
  >
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        className="stroke-gray-200 dark:stroke-gray-600"
        r={radius}
        cy={size / 2}
        cx={size / 2}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <circle
        r={radius}
        cy={size / 2}
        cx={size / 2}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        stroke="rgb(245, 158, 11)"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-1000 ease-out"
      />
      <text
        x={size / 2}
        y={size / 2}
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-gray-900 dark:fill-gray-100 text-base font-bold transform rotate-90"
      >
        {score}
      </text>
    </svg>
  </div>
);
});

ScoreCircle.displayName = 'ScoreCircle';

interface ToggleSwitchProps {
checked: boolean;
onChange: (checked: boolean) => void;
label: string;
disabled?: boolean;
beta?: boolean;
className?: string;
}

const ToggleSwitch = memo<ToggleSwitchProps>(({
checked,
onChange,
label,
disabled = false,
beta = false,
className = ''
}) => {
const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  if (!disabled) {
    onChange(e.target.checked);
  }
}, [disabled, onChange]);

return (
  <div className={`flex items-center gap-2 px-3 h-8 ${className}`}>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={label}
      />
      <div className={`w-7 h-3.5 rounded-full peer transition-all duration-200 ${
        checked
          ? 'bg-blue-600 shadow-inner'
          : 'bg-gray-300 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-1`}>
        <div className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 dark:border-gray-500 rounded-full h-2.5 w-2.5 transition-all duration-200 shadow-sm ${
          checked ? 'translate-x-3.5 border-blue-300 dark:border-blue-400' : 'translate-x-0'
        }`} />
      </div>
    </label>
    <span className="text-xs font-bold uppercase select-none text-gray-900 dark:text-gray-100">{label}</span>
    {beta && <sup className="text-gray-500 dark:text-gray-400 font-normal text-xs">Beta</sup>}
  </div>
);
});

ToggleSwitch.displayName = 'ToggleSwitch';

// ==================== MAIN COMPONENT ====================

const ResumeHeaderBar = memo(forwardRef<ResumeHeaderBarRef, ResumeHeaderBarProps>(({
resumeScore = 89,
documentSettings,
onDocumentSettingChange,
onDownloadPDF,
onDownloadDOCX,
onSaveToDrive,
onAutoAdjust,
onTemplateChange,
onExploreScore,
sectionOrder,
onSectionOrderChange,
isDarkMode = false,
isAutoAdjusting = false,
disabled = false,
className = '',
'data-testid': testId = 'resume-header-bar'
}, ref) => {
const [isExpanded, setIsExpanded] = useState(false);
const {
  activeDropdown,
  toggleDropdown,
  closeAllDropdowns,
  containerRef
} = useDropdownManager();
const { tooltip, showTooltip, hideTooltip } = useTooltipManager();
const { loadingStates, handleAsync } = useAsyncHandler();

// Refs for dropdown buttons
const templateButtonRef = useRef<HTMLButtonElement>(null);
const fontButtonRef = useRef<HTMLButtonElement>(null);
const fontSizeButtonRef = useRef<HTMLButtonElement>(null);
const lineHeightButtonRef = useRef<HTMLButtonElement>(null);
const sectionSpacingButtonRef = useRef<HTMLButtonElement>(null);
const paperSizeButtonRef = useRef<HTMLButtonElement>(null);
const marginButtonRef = useRef<HTMLButtonElement>(null);
const downloadButtonRef = useRef<HTMLButtonElement>(null);
const zoomButtonRef = useRef<HTMLButtonElement>(null);
const textColorButtonRef = useRef<HTMLButtonElement>(null);
const accentColorButtonRef = useRef<HTMLButtonElement>(null);

// Expose methods via ref
useImperativeHandle(ref, () => ({
  expand: () => setIsExpanded(true),
  collapse: () => setIsExpanded(false),
  toggle: () => setIsExpanded(prev => !prev),
  closeAllDropdowns
}), [closeAllDropdowns]);

// Memoized handlers
const handleFontSizeChange = useCallback((delta: number) => {
  const newSize = Math.max(
    FONT_SIZE_CONFIG.MIN,
    Math.min(FONT_SIZE_CONFIG.MAX, documentSettings.fontSize + delta)
  );
  onDocumentSettingChange('fontSize', newSize);
}, [documentSettings.fontSize, onDocumentSettingChange]);

const handleZoomChange = useCallback((newZoom: number) => {
  const clampedZoom = Math.max(
    ZOOM_CONFIG.MIN,
    Math.min(ZOOM_CONFIG.MAX, newZoom)
  );
  onDocumentSettingChange('zoom', clampedZoom);
}, [onDocumentSettingChange]);

const handleSettingChange = useCallback(<K extends keyof DocumentSettings>(
  key: K,
  value: DocumentSettings[K]
) => {
  onDocumentSettingChange(key, value);
}, [onDocumentSettingChange]);

// Async action handlers
const handleDownloadPDF = useCallback(() =>
  handleAsync('downloadPDF', () => onDownloadPDF?.()),
  [handleAsync, onDownloadPDF]
);

const handleDownloadDOCX = useCallback(() =>
  handleAsync('downloadDOCX', () => onDownloadDOCX?.()),
  [handleAsync, onDownloadDOCX]
);

const handleSaveToDrive = useCallback(() =>
  handleAsync('saveToDrive', () => onSaveToDrive?.()),
  [handleAsync, onSaveToDrive]
);

const handleAutoAdjust = useCallback(() =>
  handleAsync('autoAdjust', () => onAutoAdjust?.()),
  [handleAsync, onAutoAdjust]
);

const handleTemplateChange = useCallback((template: string) => {
  handleAsync('templateChange', () => onTemplateChange?.(template));
  toggleDropdown('template');
}, [handleAsync, onTemplateChange, toggleDropdown]);

// Theme classes
const themeClasses = 'bg-white/95 dark:bg-gray-800 backdrop-blur-sm border-slate-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 shadow-lg shadow-slate-200/50 dark:shadow-gray-900/50';

const expandedPanelClasses = 'bg-slate-50/80 dark:bg-gray-700 backdrop-blur-sm text-gray-900 dark:text-gray-100 border-t border-slate-200 dark:border-gray-600';

// Validation
const normalizedScore = Math.max(0, Math.min(100, resumeScore));

return (
  <div
    ref={containerRef}
    className={`${themeClasses} rounded-lg border shadow-sm flex-shrink-0 w-full mb-4 relative transition-all duration-200 ${
      disabled ? 'opacity-50 pointer-events-none' : ''
    } ${className}`}
    style={{ position: 'relative', zIndex: 1 }}
    data-testid={testId}
  >
    {/* Main Toolbar */}
    <div className="flex flex-row flex-wrap items-center justify-between gap-4 px-6 py-3 xl:flex-nowrap">
      {/* Left Section - Score & Explore */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ScoreCircle
            score={normalizedScore}
            onClick={onExploreScore}
            className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
          />
          <ActionButton
            onClick={onExploreScore}
            onMouseEnter={(e) => showTooltip('View detailed score breakdown and improvement suggestions', e)}
            onMouseLeave={hideTooltip}
            variant="secondary"
            size="sm"
            aria-label="Explore resume score details"
            data-testid="explore-score-btn"
          >
            <span className="px-1">Explore My Rezi score</span>
          </ActionButton>
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-2">
        <ActionButton
          onClick={handleAutoAdjust}
          loading={isAutoAdjusting || loadingStates.autoAdjust}
          onMouseEnter={(e) => showTooltip('Automatically optimize resume layout and formatting', e)}
          onMouseLeave={hideTooltip}
          variant="secondary"
          size="sm"
          aria-label="Auto-adjust resume formatting"
          data-testid="auto-adjust-btn"
        >
          <Zap className="w-3.5 h-3.5 mr-1" />
          <span className="px-1">Auto-adjust</span>
        </ActionButton>

        <ActionButton
          onClick={() => setIsExpanded(!isExpanded)}
          variant={isExpanded ? "active" : "secondary"}
          size="sm"
          onMouseEnter={(e) => showTooltip('Toggle detailed formatting options', e)}
          onMouseLeave={hideTooltip}
          aria-label={`${isExpanded ? 'Hide' : 'Show'} adjustment options`}
          aria-expanded={isExpanded}
          data-testid="adjustments-toggle-btn"
        >
          <Settings className="w-3.5 h-3.5 mr-1" />
          <span className="px-1">Adjustments</span>
          <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </ActionButton>

        {/* Template Dropdown */}
        <div className="relative">
          <ActionButton
            ref={templateButtonRef}
            onClick={() => toggleDropdown('template')}
            variant="secondary"
            size="sm"
            onMouseEnter={(e) => showTooltip('Choose from professional resume templates', e)}
            onMouseLeave={hideTooltip}
            aria-label="Change resume template"
            aria-expanded={activeDropdown === 'template'}
            data-testid="template-btn"
          >
            <span className="px-1">Template</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </ActionButton>

          <Dropdown
            isOpen={activeDropdown === 'template'}
            onClose={() => toggleDropdown('template')}
            buttonRef={templateButtonRef}
            position="right"
            className="min-w-[180px]"
          >
            {TEMPLATE_OPTIONS.map(template => (
              <button
                key={template}
                onClick={() => handleTemplateChange(template)}
                className="w-full px-4 py-2 text-left text-sm active:bg-gray-100 dark:active:bg-gray-700 transition-colors rounded-md mx-1 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none text-gray-900 dark:text-gray-100"
                role="menuitem"
                data-testid={`template-${template.toLowerCase()}`}
              >
                {template}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Download Button Group */}
        <div className="relative flex">
          <ActionButton
            onClick={handleDownloadPDF}
            loading={loadingStates.downloadPDF}
            variant="primary"
            size="sm"
            className="rounded-r-none border-r border-blue-700"
            onMouseEnter={(e) => showTooltip('Download resume as PDF document', e)}
            onMouseLeave={hideTooltip}
            aria-label="Download PDF"
            data-testid="download-pdf-btn"
          >
            <FileText className="w-4 h-4 mr-1" />
            <span className="px-1">Download PDF</span>
          </ActionButton>

          <div className="relative">
            <ActionButton
              ref={downloadButtonRef}
              onClick={() => toggleDropdown('download')}
              variant="primary"
              size="sm"
              className="rounded-l-none w-8 px-2"
              onMouseEnter={(e) => showTooltip('More download and export options', e)}
              onMouseLeave={hideTooltip}
              aria-label="More download options"
              aria-expanded={activeDropdown === 'download'}
              data-testid="download-options-btn"
            >
              <ChevronDown className="w-4 h-4" />
            </ActionButton>

            <Dropdown
              isOpen={activeDropdown === 'download'}
              onClose={() => toggleDropdown('download')}
              buttonRef={downloadButtonRef}
              position="right"
              className="min-w-[180px]"
            >
              <button
                onClick={() => {
                  handleDownloadDOCX();
                  toggleDropdown('download');
                }}
                className="w-full px-4 py-2 text-left text-sm active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3 transition-colors rounded-md mx-1 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none text-gray-900 dark:text-gray-100"
                role="menuitem"
                disabled={loadingStates.downloadDOCX}
                data-testid="download-docx-btn"
              >
                <FileDown className="w-4 h-4 flex-shrink-0" />
                <span>Download .DOCX</span>
                {loadingStates.downloadDOCX && (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-auto" />
                )}
              </button>
              <button
                onClick={() => {
                  handleSaveToDrive();
                  toggleDropdown('download');
                }}
                className="w-full px-4 py-2 text-left text-sm active:bg-gray-100 dark:active:bg-gray-700 flex items-center gap-3 transition-colors rounded-md mx-1 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none text-gray-900 dark:text-gray-100"
                role="menuitem"
                disabled={loadingStates.saveToDrive}
                data-testid="save-drive-btn"
              >
                <Share2 className="w-4 h-4 flex-shrink-0" />
                <span>Save to Drive</span>
                {loadingStates.saveToDrive && (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-auto" />
                )}
              </button>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>

    {/* Expandable Settings Panel */}
    <div
      className={`${expandedPanelClasses} transition-all duration-300 ease-in-out ${
        isExpanded ? 'py-3 opacity-100' : 'py-0 opacity-0 max-h-0 overflow-hidden'
      }`}
      aria-hidden={!isExpanded}
    >
      <div className="px-6 flex flex-wrap items-center gap-3" role="toolbar" aria-label="Formatting options">
        {/* Icons and Profile Section */}
        <div className="flex items-center gap-1" role="group" aria-label="Display options">
          <ActionButton
            onClick={() => handleSettingChange('showIcons', !documentSettings.showIcons)}
            variant={documentSettings.showIcons ? "active" : "secondary"}
            size="sm"
            className="w-8 h-8 p-0"
            onMouseEnter={(e) => showTooltip('Toggle section icons visibility', e)}
            onMouseLeave={hideTooltip}
            aria-label={`${documentSettings.showIcons ? 'Hide' : 'Show'} section icons`}
            data-testid="toggle-icons-btn"
          >
            <Eye className="w-3.5 h-3.5" />
          </ActionButton>
          <ActionButton
            onClick={() => {}}
            variant="secondary"
            size="sm"
            className="w-8 h-8 p-0"
            onMouseEnter={(e) => showTooltip('Add or edit profile picture', e)}
            onMouseLeave={hideTooltip}
            aria-label="Profile picture options"
            data-testid="profile-picture-btn"
          >
            <User className="w-3.5 h-3.5" />
          </ActionButton>
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" role="separator" />

        {/* Font Family Dropdown */}
        <div className="relative">
          <ActionButton
            ref={fontButtonRef}
            onClick={() => toggleDropdown('font')}
            variant="secondary"
            size="sm"
            onMouseEnter={(e) => showTooltip(`Current font: ${documentSettings.fontFamily}`, e)}
            onMouseLeave={hideTooltip}
            aria-label="Change font family"
            aria-expanded={activeDropdown === 'font'}
            data-testid="font-selector-btn"
          >
            <span className="px-1 text-xs font-semibold uppercase max-w-24 truncate">
              {documentSettings.fontFamily}
            </span>
            <ChevronDown className="w-3.5 h-3.5 ml-1 flex-shrink-0" />
          </ActionButton>

          <Dropdown
            isOpen={activeDropdown === 'font'}
            onClose={() => toggleDropdown('font')}
            buttonRef={fontButtonRef}
            className="min-w-[200px]"
          >
            {FONT_OPTIONS.map(font => (
              <button
                key={font.value}
                onClick={() => {
                  handleSettingChange('fontFamily', font.value);
                  toggleDropdown('font');
                }}
                className={`w-full px-4 py-2 text-left text-sm active:bg-gray-100 dark:active:bg-gray-700 transition-colors rounded-md mx-1 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none text-gray-900 dark:text-gray-100 ${
                  documentSettings.fontFamily === font.value ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold' : ''
                }`}
                role="menuitem"
                data-testid={`font-${font.value.toLowerCase().replace(/\s+/g, '-')}`}
                style={{ fontFamily: font.value }}
              >
                <div className="flex justify-between items-center">
                  <span>{font.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{font.category}</span>
                </div>
              </button>
            ))}
          </Dropdown>
        </div>

        <div className="w-px h-6 bg-gray-300" role="separator" />

        {/* Font Size Controls */}
        <div className="flex items-center" role="group" aria-label="Font size controls">
          <ActionButton
            onClick={() => handleFontSizeChange(-FONT_SIZE_CONFIG.STEP)}
            variant="secondary"
            size="sm"
            className="w-8 h-8 p-0"
            onMouseEnter={(e) => showTooltip('Decrease font size', e)}
            onMouseLeave={hideTooltip}
            disabled={documentSettings.fontSize <= FONT_SIZE_CONFIG.MIN}
            aria-label="Decrease font size"
            data-testid="decrease-font-size-btn"
          >
            <Minus className="w-3.5 h-3.5" />
          </ActionButton>
          <div
            className="w-8 text-center text-xs font-semibold"
            aria-label={`Current font size: ${documentSettings.fontSize}`}
          >
            {documentSettings.fontSize}
          </div>
          <ActionButton
            onClick={() => handleFontSizeChange(FONT_SIZE_CONFIG.STEP)}
            variant="secondary"
            size="sm"
            className="w-8 h-8 p-0"
            onMouseEnter={(e) => showTooltip('Increase font size', e)}
            onMouseLeave={hideTooltip}
            disabled={documentSettings.fontSize >= FONT_SIZE_CONFIG.MAX}
            aria-label="Increase font size"
            data-testid="increase-font-size-btn"
          >
            <Plus className="w-3.5 h-3.5" />
          </ActionButton>
        </div>

        <div className="w-px h-6 bg-gray-300" role="separator" />

        {/* Line Height Dropdown */}
        <div className="relative">
          <ActionButton
            ref={lineHeightButtonRef}
            onClick={() => toggleDropdown('lineHeight')}
            variant="secondary"
            size="sm"
            onMouseEnter={(e) => showTooltip(`Line height: ${documentSettings.lineHeight}`, e)}
            onMouseLeave={hideTooltip}
            aria-label="Change line height"
            aria-expanded={activeDropdown === 'lineHeight'}
            data-testid="line-height-btn"
          >
            <AlignLeft className="w-3.5 h-3.5 mr-1" />
            <span className="text-xs font-semibold uppercase">{documentSettings.lineHeight}</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </ActionButton>

          <Dropdown
            isOpen={activeDropdown === 'lineHeight'}
            onClose={() => toggleDropdown('lineHeight')}
            buttonRef={lineHeightButtonRef}
            className="min-w-[120px]"
          >
            {LINE_HEIGHT_OPTIONS.map(height => (
              <button
                key={height}
                onClick={() => {
                  handleSettingChange('lineHeight', height);
                  toggleDropdown('lineHeight');
                }}
                className={`w-full px-4 py-2 text-left text-sm active:bg-gray-100 dark:active:bg-gray-700 transition-colors rounded-md mx-1 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none text-gray-900 dark:text-gray-100 ${
                  Math.abs(documentSettings.lineHeight - height) < 0.01 ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold' : ''
                }`}
                role="menuitem"
                data-testid={`line-height-${height}`}
              >
                {height}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Section Spacing Dropdown */}
        <div className="relative">
          <ActionButton
            ref={sectionSpacingButtonRef}
            onClick={() => toggleDropdown('sectionSpacing')}
            variant="secondary"
            size="sm"
            onMouseEnter={(e) => showTooltip(`Section spacing: ${documentSettings.sectionSpacing}`, e)}
            onMouseLeave={hideTooltip}
            aria-label="Change section spacing"
            aria-expanded={activeDropdown === 'sectionSpacing'}
            data-testid="section-spacing-btn"
          >
            <MoreHorizontal className="w-3.5 h-3.5 mr-1 rotate-90" />
            <span className="text-xs font-semibold uppercase">{documentSettings.sectionSpacing}</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </ActionButton>

          <Dropdown
            isOpen={activeDropdown === 'sectionSpacing'}
            onClose={() => toggleDropdown('sectionSpacing')}
            buttonRef={sectionSpacingButtonRef}
            className="min-w-[120px]"
          >
            {SECTION_SPACING_OPTIONS.map(spacing => (
              <button
                key={spacing}
                onClick={() => {
                  handleSettingChange('sectionSpacing', spacing);
                  toggleDropdown('sectionSpacing');
                }}
                className={`w-full px-4 py-2 text-left text-sm active:bg-gray-100 dark:active:bg-gray-700 transition-colors rounded-md mx-1 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none text-gray-900 dark:text-gray-100 ${
                  Math.abs(documentSettings.sectionSpacing - spacing) < 0.01 ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold' : ''
                }`}
                role="menuitem"
                data-testid={`section-spacing-${spacing}`}
              >
                {spacing}
              </button>
            ))}
          </Dropdown>
        </div>

        {/* Indent and Divider Toggles */}
        <div className="flex items-center gap-1" role="group" aria-label="Layout options">
          <ActionButton
            onClick={() => handleSettingChange('useIndent', !documentSettings.useIndent)}
            variant={documentSettings.useIndent ? "active" : "secondary"}
            size="sm"
            className="w-8 h-8 p-0"
            onMouseEnter={(e) => showTooltip('Toggle paragraph indentation', e)}
            onMouseLeave={hideTooltip}
            aria-label={`${documentSettings.useIndent ? 'Disable' : 'Enable'} indentation`}
            data-testid="toggle-indent-btn"
          >
            <Indent className="w-3.5 h-3.5" />
          </ActionButton>
          <ActionButton
            onClick={() => handleSettingChange('showDividers', !documentSettings.showDividers)}
            variant={documentSettings.showDividers ? "active" : "secondary"}
            size="sm"
            className="w-8 h-8 p-0"
            onMouseEnter={(e) => showTooltip('Toggle section dividers', e)}
            onMouseLeave={hideTooltip}
            aria-label={`${documentSettings.showDividers ? 'Hide' : 'Show'} section dividers`}
            data-testid="toggle-dividers-btn"
          >
            <div className="w-3.5 h-0.5 bg-current" />
          </ActionButton>
        </div>

        <div className="w-px h-6 bg-gray-300" role="separator" />

        {/* Paper Size and Zoom */}
        <div className="flex items-center gap-1" role="group" aria-label="Page settings">
          <div className="relative">
            <ActionButton
              ref={paperSizeButtonRef}
              onClick={() => toggleDropdown('paperSize')}
              variant="secondary"
              size="sm"
              onMouseEnter={(e) => showTooltip(`Paper size: ${documentSettings.paperSize}`, e)}
              onMouseLeave={hideTooltip}
              aria-label="Change paper size"
              aria-expanded={activeDropdown === 'paperSize'}
              data-testid="paper-size-btn"
            >
              <span className="text-xs font-semibold uppercase px-1">{documentSettings.paperSize}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </ActionButton>

            <Dropdown
              isOpen={activeDropdown === 'paperSize'}
              onClose={() => toggleDropdown('paperSize')}
              buttonRef={paperSizeButtonRef}
              className="min-w-[200px]"
            >
              {PAPER_SIZE_OPTIONS.map(size => (
                <button
                  key={size.value}
                  onClick={() => {
                    handleSettingChange('paperSize', size.value);
                    toggleDropdown('paperSize');
                  }}
                  className={`w-full px-4 py-2 text-left text-sm active:bg-gray-100 dark:active:bg-gray-700 transition-colors rounded-md mx-1 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none text-gray-900 dark:text-gray-100 ${
                    documentSettings.paperSize === size.value ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold' : ''
                  }`}
                  role="menuitem"
                  data-testid={`paper-size-${size.value.toLowerCase()}`}
                >
                  <div className="flex justify-between items-center">
                    <span>{size.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{size.dimensions}</span>
                  </div>
                </button>
              ))}
            </Dropdown>
          </div>

          <div className="relative">
            <ActionButton
              ref={marginButtonRef}
              onClick={() => toggleDropdown('margins')}
              variant="secondary"
              size="sm"
              onMouseEnter={(e) => showTooltip(`Margins: ${documentSettings.margins.top}" all sides`, e)}
              onMouseLeave={hideTooltip}
              aria-label="Change margins"
              aria-expanded={activeDropdown === 'margins'}
              data-testid="margins-btn"
            >
              <span className="text-xs font-semibold uppercase px-1">Margins</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </ActionButton>

            <Dropdown
              isOpen={activeDropdown === 'margins'}
              onClose={() => toggleDropdown('margins')}
              buttonRef={marginButtonRef}
              className="min-w-[250px]"
            >
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Page Margins</div>
                {MARGIN_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleSettingChange('margins', {
                        top: option.value,
                        right: option.value,
                        bottom: option.value,
                        left: option.value
                      });
                      toggleDropdown('margins');
                    }}
                    className={`w-full px-3 py-2 text-left text-sm active:bg-gray-100 dark:active:bg-gray-700 transition-colors rounded-md focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none text-gray-900 dark:text-gray-100 ${
                      documentSettings.margins.top === option.value ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold' : ''
                    }`}
                    role="menuitem"
                  >
                    <div className="flex justify-between items-center">
                      <span>{option.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Dropdown>
          </div>

          <div className="relative">
            <ActionButton
              ref={zoomButtonRef}
              onClick={() => toggleDropdown('zoom')}
              variant="secondary"
              size="sm"
              onMouseEnter={(e) => showTooltip(`Zoom: ${documentSettings.zoom}%`, e)}
              onMouseLeave={hideTooltip}
              aria-label="Change zoom level"
              aria-expanded={activeDropdown === 'zoom'}
              data-testid="zoom-btn"
            >
              <span className="text-xs font-semibold uppercase px-1">{documentSettings.zoom}%</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </ActionButton>

            <Dropdown
              isOpen={activeDropdown === 'zoom'}
              onClose={() => toggleDropdown('zoom')}
              buttonRef={zoomButtonRef}
              className="min-w-[220px] p-4"
            >
              <div className="mb-3 flex justify-between items-center">
                <span className="text-xs font-semibold">Zoom: {documentSettings.zoom}%</span>
                <div className="flex items-center gap-2">
                  <ActionButton
                    onClick={() => handleZoomChange(documentSettings.zoom - 10)}
                    variant="secondary"
                    size="xs"
                    className="w-6 h-6 p-0"
                    disabled={documentSettings.zoom <= ZOOM_CONFIG.MIN}
                    aria-label="Decrease zoom"
                  >
                    <Minus className="w-3 h-3" />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleZoomChange(documentSettings.zoom + 10)}
                    variant="secondary"
                    size="xs"
                    className="w-6 h-6 p-0"
                    disabled={documentSettings.zoom >= ZOOM_CONFIG.MAX}
                    aria-label="Increase zoom"
                  >
                    <Plus className="w-3 h-3" />
                  </ActionButton>
                </div>
              </div>
              <input
                type="range"
                min={ZOOM_CONFIG.MIN}
                max={ZOOM_CONFIG.MAX}
                step={ZOOM_CONFIG.STEP}
                value={documentSettings.zoom}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Zoom slider"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{ZOOM_CONFIG.MIN}%</span>
                <span>{ZOOM_CONFIG.DEFAULT}%</span>
                <span>{ZOOM_CONFIG.MAX}%</span>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    handleZoomChange(ZOOM_CONFIG.DEFAULT);
                    toggleDropdown('zoom');
                  }}
                  className="w-full text-xs text-left py-1 px-2 hover:bg-gray-100 rounded transition-colors focus:bg-blue-50 focus:outline-none"
                  data-testid="zoom-reset-btn"
                >
                  Reset to {ZOOM_CONFIG.DEFAULT}%
                </button>
              </div>
            </Dropdown>
          </div>
        </div>

        <div className="w-px h-6 bg-gray-300" role="separator" />

        {/* Color Pickers */}
        <div className="flex items-center gap-1" role="group" aria-label="Color settings">
          <div className="relative">
            <ActionButton
              ref={textColorButtonRef}
              onClick={() => toggleDropdown('textColor')}
              variant="secondary"
              size="sm"
              className="flex-col p-1 h-10"
              onMouseEnter={(e) => showTooltip('Change text color', e)}
              onMouseLeave={hideTooltip}
              aria-label="Change text color"
              aria-expanded={activeDropdown === 'textColor'}
              data-testid="text-color-btn"
            >
              <Type className="w-3.5 h-3.5" />
              <div
                className="w-4 h-1 mt-0.5 border border-gray-300 rounded-sm"
                style={{ backgroundColor: documentSettings.textColor }}
              />
            </ActionButton>

            <Dropdown
              isOpen={activeDropdown === 'textColor'}
              onClose={() => toggleDropdown('textColor')}
              buttonRef={textColorButtonRef}
              className="p-3"
            >
              <label className="block text-xs font-medium mb-2 text-gray-900 dark:text-gray-100">Text Color</label>
              <input
                type="color"
                value={documentSettings.textColor}
                onChange={(e) => handleSettingChange('textColor', e.target.value)}
                className="w-32 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Text color picker"
                data-testid="text-color-input"
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Current: {documentSettings.textColor}
              </div>
            </Dropdown>
          </div>

          <div className="relative">
            <ActionButton
              ref={accentColorButtonRef}
              onClick={() => toggleDropdown('accentColor')}
              variant="secondary"
              size="sm"
              className="flex-col p-1 h-10"
              onMouseEnter={(e) => showTooltip('Change accent color', e)}
              onMouseLeave={hideTooltip}
              aria-label="Change accent color"
              aria-expanded={activeDropdown === 'accentColor'}
              data-testid="accent-color-btn"
            >
              <Palette className="w-3.5 h-3.5" />
              <div
                className="w-4 h-1 mt-0.5 border border-gray-300 rounded-sm"
                style={{ backgroundColor: documentSettings.primaryColor }}
              />
            </ActionButton>

            <Dropdown
              isOpen={activeDropdown === 'accentColor'}
              onClose={() => toggleDropdown('accentColor')}
              buttonRef={accentColorButtonRef}
              className="p-3"
            >
              <label className="block text-xs font-medium mb-2 text-gray-900 dark:text-gray-100">Accent Color</label>
              <input
                type="color"
                value={documentSettings.primaryColor}
                onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                className="w-32 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Accent color picker"
                data-testid="accent-color-input"
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Current: {documentSettings.primaryColor}
              </div>
            </Dropdown>
          </div>

          {/* Section Order - Hidden when using new panel */}
          {false && onSectionOrderChange && (
            <div className="relative">
              <ActionButton
                onClick={() => toggleDropdown('sectionOrder')}
                variant="secondary"
                size="sm"
                className="p-1 h-10"
                onMouseEnter={(e) => showTooltip('Reorder resume sections', e)}
                onMouseLeave={hideTooltip}
                aria-label="Reorder sections"
                aria-expanded={activeDropdown === 'sectionOrder'}
                data-testid="section-order-btn"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="text-[10px] mt-0.5">Order</span>
              </ActionButton>

              <Dropdown
                isOpen={activeDropdown === 'sectionOrder'}
                onClose={() => toggleDropdown('sectionOrder')}
                className="p-4 w-64"
              >
                <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Section Order</h3>
                <div className="space-y-2">
                  {sectionOrder?.map((section, index) => (
                    <div key={section} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm capitalize">{section}</span>
                      <div className="flex gap-1">
                        <ActionButton
                          onClick={() => {
                            if (index > 0) {
                              const newOrder = [...(sectionOrder || [])];
                              [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                              onSectionOrderChange(newOrder);
                            }
                          }}
                          disabled={index === 0}
                          variant="ghost"
                          size="xs"
                          aria-label={`Move ${section} up`}
                        >
                          ↑
                        </ActionButton>
                        <ActionButton
                          onClick={() => {
                            if (index < (sectionOrder?.length || 0) - 1) {
                              const newOrder = [...(sectionOrder || [])];
                              [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                              onSectionOrderChange(newOrder);
                            }
                          }}
                          disabled={index === (sectionOrder?.length || 0) - 1}
                          variant="ghost"
                          size="xs"
                          aria-label={`Move ${section} down`}
                        >
                          ↓
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              </Dropdown>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300" role="separator" />

        {/* View as Pages Toggle */}
        <ToggleSwitch
          checked={documentSettings.viewAsPages}
          onChange={(checked) => handleSettingChange('viewAsPages', checked)}
          label="View as pages"
          beta
          data-testid="view-as-pages-toggle"
        />
      </div>
    </div>

    {/* Enhanced Tooltip */}
    {tooltip.visible && tooltip.text && (
      <div
        className="fixed bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs px-3 py-2 rounded-lg pointer-events-none z-[200] whitespace-nowrap shadow-xl max-w-xs border border-gray-800 dark:border-gray-600"
        style={{
          left: tooltip.x,
          top: tooltip.y,
          transform: 'translateX(-50%)',
        }}
        role="tooltip"
        aria-live="polite"
      >
        {tooltip.text}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 border-l border-t border-gray-800 dark:border-gray-600" />
      </div>
    )}
  </div>
);
}));

ResumeHeaderBar.displayName = 'ResumeHeaderBar';

export default ResumeHeaderBar;
