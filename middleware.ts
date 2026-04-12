import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

const PUBLIC_PATHS = ['/', '/login', '/privacy', '/terms'];
const API_AUTH_PATHS = ['/api/auth'];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/api/auth')) return true;
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/logo')) return true;
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|mp3|webp|woff2?)$/)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get('tradesai_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const user = await verifyJWT(token);

  if (!user) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.set('tradesai_token', '', { maxAge: 0, path: '/' });
    return res;
  }

  // Role-based routing: redirect from root portal paths to correct home
  if (pathname === '/dashboard' || pathname === '/admin' || pathname === '/va') {
    if (pathname === '/admin' && user.role !== 'admin') {
      return NextResponse.redirect(new URL(roleHome(user.role), req.url));
    }
    if (pathname === '/va' && user.role !== 'va' && user.role !== 'admin') {
      return NextResponse.redirect(new URL(roleHome(user.role), req.url));
    }
    if (pathname === '/dashboard' && user.role !== 'client' && user.role !== 'admin') {
      return NextResponse.redirect(new URL(roleHome(user.role), req.url));
    }
  }

  return NextResponse.next();
}

function roleHome(role: string): string {
  if (role === 'admin') return '/admin';
  if (role === 'va') return '/va';
  return '/dashboard';
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
