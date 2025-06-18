import React from 'react';
import { Shield, Zap } from 'lucide-react';

interface EnterpriseOptions {
  enableValidation?: boolean;
  enableDLP?: boolean;
  enableRealTimeUpdates?: boolean;
  enableAuditLogging?: boolean;
  enableAdvancedNLP?: boolean;
  industryContext?: string;
  targetATSScore?: number;
}

interface EnterpriseFeaturesProps {
  options?: EnterpriseOptions;
}

export const EnterpriseFeatures: React.FC<EnterpriseFeaturesProps> = ({ options }) => {
  if (!options || !Object.values(options).some(v => v)) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.enableValidation && (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
          <Shield className="w-3 h-3" />
          Validation
        </span>
      )}
      {options.enableAdvancedNLP && (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
          <Zap className="w-3 h-3" />
          Advanced AI
        </span>
      )}
      {options.enableRealTimeUpdates && (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Real-time
        </span>
      )}
    </div>
  );
};