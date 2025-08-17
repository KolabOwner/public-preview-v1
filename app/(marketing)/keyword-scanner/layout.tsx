import { Metadata } from 'next';
import { aiToolsMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = aiToolsMetadata.keywordScanner;

export default function KeywordScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}