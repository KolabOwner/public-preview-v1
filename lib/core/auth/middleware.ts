// lib/firebase/middleware-helpers.ts
import { headers } from 'next/headers';
import { verifyIdToken } from "@/lib/core/auth/firebase-admin";

export interface AuthUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  role?: string;
}

// Get authenticated user from headers (for server components)
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const headersList = headers();
    const uid = headersList.get('x-user-id');
    const email = headersList.get('x-user-email');
    const role = headersList.get('x-user-role');

    if (!uid) return null;

    return {
      uid,
      email: email || undefined,
      role: role || 'user',
    };
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

// Verify Firebase ID token (for API routes)
export async function verifyAuthToken(request: Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) return null;

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      role: decodedToken.role || 'user',
    };
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}