'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GraduationCap, CalendarIcon, Save, Loader2, ChevronLeft, ChevronRight, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shared/popover';
import { Calendar } from '@/components/shared/calendar';
import { format } from 'date-fns';
import { cn } from "@/components/shared";
import { useResumeStore, type EducationEntry } from '@/lib/client/stores/resume-store';
import '../styles/form-styles.css';

const educationEntrySchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution is required"),
  qualification: z.string().min(1, "Qualification is required"),
  location: z.string().optional(),
  date: z.date({ required_error: "Graduation date is required" }).optional(),
  dateFormat: z.string().optional(),
  minor: z.string().optional(),
  score: z.string().optional(),
  scoreType: z.string().optional(),
  description: z.string().optional(),
}).refine(data => data.score ? !!data.scoreType?.trim() : true, {
  message: "Score type is required when a score is provided",
  path: ["scoreType"],
});

const educationSchema = z.object({
  entries: z.array(educationEntrySchema),
});

type EducationFormEntry = z.infer<typeof educationEntrySchema>;
type EducationFormData = z.infer<typeof educationSchema>;

interface EducationFormProps {
  initialData: EducationEntry[];
  onSave: (data: EducationEntry[]) => Promise<void>;
}

// Clean placeholder values and format fields
const cleanValue = (value: any): string => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-', 'NA'].includes(trimmed) ? '' : trimmed;
};

const parseDate = (dateValue: any): Date | undefined => {
  if (!dateValue) return undefined;
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === 'number') return new Date(dateValue);
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) return date;
  }
  return undefined;
};

const extractInstitutionAndLocation = (institutionRaw: string) => {
  if (!institutionRaw.includes(',')) {
    return { institution: institutionRaw, location: '' };
  }
  
  const parts = institutionRaw.split(',');
  return {
    institution: parts[0].trim(),
    location: parts.slice(1).join(',').trim()
  };
};

// Convert store format to form format
const convertToFormFormat = (entries: EducationEntry[]): EducationFormEntry[] => {
  return entries.map(entry => {
    const institutionRaw = cleanValue(entry.institution);
    const { institution, location: extractedLocation } = extractInstitutionAndLocation(institutionRaw);
    const existingLocation = cleanValue(entry.location);
    
    return {
      ...entry,
      institution,
      qualification: cleanValue(entry.qualification),
      location: existingLocation || extractedLocation,
      date: parseDate(entry.date),
      dateFormat: cleanValue(entry.dateFormat) || 'MMMM yyyy',
      minor: cleanValue(entry.minor),
      score: cleanValue(entry.score),
      scoreType: cleanValue(entry.scoreType),
      description: cleanValue(entry.description),
    };
  });
};

// Convert form format to store format
const convertToStoreFormat = (formData: EducationFormData): EducationEntry[] => {
  return formData.entries.map(entry => {
    const { institution, location: extractedLocation } = extractInstitutionAndLocation(entry.institution || '');
    
    return {
      id: entry.id || '',
      institution: institution || '',
      qualification: entry.qualification || '',
      location: entry.location || extractedLocation || '',
      date: entry.date || undefined,
      dateFormat: entry.dateFormat || 'MMMM yyyy',
      minor: entry.minor || '',
      score: entry.score || '',
      scoreType: entry.scoreType || '',
      description: entry.description || '',
    };
  });
};

