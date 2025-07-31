// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUser, adminAuth } from '@/lib/server/auth/firebase-admin';
import { createUserDocumentServer } from '@/lib/server/auth/user-service-admin';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { email, password } = validation.data;
    
    // Note: reCAPTCHA Enterprise validation is done client-side before calling this API

    // Create user using Firebase Admin SDK
    try {
      const userRecord = await createUser({
        email,
        password,
        emailVerified: false, // Firebase Admin SDK does not send a verification email by default
      });

      // Create a user document in Firestore with complete profile
      await createUserDocumentServer(userRecord);

      return NextResponse.json({ success: true, uid: userRecord.uid });
    } catch (error: any) {
      // Handle Firebase Admin SDK errors (e.g., email already exists)
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'An account already exists with this email.' }, { status: 409 });
      }
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Registration endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}