# Agent instructions

This repository is a local teaching app. Keep changes small enough to explain and verify during a seminar. Read [knowledge.md](knowledge.md) before changing behavior and [docs/development-workflow.md](docs/development-workflow.md) for the working sequence.

## Project boundaries

- `frontend/` is Vite, React, TypeScript, and Tailwind CSS. Keep reusable UI in `frontend/src/components/`, browser helpers in `frontend/src/lib/`, and connection state in `frontend/src/hooks/`.
- `backend/` is Express, Socket.IO, TypeScript, and Node's built-in SQLite module. HTTP routes live in `backend/src/app.ts`, socket events in `backend/src/chat.ts`, persistence in `backend/src/store.ts`, and input rules in `backend/src/validation.ts`.
- The root npm scripts are the supported way to run and verify both workspaces.
- Preserve the account-free guest flow, global chat, shareable rooms, room-scoped presence and typing, and message history unless the task explicitly changes them.

## Before editing

1. Locate the relevant code and read its caller and test. State the user-visible behavior to change.
2. Check whether the change affects the HTTP or Socket.IO contract in [knowledge.md](knowledge.md).
3. Make a short plan: files, expected behavior, and verification.

## While editing

- Use existing components, types, and validation helpers where they fit. Prefer clear code over a new abstraction for one use.
- Validate untrusted input on the backend. Render message text as text, not HTML.
- Keep room data isolated by room ID. A room link is intentionally sufficient to join and read history.
- Keep generated output (`dist/`), installed packages (`node_modules/`), and the local SQLite data directory out of commits.
- Update `knowledge.md` if the architecture, schema, route, or event contract changes. Update the testing guide if verification steps change.

## Verify and report

Run `npm run typecheck`, `npm test`, and `npm run build` for behavior changes. For UI or live event changes, also follow the relevant checks in [docs/testing.md](docs/testing.md). Report what changed, which checks passed, and any remaining limitation. Do not claim a check passed unless it ran.
