import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query as db } from "../db";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { admin } from "../firebaseAdmin";

const router = Router();

const normalizeEmail = (v: unknown): string => (v ?? "").toString().trim().toLowerCase();
const trimStr = (v: unknown): string => (v ?? "").toString().trim();

function sign(userId: string | number): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({}, process.env.JWT_SECRET as string, { subject: String(userId), expiresIn });
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: Date;
}

const pub = (u: User) => ({
  id: u.id,
  firstName: u.first_name,
  lastName: u.last_name,
  email: u.email,
  createdAt: u.created_at
});

function formatErrors(result: ReturnType<typeof validationResult>) {
  const out: Record<string, string> = {};
  for (const e of result.array()) {
    if (!out[e.type === "field" ? e.path : ""]) {
      out[e.type === "field" ? e.path : ""] = e.msg;
    }
  }
  return out;
}

/** REGISTER */
router.post(
  "/register",
  body("firstName").customSanitizer(trimStr).isLength({ min: 1 }).withMessage("Вкажіть імʼя"),
  body("lastName").customSanitizer(trimStr).isLength({ min: 1 }).withMessage("Вкажіть прізвище"),
  body("email").customSanitizer(normalizeEmail).isEmail().withMessage("Невалідний email"),
  body("password").isLength({ min: 8 }).withMessage("Мінімум 8 символів у паролі"),
  async (req: Request, res: Response, next: any) => {
    try {
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

      const user = rows[0] as User;
      const token = sign(user.id);
      return res.status(201).json({ token, user: pub(user) });
    } catch (error: any) {
      console.error("Register error:", error);
      console.error("Error details:", {
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      });
      if (error?.code === "ECONNREFUSED" || error?.code === "ENOTFOUND" || error?.message?.includes("connect") || error?.message?.includes("Connection refused")) {
        return res.status(500).json({ message: "База даних не доступна. Запустіть PostgreSQL або Docker контейнер." });
      }
      if (error?.code === "42P01" || error?.message?.includes("does not exist")) {
        return res.status(500).json({ message: "Таблиця не існує. Перевірте міграції бази даних." });
      }
      return res.status(500).json({ message: error?.message || "Помилка сервера" });
    }
  }
);

/** LOGIN */
router.post(
  "/login",
  body("email").customSanitizer(normalizeEmail).isEmail().withMessage("Невалідний email"),
  body("password").isLength({ min: 6 }).withMessage("Невірний пароль"),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Некоректні дані", errors: formatErrors(errors) });
    }

    const { email, password } = req.body;
    const { rows } = await db("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0] as User & { password_hash: string };
    if (!user) return res.status(401).json({ message: "Невірні облікові дані" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Невірні облікові дані" });

    const token = sign(user.id);
    return res.json({ token, user: pub(user) });
  }
);

/** ME */
router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  const { rows } = await db("SELECT * FROM users WHERE id = $1", [req.userId!]);
  const user = rows[0] as User;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  return res.json({ user: pub(user) });
});

/** GOOGLE */
router.post("/google", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body; // Firebase ID token
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    if (!admin.apps.length) {
      return res.status(500).json({ message: "Firebase Admin is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables." });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const name = decoded.name || "";
    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ");
    const firebaseUid = decoded.uid;

    const upsertSql = `
      INSERT INTO users (email, first_name, last_name, firebase_uid)
      VALUES ($1, COALESCE($2,''), COALESCE($3,''), $4)
      ON CONFLICT (email) DO UPDATE
        SET first_name = EXCLUDED.first_name,
            last_name  = EXCLUDED.last_name,
            firebase_uid = EXCLUDED.firebase_uid
      RETURNING *;
    `;
    const { rows } = await db(upsertSql, [email, firstName, lastName, firebaseUid]);
    const user = rows[0] as User;

    const token = sign(user.id);

    res.json({ token, user: pub(user) });
  } catch (e) {
    console.error("google auth error:", e);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
});

export default router;

