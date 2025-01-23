import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh the session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // List of public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/callback'];
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  if (!session && !isPublicRoute) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (session && isPublicRoute) {
    // Redirect authenticated users to home page if they try to access auth pages
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
