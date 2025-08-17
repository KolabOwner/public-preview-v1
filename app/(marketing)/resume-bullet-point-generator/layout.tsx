import { Metadata } from 'next';
import { aiToolsMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = aiToolsMetadata.bulletPointGenerator;

export default function BulletPointGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}