import { describe, it, expect, vi } from 'vitest';
import { createSlidingWindowRateLimiter } from '../src/middleware/rateLimiter.js';
import type { Request, Response, NextFunction } from 'express';

describe('Defense-in-Depth Security Middleware', () => {
  describe('Sliding-Window Rate Limiter', () => {
    it('allows requests within the configured max threshold', () => {
      const limiter = createSlidingWindowRateLimiter({
        windowMs: 1000,
        maxRequests: 3,
      });

      const mockReq = {
        headers: {},
        socket: { remoteAddress: '192.168.1.10' },
      } as unknown as Request;

      const headers: Record<string, string> = {};
      const mockRes = {
        setHeader: vi.fn((key: string, val: string) => {
          headers[key] = val;
        }),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const mockNext = vi.fn();

      // Request 1
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(headers['X-RateLimit-Remaining']).toBe('2');

      // Request 2
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2);
      expect(headers['X-RateLimit-Remaining']).toBe('1');

      // Request 3
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(3);
      expect(headers['X-RateLimit-Remaining']).toBe('0');
    });

    it('blocks subsequent requests and returns 429 when quota is exceeded', () => {
      const limiter = createSlidingWindowRateLimiter({
        windowMs: 5000,
        maxRequests: 2,
        message: 'Rate limit tripped for testing',
      });

      const mockReq = {
        headers: {},
        socket: { remoteAddress: '10.0.0.5' },
      } as unknown as Request;

      let statusCode = 200;
      let responseBody: any = null;

      const mockRes = {
        setHeader: vi.fn(),
        status: vi.fn((code: number) => {
          statusCode = code;
          return mockRes;
        }),
        json: vi.fn((data: any) => {
          responseBody = data;
          return mockRes;
        }),
      } as unknown as Response;

      const mockNext = vi.fn();

      // Req 1 & 2 succeed
      limiter(mockReq, mockRes, mockNext);
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2);

      // Req 3 should trip limiter
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2); // Next NOT called on 3rd attempt
      expect(statusCode).toBe(429);
      expect(responseBody.success).toBe(false);
      expect(responseBody.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(responseBody.error.message).toBe('Rate limit tripped for testing');
    });

    it('tracks independent IP quotas in isolated buckets', () => {
      const limiter = createSlidingWindowRateLimiter({
        windowMs: 5000,
        maxRequests: 1,
      });

      const reqA = {
        headers: {},
        socket: { remoteAddress: '1.1.1.1' },
      } as unknown as Request;

      const reqB = {
        headers: {},
        socket: { remoteAddress: '2.2.2.2' },
      } as unknown as Request;

      const mockRes = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      const nextA = vi.fn();
      const nextB = vi.fn();

      limiter(reqA, mockRes, nextA);
      expect(nextA).toHaveBeenCalledTimes(1);

      // Request from IP B is not blocked by IP A's quota
      limiter(reqB, mockRes, nextB);
      expect(nextB).toHaveBeenCalledTimes(1);
    });
  });
});
