import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth";
import bookRoutes from "./routes/books";
import { admin } from "./firebaseAdmin";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Завантажуємо .env з корневої директорії API
// Спочатку намагаємося завантажити з поточної робочої директорії
let result = dotenv.config();
if (result.error) {
  // Якщо не вдалося, намагаємося з явним шляхом
  const envPath = path.resolve(__dirname, "../.env");
  result = dotenv.config({ path: envPath });
  if (result.error) {
    // Якщо файл не може бути прочитаний через дозволи, просто продовжуємо
    // Змінні оточення можуть бути встановлені через системне оточення
    const error = result.error as NodeJS.ErrnoException;
    if (error.code === 'EPERM') {
      console.warn(`Warning: Cannot read .env file at ${envPath} due to permissions. Using system environment variables.`);
    } else {
      console.warn(`Warning: Could not load .env file: ${result.error.message}. Using system environment variables.`);
    }
  } else {
    console.log(`Loaded ${Object.keys(result.parsed || {}).length} environment variables from ${envPath}`);
  }
} else {
  console.log(`Loaded ${Object.keys(result.parsed || {}).length} environment variables from .env`);
}
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true, credentials: true }));
app.use(express.json({ limit: "10mb" })); // Збільшено для завантаження зображень
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const max = Number(process.env.RATE_LIMIT_MAX || 100);
const generalLimiter = rateLimit({ windowMs, max });
const authLimiter = rateLimit({ windowMs, max: Math.min(max, 20) });

app.use("/auth", authLimiter);
app.use("/books", generalLimiter);
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));
app.get("/debug/env", (_req: Request, res: Response) => {
  res.json({
    hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    firebaseKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE')),
    adminAppsLength: admin.apps.length
  });
});

app.use("/auth", authRoutes);
app.use("/books", bookRoutes);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  console.error("Error stack:", err.stack);
  console.error("Request URL:", req.url);
  console.error("Request method:", req.method);
  console.error("Request body keys:", req.body ? Object.keys(req.body) : "no body");
  
  // Перевіряємо, чи відповідь вже відправлена
  if (res.headersSent) {
    console.error("Response already sent, cannot send error response");
    return;
  }
  
  // Намагаємося надати більш корисне повідомлення про помилку
  const errorMessage = err.message || "Server error";
  res.status(500).json({ 
    message: errorMessage,
    error: process.env.NODE_ENV === "development" ? {
      message: err.message,
      stack: err.stack,
      name: err.name,
    } : undefined
  });
});

app.use((_req: Request, res: Response) => res.status(404).json({ message: "Not found" }));

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`API on http://0.0.0.0:${port}`));

