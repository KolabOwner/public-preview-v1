// lib/firebase/admin.ts

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin with enhanced error handling using JSON credentials
const initAdmin = () => {
  if (getApps().length === 0) {
    console.log('Firebase Admin SDK Initialization...');
    console.log('- System Time:', new Date().toISOString());

    try {
      // Use environment variables for Firebase Admin SDK credentials
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      if (!rawPrivateKey) {
        throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set');
      }

      // Clean and format the private key properly
      let privateKey = rawPrivateKey
        .replace(/\\n/g, '\n')  // Replace literal \n with actual newlines
        .replace(/"/g, '')      // Remove any quotes
        .trim();                // Remove extra whitespace

      // Ensure proper PEM format
      if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
        console.error('Private key does not start with proper PEM header');
        console.error('Private key preview:', privateKey.substring(0, 50) + '...');
        throw new Error('Invalid private key format - must start with -----BEGIN PRIVATE KEY-----');
      }

      if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
        console.error('Private key does not end with proper PEM footer');
        throw new Error('Invalid private key format - must end with -----END PRIVATE KEY-----');
      }

      console.log('✓ Private key format validation passed');

      if (!projectId || !clientEmail || !privateKey) {
        const missingVars = [];
        if (!projectId) missingVars.push('FIREBASE_PROJECT_ID');
        if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
        if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');
        
        throw new Error(`Missing Firebase Admin SDK environment variables: ${missingVars.join(', ')}`);
      }

      const credential = cert({
        projectId,
        clientEmail,
        privateKey,
      });

      console.log('✓ Firebase Admin SDK credentials loaded from environment variables');

      initializeApp({
        credential,
        projectId,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      
      console.log('✓ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('✗ Firebase Admin SDK initialization failed:', error);
      console.error('');
      console.error('Troubleshooting steps:');
      console.error('1. Verify FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables are set');
      console.error('2. Check that the service account has proper permissions in Firebase Console');
      console.error('3. Ensure system time is synchronized');
      throw error;
    }
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

// Test Firestore connection
export async function testFirestoreConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to get a reference to a test collection
    const testCollection = adminDb.collection('connection_test');
    const testDoc = testCollection.doc('test');
    
    // Try to write a test document
    await testDoc.set({
      timestamp: new Date(),
      test: true,
      message: 'Connection test successful'
    });
    
    console.log('✓ Firestore write test successful');
    
    // Try to read the document back
    const snapshot = await testDoc.get();
    
    if (snapshot.exists) {
      console.log('✓ Firestore read test successful');
      
      // Clean up test document
      await testDoc.delete();
      console.log('✓ Firestore delete test successful');
      
      return { 
        success: true, 
        details: {
          projectId: process.env.FIREBASE_PROJECT_ID,
          canWrite: true,
          canRead: true,
          canDelete: true
        }
      };
    } else {
      return { 
        success: false, 
        error: 'Document was written but could not be read back',
        details: { projectId: process.env.FIREBASE_PROJECT_ID }
      };
    }
  } catch (error) {
    console.error('✗ Firestore connection test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    const errorDetails = error && typeof error === 'object' && 'details' in error ? error.details : undefined;
    
    return { 
      success: false, 
      error: errorMessage,
      details: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        errorCode,
        errorDetails
      }
    };
  }
}