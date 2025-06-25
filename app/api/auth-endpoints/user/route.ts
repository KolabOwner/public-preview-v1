// app/api/auth/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase/middleware-helpers';
import { getUserByUid, updateUser as updateFirebaseUser } from '@/lib/features/auth/firebase-admin';

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
    if (updates.displayName !== undefined) allowedUpdates.displayName = updates.displayName;
    if (updates.photoURL !== undefined) allowedUpdates.photoURL = updates.photoURL;

    const updatedUser = await updateFirebaseUser(user.uid, allowedUpdates);

    return NextResponse.json({
      uid: updatedUser.uid,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      photoURL: updatedUser.photoURL,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
