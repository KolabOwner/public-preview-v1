// app/dashboard/resumes/[resumeId]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/auth-context';
import ResumeEditor from '@/components/resume/resume-editor-area';
import { generateResumePDF } from '@/lib/pdf-generator';

export default function ResumeEditPage() {
  const [resume, setResume] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

  const handleSave = async (data: any) => {
    if (!resumeId || !db) {
      console.error('Cannot save: Missing resumeId or db is not initialized');
      return;
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'resumes', resumeId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!resume) return;

    try {
      // Generate PDF
      const resumeElement = document.querySelector('.resume-preview-content');
      if (resumeElement) {
        await generateResumePDF(resumeElement as HTMLElement, `${resume.title || 'resume'}.pdf`);
      }
    } catch (error) {
      console.error('Error exporting resume:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading resume editor...</p>
        </div>
      </div>
    );
  }

  return (
    <ResumeEditor
      resumeId={resumeId}
      initialData={resume?.parsedData}
      onSave={handleSave}
      onExport={handleExport}
    />
  );
}