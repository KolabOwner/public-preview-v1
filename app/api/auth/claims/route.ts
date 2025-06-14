// app/api/auth/claims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase/middleware-helpers';
import { setCustomClaims } from '@/lib/firebase/admin';

// Set custom claims (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { uid, claims } = await request.json();

    if (!uid || !claims) {
      return NextResponse.json(
        { error: 'UID and claims are required' },
        { status: 400 }
      );
    }

    await setCustomClaims(uid, claims);

    return NextResponse.json({
      status: 'success',
      message: 'Custom claims updated successfully'
    });
  } catch (error) {
    console.error('Set claims error:', error);
    return NextResponse.json(
      { error: 'Failed to set custom claims' },
      { status: 500 }
    );
  }
}
