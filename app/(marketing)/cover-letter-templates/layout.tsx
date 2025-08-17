import { Metadata } from 'next';
import { templateMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = templateMetadata.coverLetterTemplates;

export default function CoverLetterTemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}