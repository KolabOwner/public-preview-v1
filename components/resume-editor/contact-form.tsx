'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Extended interface with location fields
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
}

interface ContactFormProps {
 initialData: ContactFormData;
 onSave: (data: ContactFormData) => Promise<void>;
 autoSave?: boolean;
}

// Mock location data - replace with actual API calls
const COUNTRIES = [
 { value: 'US', label: 'United States' },
 { value: 'CA', label: 'Canada' },
 { value: 'UK', label: 'United Kingdom' },
 { value: 'AU', label: 'Australia' },
 { value: 'DE', label: 'Germany' },
 { value: 'FR', label: 'France' },
];

const US_STATES = [
 { value: 'AL', label: 'Alabama' },
 { value: 'CA', label: 'California' },
 { value: 'FL', label: 'Florida' },
 { value: 'NY', label: 'New York' },
 { value: 'TX', label: 'Texas' },
 { value: 'WA', label: 'Washington' },
];

const phoneRegExp = /^(\+\d{1,3}\s?)?(\(\d{3}\)\s?)?\d{3}[-\s]?\d{4}$/;

// Validation rules for react-hook-form
const validationRules = {
 fullName: {
   required: 'Full name is required',
   minLength: {
     value: 2,
     message: 'Name must be at least 2 characters'
   }
 },
 email: {
   required: 'Email is required',
   pattern: {
     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
     message: 'Invalid email format'
   }
 },
 phone: {
   pattern: {
     value: phoneRegExp,
     message: 'Phone number is not valid'
   }
 },
 linkedin: {
   validate: (value: string) => {
     if (!value) return true;
     const fullUrlPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]{3,100}\/?$/;
     const usernamePattern = /^[a-zA-Z0-9-_]{3,100}$/;
     return fullUrlPattern.test(value) || usernamePattern.test(value) || 'Invalid LinkedIn profile';
   }
 },
 website: {
   pattern: {
     value: /^https?:\/\/.+\..+/,
     message: 'Invalid website URL'
   }
 },
 city: {
   validate: (value: string, formValues: ContactFormData) => {
     if (formValues.showLocation && !value) {
       return 'City is required when showing location';
     }
     return true;
   }
 }
};

function formatPhoneNumber(value: string): string {
 const cleaned = value.replace(/\D/g, '');

 if (cleaned.length <= 3) {
   return cleaned;
 } else if (cleaned.length <= 6) {
   return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
 } else if (cleaned.length <= 10) {
   return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
 } else {
   return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
 }
}

// Extracted FormField Component
interface FormFieldProps {
 id: keyof ContactFormData;
 label: string;
 placeholder: string;
 type?: string;
 prefix?: string;
 toggleKey?: keyof Pick<ContactFormData, 'showLocation'>;
 className?: string;
 control: any;
 errors: any;
 setValue: any;
 getValues: any;
 watch: any;
}

const FormField: React.FC<FormFieldProps> = ({
 id,
 label,
 placeholder,
 type = "text",
 prefix,
 toggleKey,
 className,
 control,
 errors,
 setValue,
 getValues,
 watch
}) => {
 const isToggleField = toggleKey !== undefined;

 const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const formatted = formatPhoneNumber(e.target.value);
   setValue(id, formatted);
 };

 const getValidationRules = () => {
   return validationRules[id as keyof typeof validationRules] || {};
 };

 return (
   <div className={cn("space-y-2", className)}>
     <div className="flex justify-between items-center">
       <Label htmlFor={id} className="text-sm font-medium">
         {label}
       </Label>
     </div>
     <div className="relative">
       {prefix && (
         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted-foreground truncate max-w-[90px] sm:max-w-[110px]">
           {prefix}
         </span>
       )}
       <Input
         id={id}
         type={type}
         placeholder={placeholder}
         {...control.register(id, getValidationRules())}
         onChange={id === 'phone' ? handlePhoneChange : undefined}
         className={cn(
           "bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background",
           errors[id] && "border-destructive focus-visible:ring-destructive",
           prefix && "pl-[100px] sm:pl-[120px]"
         )}
       />
       {errors[id] && (
         <p className="mt-1 text-xs text-destructive flex items-center gap-1">
           <AlertCircle className="h-3 w-3" />
           {errors[id]?.message}
         </p>
       )}
     </div>
   </div>
 );
};

