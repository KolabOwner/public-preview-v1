'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Lock, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { type ResumeScore, type AuditResult } from '@/lib/features/scoring/resume-scorer';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  jobTitle: string;
  resumeScore: ResumeScore | null;
  resumeData?: any;
}

// Gauge Chart Component
const GaugeChart = ({ score, animated = true }: { score: number; animated?: boolean }) => {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayScore(score), 100);
      return () => clearTimeout(timer);
    }
  }, [score, animated]);
  
  const rotation = (displayScore / 100) * 180;
  const scoreStatus = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : 'Needs Work';
  
  return (
    <div className="h-[138px] w-[236px]">
      <div className="relative" style={{ width: '236px', height: '118px' }}>
        <div className="overflow-hidden" style={{ width: '236px', height: '118px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="236" height="236" fill="none">
            <clipPath id="gauge_svg__b">
              <path 
                fill="url(#gauge_svg__a)" 
                d="M229.6 118c2.23 0 3.346 0 4.224-.466a4.13 4.13 0 0 0 1.757-1.855c.418-.903.36-1.96.245-4.076a118 118 0 0 0-235.652 0c-.115 2.116-.173 3.174.245 4.076a4.13 4.13 0 0 0 1.757 1.855C3.054 118 4.17 118 6.4 118h10.8c2.242 0 3.362 0 4.188-.4a3.83 3.83 0 0 0 1.73-1.617c.456-.797.537-1.991.699-4.378a94.4 94.4 0 0 1 27.432-60.356 94.4 94.4 0 0 1 160.934 60.356c.162 2.387.243 3.581.698 4.378a3.83 3.83 0 0 0 1.731 1.617c.826.4 1.946.4 4.188.4z"
              />
            </clipPath>
            <defs>
              <radialGradient id="gauge_svg__a" cx="0" cy="0" r="1" gradientTransform="rotate(180 59 59)scale(118)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#14B8A6" />
                <stop offset="0.15" stopColor="#14B8A6" />
                <stop offset="0.15" stopColor="#F59E0B" />
                <stop offset="0.35" stopColor="#F59E0B" />
                <stop offset="0.35" stopColor="#EF4444" />
                <stop offset="0.5" stopColor="#EF4444" />
              </radialGradient>
            </defs>
            <foreignObject width="100%" height="100%" x="0" y="0" clipPath="url(#gauge_svg__b)">
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: 'conic-gradient(from 270deg, rgb(239, 68, 68) 0deg, rgb(239, 68, 68) 54deg, rgb(245, 158, 11) 54deg, rgb(245, 158, 11) 108deg, rgb(20, 184, 166) 108deg, rgb(20, 184, 166) 180deg)' 
                }} 
              />
            </foreignObject>
          </svg>
        </div>
        <div 
          className="absolute top-0 transition-transform duration-[1200ms] ease-in-out" 
          style={{ 
            transform: `rotate(${rotation}deg)`,
            width: '236px', 
            height: '236px' 
          }}
        >
          <div 
            className="absolute z-10 rounded-full border border-solid border-gray-900 bg-white dark:bg-gray-800 shadow-md" 
            style={{ width: '26px', height: '26px', top: 'calc(50% - 26px)' }}
          />
        </div>
        <div className="absolute -bottom-5 z-20 w-full">
          <h2 className="w-full text-center text-5xl font-semibold leading-none text-gray-900 dark:text-white">
            {displayScore}
          </h2>
          <p className="w-full text-center text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">
            {scoreStatus}
          </p>
          <div className="bottom-0 flex w-full">
            <span className="flex-1 text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">0</span>
            <span className="flex-1 text-right text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bar Chart Component
const ComparisonBarChart = ({ userScore }: { userScore: number }) => {
  const [animatedHeights, setAnimatedHeights] = useState<number[]>([]);
  
  // Generate distribution data based on typical resume scores
  const distribution = useMemo(() => {
    const data = new Array(50).fill(0).map((_, i) => {
      const x = (i / 50) * 100;
      // Normal distribution curve centered around 65
      const mean = 65;
      const stdDev = 15;
      const height = Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2)) * 100;
      return Math.max(5, height);
    });
    return data;
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedHeights(distribution);
    }, 100);
    return () => clearTimeout(timer);
  }, [distribution]);
  
  const userIndex = Math.floor((userScore / 100) * 50);
  
  return (
    <div className="flex h-[138px] w-full flex-col gap-4">
      <div className="relative flex h-full w-full flex-col">
        <div className="flex h-full w-full flex-row gap-0.5 overflow-y-hidden">
          {distribution.map((height, index) => {
            const isUserBar = index === userIndex;
            const animatedHeight = animatedHeights[index] || 5;
            
            return (
              <div 
                key={index}
                className={`flex h-full flex-1 flex-col-reverse rounded-t-2xl ${
                  isUserBar ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {isUserBar && (
                  <div className="absolute bottom-0 top-0 w-full rounded-t-2xl opacity-40 bg-teal-500" />
                )}
                <div 
                  className={`w-full rounded-t-2xl ${
                    isUserBar ? 'bg-teal-500 cursor-pointer' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{ 
                    height: `${animatedHeight}%`,
                    transform: 'translateY(0px)',
                    transition: 'transform 1.2s ease-in-out'
                  }}
                />
              </div>
            );
          })}
        </div>
        <ul className="flex flex-row">
          <li className="text-left text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">0</li>
          <div className="flex w-[82%] flex-row">
            <li className="flex-1 text-right text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">30</li>
            <li className="flex-1 text-right text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">60</li>
            <li className="flex-1 text-right text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">90</li>
          </div>
          <li className="w-[18%] text-right text-sm font-normal leading-5 text-gray-500 dark:text-gray-400">100</li>
        </ul>
      </div>
    </div>
  );
};

