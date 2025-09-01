import { Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query as db } from "../db.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

const normalizeEmail = (v) => (v ?? "").toString().trim().toLowerCase();
const trimStr = (v) => (v ?? "").toString().trim();

function sign(userId) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({}, process.env.JWT_SECRET, { subject: String(userId), expiresIn });
}

const pub = (u) => ({
  id: u.id,
  firstName: u.first_name,
  lastName: u.last_name,
  email: u.email,
  createdAt: u.created_at
});

function formatErrors(result) {
  const out = {};
  for (const e of result.array()) {
    if (!out[e.path]) out[e.path] = e.msg;
  }
  return out;
}

/** REGISTER */
router.post(
  "/register",
  body("firstName").customSanitizer(trimStr).isLength({ min: 1 }).withMessage("Вкажіть імʼя"),
  body("lastName").customSanitizer(trimStr).isLength({ min: 1 }).withMessage("Вкажіть прізвище"),
  body("email").customSanitizer(normalizeEmail).isEmail().withMessage("Невалідний email"),
  body("password").isLength({ min: 6 }).withMessage("Мінімум 6 символів у паролі"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Некоректні дані", errors: formatErrors(errors) });
    }

    const { firstName, lastName, email, password } = req.body;

    const exists = await db("SELECT 1 FROM users WHERE email = $1", [email]);
    if (exists.rowCount) {
      return res.status(409).json({ message: "Email вже використовується", errors: { email: "Email вже використовується" } });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [firstName, lastName, email, hash]
    );

    const user = rows[0];
    const token = sign(user.id);
    return res.status(201).json({ token, user: pub(user) });
  }
);

/** LOGIN */
router.post(
  "/login",
  body("email").customSanitizer(normalizeEmail).isEmail().withMessage("Невалідний email"),
  body("password").isLength({ min: 6 }).withMessage("Невірний пароль"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Некоректні дані", errors: formatErrors(errors) });
    }

    const { email, password } = req.body;
    const { rows } = await db("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: "Невірні облікові дані" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Невірні облікові дані" });

    const token = sign(user.id);
    return res.json({ token, user: pub(user) });
  }
);

/** ME */
router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await db("SELECT * FROM users WHERE id = $1", [req.userId]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  return res.json({ user: pub(user) });
});

export default router;
