import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { strictLimiter } from "../middleware/rateLimiter.js";
import { logger } from "../config/logger.js";
import crypto from "crypto";

const router = Router();

// ─── In-memory session store (replace with DB/Redis later) ────
const sessions = new Map<string, { userId: string; createdAt: number; expiresAt: number }>();

// ─── Hardcoded users for now (replace with DB later) ──────────
const USERS: Record<string, { password: string; name: string; role: string }> = {
  admin: { password: "planview2026", name: "Hritwik", role: "admin" },
};

// Session duration: 24 hours
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// ─── Validation Schemas ───────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1).max(50).trim(),
  password: z.string().min(1).max(100),
});

// ─── POST /auth/login ─────────────────────────────────────────
// Authenticates user, returns a session token
router.post("/login", strictLimiter, validate(loginSchema, "body"), (req, res) => {
  const { username, password } = (req as any).validated;

  const user = USERS[username];

  // Constant-time comparison to prevent timing attacks
  if (!user || !crypto.timingSafeEqual(Buffer.from(password), Buffer.from(user.password))) {
    // Generic message — don't reveal if username exists
    logger.warn(`Failed login attempt for: ${username}`, { ip: req.ip });
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  // Generate cryptographically secure session token
  const token = crypto.randomBytes(32).toString("hex");

  // Store session
  sessions.set(token, {
    userId: username,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });

  logger.info(`User logged in: ${username}`, { ip: req.ip });

  res.json({
    token,
    user: { username, name: user.name, role: user.role },
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  });
});

// ─── GET /auth/me ─────────────────────────────────────────────
// Returns current user info if session is valid
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer "
  const session = sessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    if (session) sessions.delete(token); // Clean up expired
    res.status(401).json({ error: "Session expired or invalid" });
    return;
  }

  const user = USERS[session.userId];
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    user: { username: session.userId, name: user.name, role: user.role },
    session: { createdAt: new Date(session.createdAt).toISOString(), expiresAt: new Date(session.expiresAt).toISOString() },
  });
});

// ─── POST /auth/logout ────────────────────────────────────────
// Invalidates the session token
router.post("/logout", (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    sessions.delete(token);
  }

  res.json({ message: "Logged out" });
});

// ─── Middleware: requireAuth ──────────────────────────────────
// Export this so other routes can protect themselves
export function requireAuth(req: any, res: any, next: any): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7);
  const session = sessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    if (session) sessions.delete(token);
    res.status(401).json({ error: "Session expired" });
    return;
  }

  // Attach user to request for downstream use
  req.user = { userId: session.userId, role: USERS[session.userId]?.role };
  next();
}

export default router;
