// components/auth/accessible-form-field.tsx
import React, { useId } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface AccessibleFormFieldProps {
  label: string;
  error?: string;
  success?: string;
  required?: boolean;
  children: (props: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
  }) => React.ReactElement;
}

export function AccessibleFormField({
  label,
  error,
  success,
  required,
  children,
}: AccessibleFormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const successId = `${id}-success`;
  const descriptionIds = [];

  if (error) descriptionIds.push(errorId);
  if (success) descriptionIds.push(successId);

  const ariaDescribedBy = descriptionIds.length > 0 ? descriptionIds.join(' ') : undefined;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="sr-only">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {children({
        id,
        'aria-describedby': ariaDescribedBy,
        'aria-invalid': !!error,
        'aria-required': required,
      })}

      {/* Error message with live region */}
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1.5 text-xs text-red-400 mt-1"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message with live region */}
      {success && !error && (
        <div
          id={successId}
          role="status"
          aria-live="polite"
          className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1"
        >
          <Check className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

// Screen reader only text component
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Live region for announcements
export function LiveRegion({ 
  announcement, 
  priority = 'polite' 
}: { 
  announcement: string; 
  priority?: 'polite' | 'assertive' 
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}