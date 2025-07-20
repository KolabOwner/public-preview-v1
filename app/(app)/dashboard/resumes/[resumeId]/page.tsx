'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ResumeEditorPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  const router = useRouter();

  useEffect(() => {
    // Redirect to the contact page
    if (resumeId) {
      router.push(`/dashboard/resumes/${resumeId}/contact`);
    }
  }, [resumeId, router]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}