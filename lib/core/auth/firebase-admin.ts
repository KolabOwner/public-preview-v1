// lib/firebase/admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
const initAdmin = () => {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin SDK environment variables');
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
};

// Initialize admin on module load
if (typeof window === 'undefined') {
  initAdmin();
}

// Export admin services
export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();

// Verify ID Token
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Create custom token
export async function createCustomToken(uid: string, claims?: object) {
  try {
    const token = await adminAuth.createCustomToken(uid, claims);
    return token;
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
}

// Set custom claims
export async function setCustomClaims(uid: string, claims: object) {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
    return true;
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const user = await adminAuth.getUserByEmail(email);
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Get user by UID
export async function getUserByUid(uid: string) {
  try {
    const user = await adminAuth.getUser(uid);
    return user;
  } catch (error) {
    console.error('Error getting user by UID:', error);
    return null;
  }
}

// Create user
export async function createUser(properties: {
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
}) {
  try {
    const user = await adminAuth.createUser(properties);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(uid: string, properties: {
  email?: string;
  password?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  disabled?: boolean;
}) {
  try {
    const user = await adminAuth.updateUser(uid, properties);
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete user
export async function deleteUser(uid: string) {
  try {
    await adminAuth.deleteUser(uid);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// List users
export async function listUsers(maxResults = 1000, pageToken?: string) {
  try {
    const listUsersResult = await adminAuth.listUsers(maxResults, pageToken);
    return listUsersResult;
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

// Revoke refresh tokens
export async function revokeRefreshTokens(uid: string) {
  try {
    await adminAuth.revokeRefreshTokens(uid);
    return true;
  } catch (error) {
    console.error('Error revoking refresh tokens:', error);
    throw error;
  }
}

// Generate email verification link
export async function generateEmailVerificationLink(email: string, actionCodeSettings?: any) {
  try {
    const link = await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);
    return link;
  } catch (error) {
    console.error('Error generating email verification link:', error);
    throw error;
  }
}

// Generate password reset link
export async function generatePasswordResetLink(email: string, actionCodeSettings?: any) {
  try {
    const link = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
    return link;
  } catch (error) {
    console.error('Error generating password reset link:', error);
    throw error;
  }
}

// Generate sign-in with email link
export async function generateSignInWithEmailLink(email: string, actionCodeSettings: any) {
  try {
    const link = await adminAuth.generateSignInWithEmailLink(email, actionCodeSettings);
    return link;
  } catch (error) {
    console.error('Error generating sign-in link:', error);
    throw error;
  }
}

// Session cookie management
export async function createSessionCookie(idToken: string, expiresIn: number) {
  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    return sessionCookie;
  } catch (error) {
    console.error('Error creating session cookie:', error);
    throw error;
  }
}

export async function verifySessionCookie(sessionCookie: string, checkRevoked = true) {
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, checkRevoked);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return null;
  }
}