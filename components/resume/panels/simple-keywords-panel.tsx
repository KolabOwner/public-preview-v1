'use client';

import React, { useState } from 'react';
import { Target, CheckCircle, AlertCircle, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useSimpleJob } from '@/contexts/simple-job-context';
import { MissingKeyword } from '@/lib/features/api/keywords';

interface SimpleKeywordsPanelProps {
  onUpdate?: () => void;
  className?: string;
}

export default function SimpleKeywordsPanel({ onUpdate, className = '' }: SimpleKeywordsPanelProps) {
  const { jobInfo, analysisResults, clearJobInfo } = useSimpleJob();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['must_have']));

  if (!jobInfo || !analysisResults) {
    return null;
  }

  const handleClearJob = async () => {
    await clearJobInfo();
    onUpdate?.();
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Group missing keywords by importance
  const groupedMissing = analysisResults.missingKeywords.reduce((acc, keyword) => {
    if (!acc[keyword.importance]) acc[keyword.importance] = [];
    acc[keyword.importance].push(keyword);
    return acc;
  }, {} as Record<string, MissingKeyword[]>);

  // Score color based on ATS score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Keyword Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {jobInfo.title} {jobInfo.company && `at ${jobInfo.company}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearJob}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Clear job"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ATS Score */}
        <div className={`mt-4 p-4 rounded-lg ${getScoreBg(analysisResults.atsScore)}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ATS Match Score
            </span>
            <span className={`text-2xl font-bold ${getScoreColor(analysisResults.atsScore)}`}>
              {analysisResults.atsScore}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                analysisResults.atsScore >= 80 
                  ? 'bg-green-600 dark:bg-green-400'
                  : analysisResults.atsScore >= 60
                  ? 'bg-yellow-600 dark:bg-yellow-400'
                  : 'bg-red-600 dark:bg-red-400'
              }`}
              style={{ width: `${analysisResults.atsScore}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {analysisResults.matchedCount} matched
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {analysisResults.missingCount} missing
            </span>
          </div>
        </div>
      </div>

      {/* Missing Keywords by Priority */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {(['must_have', 'strongly_preferred', 'nice_to_have'] as const).map((importance) => {
          const keywords = groupedMissing[importance] || [];
          if (keywords.length === 0) return null;

          const isExpanded = expandedCategories.has(importance);
          const displayName = {
            must_have: 'Must Have Keywords',
            strongly_preferred: 'Strongly Preferred',
            nice_to_have: 'Nice to Have',
          }[importance];

          const iconColor = {
            must_have: 'text-red-600 dark:text-red-400',
            strongly_preferred: 'text-yellow-600 dark:text-yellow-400',
            nice_to_have: 'text-blue-600 dark:text-blue-400',
          }[importance];

          return (
            <div key={importance}>
              <button
                onClick={() => toggleCategory(importance)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-5 h-5 ${iconColor}`} />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {displayName}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({keywords.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-6 pb-4 space-y-3">
                  {keywords.map((keyword, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {keyword.isMultiTerm && (
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {keyword.keyword}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {keyword.contextInJob}
                          </p>
                          {keyword.relatedTermsInResume.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Related in resume: {keyword.relatedTermsInResume.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300">
                          {keyword.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Update Job Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onUpdate}
          className="w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
        >
          Update Job Details
        </button>
      </div>
    </div>
  );
}