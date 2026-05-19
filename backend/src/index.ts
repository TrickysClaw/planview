import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import healthRoutes from "./routes/health.js";
import planningRoutes from "./routes/planning.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1", planningRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start
app.listen(env.PORT, () => {
  logger.info(`🚀 PlanView API on port ${env.PORT}`);
});

export default app;
