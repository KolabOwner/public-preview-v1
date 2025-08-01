'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  medical: 'healthcare', // Map medical to medical industry
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

interface SamplesPageProps {
  defaultCategory?: Category;
}

export default function SamplesPage({ defaultCategory }: SamplesPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get category from URL, props, or default to 'business'
  const categoryFromUrl = searchParams.get('category') as Category | null;
  const [activeCategory, setActiveCategory] = useState<Category>(
    categoryFromUrl || defaultCategory || 'business'
  );
  
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

  // Set initial category from props if provided and no URL param
  useEffect(() => {
    if (defaultCategory && !categoryFromUrl && activeCategory !== defaultCategory) {
      setActiveCategory(defaultCategory);
    }
  }, [defaultCategory, categoryFromUrl, activeCategory]);

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
    <div className="flex justify-center px-0 pt-16 lg:pt-0 lg:px-16 min-h-screen">
      <div className="relative w-full max-w-full flex flex-col justify-start gap-4 px-4 md:px-6 lg:max-w-[824px] lg:px-6 xl1:max-w-[968px] xl:max-w-[1248px] xl:px-8">
        <main className="w-full sm:h-full lg:h-auto">
          {/* Page Header */}
          <div className="mt-6 flex flex-row items-center justify-between self-stretch">
            <div className="text-3xl font-bold leading-9 text-slate-800 dark:text-slate-100">Search Sample Library</div>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 flex w-full flex-col items-center gap-6 self-stretch pt-6">
            {/* Search Form */}
            <form className="relative flex w-[100%] flex-row items-center justify-start self-stretch">
              <div className="flex w-full flex-col gap-1">
                <div className="w-[100%] h-10 text-base sm:h-12 flex w-full flex-row items-center self-stretch border-2 rounded-xl transition-all duration-200 border-slate-200 dark:border-navy-700 px-3 py-1 bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm shadow-lg gap-1 focus-within:border-amber-400 dark:focus-within:border-amber-500">
                  <i className="fad fa-magnifying-glass !flex h-6 !w-6 justify-center items-center text-slate-500 dark:text-slate-400" aria-hidden="true"></i>
                  <input
                    autoComplete="off"
                    className="bg-transparent text-slate-800 dark:text-slate-200 h-6 w-full !border-0 px-1 text-base font-semibold leading-6 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-ellipsis focus:outline-none focus:ring-0"
                    type="text"
                    placeholder="Search resume and cover letter samples by role or skill"
                  />
                </div>
              </div>
            </form>

            {/* Mobile Category Dropdown */}
            <div className="block w-full sm:hidden">
              <select
                className="h-10 sm:h-12 pl-4 text-base leading-6 pr-4 py-1 rounded-xl w-full cursor-pointer font-semibold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-navy-700 shadow-lg"
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
                      rounded-xl flex items-center h-8 px-4 text-xs cursor-pointer 
                      transition-all duration-300 ease-in-out uppercase font-bold shadow-md
                      ${activeCategory === category.key
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-800 shadow-amber-500/30'
                        : 'bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-700'
                      }
                    `}
                    aria-label={category.label}
                    aria-current={activeCategory === category.key ? 'page' : undefined}
                  >
                    <span className="text-xs font-bold text-center whitespace-nowrap tracking-wide">
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
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5b7cfd]"></div>
                  <div className="absolute inset-0 rounded-full bg-[#5b7cfd]/20 blur-xl animate-pulse"></div>
                </div>
                <span className="ml-4 text-slate-600 dark:text-slate-400 font-medium">Loading {activeCategory} samples...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                <div className="text-red-600 dark:text-red-400 font-medium">{error}</div>
                <button 
                  onClick={() => loadSamplesForCategory(activeCategory)}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Samples Grid */}
            {!isLoading && currentSamples.length > 0 && (
              <div className="flex w-full flex-col gap-16">
                {/* Resume Samples Section */}
                {currentSamples.some(sample => sample.templateType === 'resume') && (
                  <div className="pt-4">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        <i className="fad fa-file-alt mr-3 text-blue-600" aria-hidden="true"></i>
                        Resume Templates
                      </h2>
                      <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-32"></div>
                    </div>
                    <div className="flex w-full flex-row flex-wrap gap-4 md:gap-6">
                      {currentSamples
                        .filter(sample => sample.templateType === 'resume')
                        .map((sample) => (
                          <SampleCard key={sample.id} sample={sample} />
                        ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter Samples Section */}
                {currentSamples.some(sample => sample.templateType === 'cover_letter') && (
                  <div className="pt-8 pb-4">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        <i className="fad fa-envelope mr-3 text-amber-600" aria-hidden="true"></i>
                        Cover Letter Templates
                      </h2>
                      <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-32"></div>
                    </div>
                    <div className="flex w-full flex-row flex-wrap gap-4 md:gap-6">
                      {currentSamples
                        .filter(sample => sample.templateType === 'cover_letter')
                        .map((sample) => (
                          <SampleCard key={sample.id} sample={sample} />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && currentSamples.length === 0 && (
              <div className="bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-navy-700 p-12 text-center shadow-2xl shadow-slate-300/30 dark:shadow-navy-900/50">
                <i className="fad fa-search text-4xl text-slate-400 dark:text-slate-500 mb-4" aria-hidden="true"></i>
                <h4 className="font-bold text-xl mb-2 text-slate-800 dark:text-slate-100">No samples found</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  No samples found for the <span className="font-semibold text-amber-600 dark:text-amber-400">{activeCategory}</span> category.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}