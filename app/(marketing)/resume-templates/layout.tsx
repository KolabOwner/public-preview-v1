import { Metadata } from 'next';
import { templateMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = templateMetadata.resumeTemplates;

export default function ResumeTemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}