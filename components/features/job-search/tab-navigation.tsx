import React from 'react';
import { JOB_TABS } from "@/components/features/job-search/constants";
import { JobTabId } from "@/types/job-board.types";

interface TabNavigationProps {
  activeTab: JobTabId; // Now properly typed
  onTabChange: (tabId: JobTabId) => void; // Now properly typed
  stats: {
    saved: number;
    applied: number;
    interviewing: number;
    rejected: number;
  };
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  stats
}) => {
  const getTabCount = (tabId: JobTabId): number => {
    const countMap: Record<JobTabId, number> = {
      'ALL_JOBS': 0, // This might be total jobs or you can calculate it
      'SAVED': stats.saved,
      'APPLIED': stats.applied,
      'INTERVIEWING': stats.interviewing,
      'REJECTED': stats.rejected,
    };
    return countMap[tabId] || 0;
  };

  const mainTabs = JOB_TABS.slice(0, 2);
  const statusTabs = JOB_TABS.slice(2);

  return (
    <div className="flex w-full items-center gap-3 justify-start mb-8">
      {/* Main Navigation */}
      <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm p-1 gap-1">
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
              }
            `}
          >
            {tab.label}
            {tab.showCount && (
              <span className={`ml-1 ${activeTab === tab.id ? 'text-slate-700' : 'text-slate-400'}`}>
                ({getTabCount(tab.id)})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Status Navigation */}
      <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm p-1 gap-1">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
              }
            `}
          >
            {tab.label}
            <span className={`ml-1 ${activeTab === tab.id ? 'text-slate-700' : 'text-slate-400'}`}>
              ({getTabCount(tab.id)})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};