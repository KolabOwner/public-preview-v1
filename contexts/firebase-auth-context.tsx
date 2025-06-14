// contexts/firebase-auth-context.tsx - FIXED VERSION
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from 'firebase/auth';
import {
  onTokenChange,
  loginWithEmail,
  registerWithEmail,
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
} from '@/lib/firebase/auth';

export type AuthError = {
  code: string;
  message: string;
  customData?: { email?: string };
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  // Authentication methods
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
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

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = onTokenChange((user) => {
      setUser(user);
      setLoading(false);

      // Set up token refresh
      if (user) {
        // Force token refresh every 55 minutes (tokens expire after 1 hour)
        const interval = setInterval(() => {
          user.getIdToken(true).catch(console.error);
        }, 55 * 60 * 1000);

        return () => clearInterval(interval);
      }
    });

    return unsubscribe;
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

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      await registerWithEmail(email, password);
      if (displayName && user) {
        await updateUserProfile({ displayName });
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(getAuthErrorMessage(authError));
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await firebaseLogout();
      router.push('/auth/sign-in');
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

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useFirebaseAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading && !user) {
        router.push(`/auth/sign-in?from=${encodeURIComponent(pathname)}`);
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