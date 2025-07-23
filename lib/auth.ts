import { NextRequest } from 'next/server';
import { connectionPool } from './server/cache/connection-pool';
import { deduplicate } from './server/cache/route-cache';

export async function auth(request?: NextRequest) {
  try {
    let token: string | undefined;
    
    if (request) {
      // Extract token from Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return null;
    }

    // Use cached token verification with deduplication
    const decodedToken = await deduplicate(
      `auth:${token}`,
      () => connectionPool.verifyToken(token as string)
    );
    
    if (!decodedToken) {
      return null;
    }

    return {
      user: {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        uid: decodedToken.uid
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}