'use client';

/**
 * ProjectsForm Component
 *
 * Features:
 * - Auto-save: Updates store in memory every 2 seconds (doesn't persist to database)
 * - Manual save: Persists to database via Save button or Ctrl+S
 * - Navigation: Switch between multiple project entries
 * - Validation: Real-time validation with helpful error messages
 * - Keyboard shortcuts: Save (Ctrl+S), Undo (Ctrl+Z), New (Ctrl+Shift+N), Navigate (Arrow keys)
 *
 * Uses React Hook Form's isDirty state for proper dirty tracking instead of
 * the store's broken implementation.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Code2, Plus, X, ChevronLeft, ChevronRight, Save, Loader2,
  AlertCircle, ExternalLink, GripVertical, Trash2, Undo2, Check, Clock
} from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useResumeStore, type ProjectEntry } from '@/lib/client/stores/resume-store';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/form-styles.css';

// Schema for a single bullet point object
const bulletPointSchema = z.object({
  value: z.string(),
});

// Schema for a single project entry
const projectEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Project title is required"),
  organization: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean(),
  url: z.string().optional(),
  description: z.string().optional(),
  bulletPoints: z.array(bulletPointSchema).optional(),
}).refine(data => data.current || !data.startDate || !!data.endDate?.trim(), {
  message: "End date is required unless it's an ongoing project",
  path: ["endDate"],
});

// Schema for the entire form
const projectSchema = z.object({
  entries: z.array(projectEntrySchema),
});

// TypeScript types inferred from schemas
type BulletPoint = z.infer<typeof bulletPointSchema>;
type ProjectFormEntry = Omit<z.infer<typeof projectEntrySchema>, 'bulletPoints'> & {
  bulletPoints: BulletPoint[];
};
type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectsFormProps {
  initialData: ProjectEntry[];
  onSave?: (data: ProjectEntry[]) => Promise<void>;
}

// Constants
const PLACEHOLDER_VALUES = ['n/a', 'N/A', 'none', 'null', '-', 'NA'];
const AUTO_SAVE_DELAY = 2000;

// Helper functions
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return PLACEHOLDER_VALUES.includes(trimmed) ? '' : trimmed;
};

// Convert store format to form format
const convertToFormFormat = (entries: ProjectEntry[]): ProjectFormEntry[] => {
  return entries.map(entry => {
    // Parse bullet points from description if bulletPoints array is empty
    let bulletPoints = entry.bulletPoints?.filter(Boolean) || [];

    if (bulletPoints.length === 0 && entry.description) {
      // Split by various bullet point formats: •, -, *, or newline followed by these
      const points = entry.description
        .split(/(?:^|\n)\s*[•\-\*]\s*|(?<=[.!?])\s*•\s*/)
        .map((point: string) => point.trim())
        .filter((point: string) => point.length > 0);

      bulletPoints = points;
    }

    return {
      ...entry,
      id: entry.id || crypto.randomUUID(),
      title: cleanValue(entry.title),
      organization: cleanValue(entry.organization),
      startDate: cleanValue(entry.startDate),
      endDate: cleanValue(entry.endDate),
      url: cleanValue(entry.url),
      description: cleanValue(entry.description),
      bulletPoints: bulletPoints.length > 0 ? bulletPoints.map((bp: any) => ({ value: bp })) : [{ value: '' }],
    };
  });
};

// Convert form format to store format
const convertToStoreFormat = (formData: ProjectFormData): ProjectEntry[] => {
  return formData.entries.map(entry => {
    const bulletPoints = entry.bulletPoints
      ? entry.bulletPoints.map(bp => bp.value).filter(v => v && v.trim())
      : [];

    return {
      id: entry.id || crypto.randomUUID(),
      title: entry.title || '',
      organization: entry.organization || '',
      startDate: entry.startDate || '',
      endDate: entry.endDate || '',
      current: entry.current || false,
      url: entry.url || '',
      description: bulletPoints.length > 0 ? bulletPoints.join('\n• ') : (entry.description || ''),
      bulletPoints: bulletPoints,
    };
  });
};

