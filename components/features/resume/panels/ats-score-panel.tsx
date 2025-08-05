'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useJobInfo } from '@/contexts/job-info-context';
import { scoreResume, type ResumeScore } from '@/lib/server/services/resume/scorer';
import ScoreModal from '@/components/features/resume/modals/score-modal';

interface ATSScorePanelProps {
  className?: string;
  resumeData?: any;
  resumeId: string;
}

// Gauge component for circular progress indicator
const GaugeChart = ({ score, size = 236 }: { score: number; size?: number }) => {
  const radius = size / 2;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * Math.PI; // Half circle
  const strokeDasharray = `${circumference} ${circumference}`;
  
  // Calculate rotation angle (180 degrees for half circle, map score 0-100 to 0-180)
  const rotation = (score / 100) * 180;
  
  return (
    <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
      {/* Background gauge */}
      <div className="overflow-hidden" style={{ width: size, height: size / 2 }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="absolute top-0 left-0"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" /> {/* Red */}
              <stop offset="35%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F59E0B" /> {/* Amber */}
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#14B8A6" /> {/* Teal */}
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
          
          {/* Gauge background arc */}
          <path
            d={`M ${strokeWidth * 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${size - strokeWidth * 2} ${radius}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Gauge background (inactive) */}
          <path
            d={`M ${strokeWidth * 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${size - strokeWidth * 2} ${radius}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth - 2}
            strokeLinecap="round"
            className="dark:stroke-gray-700"
          />
        </svg>
      </div>
      
      {/* Needle/Pointer */}
      <div 
        className="absolute transition-transform duration-1200 ease-in-out"
        style={{ 
          transformOrigin: `${radius}px ${radius}px`,
          transform: `rotate(${rotation - 90}deg)`,
          width: size,
          height: size,
          top: 0,
          left: 0
        }}
      >
        {/* Needle line */}
        <div 
          className="absolute bg-gray-900 dark:bg-gray-100 rounded-full"
          style={{
            width: 3,
            height: radius - 30,
            top: 30,
            left: radius - 1.5,
            transformOrigin: '50% 100%'
          }}
        />
      </div>
      
      {/* Center dot (outside rotation container) */}
      <div 
        className="absolute z-10 rounded-full border-2 border-gray-900 dark:border-gray-100 bg-white dark:bg-gray-800 shadow-md"
        style={{
          width: 16,
          height: 16,
          top: radius - 8,
          left: radius - 8
        }}
      />
      
      {/* Score display */}
      <div className="absolute bottom-0 w-full text-center">
        <div className="text-4xl font-bold text-gray-900 dark:text-white">{score}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Needs improvement' : 'Poor'}
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};

export default function ATSScorePanel({ className = '', resumeData }: ATSScorePanelProps) {
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

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full h-full flex justify-center items-center flex-col gap-4 p-6 ${className}`}>
        <div className="flex flex-col gap-4 justify-center items-center">
          <div className="h-[138px] w-[236px]">
            <GaugeChart score={atsScore} />
          </div>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 px-3 py-2.5 h-10 leading-5 rounded-md text-sm w-full"
        >
          <Sparkles className="w-5 h-5 mr-2 text-corporate-amber-600 dark:text-corporate-amber-400" />
          <span className="px-1">Explore My ATS Score</span>
        </button>
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