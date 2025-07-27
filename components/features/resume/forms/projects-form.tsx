'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Code2, Plus, X, ChevronLeft, ChevronRight, Save, Loader2, AlertCircle, ExternalLink, GripVertical, Trash2 } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useResumeStore, type ProjectEntry } from '@/lib/client/stores/resume-store';
import '../styles/form-styles.css';

// Schema for a single bullet point object
const bulletPointSchema = z.object({
  value: z.string(),
});

// Schema for a single project entry
const projectEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Project title is required."),
  organization: z.string().min(1, "Organization name is required."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional(),
  current: z.boolean(),
  url: z.string().optional(),
  description: z.string().optional(),
  bulletPoints: z.array(bulletPointSchema).optional(),
}).refine(data => !data.current ? !!data.endDate?.trim() : true, {
  message: "End date is required unless it's an ongoing project.",
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
  onSave: (data: ProjectEntry[]) => Promise<void>;
}

// Helper to clean placeholder values from initial data
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-', 'NA'].includes(trimmed) ? '' : trimmed;
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
  return formData.entries.map(entry => ({
    id: entry.id || '',
    title: entry.title || '',
    organization: entry.organization || '',
    startDate: entry.startDate || '',
    endDate: entry.endDate || '',
    current: entry.current || false,
    url: entry.url || '',
    description: entry.description || '',
    bulletPoints: entry.bulletPoints 
      ? entry.bulletPoints.map(bp => bp.value).filter(v => v && v.trim())
      : [],
  }));
};

