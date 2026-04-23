/**
 * Tier-gated API route example:
 *
 * import { withTierGuard } from '@/lib/apiAuth';
 * export const GET = withTierGuard('page.marketplace', async (req, session) => {
 *   const data = await fetchMarketplaceData(session.clientId);
 *   return Response.json(data);
 * });
 *
 * Admin role always bypasses the tier check.
 * Returns 401 if not logged in, 403 if tier insufficient.
 */

import { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { canAccess, requiredTierFor, type Tier } from '@/lib/tiers';
import type { JWTPayload } from '@/lib/jwt';

// ---------------------------------------------------------------------------
// getSession — read + verify the auth cookie, return payload or null
// ---------------------------------------------------------------------------
export async function getSession(req: Request | NextRequest): Promise<JWTPayload | null> {
  // NextRequest exposes .cookies; plain Request uses the Cookie header.
  let token: string | undefined;
  if ('cookies' in req && typeof (req as NextRequest).cookies?.get === 'function') {
    token = (req as NextRequest).cookies.get('tradesai_token')?.value;
  } else {
    const cookieHeader = req.headers.get('cookie') ?? '';
    const match = cookieHeader.match(/(?:^|;\s*)tradesai_token=([^;]+)/);
    token = match?.[1];
  }
  if (!token) return null;
  return verifyJWT(token);
}

// ---------------------------------------------------------------------------
// requireSession — getSession or throw 401 Response
// ---------------------------------------------------------------------------
export async function requireSession(req: Request | NextRequest): Promise<JWTPayload> {
  const session = await getSession(req);
  if (!session) throw Response.json({ error: 'Unauthorized' }, { status: 401 });
  return session;
}

// ---------------------------------------------------------------------------
// assertTierAccess — throw 403 Response if tier is insufficient
// ---------------------------------------------------------------------------
export function assertTierAccess(session: JWTPayload, featureKey: string): void {
  // Admin and VA roles bypass tier gates entirely.
  if (session.role === 'admin' || session.role === 'va') return;

  const tier = (session.planTier ?? 'starter') as Tier;
  if (!canAccess(tier, featureKey)) {
    throw Response.json(
      {
        error: 'Upgrade required',
        requiredTier: requiredTierFor(featureKey),
        featureKey,
      },
      { status: 403 }
    );
  }
}

// ---------------------------------------------------------------------------
// withTierGuard — HOC that composes requireSession + assertTierAccess
//
// Usage:
//   export const GET = withTierGuard('page.forecasting', async (req, session) => {
//     return Response.json({ data: ... });
//   });
// ---------------------------------------------------------------------------
type GuardedHandler = (req: NextRequest, session: JWTPayload) => Promise<Response>;

export function withTierGuard(featureKey: string, handler: GuardedHandler) {
  return async function (req: NextRequest): Promise<Response> {
    try {
      const session = await requireSession(req);
      assertTierAccess(session, featureKey);
      return await handler(req, session);
    } catch (err) {
      if (err instanceof Response) return err;
      console.error('[withTierGuard] Unhandled error:', err);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
