// app/api/auth/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/features/auth/api-middleware';
import { getUserByUid, updateUser as updateFirebaseUser } from '@/lib/features/auth/firebase-admin';
import { userService } from '@/lib/features/auth/services/user-service';

// Get current user
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get full user data from Firebase Admin
    const firebaseUser = await getUserByUid(user.uid);

    if (!firebaseUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      disabled: firebaseUser.disabled,
      metadata: firebaseUser.metadata,
      customClaims: firebaseUser.customClaims,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    );
  }
}

// Update user
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // Only allow certain fields to be updated
    const allowedUpdates: any = {};
    const firestoreUpdates: any = {};
    
    // Firebase Auth fields
    if (updates.displayName !== undefined) allowedUpdates.displayName = updates.displayName;
    if (updates.photoURL !== undefined) allowedUpdates.photoURL = updates.photoURL;
    
    // Firestore user document fields
    if (updates.showFirstTimeOverlay !== undefined) firestoreUpdates.showFirstTimeOverlay = updates.showFirstTimeOverlay;
    if (updates.firstName !== undefined) firestoreUpdates.firstName = updates.firstName;
    if (updates.lastName !== undefined) firestoreUpdates.lastName = updates.lastName;
    if (updates.bio !== undefined) firestoreUpdates.bio = updates.bio;
    if (updates.company !== undefined) firestoreUpdates.company = updates.company;
    if (updates.jobTitle !== undefined) firestoreUpdates.jobTitle = updates.jobTitle;
    if (updates.location !== undefined) firestoreUpdates.location = updates.location;
    if (updates.website !== undefined) firestoreUpdates.website = updates.website;
    if (updates.linkedIn !== undefined) firestoreUpdates.linkedIn = updates.linkedIn;
    if (updates.github !== undefined) firestoreUpdates.github = updates.github;

    // Update Firebase Auth if needed
    let updatedUser = await getUserByUid(user.uid);
    if (Object.keys(allowedUpdates).length > 0) {
      updatedUser = await updateFirebaseUser(user.uid, allowedUpdates);
    }

    // Update Firestore user document if needed
    if (Object.keys(firestoreUpdates).length > 0) {
      await userService.updateUserDocument(user.uid, firestoreUpdates);
    }

    return NextResponse.json({
      uid: updatedUser.uid,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      photoURL: updatedUser.photoURL,
      ...firestoreUpdates,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
