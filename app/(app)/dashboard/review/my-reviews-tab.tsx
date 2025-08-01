// File: components/dashboard/review/my-reviews-tab.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/card';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { FileText, Calendar, Clock, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { toast } from '@/lib/client/hooks/ui/use-toast';
import { useAuth } from '@/contexts/firebase-auth-context';
interface Review {
  id: string;
  resumeName: string;
  submittedDate: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  reviewerNotes?: string;
  completedDate?: string;
  overallScore?: number;
  commentsCount?: number;
}
const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
const statusLabels = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};
export default function MyReviewsTab() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadUserReviews();
  }, [user]);
  const loadUserReviews = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/users/${user.uid}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to load reviews');
      }
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your reviews. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadReview = async (reviewId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please sign in to download reviews',
        variant: 'destructive',
      });
      return;
    }
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/reviews/${reviewId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download review');
      }
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `review-${reviewId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Download Started',
        description: 'Your review PDF is being downloaded.',
      });
    } catch (error) {
      console.error('Error downloading review:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to download review. Please try again.',
        variant: 'destructive',
      });
    }
  };
  const handleViewReview = async (reviewId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please sign in to view reviews',
        variant: 'destructive',
      });
      return;
    }
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/reviews/${reviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load review');
      }
      const data = await response.json();
      // TODO: Open review in modal or navigate to review page

      
      toast({
        title: 'Review Loaded',
        description: 'Review details loaded successfully.',
      });
    } catch (error) {
      console.error('Error loading review:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load review. Please try again.',
        variant: 'destructive',
      });
    }
  };
  const getStatusBadge = (status: Review['status']) => {
    return (
      <Badge className={`${statusColors[status]} border-none`}>
        {status === 'COMPLETED' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'PROCESSING' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'FAILED' && <AlertCircle className="w-3 h-3 mr-1" />}
        {statusLabels[status]}
      </Badge>
    );
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5b7cfd]"></div>
          <div className="absolute inset-0 rounded-full bg-[#5b7cfd]/20 blur-xl animate-pulse"></div>
        </div>
      </div>
    );
  }
  if (reviews.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-navy-700 p-12 text-center shadow-2xl shadow-slate-300/30 dark:shadow-navy-900/50">
        <FileText className="w-20 h-20 text-slate-400 dark:text-slate-500 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">No reviews yet</h3>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">You haven&apos;t submitted any resumes for review yet.</p>
        <Button
          onClick={() => window.location.href = '/dashboard/review?tab=review-options'}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
        >
          Submit Your First Resume
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Review History ({reviews.length})
        </h2>
      </div>
      <div className="grid gap-6">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm border-slate-200 dark:border-navy-700 shadow-2xl shadow-slate-300/30 dark:shadow-navy-900/50 rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    {review.resumeName}
                  </CardTitle>
                  {getStatusBadge(review.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 text-base text-slate-600 dark:text-slate-400 font-medium">
                    <Calendar className="w-5 h-5" />
                    Submitted: {formatDate(review.submittedDate)}
                  </div>
                  {review.completedDate && (
                    <div className="flex items-center gap-3 text-base text-slate-600 dark:text-slate-400 font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Completed: {formatDate(review.completedDate)}
                    </div>
                  )}
                </div>
                {review.overallScore && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-green-500">
                    <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">
                      Overall Score: <span className="font-bold text-green-600 dark:text-green-400 text-xl">{review.overallScore}/10</span>
                    </p>
                  </div>
                )}
                {review.commentsCount !== undefined && (
                  <div className="mb-6">
                    <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
                      {review.commentsCount} review comments
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  {review.status === 'COMPLETED' && (
                    <Button
                      size="sm"
                      onClick={() => handleDownloadReview(review.id)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {review.status === 'COMPLETED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReview(review.id)}
                      className="border-slate-300 dark:border-navy-600 bg-white/80 dark:bg-navy-800/80 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-navy-700 font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}