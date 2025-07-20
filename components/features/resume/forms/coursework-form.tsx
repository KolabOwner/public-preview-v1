'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, Save, Loader2, PlusCircle, ChevronLeft, ChevronRight, AlertCircle, Plus, X, Calendar, GraduationCap, Lightbulb, PenTool, Trash2, Sparkles } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useUnsavedChanges } from '@/lib/client/hooks/use-unsaved-changes';
import { cleanPlaceholderValue } from './utils/validation';

// Schema for a single coursework entry
const courseworkEntrySchema = z.object({
  id: z.string().optional(),
  courseName: z.string().min(1, "Course name is required."),
  institution: z.string().min(1, "Institution is required."),
  date: z.string().min(1, "Date is required."),
  skill: z.string().min(1, "Key skill is required."),
  application: z.string().optional(),
});

// Schema for the entire form
const courseworkSchema = z.object({
  entries: z.array(courseworkEntrySchema),
});

// TypeScript types inferred from schemas
export type CourseworkEntry = z.infer<typeof courseworkEntrySchema>;
type CourseworkFormData = z.infer<typeof courseworkSchema>;

interface CourseworkFormProps {
  initialData: any[]; // Accept any format from database
  onSave: (data: CourseworkEntry[]) => Promise<void>;
  autoSave?: boolean;
}

// Helper to clean placeholder values from initial data
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-'].includes(trimmed) ? '' : trimmed;
};

export default function CourseworkForm({ initialData, onSave }: CourseworkFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [saveDebounceTimer, setSaveDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const form = useForm<CourseworkFormData>({
    resolver: zodResolver(courseworkSchema),
    defaultValues: {
      entries: initialData.length > 0 
        ? initialData.map((course: any) => ({
            ...course,
            courseName: cleanValue(course.courseName || course.name || course.title) || "",
            institution: cleanValue(course.institution || course.school || course.university) || "",
            date: cleanValue(course.date || course.year || course.when) || "",
            skill: cleanValue(course.skill || course.skillLearned || course.keySkill) || "",
            application: cleanValue(course.application || course.howApplied || course.description) || ""
          }))
        : [{
            courseName: '',
            institution: '',
            date: '',
            skill: '',
            application: ''
          }]
    },
    mode: 'onChange',
  });

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
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
        const dataToSave = currentData.entries;
        await onSave(dataToSave);
        toast({
          title: "Success",
          description: "Coursework saved successfully.",
        });
      } catch (error) {
        console.error('Save error:', error);
        toast({
          title: "Error",
          description: "Failed to save coursework.",
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
      return currentData.entries;
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

  const handleSaveWrapper = async (data: CourseworkFormData) => {
    try {
      const dataToSave = data.entries;
      await onSave(dataToSave);
      toast({
        title: "Success",
        description: "Coursework saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save coursework.",
        variant: "destructive",
      });
    }
  };

  const addNewCoursework = () => {
    append({
      courseName: '',
      institution: '',
      date: '',
      skill: '',
      application: ''
    });
    setActiveIndex(fields.length);
  };

  const removeCoursework = (index: number) => {
    remove(index);
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.courseName
    ? `${activeEntry.courseName}`
    : "New Coursework Entry";


  return (
    <div className={`bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${
      (isSubmitting || isDebouncing) ? 'opacity-75 pointer-events-none' : ''
    }`}>
      <div className="px-6 py-4 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
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
              <Button variant="ghost" size="icon" onClick={() => removeCoursework(activeIndex)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400">
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
              <Label htmlFor={`courseName-${activeIndex}`}>Course Name</Label>
              <Input id={`courseName-${activeIndex}`} {...register(`entries.${activeIndex}.courseName`)} placeholder="e.g. Introduction to Computer Systems" disabled={isSubmitting || isDebouncing} />
              {errors.entries?.[activeIndex]?.courseName && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.courseName?.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`institution-${activeIndex}`}>Institution</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input 
                  id={`institution-${activeIndex}`} 
                  {...register(`entries.${activeIndex}.institution`)} 
                  placeholder="e.g. University of Wisconsin, Madison" 
                  disabled={isSubmitting || isDebouncing}
                  className="pl-10"
                />
              </div>
              {errors.entries?.[activeIndex]?.institution && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.institution?.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`date-${activeIndex}`}>Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input 
                  id={`date-${activeIndex}`} 
                  {...register(`entries.${activeIndex}.date`)} 
                  placeholder="e.g. 2025" 
                  disabled={isSubmitting || isDebouncing}
                  className="pl-10"
                />
              </div>
              {errors.entries?.[activeIndex]?.date && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.date?.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`skill-${activeIndex}`}>Key Skill</Label>
              <div className="relative">
                <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input 
                  id={`skill-${activeIndex}`} 
                  {...register(`entries.${activeIndex}.skill`)} 
                  placeholder="e.g. Teamwork" 
                  disabled={isSubmitting || isDebouncing}
                  className="pl-10"
                />
              </div>
              {errors.entries?.[activeIndex]?.skill && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.skill?.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`application-${activeIndex}`}>Skill Application</Label>
            <div className="relative">
              <PenTool className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Textarea
                id={`application-${activeIndex}`}
                {...register(`entries.${activeIndex}.application`)}
                placeholder="Describe specific examples of how you applied this skill during the course..."
                className="pl-10 resize-none"
                rows={4}
                disabled={isSubmitting || isDebouncing}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Describe specific examples of how you applied this skill during the course.
            </p>
          </div>

          {/* Course Preview Card */}
          {(activeEntry?.courseName || activeEntry?.skill) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {activeEntry?.courseName || "Course Name"}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activeEntry?.institution && <span>{activeEntry.institution}</span>}
                    {activeEntry?.institution && activeEntry?.date && <span className="mx-2">•</span>}
                    {activeEntry?.date && <span>{activeEntry.date}</span>}
                  </p>
                  {activeEntry?.skill && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {activeEntry.skill}
                      </span>
                    </div>
                  )}
                  {activeEntry?.application && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">
                      {activeEntry.application}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button type="button" variant="outline" onClick={addNewCoursework} disabled={isSubmitting || isDebouncing}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Course
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
                  <><Save className="mr-2 h-4 w-4" /> Save Coursework</>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}