'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Palette, Save, Loader2, Info, ChevronLeft, ChevronRight, AlertCircle, Plus, Trash2, Tag, Cpu } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';

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
  initialData: any[];
  onSave: (data: SkillEntry[]) => Promise<void>;
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
    category: entry.category || '',
    keywords: entry.keywords || '',
  };
};

export default function SkillsForm({ initialData, onSave }: SkillsFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

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
        description: "Skills saved successfully",
      });
    } catch (error) {
      console.error('Skills save error:', error);
      toast({
        title: "Error",
        description: "Failed to save skills",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  // Effect to ensure form fields update when navigating between entries
  React.useEffect(() => {
    // Force form to re-register fields when activeIndex changes
    // This ensures the form displays the correct values for the active entry
    const currentEntries = getValues("entries");
    if (currentEntries && currentEntries[activeIndex]) {
      const entry = currentEntries[activeIndex];
      // Force field updates by setting values explicitly
      setValue(`entries.${activeIndex}.category`, entry.category || '');
      setValue(`entries.${activeIndex}.keywords`, entry.keywords || '');
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
              <Palette className="h-4 w-4 text-white" />
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
                  onClick={() => removeSkillCategory(activeIndex)} 
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
            {/* Skill Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                Skill Category <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
              </Label>
              <div className={`
                flex items-center rounded-lg border-2 transition-all duration-200
                ${errors.entries?.[activeIndex]?.category 
                  ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                  : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                }
                ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
              `}>
                <Tag className="h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 mr-2 flex-shrink-0" />
                <Input 
                  {...register(`entries.${activeIndex}.category`)} 
                  placeholder="Programming Languages, Design Tools, Soft Skills"
                  className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-0 pr-3"
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.category?.message}
                </p>
              )}
            </div>

            {/* Skills Keywords */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                Skills in this Category <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
              </Label>
              <div className={`
                rounded-lg border-2 transition-all duration-200 relative
                ${errors.entries?.[activeIndex]?.keywords 
                  ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                  : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                }
                ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
              `}>
                <Cpu className="absolute left-3 top-3 h-4 w-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 flex-shrink-0" />
                <Textarea
                  {...register(`entries.${activeIndex}.keywords`)}
                  placeholder="JavaScript, React, Node.js, TypeScript&#10;OR&#10;Figma, Adobe XD, Sketch, Wireframing"
                  className="border-0 bg-transparent focus:ring-0 focus:border-0 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 pl-10 pr-3 py-3 resize-none min-h-[120px]"
                  rows={6}
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.keywords && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.keywords?.message}
                </p>
              )}
              <div className="flex items-start gap-2 text-corporate-navy-500 dark:text-gray-400 text-sm">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Enter skills separated by commas or on new lines. Group related skills together in each category.</span>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t-2 border-corporate-navy-100 dark:border-corporate-navy-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={addNewSkillCategory}
                disabled={isSaving}
                className="border-2 border-corporate-navy-300 dark:border-corporate-navy-600 text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-amber-900/20 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
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
                    Save Skills
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