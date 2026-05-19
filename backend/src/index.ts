import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { securityHeaders } from "./middleware/security.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/health.js";
import planningRoutes from "./routes/planning.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();

// ─── SECURITY LAYER ───────────────────────────────────────────
// 1. Security headers (helmet)
app.use(securityHeaders);

// 2. CORS — only allow specified origins
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // no cookies for now
    maxAge: 86400, // preflight cache 24h
  })
);

// 3. Rate limiting
app.use(globalLimiter);

// 4. Body parsing with size limits (prevent payload attacks)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// 5. Disable X-Powered-By (already done by helmet, but explicit)
app.disable("x-powered-by");

// ─── REQUEST LOGGING ──────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"]?.substring(0, 100),
  });
  next();
});

// ─── ROUTES ───────────────────────────────────────────────────
app.use("/api", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1", planningRoutes);

// ─── ERROR HANDLING ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────
app.listen(env.PORT, () => {
  logger.info(`🚀 PlanView API running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`   CORS origins: ${env.ALLOWED_ORIGINS}`);
  logger.info(`   Rate limit: ${env.RATE_LIMIT_MAX_REQUESTS} req/${env.RATE_LIMIT_WINDOW_MS}ms`);
});

export default app;
