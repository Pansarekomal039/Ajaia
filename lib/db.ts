import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export type Role = 'editor' | 'viewer';
export type Access = 'owner' | Role | null;

export const SEED_USERS = [
  { id: 'u_alice', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 'u_bob', name: 'Bob Smith', email: 'bob@example.com' },
  { id: 'u_carol', name: 'Carol Diaz', email: 'carol@example.com' },
];

export function openDb(file: string): Database.Database {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS shares (
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      role TEXT NOT NULL CHECK (role IN ('editor','viewer')),
      PRIMARY KEY (document_id, user_id)
    );
  `);
  const ins = db.prepare('INSERT OR IGNORE INTO users (id, name, email) VALUES (?, ?, ?)');
  for (const u of SEED_USERS) ins.run(u.id, u.name, u.email);
  return db;
}

let _db: Database.Database | null = null;
export function getDb(): Database.Database {
  if (!_db) {
    const dir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    _db = openDb(path.join(dir, 'app.db'));
  }
  return _db;
}
