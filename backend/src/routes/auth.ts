import { Router } from "express";
import { z } from "zod";

const router = Router();

// Simple hardcoded auth — swap for a DB later when needed
const USERS: Record<string, { password: string; name: string }> = {
  admin: { password: "planview2026", name: "Hritwik" },
};

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /auth/login
router.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  const { username, password } = parsed.data;
  const user = USERS[username];

  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  res.json({ user: { username, name: user.name } });
});

// GET /auth/me — just checks if the simple auth header is present
router.get("/me", (req, res) => {
  const username = req.headers["x-user"] as string;
  const user = USERS[username];
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: { username, name: user.name } });
});

export default router;
