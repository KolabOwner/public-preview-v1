'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GraduationCap, CalendarIcon, Save, Loader2, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
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
  institution: z.string().min(1, "Institution is required."),
  qualification: z.string().min(1, "Qualification is required."),
  location: z.string().optional(),
  date: z.date({ required_error: "Please select a date." }),
  dateFormat: z.string().optional(),
  minor: z.string().optional(),
  score: z.string().optional(),
  scoreType: z.string().optional(),
  description: z.string().optional(),
}).refine(data => data.score ? !!data.scoreType?.trim() : true, {
  message: "Score type is required when a score is provided.",
  path: ["scoreType"],
});

const educationSchema = z.object({
  entries: z.array(educationEntrySchema),
});

export type EducationEntry = z.infer<typeof educationEntrySchema>;
type EducationFormData = z.infer<typeof educationSchema>;

const cleanValue = (value: any): string => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-', 'NA'].includes(trimmed) ? '' : trimmed;
};

const parseDate = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'number') return new Date(dateValue); // Assume timestamp
    if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) return date;
    }
    return undefined;
};

export default function EducationForm({ initialData, onSave }: { initialData: any[], onSave: (data: EducationEntry[]) => Promise<void> }) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      entries: initialData.length > 0 
        ? initialData.map(e => {
            const institutionRaw = cleanValue(e.institution || e.school);
            let institution = institutionRaw;
            let location = cleanValue(e.location);
            
            // Always check if institution contains location (comma-separated)
            if (institutionRaw.includes(',')) {
              const parts = institutionRaw.split(',');
              institution = parts[0].trim();
              // If no location field, use the part after comma
              if (!location) {
                location = parts.slice(1).join(',').trim();
              }
            }
            
            return {
              ...e,
              institution,
              qualification: cleanValue(e.qualification || e.degree),
              location,
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

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, watch } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const handleSaveWrapper = async (data: EducationFormData) => {
    try {
      // Process entries to ensure institution names don't contain locations
      const processedEntries = data.entries.map(entry => {
        let { institution, location, ...rest } = entry;
        
        // If institution contains comma, extract location
        if (institution && institution.includes(',')) {
          const parts = institution.split(',');
          institution = parts[0].trim();
          // Only update location if it's empty
          if (!location) {
            location = parts.slice(1).join(',').trim();
          }
        }
        
        return { ...rest, institution, location };
      });
      
      await onSave(processedEntries);
      toast({
        title: "Success",
        description: "Education saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save education.",
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
    remove(index);
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.qualification && activeEntry?.institution
    ? `${activeEntry.qualification} at ${activeEntry.institution}`
    : "New Education Entry";

  // Handle institution name changes to extract location if present
  const handleInstitutionChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Check if institution contains a comma (indicating location)
    if (value.includes(',')) {
      const parts = value.split(',');
      if (parts.length >= 2) {
        // Extract institution name (before comma)
        const institutionName = parts[0].trim();
        // Extract location (after comma)
        const location = parts.slice(1).join(',').trim();
        
        // Update the institution field to only contain the institution name
        form.setValue(`entries.${index}.institution`, institutionName, { shouldValidate: true });
        
        // If location field is empty, populate it with the extracted location
        const currentLocation = form.getValues(`entries.${index}.location`);
        if (!currentLocation || currentLocation.trim() === '') {
          form.setValue(`entries.${index}.location`, location, { shouldValidate: true });
        }
      }
    }
  };

  const fieldWrapperClassName = (fieldName: keyof EducationEntry) => cn(
    "flex items-center rounded-md border-2 transition-colors bg-white dark:bg-gray-800",
    errors.entries?.[activeIndex]?.[fieldName]
      ? "border-red-500 dark:border-red-400"
      : "border-gray-200 dark:border-gray-600"
  );

  const inputClassName = "border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold px-3 w-full";

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          <span className="truncate pr-4">{headerTitle}</span>
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
              <Button variant="ghost" size="icon" onClick={() => removeEntry(activeIndex)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400">
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
              <Label htmlFor={`institution-${activeIndex}`}>Institution</Label>
              <div className={fieldWrapperClassName("institution")}>
                <Input 
                  id={`institution-${activeIndex}`} 
                  {...register(`entries.${activeIndex}.institution`)} 
                  placeholder="e.g., State University" 
                  className={inputClassName}
                  onBlur={(e) => handleInstitutionChange(e, activeIndex)}
                />
              </div>
              {errors.entries?.[activeIndex]?.institution && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.institution?.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`qualification-${activeIndex}`}>Qualification</Label>
              <div className={fieldWrapperClassName("qualification")}>
                <Input id={`qualification-${activeIndex}`} {...register(`entries.${activeIndex}.qualification`)} placeholder="e.g., B.S. in Computer Science" className={inputClassName} />
              </div>
              {errors.entries?.[activeIndex]?.qualification && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.qualification?.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Graduation Date</Label>
              <div className={fieldWrapperClassName("date")}>
                <Controller
                  name={`entries.${activeIndex}.date`}
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"ghost"} className={cn("w-full justify-start text-left font-normal", inputClassName)}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              {errors.entries?.[activeIndex]?.date && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.date?.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`location-${activeIndex}`}>Location</Label>
              <div className={fieldWrapperClassName("location")}>
                <Input id={`location-${activeIndex}`} {...register(`entries.${activeIndex}.location`)} placeholder="e.g., City, State" className={inputClassName} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`score-${activeIndex}`}>Score</Label>
              <div className={fieldWrapperClassName("score")}>
                <Input id={`score-${activeIndex}`} {...register(`entries.${activeIndex}.score`)} placeholder="e.g., 3.8" className={inputClassName} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`scoreType-${activeIndex}`}>Score Type</Label>
              <div className={fieldWrapperClassName("scoreType")}>
                <Input id={`scoreType-${activeIndex}`} {...register(`entries.${activeIndex}.scoreType`)} placeholder="e.g., GPA" className={inputClassName} />
              </div>
              {errors.entries?.[activeIndex]?.scoreType && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.scoreType?.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`description-${activeIndex}`}>Additional Details</Label>
            <div className={fieldWrapperClassName("description")}>
              <Textarea id={`description-${activeIndex}`} {...register(`entries.${activeIndex}.description`)} placeholder="e.g., Thesis, Coursework, Honors..." className={cn("h-24", inputClassName)} />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button type="button" variant="outline" onClick={addNewEntry}>
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Education</>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}