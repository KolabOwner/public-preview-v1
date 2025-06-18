import React from 'react';
import { CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
  show: boolean;
  details?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ type, message, show, details }) => {
  if (!show) return null;

  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      Icon: CheckCircle
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      Icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      Icon: Sparkles
    }
  };

  const { bg, border, text, Icon } = styles[type];

  return (
    <div className={`${bg} ${border} border rounded-lg p-3 mb-4 animate-in fade-in-0 duration-200`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <span className={`text-sm ${text} font-medium`}>{message}</span>
          {details && (
            <p className={`text-xs ${text} mt-1 opacity-80`}>{details}</p>
          )}
        </div>
      </div>
    </div>
  );
};