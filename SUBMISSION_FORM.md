# Ajaia Docs — Submission (Pansare Komal)

## Links
- **Live product:** https://ajaia-docs-tka0.onrender.com
- **Google Drive folder (all materials):** https://drive.google.com/drive/folders/1YeNNXIG0fRG1BeGtXHZ9I_Sf-gh1XpK4?usp=sharing
- **Walkthrough video (3–5 min):** https://drive.google.com/file/d/14UeqMyMzBVICzudCEj_c6LrbJSk6c3JZ/view?usp=sharing

## Test accounts (no password; mocked auth, pick a user on /login)
| Name | Email |
|---|---|
| Alice Johnson | alice@example.com |
| Bob Smith | bob@example.com |
| Carol Diaz | carol@example.com |

## How to review the sharing flow (about 2 minutes)
1. Sign in as **Alice**, click **New document**, rename it, and type some formatted text. It autosaves.
2. Click **Share**, enter `bob@example.com`, choose *Can view* or *Can edit*.
3. In a second browser profile or private window, sign in as **Bob**. The document appears under **Shared with me** with a role badge. A viewer sees a read-only editor. An editor can change content but cannot rename, share or delete.
4. Back as Alice, click **Remove** next to Bob. Bob loses access.

## What I built
**Stack:** Next.js 15 (App Router), TipTap editor, SQLite (better-sqlite3), deployed on Render.

- **Document creation and editing:** create, rename (owner only), edit, autosave with a visible status, reopen and delete (owner only). Formatting: bold, italic, underline, headings H1–H3, bulleted and numbered lists, undo and redo. Content is stored as HTML.
- **File upload:** `.txt`, `.md` and `.docx` files (max 2 MB) become a new editable document. Supported types are stated in the UI and README. Unsupported types are rejected with a clear message. Imported HTML is sanitised.
- **Sharing:** the owner shares by email with an *editor* or *viewer* role. The dashboard separates **My documents** from **Shared with me**, with badges.
- **Persistence:** documents, formatting and shares are stored in SQLite and survive refresh.
- **Quality:** input validation, 401/403/404 handling, error toasts, 12 automated tests (`npm test`), README with setup steps, and an architecture note.

## What works end to end
Create, rename, edit, format, save, refresh and reopen. Upload `.txt`, `.md` and `.docx` into a new document. Share with editor or viewer roles. Revoke access. Owned versus shared lists. Access rules are enforced on the server, not just in the UI.

## What is incomplete or intentionally deprioritised
- **Auth is mocked** (seeded users, cookie). Real authentication was cut to spend the time on sharing logic and the editor.
- **No real-time co-editing.** Concurrent edits are last write wins.
- **No version history or export.**
- **`.docx` import** keeps headings, lists and bold/italic. Images and tables are dropped.
- **Render's free tier has an ephemeral disk**, so data resets on redeploy or restart. Seed users are recreated automatically.

## What I would build next with another 2–4 hours
1. Real-time presence and conflict handling with Yjs
2. Version history
3. Markdown and PDF export
4. Real authentication (email link or OAuth)

## Architecture note (short)
One Next.js app serves the React UI and JSON route handlers. Business rules live in `lib/docs.ts` as functions that take a database handle, so they are unit-tested against in-memory SQLite without HTTP. A single `getAccess` function decides what each user can do:

| Action | owner | editor | viewer | no access |
|---|---|---|---|---|
| read | yes | yes | yes | 404 |
| edit content | yes | yes | 403 | 404 |
| rename, share, delete | yes | 403 | 403 | 404 |

Users without access get 404 rather than 403, so a document's existence is not leaked. Full note: `ARCHITECTURE.md`.

## AI workflow note (short)
<<EDIT THIS SECTION: write what you actually did. Draft below.>>
- **Tools:** Claude (via Claude Code) for scaffolding, implementation, tests and drafting the docs.
- **Where it sped me up:** scaffolding the stack, the CRUD, share and import route handlers, the access-control matrix with the tests derived from it, and the documentation drafts.
- **What I changed or rejected:** I chose the stack myself. A separate Underline extension was removed because TipTap v3 already bundles it. An import alias that failed under the installed TypeScript 7 was replaced with relative imports, and I pinned TypeScript 5.
- **How I verified:** 12 unit tests; a passing production build with type-checking; a scripted API run covering login, create, rename, share, viewer write rejected, `.md` import, unsupported file rejected and unauthenticated 401; plus <<my manual browser testing of the editor and two-user sharing>>.
Full note: `AI_WORKFLOW.md`.

## Files in the Drive folder
`README.md`, `ARCHITECTURE.md`, `AI_WORKFLOW.md`, `SUBMISSION.md`, `VIDEO_URL.txt`, `render.yaml`, source (`app/`, `components/`, `lib/`, `tests/`, config files), and screenshots.
