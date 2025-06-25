// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/features/auth/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      );
    }

    const decodedClaims = await verifySessionCookie(sessionCookie, true);

    if (!decodedClaims) {
      return NextResponse.json(
        { error: 'Invalid session cookie' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      emailVerified: decodedClaims.email_verified,
      claims: decodedClaims,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Session verification failed' },
      { status: 401 }
    );
  }
}
