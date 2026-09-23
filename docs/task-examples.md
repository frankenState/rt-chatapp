# Seminar task examples

These prompts illustrate how to give an agent context, a bounded goal, constraints, and evidence requirements. Adjust them for the students' own capstone projects.

## Example 1: improve an existing component

```text
Read AGENTS.md and knowledge.md. Inspect MessageComposer and its caller.
Add a visible character counter that appears after 800 characters and shows
the remaining characters up to the existing 1,000-character limit. Preserve
Enter to send, Shift+Enter for a new line, and the current socket protocol.
First list the files you expect to change and how you will verify the result.
Then implement it, run typecheck and build, and report what you checked in
the browser. Do not change message length validation on the server.
```

For the component task above, the agent can use `vercel-react-best-practices` because the change is contained in React.

## Example 2: trace a bug across layers

```text
Read AGENTS.md, knowledge.md, and docs/testing.md. Investigate this bug:
[describe steps to reproduce and expected/actual behavior]. Trace the flow
from the React UI through Socket.IO and SQLite where relevant. Identify the
root cause before editing. Make the smallest fix that addresses it, add a
meaningful regression test if feasible, run the relevant checks, and report
the evidence. Keep global chat and other rooms working.
```

For a bug involving messages, rooms, presence, typing, or reconnection, ask the agent to use `realtime-chat-feature`.

## Example 3: update a contract with documentation

```text
Read AGENTS.md and knowledge.md. Add a room description of at most 160
characters during room creation and display it in the room header. Plan the
schema migration for an existing SQLite database, the API response, and the
React form before editing. Keep descriptions optional so existing rooms work.
Update knowledge.md for the schema and API contract, add tests for old and new
rooms, run typecheck, tests, and build, then summarize the change and risks.
```

## Capstone project adaptation

Ask each group to create its own `AGENTS.md` and a concise knowledge file for its project. The files should describe actual folders, commands, data flow, constraints, and verification. The group should then request one small feature or refactor from an agent, show the diff and checks, and explain how the documentation helped the agent work in the existing codebase.
