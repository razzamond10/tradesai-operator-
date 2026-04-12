// Edge-runtime safe — only uses jose (web crypto), no bcrypt
import { SignJWT, jwtVerify } from 'jose';

export type Role = 'admin' | 'client' | 'va';

export interface JWTPayload {
  email: string;
  name: string;
  role: Role;
  clientId?: string;
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || 'tradesai-jwt-secret-2026'
  );
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
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
