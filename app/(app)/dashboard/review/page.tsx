// File: app/dashboard/review/page.tsx
'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/tabs';
import ReviewOptionsTab from "./review-options-tab";
import MyReviewsTab from "./my-reviews-tab";


export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState('review-options');

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex items-center whitespace-nowrap rounded-xl border border-slate-200 dark:border-navy-700 w-fit h-fit bg-white/80 dark:bg-navy-800/90 backdrop-blur-sm shadow-lg p-1 gap-1 mb-8">
          <TabsTrigger
            value="review-options"
            className="rounded-xl inline-flex items-center gap-1 text-xs leading-4 h-8 px-4 font-bold uppercase tracking-wide transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-slate-800 data-[state=active]:shadow-md data-[state=inactive]:text-slate-700 dark:data-[state=inactive]:text-slate-300 data-[state=inactive]:hover:bg-slate-50 dark:data-[state=inactive]:hover:bg-navy-700 data-[state=inactive]:hover:text-slate-900 dark:data-[state=inactive]:hover:text-slate-100"
          >
            Review Options
          </TabsTrigger>
          <TabsTrigger
            value="my-reviews"
            className="rounded-xl inline-flex items-center gap-1 text-xs leading-4 h-8 px-4 font-bold uppercase tracking-wide transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-amber-500 data-[state=active]:text-slate-800 data-[state=active]:shadow-md data-[state=inactive]:text-slate-700 dark:data-[state=inactive]:text-slate-300 data-[state=inactive]:hover:bg-slate-50 dark:data-[state=inactive]:hover:bg-navy-700 data-[state=inactive]:hover:text-slate-900 dark:data-[state=inactive]:hover:text-slate-100"
          >
            My Reviews
          </TabsTrigger>
        </TabsList>

        {/* Header */}
        <div className="space-y-4 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100">
            One Step Away From A Perfect Resume
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300 max-w-4xl leading-relaxed">
            The Rezum Resume Review is your resume&#39;s last stop before being submitted for any job application.
            Often, we see talented job seekers create their resume with mistakes that might ruin an otherwise
            perfect resume. With the Rezum Resume Review, we will review your indicated resume directly in your dashboard.
          </p>
        </div>

        <TabsContent value="review-options" className="mt-8">
          <ReviewOptionsTab />
        </TabsContent>

        <TabsContent value="my-reviews" className="mt-8">
          <MyReviewsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}