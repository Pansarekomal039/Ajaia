import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import type { Access, Role } from './db';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const MAX_TITLE = 200;
export const MAX_CONTENT = 2_000_000;

export function getAccess(db: Database.Database, docId: string, userId: string): Access {
  const doc = db.prepare('SELECT owner_id FROM documents WHERE id = ?').get(docId) as
    | { owner_id: string }
    | undefined;
  if (!doc) return null;
  if (doc.owner_id === userId) return 'owner';
  const share = db
    .prepare('SELECT role FROM shares WHERE document_id = ? AND user_id = ?')
    .get(docId, userId) as { role: Role } | undefined;
  return share ? share.role : null;
}

export function cleanTitle(raw: unknown): string {
  if (typeof raw !== 'string') throw new HttpError(400, 'Title must be a string');
  const t = raw.trim();
  if (!t) throw new HttpError(400, 'Title cannot be empty');
  if (t.length > MAX_TITLE) throw new HttpError(400, `Title must be at most ${MAX_TITLE} characters`);
  return t;
}

export function createDoc(db: Database.Database, ownerId: string, title = 'Untitled document', content = '') {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO documents (id, owner_id, title, content, created_at, updated_at) VALUES (?,?,?,?,?,?)'
  ).run(id, ownerId, cleanTitle(title), content, now, now);
  return id;
}

export function listDocs(db: Database.Database, userId: string) {
  const owned = db
    .prepare(
      `SELECT d.id, d.title, d.updated_at AS updatedAt, 'owner' AS access, u.name AS ownerName
       FROM documents d JOIN users u ON u.id = d.owner_id
       WHERE d.owner_id = ? ORDER BY d.updated_at DESC`
    )
    .all(userId);
  const shared = db
    .prepare(
      `SELECT d.id, d.title, d.updated_at AS updatedAt, s.role AS access, u.name AS ownerName
       FROM shares s JOIN documents d ON d.id = s.document_id JOIN users u ON u.id = d.owner_id
       WHERE s.user_id = ? ORDER BY d.updated_at DESC`
    )
    .all(userId);
  return { owned, shared };
}

export function getDoc(db: Database.Database, docId: string, userId: string) {
  const access = getAccess(db, docId, userId);
  if (!access) throw new HttpError(404, 'Document not found');
  const doc = db
    .prepare(
      `SELECT d.id, d.title, d.content, d.updated_at AS updatedAt, d.owner_id AS ownerId, u.name AS ownerName
       FROM documents d JOIN users u ON u.id = d.owner_id WHERE d.id = ?`
    )
    .get(docId) as Record<string, unknown>;
  const shares =
    access === 'owner'
      ? db
          .prepare(
            `SELECT s.user_id AS userId, u.name, u.email, s.role FROM shares s
             JOIN users u ON u.id = s.user_id WHERE s.document_id = ? ORDER BY u.name`
          )
          .all(docId)
      : [];
  return { ...doc, access, shares };
}

export function updateDoc(
  db: Database.Database,
  docId: string,
  userId: string,
  patch: { title?: unknown; content?: unknown }
) {
  const access = getAccess(db, docId, userId);
  if (!access) throw new HttpError(404, 'Document not found');
  if (access === 'viewer') throw new HttpError(403, 'You have view-only access to this document');
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (patch.title !== undefined) {
    if (access !== 'owner') throw new HttpError(403, 'Only the owner can rename a document');
    sets.push('title = ?');
    vals.push(cleanTitle(patch.title));
  }
  if (patch.content !== undefined) {
    if (typeof patch.content !== 'string') throw new HttpError(400, 'Content must be a string');
    if (patch.content.length > MAX_CONTENT) throw new HttpError(413, 'Document is too large');
    sets.push('content = ?');
    vals.push(patch.content);
  }
  if (!sets.length) throw new HttpError(400, 'Nothing to update');
  const now = new Date().toISOString();
  sets.push('updated_at = ?');
  vals.push(now, docId);
  db.prepare(`UPDATE documents SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return { updatedAt: now };
}

export function deleteDoc(db: Database.Database, docId: string, userId: string) {
  const access = getAccess(db, docId, userId);
  if (!access) throw new HttpError(404, 'Document not found');
  if (access !== 'owner') throw new HttpError(403, 'Only the owner can delete a document');
  db.prepare('DELETE FROM documents WHERE id = ?').run(docId);
}

export function shareDoc(
  db: Database.Database,
  docId: string,
  ownerId: string,
  email: unknown,
  role: unknown
) {
  const access = getAccess(db, docId, ownerId);
  if (!access) throw new HttpError(404, 'Document not found');
  if (access !== 'owner') throw new HttpError(403, 'Only the owner can share this document');
  if (typeof email !== 'string' || !email.trim()) throw new HttpError(400, 'Email is required');
  if (role !== 'editor' && role !== 'viewer') throw new HttpError(400, 'Role must be editor or viewer');
  const target = db
    .prepare('SELECT id FROM users WHERE lower(email) = lower(?)')
    .get(email.trim()) as { id: string } | undefined;
  if (!target) throw new HttpError(404, 'No user with that email (try alice@, bob@ or carol@example.com)');
  if (target.id === ownerId) throw new HttpError(400, 'You already own this document');
  db.prepare(
    `INSERT INTO shares (document_id, user_id, role) VALUES (?,?,?)
     ON CONFLICT(document_id, user_id) DO UPDATE SET role = excluded.role`
  ).run(docId, target.id, role);
}

export function unshareDoc(db: Database.Database, docId: string, ownerId: string, userId: string) {
  const access = getAccess(db, docId, ownerId);
  if (!access) throw new HttpError(404, 'Document not found');
  if (access !== 'owner') throw new HttpError(403, 'Only the owner can change sharing');
  db.prepare('DELETE FROM shares WHERE document_id = ? AND user_id = ?').run(docId, userId);
}
