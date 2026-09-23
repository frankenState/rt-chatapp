# Project skills

Skills package focused instructions and references that an agent loads when a task matches the skill. `AGENTS.md` remains the short, always-on repository contract; skills hold specialized workflows that would add noise to every task.

## Included skills

| Skill | Origin | Use it for |
| --- | --- | --- |
| `realtime-chat-feature` | Manually authored for Gather | Changes to rooms, Socket.IO events, messages, presence, typing, acknowledgements, or SQLite history |
| `vercel-react-best-practices` | Installed from [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices), MIT, version 1.0.0 | Writing, reviewing, or refactoring React code with relevant performance guidance |

Both canonical copies live under `.agents/skills/` and are committed to this branch. Keeping the installed skill inside the repository makes the teaching example reproducible for everyone who checks out the branch.

The Vercel skill also contains Next.js and server-rendering advice. Gather uses Vite, so apply only its React, browser, rendering, JavaScript, and bundle rules that match this codebase. Do not add Next.js APIs or dependencies to satisfy a skill example.

## Cross-agent portability

The skill folders use the open Agent Skills `SKILL.md` format. Their instructions avoid requiring a particular model or agent product. Discovery locations still differ:

| Coding agent | Repository discovery path |
| --- | --- |
| Codex | `.agents/skills/<skill-name>/SKILL.md` |
| Freebuff | `.agents/skills/<skill-name>/SKILL.md` |
| Claude Code | `.claude/skills/<skill-name>/SKILL.md` |

Codex and Freebuff can use the committed paths directly. To try the same skills with Claude Code without maintaining a second committed copy, copy the desired skill folder into `.claude/skills/` in the working tree:

```powershell
New-Item -ItemType Directory -Force .claude\skills | Out-Null
Copy-Item -Recurse .agents\skills\realtime-chat-feature .claude\skills\
Copy-Item -Recurse .agents\skills\react-best-practices .claude\skills\
```

Treat those Claude copies as local adapters. The canonical skill source remains under `.agents/skills/`; edit it there and recopy it when needed. The `.claude/skills/` adapter directory is ignored so duplicate copies do not drift into commits.

## Demonstration sequence

1. Show how `AGENTS.md` and `knowledge.md` provide repository context on every relevant task.
2. Ask for a cross-layer chat change and show `realtime-chat-feature` loading only for that specialized workflow.
3. Ask for a React performance review and show the installed Vercel skill loading instead.
4. Review the skill descriptions and explain that accurate descriptions control activation.
5. Inspect the plan and diff, then verify that a skill informs the work without replacing human review.
