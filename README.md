# Gather: real-time chat app

Gather is a local chat app for demonstrating AI agentic development on an existing project. Visitors use an alias or a generated guest name. They can talk in the global chat, create rooms, and invite others through room links. Messages are saved in SQLite; presence and typing indicators are live.

## Quick start

Use Node.js 22.13 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite frontend proxies API and Socket.IO traffic to the Express backend on port 3001.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend and backend together |
| `npm run typecheck` | Check TypeScript in both workspaces |
| `npm test` | Run backend integration tests |
| `npm run build` | Build frontend and compile backend |
| `npm run start` | Serve the built app at `http://localhost:3001` |

`backend/data/chat.sqlite` is created automatically and ignored by Git. Set `DATABASE_PATH`, `PORT`, or `HOST` if you need different local settings. For another device on the same network, open the host computer's LAN IP rather than `localhost`; room links use the address in the browser.

## Project guide

- [AGENTS.md](AGENTS.md): concise instructions for any coding agent in this repository.
- [knowledge.md](knowledge.md): architecture, data model, routes, and socket contract.
- [docs/development-workflow.md](docs/development-workflow.md): a repeatable process for agent-assisted changes.
- [docs/testing.md](docs/testing.md): automated checks and a two-browser manual check.
- [docs/task-examples.md](docs/task-examples.md): sample prompts for the seminar.

## Branches for the seminar

`master` is the working app without Markdown workflow files. `with-agentic-workflow` starts from the same app commit and adds this guidance. Compare the branches to show how an agent can gain project context before making a bounded change.

There is no sign-in or access control. Anyone with a room link can join and read its recent history. This app is intended for local teaching, not public deployment.
