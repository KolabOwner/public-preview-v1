// File: components/dashboard/review/review-options-tab.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/shared/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/select';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Checkbox } from '@/components/shared/checkbox';
import { toast } from '@/lib/client/hooks/ui/use-toast';
import { Loader2, FileText, ChevronDown, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from "@/config/firebase-config";
import FAQSection from "./faq-section";
import ResumePreview from '@/components/features/resume/panels/resume-preview';

interface Resume {
  id: string;
  title: string;
  lastUpdated: string;
  createdAt: string;
  displayName: string;
  isTargeted?: boolean;
}

interface TimingOption {
  id: string;
  duration: string;
  price: number;
  pricePerWord: number;
  badge?: string;
}

const TIMING_OPTIONS: TimingOption[] = [
  { id: '12hours', duration: '12 hours', price: 52.10, pricePerWord: 0.17, badge: 'Fastest' },
  { id: '1day', duration: '1 day', price: 43.04, pricePerWord: 0.14 },
  { id: '2days', duration: '2 days', price: 33.98, pricePerWord: 0.11 },
  { id: '3days', duration: '3 days', price: 22.65, pricePerWord: 0.08 },
  { id: '4days', duration: '4 days', price: 15.86, pricePerWord: 0.05 },
  { id: '5days', duration: '5 days', price: 11.33, pricePerWord: 0.04 },
];

export default function ReviewOptionsTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [selectedTiming, setSelectedTiming] = useState<string>('12hours');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [preserveFormatting, setPreserveFormatting] = useState(false);
  const [showCouponCode, setShowCouponCode] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [selectedResumeData, setSelectedResumeData] = useState<any>(null);
  const [loadingResumeData, setLoadingResumeData] = useState(false);

  useEffect(() => {
    loadUserResumes();
  }, [user]);

  const loadUserResumes = async () => {
    if (!user) return;

    try {
      // Use the same pattern as the resumes dashboard
      const resumesQuery = query(
        collection(db, 'resumes'),
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(resumesQuery);

      const resumeData: Resume[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        resumeData.push({
          id: doc.id,
          title: data.title || 'Untitled Resume',
          lastUpdated: data.updatedAt,
          createdAt: data.createdAt || data.updatedAt,
          displayName: data.title || 'Untitled Resume',
          isTargeted: data.isTargeted || false,
        });
      });

      setResumes(resumeData);
      console.log('Loaded resumes:', resumeData.length);
    } catch (error) {
      console.error('Error loading resumes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your resumes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedResume) {
      toast({
        title: 'Error',
        description: 'Please select a resume to review',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'Please sign in to submit a review',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const selectedOption = TIMING_OPTIONS.find(option => option.id === selectedTiming);
      const token = await user.getIdToken();
      const response = await fetch(`/api/resumes/${selectedResume}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerNotes: reviewerNotes.trim() || undefined,
          preserveFormatting,
          timing: selectedOption,
          couponCode: couponCode.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      const data = await response.json();

      toast({
        title: 'Success',
        description: data.message || 'Your resume has been submitted for review. You will receive an email notification when the review is complete.',
      });

      // Reset form
      setSelectedResume('');
      setSelectedTiming('12hours');
      setReviewerNotes('');
      setPreserveFormatting(false);
      setCouponCode('');
      setShowCouponCode(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit resume for review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadResumeData = async (resumeId: string) => {
    if (!resumeId) {
      setSelectedResumeData(null);
      return;
    }

    setLoadingResumeData(true);
    try {
      const resumeDoc = doc(db, 'resumes', resumeId);
      const resumeSnapshot = await getDoc(resumeDoc);

      if (resumeSnapshot.exists()) {
        setSelectedResumeData(resumeSnapshot.data());
      } else {
        setSelectedResumeData(null);
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
      setSelectedResumeData(null);
    } finally {
      setLoadingResumeData(false);
    }
  };

  const handleResumeSelection = (resumeId: string) => {
    setSelectedResume(resumeId);
    loadResumeData(resumeId);
  };

  // Helper function to process RMS data (same as preview page)
  const processRMSData = (rmsData: any) => {
    if (!rmsData) return null;

    const getRmsField = (field: string) => {
      if (rmsData[field] !== undefined) return rmsData[field] || '';
      const lowerField = field.replace('Rms_', 'rms_');
      if (rmsData[lowerField] !== undefined) return rmsData[lowerField] || '';
      const upperField = field.replace('rms_', 'Rms_');
      if (rmsData[upperField] !== undefined) return rmsData[upperField] || '';
      return '';
    };

    const processed: any = {
      contact: {
        firstName: getRmsField('rms_contact_givennames') || getRmsField('Rms_contact_firstName'),
        lastName: getRmsField('rms_contact_lastname') || getRmsField('Rms_contact_lastName'),
        fullName: getRmsField('rms_contact_fullname') || getRmsField('Rms_contact_fullName') || `${getRmsField('rms_contact_givennames') || getRmsField('Rms_contact_firstName')} ${getRmsField('rms_contact_lastname') || getRmsField('Rms_contact_lastName')}`.trim(),
        email: getRmsField('rms_contact_email') || getRmsField('Rms_contact_email'),
        phone: getRmsField('rms_contact_phone') || getRmsField('Rms_contact_phone'),
        city: getRmsField('rms_contact_city') || getRmsField('Rms_contact_city'),
        state: getRmsField('rms_contact_state') || getRmsField('Rms_contact_state'),
        country: getRmsField('rms_contact_country') || getRmsField('rms_contact_countrycode') || getRmsField('Rms_contact_country'),
        linkedin: getRmsField('rms_contact_linkedin') || getRmsField('Rms_contact_linkedin'),
      },
      summary: getRmsField('rms_summary') || getRmsField('Rms_summary'),
      experience: [],
      education: [],
      skills: [],
      projects: [],
    };

    // Process experience
    const expCount = parseInt(getRmsField('rms_experience_count') || getRmsField('Rms_experience_count') || '0');
    for (let i = 0; i < expCount; i++) {
      const exp = {
        company: getRmsField(`rms_experience_${i}_company`) || getRmsField(`Rms_experience_${i}_company`),
        position: getRmsField(`rms_experience_${i}_role`) || getRmsField(`rms_experience_${i}_position`) || getRmsField(`rms_experience_${i}_title`) || getRmsField(`Rms_experience_${i}_position`) || getRmsField(`Rms_experience_${i}_title`) || getRmsField(`Rms_experience_${i}_role`),
        location: getRmsField(`rms_experience_${i}_location`) || getRmsField(`Rms_experience_${i}_location`),
        dateBegin: getRmsField(`rms_experience_${i}_datebegin`) || getRmsField(`rms_experience_${i}_dateBegin`) || getRmsField(`rms_experience_${i}_startDate`) || getRmsField(`Rms_experience_${i}_dateBegin`) || getRmsField(`Rms_experience_${i}_startDate`),
        dateEnd: getRmsField(`rms_experience_${i}_dateend`) || getRmsField(`rms_experience_${i}_dateEnd`) || getRmsField(`rms_experience_${i}_endDate`) || getRmsField(`Rms_experience_${i}_dateEnd`) || getRmsField(`Rms_experience_${i}_endDate`),
        description: getRmsField(`rms_experience_${i}_description`) || getRmsField(`Rms_experience_${i}_description`),
        isCurrent: getRmsField(`rms_experience_${i}_iscurrent`) === true || getRmsField(`rms_experience_${i}_iscurrent`) === 'true' || getRmsField(`rms_experience_${i}_isCurrent`) === 'true' || getRmsField(`Rms_experience_${i}_isCurrent`) === 'true',
      };

      if (exp.company || exp.position || exp.description) {
        processed.experience.push(exp);
      }
    }

    return processed;
  };

  const selectedOption = TIMING_OPTIONS.find(option => option.id === selectedTiming) || TIMING_OPTIONS[0];

  return (
    <div className="flex w-full flex-col gap-4 self-stretch sm:w-full sm:gap-6 sm:px-0 md:w-[49.125rem] lg:w-[52rem] xl:w-[62rem] 2xl:w-[72rem]">
      <div className="w-full pb-10">
        <div className={`flex flex-col items-start justify-start gap-6 self-stretch p-0 ${selectedResume ? 'md:flex-row' : ''}`}>
          {/* Form Section */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm ${
            selectedResume 
              ? 'mx-auto w-full sm:mx-0 sm:w-full md:w-[23.5625rem] lg:w-[25rem] xl:w-[25rem] xl:max-w-[34rem] 2xl:w-[35rem]'
              : 'mx-auto max-w-md'
          }`}>
            <div className="flex flex-col gap-6">
              {/* Resume Selection */}
              <div className="space-y-2">
                <Label htmlFor="resume-select" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Select Resume For Review
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select value={selectedResume} onValueChange={handleResumeSelection}>
                  <SelectTrigger className="h-12 w-full font-semibold bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-colors">
                    <SelectValue placeholder="Choose a resume to review" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                    {resumes.map((resume) => (
                      <SelectItem
                        key={resume.id}
                        value={resume.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">{resume.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default State Info */}
              {!selectedResume && (
                <div className="space-y-4 text-center py-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Ready to get expert feedback?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                      Choose a resume above to see pricing options and get professional review feedback to improve your job applications.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center pt-4">
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">Expert</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Review</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">Fast</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Turnaround</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">Better</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Results</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timing Options - Only show when resume is selected */}
              {selectedResume && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    How fast do you need your review?
                  </Label>
                  <div className="space-y-2">
                    {TIMING_OPTIONS.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => setSelectedTiming(option.id)}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedTiming === option.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {selectedTiming === option.id ? (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                              {option.duration}
                            </span>
                            {option.badge && (
                              <span className="px-2 py-1 text-xs font-semibold bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded-full uppercase">
                                {option.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ${option.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ${option.pricePerWord.toFixed(2)} per word
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Options - Only show when resume is selected */}
              {selectedResume && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-500">
                  {/* Notes for reviewer */}
                  <div className="space-y-2">
                    <Label htmlFor="reviewer-notes" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Notes for reviewer
                    </Label>
                    <Input
                      id="reviewer-notes"
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      placeholder="Explain anything you'd like us to know"
                      className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    />
                  </div>

                  {/* Preserve Formatting */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="preserve-formatting"
                      checked={preserveFormatting}
                      onCheckedChange={(checked) => setPreserveFormatting(checked === true)}
                      className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label htmlFor="preserve-formatting" className="text-base font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                      Preserve resume formatting
                    </Label>
                  </div>

                  {/* Coupon Code Toggle */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCouponCode(!showCouponCode)}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline transition-colors"
                    >
                      Coupon/Redemption Code
                    </button>
                  </div>

                  {/* Coupon Code Input */}
                  {showCouponCode && (
                    <div className="space-y-2">
                      <Label htmlFor="coupon-code" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Coupon Code
                      </Label>
                      <Input
                        id="coupon-code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                      />
                    </div>
                  )}

                  {/* Continue Button */}
                  <Button
                    onClick={handleSubmitReview}
                    disabled={loading || !selectedResume}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 text-white font-bold uppercase text-sm transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Resume Preview - Only show when resume is selected */}
          {selectedResume && (
            <div className="mx-auto my-0 flex h-[33.8125rem] w-full flex-col items-center justify-center rounded-md bg-template-stroke p-4 sm:h-fit sm:w-full md:h-[34.3125rem] md:w-[24.0625rem] xl1:h-[39.5rem] xl1:w-[25.65rem] xl:h-[54rem] xl:w-[40rem] xl:min-w-[31rem] 2xl:max-h-[78rem] 2xl:w-[45rem] animate-in slide-in-from-right-5 duration-500">
            {loadingResumeData ? (
              <div className="bg-template-bg z-30 select-none h-full w-full flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="w-8 h-8 mb-4 animate-spin" />
                  <p className="text-lg font-medium">Loading preview...</p>
                </div>
              </div>
            ) : selectedResume && selectedResumeData ? (
              <div className="w-full h-full overflow-hidden flex items-start justify-center">
                <div
                  className="[&_.no-print]:hidden"
                  style={{
                    width: '8.5in',
                    height: '11in',
                    transform: 'scale(0.65)',
                    transformOrigin: 'top center'
                  }}
                >
                  <ResumePreview
                    resumeData={selectedResumeData.parsedData || processRMSData(selectedResumeData.rmsRawData) || selectedResumeData}
                    resumeId={selectedResume}
                    showJobPanels={false}
                    className="pointer-events-none"
                  />
                </div>
              </div>
            ) : selectedResume ? (
              <div className="bg-template-bg z-30 select-none h-full w-full flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <FileText className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Failed to load preview</p>
                </div>
              </div>
            ) : (
              <div className="bg-template-bg z-30 select-none h-full w-full flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <FileText className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Select a resume to preview</p>
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="flex flex-col pt-10 gap-2 self-stretch items-start w-full">
        <FAQSection />
      </div>
    </div>
  );
}