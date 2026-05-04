import { LRUCache } from 'lru-cache';

const WINDOW_MS = 900_000; // 15 minutes
const MAX_ATTEMPTS = 5;

export const loginLimiter = new LRUCache<string, { count: number }>({
  max: 1000,
  ttl: WINDOW_MS,
});

export function checkLimit(ip: string): { allowed: boolean; remaining: number; resetMs: number } {
  const entry = loginLimiter.get(ip);
  const count = entry?.count ?? 0;
  const resetMs = loginLimiter.getRemainingTTL(ip) || WINDOW_MS;
  return {
    allowed: count < MAX_ATTEMPTS,
    remaining: Math.max(0, MAX_ATTEMPTS - count),
    resetMs,
  };
}

export function incrementLimit(ip: string): void {
  const entry = loginLimiter.get(ip);
  if (!entry) {
    loginLimiter.set(ip, { count: 1 });
  } else {
    // Preserve remaining TTL so the window doesn't reset on each attempt
    const remaining = loginLimiter.getRemainingTTL(ip);
    loginLimiter.set(ip, { count: entry.count + 1 }, { ttl: remaining || WINDOW_MS });
  }
}

export function clearLimit(ip: string): void {
  loginLimiter.delete(ip);
}
