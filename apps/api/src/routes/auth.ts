import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query as db } from "../db";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { admin } from "../firebaseAdmin";
import { uploadImageToCloudinary } from "../utils/cloudinary";

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
  city?: string | null;
  bio?: string | null;
  profile_picture_url?: string | null;
  created_at: Date;
}

const pub = (u: User) => ({
  id: u.id,
  firstName: u.first_name,
  lastName: u.last_name,
  email: u.email,
  city: u.city || null,
  bio: u.bio || null,
  profilePictureUrl: u.profile_picture_url || null,
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

/** UPDATE PROFILE */
router.patch("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    console.log("PATCH /auth/me called");
    console.log("userId:", req.userId);
    console.log("body:", req.body);
    const { firstName, lastName, city, bio, profilePictureUrl } = req.body;
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      params.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      params.push(lastName);
    }
    if (city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      params.push(city);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      params.push(bio);
    }
    if (profilePictureUrl !== undefined) {
      updates.push(`profile_picture_url = $${paramIndex++}`);
      params.push(profilePictureUrl);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    params.push(req.userId);
    const { rows } = await db(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      params
    );
    const user = rows[0] as User;
    return res.json({ user: pub(user) });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: error?.message || "Server error" });
  }
});

/** GET USER PROFILE WITH STATS */
router.get("/profile/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get user
    const { rows: userRows } = await db("SELECT * FROM users WHERE id = $1", [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userRows[0] as User;

    // Get followers count (readers)
    const { rows: followersRows } = await db(
      "SELECT COUNT(*)::int AS count FROM followers WHERE following_id = $1",
      [userId]
    );
    const readers = followersRows[0]?.count || 0;

    // Get following count
    const { rows: followingRows } = await db(
      "SELECT COUNT(*)::int AS count FROM followers WHERE follower_id = $1",
      [userId]
    );
    const following = followingRows[0]?.count || 0;

    // Get books count
    const { rows: booksRows } = await db(
      "SELECT COUNT(*)::int AS count FROM books WHERE user_id = $1",
      [userId]
    );
    const booksCount = booksRows[0]?.count || 0;

    return res.json({
      user: pub(user),
      stats: {
        readers,
        following,
        booksCount
      }
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: error?.message || "Server error" });
  }
});

// Обгортка для обробки помилок в async функціях
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/** UPLOAD PROFILE PICTURE */
router.post("/upload-profile-picture", requireAuth, asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log("=== UPLOAD PROFILE PICTURE ENDPOINT CALLED ===");
  console.log("Request received at:", new Date().toISOString());
  try {
    console.log("Upload profile picture endpoint called");
    console.log("UserId:", req.userId);
    console.log("Body type:", typeof req.body);
    console.log("Body keys:", req.body ? Object.keys(req.body) : "no body");
    console.log("ImageBase64 exists:", !!req.body?.imageBase64);
    console.log("ImageBase64 length:", req.body?.imageBase64?.length || 0);

    const { imageBase64 } = req.body;
    if (!imageBase64) {
      console.error("Missing imageBase64 in request body");
      return res.status(400).json({ message: "Missing imageBase64" });
    }

    console.log("Uploading image to Cloudinary...");
    try {
      // Завантажуємо зображення в Cloudinary
      const imageUrl = await uploadImageToCloudinary(
        imageBase64,
        `profile-pictures/user_${req.userId}`
      );
      
      console.log("Image uploaded successfully to Cloudinary:", imageUrl);
      return res.json({ url: imageUrl });
    } catch (uploadError: any) {
      console.error("Error uploading to Cloudinary:", uploadError);
      console.error("Upload error details:", {
        message: uploadError?.message,
        stack: uploadError?.stack,
      });
      
      return res.status(500).json({ 
        message: uploadError?.message || "Failed to upload image. Please check Cloudinary configuration.",
        error: process.env.NODE_ENV === "development" ? {
          message: uploadError?.message,
          stack: uploadError?.stack,
        } : undefined
      });
    }
  } catch (error: any) {
    console.error("Upload profile picture error:", error);
    console.error("Error details:", {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      status: error?.status,
    });
    
    // Перевіряємо, чи відповідь вже відправлена
    if (res.headersSent) {
      console.error("Response already sent, cannot send error response");
      return;
    }
    
    // Більш детальна обробка помилок
    if (error?.code === "ENOENT" || error?.message?.includes("ENOENT")) {
      return res.status(500).json({ message: "File system error" });
    }
    if (error?.code === "ECONNREFUSED" || error?.message?.includes("ECONNREFUSED")) {
      return res.status(500).json({ message: "Cannot connect to Firebase Storage" });
    }
    
    // Firebase-specific errors
    if (error?.code === 403 || error?.status === 403) {
      return res.status(500).json({ 
        message: "Permission denied. Please check Firebase Storage permissions and service account configuration.",
        error: process.env.NODE_ENV === "development" ? error?.message : undefined
      });
    }
    if (error?.code === 404 || error?.status === 404) {
      return res.status(500).json({ 
        message: "Firebase Storage bucket not found. Please check Firebase Storage configuration.",
        error: process.env.NODE_ENV === "development" ? error?.message : undefined
      });
    }
    if (error?.code === 401 || error?.status === 401) {
      return res.status(500).json({ 
        message: "Firebase authentication failed. Please check Firebase Admin credentials.",
        error: process.env.NODE_ENV === "development" ? error?.message : undefined
      });
    }
    
    // Перевіряємо помилки ініціалізації Firebase
    if (error?.message?.includes("Firebase Admin") || error?.message?.includes("not initialized")) {
      return res.status(500).json({ 
        message: "Firebase Admin is not properly initialized. Please check your Firebase configuration.",
        error: process.env.NODE_ENV === "development" ? error?.message : undefined
      });
    }
    
    // Generic error with more details in development
    const errorMessage = error?.message || "Failed to upload image";
    console.error("Sending error response:", errorMessage);
    
    // Перевіряємо, чи відповідь вже відправлена (ще раз для впевненості)
    if (res.headersSent) {
      console.error("Response already sent, cannot send error response");
      return;
    }
    
    return res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        status: error?.status,
      } : undefined
    });
  }
}));

/** GOOGLE */
router.post("/google", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body; // Firebase ID token
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    console.log("Google login attempt - admin.apps.length:", admin.apps.length);
    console.log("Environment check:", {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
    });

    if (!admin.apps.length) {
      console.error("Firebase Admin not initialized. admin.apps.length =", admin.apps.length);
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

