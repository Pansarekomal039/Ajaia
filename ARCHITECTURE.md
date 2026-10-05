# Architecture note

## Shape
Single Next.js app: React client pages (`/login`, `/`, `/doc/[id]`) call JSON route handlers under `app/api/*`. Business rules live in `lib/docs.ts` (pure functions taking a DB handle), so they are unit-tested against an in-memory SQLite without HTTP.

## Data model (SQLite)
`users(id, name, email)` · `documents(id, owner_id, title, content, created_at, updated_at)` · `shares(document_id, user_id, role)` with `role IN ('editor','viewer')`, cascade delete.

## Access rules (single source of truth: `getAccess`)
| Action | owner | editor | viewer | stranger |
|---|---|---|---|---|
| read | ✓ | ✓ | ✓ | 404 |
| edit content | ✓ | ✓ | 403 | 404 |
| rename / share / delete | ✓ | 403 | 403 | 404 |

Strangers get 404 rather than 403 so document existence is not leaked.

## What I prioritised
1. **Correct sharing logic and persistence** — the parts reviewers can't see in a screenshot; covered by tests.
2. **Editor experience** — TipTap gives a coherent rich-text flow quickly; autosave with visible status and unload warning.
3. **Product-relevant upload** — file → new document, because it plugs into the create flow.
4. **Shippability** — SQLite, no external services, one `render.yaml`.

## Deliberate cuts
- Mocked cookie auth (seeded users) instead of real accounts.
- HTML as storage format: simple and preserves formatting; TipTap JSON would be more robust for future collaboration.
- No real-time sync: last write wins. Next step would be Yjs with a websocket server.
- Free-tier Render has an ephemeral disk; documented, with `DATA_DIR` for durable storage.
- Import sanitised with an allow-list of tags only the editor can represent.
