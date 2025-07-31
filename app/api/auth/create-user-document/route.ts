// app/api/auth/create-user-document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/server/auth/firebase-admin';
import { createUserDocumentServer } from '@/lib/server/auth/user-service-admin';

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get the user record from Firebase Auth
    const userRecord = await adminAuth.getUser(uid);

    // Create or update user document in Firestore
    await createUserDocumentServer(userRecord);

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error('Error creating user document:', error);
    return NextResponse.json({ error: 'Failed to create user document' }, { status: 500 });
  }
}