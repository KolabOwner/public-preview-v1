// components/resume/forms/contact-form.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Mail, Phone, Globe, MapPin } from "lucide-react";
import { Button } from '@/components/shared/button';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import { COUNTRIES, getStateOptions, getStateLabel, isStateSelectionEnabled } from './utils/location-data';
import { TextInputField, SelectField } from './components/form-fields';
import { contactFormValidation } from './utils/validation-rules';
import { formatPhone, formatLinkedIn, formatWebsite, cleanValue } from './utils/formatters';
import { useAutoSave } from './hooks/use-auto-save';
import type { ContactFormData } from '@/lib/client/stores/types';
import '../styles/form-styles.css';

interface ContactFormProps {
  initialData: ContactFormData;
  onSave: (data: ContactFormData) => Promise<void>;
}

export default function ContactForm({ initialData, onSave }: ContactFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ContactFormData>({
    defaultValues: initialData,
    mode: 'onChange'
  });

  const formData = watch();

  // Reset form when initialData changes
  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  // Auto-save functionality
  useAutoSave({
    data: formData,
    isDirty,
    onSave,
    delay: 1000
  });

  // Form handlers
  const handleManualSave = handleSubmit(async (data) => {
    try {
      setIsSaving(true);
      await onSave(data);
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
    } finally {
      setIsSaving(false);
    }
  });

  const createFieldHandler = (field: keyof ContactFormData, formatter?: (value: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = formatter ? formatter(e.target.value) : e.target.value;
      setValue(field, value, { shouldDirty: true, shouldValidate: true });
    };

  const createSwitchHandler = (field: keyof ContactFormData) =>
    (checked: boolean) => setValue(field, checked as any, { shouldDirty: true, shouldValidate: true });

  const createSelectHandler = (field: keyof ContactFormData, resetField?: keyof ContactFormData) =>
    (value: string) => {
      setValue(field, value, { shouldDirty: true, shouldValidate: true });
      if (resetField && field === 'country' && !isStateSelectionEnabled(value)) {
        setValue(resetField, '', { shouldDirty: true, shouldValidate: true });
      }
    };

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
      isSaving 
        ? 'opacity-75 pointer-events-none border-corporate-amber-300 dark:border-corporate-amber-600' 
        : 'border-corporate-navy-200 dark:border-corporate-navy-700 hover:border-corporate-amber-300 dark:hover:border-corporate-amber-600/50'
    }`}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-corporate-gold-50/30 via-white to-corporate-amber-50/20 dark:from-corporate-navy-900 dark:via-corporate-navy-800 dark:to-corporate-navy-900" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.02),transparent_50%)]" aria-hidden="true" />

      <div className="relative bg-white/80 dark:bg-corporate-navy-900/90 backdrop-blur-sm p-6 md:p-8">
        <form onSubmit={handleManualSave} className="space-y-6" aria-busy={isSaving}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <TextInputField
              name="fullName"
              label="Full name"
              placeholder="Charles Bloomberg"
              required
              validation={contactFormValidation.fullName}
              register={register}
              error={errors.fullName?.message}
              isSaving={isSaving}
            />

            <TextInputField
              name="email"
              label="Email address"
              placeholder="charlesbloomberg@wisc.edu"
              type="email"
              required
              icon={<Mail />}
              validation={contactFormValidation.email}
              register={register}
              error={errors.email?.message}
              isSaving={isSaving}
            />

            <TextInputField
              name="phone"
              label="Phone number"
              placeholder="(621) 799-5548"
              type="tel"
              icon={<Phone />}
              onChange={createFieldHandler('phone', (value) => formatPhone(cleanValue(value)))}
              register={register}
              error={errors.phone?.message}
              isSaving={isSaving}
            />

            <TextInputField
              name="linkedin"
              label="LinkedIn URL"
              placeholder="bloomberg"
              prefix="https://linkedin.com/in/"
              onChange={createFieldHandler('linkedin', formatLinkedIn)}
              register={register}
              error={errors.linkedin?.message}
              isSaving={isSaving}
            />

            <TextInputField
              name="website"
              label="Personal website or relevant link"
              placeholder="https://www.charlesbloomberg.com"
              type="url"
              icon={<Globe />}
              onBlur={createFieldHandler('website', formatWebsite)}
              register={register}
              error={errors.website?.message}
              isSaving={isSaving}
            />

            <SelectField
              name="country"
              label="Country"
              placeholder="Select country"
              value={formData.country}
              onValueChange={createSelectHandler('country', 'state')}
              options={COUNTRIES}
              error={errors.country?.message}
              isSaving={isSaving}
              showSwitch
              switchChecked={formData.showCountry}
              onSwitchChange={createSwitchHandler('showCountry')}
            />

            <SelectField
              name="state"
              label={getStateLabel(formData.country)}
              placeholder={
                isStateSelectionEnabled(formData.country)
                  ? `Select ${getStateLabel(formData.country).toLowerCase()}`
                  : 'Select country first'
              }
              value={formData.state}
              onValueChange={createSelectHandler('state')}
              options={getStateOptions(formData.country)}
              disabled={!isStateSelectionEnabled(formData.country)}
              error={errors.state?.message}
              isSaving={isSaving}
              showSwitch
              switchChecked={formData.showState}
              onSwitchChange={createSwitchHandler('showState')}
            />

            <TextInputField
              name="city"
              label="City"
              placeholder="New York City"
              icon={<MapPin />}
              validation={contactFormValidation.city(formData.showCity)}
              register={register}
              error={errors.city?.message}
              isSaving={isSaving}
              showSwitch
              switchChecked={formData.showCity}
              onSwitchChange={createSwitchHandler('showCity')}
            />

          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
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
                  Save basic info
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Auto-save indicator */}
        {isDirty && !isSaving && (
          <div className="fixed bottom-4 left-4 bg-green-600 text-white px-3 py-1 rounded text-sm">
            Changes auto-saved
          </div>
        )}
      </div>
    </div>
  );
}