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
- [docs/skills.md](docs/skills.md): the two repository skills, their provenance, and cross-agent discovery.

## Repository skills

An agent skill is a folder whose `SKILL.md` contains focused instructions for a particular kind of work. `AGENTS.md` supplies the repository rules for every task, while a skill is loaded only when its description matches the task or when the prompt names it explicitly.

This branch includes two skills under `.agents/skills/`:

| Skill | Use it when | Source |
| --- | --- | --- |
| `realtime-chat-feature` | Changing rooms, messages, presence, typing, acknowledgements, or SQLite history across the frontend and backend | Written manually for Gather |
| `vercel-react-best-practices` | Writing, reviewing, or improving React components and client performance | Installed from Vercel's public agent skills repository |

The Vercel skill also contains Next.js guidance. Gather uses Vite, so agents should apply only the React and browser rules that fit this project.

### How to use a skill

1. Check out `with-agentic-workflow-v2` so the agent can discover `.agents/skills/`.
2. Describe the task normally. A capable agent can select a skill from its description.
3. Name the skill in the prompt when you want to demonstrate explicit activation, for example: `Use the realtime-chat-feature skill.`
4. Ask for a plan before implementation. The plan should identify the affected files, contracts, and checks.
5. Review the proposed changes and verification output. A skill provides instructions; it does not replace source inspection or human review.

### Example: a realtime feature

```text
Read AGENTS.md and knowledge.md. Use the realtime-chat-feature skill.
Add a room-scoped "user stopped typing" update when a user switches rooms.
Trace the event from the React hook through Socket.IO and back to clients.
Preserve room isolation and the global room. Before editing, list the files
you expect to change and the checks you will run. Then implement the change,
run the required checks, and summarize the evidence.
```

For this prompt, the skill tells the agent to inspect the frontend hook, socket handler, shared event types, validation, and relevant integration tests. It also reminds the agent to clear transient typing state and test the behavior with two browser windows.

### Example: a React review

```text
Use the vercel-react-best-practices skill. Review MessageList for avoidable
rerenders in this Vite app. Apply only relevant React guidance, make the
smallest justified change, and run typecheck and build.
```

Both skills use the open `SKILL.md` format. Codex and Freebuff discover the committed `.agents/skills/` copies directly. Claude Code uses a different repository path. See the [skills guide](docs/skills.md) for provenance, portability, and the Claude setup commands.

## Branches for the seminar

`master` is the working app without Markdown workflow files. `with-agentic-workflow` adds project instructions and workflow documents. `with-agentic-workflow-v2` builds on that branch with one manually authored skill and one locally installed skill. Compare the branches to show the progression from source code, to persistent context, to reusable on-demand workflows.

There is no sign-in or access control. Anyone with a room link can join and read its recent history. This app is intended for local teaching, not public deployment.
