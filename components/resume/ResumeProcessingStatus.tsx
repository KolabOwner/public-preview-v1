'use client';

// components/resume/ResumeProcessingStatus.tsx
import React, { useEffect, useState } from 'react';
import { FileStatus } from '@/lib/pdf-processor';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Spinner } from '@/components/ui/spinner';
import { XCircleIcon, CheckCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon as ArrowPathSolidIcon } from '@heroicons/react/24/solid';

interface ResumeProcessingStatusProps {
  resumeId: string;
  onProcessingComplete?: (resumeData: any) => void;
  onProcessingError?: (error: string) => void;
  showDetails?: boolean;
}

export function ResumeProcessingStatus({
  resumeId,
  onProcessingComplete,
  onProcessingError,
  showDetails = true
}: ResumeProcessingStatusProps) {
  const [status, setStatus] = useState<FileStatus | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (!resumeId) return;

    console.log(`Monitoring status for resume: ${resumeId}`);
    
    // Reset state when resumeId changes
    setStatus(null);
    setProgress(null);
    setError(null);
    setTimeElapsed(0);
    setStartTime(Date.now());
    
    // Subscribe to real-time updates
    const resumeRef = doc(db, 'resumes', resumeId);
    const unsubscribe = onSnapshot(
      resumeRef,
      (snapshot) => {
        const data = snapshot.data();
        if (!data) return;
        
        setStatus(data.status);
        setProgress(data);
        
        if (data.status === FileStatus.PROCESSED && onProcessingComplete) {
          onProcessingComplete(data);
        } else if (data.status === FileStatus.ERROR) {
          setError(data.error || 'An unknown error occurred');
          if (onProcessingError) {
            onProcessingError(data.error || 'An unknown error occurred');
          }
        }
      },
      (error) => {
        console.error('Error monitoring resume status:', error);
        setError('Failed to monitor processing status');
        if (onProcessingError) {
          onProcessingError('Failed to monitor processing status');
        }
      }
    );
    
    // Set up timer to track elapsed time
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [resumeId, onProcessingComplete, onProcessingError]);

  // Format elapsed time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage based on processing stage
  const getProgressPercentage = (): number => {
    if (!progress || !progress.processingStage) return 0;
    
    const stages = {
      'initialization': 0,
      'uploading': 25,
      'text_extraction': 50,
      'parsing': 75,
      'saving': 90
    };
    
    return stages[progress.processingStage as keyof typeof stages] || 0;
  };
  
  // Get stage label
  const getStageLabel = (): string => {
    if (!progress || !progress.processingStage) return 'Initializing...';
    
    const stageLabels = {
      'initialization': 'Initializing processing',
      'uploading': 'Uploading PDF file',
      'text_extraction': 'Extracting text from PDF',
      'parsing': 'Analyzing resume content',
      'saving': 'Saving processed data'
    };
    
    return progress.progressMessage || stageLabels[progress.processingStage as keyof typeof stageLabels] || 'Processing...';
  };

  if (!resumeId) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Resume Processing</h3>
        <div className="text-sm text-gray-500">Time: {formatTime(timeElapsed)}</div>
      </div>
      
      {/* Status Indicator */}
      <div className="mb-4">
        {status === FileStatus.UPLOADED && (
          <div className="flex items-center text-yellow-600">
            <ClockIcon className="h-5 w-5 mr-2" />
            <span>Waiting to process...</span>
          </div>
        )}
        
        {status === FileStatus.PROCESSING && (
          <div className="flex items-center text-blue-600">
            <ArrowPathSolidIcon className="h-5 w-5 mr-2 animate-spin" />
            <span>{getStageLabel()}</span>
          </div>
        )}
        
        {status === FileStatus.PROCESSED && (
          <div className="flex items-center text-green-600">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            <span>Processing complete!</span>
          </div>
        )}
        
        {status === FileStatus.ERROR && (
          <div className="flex items-center text-red-600">
            <XCircleIcon className="h-5 w-5 mr-2" />
            <span>Error: {error}</span>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      {status === FileStatus.PROCESSING && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      )}
      
      {/* Details (only shown if showDetails is true) */}
      {showDetails && progress && (
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          {progress.fileName && (
            <div className="flex justify-between">
              <span>File:</span>
              <span className="font-medium">{progress.fileName}</span>
            </div>
          )}
          
          {progress.fileSize && (
            <div className="flex justify-between">
              <span>Size:</span>
              <span className="font-medium">{(progress.fileSize / 1024).toFixed(1)} KB</span>
            </div>
          )}
          
          {progress.textLength && (
            <div className="flex justify-between">
              <span>Extracted text:</span>
              <span className="font-medium">{progress.textLength} characters</span>
            </div>
          )}
          
          {progress.processingTime && (
            <div className="flex justify-between">
              <span>Processing time:</span>
              <span className="font-medium">{(progress.processingTime / 1000).toFixed(1)} seconds</span>
            </div>
          )}
          
          {status === FileStatus.ERROR && progress.errorStage && (
            <div className="flex justify-between">
              <span>Failed at:</span>
              <span className="font-medium">{progress.errorStage}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Retry Button for Errors */}
      {status === FileStatus.ERROR && (
        <button 
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => window.location.reload()}
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Retry
        </button>
      )}
    </div>
  );
}