// Edge-runtime safe — only uses jose (web crypto), no bcrypt
import { SignJWT, jwtVerify } from 'jose';

export type Role = 'admin' | 'client' | 'va';

export interface JWTPayload {
  email: string;
  name: string;
  role: Role;
  clientId?: string;
  planTier?: 'starter' | 'professional' | 'enterprise';
}

export const SESSION_DURATIONS = {
  short: 60 * 60 * 8,       // 8 hours  (default, no remember-me)
  long:  60 * 60 * 24 * 30, // 30 days  (remember-me)
} as const;

function getSecret(): Uint8Array {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET env var required in production');
  }
  return new TextEncoder().encode(
    process.env.JWT_SECRET || 'tradesai-jwt-secret-2026'
  );
}

export async function signJWT(
  payload: JWTPayload,
  durationSeconds: number = SESSION_DURATIONS.short,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + durationSeconds)
    .sign(getSecret());
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}
