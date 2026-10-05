# Ajaia Docs — lightweight collaborative document editor

Next.js 15 (App Router) + TipTap rich-text editor + SQLite (better-sqlite3). One codebase serves UI and API.

**Live demo:** _<paste Render URL here>_  ·  **Walkthrough video:** see `VIDEO_URL.txt`

## Run locally
Requires Node 20+ (tested on 22).

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # vitest: access control, persistence, import
npm run build && npm start   # production mode
```
The SQLite file is created at `./data/app.db` on first request (override with `DATA_DIR`). No env vars or external services needed.

## Test accounts (seeded automatically)
| Name | Email |
|---|---|
| Alice Johnson | alice@example.com |
| Bob Smith | bob@example.com |
| Carol Diaz | carol@example.com |

Sign-in is **mocked**: pick a user on `/login` (a cookie stores the user id).

### Review the sharing flow (2 minutes)
1. Sign in as Alice → **New document**, rename it, type formatted text (autosaves).
2. Click **Share**, enter `bob@example.com`, choose *Can view* (or *Can edit*).
3. Open a second browser profile / private window, sign in as Bob → the doc appears under **Shared with me** with a role badge. As a viewer the editor is read-only; as an editor Bob can change content but cannot rename, share or delete.
4. Back as Alice, remove Bob in the Share dialog → Bob loses access.

## Features
- Create, rename (owner only), edit, autosave (800 ms debounce), reopen, delete (owner only)
- Rich text: bold, italic, underline, headings H1–H3, bullet/numbered lists, undo/redo; content stored as HTML
- **File upload:** `.txt`, `.md`, `.docx` (max 2 MB) → new editable document. Other types are rejected with a clear message. Imported HTML is sanitised.
- Sharing by email with roles *editor* / *viewer*; dashboard separates **My documents** and **Shared with me**
- Validation + error handling: title length, role/email checks, size limits, 401/403/404 responses, toasts in the UI

## Deploy (Render, free)
Push the repo to GitHub → Render → *New Blueprint* → select repo (`render.yaml` is included). Free-tier disks are ephemeral, so data resets on redeploy or restart; seed users are recreated automatically. For durable data attach a disk and set `DATA_DIR` to its mount path.

## Known limitations / next steps
- Mocked auth; no real-time co-editing (last write wins); no version history
- `.docx` import keeps basic structure only (headings, lists, bold/italic); images/tables are dropped
- With 2–4 more hours: real-time presence + conflict handling (Yjs), version history, Markdown/PDF export, real auth
