/**
 * Next.js Edge Middleware — server-side route protection.
 *
 * Runs before every request that matches the config.matcher pattern.
 * If the refresh-token cookie is absent the user is redirected to the
 * login page.  This is a UX gate, not a security boundary — real
 * authorization is enforced by the FastAPI backend on every request.
 *
 * Why refresh_token and not access_token?
 *   The access token lives in sessionStorage (client-only).  Middleware
 *   runs at the edge / server and cannot read sessionStorage.  The
 *   refresh token is stored in an httpOnly cookie, which IS available in
 *   middleware via request.cookies.
 */
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only gate /app/* routes.
  if (!pathname.startsWith('/app')) {
    return NextResponse.next();
  }

  // Allow requests that already have a refresh token cookie.
  const refreshToken = request.cookies.get('refresh_token');
  if (refreshToken?.value) {
    return NextResponse.next();
  }

  // No refresh token — redirect to login, preserving the intended destination.
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/auth/login';
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all /app/* routes.
     * Exclude Next.js internals and static assets so the middleware does
     * not fire on every _next/static or _next/image request.
     */
    '/app/:path*',
  ],
};
