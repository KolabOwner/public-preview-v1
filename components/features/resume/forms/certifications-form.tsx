'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Award, Save, Loader2, Plus, ChevronLeft, ChevronRight, AlertCircle, Calendar, Trash2, Building2 } from "lucide-react";
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { useResumeStore, type CertificationEntry } from '@/lib/client/stores/resume-store';
import '../styles/form-styles.css';

// Schema for a single certification entry
const certificationEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Certificate name is required."),
  issuer: z.string().min(1, "Issuing organization is required."),
  date: z.string().min(1, "Issue date is required."),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().optional(),
});

// Schema for the entire form
const certificationsSchema = z.object({
  entries: z.array(certificationEntrySchema),
});

// TypeScript types inferred from schemas
type CertificationFormEntry = z.infer<typeof certificationEntrySchema>;
type CertificationsFormData = z.infer<typeof certificationsSchema>;

interface CertificationsFormProps {
  initialData: CertificationEntry[];
  onSave: (data: CertificationEntry[]) => Promise<void>;
}

// Helper to clean placeholder values from initial data
const cleanValue = (value: string | undefined | null): string => {
  if (!value) return '';
  const trimmed = value.trim();
  return ['n/a', 'N/A', 'none', 'null', '-', 'NA'].includes(trimmed) ? '' : trimmed;
};

// Convert store format to form format
const convertToFormFormat = (entries: CertificationEntry[]): CertificationFormEntry[] => {
  return entries.map(entry => ({
    ...entry,
    name: cleanValue(entry.name),
    issuer: cleanValue(entry.issuer),
    date: cleanValue(entry.date),
    expiryDate: cleanValue(entry.expiryDate),
    credentialId: cleanValue(entry.credentialId),
    url: cleanValue(entry.url),
  }));
};

// Convert form format to store format
const convertToStoreFormat = (formData: CertificationsFormData): CertificationEntry[] => {
  return formData.entries.map(entry => ({
    id: entry.id || '',
    name: entry.name || '',
    issuer: entry.issuer || '',
    date: entry.date || '',
    expiryDate: entry.expiryDate || '',
    credentialId: entry.credentialId || '',
    url: entry.url || '',
  }));
};

export default function CertificationsForm({ initialData, onSave }: CertificationsFormProps) {
  const { toast } = useToast();
  const { updateSection, saveSection, isSectionDirty, saveStatus } = useResumeStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const previousDataRef = useRef<string>('');

  const isDirty = isSectionDirty('certifications');
  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('certifications');

  const form = useForm<CertificationsFormData>({
    resolver: zodResolver(certificationsSchema),
    defaultValues: {
      entries: (initialData && initialData.length > 0) 
        ? convertToFormFormat(initialData)
        : [{
            name: '',
            issuer: '',
            date: '',
            expiryDate: '',
            credentialId: '',
            url: ''
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
          name: '',
          issuer: '',
          date: '',
          expiryDate: '',
          credentialId: '',
          url: ''
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
      updateSection('certifications', storeData);
    }
  }, [watchedValues, updateSection, initialData]);

  // Manual save function
  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = getValues();
    
    try {
      const storeData = convertToStoreFormat(formData);
      await onSave(storeData); // Call the parent callback first to update the data
      await saveSection('certifications'); // Then save to the store
      toast({
        title: "Success",
        description: "Certifications saved successfully",
      });
    } catch (error) {
      console.error('Manual save error:', error);
      toast({
        title: "Error",
        description: "Failed to save certifications",
        variant: "destructive",
      });
    }
  };

  const addNewCertification = () => {
    append({
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    });
    setActiveIndex(fields.length);
  };

  const removeCertification = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      setActiveIndex(prev => Math.max(0, prev - 1));
    }
  };

  const activeEntry = watch(`entries.${activeIndex}`);
  const headerTitle = activeEntry?.name
    ? `${activeEntry.name}`
    : "New Certification Entry";

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
      setValue(`entries.${activeIndex}.name`, entry.name || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.issuer`, entry.issuer || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.date`, entry.date || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.expiryDate`, entry.expiryDate || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.credentialId`, entry.credentialId || '', { shouldDirty: false });
      setValue(`entries.${activeIndex}.url`, entry.url || '', { shouldDirty: false });
      
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
              <Award className="h-4 w-4 text-white" />
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
                  onClick={() => removeCertification(activeIndex)} 
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
          {/* Certificate Name & Issuer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="resume-label">
                Certificate Name <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.name ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Input 
                  {...register(`entries.${activeIndex}.name`)} 
                  placeholder="Project Management Professional (PMP)"
                  className="resume-input"
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.name && (
                <p className="resume-error-message">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.name?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="resume-label">
                Issuing Organization <span className="resume-label-required" aria-label="required">*</span>
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.issuer ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Building2 className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                <Input 
                  {...register(`entries.${activeIndex}.issuer`)} 
                  placeholder="Project Management Institute"
                  className="resume-input px-0 pr-3"
                  disabled={isSaving}
                />
              </div>
              {errors.entries?.[activeIndex]?.issuer && (
                <p className="resume-error-message">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.entries[activeIndex]?.issuer?.message}
                </p>
              )}
            </div>
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label className="resume-label">
              Issue Date <span className="resume-label-required" aria-label="required">*</span>
            </Label>
            <div className={`resume-input-container ${errors.entries?.[activeIndex]?.date ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
              <Calendar className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
              <Input 
                {...register(`entries.${activeIndex}.date`)} 
                placeholder="January 2025"
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

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expiry Date */}
            <div className="space-y-2">
              <Label className="resume-label">
                Expiry Date
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.expiryDate ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Calendar className="resume-input-icon ml-3 mr-2 flex-shrink-0" />
                <Input 
                  {...register(`entries.${activeIndex}.expiryDate`)} 
                  placeholder="December 2027"
                  className="resume-input px-0 pr-3"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Credential ID */}
            <div className="space-y-2">
              <Label className="resume-label">
                Credential ID
              </Label>
              <div className={`resume-input-container ${errors.entries?.[activeIndex]?.credentialId ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
                <Input 
                  {...register(`entries.${activeIndex}.credentialId`)} 
                  placeholder="ABC123XYZ"
                  className="resume-input"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Credential URL */}
          <div className="space-y-2">
            <Label className="resume-label">
              Credential URL
            </Label>
            <div className={`resume-input-container ${errors.entries?.[activeIndex]?.url ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
              <Input 
                {...register(`entries.${activeIndex}.url`)} 
                placeholder="https://www.credential-provider.com/verify/ABC123XYZ"
                className="resume-input"
                type="url"
                disabled={isSaving}
              />
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
                onClick={addNewCertification}
                disabled={isSaving}
                className="resume-button-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Certificate
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
                    Save Certifications
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