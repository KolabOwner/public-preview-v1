'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import { FileStatus, PDFProcessor, ProcessingResult } from "@/lib/features/pdf/pdf-generator";
import { ResumeProcessingStatus } from '../ResumeProcessingStatus';
import { useUserUsage } from '@/hooks/use-user-usage';
import {
  X,
  ChevronRight,
  ChevronDown,
  Upload,
  Linkedin,
  Info
} from 'lucide-react';

interface CreateResumeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateResumeModal({ isOpen, onOpenChange }: CreateResumeModalProps) {
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [isTargeted, setIsTargeted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  
  // Job targeting fields
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { usage, loading: usageLoading, incrementPdfDownload, canDownloadPdf } = useUserUsage();

  // Create onClose function from the prop
  const onClose = () => onOpenChange(false);

  // Early return if modal is not open
  if (!isOpen) return null;

  const experienceOptions = [
    'Entry Level (0-2 years)',
    'Mid Level (3-5 years)',
    'Senior Level (6-10 years)',
    'Expert Level (10+ years)',
    'Student/New Graduate'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Reset any previous state
    setError('');
    setResumeId(null);
    setProcessingResult(null);

    // Check if file is PDF
    if (!selectedFile.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setFile(selectedFile);
    setShowImportDropdown(true);
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

    // Reset any previous state
    setError('');
    setResumeId(null);
    setProcessingResult(null);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    // Check if file is PDF
    if (!droppedFile.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    // Check file size (10MB limit)
    if (droppedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setFile(droppedFile);
    setShowImportDropdown(true);
  };

  const handleLinkedInImport = () => {
    // TODO: Implement LinkedIn import functionality
    console.log('LinkedIn import clicked');
  };

  const handleProcessingComplete = (resumeData: any) => {
    console.log('Processing completed:', resumeData);
    // This will be called when the ResumeProcessingStatus component
    // detects that processing is complete
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a resume name');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a resume');
      return;
    }

    // Check if usage is still loading
    if (usageLoading) {
      setError('Loading your usage information...');
      return;
    }

    // Check PDF generation limit for file uploads
    if (file && !canDownloadPdf()) {
      setError(`You've reached your PDF generation limit (${usage.pdfGenerations}/${usage.maxPdfGenerations}). Please upgrade your plan.`);
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // If no file is uploaded, create a blank resume
      if (!file) {
        const resumeData: any = {
          title,
          userId: user.uid,
          experience,
          isTargeted,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: FileStatus.UPLOADED
        };
        
        // If targeted and job info provided, save it
        if (isTargeted && jobTitle && jobDescription) {
          resumeData.job_info = {
            title: jobTitle,
            description: jobDescription,
            company: '',
            saved_during_upload: true,
            created_at: new Date().toISOString()
          };
        }

        // Create resume document in Firestore
        const docRef = await addDoc(collection(db, 'resumes'), resumeData);

        // No need to update resume count anymore

        // Redirect to the resume editor
        router.push(`/dashboard/resumes/${docRef.id}`);
        onClose();
        return;
      }

      // For file uploads, create a resume and process it with PDFProcessor
      console.log(`Processing PDF file: ${file.name} (${file.size} bytes)`);

      // Create a new resume record in Firestore
      const newResumeId = await PDFProcessor.createResume({
        userId: user.uid,
        title: title || file.name.replace(/\.pdf$/i, ''),
        initialStatus: FileStatus.UPLOADED
      });

      setResumeId(newResumeId);

      // Process the PDF
      const result = await PDFProcessor.processPDF(file, newResumeId, {
        userId: user.uid,
        saveToFirebase: true,
        title: title || file.name.replace(/\.pdf$/i, '')
      });

      setProcessingResult(result);

      if (result.success) {
        console.log('PDF processing completed successfully:', result);

        // Update the resume with additional metadata and job info if targeted
        const resumeRef = doc(db, 'resumes', newResumeId);
        const updateData: any = {
          experience,
          isTargeted,
          updatedAt: serverTimestamp()
        };
        
        // If targeted and job info provided, save it
        if (isTargeted && jobTitle && jobDescription) {
          updateData.job_info = {
            title: jobTitle,
            description: jobDescription,
            company: '',
            saved_during_upload: true,
            created_at: new Date().toISOString()
          };
        }
        
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
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800 backdrop-blur-sm rounded-lg w-full max-w-md shadow-2xl border border-slate-200 dark:border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create a resume</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Resume Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              RESUME NAME <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter here..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>

          {/* Experience */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              EXPERIENCE
            </label>
            <button
              onClick={() => setShowExperienceDropdown(!showExperienceDropdown)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md text-left focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors flex items-center justify-between"
            >
              <span className={experience ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                {experience || 'Select...'}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showExperienceDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showExperienceDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-lg z-10 overflow-hidden backdrop-blur-sm">
                {experienceOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setExperience(option);
                      setShowExperienceDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Import from LinkedIn */}
          <button
            onClick={handleLinkedInImport}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md text-left text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Linkedin className="w-5 h-5 text-blue-500" />
              <span>IMPORT YOUR RESUME FROM LINKEDIN</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>

          {/* Import Existing Resume */}
          <div>
            <button
              onClick={() => setShowImportDropdown(!showImportDropdown)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md text-left text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
            >
              <span>IMPORT YOUR EXISTING RESUME</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showImportDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showImportDropdown && (
              <div className="mt-2">
                {!resumeId ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-all
                      ${isDragging
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-500 bg-slate-50 dark:bg-gray-700'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {file ? file.name : 'Upload PDF resume file'}
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-300 dark:border-gray-600 rounded-lg p-4 bg-slate-50 dark:bg-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{file?.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{file ? (file.size / 1024).toFixed(1) : '0'} KB</p>
                        </div>
                      </div>
                    </div>

                    <ResumeProcessingStatus
                      resumeId={resumeId}
                      onProcessingComplete={handleProcessingComplete}
                      onProcessingError={(errorMsg) => setError(errorMsg)}
                      showDetails={true}
                    />
                  </div>
                )}

                <div className="mt-2 flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600 dark:text-gray-500">
                    This process may take up to 60 seconds. Please be patient and keep this page open.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Target Resume Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Target your resume</h3>
              <button
                onClick={() => setIsTargeted(!isTargeted)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${isTargeted ? 'bg-blue-600' : 'bg-gray-600'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${isTargeted ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full bg-teal-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                A targeted resume is a resume tailored to a specific job opening.
                You have a significantly higher chance of getting an interview when
                you make it clear you have the experience required for the job.
              </p>
            </div>
            
            {/* Job Details when targeted is enabled */}
            {isTargeted && (
              <div className="mt-4 space-y-3 p-4 bg-slate-50 dark:bg-gray-700 rounded-md border border-slate-200 dark:border-gray-600">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    JOB TITLE (Optional)
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    JOB DESCRIPTION (Optional)
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for keyword optimization..."
                    rows={4}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm resize-none"
                  />
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Adding job details now will allow immediate keyword analysis after upload
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || isUploading || Boolean(resumeId)}
            className={`
              px-6 py-2 text-sm font-medium rounded-md transition-colors
              ${title && !isUploading && !resumeId
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isUploading ? 'Creating...' : resumeId ? 'Processing...' : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  );
}