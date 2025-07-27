'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, Save, Loader2, ChevronLeft, ChevronRight, AlertCircle, Plus, Calendar, GraduationCap, Lightbulb, PenTool, Trash2 } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useResumeStore, type CourseworkEntry } from '@/lib/client/stores/resume-store';
import '../styles/form-styles.css';

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
type CourseworkFormEntry = z.infer<typeof courseworkEntrySchema>;
type CourseworkFormData = z.infer<typeof courseworkSchema>;

interface CourseworkFormProps {
  initialData: CourseworkEntry[];
  onSave: (data: CourseworkEntry[]) => Promise<void>;
}

// Helper to clean placeholder values from initial data
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-', 'NA'].includes(trimmed) ? '' : trimmed;
};

// Convert store format to form format
const convertToFormFormat = (entries: CourseworkEntry[]): CourseworkFormEntry[] => {
  return entries.map(entry => ({
    ...entry,
    courseName: cleanValue(entry.courseName),
    institution: cleanValue(entry.institution),
    date: cleanValue(entry.date),
    skill: cleanValue(entry.skill),
    application: cleanValue(entry.application),
  }));
};

// Convert form format to store format
const convertToStoreFormat = (formData: CourseworkFormData): CourseworkEntry[] => {
  return formData.entries.map(entry => ({
    id: entry.id || '',
    courseName: entry.courseName || '',
    institution: entry.institution || '',
    date: entry.date || '',
    skill: entry.skill || '',
    application: entry.application || '',
  }));
};

export default function CourseworkForm({ initialData, onSave }: CourseworkFormProps) {
  const { toast } = useToast();
  const { updateSection, saveSection, isSectionDirty, saveStatus } = useResumeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const previousDataRef = useRef<string>('');

  const isDirty = isSectionDirty('coursework');
  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('coursework');

  const form = useForm<CourseworkFormData>({
    resolver: zodResolver(courseworkSchema),
    defaultValues: {
      entries: (initialData && initialData.length > 0) 
        ? convertToFormFormat(initialData)
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

  const { register, formState: { errors }, watch, setValue, getValues, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  // Reset form when initialData changes (when switching resumes)
  useEffect(() => {
    const formData = (initialData && initialData.length > 0) 
      ? convertToFormFormat(initialData)
      : [{
          courseName: '',
          institution: '',
          date: '',
          skill: '',
          application: ''
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
      updateSection('coursework', storeData);
    }
  }, [watchedValues, updateSection, initialData]);

  // Manual save function
  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = getValues();
    
    try {
      const storeData = convertToStoreFormat(formData);
      await onSave(storeData); // Call the parent callback first to update the data
      await saveSection('coursework'); // Then save to the store
      toast({
        title: "Success",
        description: "Coursework information saved successfully",
      });
    } catch (error) {
      console.error('Manual save error:', error);
      toast({
        title: "Error",
        description: "Failed to save coursework information",
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
    if (fields.length > 1) {
      remove(index);
      setActiveIndex(prev => Math.max(0, prev - 1));
    }
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.courseName
    ? `${activeEntry.courseName}`
    : "New Coursework Entry";

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
      setValue(`entries.${activeIndex}.courseName`, entry.courseName || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.institution`, entry.institution || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.date`, entry.date || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.skill`, entry.skill || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.application`, entry.application || '', { shouldDirty: false });
      
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
              <BookOpen className="h-4 w-4 text-white" />
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
                  onClick={() => removeCoursework(activeIndex)} 
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
          {/* Course Name & Institution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="resume-label">
                Course Name <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.courseName ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Input 
                  {...register(`entries.${activeIndex}.courseName`)} 
                  placeholder="Introduction to Computer Systems"
                  className="resume-input"
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.courseName && (
                <p className="resume-error-message">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.courseName?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="resume-label">
                Institution <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.institution ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <GraduationCap className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                <Input 
                  {...register(`entries.${activeIndex}.institution`)} 
                  placeholder="University of Wisconsin, Madison"
                  className="resume-input px-0 pr-3"
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
          </div>

          {/* Date & Key Skill */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="resume-label">
                Date <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.date ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Calendar className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                <Input 
                  {...register(`entries.${activeIndex}.date`)} 
                  placeholder="Spring 2024"
                  className="resume-input px-0 pr-3"
                  disabled={isSaving}
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
                Key Skill <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.skill ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Lightbulb className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                <Input 
                  {...register(`entries.${activeIndex}.skill`)} 
                  placeholder="Problem Solving"
                  className="resume-input px-0 pr-3"
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.skill && (
                <p className="resume-error-message">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.skill?.message}
                </p>
              )}
            </div>
          </div>

          {/* Skill Application */}
          <div className="space-y-2">
            <Label className="resume-label">
              Skill Application
            </Label>
            <div className={`resume-input-container ${errors.entries?.[activeIndex]?.application ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''} relative`}>
              <PenTool className="absolute left-3 top-3 h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 flex-shrink-0" />
              <Textarea
                {...register(`entries.${activeIndex}.application`)}
                placeholder="Describe specific examples of how you applied this skill during the course..."
                className="resume-textarea pl-10 pr-3 py-3 resize-none min-h-[100px]"
                rows={4}
                disabled={isSaving}
              />
            </div>
            <p className="text-xs text-corporate-navy-500 dark:text-gray-400">
              Describe specific examples of how you applied this skill during the course.
            </p>
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
                onClick={addNewCoursework}
                disabled={isSaving}
                className="resume-button-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
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
                    Save Coursework
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