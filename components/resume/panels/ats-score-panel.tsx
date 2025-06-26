'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { BarChart2, TrendingUp, AlertCircle } from 'lucide-react';
import { useJobInfo } from '@/contexts/job-info-context';
import { scoreResume, type ResumeScore } from '@/lib/features/scoring/resume-scorer';
import ScoreModal from '@/components/resume/modals/score-modal';

interface ATSScorePanelProps {
  className?: string;
  resumeData?: any;
  resumeId: string;
}

export default function ATSScorePanel({ className = '', resumeData, resumeId }: ATSScorePanelProps) {
  const { jobInfo } = useJobInfo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null);
  
  // Calculate resume score whenever resumeData or jobInfo changes
  useEffect(() => {
    if (resumeData) {
      const score = scoreResume(resumeData, jobInfo);
      setResumeScore(score);
    }
  }, [resumeData, jobInfo]);
  
  // Get ATS score - use calculated score or job info score
  const atsScore = resumeScore?.totalScore || jobInfo?.atsScore || 0;
  const hasJobInfo = !!jobInfo?.title;
  
  // Calculate score status
  const scoreStatus = useMemo(() => {
    if (!resumeScore) return { label: 'Analyzing...', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' };
    if (atsScore >= 90) return { label: resumeScore.scoreLabel, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-900/20' };
    if (atsScore >= 75) return { label: resumeScore.scoreLabel, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' };
    return { label: resumeScore.scoreLabel, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' };
  }, [atsScore, resumeScore]);

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ATS Score
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hasJobInfo ? 'Resume optimization score' : 'Add a job to see your score'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {atsScore}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
              </div>
              <div className={`text-sm font-medium ${scoreStatus.color}`}>
                {scoreStatus.label}
              </div>
            </div>
            
            {hasJobInfo && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Explore Score
              </button>
            )}
          </div>
        </div>
        
        {hasJobInfo && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  atsScore >= 80 ? 'bg-teal-500' : 
                  atsScore >= 60 ? 'bg-amber-500' : 
                  'bg-red-500'
                }`}
                style={{ width: `${atsScore}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">100</span>
            </div>
          </div>
        )}
        
        {!hasJobInfo && (
          <div className={`mt-4 p-3 rounded-md ${scoreStatus.bgColor} flex items-center gap-2`}>
            <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add a job description below to calculate your ATS score
            </p>
          </div>
        )}
      </div>
      
      <ScoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        score={atsScore}
        jobTitle={jobInfo?.title || ''}
        resumeScore={resumeScore}
        resumeData={resumeData}
      />
    </>
  );
}