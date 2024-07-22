import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/index';

export async function middleware(request: NextRequest) {
  const session = await getSession();

  // Redirect unauthenticated users trying to access non-login/register pages
  if (!session && !request.nextUrl.pathname.startsWith('/auth/login') && !request.nextUrl.pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Redirect authenticated users away from login/register pages to dashboard
  if (session && (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow request to proceed if no redirect condition was met
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
