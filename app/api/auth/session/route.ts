// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, verifySessionCookie } from '@/lib/firebase/admin';

// Create session cookie from ID token
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Set session expiration to 14 days
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days in milliseconds

    try {
      // Create the session cookie
      const sessionCookie = await createSessionCookie(idToken, expiresIn);

      // Set cookie options
      const options = {
        maxAge: expiresIn / 1000, // Convert to seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
      };

      // Create response with cookie
      const response = NextResponse.json({ status: 'success' });
      response.cookies.set('__session', sessionCookie, options);

      return response;
    } catch (error: any) {
      console.error('Session creation error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create session' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Session endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clear session cookie
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ status: 'success' });

  // Clear the session cookie
  response.cookies.set('__session', '', {
    maxAge: 0,
    path: '/',
  });

  return response;
}