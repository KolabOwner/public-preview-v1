'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SampleCard from '@/components/features/resume/samples/SampleCard';
import { TemplateClient } from '@/lib/client/services/template/template-client';
import { Industry } from '@/types/template.types';

export interface Sample {
  id: number;
  title: string;
  tag: string;
  resumeContent: string;
  templateType?: 'resume' | 'cover_letter';
  template?: any;
}

// Categories for UI display
type Category = Industry | 'student' | 'medical';

// Map categories to industries (some categories map to existing industries)
const categoryToIndustryMap: Record<Category, Industry> = {
  business: 'business',
  programming: 'programming',
  engineering: 'engineering',
  marketing: 'marketing',
  design: 'design',
  student: 'education', // Map student to education industry
  medical: 'healthcare', // Map medical to healthcare industry
  finance: 'finance',
  education: 'education',
  legal: 'legal',
  other: 'other',
  technology: 'technology',
  healthcare: 'healthcare',
  creative: 'creative',
  hospitality: 'hospitality',
  retail: 'retail',
  manufacturing: 'manufacturing',
  nonprofit: 'nonprofit',
  government: 'government',
};

const CATEGORIES = [
  { key: 'business' as Category, label: 'Business' },
  { key: 'programming' as Category, label: 'Programming' },
  { key: 'engineering' as Category, label: 'Engineering' },
  { key: 'marketing' as Category, label: 'Marketing' },
  { key: 'design' as Category, label: 'Design' },
  { key: 'student' as Category, label: 'Student' },
  { key: 'medical' as Category, label: 'Medical' },
  { key: 'finance' as Category, label: 'Finance' },
  { key: 'education' as Category, label: 'Education' },
  { key: 'legal' as Category, label: 'Legal' },
  { key: 'other' as Category, label: 'Other' },
] as const;

