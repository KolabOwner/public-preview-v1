import { Metadata } from 'next';
import { authMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = authMetadata.verifyEmail;

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}