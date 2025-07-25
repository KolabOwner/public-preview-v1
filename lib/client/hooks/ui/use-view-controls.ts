import { useState, useCallback } from 'react';

export type ViewMode = 'grid' | 'list';
export type SortBy = 'created' | 'updated';

export function useViewControls(initialViewMode: ViewMode = 'grid', initialSortBy: SortBy = 'created') {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);

  const toggleSortBy = useCallback(() => {
    setSortBy(current => current === 'created' ? 'updated' : 'created');
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  return {
    viewMode,
    sortBy,
    toggleSortBy,
    handleViewModeChange,
    setViewMode,
    setSortBy
  };
}