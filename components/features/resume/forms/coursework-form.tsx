'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, Save, Loader2, ChevronLeft, ChevronRight, AlertCircle, Plus, Calendar, GraduationCap, Lightbulb, PenTool, Trash2 } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';

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
  initialData: any[];
  onSave: (data: CourseworkEntry[]) => Promise<void>;
}

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
    courseName: entry.courseName || '',
    institution: entry.institution || '',
    date: entry.date || '',
    skill: entry.skill || '',
    application: entry.application || '',
  };
};

export default function CourseworkForm({ initialData, onSave }: CourseworkFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

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

  const { register, formState: { errors }, watch, setValue, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  // Manual save
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const formData = getValues();
      
      // Process entries to ensure clean data with no undefined values
      const processedEntries = formData.entries.map(entry => {
        return cleanDataForFirestore(entry);
      });
      
      await onSave(processedEntries);
      toast({
        title: "Success",
        description: "Coursework information saved successfully",
      });
    } catch (error) {
      console.error('Coursework save error:', error);
      toast({
        title: "Error",
        description: "Failed to save coursework information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
    if (fields.length > 1) {
      remove(index);
      setActiveIndex(prev => Math.max(0, prev - 1));
    }
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.courseName
    ? `${activeEntry.courseName}`
    : "New Coursework Entry";

  // Effect to ensure form fields update when navigating between entries
  React.useEffect(() => {
    // Force form to re-register fields when activeIndex changes
    // This ensures the form displays the correct values for the active entry
    const currentEntries = getValues("entries");
    if (currentEntries && currentEntries[activeIndex]) {
      const entry = currentEntries[activeIndex];
      // Force field updates by setting values explicitly
      setValue(`entries.${activeIndex}.courseName`, entry.courseName || '');
      setValue(`entries.${activeIndex}.institution`, entry.institution || '');
      setValue(`entries.${activeIndex}.date`, entry.date || '');
      setValue(`entries.${activeIndex}.skill`, entry.skill || '');
      setValue(`entries.${activeIndex}.application`, entry.application || '');
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
              <BookOpen className="h-4 w-4 text-white" />
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
                  onClick={() => removeCoursework(activeIndex)} 
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
            {/* Course Name & Institution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Course Name <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.courseName 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Input 
                    {...register(`entries.${activeIndex}.courseName`)} 
                    placeholder="Introduction to Computer Systems"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                    disabled={isSaving}
                  />
                </div>
                {errors.entries?.[activeIndex]?.courseName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.entries[activeIndex]?.courseName?.message}
                  </p>
                )}
              </div>

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
                  <GraduationCap className="h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 mr-2 flex-shrink-0" />
                  <Input 
                    {...register(`entries.${activeIndex}.institution`)} 
                    placeholder="University of Wisconsin, Madison"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-0 pr-3"
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
            </div>

            {/* Date & Key Skill */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Date <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.date 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Calendar className="h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 mr-2 flex-shrink-0" />
                  <Input 
                    {...register(`entries.${activeIndex}.date`)} 
                    placeholder="Spring 2024"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-0 pr-3"
                    disabled={isSaving}
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
                  Key Skill <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.skill 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Lightbulb className="h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 mr-2 flex-shrink-0" />
                  <Input 
                    {...register(`entries.${activeIndex}.skill`)} 
                    placeholder="Problem Solving"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-0 pr-3"
                    disabled={isSaving}
                  />
                </div>
                {errors.entries?.[activeIndex]?.skill && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.entries[activeIndex]?.skill?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Skill Application */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                Skill Application
              </Label>
              <div className={`
                rounded-lg border-2 transition-all duration-200 relative
                ${errors.entries?.[activeIndex]?.application 
                  ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                  : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                }
                ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
              `}>
                <PenTool className="absolute left-3 top-3 h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 flex-shrink-0" />
                <Textarea
                  {...register(`entries.${activeIndex}.application`)}
                  placeholder="Describe specific examples of how you applied this skill during the course..."
                  className="border-0 bg-transparent focus:ring-0 focus:border-0 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 pl-10 pr-3 py-3 resize-none min-h-[100px]"
                  rows={4}
                  disabled={isSaving}
                />
              </div>
              <p className="text-xs text-corporate-navy-500 dark:text-gray-400">
                Describe specific examples of how you applied this skill during the course.
              </p>
            </div>

            {/* Course Preview Card */}
            {(activeEntry?.courseName || activeEntry?.skill) && (
              <div className="bg-white/90 dark:bg-corporate-navy-800/90 rounded-xl p-6 border-2 border-corporate-navy-100 dark:border-corporate-navy-700">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-corporate-gold-500 to-corporate-amber-500 rounded-xl shadow-sm">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-corporate-navy-900 dark:text-white">
                      {activeEntry?.courseName || "Course Name"}
                    </h4>
                    <p className="text-sm text-corporate-navy-600 dark:text-gray-400 mt-1">
                      {activeEntry?.institution && <span>{activeEntry.institution}</span>}
                      {activeEntry?.institution && activeEntry?.date && <span className="mx-2">•</span>}
                      {activeEntry?.date && <span>{activeEntry.date}</span>}
                    </p>
                    {activeEntry?.skill && (
                      <div className="mt-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-corporate-gold-100 to-corporate-amber-100 dark:from-corporate-gold-900/30 dark:to-corporate-amber-900/30 text-corporate-gold-800 dark:text-corporate-gold-300 border border-corporate-gold-200 dark:border-corporate-gold-700">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          {activeEntry.skill}
                        </span>
                      </div>
                    )}
                    {activeEntry?.application && (
                      <p className="text-sm text-corporate-navy-700 dark:text-gray-300 mt-3 leading-relaxed">
                        {activeEntry.application}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t-2 border-corporate-navy-100 dark:border-corporate-navy-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={addNewCoursework}
                disabled={isSaving}
                className="border-2 border-corporate-navy-300 dark:border-corporate-navy-600 text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-amber-900/20 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
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
                    Save Coursework
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