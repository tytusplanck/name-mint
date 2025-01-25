import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only protect the API routes
  if (req.nextUrl.pathname.startsWith('/api/generate-names')) {
    // Allow the first 3 calls without authentication
    const freeUsageCount = parseInt(
      req.cookies.get('name_generator_usage')?.value || '0'
    );
    if (freeUsageCount >= 3 && !session) {
      return NextResponse.json(
        { error: 'Please create an account to continue generating names.' },
        { status: 401 }
      );
    }
  }

  if (req.nextUrl.pathname.startsWith('/api/create-payment-intent')) {
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required for payment' },
        { status: 401 }
      );
    }
  }

  return res;
}

export const config = {
  matcher: ['/api/generate-names', '/api/create-payment-intent'],
};
