'use client';

import React, { useState } from 'react';
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

const educationEntrySchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution is required"),
  qualification: z.string().min(1, "Qualification is required"),
  location: z.string().optional(),
  date: z.date({ required_error: "Graduation date is required" }),
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

export type EducationEntry = z.infer<typeof educationEntrySchema>;
type EducationFormData = z.infer<typeof educationSchema>;

interface EducationFormProps {
  initialData: any[];
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

export default function EducationForm({ initialData, onSave }: EducationFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      entries: (initialData && initialData.length > 0) 
        ? initialData.map(e => {
            const institutionRaw = cleanValue(e.institution || e.school);
            const { institution, location: extractedLocation } = extractInstitutionAndLocation(institutionRaw);
            const existingLocation = cleanValue(e.location);
            
            return {
              ...e,
              institution,
              qualification: cleanValue(e.qualification || e.degree),
              location: existingLocation || extractedLocation,
              date: parseDate(e.date || e.endDate || e.dateTS),
              dateFormat: cleanValue(e.dateFormat) || 'MMMM yyyy',
              minor: cleanValue(e.minor),
              score: cleanValue(e.score || e.gpa),
              scoreType: cleanValue(e.scoreType || e.gpaScale),
              description: cleanValue(e.description || e.details),
            };
          })
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

  const { register, control, handleSubmit, formState: { errors }, watch, setValue, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // Clean data to ensure no undefined values for Firestore
  const cleanDataForFirestore = (entry: any) => {
    const { institution, location: extractedLocation } = extractInstitutionAndLocation(entry.institution || '');
    
    return {
      id: entry.id || '',
      institution: institution || '',
      qualification: entry.qualification || '',
      location: entry.location || extractedLocation || '',
      date: entry.date || null,
      dateFormat: entry.dateFormat || 'MMMM yyyy',
      minor: entry.minor || '',
      score: entry.score || '',
      scoreType: entry.scoreType || '',
      description: entry.description || '',
    };
  };

  // Manual save
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const formData = getValues();
      
      // Process entries to ensure clean data with no undefined values
      const processedEntries = formData.entries.map(cleanDataForFirestore);
      
      await onSave(processedEntries);
      toast({
        title: "Success",
        description: "Education information saved successfully",
      });
    } catch (error) {
      console.error('Education save error:', error);
      toast({
        title: "Error",
        description: "Failed to save education information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  // Effect to ensure form fields update when navigating between entries
  React.useEffect(() => {
    // Force form to re-register fields when activeIndex changes
    // This ensures the form displays the correct values for the active entry
    const currentEntries = getValues("entries");
    if (currentEntries && currentEntries[activeIndex]) {
      const entry = currentEntries[activeIndex];
      // Force field updates by setting values explicitly
      setValue(`entries.${activeIndex}.institution`, entry.institution || '');
      setValue(`entries.${activeIndex}.qualification`, entry.qualification || '');
      setValue(`entries.${activeIndex}.location`, entry.location || '');
      setValue(`entries.${activeIndex}.date`, entry.date);
      setValue(`entries.${activeIndex}.dateFormat`, entry.dateFormat || 'MMMM yyyy');
      setValue(`entries.${activeIndex}.minor`, entry.minor || '');
      setValue(`entries.${activeIndex}.score`, entry.score || '');
      setValue(`entries.${activeIndex}.scoreType`, entry.scoreType || '');
      setValue(`entries.${activeIndex}.description`, entry.description || '');
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
              <GraduationCap className="h-4 w-4 text-white" />
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
                  onClick={() => removeEntry(activeIndex)} 
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
            {/* Institution & Qualification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Institution <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.institution 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Input 
                    {...register(`entries.${activeIndex}.institution`)} 
                    placeholder="University of Wisconsin-Madison"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                    onBlur={handleInstitutionBlur}
                    disabled={isSaving}
                  />
                </div>
                {errors.entries?.[activeIndex]?.institution && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.entries[activeIndex]?.institution?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Qualification <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.qualification 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Input 
                    {...register(`entries.${activeIndex}.qualification`)} 
                    placeholder="Bachelor of Science in Computer Science"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                    disabled={isSaving}
                  />
                </div>
                {errors.entries?.[activeIndex]?.qualification && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.entries[activeIndex]?.qualification?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Graduation Date <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.date 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
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
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.entries[activeIndex]?.date?.message}
                  </p>
                )}
              </div>

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
                    placeholder="Madison, WI"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Score & Score Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Score
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.score 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Input 
                    {...register(`entries.${activeIndex}.score`)} 
                    placeholder="3.8"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Score Type
                  {watch(`entries.${activeIndex}.score`) && <span className="text-corporate-amber-500 ml-1" aria-label="required when score is provided">*</span>}
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.scoreType 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Input 
                    {...register(`entries.${activeIndex}.scoreType`)} 
                    placeholder="GPA"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                    disabled={isSaving}
                  />
                </div>
                {errors.entries?.[activeIndex]?.scoreType && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.entries[activeIndex]?.scoreType?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                Additional Details
              </Label>
              <div className={`
                rounded-lg border-2 transition-all duration-200
                ${errors.entries?.[activeIndex]?.description 
                  ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                  : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                }
                ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
              `}>
                <Textarea 
                  {...register(`entries.${activeIndex}.description`)} 
                  placeholder="Thesis, Coursework, Honors, Activities..."
                  className="border-0 bg-transparent focus:ring-0 focus:border-0 h-24 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 p-3 resize-none"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t-2 border-corporate-navy-100 dark:border-corporate-navy-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={addNewEntry}
                disabled={isSaving}
                className="border-2 border-corporate-navy-300 dark:border-corporate-navy-600 text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-amber-900/20 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Education
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
                    Save Education
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