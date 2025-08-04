// components/resume/forms/hooks/use-auto-save.ts
import { useEffect } from 'react';

interface UseAutoSaveProps {
  data: any;
  isDirty: boolean;
  onSave: (data: any) => Promise<void>;
  delay?: number;
}

export const useAutoSave = ({ data, isDirty, onSave, delay = 1000 }: UseAutoSaveProps) => {
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(async () => {
      try {
        await onSave(data);
        console.log('Auto-saved form data:', data);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [data, isDirty, onSave, delay]);
};
