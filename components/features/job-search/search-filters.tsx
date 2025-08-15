// components/JobSearch/SearchFilters.tsx
import React from 'react';
import { Search, MapPin, Filter, Briefcase } from 'lucide-react';

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  location: string;
  setLocation: (location: string) => void;
  onSearch: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  location,
  setLocation,
  onSearch,
  showFilters,
  setShowFilters
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Job Title Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Briefcase className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Job title, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="
                w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700
                bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm
                text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400
                focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20
                transition-all duration-200 text-base font-medium
              "
            />
          </div>
        </div>

        {/* Location Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <MapPin className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="City, state, remote..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="
                w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700
                bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm
                text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400
                focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20
                transition-all duration-200 text-base font-medium
              "
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="
              px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700
              bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm
              text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700
              transition-all duration-200 font-medium
            "
          >
            <Filter className="h-5 w-5" />
          </button>

          <button
            onClick={onSearch}
            className="
              px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500
              text-slate-900 shadow-sm hover:from-amber-500 hover:to-amber-600
              transition-all duration-200 font-semibold flex items-center gap-2
            "
          >
            <Search className="h-5 w-5" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};