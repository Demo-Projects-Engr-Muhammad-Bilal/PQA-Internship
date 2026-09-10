class InMemoryRateLimiter {
  private cache: Map<string, { count: number; resetAt: number }>;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowSeconds: number) {
    this.cache = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
  }

  public async limit(identifier: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const record = this.cache.get(identifier);

    if (record) {
      if (now > record.resetAt) {
        // Window expired, reset
        this.cache.set(identifier, { count: 1, resetAt: now + this.windowMs });
        return { success: true, remaining: this.maxRequests - 1, reset: now + this.windowMs };
      }

      if (record.count >= this.maxRequests) {
        // Rate limited
        return { success: false, remaining: 0, reset: record.resetAt };
      }

      // Increment count
      record.count += 1;
      return { success: true, remaining: this.maxRequests - record.count, reset: record.resetAt };
    }

    // New record
    const resetAt = now + this.windowMs;
    this.cache.set(identifier, { count: 1, resetAt });

    // Clean up old entries periodically to prevent memory leaks
    if (this.cache.size > 10000) {
      this.cleanup(now);
    }

    return { success: true, remaining: this.maxRequests - 1, reset: resetAt };
  }

  private cleanup(now: number) {
    for (const [key, value] of this.cache.entries()) {
      if (now > value.resetAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Auth limiter: 5 requests per 60 seconds
export const authRateLimiter = new InMemoryRateLimiter(5, 60);

// General API limiter: 60 requests per 60 seconds
export const apiRateLimiter = new InMemoryRateLimiter(60, 60);
