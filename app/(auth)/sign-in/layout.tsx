import { Metadata } from 'next';
import { authMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = authMetadata.signIn;

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}