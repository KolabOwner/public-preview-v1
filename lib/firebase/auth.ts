// lib/firebase/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  linkWithCredential,
  AuthCredential,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  AuthError,
  deleteUser,
  ActionCodeSettings,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  fetchSignInMethodsForEmail,
  AuthProvider
} from 'firebase/auth';
import { auth } from './config';

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configure providers
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Auth Error codes
export const AUTH_ERROR_CODES = {
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
};

// Helper to get friendly error messages
export function getAuthErrorMessage(error: AuthError): string {
  return AUTH_ERROR_CODES[error.code as keyof typeof AUTH_ERROR_CODES] || error.message;
}

// Email/Password Authentication
export async function registerWithEmail(email: string, password: string, displayName?: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // Send verification email
    await sendEmailVerification(userCredential.user);
    
    return userCredential;
  } catch (error) {
    throw error as AuthError;
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    throw error as AuthError;
  }
}

// Social Authentication
export async function signInWithProvider(provider: AuthProvider) {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    const authError = error as AuthError;
    
    // Handle account exists with different credential
    if (authError.code === 'auth/account-exists-with-different-credential') {
      // Get sign-in methods for this email
      const email = authError.customData?.email as string;
      if (email) {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        throw new Error(`Please sign in with ${methods.join(' or ')} first, then link your accounts.`);
      }
    }
    throw authError;
  }
}

// Email Link Authentication
export async function sendSignInLink(email: string, actionCodeSettings: ActionCodeSettings) {
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save email locally to complete sign-in on same device
    window.localStorage.setItem('emailForSignIn', email);
  } catch (error) {
    throw error as AuthError;
  }
}

export async function completeSignInWithEmailLink(email: string, emailLink: string) {
  try {
    // Confirm the link is a sign-in with email link
    if (!isSignInWithEmailLink(auth, emailLink)) {
      throw new Error('Invalid sign-in link');
    }
    
    const result = await signInWithEmailLink(auth, email, emailLink);
    
    // Clear email from storage
    window.localStorage.removeItem('emailForSignIn');
    
    return result;
  } catch (error) {
    throw error as AuthError;
  }
}

// Password Management
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error as AuthError;
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user');
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  } catch (error) {
    throw error as AuthError;
  }
}

// Profile Management
export async function updateUserProfile(updates: { displayName?: string; photoURL?: string }) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    
    await updateProfile(user, updates);
  } catch (error) {
    throw error as AuthError;
  }
}

export async function updateUserEmail(newEmail: string, password: string) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user');
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Update email
    await updateEmail(user, newEmail);
    
    // Send verification to new email
    await sendEmailVerification(user);
  } catch (error) {
    throw error as AuthError;
  }
}

// Account Management
export async function deleteAccount(password: string) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user');
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Delete user
    await deleteUser(user);
  } catch (error) {
    throw error as AuthError;
  }
}

// Session Management
export async function setPersistenceLevel(remember: boolean) {
  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  } catch (error) {
    throw error as AuthError;
  }
}

// Sign Out
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    throw error as AuthError;
  }
}

// Auth State Observer
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Token Observer (includes token refresh)
export function onTokenChange(callback: (user: User | null) => void) {
  return onIdTokenChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Get ID Token
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

// Get ID Token Result (includes claims)
export async function getIdTokenResult(forceRefresh = false) {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    return await user.getIdTokenResult(forceRefresh);
  } catch (error) {
    console.error('Error getting ID token result:', error);
    return null;
  }
}

// Link accounts
export async function linkWithProvider(provider: AuthProvider) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    
    const result = await linkWithCredential(user, provider as any);
    return result;
  } catch (error) {
    throw error as AuthError;
  }
}