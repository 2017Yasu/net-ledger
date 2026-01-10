// src/lib/rate-limiter.ts
import RateLimit from "next-rate-limit";

export const AuthRateLimitOptions = Object.freeze({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 5, // Max 5 requests per minute per IP
});
// Global rate limiter for authentication endpoints
export const authRateLimiter = RateLimit(AuthRateLimitOptions);
