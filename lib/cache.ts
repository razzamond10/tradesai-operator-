interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();

  async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttlMs: number): Promise<T> {
    const entry = this.store.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data as T;
    }
    const data = await fetchFn();
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
    return data;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}

export const sheetsCache = new TTLCache();
