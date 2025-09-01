import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();

app.use(cors());           
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true, credentials: true }));
app.use(morgan("combined"));
app.use(express.json({ limit: "1mb" }));

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const max = Number(process.env.RATE_LIMIT_MAX || 100);
const generalLimiter = rateLimit({ windowMs, max });
const authLimiter = rateLimit({ windowMs, max: Math.min(max, 20) });

+app.use("/auth", authLimiter);
+app.use("/books", generalLimiter);
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/books", bookRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error" });
});

app.use((_req, res) => res.status(404).json({ message: "Not found" }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
