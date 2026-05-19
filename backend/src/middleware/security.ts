import helmet from "helmet";
import type { RequestHandler } from "express";

/**
 * Security headers via helmet.
 * - CSP: restrict resource loading
 * - HSTS: force HTTPS in production
 * - X-Frame-Options: prevent clickjacking
 * - X-Content-Type-Options: prevent MIME sniffing
 * - Referrer-Policy: limit referrer info leakage
 * - Permissions-Policy: disable unnecessary browser APIs
 */
export const securityHeaders: RequestHandler = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  crossOriginEmbedderPolicy: false, // allow external API fetches
});
