import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function query(q: string, params: unknown[] = []): Promise<pg.QueryResult> {
  const client = await pool.connect();
  try {
    return await client.query(q, params);
  } finally {
    client.release();
  }
}

