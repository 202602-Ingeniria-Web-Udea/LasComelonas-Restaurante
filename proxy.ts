import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, decrypt } from '@/lib/session';

export async function proxy(request: NextRequest) {
  const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

// Solo las páginas privadas pasan por el proxy. La landing, el login y las API routes no.
export const config = {
  matcher: [
    '/orders/:path*',
    '/customers/:path*',
    '/products/:path*',
    '/transactions/:path*',
    '/masters/:path*',
    '/users/:path*',
  ],
};
