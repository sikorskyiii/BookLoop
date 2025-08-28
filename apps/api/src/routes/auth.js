import { Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db.js";

const router = Router();

function sign(userId) {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({}, process.env.JWT_SECRET, { subject: String(userId), expiresIn });
}

const pub = (u) => ({
  id: u.id,
  firstName: u.first_name,
  lastName: u.last_name,
  email: u.email,
  phone: u.phone,
  createdAt: u.created_at
});

router.post(
  "/register",
  body("firstName").isLength({ min: 1 }),
  body("lastName").isLength({ min: 1 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid payload", errors: errors.array() });

    const { firstName, lastName, email, phone, password } = req.body;
    const exists = await query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (exists.rowCount) return res.status(409).json({ message: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [firstName, lastName, email, phone || null, hash]
    );

    const user = rows[0];
    const token = sign(user.id);
    res.status(201).json({ token, user: pub(user) });
  }
);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid payload", errors: errors.array() });

    const { email, password } = req.body;
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = sign(user.id);
    res.json({ token, user: pub(user) });
  }
);

router.get("/me", async (req, res) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await query("SELECT * FROM users WHERE id = $1", [payload.sub]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.json({ user: pub(user) });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
