'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Palette, Save, Loader2, Info, ChevronLeft, ChevronRight, AlertCircle, Plus, X, Trash2, Sparkles, Tag } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useUnsavedChanges } from '@/lib/client/hooks/use-unsaved-changes';
import { cleanPlaceholderValue } from './utils/validation';

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
export type SkillEntry = z.infer<typeof skillEntrySchema>;
type SkillsFormData = z.infer<typeof skillsSchema>;

interface SkillsFormProps {
  initialData: any[]; // Accept any format from database
  onSave: (data: SkillEntry[]) => Promise<void>;
  autoSave?: boolean;
}

// Helper to clean placeholder values from initial data
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-'].includes(trimmed) ? '' : trimmed;
};

export default function SkillsForm({ initialData, onSave }: SkillsFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [saveDebounceTimer, setSaveDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const form = useForm<SkillsFormData>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      entries: initialData.length > 0 
        ? initialData.map((skill: any) => ({
            ...skill,
            category: cleanValue(skill.category || skill.skillCategory || skill.name) || "",
            keywords: cleanValue(skill.keywords || skill.skills || skill.items) || ""
          }))
        : [{
            category: '',
            keywords: ''
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
          description: "Skills saved successfully.",
        });
      } catch (error) {
        console.error('Save error:', error);
        toast({
          title: "Error",
          description: "Failed to save skills.",
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

  const handleSaveWrapper = async (data: SkillsFormData) => {
    try {
      const dataToSave = data.entries;
      await onSave(dataToSave);
      toast({
        title: "Success",
        description: "Skills saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save skills.",
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
    remove(index);
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.category
    ? `${activeEntry.category}`
    : "New Skill Category";


  return (
    <div className={`bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${
      (isSubmitting || isDebouncing) ? 'opacity-75 pointer-events-none' : ''
    }`}>
      <div className="px-6 py-4 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4 flex items-center gap-2">
          <Palette className="h-5 w-5" />
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
              <Button variant="ghost" size="icon" onClick={() => removeSkillCategory(activeIndex)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {fields.length > 0 && (
        <form onSubmit={handleSubmit(handleSaveWrapper)} className="p-6 space-y-6" aria-busy={isSubmitting || isDebouncing}>
          <div className="space-y-2">
            <Label htmlFor={`category-${activeIndex}`}>Skill Category</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input 
                id={`category-${activeIndex}`} 
                {...register(`entries.${activeIndex}.category`)} 
                placeholder="e.g. Programming Languages, Design Tools, Soft Skills" 
                disabled={isSubmitting || isDebouncing}
                className="pl-10"
              />
            </div>
            {errors.entries?.[activeIndex]?.category && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.category?.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`keywords-${activeIndex}`}>Skills in this Category</Label>
            <Textarea
              id={`keywords-${activeIndex}`}
              {...register(`entries.${activeIndex}.keywords`)}
              placeholder="e.g. JavaScript, React, Node.js, TypeScript&#10;OR&#10;Figma, Adobe XD, Sketch, Wireframing"
              className="resize-none"
              rows={6}
              disabled={isSubmitting || isDebouncing}
            />
            {errors.entries?.[activeIndex]?.keywords && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.keywords?.message}</p>}
            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Enter skills separated by commas or on new lines. Group related skills together in each category.</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button type="button" variant="outline" onClick={addNewSkillCategory} disabled={isSubmitting || isDebouncing}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Category
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
                  <><Save className="mr-2 h-4 w-4" /> Save Skills</>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}