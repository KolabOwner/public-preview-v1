// app/dashboard/resumes/[resumeId]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import { useAuth } from '@/contexts/auth-context';
import ResumeEditor from '@/components/resume/resume-editor-area';

// Note: If you're still getting TypeScript errors, check the ResumeEditorAreaProps interface
// in @/components/resume/resume-editor-area to see the exact prop names expected.
// You can also hover over <ResumeEditor in your IDE to see the expected props.


export default function ResumeEditPage() {
  const [resume, setResume] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Removed isSaving and lastSaved as they're not used without the handlers

  const params = useParams();
  const resumeId = params.resumeId as string;
  const { user } = useAuth();
  const router = useRouter();

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
        const resumeRef = doc(db, 'resumes', resumeId);
        const resumeSnap = await getDoc(resumeRef);

        if (!resumeSnap.exists()) {
          router.push('/dashboard/resumes');
          return;
        }

        const resumeData = resumeSnap.data();

        // Ensure user owns this resume
        if (resumeData.userId !== user.uid) {
          router.push('/dashboard/resumes');
          return;
        }

        setResume({
          ...resumeData,
          id: resumeSnap.id
        });
      } catch (err) {
        console.error('Error fetching resume:', err);
        router.push('/dashboard/resumes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [resumeId, user, router]);

  // Note: ResumeEditor component doesn't accept onSave/onExport props
  // It likely handles saving and exporting internally

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-blue-600/20 blur-xl animate-pulse"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-4">Loading resume editor...</p>
        </div>
      </div>
    );
  }

  // Since ResumeEditor doesn't accept onSave/onExport, it likely handles saving internally
  // or expects different prop names. Try just passing the resume:
  return (
    <ResumeEditor
      resume={resume}
    />
  );

  // Alternative: If the component needs specific data structure:
  // return (
  //   <ResumeEditor
  //     resume={{
  //       id: resumeId,
  //       data: resume?.parsedData,
  //       title: resume?.title,
  //       // Include any other fields the component expects
  //     }}
  //   />
  // );
}