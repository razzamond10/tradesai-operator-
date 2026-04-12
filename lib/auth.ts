// Node.js runtime only — imports bcryptjs
import bcrypt from 'bcryptjs';
export { signJWT, verifyJWT } from './jwt';
export type { JWTPayload, Role } from './jwt';
import type { JWTPayload } from './jwt';

function emailToEnvKey(email: string): string {
  return email
    .toUpperCase()
    .replace(/@/g, '_AT_')
    .replace(/\./g, '_DOT_')
    .replace(/-/g, '_');
}

export async function validateUser(
  email: string,
  password: string
): Promise<JWTPayload | null> {
  const key = `USER_${emailToEnvKey(email)}`;
  const role = process.env[`${key}_ROLE`] as JWTPayload['role'] | undefined;
  const name = process.env[`${key}_NAME`];
  const hash = process.env[`${key}_HASH`];
  const clientId = process.env[`${key}_CLIENT_ID`];

  if (!role || !name || !hash) return null;

  const valid = await bcrypt.compare(password, hash);
  if (!valid) return null;

  return { email, name, role, clientId };
}
