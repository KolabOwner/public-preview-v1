// ==========================================
// Fixed contexts/auth-context.tsx - Bulletproof deduplication
// ==========================================

'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, 
  AuthError,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  EmailAuthProvider,
  reauthenticateWithCredential,
  ActionCodeSettings
} from 'firebase/auth';
import { auth } from '@/config/firebase-config';

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

// Configure providers
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Auth Error codes
const AUTH_ERROR_CODES = {
  'auth/invalid-email': 'Invalid email address format.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/email-already-in-use': 'An account already exists with this email.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/requires-recent-login': 'Please sign in again to complete this action.'
} as const;

// Helper to get friendly error messages
function getAuthErrorMessage(error: AuthError): string {
  return AUTH_ERROR_CODES[error.code as keyof typeof AUTH_ERROR_CODES] || error.message;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  // Authentication methods
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Social login
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  // Password management
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  // Email link authentication
  sendSignInLink: (email: string) => Promise<void>;
  completeSignInWithLink: (email: string, link: string) => Promise<void>;
  // Profile management
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  updateEmail: (newEmail: string, password: string) => Promise<void>;
  // Account management
  deleteAccount: (password: string) => Promise<void>;
  // Token management
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  getClaims: () => Promise<any>;
  // Utility
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global tracking to prevent duplicate API calls across all component instances
// This is outside the component to ensure true singleton behavior
const globalUserDocumentPromises = new Map<string, Promise<void>>();
const globalUserDocumentCompleted = new Set<string>();
const globalProcessingUsers = new Set<string>();

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if this specific component instance has already processed a user
  const processedUsers = useRef<Set<string>>(new Set());
  const lastProcessedUid = useRef<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Helper function to ensure user document exists after social login
  const ensureUserDocument = async (user: User) => {
    // Immediate synchronous check to prevent race conditions
    if (globalProcessingUsers.has(user.uid)) {
      console.log('User document creation already being processed for:', user.uid);
      return globalUserDocumentPromises.get(user.uid);
    }

    // Check if we've already completed the document creation for this user
    if (globalUserDocumentCompleted.has(user.uid)) {
      console.log('User document already ensured for:', user.uid);
      return;
    }

    // Check if there's already a pending promise for this user
    const existingPromise = globalUserDocumentPromises.get(user.uid);
    if (existingPromise) {
      console.log('Returning existing promise for:', user.uid);
      return existingPromise;
    }

    // Mark as processing immediately to prevent race conditions
    globalProcessingUsers.add(user.uid);

    // Create a new promise for this user
    const documentPromise = (async () => {
      try {
        console.log('Creating user document for:', user.uid);

        // Add a small delay to debounce rapid calls
        await new Promise(resolve => setTimeout(resolve, 100));

        // Double-check after the delay
        if (globalUserDocumentCompleted.has(user.uid)) {
          console.log('User document was created by another call during delay');
          return;
        }

        const idToken = await user.getIdToken();
        console.log('Got ID token, calling API...');

        const response = await fetch('/api/auth/create-user-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('API response:', { status: response.status, data });

        if (!response.ok) {
          console.error('Failed to create user document:', data.error);
          // Don't throw error here to avoid disrupting the login flow
        } else {
          console.log('User document created successfully');
          // Mark this user as having their document created
          globalUserDocumentCompleted.add(user.uid);
        }
      } catch (error) {
        console.error('Error ensuring user document:', error);
        // Don't throw error here to avoid disrupting the login flow
      } finally {
        // Clean up the promise and processing flag
        globalUserDocumentPromises.delete(user.uid);
        globalProcessingUsers.delete(user.uid);
      }
    })();

    // Store the promise to prevent duplicate calls
    globalUserDocumentPromises.set(user.uid, documentPromise);

    return documentPromise;
  };

  // Initialize auth listener
  useEffect(() => {
    let mounted = true;
    let tokenRefreshInterval: NodeJS.Timeout | null = null;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!mounted) return;

      setUser(user);
      setLoading(false);

      // Clear interval if user logs out
      if (!user && tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
        tokenRefreshInterval = null;
        lastProcessedUid.current = null;
        return;
      }

      // Set up token refresh and ensure user document exists
      if (user) {
        // Only process if this is a different user or we haven't processed this user yet
        if (user.uid !== lastProcessedUid.current && !processedUsers.current.has(user.uid)) {
          console.log('Processing new user:', user.uid);
          lastProcessedUid.current = user.uid;
          processedUsers.current.add(user.uid);

          // Ensure user document is created (for social logins or any missing documents)
          try {
            await ensureUserDocument(user);
          } catch (error) {
            console.warn('Failed to ensure user document in auth listener:', error);
          }
        } else {
          console.log('Skipping user document creation - already processed:', user.uid);
        }

        // Set up token refresh if not already set
        if (!tokenRefreshInterval) {
          // Force token refresh every 55 minutes (tokens expire after 1 hour)
          tokenRefreshInterval = setInterval(() => {
            if (user) {
              user.getIdToken(true).catch(console.error);
            }
          }, 55 * 60 * 1000);
        }
      }
    });

    return () => {
      mounted = false;
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
      unsubscribe();
    };
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const login = async (email: string, password: string, remember = true) => {
    try {
      setError(null);
      const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // After successful registration, sign the user in
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      // Clear processed users on logout
      processedUsers.current.clear();
      lastProcessedUid.current = null;
      router.push('/sign-in');
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };


  const signInWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
      // User document creation is handled in the auth state listener
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const signInWithFacebook = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, facebookProvider);
      // User document creation is handled in the auth state listener
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const signInWithGithub = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, githubProvider);
      // User document creation is handled in the auth state listener
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('No authenticated user');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  // Email link authentication
  const sendSignInLinkToEmail = async (email: string) => {
    try {
      setError(null);
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/auth/email-link-complete`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save email locally to complete sign-in on same device
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email);
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const completeSignInWithLink = async (email: string, link: string) => {
    try {
      setError(null);
      // Confirm the link is a sign-in with email link
      if (!isSignInWithEmailLink(auth, link)) {
        throw new Error('Invalid sign-in link');
      }

      await signInWithEmailLink(auth, email, link);

      // Clear email from storage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('emailForSignIn');
      }

      router.push('/dashboard');
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  // Profile management
  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      await updateProfile(user, data);
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const updateUserEmail = async (newEmail: string, password: string) => {
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('No authenticated user');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Update email
      await updateEmail(user, newEmail);
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('No authenticated user');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete user
      await deleteUser(user);
      router.push('/');
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  // Token management
  const getIdToken = async (forceRefresh = false): Promise<string | null> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      return await currentUser.getIdToken(forceRefresh);
    } catch (err) {
      console.error('Error getting ID token:', err);
      return null;
    }
  };

  // Get custom claims
  const getClaims = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return {};
      const tokenResult = await currentUser.getIdTokenResult();
      return tokenResult?.claims || {};
    } catch (err) {
      console.error('Error getting claims:', err);
      return {};
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGithub,
    resetPassword,
    changePassword,
    sendSignInLink: sendSignInLinkToEmail,
    completeSignInWithLink,
    updateProfile: updateUserProfile,
    updateEmail: updateUserEmail,
    deleteAccount,
    getIdToken,
    getClaims,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading && !user) {
        router.push(`/sign-in?from=${encodeURIComponent(pathname)}`);
      }
    }, [user, loading, router, pathname]);

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}