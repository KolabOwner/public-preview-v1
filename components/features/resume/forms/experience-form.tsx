'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, ChevronLeft, ChevronRight, Save, Loader2, Trash2, GripVertical, Briefcase, AlertCircle } from "lucide-react";
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
  return ['n/a', 'N/A', 'none', 'null', '-', 'NA'].includes(trimmed) ? '' : trimmed;
};

// Clean data to ensure no undefined values for Firestore
const cleanDataForFirestore = (entry: any) => {
  return {
    id: entry.id || '',
    title: entry.title || '',
    company: entry.company || '',
    location: entry.location || '',
    startDate: entry.startDate || '',
    endDate: entry.endDate || '',
    current: entry.current || false,
    description: entry.description || '',
    bulletPoints: Array.isArray(entry.bulletPoints) 
      ? entry.bulletPoints.filter((bp: any) => bp && typeof bp === 'string' && bp.trim().length > 0)
      : [],
  };
};

interface ExperienceFormProps {
  initialData: ExperienceEntry[];
  onSave: (data: ExperienceEntry[]) => Promise<void>;
}

export default function ExperienceForm({ initialData, onSave }: ExperienceFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      entries: (initialData && initialData.length > 0) 
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

  // Manual save
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const formData = getValues();
      
      // Process entries to ensure clean data with no undefined values
      const processedEntries = formData.entries.map(entry => {
        const cleaned = cleanDataForFirestore({
          ...entry,
          bulletPoints: entry.bulletPoints ? entry.bulletPoints.map(bp => bp.value).filter(v => v && v.trim()) : [],
        });
        return cleaned;
      });
      
      await onSave(processedEntries);
      toast({
        title: "Success",
        description: "Experience information saved successfully",
      });
    } catch (error) {
      console.error('Experience save error:', error);
      toast({
        title: "Error",
        description: "Failed to save experience information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
    if (fields.length > 1) {
      remove(index);
      setActiveIndex(prev => Math.max(0, prev - 1));
    }
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
    <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
      isSaving 
        ? 'opacity-75 pointer-events-none border-corporate-amber-300 dark:border-corporate-amber-600' 
        : 'border-corporate-navy-200 dark:border-corporate-navy-700 hover:border-corporate-amber-300 dark:hover:border-corporate-amber-600/50'
    }`}>
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-corporate-gold-50/30 via-white to-corporate-amber-50/20 dark:from-corporate-navy-900 dark:via-corporate-navy-800 dark:to-corporate-navy-900" aria-hidden="true" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.02),transparent_50%)]" aria-hidden="true" />
      
      <div className="relative">
        {/* Header */}
        <div className="px-6 py-4 bg-white/90 dark:bg-corporate-navy-800/90 backdrop-blur-sm border-b-2 border-corporate-navy-100 dark:border-corporate-navy-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-corporate-navy-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-corporate-gold-500 to-corporate-amber-500 rounded-lg shadow-sm">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="truncate pr-4">{headerTitle}</span>
          </h2>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))} 
              disabled={activeIndex === 0 || isSaving}
              className="hover:bg-corporate-amber-100 dark:hover:bg-corporate-amber-900/20 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4 text-corporate-navy-700 dark:text-gray-300" />
            </Button>
            <span className="text-sm font-medium text-corporate-navy-600 dark:text-gray-400 w-12 text-center bg-corporate-navy-50 dark:bg-corporate-navy-800 rounded-md py-1">
              {activeIndex + 1} / {fields.length}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveIndex(Math.min(fields.length - 1, activeIndex + 1))} 
              disabled={activeIndex === fields.length - 1 || isSaving}
              className="hover:bg-corporate-amber-100 dark:hover:bg-corporate-amber-900/20 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4 text-corporate-navy-700 dark:text-gray-300" />
            </Button>
            {fields.length > 1 && (
              <>
                <div className="w-px h-6 bg-corporate-navy-200 dark:bg-corporate-navy-600 mx-2" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeExperience(activeIndex)} 
                  disabled={isSaving}
                  className="text-corporate-navy-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="relative bg-white/80 dark:bg-corporate-navy-900/90 backdrop-blur-sm p-6 md:p-8">
          <div className="space-y-6">
            {/* Job Title & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Job Title <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.title 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Input 
                    {...register(`entries.${activeIndex}.title`)} 
                    placeholder="Software Engineer"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                    disabled={isSaving}
                  />
                </div>
                {errors.entries?.[activeIndex]?.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.entries[activeIndex]?.title?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Company <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.company 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Input 
                    {...register(`entries.${activeIndex}.company`)} 
                    placeholder="Google Inc."
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                    disabled={isSaving}
                  />
                </div>
                {errors.entries?.[activeIndex]?.company && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.entries[activeIndex]?.company?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Location & Time Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Location
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.location 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Input 
                    {...register(`entries.${activeIndex}.location`)} 
                    placeholder="New York, NY"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Time Period
                </Label>
                <div className="flex items-start gap-2">
                  <div className="flex-grow space-y-2">
                    <div className={`
                      flex items-center rounded-lg border-2 transition-all duration-200
                      ${errors.entries?.[activeIndex]?.startDate 
                        ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                        : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                      }
                      ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                    `}>
                      <Input 
                        {...register(`entries.${activeIndex}.startDate`)} 
                        placeholder="Jan 2023"
                        className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                        disabled={isSaving}
                      />
                    </div>
                    {errors.entries?.[activeIndex]?.startDate && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {errors.entries[activeIndex]?.startDate?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    <div className={`
                      flex items-center rounded-lg border-2 transition-all duration-200
                      ${errors.entries?.[activeIndex]?.endDate 
                        ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                        : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                      }
                      ${watch(`entries.${activeIndex}.current`) ? 'opacity-50' : ''}
                      ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                    `}>
                      <Input 
                        {...register(`entries.${activeIndex}.endDate`)} 
                        placeholder="Present"
                        disabled={watch(`entries.${activeIndex}.current`) || isSaving}
                        className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                      />
                    </div>
                    {errors.entries?.[activeIndex]?.endDate && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
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
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-corporate-gold-500 data-[state=checked]:to-corporate-amber-500"
                        />
                      )}
                    />
                    <Label className="text-xs text-corporate-navy-600 dark:text-gray-400 text-center">
                      Current
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements / Responsibilities */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                Key Achievements & Responsibilities
              </Label>
              <div className="space-y-3">
                {bulletPointFields.map((field, bulletIndex) => (
                  <div key={field.id} className="flex items-start gap-2 group">
                    <GripVertical className="h-5 w-5 text-corporate-navy-400 dark:text-gray-500 cursor-grab mt-1 flex-shrink-0" />
                    <div className={`
                      flex-grow rounded-lg border-2 transition-all duration-200
                      ${'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'}
                      ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                    `}>
                      <Textarea
                        {...register(`entries.${activeIndex}.bulletPoints.${bulletIndex}.value`)}
                        placeholder="• Increased team productivity by 25% through implementation of automated testing frameworks"
                        className="border-0 bg-transparent focus:ring-0 focus:border-0 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 p-3 resize-none min-h-[60px]"
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
                      className="opacity-50 group-hover:opacity-100 text-corporate-navy-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 mt-1 flex-shrink-0"
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
                  className="w-full border-2 border-corporate-navy-300 dark:border-corporate-navy-600 text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-amber-900/20 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Achievement
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t-2 border-corporate-navy-100 dark:border-corporate-navy-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={addNewExperience}
                disabled={isSaving}
                className="border-2 border-corporate-navy-300 dark:border-corporate-navy-600 text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-amber-900/20 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full md:w-auto bg-gradient-to-r from-corporate-gold-500 to-corporate-amber-500 hover:from-corporate-gold-400 hover:to-corporate-amber-400 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Experience
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}