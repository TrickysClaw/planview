import { Router } from "express";

const router = Router();

// GET /dashboard — returns basic dashboard data
router.get("/", (req, res) => {
  res.json({
    stats: {
      searchesToday: 0,
      savedProperties: 0,
    },
    quickActions: [
      { label: "Search Address", href: "/search" },
      { label: "Major Projects", href: "/ssda" },
    ],
  });
});

export default router;
