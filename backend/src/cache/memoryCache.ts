/**
 * In-memory cache with TTL.
 * Simple, no external deps. Replace with Redis when scaling.
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    // Periodic cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton — 10 min default TTL for NSW API responses
export const cache = new MemoryCache(2000);

// Cache TTLs
export const CACHE_TTL = {
  ZONING: 24 * 60 * 60 * 1000,       // 24h — zoning rarely changes
  DA: 30 * 60 * 1000,                 // 30 min — DAs update throughout the day
  HAZARD: 7 * 24 * 60 * 60 * 1000,   // 7 days — hazard data is very static
  GEOCODE: 24 * 60 * 60 * 1000,      // 24h — addresses don't move
  CONNECTIVITY: 24 * 60 * 60 * 1000, // 24h — train stations don't move
} as const;
