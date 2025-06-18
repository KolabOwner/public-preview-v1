import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  children,
  className = ''
}) => {
  return (
    <div className={`relative grid gap-y-2 ${className}`}>
      <div className="flex items-end justify-between">
        <label className="uppercase flex items-center font-semibold text-xs leading-4 text-gray-700 dark:text-gray-300">
          <span className="cursor-pointer">{label}</span>
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};