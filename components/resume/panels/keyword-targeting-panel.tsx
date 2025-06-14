// src/components/resume/panels/KeywordTargetingPanel.tsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';


import { Check, RefreshCw, AlertCircle, Loader, Target } from 'lucide-react';
import {useKeywordAnalysis} from "@/hooks/use-keyword-analysis";
import {useJobInfo} from "@/contexts/job-info-context";
import {useResumeData} from "@/contexts/resume-data-context";

export interface KeywordTargetingPanelProps {
  className?: string;
  onJobUpdate?: () => void;
}

// KeywordItem component with memoization
interface KeywordItemProps {
  keyword: string;
  isMatching: boolean;
}

const KeywordItem = memo<KeywordItemProps>(({ keyword, isMatching }) => {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="font-medium capitalize text-gray-900 dark:text-gray-100">
        {keyword}
      </span>
      {isMatching && (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
});

KeywordItem.displayName = 'KeywordItem';

// Loading state component
const LoadingState = memo<{ isCachedLoading?: boolean }>(({ isCachedLoading = false }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className="w-6 h-6 text-blue-500 animate-spin mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {isCachedLoading ? "Loading saved keyword analysis..." : "Analyzing keywords..."}
      </p>
      {isCachedLoading && (
        <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
          Using previously generated results for faster loading
        </p>
      )}
    </div>
  );
});

LoadingState.displayName = 'LoadingState';

// Error state component
const ErrorState = memo<{ onRetry: () => void; errorMessage?: string }>(
  ({ onRetry, errorMessage = "Failed to analyze keywords" }) => {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-6 h-6 text-red-500 mb-3" />
        <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-300">
          {errorMessage}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md transition-colors bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';

// Empty state component
const EmptyState = memo<{ onAddJob: () => void }>(({ onAddJob }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Target className="w-6 h-6 text-blue-500 mb-3" />
      <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-300">
        Add a job description to get AI-powered keyword analysis
      </p>
      <button
        onClick={onAddJob}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
      >
        Add Job Description
      </button>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

const KeywordTargetingPanel: React.FC<KeywordTargetingPanelProps> = ({
  className = '',
  onJobUpdate
}) => {
  const { resumeData } = useResumeData();
  const { jobInfo } = useJobInfo();
  const [showAllMissing, setShowAllMissing] = useState(false);

  const { analysis, loading, error, isCached, refetch } = useKeywordAnalysis({
    jobInfo,
    resumeData
  });

  const handleJobUpdate = useCallback(() => {
    onJobUpdate?.();
    refetch(true);
  }, [onJobUpdate, refetch]);

  const displayedMissingKeywords = useMemo(() => {
    if (!analysis?.missing_keywords) return [];
    return showAllMissing
      ? analysis.missing_keywords
      : analysis.missing_keywords.slice(0, 10);
  }, [analysis, showAllMissing]);

  const containerClasses = useMemo(() =>
    `bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 ${className}`.trim(),
    [className]
  );

  // Handle different states
  if (!jobInfo?.title || !jobInfo?.description) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Keyword Targeting
          </h2>
        </div>
        <EmptyState onAddJob={handleJobUpdate} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Keyword Targeting
          </h2>
        </div>
        <LoadingState isCachedLoading={isCached} />
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Keyword Targeting
          </h2>
        </div>
        <ErrorState
          onRetry={() => refetch(true)}
          errorMessage={error || "Failed to analyze keywords"}
        />
      </div>
    );
  }

  // Main content
  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          AI Keyword Targeting
        </h2>
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* ATS Score Display */}
          {analysis.ats_score && (
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ATS Compatibility Score
                </h3>
                <span className={`text-2xl font-bold ${
                  analysis.ats_score.grade === 'A' ? 'text-green-500' :
                  analysis.ats_score.grade === 'B' ? 'text-blue-500' :
                  analysis.ats_score.grade === 'C' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {analysis.ats_score.grade}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    analysis.ats_score.score >= 80 ? 'bg-green-500' :
                    analysis.ats_score.score >= 60 ? 'bg-blue-500' :
                    analysis.ats_score.score >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${analysis.ats_score.score}%` }}
                />
              </div>
              <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                {analysis.ats_score.score}% keyword match rate
              </p>
            </div>
          )}

          {/* Matching Keywords */}
          {analysis.matching_keywords.length > 0 && (
            <div>
              <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
                Great work! You're ranking well for these keywords:
              </p>

              <div className="space-y-1">
                {analysis.matching_keywords.map((keyword, index) => (
                  <KeywordItem
                    key={`matching-${index}`}
                    keyword={keyword.keyword}
                    isMatching={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {analysis.missing_keywords.length > 0 && (
            <div>
              <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
                Consider adding these keywords to improve your chances:
              </p>

              <div className="space-y-1">
                {displayedMissingKeywords.map((keyword, index) => (
                  <KeywordItem
                    key={`missing-${index}`}
                    keyword={keyword.keyword}
                    isMatching={false}
                  />
                ))}
              </div>

              {/* Show All Toggle */}
              {analysis.missing_keywords.length > 10 && (
                <button
                  onClick={() => setShowAllMissing(!showAllMissing)}
                  className="mt-4 text-sm font-medium transition-colors text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {showAllMissing
                    ? 'Show less'
                    : `See all (${analysis.missing_keywords.length})`
                  }
                </button>
              )}
            </div>
          )}

          {/* Update Job Description Button */}
          <div className="pt-4">
            <button
              onClick={handleJobUpdate}
              className="w-full py-3 px-4 border-2 rounded-lg font-bold uppercase text-sm transition-colors border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              Update Job Description
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(KeywordTargetingPanel);