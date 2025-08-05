// Summary Page - Direct Firebase Access
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from "@/config/firebase-config";
import { useAuth } from '@/contexts/firebase-auth-context';
import { AlertCircle } from 'lucide-react';
import SummaryForm from "@/components/features/resume/forms/summary-form";

interface ResumeData {
  id: string;
  title: string;
  userId: string;
  parsedData?: any;
  rmsRawData?: any;
  createdAt: string;
  updatedAt: string;
}

export default function ResumeSummaryPage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
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
          setError('Resume not found');
          return;
        }
        
        const resumeData = resumeSnap.data() as ResumeData;
        
        // Ensure user owns this resume
        if (resumeData.userId !== user.uid) {
          setError('You do not have permission to view this resume');
          return;
        }
        
        setResume({
          ...resumeData,
          id: resumeSnap.id,
          // Merge parsedData fields directly to top level like experience page does
          ...resumeData.parsedData
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

  const handleSave = async (data: any) => {
    if (!resumeId) return;
    
    try {
      const resumeRef = doc(db, 'resumes', resumeId);
      await updateDoc(resumeRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      console.log('Summary data saved successfully');
    } catch (error) {
      console.error('Error saving summary:', error);
      throw error;
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
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error</h3>
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Resume Not Found</h3>
        <p>The resume you&apos;re looking for could not be found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SummaryForm 
        initialData={resume}
        onSave={handleSave}
      />
    </div>
  );
}
