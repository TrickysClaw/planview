import { Router } from "express";

const router = Router();

/**
 * Health check endpoint.
 * Used by load balancers, uptime monitors, deploy checks.
 */
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
