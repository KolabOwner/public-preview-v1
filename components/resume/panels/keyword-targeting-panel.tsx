// src/components/resume/panels/KeywordTargetingPanel.tsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';


import { Check, RefreshCw, AlertCircle, Loader, Target } from 'lucide-react';
import {useKeywordAnalysis} from "@/hooks/use-keyword-analysis";
import {useJobInfo} from "@/contexts/job-info-context";
import {useResumeData} from "@/contexts/resume-data-context";
import { ProcessedResumeData } from '@/src/types';
import { useAuth } from '@/contexts/auth-context';

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

// Helper function to generate extracted text from processed resume data
const generateExtractedTextFromProcessed = (data: ProcessedResumeData): string => {
  const sections: string[] = [];
  
  // Contact info
  if (data.contact) {
    sections.push(Object.values(data.contact).filter(Boolean).join(' '));
  }
  
  // Summary
  if (data.summary) {
    sections.push(data.summary);
  }
  
  // Experience
  if (data.experience?.length > 0) {
    data.experience.forEach(exp => {
      sections.push([exp.position, exp.company, exp.location, exp.description].filter(Boolean).join(' '));
    });
  }
  
  // Education
  if (data.education?.length > 0) {
    data.education.forEach(edu => {
      sections.push([edu.institution, edu.qualification, edu.fieldOfStudy, edu.location].filter(Boolean).join(' '));
    });
  }
  
  // Skills
  if (data.skills?.length > 0) {
    data.skills.forEach(skill => {
      sections.push([skill.category, skill.keywords].filter(Boolean).join(' '));
    });
  }
  
  // Projects
  if (data.projects?.length > 0) {
    data.projects.forEach(proj => {
      sections.push([proj.name || proj.title, proj.description].filter(Boolean).join(' '));
    });
  }
  
  // Involvement
  if (data.involvement?.length > 0) {
    data.involvement.forEach(inv => {
      sections.push([inv.organization, inv.role, inv.description].filter(Boolean).join(' '));
    });
  }
  
  return sections.join(' ').trim();
};

const KeywordTargetingPanel: React.FC<KeywordTargetingPanelProps> = ({
  className = '',
  onJobUpdate
}) => {
  const { resumeData: contextResumeData } = useResumeData();
  const { jobInfo, currentResumeId } = useJobInfo();
  const { user } = useAuth();
  const [showAllMissing, setShowAllMissing] = useState(false);
  const [keywordsSaved, setKeywordsSaved] = useState(false);

  // Use resume ID from context, fallback to localStorage
  const documentId = currentResumeId || localStorage.getItem('current_document_id');
  const userId = user?.uid || localStorage.getItem('current_user_id');

  // Create a resume data object with the required fields for keyword analysis
  const resumeData = useMemo(() => {
    if (!contextResumeData) return null;
    
    console.log('KeywordTargetingPanel - contextResumeData:', contextResumeData);
    
    // Check if we already have extracted_text
    if (contextResumeData.extracted_text) {
      return {
        ...contextResumeData,
        document_id: documentId,
        user_id: userId
      };
    }
    
    // Otherwise generate it from processedData
    const { processedData } = contextResumeData;
    const extractedText = processedData ? generateExtractedTextFromProcessed(processedData) : '';
    
    return {
      ...contextResumeData,
      extracted_text: extractedText,
      document_id: documentId,
      user_id: userId
    };
  }, [contextResumeData, documentId, userId]);

  const { analysis, loading, error, isCached, refetch } = useKeywordAnalysis({
    jobInfo,
    resumeData
  });

  // Save keywords to job_info when analysis is successful
  useEffect(() => {
    const saveKeywords = async () => {
      if (analysis?.matching_keywords && documentId && user && !keywordsSaved && jobInfo?.title) {
        try {
          const allKeywords = analysis.matching_keywords.map(k => k.keyword);
          
          // Add missing keywords with lower priority
          if (analysis.missing_keywords && analysis.missing_keywords.length > 0) {
            const topMissingKeywords = analysis.missing_keywords
              .slice(0, 5)
              .map(k => k.keyword);
            allKeywords.push(...topMissingKeywords);
          }
          
          // Get user token
          const token = await user.getIdToken();
          
          // Update keywords in Firestore
          const response = await fetch('/api/resume/update-keywords', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              resumeId: documentId,
              keywords: allKeywords
            })
          });
          
          if (response.ok) {
            setKeywordsSaved(true);
            console.log('Keywords saved to job_info:', allKeywords);
          }
        } catch (error) {
          console.error('Error saving keywords:', error);
        }
      }
    };
    
    saveKeywords();
  }, [analysis, documentId, user, keywordsSaved, jobInfo?.title]);

  const handleJobUpdate = useCallback(() => {
    onJobUpdate?.();
    setKeywordsSaved(false); // Reset to allow saving new keywords
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

  // Log the current state for debugging
  useEffect(() => {
    console.log('KeywordTargetingPanel state:', {
      hasJobInfo: !!(jobInfo?.title && jobInfo?.description),
      jobInfo,
      hasResumeData: !!resumeData,
      hasExtractedText: !!resumeData?.extracted_text,
      extractedTextLength: resumeData?.extracted_text?.length || 0,
      documentId,
      userId
    });
  }, [jobInfo, resumeData, documentId, userId]);

  // Handle different states
  if (!jobInfo?.title || !jobInfo?.description) {
    console.log('KeywordTargetingPanel - No job info found:', { 
      hasTitle: !!jobInfo?.title, 
      hasDescription: !!jobInfo?.description,
      jobInfo,
      jobInfoTitle: jobInfo?.title,
      jobInfoDescription: jobInfo?.description,
      currentResumeId: documentId
    });
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