// Auto-save indicator component
const AutoSaveIndicator = ({ status }: { status: 'saving' | 'saved' | 'error' | null }) => {
  if (!status) return null;

  const config = {
    saving: { icon: Clock, text: 'Auto-saving...', className: 'text-blue-600' },
    saved: { icon: Check, text: 'Changes auto-saved', className: 'text-green-600' },
    error: { icon: AlertCircle, text: 'Auto-save failed', className: 'text-red-600' },
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </motion.div>
  );
};

// Custom hook for keyboard shortcuts
const useKeyboardShortcuts = (callbacks: {
  save: () => void;
  undo: () => void;
  newEntry: () => void;
  prev: () => void;
  next: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            callbacks.save();
            break;
          case 'z':
            e.preventDefault();
            callbacks.undo();
            break;
          case 'n':
            if (e.shiftKey) {
              e.preventDefault();
              callbacks.newEntry();
            }
            break;
        }
      }

      const target = e.target as HTMLElement;
      if (!['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            callbacks.prev();
            break;
          case 'ArrowRight':
            e.preventDefault();
            callbacks.next();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};

export default function ProjectsForm({ initialData, onSave }: ProjectsFormProps) {
  const { toast } = useToast();
  const {
    updateSection,
    saveSection,
    saveStatus,
    revertSection
  } = useResumeStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('projects');

  // Initialize form
  const defaultFormValues = useMemo(() => ({
    entries: initialData?.length > 0
      ? convertToFormFormat(initialData)
      : [{
          id: crypto.randomUUID(),
          title: '',
          organization: '',
          startDate: '',
          endDate: '',
          current: false,
          url: '',
          description: '',
          bulletPoints: [{ value: '' }]
        }]
  }), [initialData]);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultFormValues,
    mode: 'onBlur',
  });

  const { control, handleSubmit, formState: { errors, isDirty }, watch, setValue, reset, getValues, trigger } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // Watch current entry
  const currentEntry = watch(`entries.${activeIndex}`);

  // Set up auto-save with debouncing
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        const formData = getValues();
        const storeData = convertToStoreFormat(formData);
        // Only update the store, don't save to Firebase yet
        updateSection('projects', storeData);
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(null), 3000);
      } catch (error) {
        setAutoSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    }, AUTO_SAVE_DELAY);
  }, [getValues, updateSection]);

  // Trigger auto-save on form changes (but not on mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const subscription = watch(() => {
      debouncedAutoSave();
    });

    return () => subscription.unsubscribe();
  }, [watch, debouncedAutoSave]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Reset form when switching resumes
  useEffect(() => {
    reset(defaultFormValues);
    setActiveIndex(0);
    isFirstRender.current = true;
  }, [initialData, reset, defaultFormValues]);

  // Handlers
  const handleManualSave = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = getValues();
      const storeData = convertToStoreFormat(formData);

      if (onSave) {
        await onSave(storeData);
      }

      updateSection('projects', storeData);
      await saveSection('projects');

      // Reset form state with current values to mark as clean
      reset({ entries: formData.entries });

      toast({
        title: "Success",
        description: "Projects information saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save projects information",
        variant: "destructive",
      });
    }
  }, [trigger, getValues, onSave, updateSection, saveSection, reset, toast]);

  const handleUndo = useCallback(() => {
    revertSection('projects');
    reset(defaultFormValues);
    toast({
      title: "Changes reverted",
      description: "Projects section restored to last saved state",
    });
  }, [revertSection, reset, defaultFormValues, toast]);

  const addNewProject = useCallback(() => {
    const newEntry = {
      id: crypto.randomUUID(),
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      current: false,
      url: '',
      description: '',
      bulletPoints: [{ value: '' }]
    };
    append(newEntry);
    setActiveIndex(fields.length);
  }, [append, fields.length]);

  const removeProject = useCallback((index: number) => {
    if (fields.length > 1) {
      remove(index);
      setActiveIndex(Math.max(0, Math.min(index - 1, fields.length - 2)));
    }
  }, [remove, fields.length]);

  const navigatePrev = useCallback(() => {
    setActiveIndex(prev => Math.max(0, prev - 1));
  }, []);

  const navigateNext = useCallback(() => {
    setActiveIndex(prev => Math.min(fields.length - 1, prev + 1));
  }, [fields.length]);

  const handleUrlBlur = useCallback((value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
      return `https://${trimmedValue}`;
    }
    return trimmedValue;
  }, []);

  // Handle current project toggle
  const handleCurrentToggle = useCallback((checked: boolean) => {
    if (checked) {
      setValue(`entries.${activeIndex}.endDate`, '', {
        shouldValidate: false,
        shouldDirty: true
      });
    }
  }, [activeIndex, setValue]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    save: handleManualSave,
    undo: handleUndo,
    newEntry: addNewProject,
    prev: navigatePrev,
    next: navigateNext,
  });

  // Header title
  const headerTitle = currentEntry?.title && currentEntry?.organization
    ? `${currentEntry.title} - ${currentEntry.organization}`
    : "New Project Entry";

  // Field error helpers
  const getFieldError = (field: keyof ProjectFormEntry) => {
    return errors.entries?.[activeIndex]?.[field];
  };

  return (
    <div className={`resume-form-container ${isSaving ? 'resume-form-container--saving' : ''} ${isDirty ? 'resume-form-container--dirty' : ''}`}>
      <div className="resume-form-background" aria-hidden="true" />
      <div className="resume-form-pattern" aria-hidden="true" />

      <div className="resume-form-content">
        {/* Header */}
        <div className="resume-form-header">
          <h2 className="resume-form-title">
            <div className="resume-form-icon">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="truncate pr-4">{headerTitle}</span>
          </h2>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              <AutoSaveIndicator status={autoSaveStatus} />
            </AnimatePresence>

            <div className="resume-form-nav">
              <Button
                variant="ghost"
                size="icon"
                onClick={navigatePrev}
                disabled={activeIndex === 0 || isSaving}
                className="resume-form-nav-button"
                title="Previous entry (← or Ctrl+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="resume-form-nav-counter">
                {activeIndex + 1} / {fields.length}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={navigateNext}
                disabled={activeIndex === fields.length - 1 || isSaving}
                className="resume-form-nav-button"
                title="Next entry (→ or Ctrl+→)"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {fields.length > 1 && (
                <>
                  <div className="resume-form-nav-divider" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProject(activeIndex)}
                    disabled={isSaving}
                    className="resume-form-delete-button"
                    title="Delete this entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(handleManualSave)} className="space-y-6">
          {/* Add key to force re-render when switching entries */}
          <div key={`project-${activeIndex}`}>
            {/* Project Title & Organization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="resume-label">
                  Project Title <span className="resume-label-required">*</span>
                </Label>
                <Controller
                  name={`entries.${activeIndex}.title`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldError('title') ? 'resume-input-container--error' : ''}`}>
                      <Input
                        {...field}
                        placeholder="e.g., E-Commerce Platform"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
                {getFieldError('title') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {getFieldError('title')?.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="resume-label">
                  Organization
                </Label>
                <Controller
                  name={`entries.${activeIndex}.organization`}
                  control={control}
                  render={({ field }) => (
                    <div className={`resume-input-container ${getFieldError('organization') ? 'resume-input-container--error' : ''}`}>
                      <Input
                        {...field}
                        placeholder="e.g., Microsoft Corporation"
                        className="resume-input"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
                {getFieldError('organization') && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="resume-error-message"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {getFieldError('organization')?.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Time Period & URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="resume-label">
                  Time Period
                </Label>
                <div className="flex items-start gap-2">
                  <div className="flex-grow">
                    <Controller
                      name={`entries.${activeIndex}.startDate`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Jan 2023"
                          className="resume-input"
                          disabled={isSaving}
                        />
                      )}
                    />
                    {getFieldError('startDate') && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="resume-error-message mt-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">Required</span>
                      </motion.p>
                    )}
                  </div>

                  <div className="flex-grow">
                    <Controller
                      name={`entries.${activeIndex}.endDate`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={currentEntry?.current ? "Present" : "Dec 2023"}
                          disabled={currentEntry?.current || isSaving}
                          className={`resume-input ${currentEntry?.current ? 'opacity-50' : ''}`}
                        />
                      )}
                    />
                    {getFieldError('endDate') && !currentEntry?.current && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="resume-error-message mt-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">Required</span>
                      </motion.p>
                    )}
                  </div>

                  <div className="flex flex-col items-center pt-2 gap-1">
                    <Controller
                      name={`entries.${activeIndex}.current`}
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleCurrentToggle(checked);
                          }}
                          disabled={isSaving}
                          className="scale-75"
                        />
                      )}
                    />
                    <Label className="text-xs text-center">Ongoing</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="resume-label">Project URL</Label>
                <Controller
                  name={`entries.${activeIndex}.url`}
                  control={control}
                  render={({ field }) => (
                    <div className="resume-input-container relative">
                      <Input
                        {...field}
                        placeholder="e.g., https://example.com"
                        onBlur={(e) => {
                          const processedUrl = handleUrlBlur(e.target.value);
                          field.onChange(processedUrl);
                        }}
                        className="resume-input pr-10"
                        disabled={isSaving}
                      />
                      {field.value && (
                        <a
                          href={field.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Key Features & Achievements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="resume-label">Key Features & Achievements</Label>
                <span className="text-xs text-gray-500">
                  Tip: Press Enter to add a new point
                </span>
              </div>

              <div className="space-y-3">
                {currentEntry?.bulletPoints?.map((_, bulletIndex) => (
                  <div
                    key={`bullet-${bulletIndex}`}
                    className="resume-bullet-item group"
                  >
                    <GripVertical className="resume-bullet-grip" />
                    <div className="resume-bullet-input flex-grow">
                      <Controller
                        name={`entries.${activeIndex}.bulletPoints.${bulletIndex}.value`}
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="• Built responsive web application with React and TypeScript serving 10,000+ users"
                            className="resume-textarea min-h-[60px]"
                            rows={2}
                            disabled={isSaving}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                const newBulletPoints = [...(currentEntry?.bulletPoints || []), { value: '' }];
                                setValue(`entries.${activeIndex}.bulletPoints`, newBulletPoints);
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newBulletPoints = currentEntry?.bulletPoints?.filter((_, i) => i !== bulletIndex) || [];
                        if (newBulletPoints.length === 0) {
                          newBulletPoints.push({ value: '' });
                        }
                        setValue(`entries.${activeIndex}.bulletPoints`, newBulletPoints);
                      }}
                      disabled={isSaving || currentEntry?.bulletPoints?.length === 1}
                      className="resume-bullet-remove opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newBulletPoints = [...(currentEntry?.bulletPoints || []), { value: '' }];
                    setValue(`entries.${activeIndex}.bulletPoints`, newBulletPoints);
                  }}
                  disabled={isSaving}
                  className="resume-button-secondary w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Achievement
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="resume-form-actions">
            <div className="flex items-center gap-3">
              {isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleUndo}
                  disabled={isSaving}
                  size="sm"
                  title="Undo changes (Cmd/Ctrl+Z)"
                >
                  <Undo2 className="h-4 w-4 mr-1" />
                  Undo
                </Button>
              )}

              {isDirty && !autoSaveStatus && (
                <span className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <div className="resume-section-dirty-dot" />
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={addNewProject}
                disabled={isSaving}
                className="resume-button-secondary"
                title="Add new project (Cmd/Ctrl+Shift+N)"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>

              <Button
                type="submit"
                disabled={isSaving || !isDirty}
                className="resume-button-primary"
                title="Save all changes permanently (Cmd/Ctrl+S)"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}