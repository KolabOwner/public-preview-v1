// ==========================================
// Fixed contexts/auth-context.tsx - Bulletproof deduplication
// ==========================================

'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, AuthError } from 'firebase/auth';
import {
  onTokenChange,
  loginWithEmail,
  logout as firebaseLogout,
  signInWithProvider,
  googleProvider,
  facebookProvider,
  githubProvider,
  resetPassword as firebaseResetPassword,
  sendSignInLink,
  completeSignInWithEmailLink,
  updateUserProfile,
  updateUserEmail,
  changePassword as firebaseChangePassword,
  deleteAccount as firebaseDeleteAccount,
  setPersistenceLevel,
  getAuthErrorMessage,
} from '@/lib/client/api/auth-client';

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

    const unsubscribe = onTokenChange(async (user) => {
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
      if (remember) {
        await setPersistenceLevel('local');
      } else {
        await setPersistenceLevel('session');
      }
      await loginWithEmail(email, password);
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
      await firebaseLogout();
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
      await signInWithProvider(googleProvider);
      // User document creation is handled in the auth state listener
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
      await signInWithProvider(facebookProvider);
      // User document creation is handled in the auth state listener
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
      await signInWithProvider(githubProvider);
      // User document creation is handled in the auth state listener
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
      await firebaseResetPassword(email);
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      await firebaseChangePassword(currentPassword, newPassword);
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
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/email-link-complete`,
        handleCodeInApp: true,
      };
      await sendSignInLink(email, actionCodeSettings);
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const completeSignInWithLink = async (email: string, link: string) => {
    try {
      setError(null);
      await completeSignInWithEmailLink(email, link);
      router.push('/dashboard');
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  // Profile management
  const updateProfile = async (data: { displayName?: string; photoURL?: string }) => {
    try {
      setError(null);
      await updateUserProfile(data);
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const updateEmail = async (newEmail: string, password: string) => {
    try {
      setError(null);
      await updateUserEmail(newEmail, password);
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      setError(null);
      await firebaseDeleteAccount(password);
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
      if (!user) return null;
      return await user.getIdToken(forceRefresh);
    } catch (err) {
      console.error('Error getting ID token:', err);
      return null;
    }
  };

  // Get custom claims
  const getClaims = async () => {
    try {
      if (!user) return {};
      const tokenResult = await user.getIdTokenResult();
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
    updateProfile,
    updateEmail,
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