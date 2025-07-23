import React from "react";
import { Metadata } from 'next';
import MainNavbar from '@/components/features/dashboard/main-navbar';

export const metadata: Metadata = {
  title: '36+ Professional Resume Examples by Industry & Experience Level | Kolab AI',
  description: 'Browse curated resume examples with detailed job descriptions, keywords, and experience levels. Find proven formats for programming, business, design, marketing, engineering, finance, legal, and medical careers. Search by skills and filter by experience level.',
  keywords: 'resume examples, professional resumes, job-specific resumes, resume templates, career guidance, resume formats, ATS-friendly resumes, resume inspiration, industry resume examples, experience level resumes',
  openGraph: {
    title: '36+ Professional Resume Examples by Industry & Experience Level',
    description: 'Browse curated resume examples with detailed job descriptions, keywords, and experience levels. Find proven formats for programming, business, design, marketing, and more.',
    type: 'website',
    siteName: 'Kolab AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: '36+ Professional Resume Examples by Industry & Experience Level',
    description: 'Browse curated resume examples with detailed job descriptions, keywords, and experience levels.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function ResumeExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      {children}
    </div>
  );
}