export default function ProjectsForm({ initialData, onSave }: ProjectsFormProps) {
  const { toast } = useToast();
  const { updateSection, saveSection, isSectionDirty, saveStatus } = useResumeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const previousDataRef = useRef<string>('');

  const isDirty = isSectionDirty('projects');
  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('projects');

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      entries: (initialData && initialData.length > 0) 
        ? convertToFormFormat(initialData)
        : [{
            title: '',
            organization: '',
            startDate: '',
            endDate: '',
            current: false,
            url: '',
            description: '',
            bulletPoints: [{ value: '' }]
          }]
    },
    mode: 'onChange',
  });

  const { register, control, formState: { errors }, watch, setValue, getValues, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const { fields: bulletPointFields, append: appendBulletPoint, remove: removeBulletPoint } = useFieldArray({
    control,
    name: `entries.${activeIndex}.bulletPoints`
  });

  // Reset form when initialData changes (when switching resumes)
  useEffect(() => {
    const formData = (initialData && initialData.length > 0) 
      ? convertToFormFormat(initialData)
      : [{
          title: '',
          organization: '',
          startDate: '',
          endDate: '',
          current: false,
          url: '',
          description: '',
          bulletPoints: [{ value: '' }]
        }];
    
    reset({ entries: formData });
    setActiveIndex(0);
    previousDataRef.current = JSON.stringify(formData);
  }, [initialData, reset]);

  // Watch all form values for real-time updates
  const watchedValues = watch();

  // Update store when form data changes (no auto-save) - using ref to prevent infinite loops
  useEffect(() => {
    // Skip updates when we're just navigating between entries
    if (isNavigatingRef.current) {
      return;
    }
    
    const currentData = JSON.stringify(watchedValues);
    const initialFormData = JSON.stringify({ entries: convertToFormFormat(initialData) });
    
    if (currentData !== previousDataRef.current && currentData !== initialFormData) {
      previousDataRef.current = currentData;
      const storeData = convertToStoreFormat(watchedValues);
      updateSection('projects', storeData);
    }
  }, [watchedValues, updateSection, initialData]);

  // Manual save function
  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = getValues();
    
    try {
      const storeData = convertToStoreFormat(formData);
      await onSave(storeData); // Call the parent callback first to update the data
      await saveSection('projects'); // Then save to the store
      toast({
        title: "Success",
        description: "Projects information saved successfully",
      });
    } catch (error) {
      console.error('Manual save error:', error);
      toast({
        title: "Error",
        description: "Failed to save projects information",
        variant: "destructive",
      });
    }
  };

  const addNewProject = () => {
    append({
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      current: false,
      url: '',
      description: '',
      bulletPoints: [{ value: '' }]
    });
    setActiveIndex(fields.length);
  };

  const removeProject = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setActiveIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      setValue(`entries.${activeIndex}.url`, `https://${value}`);
    }
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.title && activeEntry?.organization
    ? `${activeEntry.title} - ${activeEntry.organization}`
    : "New Project Entry";

  // Track when we're just navigating (not making actual changes)
  const isNavigatingRef = useRef(false);

  // Effect to ensure form fields update when navigating between entries
  useEffect(() => {
    const currentEntries = getValues("entries");
    if (currentEntries && currentEntries[activeIndex]) {
      // Mark that we're navigating to prevent dirty state
      isNavigatingRef.current = true;
      
      const entry = currentEntries[activeIndex];
      
      // Use setValue with shouldDirty: false to prevent triggering dirty state
      setValue(`entries.${activeIndex}.title`, entry.title || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.organization`, entry.organization || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.startDate`, entry.startDate || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.endDate`, entry.endDate || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.current`, entry.current || false, { shouldDirty: false });
      setValue(`entries.${activeIndex}.url`, entry.url || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.description`, entry.description || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.bulletPoints`, entry.bulletPoints || [{ value: '' }], { shouldDirty: false });
      
      // Reset navigation flag after a short delay
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 50);
    }
  }, [activeIndex, setValue, getValues]);

  return (
    <div className={`resume-form-container ${isSaving ? 'resume-form-container--saving' : ''} ${isDirty ? 'resume-form-container--dirty' : ''}`}>
      {/* Background gradient effect */}
      <div className="resume-form-background" aria-hidden="true" />
      
      {/* Subtle pattern overlay */}
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
          <div className="resume-form-nav">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))} 
              disabled={activeIndex === 0 || isSaving}
              className="resume-form-nav-button"
            >
              <ChevronLeft className="h-4 w-4 text-corporate-navy-700 dark:text-gray-300" />
            </Button>
            <span className="resume-form-nav-counter">
              {activeIndex + 1} / {fields.length}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveIndex(Math.min(fields.length - 1, activeIndex + 1))} 
              disabled={activeIndex === fields.length - 1 || isSaving}
              className="resume-form-nav-button"
            >
              <ChevronRight className="h-4 w-4 text-corporate-navy-700 dark:text-gray-300" />
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
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleManualSave} className="space-y-6" aria-busy={isSaving}>
          {/* Project Title & Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="resume-label">
                Project Title <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.title ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Input 
                  {...register(`entries.${activeIndex}.title`)} 
                  placeholder="E-Commerce Platform"
                  className="resume-input"
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.title && (
                <p className="resume-error-message">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.title?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="resume-label">
                Organization <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.organization ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Input 
                  {...register(`entries.${activeIndex}.organization`)} 
                  placeholder="Microsoft Corporation"
                  className="resume-input"
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.organization && (
                <p className="resume-error-message">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.organization?.message}
                </p>
              )}
            </div>
          </div>

          {/* Time Period & URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="resume-label">
                Time Period
              </Label>
              <div className="flex items-start gap-2">
                <div className="flex-grow space-y-2">
                  <div className={`resume-input-container ${errors.entries?.[activeIndex]?.startDate ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                    <Input 
                      {...register(`entries.${activeIndex}.startDate`)} 
                      placeholder="Jan 2023"
                      className="resume-input"
                      disabled={isSaving}
                    />
                  </div>
                  {errors.entries?.[activeIndex]?.startDate && (
                    <p className="resume-error-message">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.entries[activeIndex]?.startDate?.message}
                    </p>
                  )}
                </div>
                
                <div className="flex-grow space-y-2">
                  <div className={`resume-input-container ${errors.entries?.[activeIndex]?.endDate ? 'resume-input-container--error' : ''} ${watch(`entries.${activeIndex}.current`) ? 'opacity-50' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                    <Input 
                      {...register(`entries.${activeIndex}.endDate`)} 
                      placeholder="Present"
                      disabled={watch(`entries.${activeIndex}.current`) || isSaving}
                      className="resume-input"
                    />
                  </div>
                  {errors.entries?.[activeIndex]?.endDate && (
                    <p className="resume-error-message">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {errors.entries[activeIndex]?.endDate?.message}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-center pt-2 gap-2">
                  <Controller
                    name={`entries.${activeIndex}.current`}
                    control={control}
                    render={({ field }) => (
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                        className="scale-75 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-corporate-gold-500 data-[state=checked]:to-corporate-amber-500"
                      />
                    )}
                  />
                  <Label className="text-xs text-corporate-navy-600 dark:text-gray-400 text-center">
                    Ongoing
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="resume-label">
                Project URL
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.url ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''} relative`}>
                <Input 
                  {...register(`entries.${activeIndex}.url`)} 
                  placeholder="https://www.example.com"
                  onBlur={handleUrlBlur}
                  className="resume-input pr-10"
                  disabled={isSaving}
                />
                {watch(`entries.${activeIndex}.url`) && (
                  <a
                    href={watch(`entries.${activeIndex}.url`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-corporate-navy-400 hover:text-corporate-amber-500 dark:hover:text-corporate-amber-400 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Project Description / Key Achievements */}
          <div className="space-y-2">
            <Label className="resume-label">
              Key Features & Achievements
            </Label>
            <div className="space-y-3">
              {bulletPointFields.map((field, bulletIndex) => (
                <div key={field.id} className="resume-bullet-item group">
                  <GripVertical className="resume-bullet-grip" />
                  <div className={`resume-bullet-input ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                    <Textarea
                      {...register(`entries.${activeIndex}.bulletPoints.${bulletIndex}.value`)}
                      placeholder="• Built responsive web application with React and TypeScript serving 10,000+ users"
                      className="resume-textarea min-h-[60px]"
                      rows={2}
                      disabled={isSaving}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeBulletPoint(bulletIndex)} 
                    disabled={isSaving}
                    className="resume-bullet-remove"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => appendBulletPoint({ value: '' })} 
                disabled={isSaving}
                className="resume-button-secondary w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="resume-form-actions">
            <div className="flex items-center gap-2">
              {isDirty && (
                <span className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <div className="resume-section-dirty-dot" />
                  Unsaved changes
                </span>
              )}
              {!isDirty && saveStatus.lastSaved && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <div className="resume-section-clean-dot" />
                  Saved
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
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
              <Button 
                type="submit"
                disabled={isSaving || !isDirty}
                className="resume-button-primary"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="resume-button-icon animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="resume-button-icon" />
                    Save Projects
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