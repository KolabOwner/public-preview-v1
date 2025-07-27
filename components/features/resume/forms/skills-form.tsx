'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Palette, Save, Loader2, Info, ChevronLeft, ChevronRight, AlertCircle, Plus, Trash2, Tag, Cpu } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useResumeStore, type SkillEntry } from '@/lib/client/stores/resume-store';
import '../styles/form-styles.css';

// Schema for a single skill entry
const skillEntrySchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, "Skill category is required."),
  keywords: z.string().min(1, "Skills list is required."),
});

// Schema for the entire form
const skillsSchema = z.object({
  entries: z.array(skillEntrySchema),
});

// TypeScript types inferred from schemas
type SkillFormEntry = z.infer<typeof skillEntrySchema>;
type SkillsFormData = z.infer<typeof skillsSchema>;

interface SkillsFormProps {
  initialData: SkillEntry[];
  onSave: (data: SkillEntry[]) => Promise<void>;
}

// Helper to clean placeholder values from initial data
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-', 'NA'].includes(trimmed) ? '' : trimmed;
};

// Convert store format to form format
const convertToFormFormat = (entries: SkillEntry[]): SkillFormEntry[] => {
  return entries.map(entry => ({
    ...entry,
    category: cleanValue(entry.category),
    keywords: cleanValue(entry.keywords),
  }));
};

// Convert form format to store format
const convertToStoreFormat = (formData: SkillsFormData): SkillEntry[] => {
  return formData.entries.map(entry => ({
    id: entry.id || '',
    category: entry.category || '',
    keywords: entry.keywords || '',
  }));
};

export default function SkillsForm({ initialData, onSave }: SkillsFormProps) {
  const { toast } = useToast();
  const { updateSection, saveSection, isSectionDirty, saveStatus } = useResumeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const previousDataRef = useRef<string>('');

  const isDirty = isSectionDirty('skills');
  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('skills');

  const form = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      entries: (initialData && initialData.length > 0) 
        ? convertToFormFormat(initialData)
        : [{
            category: '',
            keywords: ''
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
          category: '',
          keywords: ''
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
      updateSection('skills', storeData);
    }
  }, [watchedValues, updateSection, initialData]);

  // Manual save function
  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = getValues();
    
    try {
      const storeData = convertToStoreFormat(formData);
      await onSave(storeData); // Call the parent callback first to update the data
      await saveSection('skills'); // Then save to the store
      toast({
        title: "Success",
        description: "Skills saved successfully",
      });
    } catch (error) {
      console.error('Manual save error:', error);
      toast({
        title: "Error",
        description: "Failed to save skills",
        variant: "destructive",
      });
    }
  };

  const addNewSkillCategory = () => {
    append({
      category: '',
      keywords: ''
    });
    setActiveIndex(fields.length);
  };

  const removeSkillCategory = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setActiveIndex(prev => Math.max(0, prev - 1));
    }
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.category
    ? `${activeEntry.category}`
    : "New Skill Category";

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
      setValue(`entries.${activeIndex}.category`, entry.category || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.keywords`, entry.keywords || '', { shouldDirty: false });
      
      // Reset navigation flag after a short delay
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 50);
    }
  }, [activeIndex, setValue, getValues]);

  // Helper to parse skills for preview
  const parseSkills = (keywords: string): string[] => {
    if (!keywords) return [];
    return keywords
      .split(/[,\n]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  };

  const skillsList = parseSkills(activeEntry?.keywords || '');

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
              <Palette className="h-4 w-4 text-white" />
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
                  onClick={() => removeSkillCategory(activeIndex)} 
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
          {/* Skill Category */}
          <div className="space-y-2">
            <Label className="resume-label">
              Skill Category <span className="resume-label-required" aria-label="required">*</span>
            </Label>
            <div className={`resume-input-container ${errors.entries?.[activeIndex]?.category ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
              <Tag className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
              <Input 
                {...register(`entries.${activeIndex}.category`)} 
                placeholder="Programming Languages, Design Tools, Soft Skills"
                className="resume-input px-0 pr-3"
                disabled={isSaving}
              />
            </div>
            {errors.entries?.[activeIndex]?.category && (
              <p className="resume-error-message">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {errors.entries[activeIndex]?.category?.message}
              </p>
            )}
          </div>

          {/* Skills Keywords */}
          <div className="space-y-2">
            <Label className="resume-label">
              Skills in this Category <span className="resume-label-required" aria-label="required">*</span>
            </Label>
            <div className={`resume-input-container ${errors.entries?.[activeIndex]?.keywords ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''} relative`}>
              <Cpu className="absolute left-3 top-3 h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 flex-shrink-0" />
              <Textarea
                {...register(`entries.${activeIndex}.keywords`)}
                placeholder="JavaScript, React, Node.js, TypeScript&#10;OR&#10;Figma, Adobe XD, Sketch, Wireframing"
                className="resume-textarea pl-10 pr-3 py-3 resize-none min-h-[120px]"
                rows={6}
                disabled={isSaving}
              />
            </div>
            {errors.entries?.[activeIndex]?.keywords && (
              <p className="resume-error-message">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {errors.entries[activeIndex]?.keywords?.message}
              </p>
            )}
            <div className="resume-help-text">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Enter skills separated by commas or on new lines. Group related skills together in each category.</span>
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
                onClick={addNewSkillCategory}
                disabled={isSaving}
                className="resume-button-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
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
                    Save Skills
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