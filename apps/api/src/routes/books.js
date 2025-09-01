import { Router } from "express";
import { body, param, query as vq, validationResult } from "express-validator";
import { query } from "../db.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get(
  "/",
  vq("q").optional().isString(),
  vq("category").optional().isString(),
  vq("page").optional().isInt({ min: 1 }),
  vq("pageSize").optional().isInt({ min: 1, max: 50 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid query", errors: errors.array() });
   const { q = "", category = "", page = 1, pageSize = 20 } = req.query;
    const where = [];
    const params = [];
   if (q) {
      params.push(`%${q}%`);
      params.push(`%${q}%`);
     where.push(`(title ILIKE $${params.length - 1} OR author ILIKE $${params.length})`);
    }
   if (category) {
     params.push(category);
     where.push(`category = $${params.length}`);
    }
   const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

    const totalSql = `SELECT COUNT(*)::int AS total FROM books ${whereSql}`;
    const { rows: totalRows } = await query(totalSql, params);
    const total = totalRows[0]?.total ?? 0;

    const p = Number(page) || 1;
    const s = Number(pageSize) || 20;
    const offset = (p - 1) * s;
    const itemsSql = `
      SELECT id, user_id, title, author, description, cover, category, created_at
      FROM books
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      const { rows } = await query(itemsSql, [...params, s, offset]);
  res.json({ total, page: p, pageSize: s, items: rows });
  }
);

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
