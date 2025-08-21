'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/firebase-auth-context';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "@/config/firebase-config";
import { FileStatus, PDFProcessor, ProcessingResult } from "@/lib/server/services/resume/pdf-generator";
import { ResumeProcessingStatus } from '../ResumeProcessingStatus';
import { useUserUsage } from '@/lib/client/hooks/auth/use-user-usage';
import {
  X,
  ChevronDown,
  Upload,
  AlertCircle,
  FileText
} from 'lucide-react';

interface ResumeData {
  id: string;
  title: string;
  experience?: string;
  isTargeted?: boolean;
  job_info?: {
    title?: string;
    company?: string;
    description?: string;
  };
}
interface EditResumeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  onUpdateComplete?: (updatedData: ResumeData) => void;
}
export default function EditResumeModal({ 
  isOpen, 
  onOpenChange, 
  resumeData, 
  onUpdateComplete 
}: EditResumeModalProps) {
  // Form state - initialized with existing resume data
  const [title, setTitle] = useState(resumeData.title);
  const [experience, setExperience] = useState(resumeData.experience || '');
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [showLinkedInDropdown, setShowLinkedInDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [isTargeted, setIsTargeted] = useState(resumeData.isTargeted || false);
  // Job targeting fields
  const [jobTitle, setJobTitle] = useState(resumeData.job_info?.title || '');
  const [companyName, setCompanyName] = useState(resumeData.job_info?.company || '');
  const [jobDescription, setJobDescription] = useState(resumeData.job_info?.description || '');
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkedinFileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { usage, loading: usageLoading, incrementPdfDownload, canDownloadPdf } = useUserUsage();
  // Reset form to original values when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(resumeData.title);
      setExperience(resumeData.experience || '');
      setIsTargeted(resumeData.isTargeted || false);
      setJobTitle(resumeData.job_info?.title || '');
      setCompanyName(resumeData.job_info?.company || '');
      setJobDescription(resumeData.job_info?.description || '');
      setFile(null);
      setLinkedinFile(null);
      setError('');
      setProcessingResult(null);
      setIsProcessingPdf(false);
    }
  }, [isOpen, resumeData]);
  const onClose = () => {
    // Reset all state when closing
    setTitle(resumeData.title);
    setExperience(resumeData.experience || '');
    setShowExperienceDropdown(false);
    setShowLinkedInDropdown(false);
    setShowImportDropdown(false);
    setIsTargeted(resumeData.isTargeted || false);
    setJobTitle(resumeData.job_info?.title || '');
    setCompanyName(resumeData.job_info?.company || '');
    setJobDescription(resumeData.job_info?.description || '');
    setFile(null);
    setLinkedinFile(null);
    setIsUploading(false);
    setError('');
    setIsDragging(false);
    setProcessingResult(null);
    setIsProcessingPdf(false);
    // Clear file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (linkedinFileInputRef.current) linkedinFileInputRef.current.value = '';
    onOpenChange(false);
  };
  // Early return if modal is not open
  if (!isOpen) return null;
  const experienceOptions = [
    'Internship',
    'Entry level',
    'Associate', 
    'Junior level',
    'Mid-Senior level',
    'Director',
    'Executive'
  ];
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'linkedin') => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setError('');
    setProcessingResult(null);
    // Validate file type based on type
    if (type === 'pdf') {
      if (!selectedFile.type.includes('pdf')) {
        setError('Please upload a PDF file');
        return;
      }
      setFile(selectedFile);
      setShowImportDropdown(true);
    } else {
      // LinkedIn import accepts .resume files
      if (!selectedFile.name.toLowerCase().endsWith('.resume')) {
        setError('Please upload a .RESUME file from our Chrome extension');
        return;
      }
      setLinkedinFile(selectedFile);
      setShowLinkedInDropdown(true);
    }
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
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
    setError('');
    setProcessingResult(null);
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    if (!droppedFile.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }
    if (droppedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }
    setFile(droppedFile);
    setShowImportDropdown(true);
  };
  const handleProcessingComplete = (updatedResumeData: any) => {
    console.log('PDF processing completed:', updatedResumeData);
    setIsProcessingPdf(false);
    // The resume data has been updated in Firestore by the PDFProcessor
    // We can close the modal or show success message
  };
  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a resume name');
      return;
    }
    if (!user) {
      setError('You must be logged in to update this resume');
      return;
    }
    // Check if usage is still loading
    if (usageLoading) {
      setError('Loading your usage information...');
      return;
    }
    // Check PDF generation limit for file uploads
    if ((file || linkedinFile) && !canDownloadPdf()) {
      setError(`You've reached your PDF generation limit (${usage.pdfGenerations}/${usage.maxPdfGenerations}). Please upgrade your plan.`);
      return;
    }
    setIsUploading(true);
    setError('');
    try {
      // If a new PDF file is uploaded, process it
      if (file) {
        setIsProcessingPdf(true);
        const result = await PDFProcessor.processPDF(file, resumeData.id, {
          userId: user.uid,
          saveToFirebase: true,
          title: title
        });
        setProcessingResult(result);
        if (!result.success) {
          console.error('PDF processing failed:', result.error);
          setError(result.error || 'Failed to process PDF');
          setIsProcessingPdf(false);
          setIsUploading(false);
          return;
        }
        // Increment PDF generation count for uploaded PDFs
        await incrementPdfDownload();
      }
      // Handle LinkedIn file upload
      if (linkedinFile) {
        // TODO: Implement LinkedIn .resume file processing
        console.log('Processing LinkedIn .resume file:', linkedinFile.name);
        // For now, just acknowledge the file
      }
      // Update resume metadata in Firestore
      const resumeRef = doc(db, 'resumes', resumeData.id);
      const updateData: any = {
        title: title.trim(),
        experience,
        isTargeted,
        updatedAt: serverTimestamp()
      };
      // Only update job_info if the targeting toggle has been changed from initial state
      // or if targeting is enabled and job fields have been modified
      if (isTargeted && (isTargeted !== resumeData.isTargeted || 
          jobTitle.trim() !== (resumeData.job_info?.title || '') ||
          companyName.trim() !== (resumeData.job_info?.company || '') ||
          jobDescription.trim() !== (resumeData.job_info?.description || ''))) {
        updateData.job_info = {
          // Preserve existing job_info structure including analysis data
          ...resumeData.job_info,
          // Only update the user-editable fields
          title: jobTitle.trim(),
          company: companyName.trim(),
          description: jobDescription.trim(),
          updated_at: new Date().toISOString()
        };
      } else if (!isTargeted && isTargeted !== resumeData.isTargeted) {
        // Only remove job_info if the user explicitly disabled targeting
        updateData.job_info = null;
      }
      // If no targeting changes were made, preserve existing job_info by not updating it
      await updateDoc(resumeRef, updateData);
      // Create updated resume data for callback
      const updatedResumeData: ResumeData = {
        ...resumeData,
        title: title.trim(),
        experience,
        isTargeted,
        job_info: isTargeted ? {
          title: jobTitle.trim(),
          company: companyName.trim(),
          description: jobDescription.trim()
        } : undefined
      };
      // Call the completion callback
      if (onUpdateComplete) {
        onUpdateComplete(updatedResumeData);
      }
      // Close modal after successful update
      if (!isProcessingPdf) {
        onClose();
      }
    } catch (err: any) {
      console.error('Error updating resume:', err);
      setError(err.message || 'Failed to update resume');
    } finally {
      if (!isProcessingPdf) {
        setIsUploading(false);
      }
    }
  };
  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800 backdrop-blur-sm rounded-lg w-full max-w-md shadow-2xl border border-slate-200 dark:border-gray-600 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-gray-600 sticky top-0 bg-white/95 dark:bg-gray-800 backdrop-blur-sm z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Update your resume</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {/* Resume Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase">
              Resume name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter here..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors font-semibold"
            />
          </div>
          {/* Experience */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase">
              Experience
            </label>
            <button
              onClick={() => setShowExperienceDropdown(!showExperienceDropdown)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-md text-left focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors flex items-center justify-between font-semibold"
            >
              <span className={experience ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                {experience || 'Select...'}
              </span>
              <ChevronDown className={`w-5 h-5 transition-transform text-gray-600 dark:text-gray-400 ${showExperienceDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showExperienceDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-md shadow-lg z-20 overflow-hidden backdrop-blur-sm">
                {experienceOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setExperience(option);
                      setShowExperienceDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white transition-colors font-semibold"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Import from LinkedIn */}
          <div>
            <button
              onClick={() => setShowLinkedInDropdown(!showLinkedInDropdown)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-md text-left text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between group"
            >
              <span className="text-sm font-medium uppercase">Import your resume from linkedin</span>
              <ChevronDown className={`w-5 h-5 transition-transform text-gray-600 dark:text-gray-400 ${showLinkedInDropdown ? 'rotate-180' : 'rotate-[-90deg]'}`} />
            </button>
            {showLinkedInDropdown && (
              <div className="mt-2 space-y-2">
                <div
                  onClick={() => linkedinFileInputRef.current?.click()}
                  className="w-full p-3 bg-slate-100 dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <input
                    ref={linkedinFileInputRef}
                    type="file"
                    accept=".rezi,.REZI"
                    onChange={(e) => handleFileChange(e, 'linkedin')}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                      {linkedinFile ? linkedinFile.name : 'Upload Profile.RESUME file'}
                    </span>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <a 
                      href="https://chrome.google.com/webstore/detail/profile-to-resume-reziai/delakdmnpanaclafnplfomddhlhlcloe" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Don&apos;t have a .resume file? Check out our free Chrome Extension{' '}
                      <strong className="text-blue-600 dark:text-blue-400">Profile 2 Resume</strong>{' '}
                      to import your LinkedIn profile.
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Import Existing Resume */}
          <div>
            <button
              onClick={() => setShowImportDropdown(!showImportDropdown)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-md text-left text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
            >
              <span className="text-sm font-medium uppercase">Import your existing resume</span>
              <ChevronDown className={`w-5 h-5 transition-transform text-gray-600 dark:text-gray-400 ${showImportDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showImportDropdown && (
              <div className="mt-2 space-y-2">
                {!isProcessingPdf ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      w-full p-3 border-2 border-slate-300 dark:border-gray-600 rounded-md cursor-pointer transition-all
                      ${isDragging
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'pdf')}
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                        {file ? file.name : 'Upload PDF, DOCx resume file'}
                      </span>
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-300 dark:border-gray-600 rounded-lg p-4 bg-slate-50 dark:bg-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{file?.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{file ? (file.size / 1024).toFixed(1) : '0'} KB</p>
                        </div>
                      </div>
                    </div>
                    <ResumeProcessingStatus
                      resumeId={resumeData.id}
                      onProcessingComplete={handleProcessingComplete}
                      onProcessingError={(errorMsg) => setError(errorMsg)}
                      showDetails={true}
                    />
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This process may take up to 60 seconds. Please be patient and keep this page open.
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-gray-600 my-4" />
          {/* Target Resume Toggle */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Target your resume</span>
              <button
                onClick={() => setIsTargeted(!isTargeted)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${isTargeted ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}
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
            {/* Job Details when targeted is enabled */}
            {isTargeted && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Enter here..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter here..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder=""
                    rows={6}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-slate-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                    style={{ minHeight: '172px' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-slate-200 dark:border-gray-600 sticky bottom-0 bg-white/95 dark:bg-gray-800 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors border border-slate-300 dark:border-gray-600 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isUploading || isProcessingPdf}
            className={`
              px-4 py-2 text-xs font-bold uppercase rounded-md transition-colors
              ${title.trim() && !isUploading && !isProcessingPdf
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isUploading ? 'Updating...' : isProcessingPdf ? 'Processing...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}