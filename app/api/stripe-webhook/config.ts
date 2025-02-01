import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/stripe-webhook',
};
