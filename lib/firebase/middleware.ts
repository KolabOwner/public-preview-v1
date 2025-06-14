// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie
  const sessionCookie = request.cookies.get('__session')?.value;

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // For protected routes, verify authentication
  if (isProtectedRoute || isAdminRoute) {
    if (!sessionCookie) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify the session cookie
      const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `__session=${sessionCookie}`
        }
      });

      if (!response.ok) {
        // Invalid session, redirect to login
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const data = await response.json();

      // Check admin access
      if (isAdminRoute && data.claims?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Add user data to headers for server components
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', data.uid);
      requestHeaders.set('x-user-email', data.email || '');
      requestHeaders.set('x-user-role', data.claims?.role || 'user');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Middleware auth error:', error);
      // On error, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && sessionCookie) {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `__session=${sessionCookie}`
        }
      });

      if (response.ok) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // If verification fails, allow access to auth pages
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes should be accessible)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     * - root (/) - allow access to landing page
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|$).*)',
  ],
};