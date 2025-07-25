'use client';

import { useViewControls, type ViewMode, type SortBy } from '@/lib/client/hooks/ui/use-view-controls';
import { useEffect } from 'react';

interface ViewControlsProps {
  initialSortBy?: SortBy;
  initialViewMode?: ViewMode;
  onStateChange?: (state: { sortBy: SortBy; viewMode: ViewMode }) => void;
}

export default function ViewControls({ 
  initialSortBy = 'created', 
  initialViewMode = 'grid',
  onStateChange 
}: ViewControlsProps) {
  const { sortBy, viewMode, toggleSortBy, handleViewModeChange } = useViewControls(initialViewMode, initialSortBy);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.({ sortBy, viewMode });
  }, [sortBy, viewMode, onStateChange]);
  return (
    <div className="py-4 flex items-center justify-end gap-4">
      <div className="relative flex flex-row items-center justify-start">
        <button
          type="button"
          className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition text-gray-900 dark:text-gray-100 bg-transparent hover:bg-button-text-hover dark:hover:bg-gray-700 px-2 py-1 min-h-8 leading-4 rounded-md text-xs border-none"
          onClick={toggleSortBy}
        >
          <span className="px-1">{sortBy === 'created' ? 'Created' : 'Updated'}</span>
          <i className="fad fa-angle-down !flex items-center justify-center text-sm w-[18px] h-[18px] mr-1" aria-hidden="true"></i>
        </button>
      </div>

      <div className="group relative flex h-6 w-6 items-center justify-center">
        <div
          className={`h-6 w-6 cursor-pointer group relative flex items-center justify-center ${viewMode === 'grid' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}
          onClick={() => handleViewModeChange('grid')}
        >
          <i className="!flex items-center justify-center fad fa-grid-2 text-xl w-6 h-6 hover:text-blue-500" aria-hidden="true"></i>
        </div>
      </div>

      <div className="group relative flex h-6 w-6 items-center justify-center">
        <div
          className={`h-6 w-6 cursor-pointer group relative flex items-center justify-center ${viewMode === 'list' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}
          onClick={() => handleViewModeChange('list')}
        >
          <i className="!flex items-center justify-center fad fa-list text-xl w-6 h-6 hover:text-blue-500" aria-hidden="true"></i>
        </div>
      </div>
    </div>
  );
}
