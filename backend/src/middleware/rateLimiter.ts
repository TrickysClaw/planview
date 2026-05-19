import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Global rate limiter — applies to all routes.
 * Per-IP, sliding window.
 */
export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
    retryAfterMs: env.RATE_LIMIT_WINDOW_MS,
  },
  keyGenerator: (req) => {
    // Trust X-Forwarded-For in production (behind reverse proxy)
    // In dev, use direct IP
    return (
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      req.ip ||
      "unknown"
    );
  },
});

/**
 * Strict limiter for sensitive endpoints (auth, etc.)
 * 5 requests per minute per IP.
 */
export const strictLimiter = rateLimit({
  windowMs: 60000,
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many attempts. Please wait before trying again.",
  },
});
