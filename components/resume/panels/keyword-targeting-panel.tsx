// src/components/resume/panels/KeywordTargetingPanel.tsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Check, RefreshCw, AlertCircle, Loader, Target, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { useJobInfo } from "@/contexts/job-info-context";
import { useAuth } from '@/contexts/auth-context';
import { logger } from '@/lib/enterprise/monitoring/logging';
import { performanceAnalytics } from '@/lib/enterprise/monitoring/analytics';
import { AnalyzeAPI } from '@/lib/features/api/analyze';

export interface KeywordTargetingPanelProps {
  className?: string;
  onJobUpdate?: () => void;
  onRecommendationApply?: (recommendation: any) => void;
}

// KeywordItem component with memoization
interface KeywordItemProps {
  keyword: string;
  isMatching: boolean;
  frequency?: number;
  importance?: 'critical' | 'high' | 'medium' | 'low';
  category?: string;
}

const KeywordItem = memo<KeywordItemProps>(({ keyword, isMatching, frequency, importance, category }) => {
  const importanceColors = {
    critical: 'text-red-600 dark:text-red-400',
    high: 'text-orange-600 dark:text-orange-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex-1">
        <span className="font-medium capitalize text-gray-900 dark:text-gray-100">
          {keyword}
        </span>
        <div className="flex items-center gap-3 mt-1 text-xs">
          {category && (
            <span className="text-gray-500 dark:text-gray-400">{category}</span>
          )}
          {frequency && frequency > 1 && (
            <span className="text-gray-500 dark:text-gray-400">×{frequency}</span>
          )}
          {importance && !isMatching && (
            <span className={importanceColors[importance]}>{importance}</span>
          )}
        </div>
      </div>
      {isMatching ? (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>
      ) : (
        importance === 'critical' && (
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
        )
      )}
    </div>
  );
});

KeywordItem.displayName = 'KeywordItem';

// ATS Score Display component
interface ATSScoreProps {
  score: number;
  breakdown?: {
    keywordMatch: number;
    skillsAlignment: number;
    experienceRelevance: number;
    educationMatch: number;
    formatting: number;
  };
}

