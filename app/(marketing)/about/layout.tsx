import { Metadata } from 'next';
import { marketingMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = marketingMetadata.about;

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}