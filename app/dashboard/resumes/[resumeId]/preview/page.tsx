// app/dashboard/resumes/[resumeId]/preview/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/auth-context';
import ResumePreview from '@/components/resume/resume-preview-panel';

interface ResumeData {
  id: string;
  title: string;
  userId: string;
  parsedData?: any;
  createdAt: string;
  updatedAt: string;
}

export default function ResumePreviewPage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useParams();
  const resumeId = params.resumeId as string;
  const { user } = useAuth();

  useEffect(() => {
    const fetchResume = async () => {
      if (!resumeId || !user) {
        setIsLoading(false);
        return;
      }

      if (!db) {
        console.error('Firestore database is not initialized');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching resume with ID:', resumeId);
        const resumeRef = doc(db, 'resumes', resumeId);
        const resumeSnap = await getDoc(resumeRef);

        if (!resumeSnap.exists()) {
          setError('Resume not found');
          return;
        }

        const resumeData = resumeSnap.data() as ResumeData;
        console.log('Fetched resume data:', resumeData);

        // Ensure user owns this resume
        if (resumeData.userId !== user.uid) {
          setError('You do not have permission to view this resume');
          return;
        }

        setResume({
          ...resumeData,
          id: resumeSnap.id
        });
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Failed to load resume');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [resumeId, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Resume Not Found</h3>
        <p>The resume you're looking for could not be found.</p>
      </div>
    );
  }

  // Log what we're passing to the preview
  console.log('Passing to ResumePreview:', resume.parsedData);

  return (
    <div>
      {/* Pass the parsed data directly */}
      <ResumePreview
        resumeData={resume.parsedData}
        resumeId={resume.id}
      />
    </div>
  );
}