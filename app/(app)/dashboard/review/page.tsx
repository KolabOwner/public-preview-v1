// File: app/dashboard/review/page.tsx
'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/tabs';
import ReviewOptionsTab from "./review-options-tab";
import MyReviewsTab from "./my-reviews-tab";


export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState('review-options');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex items-center whitespace-nowrap rounded-md border border-gray-200 dark:border-gray-700 w-fit h-fit bg-white dark:bg-gray-800 p-1 gap-1 mb-6">
          <TabsTrigger
            value="review-options"
            className="rounded-md inline-flex items-center gap-1 text-xs leading-4 h-6 px-2 font-semibold uppercase data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:bg-gray-100 dark:data-[state=inactive]:hover:bg-gray-700 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-gray-100"
          >
            Review Options
          </TabsTrigger>
          <TabsTrigger
            value="my-reviews"
            className="rounded-md inline-flex items-center gap-1 text-xs leading-4 h-6 px-2 font-semibold uppercase data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:bg-gray-100 dark:data-[state=inactive]:hover:bg-gray-700 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-gray-100"
          >
            My Reviews
          </TabsTrigger>
        </TabsList>

        {/* Header */}
        <div className="space-y-2 pb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
            One Step Away From A Perfect Resume
          </h1>
          <p className="text-base text-gray-900 dark:text-gray-300 max-w-4xl">
            The Rezum Resume Review is your resume&#39;s last stop before being submitted for any job application.
            Often, we see talented job seekers create their resume with mistakes that might ruin an otherwise
            perfect resume. With the Rezum Resume Review, we will review your indicated resume directly in your dashboard.
          </p>
        </div>

        <TabsContent value="review-options" className="mt-6">
          <ReviewOptionsTab />
        </TabsContent>

        <TabsContent value="my-reviews" className="mt-6">
          <MyReviewsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}