import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";

/**
 * Global error handler.
 * - Never leaks stack traces in production
 * - Logs full error internally
 * - Returns safe, generic messages to client
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const isProduction = process.env.NODE_ENV === "production";

  // Log full error internally
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Never expose internal errors to client
  res.status(500).json({
    error: isProduction ? "Internal server error" : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}

/**
 * 404 handler — must be registered after all routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: "Not found",
    path: req.path,
  });
}
