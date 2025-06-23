// lib/core/auth/api-middleware.ts

import { verifyIdToken } from "@/lib/features/auth/firebase-admin";
import { NextRequest } from 'next/server';

export interface AuthUser {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  role?: string;
}

// Verify Firebase ID token for API routes
export async function verifyAuthToken(request: NextRequest | Request): Promise<AuthUser | null> {
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