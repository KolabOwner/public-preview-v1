'use client';

import React, { useEffect, useState, ChangeEvent, useMemo, useCallback } from 'react';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Save, Loader2, AlertCircle, Link2, Mail, Phone, Linkedin, Globe, MapPin, LucideIcon } from "lucide-react";
import { Switch } from '@/components/shared/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/select';
import { Button } from '@/components/shared/button';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { useToast } from '@/lib/client/hooks/ui/use-toast';
import {
  validationRules,
  cleanPlaceholderValue,
  normalizeLinkedInUrl,
  formatWebsiteUrl,
  formatPhoneNumber
} from './utils/validation';
import {
  COUNTRIES,
  getStateOptions,
  getStateLabel,
  isStateSelectionEnabled
} from './utils/location-data';

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  country: string;
  state: string;
  city: string;
  showEmail: boolean;
  showPhone: boolean;
  showLinkedin: boolean;
  showWebsite: boolean;
  showLocation: boolean;
  showCountry: boolean;
  showState: boolean;
  showCity: boolean;
}

interface ContactFormProps {
  initialData: ContactFormData;
  onSave: (data: ContactFormData) => Promise<void>;
  autoSave?: boolean;
}

interface FormFieldProps {
  id: keyof ContactFormData;
  label: string;
  placeholder: string;
  type?: string;
  prefix?: string;
  icon?: LucideIcon | null;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (checked: boolean) => void;
  register: UseFormRegister<ContactFormData>;
  errors: FieldErrors<ContactFormData>;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-describedby'?: string;
}