export default function SamplesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get category from URL or default to 'business'
  const categoryFromUrl = searchParams.get('category') as Category | null;
  const [activeCategory, setActiveCategory] = useState<Category>(categoryFromUrl || 'business');
  
  // Cache for loaded samples by category
  const [samplesCache, setSamplesCache] = useState<Record<Category, Sample[]>>({} as Record<Category, Sample[]>);
  const [loadingStates, setLoadingStates] = useState<Record<Category, boolean>>({} as Record<Category, boolean>);
  const [errors, setErrors] = useState<Record<Category, string | null>>({} as Record<Category, string | null>);

  // Update URL when category changes
  const handleCategoryChange = useCallback((category: Category) => {
    setActiveCategory(category);
    // Update URL without causing a page refresh
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`/dashboard/samples?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Load samples for a category
  const loadSamplesForCategory = useCallback(async (category: Category) => {
    // If already cached, don't reload
    if (samplesCache[category]) return;
    
    setLoadingStates(prev => ({ ...prev, [category]: true }));
    setErrors(prev => ({ ...prev, [category]: null }));

    try {
      // Map category to industry for the API call
      const industry = categoryToIndustryMap[category];
      const [resumeTemplates, coverLetterTemplates] = await Promise.all([
        TemplateClient.getSamplesForIndustry(industry, 'resume'),
        TemplateClient.getSamplesForIndustry(industry, 'cover_letter')
      ]);
      
      const resumeSamples = resumeTemplates.map(template => ({
        ...TemplateClient.templateToSample(template),
        templateType: 'resume' as const
      }));
      const coverLetterSamples = coverLetterTemplates.map(template => ({
        ...TemplateClient.templateToSample(template),
        templateType: 'cover_letter' as const
      }));
      
      const allSamples = [...resumeSamples, ...coverLetterSamples];
      setSamplesCache(prev => ({ ...prev, [category]: allSamples }));
    } catch (err) {
      console.error(`Error loading ${category} samples:`, err);
      setErrors(prev => ({ ...prev, [category]: `Failed to load ${category} samples` }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [category]: false }));
    }
  }, [samplesCache]);

  // Load samples when category changes
  useEffect(() => {
    loadSamplesForCategory(activeCategory);
  }, [activeCategory, loadSamplesForCategory]);

  // Preload adjacent categories for better UX
  useEffect(() => {
    const currentIndex = CATEGORIES.findIndex(c => c.key === activeCategory);
    const prevCategory = CATEGORIES[currentIndex - 1];
    const nextCategory = CATEGORIES[currentIndex + 1];
    
    // Preload adjacent categories in the background
    if (prevCategory && !samplesCache[prevCategory.key]) {
      setTimeout(() => loadSamplesForCategory(prevCategory.key), 1000);
    }
    if (nextCategory && !samplesCache[nextCategory.key]) {
      setTimeout(() => loadSamplesForCategory(nextCategory.key), 1000);
    }
  }, [activeCategory, loadSamplesForCategory, samplesCache]);

  const currentSamples = samplesCache[activeCategory] || [];
  const isLoading = loadingStates[activeCategory] || false;
  const error = errors[activeCategory];

  return (
    <div className="flex justify-center px-0 pt-16 lg:pt-0 lg:px-16 bg-background text-foreground min-h-screen">
      <div className="relative flex w-[100vw] flex-col gap-4 md:gap-6 lg:min-h-[calc(100dvh_-_16px)] lg:max-w-[824px] lg:px-6 xl1:max-w-[968px] xl:max-w-[1248px] xl:px-8">
        <main className="w-full sm:h-full lg:h-auto">
          {/* Page Header */}
          <div className="mt-6 flex flex-row items-center justify-between self-stretch">
            <div className="text-3xl font-semibold leading-9 text-foreground">Search Sample Library</div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 flex w-full flex-col items-center gap-6 self-stretch pt-6">
            {/* Search Form */}
            <form className="relative flex w-[100%] flex-row items-center justify-start self-stretch">
              <div className="flex w-full flex-col gap-1">
                <div className="w-[100%] h-10 text-base sm:h-12 flex w-full flex-row items-center self-stretch border-2 rounded transition-all duration-200 border-border px-3 py-1 bg-card gap-1">
                  <i className="fad fa-magnifying-glass !flex h-6 !w-6 justify-center items-center text-muted-foreground" aria-hidden="true"></i>
                  <input
                    autoComplete="off"
                    className="bg-transparent text-card-foreground h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-muted-foreground text-ellipsis focus:outline-none focus:ring-0"
                    type="text"
                    placeholder="Search resume and cover letter samples by role or skill"
                  />
                </div>
              </div>
            </form>

            {/* Mobile Category Dropdown */}
            <div className="block w-full sm:hidden">
              <select
                className="h-10 sm:h-12 pl-4 text-base leading-6 pr-4 py-1 rounded w-full cursor-pointer font-semibold text-card-foreground bg-card border-2 border-border"
                style={{ fontWeight: 600 }}
                value={activeCategory}
                onChange={(e) => handleCategoryChange(e.target.value as Category)}
              >
                {CATEGORIES.map(category => (
                  <option key={category.key} value={category.key}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Desktop Category Tabs */}
            <div className="hidden w-full sm:flex">
              <nav className="flex content-center gap-2 self-stretch flex-wrap min-h-[32px]">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryChange(category.key)}
                    className={`
                      rounded-md flex items-center h-6 px-2 text-xs cursor-pointer 
                      transition-all duration-200 ease-in-out uppercase font-semibold
                      ${activeCategory === category.key
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }
                    `}
                    aria-label={category.label}
                    aria-current={activeCategory === category.key ? 'page' : undefined}
                  >
                    <span className="text-xs font-semibold text-center whitespace-nowrap">
                      {category.label}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex w-full flex-col gap-6">
            {/* Loading State */}
            {isLoading && !currentSamples.length && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading {activeCategory} samples...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center text-destructive py-8">
                {error}
                <button 
                  onClick={() => loadSamplesForCategory(activeCategory)}
                  className="ml-2 text-primary underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Samples Grid */}
            {!isLoading && currentSamples.length > 0 && (
              <div className="flex w-full flex-row flex-wrap gap-4 md:gap-6">
                {currentSamples.map((sample) => (
                  <SampleCard key={sample.id} sample={sample} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && currentSamples.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                No samples found for {activeCategory} category.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}