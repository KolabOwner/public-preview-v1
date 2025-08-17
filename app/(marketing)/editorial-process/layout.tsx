import { Metadata } from 'next';
import { marketingMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = marketingMetadata.editorialProcess;

export default function EditorialProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}