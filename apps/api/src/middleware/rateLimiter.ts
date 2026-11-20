import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

interface RateLimitRecord {
  timestamps: number[];
}

export interface RateLimiterOptions {
  windowMs: number; // e.g. 60_000 (1 minute)
  maxRequests: number; // e.g. 60
  message?: string;
  skipInTests?: boolean;
}

export function createSlidingWindowRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests. Please slow down and try again later.',
    skipInTests = false,
  } = options;

  const ipStore = new Map<string, RateLimitRecord>();

  // Cleanup old records periodically to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        ipStore.delete(ip);
      }
    }
  }, Math.max(windowMs, 30_000));

  // Unref interval so it doesn't prevent process from exiting
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    if (skipInTests && process.env.NODE_ENV === 'test') {
      return next();
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const now = Date.now();
    let record = ipStore.get(clientIp);

    if (!record) {
      record = { timestamps: [] };
      ipStore.set(clientIp, record);
    }

    // Retain only timestamps within the sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    const oldestTimestamp = record.timestamps[0] || now;
    const resetTime = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    if (record.timestamps.length >= maxRequests) {
      res.setHeader('Retry-After', resetTime.toString());
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', resetTime.toString());
      sendError(res, { code: 'RATE_LIMIT_EXCEEDED', message }, 429);
      return;
    }

    record.timestamps.push(now);
    const remaining = Math.max(0, maxRequests - record.timestamps.length);

    // Standard rate limit response headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime.toString());

    next();
  };
}

// Preset rate limiters
export const authRateLimiter = createSlidingWindowRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 15, // 15 attempts / min
  message: 'Authentication rate limit exceeded. Please wait a minute before retrying.',
});

export const verifyRateLimiter = createSlidingWindowRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 verification checks / min
  message: 'Verification endpoint rate limit exceeded. Please throttle your queries.',
});
