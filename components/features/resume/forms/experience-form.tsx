'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, ChevronLeft, ChevronRight, Sparkles, Save, Loader2, Trash2, GripVertical } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';

// Schema for a single bullet point object
const bulletPointSchema = z.object({
  value: z.string(),
});

// Schema for a single experience entry
const experienceEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Job title is required."),
  company: z.string().min(1, "Company name is required."),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional(),
  current: z.boolean(),
  bulletPoints: z.array(bulletPointSchema).optional(),
}).refine(data => !data.current ? !!data.endDate?.trim() : true, {
  message: "End date is required unless it's a current position.",
  path: ["endDate"],
});

// Schema for the entire form
const experienceSchema = z.object({
  entries: z.array(experienceEntrySchema),
});

// TypeScript types inferred from schemas
type BulletPoint = z.infer<typeof bulletPointSchema>;
export type ExperienceEntry = Omit<z.infer<typeof experienceEntrySchema>, 'bulletPoints'> & {
  bulletPoints: string[];
};
type ExperienceFormData = z.infer<typeof experienceSchema>;

// Helper to clean placeholder values from initial data
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-'].includes(trimmed) ? '' : trimmed;
};

export default function ExperienceForm({ initialData, onSave }: { initialData: ExperienceEntry[], onSave: (data: ExperienceEntry[]) => Promise<void> }) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      entries: initialData.length > 0 
        ? initialData.map(e => ({
            ...e,
            title: cleanValue(e.title),
            company: cleanValue(e.company),
            location: cleanValue(e.location),
            startDate: cleanValue(e.startDate),
            endDate: cleanValue(e.endDate),
            bulletPoints: e.bulletPoints?.map(bp => ({ value: bp })) || [{ value: '' }],
          }))
        : [{
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
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

  const handleSaveWrapper = async (data: ExperienceFormData) => {
    try {
      const dataToSave = data.entries.map(entry => ({
        ...entry,
        bulletPoints: entry.bulletPoints ? entry.bulletPoints.map(bp => bp.value) : [],
      }));
      await onSave(dataToSave);
      toast({
        title: "Success",
        description: "Experience saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save experience.",
        variant: "destructive",
      });
    }
  };

  const addNewExperience = () => {
    append({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bulletPoints: [{ value: '' }]
    });
    setActiveIndex(fields.length);
  };

  const removeExperience = (index: number) => {
    remove(index);
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.title && activeEntry?.company
    ? `${activeEntry.title} at ${activeEntry.company}`
    : "New Experience Entry";

  // Effect to ensure form fields update when navigating between entries
  React.useEffect(() => {
    // Force form to re-register fields when activeIndex changes
    // This ensures the form displays the correct values for the active entry
    const currentEntries = getValues("entries");
    if (currentEntries && currentEntries[activeIndex]) {
      const entry = currentEntries[activeIndex];
      // Force field updates by setting values explicitly
      setValue(`entries.${activeIndex}.title`, entry.title || '');
      setValue(`entries.${activeIndex}.company`, entry.company || '');
      setValue(`entries.${activeIndex}.location`, entry.location || '');
      setValue(`entries.${activeIndex}.startDate`, entry.startDate || '');
      setValue(`entries.${activeIndex}.endDate`, entry.endDate || '');
      setValue(`entries.${activeIndex}.current`, entry.current || false);
      setValue(`entries.${activeIndex}.bulletPoints`, entry.bulletPoints || [{ value: '' }]);
    }
  }, [activeIndex, setValue, getValues]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">
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
              <Button variant="ghost" size="icon" onClick={() => removeExperience(activeIndex)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {fields.length > 0 && (
        <form onSubmit={handleSubmit(handleSaveWrapper)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`title-${activeIndex}`}>Job Title</Label>
              <Input id={`title-${activeIndex}`} {...register(`entries.${activeIndex}.title`)} placeholder="e.g. Software Engineer" />
              {errors.entries?.[activeIndex]?.title && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.title?.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`company-${activeIndex}`}>Company</Label>
              <Input id={`company-${activeIndex}`} {...register(`entries.${activeIndex}.company`)} placeholder="e.g. Google" />
              {errors.entries?.[activeIndex]?.company && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.company?.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`location-${activeIndex}`}>Location</Label>
              <Input id={`location-${activeIndex}`} {...register(`entries.${activeIndex}.location`)} placeholder="e.g. New York, NY" />
            </div>
            <div className="space-y-2">
              <Label>Time Period</Label>
              <div className="flex items-start gap-2">
                <div className="flex-grow space-y-2">
                  <Input {...register(`entries.${activeIndex}.startDate`)} placeholder="Start Date" />
                  {errors.entries?.[activeIndex]?.startDate && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.startDate?.message}</p>}
                </div>
                <div className="flex-grow space-y-2">
                  <Input {...register(`entries.${activeIndex}.endDate`)} placeholder="End Date" disabled={watch(`entries.${activeIndex}.current`)} />
                  {errors.entries?.[activeIndex]?.endDate && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.endDate?.message}</p>}
                </div>
                <div className="flex items-center pt-2">
                  <Controller
                    name={`entries.${activeIndex}.current`}
                    control={control}
                    render={({ field }) => <Switch id={`current-${activeIndex}`} checked={field.value} onCheckedChange={field.onChange} />}
                  />
                  <Label htmlFor={`current-${activeIndex}`} className="ml-2">Current</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Achievements / Responsibilities</Label>
            <div className="space-y-3">
              {bulletPointFields.map((field, bulletIndex) => (
                <div key={field.id} className="flex items-center gap-2 group">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                  <Textarea
                    {...register(`entries.${activeIndex}.bulletPoints.${bulletIndex}.value`)}
                    placeholder="Describe a key achievement..."
                    className="flex-grow resize-none"
                    rows={2}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeBulletPoint(bulletIndex)} className="opacity-50 group-hover:opacity-100">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendBulletPoint({ value: '' })} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Bullet Point
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button type="button" variant="outline" onClick={addNewExperience}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Position
            </Button>
            <div className="flex items-center gap-4">
              <Button type="button" variant="secondary">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Experience</>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}