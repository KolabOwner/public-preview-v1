// File: components/dashboard/review/review-options-tab.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/shared/button';
import { Card, CardContent } from '@/components/shared/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/select';
import { Input } from '@/components/shared/input';
import { Label } from '@/components/shared/label';
import { Checkbox } from '@/components/shared/checkbox';
import { toast } from '@/lib/client/hooks/ui/use-toast';
import { Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/firebase-auth-context';
import FAQSection from "./faq-section";

interface Resume {
  id: string;
  name: string;
  title?: string;
  fileName?: string;
  displayName: string;
  updatedAt: string;
  isExample?: boolean;
}

export default function ReviewOptionsTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [preserveFormatting, setPreserveFormatting] = useState(false);

  useEffect(() => {
    loadUserResumes();
  }, [user]);

  const loadUserResumes = async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/users/${user.uid}/resumes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load resumes');
      }
      
      const data = await response.json();
      setResumes(data.resumes || []);
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
      setReviewerNotes('');
      setPreserveFormatting(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit resume for review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Review Form */}
      <div className="flex justify-center">
        <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-4 lg:p-6 w-full max-w-md">
          <CardContent className="p-0 space-y-4">
            {/* Resume Selection */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Select Resume For Review
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={selectedResume} onValueChange={setSelectedResume}>
                <SelectTrigger className="h-10 sm:h-12 font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Choose a resume to review" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">{resume.displayName}</span>
                          <span className="text-xs text-gray-500">Modified {resume.updatedAt}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reviewer Notes */}
            <div className="space-y-2">
              <Label htmlFor="reviewer-notes" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notes for reviewer
              </Label>
              <Input
                id="reviewer-notes"
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Explain anything you'd like us to know"
                className="h-10 sm:h-12 font-semibold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
              />
            </div>

            {/* Preserve Formatting */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="preserve-formatting"
                checked={preserveFormatting}
                onCheckedChange={setPreserveFormatting}
                className="w-6 h-6 border-2 border-gray-200 dark:border-gray-600"
              />
              <Label htmlFor="preserve-formatting" className="text-base font-normal text-gray-900 dark:text-gray-100">
                Preserve resume formatting
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitReview}
              disabled={loading || !selectedResume}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 focus:bg-blue-500 text-white font-bold uppercase h-10 rounded-md text-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
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
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="w-full">
        <FAQSection />
      </div>
    </div>
  );
}