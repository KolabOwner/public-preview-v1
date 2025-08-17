import { Metadata } from 'next';
import { aiToolsMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = aiToolsMetadata.resumeChecker;

export default function ResumeCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}