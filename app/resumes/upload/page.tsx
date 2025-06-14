'use client';

import React from 'react';
import { ResumeUploader } from '@/components/resume/ResumeUploader';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function UploadResumePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in?redirect=/resumes/upload');
    }
  }, [user, loading, router]);
  
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
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard/resumes"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Resumes
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h1>
        <p className="text-gray-600 mb-6">
          Upload your resume PDF to parse and analyze your resume content automatically.
          We&apos;ll extract your information and create an editable resume.
        </p>
        
        <ResumeUploader 
          userId={user.uid} 
          redirectToDashboard={true}
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Tips for best results:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Use a PDF format that contains selectable text (not scanned images)</li>
          <li>Ensure your PDF is not password protected</li>
          <li>Make sure your resume is well-structured with clear section headings</li>
          <li>Keep file size under 10MB for faster processing</li>
          <li>If your PDF has multiple pages, all content will be processed</li>
        </ul>
      </div>
    </div>
  );
}