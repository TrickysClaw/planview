import { Router } from "express";
import { requireAuth } from "./auth.js";

const router = Router();

// ─── GET /dashboard ───────────────────────────────────────────
// Protected route — returns dashboard data for the logged-in user
router.get("/", requireAuth, (req, res) => {
  const user = (req as any).user;

  res.json({
    welcome: `Welcome back, ${user.userId}`,
    stats: {
      searchesToday: 0,
      savedProperties: 0,
      activeAlerts: 0,
    },
    recentSearches: [],
    quickActions: [
      { label: "Search Address", href: "/search" },
      { label: "Major Projects", href: "/ssda" },
      { label: "My Saved", href: "/saved" },
    ],
  });
});

export default router;