interface LocationFieldsProps {
 control: any;
 errors: any;
 setValue: any;
 getValues: any;
 watch: any;
}

const LocationFields: React.FC<LocationFieldsProps> = ({
 control,
 errors,
 setValue,
 getValues,
 watch
}) => {
 const selectedCountry = watch('country');
 const selectedState = watch('state');

 // Clear state when country changes and it's not US
 useEffect(() => {
   if (selectedCountry !== 'US') {
     setValue('state', '');
   }
 }, [selectedCountry, setValue]);

 return (
   <>
     <div className="space-y-2">
       <div className="flex justify-between items-center">
         <Label htmlFor="country" className="text-sm font-medium">
           Country
         </Label>
         <div className="flex items-center space-x-2">
           <Label htmlFor="location-toggle" className="text-xs text-muted-foreground">
             Show on resume
           </Label>
           <Switch
             id="location-toggle"
             checked={getValues('showLocation')}
             onCheckedChange={(checked) => setValue('showLocation', checked)}
             aria-label="Show location on resume"
           />
         </div>
       </div>
       <Select
         onValueChange={(value) => setValue('country', value)}
         value={selectedCountry || ''}
       >
         <SelectTrigger id="country" className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background">
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

     <div className="space-y-2">
       <div className="flex justify-between items-center">
         <Label htmlFor="state" className="text-sm font-medium">
           State/Province
         </Label>
         <div className="flex items-center space-x-2">
           <Label htmlFor="state-toggle" className="text-xs text-muted-foreground">
             Show on resume
           </Label>
           <Switch
             id="state-toggle"
             checked={getValues('showLocation')}
             onCheckedChange={(checked) => setValue('showLocation', checked)}
             aria-label="Show state/province on resume"
           />
         </div>
       </div>
       <Select
         onValueChange={(value) => setValue('state', value)}
         value={selectedState || ''}
         disabled={selectedCountry !== 'US'}
       >
         <SelectTrigger id="state" className="bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background">
           <SelectValue placeholder={selectedCountry === 'US' ? "Select state" : "Select country first"} />
         </SelectTrigger>
         <SelectContent>
           {US_STATES.map((state) => (
             <SelectItem key={state.value} value={state.value}>
               {state.label}
             </SelectItem>
           ))}
         </SelectContent>
       </Select>
       {selectedCountry !== 'US' && (
         <p className="text-xs text-muted-foreground">
           State selection is only available for United States
         </p>
       )}
     </div>
     <div className="space-y-2">
       <div className="flex justify-between items-center">
         <Label htmlFor="city" className="text-sm font-medium">
           City
         </Label>
         <div className="flex items-center space-x-2">
           <Label htmlFor="city-toggle" className="text-xs text-muted-foreground">
             Show on resume
           </Label>
           <Switch
             id="city-toggle"
             checked={getValues('showLocation')}
             onCheckedChange={(checked) => setValue('showLocation', checked)}
             aria-label="Show city on resume"
           />
         </div>
       </div>
       <div className="relative">
         <Input
           id="city"
           type="text"
           placeholder="San Francisco"
           {...control.register('city', validationRules.city || {})}
           className={cn(
             "bg-background/50 dark:bg-background/20 hover:bg-background/70 dark:hover:bg-background/30 focus:bg-background focus-visible:bg-background",
             errors.city && "border-destructive focus-visible:ring-destructive"
           )}
         />
         {errors.city && (
           <p className="mt-1 text-xs text-destructive flex items-center gap-1">
             <AlertCircle className="h-3 w-3" />
             {errors.city?.message}
           </p>
         )}
       </div>
     </div>
   </>
 );
};

interface AutoSaveIndicatorProps {
 isSaving: boolean;
 hasChanges: boolean;
 autoSave: boolean;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
 isSaving,
 hasChanges,
 autoSave
}) => {
 return (
   <div className="text-sm text-muted-foreground">
     {autoSave && hasChanges && (
       <span className="flex items-center gap-2">
         {isSaving ? (
           <>
             <Loader2 className="h-3 w-3 animate-spin" />
             Auto-saving...
           </>
         ) : (
           'Changes will be saved automatically'
         )}
       </span>
     )}
   </div>
 );
};

