import { Router } from "express";
import { body, validationResult } from "express-validator";
import { query } from "../db.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const { rows } = await query(
    "SELECT id, title, author, description, cover, category, created_at FROM books ORDER BY created_at DESC"
  );
  res.json(rows);
});

router.post(
  "/",
  requireAuth,
  body("title").isLength({ min: 1 }),
  body("author").isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid payload", errors: errors.array() });

    const { title, author, description, cover, category } = req.body;
    const { rows } = await query(
      `INSERT INTO books (user_id, title, author, description, cover, category)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, title, author, description, cover, category, created_at`,
      [req.userId, title, author, description || null, cover || null, category || null]
    );
    res.status(201).json(rows[0]);
  }
);

export default router;
