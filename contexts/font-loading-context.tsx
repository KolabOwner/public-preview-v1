'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface FontLoadingState {
  fontsLoaded: boolean;
  loadingProgress: number;
  error: string | null;
}

interface FontLoadingContextValue extends FontLoadingState {
  reloadFonts: () => Promise<void>;
  preloadFont: (family: string, weight?: string) => Promise<void>;
}

const FontLoadingContext = createContext<FontLoadingContextValue | null>(null);

export function useFontLoading() {
  const context = useContext(FontLoadingContext);
  if (!context) {
    throw new Error('useFontLoading must be used within FontLoadingProvider');
  }
  return context;
}

interface FontLoadingProviderProps {
  children: React.ReactNode;
  fonts?: Array<{
    family: string;
    weights?: string[];
  }>;
}

const DEFAULT_FONTS = [
  { family: 'Inter', weights: ['400', '500', '600', '700'] },
  { family: 'Source Sans 3', weights: ['400', '600', '700'] },
  { family: 'Merriweather', weights: ['300', '400', '700'] }
];

export function FontLoadingProvider({ 
  children, 
  fonts = DEFAULT_FONTS 
}: FontLoadingProviderProps) {
  const [state, setState] = useState<FontLoadingState>({
    fontsLoaded: false,
    loadingProgress: 0,
    error: null
  });

  // Check if fonts are already cached
  const checkFontCache = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const cacheKey = 'fonts-loaded-v1';
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      const cacheData = JSON.parse(cached);
      const cacheAge = Date.now() - cacheData.timestamp;
      const maxAge = 1000 * 60 * 60; // 1 hour
      
      if (cacheAge < maxAge) {
        return true;
      }
    }
    
    return false;
  }, []);

  // Set font cache
  const setFontCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const cacheKey = 'fonts-loaded-v1';
    sessionStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      fonts: fonts.map(f => f.family)
    }));
  }, [fonts]);

  // Preload a specific font
  const preloadFont = useCallback(async (family: string, weight: string = '400') => {
    if (typeof document === 'undefined' || !('fonts' in document)) return;
    
    try {
      await document.fonts.load(`${weight} 1em "${family}"`);
    } catch (error) {
      console.warn(`Failed to preload font ${family} ${weight}:`, error);
    }
  }, []);

  // Load all fonts
  const loadFonts = useCallback(async () => {
    if (typeof document === 'undefined' || !('fonts' in document)) {
      setState(prev => ({ ...prev, fontsLoaded: true, loadingProgress: 100 }));
      return;
    }

    // Check cache first
    if (checkFontCache()) {
      setState(prev => ({ ...prev, fontsLoaded: true, loadingProgress: 100 }));
      return;
    }

    try {
      // Create font loading promises
      const fontPromises: Promise<void>[] = [];
      let totalFonts = 0;

      fonts.forEach(({ family, weights = ['400'] }) => {
        weights.forEach(weight => {
          totalFonts++;
          fontPromises.push(
            document.fonts.load(`${weight} 1em "${family}"`).then(() => {
              setState(prev => ({
                ...prev,
                loadingProgress: Math.round((fontPromises.length / totalFonts) * 100)
              }));
            })
          );
        });
      });

      // Wait for all fonts to load
      await Promise.all(fontPromises);

      // Mark as loaded
      setState(prev => ({ 
        ...prev, 
        fontsLoaded: true, 
        loadingProgress: 100,
        error: null 
      }));

      // Cache the result
      setFontCache();

    } catch (error) {
      console.error('Error loading fonts:', error);
      setState(prev => ({ 
        ...prev, 
        fontsLoaded: true, // Still mark as loaded to prevent blocking
        error: 'Some fonts failed to load' 
      }));
    }
  }, [fonts, checkFontCache, setFontCache]);

  // Reload fonts (force reload)
  const reloadFonts = useCallback(async () => {
    setState({
      fontsLoaded: false,
      loadingProgress: 0,
      error: null
    });
    
    // Clear cache
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('fonts-loaded-v1');
    }
    
    await loadFonts();
  }, [loadFonts]);

  // Load fonts on mount
  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  // Monitor font loading status
  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) return;

    const handleFontLoadingDone = () => {
      setState(prev => ({ ...prev, fontsLoaded: true }));
    };

    document.fonts.ready.then(handleFontLoadingDone);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const value: FontLoadingContextValue = {
    ...state,
    reloadFonts,
    preloadFont
  };

  return (
    <FontLoadingContext.Provider value={value}>
      {children}
    </FontLoadingContext.Provider>
  );
}

// Font loading indicator component
export function FontLoadingIndicator() {
  const { fontsLoaded, loadingProgress, error } = useFontLoading();

  if (fontsLoaded && !error) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 relative">
          <svg
            className="w-8 h-8 transform -rotate-90"
            viewBox="0 0 32 32"
          >
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${loadingProgress * 0.879} 87.9`}
              className="text-blue-600 dark:text-blue-400 transition-all duration-300"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {error ? 'Font loading error' : 'Loading fonts...'}
          </p>
          {!error && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {loadingProgress}% complete
            </p>
          )}
        </div>
      </div>
    </div>
  );
}