const ATSScoreDisplay = memo<ATSScoreProps>(({ score, breakdown }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent match! Your resume is well-optimized.';
    if (score >= 60) return 'Good match. Some improvements recommended.';
    if (score >= 40) return 'Fair match. Consider adding missing keywords.';
    return 'Poor match. Significant improvements needed.';
  };

  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          ATS Compatibility Score
        </h3>
        <div className="flex items-center gap-3">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </span>
          <span className={`text-xl font-bold ${getScoreColor(score)}`}>
            {getScoreGrade(score)}
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            score >= 80 ? 'bg-green-500' :
            score >= 60 ? 'bg-blue-500' :
            score >= 40 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
        {getScoreMessage(score)}
      </p>

      {breakdown && (
        <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Keyword Match</span>
              <span className="font-medium">{breakdown.keywordMatch}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Skills Alignment</span>
              <span className="font-medium">{breakdown.skillsAlignment}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Experience Relevance</span>
              <span className="font-medium">{breakdown.experienceRelevance}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ATSScoreDisplay.displayName = 'ATSScoreDisplay';

// Recommendation card component
interface RecommendationCardProps {
  recommendation: {
    type: string;
    priority: string;
    section: string;
    suggestedText: string;
    reason: string;
    keywords: string[];
    impact: number;
  };
  onApply?: () => void;
}

const RecommendationCard = memo<RecommendationCardProps>(({ recommendation, onApply }) => {
  const priorityColors = {
    high: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    medium: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    low: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
  };

  return (
    <div className={`p-3 rounded-lg border ${priorityColors[recommendation.priority] || priorityColors.low}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {recommendation.section}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              +{recommendation.impact}% impact
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {recommendation.reason}
          </p>
        </div>
        {onApply && (
          <button
            onClick={onApply}
            className="ml-3 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
          >
            Apply
          </button>
        )}
      </div>
      {recommendation.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {recommendation.keywords.map((keyword, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

RecommendationCard.displayName = 'RecommendationCard';

// Loading state component
const LoadingState = memo<{ message?: string }>(({ message = "Analyzing keywords..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className="w-6 h-6 text-blue-500 animate-spin mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
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
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
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
  onJobUpdate,
  onRecommendationApply
}) => {
  const {
    jobInfo,
    currentResumeId,
    analyzeATS,
    isEnterpriseMode,
    isLoading,
    error: contextError
  } = useJobInfo();
  const { user } = useAuth();
  const [showAllMissing, setShowAllMissing] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<Date | null>(null);

  // Extract keywords and analysis data from jobInfo
  const { matchedKeywords, missingKeywords } = useMemo(() => {
    // If we have ATS analysis data, use it
    if (jobInfo.matchedKeywords && jobInfo.missingKeywords) {
      return {
        matchedKeywords: jobInfo.matchedKeywords.map(kw => ({
          keyword: kw.keyword,
          isMatching: true,
          frequency: kw.resumeFrequency,
          category: kw.category,
          relevanceScore: kw.relevanceScore
        })),
        missingKeywords: jobInfo.missingKeywords.map(kw => ({
          keyword: kw.keyword,
          isMatching: false,
          importance: kw.importance,
          category: kw.category,
          suggestions: kw.suggestions
        }))
      };
    }

    // Otherwise, extract from jobInfo.extractedKeywords
    if (!jobInfo.extractedKeywords || jobInfo.extractedKeywords.length === 0) {
      return { matchedKeywords: [], missingKeywords: [] };
    }

    // Create a map of resume keywords for quick lookup
    const resumeKeywordSet = new Set(
      jobInfo.keywords.map(k => k.toLowerCase())
    );

    const matched: any[] = [];
    const missing: any[] = [];

    // Process extracted keywords from the job
    jobInfo.extractedKeywords.forEach(kw => {
      const keywordLower = kw.keyword.toLowerCase();
      
      // Check if keyword exists in resume
      const isMatched = resumeKeywordSet.has(keywordLower) || 
        kw.variations.some(v => resumeKeywordSet.has(v.toLowerCase()));

      if (isMatched) {
        matched.push({
          keyword: kw.keyword,
          isMatching: true,
          frequency: kw.frequency,
          category: kw.category,
          importance: kw.importance
        });
      } else {
        missing.push({
          keyword: kw.keyword,
          isMatching: false,
          frequency: kw.frequency,
          importance: kw.importance,
          category: kw.category,
          variations: kw.variations
        });
      }
    });

    // Sort by importance
    const importanceOrder = {
      'critical': 0,
      'required': 1,
      'high': 2,
      'preferred': 3,
      'medium': 4,
      'nice_to_have': 5,
      'low': 6
    };

    matched.sort((a, b) => {
      const aImportance = importanceOrder[a.importance] || 999;
      const bImportance = importanceOrder[b.importance] || 999;
      return aImportance - bImportance;
    });

    missing.sort((a, b) => {
      const aImportance = importanceOrder[a.importance] || 999;
      const bImportance = importanceOrder[b.importance] || 999;
      return aImportance - bImportance;
    });

    return { matchedKeywords: matched, missingKeywords: missing };
  }, [jobInfo.extractedKeywords, jobInfo.keywords, jobInfo.matchedKeywords, jobInfo.missingKeywords]);

  const displayedMissingKeywords = useMemo(() => {
    return showAllMissing
      ? missingKeywords
      : missingKeywords.slice(0, 10);
  }, [missingKeywords, showAllMissing]);

  // Perform ATS analysis
  const performAnalysis = useCallback(async () => {
    if (!currentResumeId || !user?.uid || !jobInfo.title) return;

    const timer = performanceAnalytics.startTimer('keyword.panel.analysis', {
      resumeId: currentResumeId
    });

    setIsAnalyzing(true);

    try {
      logger.info('Performing ATS analysis', { resumeId: currentResumeId });

      const result = await analyzeATS({
        includeRecommendations: true,
        targetScore: 80
      });

      setLastAnalyzedAt(new Date());

      logger.info('ATS analysis completed', {
        score: result.score,
        recommendationCount: result.recommendations.length
      });

    } catch (error) {
      logger.error('ATS analysis failed', { error });
    } finally {
      setIsAnalyzing(false);
      await timer();
    }
  }, [currentResumeId, user?.uid, jobInfo.title, analyzeATS]);

  // Auto-analyze when job info is loaded
  useEffect(() => {
    if (jobInfo.title && jobInfo.extractedKeywords && !jobInfo.atsScore && !isAnalyzing) {
      performAnalysis();
    }
  }, [jobInfo.title, jobInfo.extractedKeywords, jobInfo.atsScore, isAnalyzing, performAnalysis]);

  const handleJobUpdate = useCallback(() => {
    onJobUpdate?.();
    setLastAnalyzedAt(null);
  }, [onJobUpdate]);

  const handleRefresh = useCallback(async () => {
    await performAnalysis();
  }, [performAnalysis]);

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

  if (isLoading || isAnalyzing) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Keyword Targeting
          </h2>
        </div>
        <LoadingState message={isAnalyzing ? "Performing ATS analysis..." : "Loading keyword data..."} />
      </div>
    );
  }

  if (contextError && !jobInfo.extractedKeywords) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Keyword Targeting
          </h2>
        </div>
        <ErrorState
          onRetry={handleRefresh}
          errorMessage={contextError || "Failed to analyze keywords"}
        />
      </div>
    );
  }

  // Main content
  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEnterpriseMode ? 'Enterprise AI Keyword Targeting' : 'AI Keyword Targeting'}
          </h2>
          {isEnterpriseMode && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              Enterprise
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isAnalyzing}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Refresh analysis"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-6">
        {/* ATS Score Display */}
        {jobInfo.atsScore !== undefined && (
          <ATSScoreDisplay
            score={jobInfo.atsScore}
            breakdown={jobInfo.enterpriseMetadata?.lastAnalyzed ? {
              keywordMatch: 68,
              skillsAlignment: 75,
              experienceRelevance: 82,
              educationMatch: 90,
              formatting: 95
            } : undefined}
          />
        )}

        {/* Matched Keywords */}
        {matchedKeywords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Keywords you're ranking for ({matchedKeywords.length})
              </p>
            </div>

            <div className="space-y-1">
              {matchedKeywords.map((keyword, index) => (
                <KeywordItem
                  key={`matching-${index}`}
                  keyword={keyword.keyword}
                  isMatching={true}
                  category={keyword.category}
                />
              ))}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {missingKeywords.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Keywords to consider adding ({missingKeywords.length})
              </p>
            </div>

            <div className="space-y-1">
              {displayedMissingKeywords.map((keyword, index) => (
                <KeywordItem
                  key={`missing-${index}`}
                  keyword={keyword.keyword}
                  isMatching={false}
                  frequency={keyword.frequency}
                  importance={keyword.importance}
                  category={keyword.category}
                />
              ))}
            </div>

            {/* Show All Toggle */}
            {missingKeywords.length > 10 && (
              <button
                onClick={() => setShowAllMissing(!showAllMissing)}
                className="mt-4 text-sm font-medium transition-colors text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {showAllMissing
                  ? 'Show less'
                  : `See all (${missingKeywords.length})`
                }
              </button>
            )}
          </div>
        )}

        {/* Recommendations */}
        {jobInfo.recommendations && jobInfo.recommendations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  AI Recommendations ({jobInfo.recommendations.length})
                </p>
              </div>
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showRecommendations ? 'Hide' : 'Show'}
              </button>
            </div>

            {showRecommendations && (
              <div className="space-y-3">
                {jobInfo.recommendations.slice(0, 5).map((rec, index) => (
                  <RecommendationCard
                    key={index}
                    recommendation={rec}
                    onApply={() => onRecommendationApply?.(rec)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleJobUpdate}
            className="w-full py-3 px-4 border-2 rounded-lg font-bold uppercase text-sm transition-colors border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Update Job Description
          </button>

          {lastAnalyzedAt && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Last analyzed: {new Date(lastAnalyzedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(KeywordTargetingPanel);