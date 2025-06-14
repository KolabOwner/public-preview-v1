'use client';

// components/resume/ResumeUploader.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFProcessor, FileStatus, ProcessingResult } from '@/lib/pdf-processor';
import { ResumeProcessingStatus } from './ResumeProcessingStatus';
import { DocumentArrowUpIcon, DocumentIcon, XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ResumeUploaderProps {
  userId: string;
  onUploadComplete?: (result: ProcessingResult) => void;
  redirectToDashboard?: boolean;
  className?: string;
}

export function ResumeUploader({ 
  userId, 
  onUploadComplete,
  redirectToDashboard = true,
  className = ''
}: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Clear any previous state
    setError(null);
    setResumeId(null);
    setProcessingResult(null);
    
    const pdfFile = acceptedFiles[0];
    if (!pdfFile) return;
    
    // Validate file
    if (pdfFile.type !== 'application/pdf') {
      setError('Only PDF files are supported');
      return;
    }
    
    if (pdfFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size exceeds 10MB limit');
      return;
    }
    
    setFile(pdfFile);
    
    try {
      setIsUploading(true);
      
      // Create a new resume record in Firestore
      const newResumeId = await PDFProcessor.createResume({
        userId,
        title: pdfFile.name.replace(/\.pdf$/i, ''),
        initialStatus: FileStatus.UPLOADED
      });
      
      setResumeId(newResumeId);
      
      // Process the PDF
      const result = await PDFProcessor.processPDF(pdfFile, newResumeId, {
        userId,
        saveToFirebase: true,
        title: pdfFile.name.replace(/\.pdf$/i, '')
      });
      
      setProcessingResult(result);
      
      if (result.success) {
        console.log('Processing completed successfully:', result);
        if (onUploadComplete) {
          onUploadComplete(result);
        }
        
        // Redirect to the resume edit page after successful processing
        if (redirectToDashboard && result.resumeId) {
          setTimeout(() => {
            router.push(`/dashboard/resumes/${result.resumeId}`);
          }, 1500); // Short delay to show success state
        }
      } else {
        console.error('Processing failed:', result.error);
        setError(result.error || 'Failed to process PDF');
      }
    } catch (err: any) {
      console.error('Error during file upload/processing:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  }, [userId, onUploadComplete, router, redirectToDashboard]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isUploading || !!resumeId
  });
  
  const resetUploader = () => {
    setFile(null);
    setError(null);
    setResumeId(null);
    setProcessingResult(null);
  };
  
  const handleProcessingComplete = (resumeData: any) => {
    console.log('Processing completed:', resumeData);
    // This will be called when the ResumeProcessingStatus component
    // detects that processing is complete
  };
  
  return (
    <div className={`w-full ${className}`}>
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition duration-150 ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-900">
            {isDragActive ? 'Drop your resume PDF here' : 'Drag & drop your resume PDF here'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Or click to select a file (10MB max)
          </p>
          
          {error && (
            <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <DocumentIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            
            {!isUploading && !resumeId && (
              <button 
                onClick={resetUploader}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {resumeId && (
            <ResumeProcessingStatus 
              resumeId={resumeId}
              onProcessingComplete={handleProcessingComplete}
              onProcessingError={(errorMsg) => setError(errorMsg)}
              showDetails={true}
            />
          )}
          
          {error && !resumeId && (
            <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
              <button 
                onClick={resetUploader}
                className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}