import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Validate request query/body/params against a Zod schema.
 * Rejects with 400 + detailed error messages.
 * Prevents injection, malformed input, and type coercion attacks.
 */
export function validate(schema: ZodSchema, source: "query" | "body" | "params" = "query") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = source === "query" ? req.query : source === "body" ? req.body : req.params;

    const result = schema.safeParse(data);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }

    // Attach validated + sanitized data
    (req as any).validated = result.data;
    next();
  };
}
