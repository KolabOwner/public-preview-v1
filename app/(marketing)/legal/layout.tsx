import { Metadata } from 'next';
import { marketingMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = marketingMetadata.legal;

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}