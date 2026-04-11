import { createClient } from '@libsql/client';

let db;

export function getDb() {
  if (!db) {
    db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return db;
}

export async function initDb() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS corals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_data TEXT NOT NULL,
      author_name TEXT NOT NULL DEFAULT 'Anonymous',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