function ContactForm({ initialData, onSave, autoSave = false }: ContactFormProps) {
 const {
   handleSubmit,
   control,
   setValue,
   getValues,
   watch,
   formState: { errors, isSubmitting, isDirty },
   setFocus
 } = useForm<ContactFormData>({
   defaultValues: initialData,
   mode: 'onChange'
 });

 const { toast } = useToast();
 const isSaving = isSubmitting;
 const hasChanges = isDirty;

 useEffect(() => {
   Object.keys(initialData).forEach((key) => {
     setValue(key as keyof ContactFormData, initialData[key as keyof ContactFormData]);
   });
 }, [initialData, setValue]);

 const onSubmit = async (data: ContactFormData) => {
   try {
     await onSave(data);
     toast({
       title: "Contact Info Saved",
       description: "Your contact information has been updated successfully.",
     });
   } catch (error) {
     toast({
       title: "Save Failed",
       description: "There was an error saving your information. Please try again.",
       variant: "destructive",
     });
   }
 };

 // Auto-save functionality
 useEffect(() => {
   let timeoutId: NodeJS.Timeout;

   if (autoSave && hasChanges) {
     timeoutId = setTimeout(async () => {
       try {
         await onSave(getValues());
         toast({
           title: "Auto-saved",
           description: "Your changes have been saved automatically.",
         });
       } catch (error) {
         toast({
           title: "Auto-save failed",
           description: "Your changes couldn't be saved. Please try again.",
           variant: "destructive",
         });
       }
     }, 2000);
   }

   return () => clearTimeout(timeoutId);
 }, [autoSave, hasChanges, onSave, getValues, toast]);

 useEffect(() => {
   setFocus('fullName');
 }, [setFocus]);

 return (
   <div className="w-full mx-auto max-w-[1400px] border-2 border-border rounded-xl overflow-hidden bg-card shadow-sm dark:shadow-md">
     <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
             {/* Row 1: Full Name -- Email Address */}
             <FormField
               id="fullName"
               label="Full Name"
               placeholder="John Doe"
               type="text"
               control={control}
               errors={errors}
               setValue={setValue}
               getValues={getValues}
               watch={watch}
             />
             <FormField
               id="email"
               label="Email Address"
               placeholder="john@example.com"
               type="email"
               control={control}
               errors={errors}
               setValue={setValue}
               getValues={getValues}
               watch={watch}
             />

             {/* Row 2: Phone Number -- LinkedIn URL */}
             <FormField
               id="phone"
               label="Phone Number"
               placeholder="(555) 123-4567"
               type="tel"
               control={control}
               errors={errors}
               setValue={setValue}
               getValues={getValues}
               watch={watch}
             />
             <FormField
               id="linkedin"
               label="LinkedIn URL"
               placeholder="johndoe"
               type="text"
               prefix="linkedin.com/in/"
               control={control}
               errors={errors}
               setValue={setValue}
               getValues={getValues}
               watch={watch}
             />

             {/* Row 3: Personal Website -- Country */}
             <FormField
               id="website"
               label="Personal Website or Relevant Link"
               placeholder="https://johndoe.com"
               type="url"
               control={control}
               errors={errors}
               setValue={setValue}
               getValues={getValues}
               watch={watch}
             />
             <LocationFields
               control={control}
               errors={errors}
               setValue={setValue}
               getValues={getValues}
               watch={watch}
             />
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-between pt-4 sm:pt-6 border-t dark:border-border/40 gap-3">
             <AutoSaveIndicator isSaving={isSaving} hasChanges={hasChanges} autoSave={autoSave} />
             <Button type="submit" disabled={isSaving} size="lg" className="w-full sm:w-auto">
               {isSaving ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Saving...
                 </>
               ) : (
                 <>
                   <Save className="mr-2 h-4 w-4" />
                   Save Contact Info
                 </>
               )}
             </Button>
           </div>
         </form>
   </div>
 );
}

export default ContactForm;
