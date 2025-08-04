// components/resume/forms/components/form-fields.tsx
import React from 'react';
import { Switch } from '@/components/shared/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/select';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { getFieldClasses, getInputClasses, getIconClasses } from '../utils/styling';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  showSwitch?: boolean;
  switchChecked?: boolean;
  onSwitchChange?: (checked: boolean) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  children,
  showSwitch,
  switchChecked,
  onSwitchChange
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-sm font-medium text-corporate-navy-900 dark:text-gray-100">
        {label}
        {required && <span className="text-corporate-amber-500 ml-1" aria-label="required">*</span>}
      </Label>
      {showSwitch && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-corporate-navy-600 dark:text-gray-400">Show on resume</span>
          <Switch
            checked={switchChecked}
            onCheckedChange={onSwitchChange}
            className="scale-75 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-corporate-gold-500 data-[state=checked]:to-corporate-amber-500"
          />
        </div>
      )}
    </div>
    {children}
    {error && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fade-in">
        {error}
      </p>
    )}
  </div>
);

interface TextInputFieldProps {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'url';
  icon?: React.ReactNode;
  prefix?: string;
  validation?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  register: any;
  error?: string;
  isSaving: boolean;
  showSwitch?: boolean;
  switchChecked?: boolean;
  onSwitchChange?: (checked: boolean) => void;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  name,
  label,
  placeholder,
  required,
  type = 'text',
  icon,
  prefix,
  validation,
  onChange,
  onBlur,
  register,
  error,
  isSaving,
  showSwitch,
  switchChecked,
  onSwitchChange
}) => (
  <FormField
    label={label}
    required={required}
    error={error}
    showSwitch={showSwitch}
    switchChecked={switchChecked}
    onSwitchChange={onSwitchChange}
  >
    <div className={getFieldClasses(!!error, isSaving)}>
      {icon && <div className={getIconClasses()}>{icon}</div>}
      {prefix && (
        <span className="py-2 text-base font-semibold text-corporate-navy-700 dark:text-gray-300 whitespace-nowrap pl-3 pr-0">
          {prefix}
        </span>
      )}
      <Input
        {...register(name, validation)}
        type={type}
        placeholder={placeholder}
        className={`${getInputClasses()} ${prefix ? 'pl-0 pr-3' : ''}`}
        onChange={onChange}
        onBlur={onBlur}
        disabled={isSaving}
      />
    </div>
  </FormField>
);

interface SelectFieldProps {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  error?: string;
  isSaving: boolean;
  showSwitch?: boolean;
  switchChecked?: boolean;
  onSwitchChange?: (checked: boolean) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  placeholder,
  value,
  onValueChange,
  options,
  disabled,
  error,
  isSaving,
  showSwitch,
  switchChecked,
  onSwitchChange
}) => (
  <FormField
    label={label}
    error={error}
    showSwitch={showSwitch}
    switchChecked={switchChecked}
    onSwitchChange={onSwitchChange}
  >
    <div className={`${getFieldClasses(!!error, isSaving)} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled || isSaving}>
        <SelectTrigger className="h-10 sm:h-12 border-0 bg-transparent focus:ring-0 text-base font-semibold text-corporate-navy-900 dark:text-gray-100 hover:bg-transparent">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </FormField>
);