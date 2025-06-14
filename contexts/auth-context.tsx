// contexts/auth-context.tsx
// This file is kept for backward compatibility
// It re-exports from firebase-auth-context.tsx
'use client';

import {
  FirebaseAuthProvider,
  useFirebaseAuth,
  withAuth
} from './firebase-auth-context';

// Provide compatibility with any code still using AuthProvider
export const AuthProvider = FirebaseAuthProvider;

// Provide compatibility with any code still using useAuth
export const useAuth = useFirebaseAuth;

// Re-export withAuth
export { withAuth };

// Default export for AuthProvider for backwards compatibility
export default FirebaseAuthProvider;