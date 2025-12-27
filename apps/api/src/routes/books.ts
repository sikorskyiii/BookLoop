import { Router, Request, Response } from "express";
import { body, param, query as vq, validationResult } from "express-validator";
import { query } from "../db";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  description?: string | null;
  cover?: string | null;
  category?: string | null;
  price?: number | null;
  location?: string | null;
  created_at: Date;
}

router.get(
  "/",
  vq("q").optional().isString(),
  vq("category").optional().isString(),
  vq("userId").optional().isUUID(),
  vq("page").optional().isInt({ min: 1 }),
  vq("pageSize").optional().isInt({ min: 1, max: 50 }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid query", errors: errors.array() });
    const { q = "", category = "", userId = "", page = 1, pageSize = 20 } = req.query;
    const where: string[] = [];
    const params: unknown[] = [];
    if (q) {
      params.push(`%${q}%`);
      params.push(`%${q}%`);
      where.push(`(title ILIKE $${params.length - 1} OR author ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }
    if (userId) {
      params.push(userId);
      where.push(`user_id = $${params.length}`);
    }
    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

    const totalSql = `SELECT COUNT(*)::int AS total FROM books ${whereSql}`;
    const { rows: totalRows } = await query(totalSql, params);
    const total = (totalRows[0]?.total as number) ?? 0;

    const p = Number(page) || 1;
    const s = Number(pageSize) || 20;
    const offset = (p - 1) * s;
    const itemsSql = `
      SELECT id, user_id, title, author, description, cover, category, price, location, created_at
      FROM books
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
    const { rows } = await query(itemsSql, [...params, s, offset]);
    res.json({ total, page: p, pageSize: s, items: rows as Book[] });
  }
);

router.post(
  "/",
  requireAuth,
  body("title").isLength({ min: 1 }),
  body("author").isLength({ min: 1 }),
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid payload", errors: errors.array() });

    const { title, author, description, cover, category, price, location } = req.body;
    const { rows } = await query(
      `INSERT INTO books (user_id, title, author, description, cover, category, price, location)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, user_id, title, author, description, cover, category, price, location, created_at`,
      [req.userId, title, author, description || null, cover || null, category || null, price || null, location || null]
    );
    res.status(201).json(rows[0] as Book);
  }
);

/** WISHLIST */
router.get("/wishlist", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await query(
      `SELECT b.id, b.user_id, b.title, b.author, b.description, b.cover, b.category, b.price, b.location, b.created_at
       FROM wishlist w
       JOIN books b ON w.book_id = b.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.userId!]
    );
    res.json({ items: rows as Book[] });
  } catch (error: any) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
});

router.post("/wishlist/:bookId", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { bookId } = req.params;
    const { rows } = await query(
      `INSERT INTO wishlist (user_id, book_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, book_id) DO NOTHING
       RETURNING *`,
      [req.userId!, bookId]
    );
    if (rows.length === 0) {
      return res.status(409).json({ message: "Book already in wishlist" });
    }
    res.status(201).json({ message: "Book added to wishlist" });
  } catch (error: any) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
});

router.delete("/wishlist/:bookId", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { bookId } = req.params;
    const { rowCount } = await query(
      "DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2",
      [req.userId!, bookId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Book not found in wishlist" });
    }
    res.json({ message: "Book removed from wishlist" });
  } catch (error: any) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ message: error?.message || "Server error" });
  }
});

export default router;

