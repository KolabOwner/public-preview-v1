'use client';

import { FirebaseAuthProvider } from '@/contexts/firebase-auth-context';
import ProtectedRoute from '@/components/features/auth/protected-route';

export default function CoverLettersLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <FirebaseAuthProvider>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </FirebaseAuthProvider>
  );
}