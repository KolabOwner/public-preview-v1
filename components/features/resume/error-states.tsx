import React from 'react';
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className = "" }: ErrorStateProps) {
  return (
    <div className={`w-full max-w-4xl xl:max-w-5xl mx-auto p-8 ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800">Sync Error</h3>
          <p className="text-red-700 mt-1">
            Unable to sync with resume data: {error}
          </p>
          <button
            onClick={onRetry || (() => window.location.reload())}
            className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            {onRetry ? 'Retry' : 'Refresh Page'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface NoDataStateProps {
  isLoading: boolean;
  className?: string;
}

export function NoDataState({ isLoading, className = "" }: NoDataStateProps) {
  return (
    <div className={`w-full max-w-4xl xl:max-w-5xl mx-auto p-8 ${className}`}>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-800">No Resume Data</h3>
          <p className="text-yellow-700 mt-1">
            {isLoading
              ? 'Loading your resume data...'
              : 'No resume data is available to preview. Please add some information in the other sections first.'}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SyncIndicatorProps {
  isLoading: boolean;
}

export function SyncIndicator({ isLoading }: SyncIndicatorProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm">Syncing RMS data...</span>
    </div>
  );
}