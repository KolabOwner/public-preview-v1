'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import EnhancedResumePreview from "@/components/resume/EnhancedResumePreview";

interface ResumePreviewPageProps {
  params: {
    resumeId: string;
  };
}

export default function ResumePreviewPage({ params }: ResumePreviewPageProps) {
  const { resumeId } = params;
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push(`/auth/sign-in?redirect=/resumes/preview/${resumeId}`);
    }
  }, [user, loading, router, resumeId]);
  
  // If still loading or not authenticated, show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/resumes"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Resumes
        </Link>
        
        <Link
          href={`/dashboard/resumes/${resumeId}`}
          className="inline-flex items-center text-sm px-3 py-2 border border-gray-300 shadow-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PencilIcon className="h-4 w-4 mr-1.5" />
          Edit Resume
        </Link>
      </div>
      
      <EnhancedResumePreview 
        resumeId={resumeId}
        showControls={true}
        className="mb-8"
      />
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h3 className="font-medium text-yellow-800 mb-2">Need to make changes?</h3>
        <p className="text-sm text-yellow-700 mb-3">
          Use the styling options above to customize the appearance of your resume.
          If you need to edit the content, click the &quot;Edit Resume&quot; button to return to the editor.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/dashboard/resumes/${resumeId}`}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Resume Content
          </Link>
          <Link
            href="/dashboard/resumes"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to My Resumes
          </Link>
        </div>
      </div>
    </div>
  );
}