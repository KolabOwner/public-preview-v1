import { Metadata } from 'next';
import { authMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = authMetadata.forgotPassword;

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}