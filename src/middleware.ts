/**
 * Next.js Edge Middleware — server-side route protection.
 *
 * Runs before every request that matches the config.matcher pattern.
 * If the session cookie is absent the user is redirected to the login page.
 * This is a UX gate, not a security boundary — real authorization is
 * enforced by the FastAPI backend on every request.
 *
 * Why ssb_logged_in instead of refresh_token?
 *   The refresh_token is httpOnly and set by the FastAPI backend (a different
 *   origin in development).  Browsers do not reliably include cross-origin
 *   cookies in requests to the Next.js server, so middleware cannot depend on
 *   it.  ssb_logged_in is a non-httpOnly cookie set explicitly by the frontend
 *   after a successful login — it is guaranteed to be present in every
 *   same-origin request to Next.js.
 */
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only gate /app/* routes.
  if (!pathname.startsWith('/app')) {
    return NextResponse.next();
  }

  // Allow requests that already carry the session indicator cookie.
  const session = request.cookies.get('ssb_logged_in');
  if (session?.value) {
    return NextResponse.next();
  }

  // No session cookie — redirect to login, preserving the intended destination.
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
