'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Mail, Phone, Globe, MapPin } from "lucide-react";
import { Switch } from '@/components/shared/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/select';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { COUNTRIES, getStateOptions, getStateLabel, isStateSelectionEnabled } from './utils/location-data';
import { useResumeStore, type ContactFormData } from '@/lib/client/stores/resume-store';
import '../styles/form-styles.css';

interface ContactFormProps {
  initialData: ContactFormData;
  onSave: (data: ContactFormData) => Promise<void>;
}

// Clean placeholder values and format fields
const cleanValue = (value: string): string => {
  if (!value) return '';
  return value.replace(/^(Enter your |Your |Please enter )/i, '').trim();
};

const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return value;
};

const formatLinkedIn = (value: string): string => {
  if (!value) return '';
  const cleaned = cleanValue(value);
  if (cleaned.includes('linkedin.com/in/')) {
    return cleaned.split('linkedin.com/in/')[1] || '';
  }
  return cleaned;
};

const formatWebsite = (value: string): string => {
  const cleaned = cleanValue(value);
  if (!cleaned) return '';
  if (!/^https?:\/\//.test(cleaned)) {
    return `https://${cleaned}`;
  }
  return cleaned;
};

export default function ContactForm({ initialData, onSave }: ContactFormProps) {
  const { toast } = useToast();
  const { updateSection, saveSection, isSectionDirty, saveStatus } = useResumeStore();
  const previousDataRef = useRef<string>('');

  const isDirty = isSectionDirty('contactInfo');
  const isSaving = saveStatus.isSaving && saveStatus.pendingSections.includes('contactInfo');

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    defaultValues: initialData,
    mode: 'onChange'
  });

  // Reset form when initialData changes (when switching resumes)
  useEffect(() => {
    reset(initialData);
    previousDataRef.current = JSON.stringify(initialData);
  }, [initialData, reset]);

  // Watch all form values for real-time updates
  const watchedValues = watch();

  // Update store when form data changes (no auto-save) - using ref to prevent infinite loops
  useEffect(() => {
    const currentData = JSON.stringify(watchedValues);
    if (currentData !== previousDataRef.current && currentData !== JSON.stringify(initialData)) {
      previousDataRef.current = currentData;
      updateSection('contactInfo', watchedValues);
    }
  }, [watchedValues, updateSection, initialData]);

  // Manual save function
  const handleManualSave = handleSubmit(async (formData) => {
    try {
      await saveSection('contactInfo');
      await onSave(formData); // Still call the parent callback for compatibility
      toast({
        title: "Success",
        description: "Contact information saved successfully",
      });
    } catch (error) {
      console.error('Manual save error:', error);
      toast({
        title: "Error",
        description: "Failed to save contact information",
        variant: "destructive",
      });
    }
  });

  // Field handlers with proper form integration
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(cleanValue(e.target.value));
    setValue('phone', formatted, { shouldDirty: true, shouldValidate: true });
  };

  const handleLinkedInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLinkedIn(e.target.value);
    setValue('linkedin', formatted, { shouldDirty: true, shouldValidate: true });
  };

  const handleWebsiteBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWebsite(e.target.value);
    setValue('website', formatted, { shouldDirty: true, shouldValidate: true });
  };

  const handleCountryChange = (value: string) => {
    setValue('country', value, { shouldDirty: true, shouldValidate: true });
    if (!isStateSelectionEnabled(value)) {
      setValue('state', '', { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleStateChange = (value: string) => {
    setValue('state', value, { shouldDirty: true, shouldValidate: true });
  };

  const handleSwitchChange = (field: keyof ContactFormData, checked: boolean) => {
    setValue(field, checked as any, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className={`resume-form-container ${isSaving ? 'resume-form-container--saving' : ''} ${isDirty ? 'resume-form-container--dirty' : ''}`}>
      {/* Background gradient effect */}
      <div className="resume-form-background" aria-hidden="true" />

      {/* Subtle pattern overlay */}
      <div className="resume-form-pattern" aria-hidden="true" />

      <div className="resume-form-content">
        <form onSubmit={handleManualSave} className="space-y-6" aria-busy={isSaving}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label className="resume-label">
              Full name <span className="resume-label-required" aria-label="required">*</span>
            </Label>
            <div className={`resume-input-container ${errors.fullName ? 'resume-input-container--error' : ''} ${isSaving ? 'resume-input-container--disabled' : ''}`}>
              <Input
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                placeholder="Charles Bloomberg"
                className="resume-input"
                disabled={isSaving}
              />
            </div>
            {errors.fullName && (
              <p className="resume-error-message">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
              Email address <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>
            </Label>
            <div className={`
              flex items-center rounded-lg border-2 transition-all duration-200 group
              ${errors.email 
                ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
              }
              ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
            `}>
              <Mail className="w-4 h-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 transition-colors group-hover:text-corporate-amber-500 dark:group-hover:text-corporate-amber-400" />
              <Input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                type="email"
                placeholder="charlesbloomberg@wisc.edu"
                className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                disabled={isSaving}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
              Phone number
            </Label>
            <div className={`
              flex items-center rounded-lg border-2 transition-all duration-200 group
              ${errors.phone 
                ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
              }
              ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
            `}>
              <Phone className="w-4 h-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 transition-colors group-hover:text-corporate-amber-500 dark:group-hover:text-corporate-amber-400" />
              <Input
                {...register('phone')}
                type="tel"
                placeholder="(621) 799-5548"
                className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                onChange={handlePhoneChange}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
              LinkedIn URL
            </Label>
            <div className={`
              flex items-center rounded-lg border-2 transition-all duration-200 group
              ${errors.linkedin 
                ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
              }
              ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
            `}>
              <span className="py-2 text-base font-semibold text-corporate-navy-700 dark:text-gray-300 whitespace-nowrap pl-3 pr-0">
                https://linkedin.com/in/
              </span>
              <Input
                {...register('linkedin')}
                placeholder="bloomberg"
                className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 pl-0 pr-3"
                onChange={handleLinkedInChange}
                disabled={isSaving}
              />
              <div className="h-5 w-5 text-corporate-navy-500 dark:text-corporate-amber-400/70 mr-3 transition-colors group-hover:text-corporate-amber-500 dark:group-hover:text-corporate-amber-400" />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
              Personal website or relevant link
            </Label>
            <div className={`
              flex items-center rounded-lg border-2 transition-all duration-200 group
              ${errors.website 
                ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
              }
              ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
            `}>
              <Globe className="w-4 h-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 transition-colors group-hover:text-corporate-amber-500 dark:group-hover:text-corporate-amber-400" />
              <Input
                {...register('website')}
                type="url"
                placeholder="https://www.charlesbloomberg.com"
                className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                onBlur={handleWebsiteBlur}
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                Country
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-corporate-navy-600 dark:text-gray-400">Show on resume</span>
                <Switch
                  checked={watch('showCountry')}
                  onCheckedChange={(checked) => handleSwitchChange('showCountry', checked)}
                  className="scale-75 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-corporate-gold-500 data-[state=checked]:to-corporate-amber-500"
                />
              </div>
            </div>
            <div className={`
              rounded-lg border-2 transition-all duration-200 group
              ${errors.country 
                ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
              }
              ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
            `}>
              <Select value={watch('country')} onValueChange={handleCountryChange} disabled={isSaving}>
                <SelectTrigger className="h-10 sm:h-12 border-0 bg-transparent focus:ring-0 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 hover:bg-transparent">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                {getStateLabel(watch('country'))}
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-corporate-navy-600 dark:text-gray-400">Show on resume</span>
                <Switch
                  checked={watch('showState')}
                  onCheckedChange={(checked) => handleSwitchChange('showState', checked)}
                  className="scale-75 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-corporate-gold-500 data-[state=checked]:to-corporate-amber-500"
                />
              </div>
            </div>
            <div className={`
              rounded-lg border-2 transition-all duration-200 group
              ${errors.state 
                ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
              }
              ${!isStateSelectionEnabled(watch('country')) ? 'opacity-50 cursor-not-allowed' : ''}
              ${isSaving ? 'opacity-60' : ''}
            `}>
              <Select
                value={watch('state')}
                onValueChange={handleStateChange}
                disabled={!isStateSelectionEnabled(watch('country')) || isSaving}
              >
                <SelectTrigger className="h-10 sm:h-12 border-0 bg-transparent focus:ring-0 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 hover:bg-transparent">
                  <SelectValue placeholder={
                    isStateSelectionEnabled(watch('country'))
                      ? `Select ${getStateLabel(watch('country')).toLowerCase()}`
                      : 'Select country first'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {getStateOptions(watch('country')).map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="city" className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
                City
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-corporate-navy-600 dark:text-gray-400">Show on resume</span>
                <Switch
                  checked={watch('showCity')}
                  onCheckedChange={(checked) => handleSwitchChange('showCity', checked)}
                  className="scale-75 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-corporate-gold-500 data-[state=checked]:to-corporate-amber-500"
                />
              </div>
            </div>
            <div className={`
              flex items-center rounded-lg border-2 transition-all duration-200 group
              ${errors.city 
                ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20' 
                : 'border-corporate-navy-200 dark:border-gray-700 bg-white dark:bg-corporate-navy-900/50 hover:border-corporate-amber-400 dark:hover:border-corporate-amber-500 focus-within:border-corporate-amber-500 dark:focus-within:border-corporate-amber-400'
              }
              ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}
            `}>
              <MapPin className="w-4 h-4 text-corporate-navy-500 dark:text-corporate-amber-400/70 ml-3 transition-colors group-hover:text-corporate-amber-500 dark:group-hover:text-corporate-amber-400" />
              <Input
                id="city"
                {...register('city', {
                  validate: (value) => {
                    if (watch('showCity') && !value?.trim()) {
                      return 'City is required when choosing to show city on resume';
                    }
                    return true;
                  }
                })}
                placeholder="New York City"
                className="border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 placeholder:text-corporate-navy-400 dark:placeholder:text-gray-500 px-3"
                disabled={isSaving}
              />
            </div>
            {errors.city && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 animate-fade-in">
                {errors.city.message}
              </p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-corporate-navy-100 dark:border-corporate-navy-700">
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
                Save Contact Info
              </>
            )}
          </Button>
        </div>
        </form>
      </div>
    </div>
  );
}