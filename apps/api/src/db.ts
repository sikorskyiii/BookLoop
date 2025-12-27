import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Завантажуємо .env з корневої директорії API
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function query(q: string, params: unknown[] = []): Promise<pg.QueryResult> {
  const client = await pool.connect();
  try {
    return await client.query(q, params);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    client.release();
  }
}

