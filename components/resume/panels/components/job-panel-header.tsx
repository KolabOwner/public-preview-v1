import React from 'react';
import { Sparkles } from 'lucide-react';
import { EnterpriseFeatures } from './enterprise-features';

interface JobPanelHeaderProps {
  isEnterpriseMode: boolean;
  enterpriseOptions?: {
    enableValidation?: boolean;
    enableDLP?: boolean;
    enableRealTimeUpdates?: boolean;
    enableAuditLogging?: boolean;
    enableAdvancedNLP?: boolean;
    industryContext?: string;
    targetATSScore?: number;
  };
}

export const JobPanelHeader: React.FC<JobPanelHeaderProps> = ({
  isEnterpriseMode,
  enterpriseOptions
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {isEnterpriseMode ? 'Enterprise AI Keyword Targeting' : 'AI Keyword Targeting'}
        </h2>
        {isEnterpriseMode && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
            Enterprise
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {isEnterpriseMode
          ? "Using advanced AI to extract keywords and optimize your resume for ATS systems. Enterprise features provide deeper analysis and real-time updates."
          : "Rezi helps you get more interviews by optimizing your resume with important keywords in the job description. Let's start by adding a job description."
        }
      </p>

      <EnterpriseFeatures options={enterpriseOptions} />
    </div>
  );
};