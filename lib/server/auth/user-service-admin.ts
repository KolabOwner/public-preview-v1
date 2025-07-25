// lib/server/auth/user-service-admin.ts
// Server-side user service using Firebase Admin SDK
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import { UserProfile } from './user-service';

/**
 * Creates a new user document in Firestore using Firebase Admin SDK
 */
export async function createUserDocumentServer(
  userRecord: any, // Firebase Admin UserRecord
  additionalData?: Partial<UserProfile>
): Promise<void> {
  const userRef = adminDb.collection('users').doc(userRecord.uid);

  // Check if user document already exists
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    // Determine auth provider
    let authProvider: UserProfile['authProvider'] = 'email';
    if (userRecord.providerData && userRecord.providerData.length > 0) {
      const providerId = userRecord.providerData[0].providerId;
      if (providerId.includes('google')) authProvider = 'google';
      else if (providerId.includes('facebook')) authProvider = 'facebook';
      else if (providerId.includes('github')) authProvider = 'github';
    }

    // Extract name parts from displayName if available
    let firstName = '';
    let lastName = '';
    if (userRecord.displayName) {
      const nameParts = userRecord.displayName.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    const userData: UserProfile = {
      uid: userRecord.uid,
      email: userRecord.email!,
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || '',
      phoneNumber: userRecord.phoneNumber || '',
      firstName: additionalData?.firstName || firstName,
      lastName: additionalData?.lastName || lastName,
      bio: '',
      company: '',
      jobTitle: '',
      location: '',
      website: '',
      linkedIn: '',
      github: '',
      isProfileComplete: false,
      emailVerified: userRecord.emailVerified,
      createdAt: FieldValue.serverTimestamp() as any,
      updatedAt: FieldValue.serverTimestamp() as any,
      lastLoginAt: FieldValue.serverTimestamp() as any,
      authProvider,
      preferences: {
        theme: 'system',
        emailNotifications: true,
        marketingEmails: false,
      },
      subscription: {
        plan: 'free',
        status: 'active',
      },
      usage: {
        aiGenerations: 0,
        monthlyAiGenerations: 0,
        pdfGenerations: 0,
        lastResetDate: FieldValue.serverTimestamp() as any,
      },
      showFirstTimeOverlay: true,
      ...additionalData,
    };

    await userRef.set(userData);
    console.log('User document created successfully (server-side)');
  } else {
    // Update last login time if document exists
    await userRef.update({
      lastLoginAt: FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Updates a user document in Firestore using Firebase Admin SDK
 */
export async function updateUserDocumentServer(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const userRef = adminDb.collection('users').doc(uid);

  await userRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}