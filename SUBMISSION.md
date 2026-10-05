# Submission contents

| Item | Location |
|---|---|
| Source code | `app/`, `components/`, `lib/`, `tests/`, config files |
| Setup & run instructions | `README.md` |
| Architecture note | `ARCHITECTURE.md` |
| AI workflow note | `AI_WORKFLOW.md` |
| Walkthrough video URL | `VIDEO_URL.txt` |
| Live product URL | https://ajaia-docs-tka0.onrender.com |
| Deploy config | `render.yaml` |

## Test accounts
alice@example.com, bob@example.com, carol@example.com — pick on `/login` (no password; mocked auth).

## Status
**Working:** create/rename/edit/save/reopen/delete; bold, italic, underline, H1–H3, bullet/numbered lists; `.txt`/`.md`/`.docx` upload into a new document; owner/editor/viewer sharing with owned vs shared lists; SQLite persistence; validation and error handling; 12 automated tests.
**Incomplete / cut:** real auth, real-time collaboration, version history, export, rich `.docx` fidelity (images/tables).
**Next with 2–4 hours:** Yjs real-time presence, version history, Markdown/PDF export, real authentication.
**Note:** Render free tier has an ephemeral disk, so data resets on redeploy.
