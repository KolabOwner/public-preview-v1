// src/components/resume/panels/KeywordTargetingPanel.tsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { X, Lock, Circle, RefreshCw, Loader, Target, AlertCircle } from 'lucide-react';
import { useJobInfo } from "@/contexts/job-info-context";
import { useAuth } from '@/contexts/auth-context';
import { useUserUsage } from '@/hooks/use-user-usage';
import { logger } from '@/lib/enterprise/monitoring/logging';
import { performanceAnalytics } from '@/lib/enterprise/monitoring/analytics';
import JobUpdateModal from '../modals/job-update-modal';

export interface KeywordTargetingPanelProps {
  className?: string;
  onJobUpdate?: () => void;
  onRecommendationApply?: (recommendation: any) => void;
}

// KeywordItem component for the new design
interface KeywordItemProps {
  keyword: string;
  isMatching: boolean;
  isPro?: boolean;
  onRemove?: () => void;
}

const KeywordItem = memo<KeywordItemProps>(({ keyword, isMatching, isPro = false, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isPro) {
    return (
      <div className="flex justify-between items-center px-6 py-1 group hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
        <span className="flex items-center gap-2">
          <span className="leading-6 font-semibold capitalize text-gray-300 dark:text-gray-500 bg-gray-300 dark:bg-gray-600 px-2 rounded blur-sm select-none">
            hidden keyword
          </span>
          <b className="text-sm">PRO</b>
        </span>
        <span className="flex">
          <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </span>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-between items-center px-6 py-1 group hover:bg-gray-50 dark:hover:bg-gray-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="leading-6 font-semibold capitalize text-gray-900 dark:text-gray-100">
        {keyword}
      </span>
      <span className="flex h-full justify-center items-center gap-2">
        {onRemove && (
          <X 
            className={`w-4 h-4 text-gray-600 dark:text-gray-400 mr-2 cursor-pointer transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={onRemove}
          />
        )}
        <Circle 
          className={`w-2 h-2 ${
            isMatching 
              ? 'text-green-500 fill-green-500' 
              : 'text-gray-300 dark:text-gray-600 opacity-40'
          }`} 
        />
      </span>
    </div>
  );
});

KeywordItem.displayName = 'KeywordItem';

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
  onJobUpdate
}) => {
  const {
    jobInfo,
    currentResumeId,
    analyzeATS,
    updateJobInfo,
    isEnterpriseMode,
    isLoading,
    error: contextError
  } = useJobInfo();
  const { user } = useAuth();
  const { usage } = useUserUsage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [isJobUpdateModalOpen, setIsJobUpdateModalOpen] = useState(false);

  // Fetch user subscription plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user?.uid) return;
      
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/features/auth/firebase-config');
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const plan = userData.subscription?.plan || 'free';
          setUserPlan(plan);
        }
      } catch (error) {
        logger.error('Failed to fetch user subscription plan', { error });
      }
    };

    fetchUserPlan();
  }, [user?.uid]);

  // Extract keywords and analysis data from jobInfo
  const { allKeywords, matchedCount, missingCount } = useMemo(() => {
    // Get extractedKeywords or fall back to empty array
    const extractedKeywords = jobInfo.extractedKeywords || [];
    
    if (extractedKeywords.length === 0) {
      return { allKeywords: [], matchedCount: 0, missingCount: 0 };
    }

    // Get matched keywords from the analysis (keywords found in both resume and job)
    const matchedKeywords = jobInfo.matchedKeywords || [];
    const matchedKeywordSet = new Set(
      matchedKeywords.map(k => k.keyword.toLowerCase())
    );

    // Process all extracted keywords
    const processedKeywords = extractedKeywords.map(kw => {
      const keywordLower = kw.keyword.toLowerCase();
      
      // Check if this keyword was found in the resume
      const isMatched = matchedKeywordSet.has(keywordLower) || 
        (kw.variations || []).some(v => matchedKeywordSet.has(v.toLowerCase()));

      return {
        keyword: kw.keyword,
        isMatching: isMatched,
        frequency: kw.frequency,
        importance: kw.importance,
        category: kw.category
      };
    });

    // Sort by matching status first, then by importance
    const importanceOrder = {
      'critical': 0,
      'required': 1,
      'high': 2,
      'preferred': 3,
      'medium': 4,
      'nice_to_have': 5,
      'low': 6
    };

    processedKeywords.sort((a, b) => {
      // Missing keywords first
      if (a.isMatching !== b.isMatching) {
        return a.isMatching ? 1 : -1;
      }
      // Then by importance
      const aImportance = importanceOrder[a.importance] || 999;
      const bImportance = importanceOrder[b.importance] || 999;
      return aImportance - bImportance;
    });

    const matchedCount = processedKeywords.filter(k => k.isMatching).length;
    const missingCount = processedKeywords.filter(k => !k.isMatching).length;

    return { 
      allKeywords: processedKeywords, 
      matchedCount, 
      missingCount 
    };
  }, [jobInfo.extractedKeywords, jobInfo.matchedKeywords]);

  // Determine how many keywords to display
  const displayedKeywords = useMemo(() => {
    // Only Pro/Enterprise users can use showAll
    if (showAll && (userPlan === 'pro' || userPlan === 'enterprise')) {
      return allKeywords;
    }
    
    // Pro/Enterprise users see more keywords by default
    if (userPlan === 'pro' || userPlan === 'enterprise') {
      const missingKeywords = allKeywords.filter(k => !k.isMatching).slice(0, 10);
      const matchingKeywords = allKeywords.filter(k => k.isMatching).slice(0, 5);
      return [...missingKeywords, ...matchingKeywords];
    }
    
    // Free users see limited keywords (showAll doesn't affect them)
    const missingKeywords = allKeywords.filter(k => !k.isMatching).slice(0, 5);
    const matchingKeywords = allKeywords.filter(k => k.isMatching).slice(0, 3);
    
    return [...missingKeywords, ...matchingKeywords];
  }, [allKeywords, showAll, userPlan]);

  // Calculate how many pro keywords to show (for non-pro users)
  const proKeywordsCount = useMemo(() => {
    // Pro and Enterprise users don't see blurred keywords
    if (userPlan === 'pro' || userPlan === 'enterprise') {
      return 0;
    }
    
    if (showAll) return 0;
    return Math.max(0, Math.min(5, allKeywords.length - displayedKeywords.length));
  }, [allKeywords, displayedKeywords, showAll, userPlan]);

  // Perform ATS analysis
  const performAnalysis = useCallback(async () => {
    if (!currentResumeId || !user?.uid || !jobInfo.title) return;

    const timer = performanceAnalytics.startTimer('keyword.panel.analysis', {
      resumeId: currentResumeId
    });

    setIsAnalyzing(true);

    try {
      logger.info('Performing keyword analysis', { resumeId: currentResumeId });

      await analyzeATS({
        includeRecommendations: false,
        targetScore: 80
      });

      logger.info('Keyword analysis completed');

    } catch (error) {
      logger.error('Keyword analysis failed', { error });
    } finally {
      setIsAnalyzing(false);
      await timer();
    }
  }, [currentResumeId, user?.uid, jobInfo.title, analyzeATS]);

  const handleJobUpdate = useCallback(() => {
    setIsJobUpdateModalOpen(true);
  }, []);

  const handleJobUpdateSubmit = useCallback(async (title: string, description: string) => {
    try {
      // Update job info in context
      updateJobInfo({
        title,
        description
      });

      // Trigger analysis with new job info
      await performAnalysis();

      // Call parent callback if provided
      onJobUpdate?.();
    } catch (error) {
      logger.error('Failed to update job description', { error });
    }
  }, [updateJobInfo, performAnalysis, onJobUpdate]);

  const handleRefresh = useCallback(async () => {
    await performAnalysis();
  }, [performAnalysis]);

  const containerClasses = useMemo(() =>
    `bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`.trim(),
    [className]
  );

  // Handle different states
  if (!jobInfo?.title || !jobInfo?.description) {
    return (
      <div className={containerClasses}>
        <div className="p-6">
          <EmptyState onAddJob={handleJobUpdate} />
        </div>
      </div>
    );
  }

  if (isLoading || isAnalyzing) {
    return (
      <div className={containerClasses}>
        <div className="p-6">
          <LoadingState message={isAnalyzing ? "Analyzing keywords..." : "Loading keyword data..."} />
        </div>
      </div>
    );
  }

  if (contextError && !jobInfo.extractedKeywords) {
    return (
      <div className={containerClasses}>
        <div className="p-6">
          <ErrorState
            onRetry={handleRefresh}
            errorMessage={contextError || "Failed to analyze keywords"}
          />
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className={containerClasses}>
      {/* Keywords list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {/* Missing keywords section */}
        {missingCount > 0 && (
          <>
            {displayedKeywords.filter(k => !k.isMatching).length > 1 && (
              <div className="px-6 py-4 text-sm leading-5 text-gray-600 dark:text-gray-400">
                Want to improve your chances of getting this role? Consider adding the following keywords to your resume:
              </div>
            )}
            {displayedKeywords.filter(k => !k.isMatching).map((keyword, index) => (
              <KeywordItem
                key={`missing-${index}`}
                keyword={keyword.keyword}
                isMatching={keyword.isMatching}
              />
            ))}
          </>
        )}
        
        {/* Matching keywords section */}
        {matchedCount > 0 && displayedKeywords.some(k => k.isMatching) && (
          <>
            {displayedKeywords.filter(k => k.isMatching).length > 1 && (
              <div className="px-6 py-4 text-sm leading-5 text-gray-600 dark:text-gray-400">
                Great job! Your resume already includes these important keywords from the job description:
              </div>
            )}
            {displayedKeywords.filter(k => k.isMatching).map((keyword, index) => (
              <KeywordItem
                key={`matching-${index}`}
                keyword={keyword.keyword}
                isMatching={keyword.isMatching}
              />
            ))}
          </>
        )}
        
        {/* Pro keywords (blurred) */}
        {proKeywordsCount > 0 && Array.from({ length: proKeywordsCount }).map((_, index) => (
          <KeywordItem
            key={`pro-${index}`}
            keyword=""
            isMatching={false}
            isPro={true}
          />
        ))}
      </div>

      {/* Show more/less button - only for Pro/Enterprise users */}
      {(userPlan === 'pro' || userPlan === 'enterprise') && allKeywords.length > 15 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {showAll ? 'Show less' : `Show all ${allKeywords.length} keywords`}
          </button>
        </div>
      )}

      {/* Update job description button */}
      <div className="px-6 pb-6 pt-4">
        <button
          onClick={handleJobUpdate}
          className="w-full relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 px-3 py-2.5 h-10 leading-5 rounded-md text-sm"
        >
          Update job description
        </button>
      </div>

      {/* Job Update Modal */}
      <JobUpdateModal
        isOpen={isJobUpdateModalOpen}
        onClose={() => setIsJobUpdateModalOpen(false)}
        onUpdate={handleJobUpdateSubmit}
        currentTitle={jobInfo.title}
        currentDescription={jobInfo.description}
      />
    </div>
  );
};

export default memo(KeywordTargetingPanel);