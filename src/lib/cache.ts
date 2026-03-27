// Simple in-memory cache with TTL support
interface CacheItem<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private defaultTTL = 60 * 1000; // 1 minute default

  set<T>(key: string, data: T, ttlMs?: number): void {
    const expiry = Date.now() + (ttlMs || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get or set pattern
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}

// Cache keys helper
export const CacheKeys = {
  dashboardKPIs: (branchId?: string, date?: string) => 
    `dashboard:kpis:${branchId || 'all'}:${date || 'today'}`,
  branches: () => 'branches:all',
  products: (branchId?: string) => `products:${branchId || 'all'}`,
  categories: () => 'categories:all',
  paymentMethods: () => 'payment:methods',
  currencies: () => 'currencies:all',
  reportsSales: (startDate: string, endDate: string, branchId?: string) => 
    `reports:sales:${startDate}:${endDate}:${branchId || 'all'}`,
};
