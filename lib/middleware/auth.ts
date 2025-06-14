import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { API_ENDPOINTS, ERROR_MESSAGES } from '../constants';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email?: string;
    email_verified?: boolean;
    custom_claims?: Record<string, any>;
  };
}

interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requireVerifiedEmail?: boolean;
  requiredClaims?: string[];
  allowAnonymous?: boolean;
}

export async function withAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{ success: true; user: any } | { success: false; response: NextResponse }> {
  const {
    requireAuth = true,
    requireVerifiedEmail = false,
    requiredClaims = [],
    allowAnonymous = false,
  } = options;

  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (!requireAuth || allowAnonymous) {
        return { success: true, user: null };
      }
      
      return {
        success: false,
        response: NextResponse.json(
          { 
            success: false, 
            error: ERROR_MESSAGES.AUTH_REQUIRED,
            code: 'AUTH_REQUIRED'
          },
          { status: 401 }
        ),
      };
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            success: false, 
            error: 'Invalid authorization header format',
            code: 'INVALID_AUTH_HEADER'
          },
          { status: 401 }
        ),
      };
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check email verification if required
    if (requireVerifiedEmail && !decodedToken.email_verified) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            success: false, 
            error: 'Email verification required',
            code: 'EMAIL_NOT_VERIFIED'
          },
          { status: 403 }
        ),
      };
    }

    // Check required claims
    if (requiredClaims.length > 0) {
      const userClaims = decodedToken.custom_claims || {};
      const hasRequiredClaims = requiredClaims.every(claim => 
        userClaims[claim] === true
      );
      
      if (!hasRequiredClaims) {
        return {
          success: false,
          response: NextResponse.json(
            { 
              success: false, 
              error: 'Insufficient permissions',
              code: 'INSUFFICIENT_PERMISSIONS',
              required_claims: requiredClaims
            },
            { status: 403 }
          ),
        };
      }
    }

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        custom_claims: decodedToken.custom_claims || {},
      },
    };

  } catch (error) {
    console.error('Authentication error:', error);
    
    // Handle specific Firebase Auth errors
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return {
          success: false,
          response: NextResponse.json(
            { 
              success: false, 
              error: 'Token expired',
              code: 'TOKEN_EXPIRED'
            },
            { status: 401 }
          ),
        };
      }
      
      if (error.message.includes('invalid')) {
        return {
          success: false,
          response: NextResponse.json(
            { 
              success: false, 
              error: 'Invalid token',
              code: 'INVALID_TOKEN'
            },
            { status: 401 }
          ),
        };
      }
    }

    return {
      success: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: ERROR_MESSAGES.AUTH_REQUIRED,
          code: 'AUTH_ERROR'
        },
        { status: 401 }
      ),
    };
  }
}

export function createAuthenticatedHandler<T = any>(
  handler: (request: AuthenticatedRequest, user: any) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await withAuth(request, options);
    
    if (!authResult.success) {
      return authResult.response;
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = authResult.user;

    try {
      return await handler(authenticatedRequest, authResult.user);
    } catch (error) {
      console.error('Handler error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: ERROR_MESSAGES.GENERIC,
          code: 'HANDLER_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

export function requireAdmin(
  handler: (request: AuthenticatedRequest, user: any) => Promise<NextResponse>
) {
  return createAuthenticatedHandler(handler, {
    requireAuth: true,
    requireVerifiedEmail: true,
    requiredClaims: ['admin'],
  });
}

export function requireUser(
  handler: (request: AuthenticatedRequest, user: any) => Promise<NextResponse>
) {
  return createAuthenticatedHandler(handler, {
    requireAuth: true,
    requireVerifiedEmail: false,
  });
}