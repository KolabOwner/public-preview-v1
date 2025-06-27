// src/app/dashboard/resumes/[resumeId]/cover-letter/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/lib/features/auth/firebase-config";
import { useAuth } from '@/contexts/auth-context';
import { useJobInfo } from '@/contexts/job-info-context';
import { JobInfoProvider } from '@/contexts/job-info-context';
import { useToast } from '@/components/hooks/use-toast';
import CoverLetterHeaderBar, {
  CoverLetterSettings,
  CoverLetterHeaderBarRef
} from '@/components/layout/cover-letter-header-bar';
import CoverLetterInputPanel, { CoverLetterParams } from "@/components/cover-letter/panels/cover-letter-input-panel";
import CoverLetterPreview from "@/components/cover-letter/cover-letter-preview";
import { generateCoverLetter } from '@/app/actions/cover-letter';
import { prepareResumeForCoverLetter } from '@/lib/utils/cover-letter-helpers';
import { generateResumePDFAsync } from '@/lib/features/pdf/pdf-generator';
import { AlertCircle, Lock } from 'lucide-react';
import UpgradeModal from '@/components/resume/modals/upgrade-modal';

interface CoverLetterData {
  salutation: string;
  opening: string;
  bodyParagraphs: string[];
  closing: string;
  signature: string;
  metadata?: {
    wordCount: number;
    readingTime: number;
    tone: string;
    strengthScore: number;
  };
}

function CoverLetterBuilderContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { jobInfo } = useJobInfo();
  const headerBarRef = useRef<CoverLetterHeaderBarRef>(null);

  const resumeId = params.resumeId as string;

  // State
  const [resumeData, setResumeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData | null>(null);
  const [recipientInfo, setRecipientInfo] = useState<{
    companyName: string;
    positionTitle: string;
  } | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Cover letter settings
  const [settings, setSettings] = useState<CoverLetterSettings>({
    fontFamily: 'Georgia',
    fontSize: 12,
    lineHeight: 1.5,
    textColor: '#000000',
    template: 'Professional'
  });

  // Load resume data
  useEffect(() => {
    const loadResumeData = async () => {
      if (!user || !resumeId) return;

      try {
        const resumeRef = doc(db, 'resumes', resumeId);
        const resumeSnapshot = await getDoc(resumeRef);

        if (resumeSnapshot.exists()) {
          const data = resumeSnapshot.data();
          setResumeData(data.parsedData || data);
        } else {
          toast({
            title: "Resume Not Found",
            description: "The requested resume could not be found.",
            variant: "destructive"
          });
          router.push('/dashboard/resumes');
        }
      } catch (error) {
        console.error('Error loading resume:', error);
        toast({
          title: "Error Loading Resume",
          description: "Unable to load resume data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadResumeData();
  }, [user, resumeId, router, toast]);

  // Check user subscription
  useEffect(() => {
    const checkUserSubscription = async () => {
      if (!user?.uid) return;
      
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/features/auth/firebase-config');
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const plan = userData.subscription?.plan || 'free';
          setUserPlan(plan);
          
          // Show upgrade modal for free users
          if (plan === 'free') {
            setShowUpgradeModal(true);
          }
        }
      } catch (error) {
        console.error('Failed to check user subscription:', error);
      }
    };

    checkUserSubscription();
  }, [user?.uid]);

  // Handler for setting changes
  const handleSettingChange = (key: keyof CoverLetterSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handler for template change
  const handleTemplateChange = async (template: string) => {
    setSettings(prev => ({ ...prev, template }));
    toast({
      title: "Template Changed",
      description: `Cover letter template changed to ${template}.`
    });
  };

  // Handler for generating cover letter
  const handleGenerateCoverLetter = async (params: CoverLetterParams) => {
    // Block free users from generating
    if (userPlan === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setIsGenerating(true);
      setRecipientInfo({
        companyName: params.companyName,
        positionTitle: params.positionTitle
      });

      // Prepare resume text for AI
      const resumeText = prepareResumeForCoverLetter(resumeData);
      const resumeSummary = resumeData.summary || '';

      // Call AI to generate cover letter
      const result = await generateCoverLetter({
        resumeText,
        resumeSummary,
        jobTitle: params.positionTitle,
        companyName: params.companyName,
        jobDescription: params.jobDescription,
        skillsHighlight: params.skillsHighlight,
        educationHighlight: params.educationHighlight,
        experienceHighlight: params.positionHighlight ? [params.positionHighlight] : undefined,
        tone: params.tone,
        length: params.length,
        includeCallToAction: params.includeCallToAction,
        targetKeywords: jobInfo?.extractedKeywords?.map(k => k.keyword).slice(0, 10)
      });

      // Set the generated cover letter
      setCoverLetter({
        salutation: result.sections.salutation,
        opening: result.sections.opening,
        bodyParagraphs: result.sections.bodyParagraphs,
        closing: result.sections.closing,
        signature: result.sections.signature,
        metadata: result.metadata
      });

      toast({
        title: "Cover Letter Generated",
        description: `Your cover letter has been generated successfully. (${result.metadata.wordCount} words, ${result.metadata.strengthScore}/100 strength score)`
      });

      // Show suggestions if any
      if (result.suggestions && result.suggestions.length > 0) {
        const improvementSuggestions = result.suggestions
          .filter(s => s.type === 'improvement')
          .slice(0, 3);

        if (improvementSuggestions.length > 0) {
          setTimeout(() => {
            toast({
              title: "Improvement Suggestions",
              description: improvementSuggestions.map(s => s.message).join('\n'),
              duration: 8000
            });
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate cover letter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler for downloading PDF
  const handleDownloadPDF = async () => {
    if (!coverLetter) {
      toast({
        title: "No Cover Letter",
        description: "Please generate a cover letter first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Format cover letter for PDF
      const coverLetterText = [
        coverLetter.salutation,
        '',
        coverLetter.opening,
        '',
        ...coverLetter.bodyParagraphs.map(p => p + '\n'),
        coverLetter.closing,
        '',
        coverLetter.signature,
        '',
        '',
        resumeData?.contact?.fullName || resumeData?.contactInfo?.fullName || 'Your Name'
      ].join('\n');

      // Create a temporary document for PDF generation
      const coverLetterDoc = {
        title: `Cover Letter - ${recipientInfo?.positionTitle || 'Position'} at ${recipientInfo?.companyName || 'Company'}`,
        template: settings.template.toLowerCase(),
        fontStyle: settings.fontFamily === 'Times New Roman' ? 'professional' : 'elegant',
        fontSize: settings.fontSize < 11 ? 'small' : settings.fontSize > 13 ? 'large' : 'medium',
        documentSettings: {
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          lineHeight: settings.lineHeight,
          textColor: settings.textColor,
          primaryColor: '#2563eb',
          sectionSpacing: 1,
          paperSize: 'Letter',
          margins: { top: 1, right: 1, bottom: 1, left: 1 },
          showIcons: false,
          showDividers: false,
          useIndent: false,
          viewAsPages: false,
          zoom: 100
        },
        parsedData: {
          contact: resumeData?.contact || resumeData?.contactInfo,
          coverLetter: coverLetterText
        }
      };

      const pdfBlob = await generateResumePDFAsync(coverLetterDoc);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cover_Letter_${recipientInfo?.companyName?.replace(/\s+/g, '_') || 'Company'}_${recipientInfo?.positionTitle?.replace(/\s+/g, '_') || 'Position'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Downloaded",
        description: "Your cover letter has been downloaded successfully."
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handler for downloading DOCX
  const handleDownloadDOCX = async () => {
    toast({
      title: "Coming Soon",
      description: "DOCX download will be available soon.",
      variant: "default"
    });
  };

  // Handle upgrade
  const handleUpgrade = async (planId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: planId,
          successUrl: `${window.location.origin}/dashboard/payment-success`,
          cancelUrl: `${window.location.origin}/dashboard/resumes/${resumeId}/cover-letter`,
        }),
      });
      
      const { sessionUrl } = await response.json();
      
      if (sessionUrl) {
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      toast({
        title: "Upgrade Failed",
        description: "Unable to process upgrade. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">No Resume Data</h3>
            <p className="text-yellow-700 mt-1">
              Unable to load resume data. Please go back and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Extract contact info from resume data - check rmsRawData first
  const contactInfo = resumeData.contact || resumeData.contactInfo || 
    (resumeData.rmsRawData ? {
      fullName: resumeData.rmsRawData.rms_contact_fullname,
      firstName: resumeData.rmsRawData.rms_contact_givennames,
      lastName: resumeData.rmsRawData.rms_contact_lastname,
      email: resumeData.rmsRawData.rms_contact_email,
      phone: resumeData.rmsRawData.rms_contact_phone,
      city: resumeData.rmsRawData.rms_contact_city,
      state: resumeData.rmsRawData.rms_contact_state,
      country: resumeData.rmsRawData.rms_contact_country,
      linkedin: resumeData.rmsRawData.rms_contact_linkedin,
    } : {});

  // Show upgrade modal for free users
  if (userPlan === 'free' && showUpgradeModal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            // Redirect to resumes page when closing modal
            router.push('/dashboard/resumes');
          }}
          onUpgrade={handleUpgrade}
        />
        
        {/* Background blur content */}
        <div className="filter blur-sm pointer-events-none">
          <div className="flex gap-6 p-6 max-w-[1800px] mx-auto">
            <div className="flex-1 flex flex-col">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="h-[800px] bg-white dark:bg-gray-800 rounded-lg shadow-xl" />
            </div>
            <div className="w-80 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex gap-6 p-6 max-w-[1800px] mx-auto">
        {/* Left Side - Cover Letter Preview with Header */}
        <div className="flex-1 flex flex-col">
          <CoverLetterHeaderBar
            ref={headerBarRef}
            settings={settings}
            onSettingChange={handleSettingChange}
            onDownloadPDF={handleDownloadPDF}
            onDownloadDOCX={handleDownloadDOCX}
            onTemplateChange={handleTemplateChange}
          />
          <div className="flex justify-center overflow-auto mt-4">
            <CoverLetterPreview
              coverLetter={coverLetter || undefined}
              contactInfo={contactInfo}
              recipientInfo={recipientInfo || undefined}
              settings={settings}
            />
          </div>
        </div>

        {/* Right Side - Input Panel */}
        <div className="w-80 flex-shrink-0">
          <CoverLetterInputPanel
            resumeData={resumeData}
            onGenerate={handleGenerateCoverLetter}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}

export default function CoverLetterBuilderPage() {
  const params = useParams();
  const { user } = useAuth();
  const resumeId = params.resumeId as string;

  if (!user?.uid || !resumeId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Please log in to access the cover letter builder.</p>
        </div>
      </div>
    );
  }

  return (
    <JobInfoProvider resumeId={resumeId} userId={user.uid}>
      <CoverLetterBuilderContent />
    </JobInfoProvider>
  );
}