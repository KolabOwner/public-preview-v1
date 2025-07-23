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
        description: error.message || 'Failed to download review. Please try again.',
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
      console.log('Review data:', data.review);
      
      toast({
        title: 'Review Loaded',
        description: 'Review details loaded successfully.',
      });
    } catch (error) {
      console.error('Error loading review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load review. Please try again.',
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No reviews yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't submitted any resumes for review.</p>
        <Button
          onClick={() => window.location.href = '/dashboard/review?tab=review-options'}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          Submit Your First Resume
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Review History ({reviews.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {review.resumeName}
                  </CardTitle>
                  {getStatusBadge(review.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Submitted: {formatDate(review.submittedDate)}
                  </div>
                  {review.completedDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4" />
                      Completed: {formatDate(review.completedDate)}
                    </div>
                  )}
                </div>

                {review.overallScore && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Overall Score: <span className="font-semibold text-blue-600">{review.overallScore}/10</span>
                    </p>
                  </div>
                )}

                {review.commentsCount !== undefined && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {review.commentsCount} review comments
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {review.status === 'COMPLETED' && (
                    <Button
                      size="sm"
                      onClick={() => handleDownloadReview(review.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                  {review.status === 'COMPLETED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReview(review.id)}
                      className="border-gray-300 dark:border-gray-600"
                    >
                      <Eye className="w-4 h-4 mr-1" />
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