// Form Field Component using shared components
const FormField: React.FC<FormFieldProps> = React.memo(({
  id,
  label,
  placeholder,
  type = "text",
  prefix,
  icon: Icon,
  showToggle,
  toggleValue,
  onToggleChange,
  register,
  errors,
  onChange,
  onBlur,
  value,
  disabled = false,
  required = false,
  'aria-describedby': ariaDescribedBy
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </Label>
        {showToggle && onToggleChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Show on resume</span>
            <Switch
              id={`${id}-toggle`}
              checked={toggleValue || false}
              onCheckedChange={onToggleChange}
              className="scale-75"
            />
          </div>
        )}
      </div>

      <div className="relative">
        <div className={`
          flex items-center rounded-md border-2 transition-colors
          ${errors[id] ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-600'}
          bg-white dark:bg-gray-800
        `}>
          {Icon && <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-3" />}
          {prefix && (
            <span className={`py-2 text-base font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap ${
              id === 'linkedin' ? 'pl-3 pr-0' : 'px-3'
            }`}>
              {prefix}
            </span>
          )}
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            className={`border-0 bg-transparent focus:ring-0 focus:border-0 h-10 sm:h-12 text-base font-semibold ${
              id === 'linkedin' ? 'pl-0 pr-3' : 'px-3'
            }`}
            {...register(id, (validationRules as any)[id] || {})}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            disabled={disabled}
            required={required}
            aria-describedby={ariaDescribedBy || (errors[id] ? `${id}-error` : undefined)}
            aria-invalid={errors[id] ? 'true' : 'false'}
          />
          {id === 'linkedin' && (
            <Link2 className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
          )}
        </div>
        {errors[id] && (
          <p
            id={`${id}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4" />
            {errors[id]?.message}
          </p>
        )}
      </div>
    </div>
  );
});

function ContactForm({ initialData, onSave }: ContactFormProps): JSX.Element {
  const { toast } = useToast();

  // Process initial data to match the cleaned/normalized format
  const processedInitialData = useMemo(() => {
    const processed = { ...initialData };

    // Clean all string fields of placeholder values
    Object.keys(processed).forEach((key) => {
      const currentValue = processed[key as keyof ContactFormData];
      if (typeof currentValue === 'string') {
        let cleanedValue = cleanPlaceholderValue(currentValue);

        // Special normalization for LinkedIn on initial load
        if (key === 'linkedin' && cleanedValue) {
          cleanedValue = normalizeLinkedInUrl(cleanedValue);
        }

        processed[key as keyof ContactFormData] = cleanedValue as any;
      }
    });

    return processed;
  }, [initialData]);

  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    defaultValues: processedInitialData,
    mode: 'onChange'
  });

  const [saveDebounceTimer, setSaveDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Simple local state for dropdowns
  const [countryValue, setCountryValue] = useState(processedInitialData.country || '');
  const [stateValue, setStateValue] = useState(processedInitialData.state || '');

  // Simplified initial setup - no need for cleanup since we're using processedInitialData
  useEffect(() => {
    // Set local state to match processed initial data
    setCountryValue(processedInitialData.country || '');
    setStateValue(processedInitialData.state || '');
  }, [processedInitialData]);

  const debouncedSave = useCallback(() => {
    // Clear existing timer
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
    }

    setIsDebouncing(true);

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        // Get the current complete state including local dropdown values
        const currentData = {
          ...getValues(),
          country: countryValue,
          state: stateValue
        };

        // Additional validation before save
        if (!currentData.fullName?.trim()) {
          toast({
            title: "Validation Error",
            description: "Full name is required",
            variant: "destructive",
          });
          setIsDebouncing(false);
          return;
        }

        if (!currentData.email?.trim()) {
          toast({
            title: "Validation Error",
            description: "Email is required",
            variant: "destructive",
          });
          setIsDebouncing(false);
          return;
        }

        await onSave(currentData);
        toast({
          title: "Success",
          description: "Contact information saved successfully",
        });

      } catch (error) {
        console.error('Save error:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save contact information",
          variant: "destructive",
        });
      } finally {
        setIsDebouncing(false);
      }
    }, 1000); // 1 second debounce

    setSaveDebounceTimer(timer);
  }, [saveDebounceTimer, getValues, countryValue, stateValue, onSave, toast]);

  const onSubmit = async (data: ContactFormData): Promise<void> => {
    debouncedSave(data);
  };

  const handlePhoneChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const cleanValue = cleanPlaceholderValue(e.target.value);
    const formatted: string = formatPhoneNumber(cleanValue);
    setValue('phone', formatted, { shouldValidate: true });
  }, [setValue]);

  const handleLinkedInChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const cleanValue = cleanPlaceholderValue(e.target.value);
    const normalized = normalizeLinkedInUrl(cleanValue);
    setValue('linkedin', normalized, { shouldValidate: true });
  }, [setValue]);

  const handleFieldBlur = useCallback((fieldId: keyof ContactFormData) => (e: ChangeEvent<HTMLInputElement>): void => {
    let cleanValue = cleanPlaceholderValue(e.target.value);

    // Special handling for specific fields
    if (fieldId === 'linkedin') {
      cleanValue = normalizeLinkedInUrl(cleanValue);
    } else if (fieldId === 'website') {
      cleanValue = formatWebsiteUrl(cleanValue);
    }

    if (cleanValue !== e.target.value) {
      setValue(fieldId, cleanValue, { shouldValidate: true });
    }
  }, [setValue]);

  // Optimized country change handler
  const handleCountryChange = useCallback((value: string) => {
    setCountryValue(value);
    setValue('country', value, { shouldValidate: true, shouldDirty: true });

    // Clear state if country doesn't support states
    if (!isStateSelectionEnabled(value)) {
      setStateValue('');
      setValue('state', '', { shouldValidate: true, shouldDirty: true });
    }
  }, [setValue]);

  // Optimized state change handler
  const handleStateChange = useCallback((value: string) => {
    setStateValue(value);
    setValue('state', value, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveDebounceTimer) {
        clearTimeout(saveDebounceTimer);
      }
    };
  }, [saveDebounceTimer]);

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${
      (isSubmitting || isDebouncing) ? 'opacity-75 pointer-events-none' : ''
    }`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-busy={isSubmitting || isDebouncing}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Full Name & Email */}
          <FormField
            id="fullName"
            label="Full name"
            placeholder="Charles Bloomberg"
            icon={null}
            register={register}
            errors={errors}
            onBlur={handleFieldBlur('fullName')}
            showToggle={false}
            required={true}
            disabled={isSubmitting || isDebouncing}
          />
          <FormField
            id="email"
            label="Email address"
            placeholder="charlesbloomberg@wisc.edu"
            type="email"
            icon={Mail}
            showToggle={false}
            register={register}
            errors={errors}
            onBlur={handleFieldBlur('email')}
            required={true}
            disabled={isSubmitting || isDebouncing}
          />

          {/* Row 2: Phone & LinkedIn */}
          <FormField
            id="phone"
            label="Phone number"
            placeholder="(621) 799-5548"
            type="tel"
            icon={Phone}
            showToggle={false}
            register={register}
            errors={errors}
            onChange={handlePhoneChange}
            value={watch('phone')}
            disabled={isSubmitting || isDebouncing}
          />
          <FormField
            id="linkedin"
            label="LinkedIn URL"
            placeholder="bloomberg"
            prefix="https://linkedin.com/in/"
            icon={Linkedin}
            showToggle={false}
            register={register}
            errors={errors}
            onChange={handleLinkedInChange}
            onBlur={handleFieldBlur('linkedin')}
            value={watch('linkedin')}
            disabled={isSubmitting || isDebouncing}
          />

          {/* Row 3: Website & Country */}
          <FormField
            id="website"
            label="Personal website or relevant link"
            placeholder="https://www.charlesbloomberg.com"
            type="url"
            icon={Globe}
            showToggle={false}
            register={register}
            errors={errors}
            onBlur={handleFieldBlur('website')}
            disabled={isSubmitting || isDebouncing}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Country
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Show on resume</span>
                <Switch
                  checked={watch('showCountry')}
                  onCheckedChange={(checked: boolean) => setValue('showCountry', checked)}
                  className="scale-75"
                />
              </div>
            </div>
            <div className={`
              rounded-md border-2 transition-colors
              ${errors.country ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-600'}
              bg-white dark:bg-gray-800
            `}>
              <Select value={countryValue} onValueChange={handleCountryChange} disabled={isSubmitting || isDebouncing}>
                <SelectTrigger className="h-10 sm:h-12 border-0 bg-transparent focus:ring-0 text-base font-semibold">
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

          {/* Row 4: State/Province & City */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {getStateLabel(countryValue)}
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Show on resume</span>
                <Switch
                  checked={watch('showState')}
                  onCheckedChange={(checked: boolean) => setValue('showState', checked)}
                  className="scale-75"
                />
              </div>
            </div>
            <div className={`
              rounded-md border-2 transition-colors
              ${errors.state ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-600'}
              bg-white dark:bg-gray-800
              ${!isStateSelectionEnabled(countryValue) ? 'opacity-50' : ''}
            `}>
              <Select
                value={stateValue}
                onValueChange={handleStateChange}
                disabled={!isStateSelectionEnabled(countryValue) || isSubmitting || isDebouncing}
              >
                <SelectTrigger className="h-10 sm:h-12 border-0 bg-transparent focus:ring-0 text-base font-semibold">
                  <SelectValue placeholder={
                    isStateSelectionEnabled(countryValue)
                      ? `Select ${getStateLabel(countryValue).toLowerCase()}`
                      : 'Select country first'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {getStateOptions(countryValue).map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <FormField
            id="city"
            label="City"
            placeholder="New York City"
            icon={MapPin}
            showToggle={true}
            toggleValue={watch('showCity')}
            onToggleChange={(checked: boolean) => setValue('showCity', checked)}
            register={register}
            errors={errors}
            onBlur={handleFieldBlur('city')}
            disabled={isSubmitting || isDebouncing}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isDebouncing}
            className="w-full md:w-auto"
          >
            {isSubmitting || isDebouncing ? (
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
    </div>
  );
}

export default ContactForm;
