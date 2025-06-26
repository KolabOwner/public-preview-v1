'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/features/auth/firebase-config';
import { FileStatus, PDFProcessor } from '@/lib/features/pdf/pdf-generator';
import { useUserUsage } from '@/hooks/use-user-usage';

interface OnboardingOverlayProps {
  onClose: () => void;
}

export default function OnboardingOverlay({ onClose }: OnboardingOverlayProps) {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { getIdToken, user } = useAuth();
  const { usage, loading: usageLoading, incrementPdfDownload, canDownloadPdf } = useUserUsage();

  const handleClose = async () => {
    // Update the user's showFirstTimeOverlay flag to false
    try {
      const token = await getIdToken();
      if (token) {
        await fetch('/api/auth-endpoints/user', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            showFirstTimeOverlay: false,
          }),
        });
      }
    } catch (error) {
      console.error('Error updating user overlay preference:', error);
    }
    onClose();
  };

  const handleDocumentTypeSelect = (type: string) => {
    if (type === 'resume') {
      setCurrentScreen(2);
    }
    // Add other document types handling here in the future
  };

  const handleResumeCreationMethod = async (method: string) => {
    if (method === 'import') {
      // Don't close overlay yet, go to import screen
      setCurrentScreen(3);
      return;
    }

    // Update the user's showFirstTimeOverlay flag to false
    try {
      const token = await getIdToken();
      if (token) {
        await fetch('/api/auth-endpoints/user', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            showFirstTimeOverlay: false,
          }),
        });
      }
    } catch (error) {
      console.error('Error updating user overlay preference:', error);
    }

    // Create resume based on the selected method
    switch (method) {
      case 'scratch':
        try {
          if (!user) {
            console.error('No user found');
            router.push('/dashboard/resumes');
            return;
          }

          // Use the same approach as CreateResumeModal for blank resumes
          const resumeData: any = {
            title: 'My Resume',
            userId: user.uid,
            experience: 'entry',
            isTargeted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: FileStatus.UPLOADED
          };

          // Create resume document in Firestore
          const docRef = await addDoc(collection(db, 'resumes'), resumeData);

          // Redirect to the resume editor
          router.push(`/dashboard/resumes/${docRef.id}`);
          onClose();
        } catch (error) {
          console.error('Error creating resume:', error);
          router.push('/dashboard/resumes');
          onClose();
        }
        break;
      case 'sample':
        // TODO: Implement sample selection
        router.push('/dashboard/resumes');
        onClose();
        break;
      case 'linkedin':
        // TODO: Implement LinkedIn import
        router.push('/dashboard/resumes');
        onClose();
        break;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    processFile(file);
  };

  const processFile = async (file: File) => {
    // Check if file is PDF
    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    // Check PDF generation limit
    if (!canDownloadPdf()) {
      setError(`You've reached your PDF generation limit (${usage.pdfGenerations}/${usage.maxPdfGenerations}). Please upgrade your plan.`);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Update the user's showFirstTimeOverlay flag to false
      const token = await getIdToken();
      if (token) {
        await fetch('/api/auth-endpoints/user', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            showFirstTimeOverlay: false,
          }),
        });
      }

      if (!user) {
        console.error('No user found');
        router.push('/dashboard/resumes');
        return;
      }

      // Use the same PDFProcessor approach as CreateResumeModal
      console.log(`Processing PDF file: ${file.name} (${file.size} bytes)`);

      // Create a new resume record in Firestore
      const newResumeId = await PDFProcessor.createResume({
        userId: user.uid,
        title: file.name.replace(/\.pdf$/i, ''),
        initialStatus: FileStatus.UPLOADED
      });

      // Process the PDF
      const result = await PDFProcessor.processPDF(file, newResumeId, {
        userId: user.uid,
        saveToFirebase: true,
        title: file.name.replace(/\.pdf$/i, '')
      });

      if (result.success) {
        console.log('PDF processing completed successfully:', result);

        // Update the resume with additional metadata
        const resumeRef = doc(db, 'resumes', newResumeId);
        const updateData: any = {
          experience: 'entry',
          isTargeted: false,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(resumeRef, updateData);

        // Increment PDF generation count for uploaded PDFs
        await incrementPdfDownload();

        // Redirect to the resume edit page after successful processing
        setTimeout(() => {
          router.push(`/dashboard/resumes/${newResumeId}`);
          onClose();
        }, 1500); // Short delay to show success state
      } else {
        console.error('Processing failed:', result.error);
        setError(result.error || 'Failed to process PDF');
      }
    } catch (err: any) {
      console.error('Error creating resume:', err);
      setError(err.message || 'Failed to create resume');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Hello, which document do you want to create today?
              </h2>
            </div>
            
            <div className="space-y-4">
              <div
                className="w-full cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-6 py-4 transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 group"
                onClick={() => handleDocumentTypeSelect('resume')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Resume
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Create a professional resume that stands out
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                onClick={handleClose}
              >
                Close and go to dashboard
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                How would you like to create your resume?
              </h2>
            </div>
            
            <div className="space-y-3">
              <div
                className="w-full cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-6 py-4 transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 group"
                onClick={() => handleResumeCreationMethod('scratch')}
              >
                <div className="flex items-start gap-2">
                  <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    From Scratch
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">Recommended</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  This is the best way to get the most out of your resume - just follow the easy flow section by section
                </p>
              </div>
              <div
                className="w-full cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-6 py-4 transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 group"
                onClick={() => handleResumeCreationMethod('sample')}
              >
                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  From Resume Sample
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  If it's the first time you're writing a resume, a sample is a good way to see best practices for inspiration
                </p>
              </div>
              <div
                className="w-full cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-6 py-4 transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 group"
                onClick={() => handleResumeCreationMethod('import')}
              >
                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Import your resume
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  While we can't guarantee perfect results, we're constantly working to improve importing for a better user experience.
                </p>
              </div>
              <div
                className="w-full cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-6 py-4 transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 group"
                onClick={() => handleResumeCreationMethod('linkedin')}
              >
                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  From LinkedIn
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  If you have a great LinkedIn profile, save time by importing your profile straight into a resume
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <button
                className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setCurrentScreen(1)}
              >
                ← Return
              </button>
              <button
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                onClick={handleClose}
              >
                Close and go to dashboard
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Let's get your information from your own resume
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Upload your existing resume and we'll help you improve it
              </p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <label className={`block cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                  <div className="space-y-4">
                    {isProcessing ? (
                      <div className="flex flex-col items-center">
                        <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Processing your resume...</p>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          PDF, DOC, DOCX up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
              
              <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This process may take up to 60 seconds. Please be patient and keep this page open.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <button
                className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setCurrentScreen(2)}
              >
                ← Return
              </button>
              <button
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                onClick={handleClose}
              >
                Close and go to dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={handleClose} />
      
      {/* Modal content */}
      <div className="relative w-full max-w-[448px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-10">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}