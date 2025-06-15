'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/lib/core/auth/firebase-config";
import { useAuth } from '@/contexts/auth-context';
import ResumePreviewPanel from '@/components/resume/panels/resume-preview-panel';
import { generateResumePDF } from "@/lib/features/pdf/generator";

export default function ResumePreviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumeTitle, setResumeTitle] = useState('');
  const [resumeData, setResumeData] = useState<any>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  const params = useParams();
  const resumeId = params.resumeId as string;
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchResumeData = async () => {
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
          setError('Resume not found');
          return;
        }

        const data = resumeSnap.data();

        // Ensure user owns this resume
        if (data.userId !== user.uid) {
          setError('You do not have permission to view this resume');
          return;
        }

        setResumeTitle(data.title || 'Untitled Resume');
        setResumeData(data);
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Failed to load resume');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, [resumeId, user]);

  const handleDownloadPDF = async () => {
    if (!resumeData) return;

    try {
      setIsPdfGenerating(true);

      // Generate PDF blob
      const pdfBlob = generateResumePDF(resumeData);

      // Create a download link and trigger the download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeTitle || 'Resume'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

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
        <button
          onClick={() => router.push('/dashboard/resumes')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Back to Resumes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{resumeTitle}</h1>
            <p className="text-sm text-gray-500">Preview Mode</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push(`/dashboard/resumes/${resumeId}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Edit Resume
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isPdfGenerating}
              className="btn-primary"
            >
              {isPdfGenerating ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg min-h-screen">
        <ResumePreviewPanel resumeId={resumeId} resumeData={resumeData} />
      </div>
    </div>
  );
}