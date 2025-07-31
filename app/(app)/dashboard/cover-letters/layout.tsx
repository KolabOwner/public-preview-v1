'use client';

import { AuthProvider } from '@/contexts/firebase-auth-context';
import ProtectedRoute from '@/components/features/auth/protected-route';

export default function CoverLettersLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </AuthProvider>
  );
}