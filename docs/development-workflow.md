# Agent-assisted development workflow

Use this sequence when changing an existing project. It keeps the human in charge of the goal and gives the agent enough context to work safely.

## 1. Define a bounded task

Describe the current behavior, the desired behavior, and what is outside scope. Pick one change that can be demonstrated and checked in a short session. Example: “Add a character counter to the message composer without changing the send protocol.”

## 2. Give the agent project context

Point the agent to `AGENTS.md`, `knowledge.md`, and the relevant source files. Ask it to inspect the implementation before proposing edits. The source code is authoritative when a document has become stale; update the document as part of the change.

## 3. Ask for a concrete plan

The plan should name the files to touch, the user-visible result, and the checks to run. For a socket or database change, ask the agent to trace the event or data flow from the UI through the backend and back.

## 4. Implement a small change

Keep unrelated refactors out of the task. Preserve existing routes and event names unless the task requires a contract change. Add a test when it checks meaningful behavior, such as room isolation or persistence.

## 5. Verify the behavior

Run:

```bash
npm run typecheck
npm test
npm run build
```

Then use two browser windows for live behavior when relevant. See [testing.md](testing.md). Review the diff and confirm generated output and the SQLite data file are not staged.

## 6. Explain and record the result

Ask the agent to summarize the behavior change, evidence from checks, and remaining limitations. Update `knowledge.md` for changed structure, data, routes, or events. Commit only after the change is understandable and verified.

## Prompt template

```text
Read AGENTS.md and knowledge.md, then inspect the code for [feature].
Current behavior: [what happens now].
Desired behavior: [what the user should see].
Constraints: [what must remain working and what is out of scope].
First give a short plan with files and checks. Then implement it.
Run the relevant checks from docs/testing.md and report the results.
```

For this seminar, begin on `master` to demonstrate discovering the app and writing context files. Compare with `with-agentic-workflow` as a prepared reference. Work on a separate feature branch for each exercise so the baseline remains easy to reset.
