import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

const PUBLIC_PATHS = ['/', '/login', '/privacy', '/terms', '/cookies'];
const API_AUTH_PATHS = ['/api/auth'];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/api/auth')) return true;
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/logo')) return true;
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|mp3|webp|woff2?)$/)) return true;
  return false;
}

// Paths that belong to the portal app (not marketing content)
function isAppPath(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return true;
  if (pathname.startsWith('/dashboard')) return true;
  if (pathname.startsWith('/va')) return true;
  if (pathname.startsWith('/login')) return true;
  if (pathname.startsWith('/api')) return true;
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/logo')) return true;
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|mp3|webp|woff2?)$/)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Hostname-based routing ──────────────────────────────────────────────────
  const hostname = req.headers.get('host') || '';
  const isMarketingDomain = hostname === 'tradesaioperator.uk' || hostname === 'www.tradesaioperator.uk';
  const isAppDomain = hostname === 'app.tradesaioperator.uk';
  const isPreview = hostname.includes('vercel.app') || hostname.includes('localhost');

  if (!isPreview) {
    if (isMarketingDomain) {
      // App routes visited on the marketing domain → redirect to app subdomain
      if (
        pathname.startsWith('/admin') ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/va') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/auth')
      ) {
        return NextResponse.redirect(`https://app.tradesaioperator.uk${pathname}`);
      }
      // Marketing content (landing, privacy, terms, assets) → serve directly, no JWT needed
      return NextResponse.next();
    }

    if (isAppDomain) {
      // Marketing content visited on the app subdomain → redirect to login
      if (!isAppPath(pathname)) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
  }
  // ── End hostname routing ────────────────────────────────────────────────────

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

  // Block /admin/** for non-admin users
  if (pathname.startsWith('/admin') && user.role !== 'admin') {
    return NextResponse.redirect(new URL(roleHome(user.role), req.url));
  }

  // Block /va/** for non-va, non-admin users
  if (pathname.startsWith('/va') && user.role !== 'va' && user.role !== 'admin') {
    return NextResponse.redirect(new URL(roleHome(user.role), req.url));
  }

  // Block /dashboard/** for non-client, non-admin users
  if (pathname.startsWith('/dashboard') && user.role !== 'client' && user.role !== 'admin') {
    return NextResponse.redirect(new URL(roleHome(user.role), req.url));
  }

  // Block /api/clients/** for non-admin users
  if (pathname.startsWith('/api/clients') && user.role !== 'admin') {
    return NextResponse.redirect(new URL(roleHome(user.role), req.url));
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
