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

// Enhanced Gauge component with much thicker, more prominent design
const GaugeChart = ({ score, size = 236 }: { score: number; size?: number }) => {
  const radius = size / 2;
  const strokeWidth = 20; // Much thicker stroke for visual impact
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * Math.PI; // Half circle

  // Calculate rotation angle for needle (180 degrees for half circle, map score 0-100 to 0-180)
  const rotation = (score / 100) * 180;

  // Calculate stroke dash offset for the progress arc
  const progressOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
      {/* Background gauge container */}
      <div className="overflow-hidden" style={{ width: size, height: size / 2 }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute top-0 left-0"
        >
          <defs>
            {/* Keep original gradient colors */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" /> {/* Red */}
              <stop offset="35%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F59E0B" /> {/* Amber */}
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#14B8A6" /> {/* Teal */}
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>

            {/* Subtle shadow for depth */}
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15"/>
            </filter>
          </defs>

          {/* Background track - much thicker */}
          <path
            d={`M ${strokeWidth} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${size - strokeWidth} ${radius}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="dark:stroke-gray-700"
            opacity="0.4"
          />

          {/* Active progress arc - much thicker */}
          <path
            d={`M ${strokeWidth} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${size - strokeWidth} ${radius}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            filter="url(#gaugeShadow)"
            className="transition-all duration-1200 ease-out"
          />
        </svg>
      </div>

      {/* Needle/Pointer */}
      <div
        className="absolute transition-transform duration-1200 ease-in-out z-10"
        style={{
          transformOrigin: `${radius}px ${radius}px`,
          transform: `rotate(${rotation - 90}deg)`,
          width: size,
          height: size,
          top: 0,
          left: 0
        }}
      >
        {/* Enhanced needle line - shortened to avoid text overlap */}
        <div
          className="absolute bg-gray-900 dark:bg-gray-100 rounded-full shadow-md"
          style={{
            width: 4,
            height: radius - 50, // Shortened from radius - 35 to radius - 50
            top: 35,
            left: radius - 2,
            transformOrigin: '50% 100%'
          }}
        />
      </div>

      {/* Center dot */}
      <div
        className="absolute z-10 rounded-full border-3 border-gray-900 dark:border-gray-100 bg-white dark:bg-gray-800 shadow-lg"
        style={{
          width: 20,
          height: 20,
          top: radius - 10,
          left: radius - 10
        }}
      />

      {/* Score display - positioned above needle with higher z-index */}
      <div className="absolute bottom-0 w-full text-center z-20">
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{score}</div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          {score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Needs improvement' : 'Poor'}
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
      <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 w-full h-full flex justify-center items-center flex-col gap-4 p-6 ${className}`}>
        <div className="flex flex-col gap-4 justify-center items-center">
          <div className="h-[138px] w-[236px]">
            <GaugeChart score={atsScore} />
          </div>
        </div>

        <button
          onClick={() => {
            console.log('ATS Score button clicked!');
            setIsModalOpen(true);
          }}
          className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 px-3 py-2.5 h-10 leading-5 rounded-md text-sm w-full cursor-pointer z-50"
          style={{ pointerEvents: 'auto' }}
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