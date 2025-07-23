'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Code2, Plus, X, ChevronLeft, ChevronRight, Save, Loader2, AlertCircle, ExternalLink, GripVertical, Trash2 } from "lucide-react";
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

// Schema for a single project entry
const projectEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Project title is required."),
  organization: z.string().min(1, "Organization name is required."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional(),
  current: z.boolean(),
  url: z.string().optional(),
  description: z.string().optional(),
  bulletPoints: z.array(bulletPointSchema).optional(),
}).refine(data => !data.current ? !!data.endDate?.trim() : true, {
  message: "End date is required unless it's an ongoing project.",
  path: ["endDate"],
});

// Schema for the entire form
const projectSchema = z.object({
  entries: z.array(projectEntrySchema),
});

// TypeScript types inferred from schemas
type BulletPoint = z.infer<typeof bulletPointSchema>;
export type ProjectEntry = Omit<z.infer<typeof projectEntrySchema>, 'bulletPoints'> & {
  bulletPoints: string[];
};
type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectsFormProps {
  initialData: any[];
  onSave: (data: ProjectEntry[]) => Promise<void>;
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
    title: entry.title || '',
    organization: entry.organization || '',
    startDate: entry.startDate || '',
    endDate: entry.endDate || '',
    current: entry.current || false,
    url: entry.url || '',
    description: entry.description || '',
    bulletPoints: Array.isArray(entry.bulletPoints) 
      ? entry.bulletPoints.filter(bp => bp && typeof bp === 'string' && bp.trim().length > 0)
      : [],
  };
};

export default function ProjectsForm({ initialData, onSave }: ProjectsFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      entries: initialData.length > 0 
        ? initialData.map((p: any) => {
            // Parse bullet points from description if bulletPoints array is empty
            let bulletPoints = p.bulletPoints?.filter(Boolean) || [];

            if (bulletPoints.length === 0 && p.description) {
              // Split by various bullet point formats: •, -, *, or newline followed by these
              const points = p.description
                .split(/(?:^|\n)\s*[•\-\*]\s*|(?<=[.!?])\s*•\s*/)
                .map((point: string) => point.trim())
                .filter((point: string) => point.length > 0);

              bulletPoints = points;
            }

            return {
              ...p,
              title: cleanValue(p.title || p.name || p.projectName) || "",
              organization: cleanValue(p.organization || p.company || p.client) || "",
              startDate: cleanValue(p.startDate || p.start) || "",
              endDate: cleanValue(p.endDate || p.end) || "",
              url: cleanValue(p.url || p.projectUrl || p.link) || "",
              description: cleanValue(p.description) || "",
              bulletPoints: bulletPoints.length > 0 ? bulletPoints.map(bp => ({ value: bp })) : [{ value: '' }],
            };
          })
        : [{
            title: '',
            organization: '',
            startDate: '',
            endDate: '',
            current: false,
            url: '',
            description: '',
            bulletPoints: [{ value: '' }]
          }]
    },
    mode: 'onChange',
  });

  const { register, control, formState: { errors }, watch, setValue, getValues } = form;

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
        description: "Projects information saved successfully",
      });
    } catch (error) {
      console.error('Projects save error:', error);
      toast({
        title: "Error",
        description: "Failed to save projects information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addNewProject = () => {
    append({
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      current: false,
      url: '',
      description: '',
      bulletPoints: [{ value: '' }]
    });
    setActiveIndex(fields.length);
  };

  const removeProject = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setActiveIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      setValue(`entries.${activeIndex}.url`, `https://${value}`);
    }
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.title && activeEntry?.organization
    ? `${activeEntry.title} - ${activeEntry.organization}`
    : "New Project Entry";

  // Effect to ensure form fields update when navigating between entries
  React.useEffect(() => {
    // Force form to re-register fields when activeIndex changes
    // This ensures the form displays the correct values for the active entry
    const currentEntries = getValues("entries");
    if (currentEntries && currentEntries[activeIndex]) {
      const entry = currentEntries[activeIndex];
      // Force field updates by setting values explicitly
      setValue(`entries.${activeIndex}.title`, entry.title || '');
      setValue(`entries.${activeIndex}.organization`, entry.organization || '');
      setValue(`entries.${activeIndex}.startDate`, entry.startDate || '');
      setValue(`entries.${activeIndex}.endDate`, entry.endDate || '');
      setValue(`entries.${activeIndex}.current`, entry.current || false);
      setValue(`entries.${activeIndex}.url`, entry.url || '');
      setValue(`entries.${activeIndex}.description`, entry.description || '');
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
              <Code2 className="h-4 w-4 text-white" />
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
                  onClick={() => removeProject(activeIndex)} 
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
            {/* Project Title & Organization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Project Title <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
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
                    placeholder="E-Commerce Platform"
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
                  Organization <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200
                  ${errors.entries?.[activeIndex]?.organization 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Input 
                    {...register(`entries.${activeIndex}.organization`)} 
                    placeholder="Microsoft Corporation"
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                    disabled={isSaving}
                  />
                </div>
                {errors.entries?.[activeIndex]?.organization && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.entries[activeIndex]?.organization?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Time Period & URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Ongoing
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                  Project URL
                </Label>
                <div className={`
                  flex items-center rounded-lg border-2 transition-all duration-200 relative
                  ${errors.entries?.[activeIndex]?.url 
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                    : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
                  }
                  ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
                `}>
                  <Input 
                    {...register(`entries.${activeIndex}.url`)} 
                    placeholder="https://www.example.com"
                    onBlur={handleUrlBlur}
                    className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3 pr-10"
                    disabled={isSaving}
                  />
                  {watch(`entries.${activeIndex}.url`) && (
                    <a
                      href={watch(`entries.${activeIndex}.url`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-corporate-navy-400 hover:text-corporate-amber-500 dark:hover:text-corporate-amber-400 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Project Description / Key Achievements */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                Key Features & Achievements
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
                        placeholder="• Built responsive web application with React and TypeScript serving 10,000+ users"
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
                onClick={addNewProject}
                disabled={isSaving}
                className="border-2 border-corporate-navy-300 dark:border-corporate-navy-600 text-corporate-navy-700 dark:text-gray-300 hover:bg-corporate-amber-50 dark:hover:bg-corporate-amber-900/20 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
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
                    Save Projects
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