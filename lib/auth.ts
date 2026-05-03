// Node.js runtime only — imports bcryptjs
import bcrypt from 'bcryptjs';
export { signJWT, verifyJWT } from './jwt';
export type { JWTPayload, Role } from './jwt';
import type { JWTPayload } from './jwt';
import { findAdminUserByEmail } from './passwordReset';

function emailToEnvKey(email: string): string {
  return email
    .toUpperCase()
    .replace(/@/g, '_AT_')
    .replace(/\./g, '_DOT_')
    .replace(/-/g, '_');
}

/** Look up user in env vars only (no I/O). */
function lookupEnvUser(email: string): { role: JWTPayload['role']; name: string; hash: string; clientId?: string } | null {
  const key = `USER_${emailToEnvKey(email)}`;
  const role = process.env[`${key}_ROLE`] as JWTPayload['role'] | undefined;
  const name = process.env[`${key}_NAME`];
  const hash = process.env[`${key}_HASH`];
  const clientId = process.env[`${key}_CLIENT_ID`];
  if (!role || !name || !hash) return null;
  return { role, name, hash, clientId };
}

export async function validateUser(
  email: string,
  password: string
): Promise<JWTPayload | null> {
  const normalEmail = email.toLowerCase().trim();

  // Check AdminUsers sheet first — takes precedence over env vars.
  // This allows password resets to work without modifying env vars at runtime.
  try {
    const sheetUser = await findAdminUserByEmail(normalEmail);
    if (sheetUser && sheetUser.passwordHash) {
      const valid = await bcrypt.compare(password, sheetUser.passwordHash);
      if (!valid) return null;
      const envUser = lookupEnvUser(normalEmail);
      return {
        email: normalEmail,
        name: sheetUser.name || envUser?.name || normalEmail,
        role: (sheetUser.role || envUser?.role || 'client') as JWTPayload['role'],
        clientId: envUser?.clientId,
      };
    }
  } catch {
    // Sheet unavailable — fall through to env vars
  }

  // Fallback: env var credentials
  const envUser = lookupEnvUser(normalEmail);
  if (!envUser) return null;

  const valid = await bcrypt.compare(password, envUser.hash);
  if (!valid) return null;

  return { email: normalEmail, name: envUser.name, role: envUser.role, clientId: envUser.clientId };
}

/** Check whether an email belongs to a known user (env vars OR sheet). Used by forgot-password. */
export async function userExists(email: string): Promise<{ name: string; role: string } | null> {
  const normalEmail = email.toLowerCase().trim();
  try {
    const sheetUser = await findAdminUserByEmail(normalEmail);
    if (sheetUser) return { name: sheetUser.name, role: sheetUser.role };
  } catch {
    // ignore
  }
  const envUser = lookupEnvUser(normalEmail);
  if (envUser) return { name: envUser.name, role: envUser.role };
  return null;
}
