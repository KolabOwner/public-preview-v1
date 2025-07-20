'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Award, Save, Loader2, Plus, X, ChevronLeft, ChevronRight, AlertCircle, Calendar, Trash2, Sparkles, Building2 } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Switch } from '@/components/shared/switch';
import { Textarea } from '@/components/shared/textarea';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useUnsavedChanges } from '@/lib/client/hooks/use-unsaved-changes';
import { cleanPlaceholderValue } from './utils/validation';

// Schema for a single certification entry
const certificationEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Certificate name is required."),
  issuer: z.string().min(1, "Issuing organization is required."),
  date: z.string().min(1, "Issue date is required."),
  description: z.string().optional(),
});

// Schema for the entire form
const certificationsSchema = z.object({
  entries: z.array(certificationEntrySchema),
});

// TypeScript types inferred from schemas
export type CertificationEntry = z.infer<typeof certificationEntrySchema>;
type CertificationsFormData = z.infer<typeof certificationsSchema>;

interface CertificationsFormProps {
  initialData: any[]; // Accept any format from database
  onSave: (data: CertificationEntry[]) => Promise<void>;
  autoSave?: boolean;
}

// Helper to clean placeholder values from initial data
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-'].includes(trimmed) ? '' : trimmed;
};

export default function CertificationsForm({ initialData, onSave }: CertificationsFormProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [saveDebounceTimer, setSaveDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const form = useForm<CertificationsFormData>({
    resolver: zodResolver(certificationsSchema),
    defaultValues: {
      entries: initialData.length > 0 
        ? initialData.map((cert: any) => ({
            ...cert,
            name: cleanValue(cert.name || cert.title || cert.certificationName) || "",
            issuer: cleanValue(cert.issuer || cert.organization || cert.issuingOrganization) || "",
            date: cleanValue(cert.date || cert.issueDate || cert.year) || "",
            description: cleanValue(cert.description || cert.details) || ""
          }))
        : [{
            name: '',
            issuer: '',
            date: '',
            description: ''
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
          description: "Certifications saved successfully.",
        });
      } catch (error) {
        console.error('Save error:', error);
        toast({
          title: "Error",
          description: "Failed to save certifications.",
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

  const handleSaveWrapper = async (data: CertificationsFormData) => {
    try {
      const dataToSave = data.entries;
      await onSave(dataToSave);
      toast({
        title: "Success",
        description: "Certifications saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save certifications.",
        variant: "destructive",
      });
    }
  };

  const addNewCertification = () => {
    append({
      name: '',
      issuer: '',
      date: '',
      description: ''
    });
    setActiveIndex(fields.length);
  };

  const removeCertification = (index: number) => {
    remove(index);
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.name
    ? `${activeEntry.name}`
    : "New Certification Entry";


  return (
    <div className={`bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${
      (isSubmitting || isDebouncing) ? 'opacity-75 pointer-events-none' : ''
    }`}>
      <div className="px-6 py-4 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4 flex items-center gap-2">
          <Award className="h-5 w-5" />
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
              <Button variant="ghost" size="icon" onClick={() => removeCertification(activeIndex)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-400">
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
              <Label htmlFor={`name-${activeIndex}`}>Certificate Name</Label>
              <Input id={`name-${activeIndex}`} {...register(`entries.${activeIndex}.name`)} placeholder="e.g. Project Management Professional (PMP)" disabled={isSubmitting || isDebouncing} />
              {errors.entries?.[activeIndex]?.name && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.name?.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`issuer-${activeIndex}`}>Issuing Organization</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input 
                  id={`issuer-${activeIndex}`} 
                  {...register(`entries.${activeIndex}.issuer`)} 
                  placeholder="e.g. Project Management Institute" 
                  disabled={isSubmitting || isDebouncing}
                  className="pl-10"
                />
              </div>
              {errors.entries?.[activeIndex]?.issuer && <p className="text-sm text-red-500 mt-1">{errors.entries[activeIndex]?.issuer?.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`date-${activeIndex}`}>Issue Date</Label>
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
            <Label htmlFor={`description-${activeIndex}`}>How is this certificate relevant?</Label>
            <Textarea
              id={`description-${activeIndex}`}
              {...register(`entries.${activeIndex}.description`)}
              placeholder="Describe how this certification is relevant to your career goals and what skills it demonstrates..."
              className="resize-none"
              rows={4}
              disabled={isSubmitting || isDebouncing}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Explain the value this certification brings to your professional profile.
            </p>
          </div>

          {/* Certification Preview Card */}
          {(activeEntry?.name || activeEntry?.issuer) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {activeEntry?.name || "Certificate Name"}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activeEntry?.issuer && <span>{activeEntry.issuer}</span>}
                    {activeEntry?.issuer && activeEntry?.date && <span className="mx-2">•</span>}
                    {activeEntry?.date && <span>{activeEntry.date}</span>}
                  </p>
                  {activeEntry?.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {activeEntry.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <Button type="button" variant="outline" onClick={addNewCertification} disabled={isSubmitting || isDebouncing}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Certificate
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
                  <><Save className="mr-2 h-4 w-4" /> Save Certifications</>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}