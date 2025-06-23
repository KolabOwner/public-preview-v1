// Simplified Summary Page
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useResumeData } from "@/contexts/resume-data-context";
import SummaryForm from "@/components/resume-editor/summary-form";


export default function ResumeSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.resumeId as string;
  const [error, setError] = useState<string>('');

  // Try to use the context - this will fail if not wrapped
  let contextAvailable = true;
  let resumeDataHook: any = {};

  try {
    resumeDataHook = useResumeData();
  } catch (e) {
    contextAvailable = false;
    console.error('ResumeDataContext not available:', e);
  }

  const {
    resumeData,
    fetchResumeData,
    loading,
    processedData
  } = contextAvailable ? resumeDataHook : {
    resumeData: null,
    fetchResumeData: async () => {},
    loading: false,
    processedData: null
  };

  // If context is not available, show error
  if (!contextAvailable) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Context Not Available
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              The ResumeDataContext is not provided. Make sure your app layout wraps pages with ResumeDataProvider.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch resume data when needed
  useEffect(() => {
    if (resumeId && (!resumeData || resumeData.id !== resumeId)) {
      fetchResumeData(resumeId).catch(err => {
        console.error('Failed to fetch resume:', err);
        setError('Failed to load resume data');
      });
    }
  }, [resumeId, resumeData, fetchResumeData]);

  const handleBackToEditor = () => {
    router.push(`/dashboard/resumes/${resumeId}/edit`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading resume data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || (!loading && !resumeData)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Unable to Load Resume
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error || 'The resume could not be loaded. Please check the URL and try again.'}
            </p>
            <button
              onClick={() => router.push('/dashboard/resumes')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Back to Resumes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen ">
      <SummaryForm />
    </div>
  );
}
