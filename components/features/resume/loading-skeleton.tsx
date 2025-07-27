import React from 'react';

interface LoadingSkeletonProps {
  paperDimensions: { width: number; height: number };
  documentSettings: { zoom: number };
  theme: { background: string; shadow: string };
}

export function LoadingSkeleton({ paperDimensions, documentSettings, theme }: LoadingSkeletonProps) {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div
        className="p-4 lg:p-8 rounded-xl"
        style={{
          backgroundColor: theme.background,
          minHeight: `calc(${paperDimensions.height}px * ${documentSettings.zoom / 100} + 4rem)`
        }}
      >
        <div
          className="shadow-2xl overflow-hidden max-w-full bg-white"
          style={{
            transform: `scale(${documentSettings.zoom / 100})`,
            transformOrigin: 'top center',
            width: `${paperDimensions.width}px`,
            height: `${paperDimensions.height}px`,
            margin: '0 auto',
            boxSizing: 'border-box',
            outlineOffset: '1px',
            boxShadow: theme.shadow,
            maxWidth: '100%',
          }}
        >
          <div className="p-12 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
            </div>

            {[1, 2, 3, 4].map((section) => (
              <div key={section} className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                <div className="border-b border-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}