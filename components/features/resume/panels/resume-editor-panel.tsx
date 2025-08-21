'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Loader, Check, X, Edit3, ChevronDown, AlertCircle } from 'lucide-react';
import { useJobInfo } from '@/contexts/job-info-context';
import { useAuth } from '@/contexts/firebase-auth-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase-config';

interface ResumeEditorPanelProps {
  className?: string;
  resumeData: Record<string, any>;
  resumeId: string;
  onBulletAdded?: (experienceIndex: number, newBullet: string) => void;
}

interface ExperienceItem {
  index: number;
  company: string;
  position: string;
  id: string;
}

type WorkflowStep = 'processing' | 'review' | 'success' | 'idle';


const LoadingSpinner = memo(() => (
  <div className="flex justify-center items-center">
    <Loader className="w-4 h-4 text-blue-500 animate-spin" />
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

const ExperienceDropdown = memo<{
  experiences: ExperienceItem[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}>(({ experiences, selectedIndex, onSelect, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedExperience = experiences.find(exp => exp.index === selectedIndex);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 pl-4 pr-4 py-1 rounded text-base leading-6 cursor-pointer font-semibold border-2 border-solid flex items-center justify-between ${
          disabled 
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
            : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className="truncate">
          {selectedExperience ? selectedExperience.position : 'Select experience...'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-48 overflow-auto">
          {experiences.map((exp) => (
            <button
              key={exp.index}
              type="button"
              onClick={() => {
                onSelect(exp.index);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left font-semibold hover:bg-blue-50 hover:text-blue-900 transition-colors ${
                selectedIndex === exp.index ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
              }`}
            >
              <div className="capitalize truncate">{exp.position}</div>
              <div className="text-sm text-gray-600 truncate">{exp.company}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

ExperienceDropdown.displayName = 'ExperienceDropdown';

const ResumeEditorPanel: React.FC<ResumeEditorPanelProps> = ({
  className = '',
  resumeData,
  resumeId,
  onBulletAdded
}) => {
  const { jobInfo } = useJobInfo();
  const { user } = useAuth();
  
  // Create unique keys for this resume's keyword progress
  const progressKey = `resume-editor-progress-${resumeId}`;
  const skippedKeywordsKey = `resume-editor-skipped-${resumeId}`;
  
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(progressKey);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  
  const [skippedKeywords, setSkippedKeywords] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(skippedKeywordsKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });
  const [selectedExperienceIndex, setSelectedExperienceIndex] = useState<number | null>(null);
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('idle');
  const [generatedBullet, setGeneratedBullet] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  // Extract experiences from resume data
  const experiences = useMemo((): ExperienceItem[] => {
    const expCount = resumeData?.rms_experience_count || 0;
    const items: ExperienceItem[] = [];
    
    for (let i = 0; i < expCount; i++) {
      const company = resumeData[`rms_experience_${i}_company`] || 'Unknown Company';
      const position = resumeData[`rms_experience_${i}_role`] || 'Unknown Position';
      
      items.push({
        index: i,
        company,
        position,
        id: `exp_${i}`
      });
    }
    
    return items;
  }, [resumeData]);

  // Get missing keywords from job info context
  const missingKeywords = useMemo(() => {
    // First try to get from missingKeywords array directly
    const directMissingKeywords = jobInfo?.missingKeywords || [];
    if (directMissingKeywords.length > 0) {
      return directMissingKeywords.slice(0, 10); // Limit to first 10 missing keywords
    }
    
    // Fallback: compute from extractedKeywords vs matchedKeywords
    const extractedKeywords = jobInfo?.extractedKeywords || [];
    const matchedKeywords = jobInfo?.matchedKeywords || [];
    const matchedSet = new Set(matchedKeywords.map(k => k.keyword?.toLowerCase()));
    
    return extractedKeywords
      .filter(kw => !matchedSet.has(kw.keyword?.toLowerCase()))
      .filter(kw => kw.importance === 'critical' || kw.importance === 'high' || kw.importance === 'required')
      .slice(0, 10); // Limit to first 10 missing keywords
  }, [jobInfo]);

  const currentKeyword = missingKeywords[currentKeywordIndex];

  // Persist keyword progress to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(progressKey, currentKeywordIndex.toString());
    }
  }, [currentKeywordIndex, progressKey]);

  // Persist skipped keywords to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(skippedKeywordsKey, JSON.stringify([...skippedKeywords]));
    }
  }, [skippedKeywords, skippedKeywordsKey]);

  // Reset progress when keywords change (new job targeting)
  useEffect(() => {
    if (missingKeywords.length > 0 && currentKeywordIndex >= missingKeywords.length) {
      setCurrentKeywordIndex(0);
    }
  }, [missingKeywords.length, currentKeywordIndex]);

  // Find next available (non-skipped) keyword
  const findNextAvailableKeyword = useCallback((startIndex: number = currentKeywordIndex): number => {
    for (let i = startIndex; i < missingKeywords.length; i++) {
      const keyword = missingKeywords[i];
      if (keyword && !skippedKeywords.has(keyword.keyword)) {
        return i;
      }
    }
    // If no available keywords found, return -1 to indicate completion
    return -1;
  }, [missingKeywords, skippedKeywords, currentKeywordIndex]);

  // Auto-select first experience if none selected
  useEffect(() => {
    if (experiences.length > 0 && selectedExperienceIndex === null) {
      setSelectedExperienceIndex(0);
    }
  }, [experiences, selectedExperienceIndex]);

  const generateBulletPoint = useCallback(async () => {
    if (!currentKeyword || selectedExperienceIndex === null || !user?.uid) return;

    setIsGenerating(true);
    setWorkflowStep('processing');
    setError('');

    try {
      const selectedExp = experiences.find(exp => exp.index === selectedExperienceIndex);
      if (!selectedExp) throw new Error('Selected experience not found');

      const currentDescription = resumeData[`rms_experience_${selectedExperienceIndex}_description`] || '';
      
      const response = await fetch('/api/ai/generate-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: currentKeyword.keyword,
          company: selectedExp.company,
          position: selectedExp.position,
          currentDescription,
          jobTitle: jobInfo?.title,
          jobDescription: jobInfo?.description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate bullet point');
      }

      const data = await response.json();
      setGeneratedBullet(data.bullet);
      setWorkflowStep('review');
    } catch (err) {
      console.error('Bullet generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate bullet point');
      setWorkflowStep('idle');
    } finally {
      setIsGenerating(false);
    }
  }, [currentKeyword, selectedExperienceIndex, experiences, resumeData, jobInfo, user?.uid]);

  const handleReject = useCallback(() => {
    if (!currentKeyword) return;
    
    // Add current keyword to skipped set
    setSkippedKeywords(prev => new Set([...prev, currentKeyword.keyword]));
    
    // Find next available keyword
    const nextIndex = findNextAvailableKeyword(currentKeywordIndex + 1);
    if (nextIndex !== -1) {
      setCurrentKeywordIndex(nextIndex);
      setWorkflowStep('idle');
      setGeneratedBullet('');
      setError('');
    } else {
      // No more available keywords
      setWorkflowStep('idle');
    }
  }, [currentKeyword, currentKeywordIndex, findNextAvailableKeyword]);

  const handleAccept = useCallback(async () => {
    if (!generatedBullet || selectedExperienceIndex === null) return;

    try {
      setWorkflowStep('success');
      
      // Get current description
      const currentDescription = resumeData[`rms_experience_${selectedExperienceIndex}_description`] || '';
      const bullets = currentDescription.split('\n').filter((b: string) => b.trim());
      
      // Add new bullet
      const newBullets = [...bullets, `•${generatedBullet}`];
      const newDescription = newBullets.join('\n');

      // Update Firestore
      const resumeRef = doc(db, 'resumes', resumeId);
      await updateDoc(resumeRef, {
        [`rms_experience_${selectedExperienceIndex}_description`]: newDescription,
        updatedAt: new Date().toISOString()
      });

      // Notify parent component with typewriter trigger
      onBulletAdded?.(selectedExperienceIndex, generatedBullet);

      // Reset for next keyword after brief delay
      setTimeout(() => {
        const nextIndex = findNextAvailableKeyword(currentKeywordIndex + 1);
        if (nextIndex !== -1) {
          setCurrentKeywordIndex(nextIndex);
          setWorkflowStep('idle');
          setGeneratedBullet('');
        } else {
          setWorkflowStep('idle');
        }
      }, 1500);

    } catch (err) {
      console.error('Failed to accept bullet:', err);
      setError('Failed to save bullet point');
      setWorkflowStep('review');
    }
  }, [generatedBullet, selectedExperienceIndex, resumeData, resumeId, onBulletAdded, currentKeywordIndex, findNextAvailableKeyword]);

  const handleRewrite = useCallback(() => {
    setWorkflowStep('processing');
    generateBulletPoint();
  }, [generateBulletPoint]);

  const handleSkip = useCallback(() => {
    if (!currentKeyword) return;
    
    // Add current keyword to skipped set
    setSkippedKeywords(prev => new Set([...prev, currentKeyword.keyword]));
    
    // Find next available keyword
    const nextIndex = findNextAvailableKeyword(currentKeywordIndex + 1);
    if (nextIndex !== -1) {
      setCurrentKeywordIndex(nextIndex);
      setWorkflowStep('idle');
      setGeneratedBullet('');
      setError('');
    } else {
      // No more available keywords
      setWorkflowStep('idle');
    }
  }, [currentKeyword, currentKeywordIndex, findNextAvailableKeyword]);

  // Auto-start processing when component mounts with first keyword
  useEffect(() => {
    if (currentKeyword && selectedExperienceIndex !== null && workflowStep === 'idle') {
      generateBulletPoint();
    }
  }, [currentKeyword, selectedExperienceIndex, workflowStep, generateBulletPoint]);

  // Check if all keywords are processed (either no keywords available or all are skipped)
  const allKeywordsProcessed = missingKeywords.length === 0 || 
    findNextAvailableKeyword(0) === -1;

  if (allKeywordsProcessed) {
    const processedCount = missingKeywords.length - skippedKeywords.size;
    const skippedCount = skippedKeywords.size;
    
    return (
      <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <Check className="w-6 h-6 text-green-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            All available keywords have been processed.
          </p>
          {missingKeywords.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Completed: {processedCount} • Skipped: {skippedCount}
            </div>
          )}
          {skippedCount > 0 && (
            <button
              onClick={() => {
                setCurrentKeywordIndex(0);
                setSkippedKeywords(new Set());
                setWorkflowStep('idle');
                setGeneratedBullet('');
                setError('');
              }}
              className="mt-3 text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Review skipped keywords
            </button>
          )}
        </div>
      </div>
    );
  }

  const containerClasses = `bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 ${className}`.trim();

  return (
    <div className={containerClasses}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Keyword Targeting
          </h2>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              {currentKeywordIndex + 1} of {missingKeywords.length}
            </div>
            {currentKeywordIndex > 0 && (
              <button
                onClick={() => {
                  setCurrentKeywordIndex(0);
                  setSkippedKeywords(new Set());
                  setWorkflowStep('idle');
                  setGeneratedBullet('');
                  setError('');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
                title="Reset progress and clear skipped keywords"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Current Keyword */}
        <div className="mb-4">
          <div className="inline-block rounded-full bg-teal-100 px-3 py-1 font-semibold capitalize text-gray-900">
            {currentKeyword.keyword}
          </div>
        </div>

        {/* Status Message */}
        {workflowStep === 'processing' && (
          <div className="flex items-center gap-2 text-gray-900 mb-4">
            <LoadingSpinner />
            <span>Analyzing your experience...</span>
          </div>
        )}

        {workflowStep === 'success' && (
          <div className="text-sm text-gray-500 mb-4">
            We&apos;ve added a new bullet point to your experience.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Experience Selector */}
        <div className="mb-4">
          <ExperienceDropdown
            experiences={experiences}
            selectedIndex={selectedExperienceIndex}
            onSelect={setSelectedExperienceIndex}
            disabled={isGenerating}
          />
        </div>



        {/* Action Buttons */}
        <div className="space-y-2">
          {workflowStep === 'review' && (
            <>
              <button
                onClick={handleAccept}
                className="w-full flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-colors duration-200 border-0 bg-blue-600 active:bg-blue-700 focus:bg-blue-500 text-white hover:bg-blue-500 px-3 py-2.5 h-10 leading-5 rounded-md text-sm"
              >
                <Check className="w-4 h-4 mr-2" />
                <span>Accept and next</span>
              </button>
              
              <button
                onClick={handleRewrite}
                className="w-full flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-colors duration-200 border-0 bg-blue-600 active:bg-blue-700 focus:bg-blue-500 text-white hover:bg-blue-500 px-3 py-2.5 h-10 leading-5 rounded-md text-sm"
                style={{
                  backgroundImage: 'linear-gradient(80deg, var(--color-primary-600) 0%, var(--color-primary-600) 10%, #b3241a 50%, #a63cac 70%, var(--color-primary-600) 90%, var(--color-primary-600) 100%)',
                  backgroundPosition: 'left center',
                  backgroundSize: '800%'
                }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                <span>Rewrite bullet</span>
              </button>
              
              <button
                onClick={handleSkip}
                className="w-full flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-colors duration-200 bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-300 px-3 py-2.5 h-10 leading-5 rounded-md text-sm"
              >
                <span>Skip</span>
              </button>
            </>
          )}

          {(workflowStep === 'idle' || workflowStep === 'processing') && (
            <button
              onClick={handleReject}
              disabled={isGenerating}
              className="w-full flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-colors duration-200 bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2.5 h-10 leading-5 rounded-md text-sm"
            >
              <X className="w-4 h-4 mr-2" />
              <span>Reject</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ResumeEditorPanel);