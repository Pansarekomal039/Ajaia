# AI workflow note

> **Candidate: review and edit this to reflect what you actually did before submitting.** The bracketed items below are the parts only you can confirm.

## Tools used
Claude (Sonnet 5.5) via Claude Code for scaffolding, implementation and docs. [Add any others.]

## Where AI sped things up
- Scaffolding the Next.js + SQLite + TipTap stack and all CRUD/share/import route handlers
- Drafting the access-control matrix and the unit tests derived from it
- Writing README / architecture drafts

## What I changed or rejected
- Stack choice was mine (picked Next.js + TipTap + SQLite over a Firebase option for testable sharing rules and no paid dependencies).
- TipTap v3 already bundles Underline; the separate extension AI-installed was removed to avoid duplicate-extension warnings.
- The `@/` import alias failed under the installed TypeScript 7; I pinned TypeScript 5 and switched to relative imports instead of debugging further.
- [Add anything you rejected or rewrote, e.g. UI wording, defaults.]

## How I verified
- `npm test` — 12 tests covering access rules (owner/editor/viewer/stranger), share/revoke, persistence of formatted HTML, validation, file import and sanitisation
- `next build` passes type-checking
- Scripted API smoke test against the production server: login, create, rename, share, viewer write rejected, import `.md`, unsupported type rejected, unauthenticated 401
- [Add your own manual browser check of the editor toolbar, mobile width and the second-user sharing flow — this was not covered by the scripted checks.]
