// Progressive Job Loading Hook with Server-Sent Events
import { useState, useEffect, useRef, useCallback } from 'react';
import { Job } from '@/types/job-board.types';

export interface StreamEvent {
  type: 'connected' | 'progress' | 'jobs_batch' | 'completed' | 'error' | 'log' | 'stream_ended';
  message?: string;
  jobs?: Job[];
  count?: number;
  batch_size?: number;
  total_processed?: number;
  total_found?: number;
  progress?: number;
  error?: string;
  timestamp: string;
}

export interface JobStreamState {
  jobs: Job[];
  loading: boolean;
  progress: number;
  currentSource: string;
  totalJobs: number;
  error: string | null;
  connected: boolean;
  completed: boolean;
}

export interface UseJobStreamReturn extends JobStreamState {
  startSearch: (params: SearchParams) => void;
  stopSearch: () => void;
  clearResults: () => void;
}

export interface SearchParams {
  query: string;
  location: string;
  limit?: number;
  sources?: string[];
  jobType?: string;
  experienceLevel?: string;
  remote?: boolean;
}

export function useJobStream(): UseJobStreamReturn {
  const [state, setState] = useState<JobStreamState>({
    jobs: [],
    loading: false,
    progress: 0,
    currentSource: '',
    totalJobs: 0,
    error: null,
    connected: false,
    completed: false
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      jobs: [],
      progress: 0,
      totalJobs: 0,
      error: null,
      completed: false
    }));
  }, []);

  const stopSearch = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({
      ...prev,
      loading: false,
      connected: false
    }));
  }, []);

  const startSearch = useCallback((params: SearchParams) => {
    // Stop any existing search
    stopSearch();
    
    // Clear previous results
    clearResults();
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Build URL parameters
    const searchParams = new URLSearchParams({
      q: params.query,
      location: params.location,
      limit: (params.limit || 25).toString(),
      sources: (params.sources || ['linkedin']).join(',')
    });
    
    if (params.jobType) searchParams.set('type', params.jobType);
    if (params.experienceLevel) searchParams.set('level', params.experienceLevel);
    if (params.remote) searchParams.set('remote', 'true');

    // Initialize state
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      connected: false,
      completed: false,
      currentSource: 'Connecting...'
    }));

    // Create EventSource for real-time streaming
    const eventSource = new EventSource(`/api/jobs/realtime?${searchParams.toString()}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setState(prev => ({
        ...prev,
        connected: true,
        currentSource: 'Connected'
      }));
    };

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);
        handleStreamEvent(data);
      } catch (error) {
        console.error('Failed to parse stream event:', error);
      }
    };

    eventSource.onerror = (event) => {
      console.error('EventSource error:', event);
      setState(prev => ({
        ...prev,
        error: 'Connection to job stream failed',
        loading: false,
        connected: false
      }));
      stopSearch();
    };

    // Cleanup function will be handled by the effect
  }, [stopSearch, clearResults]);

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case 'connected':
        setState(prev => ({
          ...prev,
          connected: true,
          currentSource: 'Connected to job stream'
        }));
        break;

      case 'progress':
        setState(prev => ({
          ...prev,
          progress: event.progress || 0,
          currentSource: event.message || prev.currentSource
        }));
        break;

      case 'jobs_batch':
        setState(prev => {
          const newJobs = event.jobs || [];
          const updatedJobs = [...prev.jobs, ...newJobs];
          
          return {
            ...prev,
            jobs: updatedJobs,
            totalJobs: event.total_processed || updatedJobs.length,
            currentSource: `Found ${newJobs.length} more jobs (${event.total_processed}/${event.total_found})`,
            progress: event.progress || Math.min(100, (updatedJobs.length / (event.total_found || 25)) * 100)
          };
        });
        break;

      case 'log':
        // Optional: Update status based on JobSpy logs
        if (event.message?.includes('finished scraping')) {
          setState(prev => ({
            ...prev,
            currentSource: 'Processing results...',
            progress: 95
          }));
        }
        break;

      case 'completed':
        setState(prev => ({
          ...prev,
          loading: false,
          completed: true,
          progress: 100,
          currentSource: `Completed - Found ${event.count || prev.totalJobs} jobs`,
          totalJobs: event.count || prev.totalJobs
        }));
        stopSearch();
        break;

      case 'error':
        setState(prev => ({
          ...prev,
          error: event.error || 'Unknown error occurred',
          loading: false,
          connected: false
        }));
        stopSearch();
        break;

      case 'stream_ended':
        // Stream finished naturally
        setState(prev => ({
          ...prev,
          loading: false,
          connected: false
        }));
        stopSearch();
        break;

      default:
        console.warn('Unknown stream event type:', event.type);
    }
  }, [stopSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSearch();
    };
  }, [stopSearch]);

  return {
    ...state,
    startSearch,
    stopSearch,
    clearResults
  };
}