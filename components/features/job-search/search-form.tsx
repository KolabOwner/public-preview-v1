import React from 'react';
import { Search, MapPin, Filter, Briefcase } from 'lucide-react';

interface SearchFormProps {
  searchQuery: string;
  location: string;
  showFilters: boolean;
  onSearchQueryChange: (query: string) => void;
  onLocationChange: (location: string) => void;
  onFiltersToggle: () => void;
  onSearch: () => void;
}

export function SearchForm({
  searchQuery,
  location,
  showFilters,
  onSearchQueryChange,
  onLocationChange,
  onFiltersToggle,
  onSearch
}: SearchFormProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <section className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row">

        {/* Job Title Search */}
        <div className="flex-1">
          <div className="group relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-muted-foreground group-focus-within:text-accent" />
            </div>
            <input
              type="text"
              placeholder="Job title"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field pl-10 h-12 text-body-md font-medium"
            />
          </div>
        </div>

        {/* Location Search */}
        <div className="flex-1">
          <div className="group relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-muted-foreground group-focus-within:text-accent" />
            </div>
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field pl-10 h-12 text-body-md font-medium"
            />
          </div>
        </div>

        {/* Filter Button */}
        <button
          onClick={onFiltersToggle}
          className={`btn-secondary h-12 px-6 text-body-sm font-semibold ${
            showFilters ? 'bg-accent/10 text-accent border-accent' : ''
          }`}
        >
          <Filter className="h-4 w-4 mr-2" />
          FILTER
        </button>

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="btn-primary h-12 px-6 text-body-sm font-semibold"
        >
          <Search className="h-4 w-4 mr-2" />
          SEARCH
        </button>
      </div>
    </section>
  );
}