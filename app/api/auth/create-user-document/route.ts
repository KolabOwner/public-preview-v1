// app/api/auth/create-user-document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/server/auth/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Creates a user document using a Firestore transaction to prevent duplicates
 * This ensures atomic operation even with multiple concurrent requests
 */
async function createUserDocumentWithTransaction(userRecord: any) {
  const userRef = adminDb.collection('users').doc(userRecord.uid);

  try {
    const result = await adminDb.runTransaction(async (transaction) => {
      // First, check if the document already exists
      const userDoc = await transaction.get(userRef);

      if (userDoc.exists) {
        console.log('User document already exists in transaction check');
        return {
          created: false,
          exists: true,
          message: 'User document already exists'
        };
      }

      // Extract names from displayName if available
      const displayName = userRecord.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Determine auth provider
      const authProvider = userRecord.providerData?.[0]?.providerId?.replace('.com', '') || 'email';

      // Prepare user data
      const userData = {
        // Basic user info
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || null,
        photoURL: userRecord.photoURL || null,
        phoneNumber: userRecord.phoneNumber || null,

        // Auth state
        emailVerified: userRecord.emailVerified || false,
        disabled: userRecord.disabled || false,

        // Profile fields
        firstName: firstName,
        lastName: lastName,
        bio: '',
        company: '',
        jobTitle: '',
        location: '',
        website: '',
        linkedIn: '',
        github: '',
        isProfileComplete: false,

        // Auth provider
        authProvider: authProvider,

        // Timestamps
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),

        // Metadata
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
          lastRefreshTime: userRecord.metadata.lastRefreshTime || null,
        },

        // Custom claims (roles, permissions, etc.)
        customClaims: userRecord.customClaims || {},

        // Provider information
        providers: userRecord.providerData.map((provider: any) => ({
          providerId: provider.providerId,
          uid: provider.uid,
          displayName: provider.displayName || null,
          email: provider.email || null,
          photoURL: provider.photoURL || null,
        })),

        // Onboarding and preferences
        onboardingCompleted: false,
        showFirstTimeOverlay: true, // Key field for showing onboarding!
        preferences: {
          theme: 'system',
          emailNotifications: true,
          marketingEmails: false,
        },

        // Subscription info
        subscription: {
          plan: 'free',
          status: 'active',
        },

        // Usage tracking
        usage: {
          aiGenerations: 0,
          monthlyAiGenerations: 0,
          pdfGenerations: 0,
          lastResetDate: FieldValue.serverTimestamp(),
        },
      };

      // Create the document within the transaction
      transaction.set(userRef, userData);

      console.log('User document created successfully in transaction');
      return {
        created: true,
        exists: false,
        message: 'User document created successfully'
      };
    });

    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Create user document API called');

    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid auth header');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('ID token extracted, length:', idToken.length);

    // Verify the ID token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error: any) {
      console.error('Token verification failed:', error.code);

      if (error.code === 'auth/id-token-expired') {
        return NextResponse.json(
          { error: 'Token expired', code: 'TOKEN_EXPIRED' },
          { status: 401 }
        );
      }

      if (error.code === 'auth/id-token-revoked') {
        return NextResponse.json(
          { error: 'Token revoked', code: 'TOKEN_REVOKED' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    console.log('Token verified for user:', uid);

    // Get the user record from Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.getUser(uid);
      console.log('User record retrieved:', userRecord.email);
    } catch (error: any) {
      console.error('Failed to get user record:', error);
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Create or check user document using transaction
    const result = await createUserDocumentWithTransaction(userRecord);
    console.log('Transaction result:', result);

    // If you need to call your existing createUserDocumentServer function
    // for additional processing (e.g., sending welcome email), do it here
    // but only if the document was actually created
    if (result.created) {
      try {
        // Optional: Call your existing service for additional processing
        // await createUserDocumentServer(userRecord);
        console.log('Additional user setup completed');
      } catch (error) {
        // Log but don't fail the request since document is already created
        console.error('Additional user setup failed:', error);
      }
    }

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      ...result
    });

  } catch (error: any) {
    console.error('Error in create user document endpoint:', error);

    // Handle Firestore-specific errors
    if (error.code === 'unavailable') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable', code: 'SERVICE_UNAVAILABLE' },
        { status: 503 }
      );
    }

    if (error.code === 'deadline-exceeded') {
      return NextResponse.json(
        { error: 'Request timeout', code: 'TIMEOUT' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create user document', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}