import React from "react";
import { Metadata } from 'next';
import { templateMetadata } from '@/lib/page-metadata';
import MainNavbar from '@/components/features/dashboard/main-navbar';

export const metadata: Metadata = templateMetadata.resumeExamples;

export default function ResumeExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNavbar />
      {children}
    </>
  );
}