export default function EducationForm({ initialData, onSave }: EducationFormProps) {
  const { toast } = useToast();
  const { updateSection, saveSection, isSectionDirty, saveStatus } = useResumeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const previousDataRef = useRef<string>('');

  const isDirty = isSectionDirty('education');
  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('education');

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      entries: (initialData && initialData.length > 0) 
        ? convertToFormFormat(initialData)
        : [{
            institution: '',
            qualification: '',
            location: '',
            date: undefined,
            dateFormat: 'MMMM yyyy',
            minor: '',
            score: '',
            scoreType: '',
            description: '',
          }]
    },
    mode: 'onChange',
  });

  const { register, control, formState: { errors }, watch, setValue, getValues, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // Reset form when initialData changes (when switching resumes)
  useEffect(() => {
    const formData = (initialData && initialData.length > 0) 
      ? convertToFormFormat(initialData)
      : [{
          institution: '',
          qualification: '',
          location: '',
          date: undefined,
          dateFormat: 'MMMM yyyy',
          minor: '',
          score: '',
          scoreType: '',
          description: '',
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
      updateSection('education', storeData);
    }
  }, [watchedValues, updateSection, initialData]);

  // Manual save function
  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = getValues();
    
    try {
      const storeData = convertToStoreFormat(formData);
      await onSave(storeData); // Call the parent callback first to update the data
      await saveSection('education'); // Then save to the store
      toast({
        title: "Success",
        description: "Education information saved successfully",
      });
    } catch (error) {
      console.error('Manual save error:', error);
      toast({
        title: "Error",
        description: "Failed to save education information",
        variant: "destructive",
      });
    }
  };

  const addNewEntry = () => {
    append({
      institution: '',
      qualification: '',
      location: '',
      date: new Date(),
      dateFormat: 'MMMM yyyy',
      minor: '',
      score: '',
      scoreType: '',
      description: '',
    });
    setActiveIndex(fields.length);
  };

  const removeEntry = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setActiveIndex(prev => Math.max(0, prev - 1));
    }
  };

  // Handle institution name changes to extract location if present
  const handleInstitutionBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const { institution, location } = extractInstitutionAndLocation(value);
      setValue(`entries.${activeIndex}.institution`, institution);
      
      // Only update location if it's currently empty
      const currentLocation = getValues(`entries.${activeIndex}.location`);
      if (!currentLocation?.trim()) {
        setValue(`entries.${activeIndex}.location`, location);
      }
    }
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.qualification && activeEntry?.institution
    ? `${activeEntry.qualification} at ${activeEntry.institution}`
    : "New Education Entry";

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
      setValue(`entries.${activeIndex}.institution`, entry.institution || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.qualification`, entry.qualification || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.location`, entry.location || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.date`, entry.date, { shouldDirty: false });
      setValue(`entries.${activeIndex}.dateFormat`, entry.dateFormat || 'MMMM yyyy', { shouldDirty: false });
      setValue(`entries.${activeIndex}.minor`, entry.minor || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.score`, entry.score || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.scoreType`, entry.scoreType || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.description`, entry.description || '', { shouldDirty: false });
      
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
              <GraduationCap className="h-4 w-4 text-white" />
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
                  onClick={() => removeEntry(activeIndex)} 
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
          {/* Institution & Qualification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="resume-label">
                Institution <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.institution ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Input 
                  {...register(`entries.${activeIndex}.institution`)} 
                  placeholder="University of Wisconsin-Madison"
                  className="resume-input"
                  onBlur={handleInstitutionBlur}
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.institution && (
                <p className="resume-error-message">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.institution?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="resume-label">
                Qualification <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.qualification ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Input 
                  {...register(`entries.${activeIndex}.qualification`)} 
                  placeholder="Bachelor of Science in Computer Science"
                  className="resume-input"
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.qualification && (
                <p className="resume-error-message">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.qualification?.message}
                </p>
              )}
            </div>
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="resume-label">
                Graduation Date <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.date ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Controller
                  name={`entries.${activeIndex}.date`}
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left font-normal hover:bg-transparent border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 px-3"
                          disabled={isSaving}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70" />
                          {field.value ? format(field.value, 'PPP') : <span className="text-corporate-navy-400 dark:text-gray-500">Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-2 border-corporate-navy-200 dark:border-corporate-navy-600">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              {errors.entries?.[activeIndex]?.date && (
                <p className="resume-error-message">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.date?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="resume-label">
                Location
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.location ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Input 
                  {...register(`entries.${activeIndex}.location`)} 
                  placeholder="Madison, WI"
                  className="resume-input"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Score & Score Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="resume-label">
                Score
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.score ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Input 
                  {...register(`entries.${activeIndex}.score`)} 
                  placeholder="3.8"
                  className="resume-input"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="resume-label">
                Score Type
                {watch(`entries.${activeIndex}.score`) && <span className="resume-label-required" aria-label="required when score is provided">*</span>}
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.scoreType ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Input 
                  {...register(`entries.${activeIndex}.scoreType`)} 
                  placeholder="GPA"
                  className="resume-input"
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.scoreType && (
                <p className="resume-error-message">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.scoreType?.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="resume-label">
              Additional Details
            </Label>
            <div className={`resume-input-container ${errors.entries?.[activeIndex]?.description ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
              <Textarea 
                {...register(`entries.${activeIndex}.description`)} 
                placeholder="Thesis, Coursework, Honors, Activities..."
                className="resume-textarea h-24 resize-none"
                disabled={isSaving}
              />
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
                onClick={addNewEntry}
                disabled={isSaving}
                className="resume-button-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Education
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
                    Save Education
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