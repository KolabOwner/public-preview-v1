'use client';

import { AuthProvider } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/auth/protected-route';

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