// Category Score Circle
const CategoryScoreCircle = ({ score, isActive }: { score: number; isActive: boolean }) => {
  const circumference = 2 * Math.PI * 14.5;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'stroke-teal-500' : score >= 60 ? 'stroke-amber-500' : 'stroke-red-500';
  
  return (
    <div className="h-8 w-8">
      <div className="relative flex items-center justify-center" style={{ width: '32px', height: '32px' }}>
        <svg className="transform -rotate-90" width="32" height="32">
          <circle 
            cx="16" 
            cy="16" 
            r="14.5" 
            className="fill-none stroke-gray-200 dark:stroke-gray-700" 
            strokeWidth="3"
          />
          <circle 
            cx="16" 
            cy="16" 
            r="14.5" 
            className={`fill-none ${color}`}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
          />
        </svg>
        <span className="text-gray-900 dark:text-white absolute text-xs leading-4 font-bold">
          {score}
        </span>
      </div>
    </div>
  );
};

// Audit Item Component
const AuditItem = ({ audit }: { audit: AuditResult }) => {
  if (audit.isPro) {
    return (
      <div className="flex-start flex cursor-pointer items-baseline gap-x-4 py-4">
        <Lock className="w-4 h-4 text-gray-900 dark:text-gray-100" />
        <h6 className="m-0 flex items-baseline text-base font-normal leading-6 text-gray-900 dark:text-white">
          {audit.title} 
          <span className="px-1 text-xs font-bold text-gray-500">PRO</span>
        </h6>
      </div>
    );
  }
  
  return (
    <div className="flex flex-row items-start gap-4 py-4 pr-4">
      <div className="w-4">
        {audit.severity === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
        {audit.severity === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
        {audit.severity === 'info' && audit.passed && <CheckCircle className="w-4 h-4 text-green-500" />}
      </div>
      <div className="flex-1">
        <h6 className="relative w-full pr-4 text-base font-normal leading-6 text-gray-900 dark:text-white">
          {audit.title}
        </h6>
        {audit.description && (
          <p className="text-sm font-normal leading-5 text-gray-900 dark:text-gray-300 mt-1">
            {audit.description}
          </p>
        )}
        {audit.recommendation && (
          <p className="text-sm font-normal leading-5 text-blue-600 dark:text-blue-400 mt-1">
            {audit.recommendation}
          </p>
        )}
        {audit.items && audit.items.length > 0 && (
          <div className="flex flex-row flex-wrap gap-x-3 mt-2">
            {audit.items.map((item, index) => (
              <div key={index} className="inline-block text-base font-semibold leading-6 text-blue-600 dark:text-blue-400">
                {item}
                {index < audit.items.length - 1 && <span className="ml-3">•</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function ScoreModal({ 
  isOpen, 
  onClose, 
  score, 
  jobTitle, 
  resumeScore,
  resumeData 
}: ScoreModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  
  if (!isOpen || !resumeScore) return null;
  
  const tabs = [
    { name: 'Content', score: resumeScore.breakdown.content, category: 'content' },
    { name: 'Format', score: resumeScore.breakdown.format, category: 'format' },
    { name: 'Optimization', score: resumeScore.breakdown.optimization, category: 'optimization' },
    { name: 'Best Practices', score: resumeScore.breakdown.bestPractices, category: 'bestPractices' },
    { name: 'Application Ready', score: resumeScore.breakdown.applicationReady, category: 'applicationReady' }
  ];
  
  // Get audits for active tab
  const activeCategory = resumeScore.categories.find(cat => cat.category === tabs[activeTab].category);
  const activeAudits = activeCategory?.audits || [];
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <article className="relative">
              <button
                onClick={onClose}
                className="absolute -right-2 -top-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Summary Section */}
              <section className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:gap-6">
                <div className="md:w-6/12">
                  <header className="mb-2 px-1">
                    <h4 className="mb-1 text-2xl font-semibold leading-8 text-gray-900 dark:text-white">
                      Resume Score
                    </h4>
                    <div className="w-full">
                      <p className="text-base font-normal leading-6 text-gray-600 dark:text-gray-400">
                        {jobTitle || 'Overall Resume Analysis'}
                      </p>
                    </div>
                  </header>
                  <div className="flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
                    <GaugeChart score={score} />
                  </div>
                </div>
                
                <div className="md:w-6/12">
                  <header className="mb-2 px-1">
                    <h4 className="mb-1 text-2xl font-semibold leading-8 text-gray-900 dark:text-white">
                      How You Compare
                    </h4>
                    <p className="text-base font-normal leading-6 text-gray-900 dark:text-white">
                      See how your resume compares to others.
                    </p>
                  </header>
                  <div className="flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
                    <ComparisonBarChart userScore={score} />
                  </div>
                </div>
              </section>
              
              {/* Improvements Section */}
              <section>
                <header className="mb-2">
                  <h4 className="mb-1 text-2xl font-semibold leading-8 text-gray-900 dark:text-white">
                    Improvements
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {resumeScore.summary}
                  </p>
                </header>
                
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 pb-2 md:px-6">
                  {/* Tabs */}
                  <div className="flex flex-row gap-2 overflow-y-auto sm:gap-0 sm:overflow-y-hidden" role="tablist">
                    {tabs.map((tab, index) => (
                      <div
                        key={index}
                        className={`relative flex-1 cursor-pointer rounded-b-md px-1 pb-2 pt-3 ${
                          activeTab === index 
                            ? '' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setActiveTab(index)}
                        role="tab"
                      >
                        {activeTab === index && (
                          <div className="absolute left-0 top-0 w-full rounded-b-[4px] border-b-[6px] border-b-blue-600" />
                        )}
                        <div className={`mb-2 overflow-hidden text-ellipsis whitespace-nowrap text-center text-base font-normal leading-6 text-gray-900 dark:text-white ${
                          activeTab === index ? 'font-semibold' : ''
                        }`}>
                          {tab.name}
                        </div>
                        <div className="flex items-center justify-center">
                          <CategoryScoreCircle score={tab.score} isActive={activeTab === index} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Tab Content */}
                  <div className="mt-2">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {activeAudits.length > 0 ? (
                        activeAudits.map((audit) => (
                          <li key={audit.id} className={audit.isPro ? '' : 'last:border-0'}>
                            <AuditItem audit={audit} />
                          </li>
                        ))
                      ) : (
                        <li className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No issues found in this category
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreModal;