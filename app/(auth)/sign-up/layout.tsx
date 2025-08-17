import { Metadata } from 'next';
import { authMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = authMetadata.signUp;

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}