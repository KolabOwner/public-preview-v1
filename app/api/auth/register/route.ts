// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/server/auth/firebase-admin';
import { verifyRecaptcha } from '@/lib/server/recaptcha';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  recaptchaToken: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const { email, password, recaptchaToken } = validation.data;

    // Verify reCAPTCHA token
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'signup');

    if (!recaptchaResult.success) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed', details: recaptchaResult.errorCodes }, { status: 400 });
    }

    // Create user using Firebase Admin SDK
    try {
      const userRecord = await createUser({
        email,
        password,
        emailVerified: false, // Firebase Admin SDK does not send a verification email by default
      });

      // You might want to trigger a verification email here if needed
      // await adminAuth.generateEmailVerificationLink(email);
      // and then send it using an email service.

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