// app/api/auth/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase/middleware-helpers';
import { listUsers } from '@/lib/firebase/admin';

// List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');

    const result = await listUsers(limit, pageToken);

    const users = result.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      metadata: user.metadata,
      customClaims: user.customClaims,
    }));

    return NextResponse.json({
      users,
      pageToken: result.pageToken,
    });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json(
      { error: 'Failed to list users' },
      { status: 500 }
    );
  }
}