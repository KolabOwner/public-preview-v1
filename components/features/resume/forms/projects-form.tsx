'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Code2, Plus, X, ChevronLeft, ChevronRight, Sparkles, Save, Loader2, AlertCircle, ExternalLink, Calendar, Building2, GripVertical, Trash2 } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useUnsavedChanges } from '@/lib/client/hooks/use-unsaved-changes';
import { cleanPlaceholderValue, formatWebsiteUrl } from './utils/validation';

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
export type ProjectEntry = Omit<z.infer<typeof projectEntrySchema>, 'bulletPoints'> & {
  bulletPoints: string[];
};
type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectsFormProps {
  initialData: any[]; // Accept any format from database
  onSave: (data: ProjectEntry[]) => Promise<void>;
  autoSave?: boolean;
}

// Helper to clean placeholder values from initial data
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-'].includes(trimmed) ? '' : trimmed;
};

export default function ProjectsForm({ initialData, onSave }: ProjectsFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [saveDebounceTimer, setSaveDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      entries: initialData.length > 0 
        ? initialData.map((p: any) => {
            // Parse bullet points from description if bulletPoints array is empty
            let bulletPoints = p.bulletPoints?.filter(Boolean) || [];

            if (bulletPoints.length === 0 && p.description) {
              // Split by various bullet point formats: •, -, *, or newline followed by these
              const points = p.description
                .split(/(?:^|\n)\s*[•\-\*]\s*|(?<=[.!?])\s*•\s*/)
                .map((point: string) => point.trim())
                .filter((point: string) => point.length > 0);

              bulletPoints = points;
            }

            return {
              ...p,
              title: cleanValue(p.title || p.name || p.projectName) || "",
              organization: cleanValue(p.organization || p.company || p.client) || "",
              startDate: cleanValue(p.startDate || p.start) || "",
              endDate: cleanValue(p.endDate || p.end) || "",
              url: cleanValue(p.url || p.projectUrl || p.link) || "",
              description: cleanValue(p.description) || "",
              bulletPoints: bulletPoints.length > 0 ? bulletPoints.map(bp => ({ value: bp })) : [{ value: '' }],
            };
          })
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

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const { fields: bulletPointFields, append: appendBulletPoint, remove: removeBulletPoint } = useFieldArray({
    control,
    name: `entries.${activeIndex}.bulletPoints`
  });

  // Debounced save function
  const debouncedSave = useCallback(async () => {
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
    }

    setIsDebouncing(true);

    const timer = setTimeout(async () => {
      try {
        const currentData = getValues();
        const dataToSave = currentData.entries.map(entry => ({
          ...entry,
          bulletPoints: entry.bulletPoints ? entry.bulletPoints.map(bp => bp.value) : [],
        }));
        await onSave(dataToSave);
        toast({
          title: "Success",
          description: "Projects saved successfully.",
        });
      } catch (error) {
        console.error('Save error:', error);
        toast({
          title: "Error",
          description: "Failed to save projects.",
          variant: "destructive",
        });
      } finally {
        setIsDebouncing(false);
      }
    }, 1000);
    
    setSaveDebounceTimer(timer);
  }, [saveDebounceTimer, getValues, onSave, toast]);

  // Unsaved changes detection
  const { hasUnsavedChanges } = useUnsavedChanges({
    initialData,
    getCurrentData: () => {
      const currentData = getValues();
      return currentData.entries.map(entry => ({
        ...entry,
        bulletPoints: entry.bulletPoints ? entry.bulletPoints.map(bp => bp.value) : [],
      }));
    },
    isSaving: isSubmitting || isDebouncing,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveDebounceTimer) {
        clearTimeout(saveDebounceTimer);
      }
    };
  }, [saveDebounceTimer]);

  const handleSaveWrapper = async (data: ProjectFormData) => {
    try {
      const dataToSave = data.entries.map(entry => ({
        ...entry,
        bulletPoints: entry.bulletPoints ? entry.bulletPoints.map(bp => bp.value) : [],
      }));
      await onSave(dataToSave);
      toast({
        title: "Success",
        description: "Projects saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save projects.",
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
    remove(index);
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = cleanPlaceholderValue(e.target.value);
    const formatted = formatWebsiteUrl(cleanValue);
    setValue(`entries.${activeIndex}.url`, formatted, { shouldValidate: true });
  }, [setValue, activeIndex]);

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.title && activeEntry?.organization
    ? `${activeEntry.title} - ${activeEntry.organization}`
    : "New Project Entry";


  return (
    <div className={`bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${
      (isSubmitting || isDebouncing) ? 'opacity-75 pointer-events-none' : ''
    }`}>
      <div className="px-6 py-4 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4 flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          {headerTitle}
        </h2>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 text-center">
            {activeIndex + 1} / {fields.length}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setActiveIndex(Math.min(fields.length - 1, activeIndex + 1))} disabled={activeIndex === fields.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {fields.length > 1 && (
            <>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
              <Button variant="ghost" size="icon" onClick={() => removeProject(activeIndex)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {fields.length > 0 && (
        <form onSubmit={handleSubmit(handleSaveWrapper)} className="p-6 space-y-6" aria-busy={isSubmitting || isDebouncing}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`title-${activeIndex}`}>Project Title</Label>
              <Input id={`title-${activeIndex}`} {...register(`entries.${activeIndex}.title`)} placeholder="e.g. E-Commerce Platform" disabled={isSubmitting || isDebouncing} />
              {errors.entries?.[activeIndex]?.title && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.title?.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`organization-${activeIndex}`}>Organization</Label>
              <Input id={`organization-${activeIndex}`} {...register(`entries.${activeIndex}.organization`)} placeholder="e.g. Microsoft" disabled={isSubmitting || isDebouncing} />
              {errors.entries?.[activeIndex]?.organization && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.organization?.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Time Period</Label>
              <div className="flex items-start gap-2">
                <div className="flex-grow space-y-2">
                  <Input {...register(`entries.${activeIndex}.startDate`)} placeholder="Start Date" disabled={isSubmitting || isDebouncing} />
                  {errors.entries?.[activeIndex]?.startDate && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.startDate?.message}</p>}
                </div>
                <div className="flex-grow space-y-2">
                  <Input {...register(`entries.${activeIndex}.endDate`)} placeholder="End Date" disabled={watch(`entries.${activeIndex}.current`) || isSubmitting || isDebouncing} />
                  {errors.entries?.[activeIndex]?.endDate && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.endDate?.message}</p>}
                </div>
                <div className="flex items-center pt-2">
                  <Controller
                    name={`entries.${activeIndex}.current`}
                    control={control}
                    render={({ field }) => <Switch id={`current-${activeIndex}`} checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting || isDebouncing} />}
                  />
                  <Label htmlFor={`current-${activeIndex}`} className="ml-2">Ongoing</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`url-${activeIndex}`}>Project URL</Label>
              <div className="relative">
                <Input 
                  id={`url-${activeIndex}`} 
                  {...register(`entries.${activeIndex}.url`)} 
                  placeholder="https://www.example.com" 
                  onChange={handleUrlChange}
                  disabled={isSubmitting || isDebouncing}
                  className="pr-10"
                />
                {watch(`entries.${activeIndex}.url`) && (
                  <a
                    href={watch(`entries.${activeIndex}.url`)}
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

          <div className="space-y-2">
            <Label>Project Description / Key Achievements</Label>
            <div className="space-y-3">
              {bulletPointFields.map((field, bulletIndex) => (
                <div key={field.id} className="flex items-center gap-2 group">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                  <Textarea
                    {...register(`entries.${activeIndex}.bulletPoints.${bulletIndex}.value`)}
                    placeholder="Describe a key achievement or responsibility..."
                    className="flex-grow resize-none"
                    rows={2}
                    disabled={isSubmitting || isDebouncing}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeBulletPoint(bulletIndex)} 
                    className="opacity-50 group-hover:opacity-100"
                    disabled={isSubmitting || isDebouncing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => appendBulletPoint({ value: '' })} 
                className="w-full"
                disabled={isSubmitting || isDebouncing}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bullet Point
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button type="button" variant="outline" onClick={addNewProject} disabled={isSubmitting || isDebouncing}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Project
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">Unsaved changes</span>
                )}
                <Button type="button" variant="secondary" onClick={debouncedSave} disabled={isSubmitting || isDebouncing}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-save
                </Button>
              </div>
              <Button type="submit" disabled={isSubmitting || isDebouncing}>
                {isSubmitting || isDebouncing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Projects</>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}