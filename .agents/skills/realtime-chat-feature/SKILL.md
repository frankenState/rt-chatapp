---
name: realtime-chat-feature
description: Plan, implement, or review Gather features that affect Socket.IO rooms, messages, presence, typing, or SQLite history across the React frontend and Express backend. Use for realtime chat behavior and contract changes; do not use for unrelated styling or documentation-only work.
---

# Realtime Chat Feature Workflow

Use this workflow for changes that cross the live chat boundary. Start by reading `knowledge.md`, then inspect the existing event handler, its caller, validation, storage path, and relevant integration test.

## Classify the state

Decide where the new state belongs before editing:

- Persist room and message data that must survive a server restart in SQLite through `backend/src/store.ts`.
- Keep connection state such as online users and typing indicators in Socket.IO memory through `backend/src/chat.ts`.
- Keep browser identity and local preferences in frontend storage only when they are not authentication or authorization.

Record any intentional exception in `knowledge.md`.

## Trace the contract

Describe the complete flow before changing it:

1. The React component or hook that initiates the action.
2. The HTTP route or Socket.IO event and its payload.
3. Backend validation and failure acknowledgement.
4. SQLite operation or in-memory state update.
5. The server event returned to clients.
6. The frontend state and UI that consume the result.

Update both `frontend/src/types.ts` and `backend/src/types.ts` when a shared data shape changes. This project intentionally does not publish a shared types package.

## Preserve these invariants

- A socket must join a valid room before sending messages or typing events.
- Message history, presence, and typing updates remain isolated by room ID.
- The seeded global room continues to use the ID `global`; custom room IDs remain UUIDs.
- Aliases are 2–24 characters, room names are 2–50 characters, and messages are 1–1000 characters after backend normalization.
- Anyone with a valid room link may join and read that room's recent history. Guest IDs provide UI identity only.
- Message bodies remain plain text. Do not introduce raw HTML rendering.
- Every acknowledgement handles both success and failure without leaving the UI in a pending state.
- Disconnects and room switches clear transient typing state and update presence.

If the requested behavior conflicts with an invariant, explain the impact and update the project documentation as part of the change.

## Implement narrowly

Keep HTTP routes in `backend/src/app.ts`, socket behavior in `backend/src/chat.ts`, persistence in `backend/src/store.ts`, validation in `backend/src/validation.ts`, and connection state in `frontend/src/hooks/useChat.ts`. Reuse the current acknowledgement envelope instead of creating a second response style.

Avoid unrelated component cleanup during a contract change. Prefer one event with a clear payload over several events that duplicate state.

## Verify the change

Add or update an integration test when the change affects validation, room isolation, persistence, or acknowledgement behavior. Then run:

```bash
npm run typecheck
npm test
npm run build
```

For visible realtime behavior, follow the two-browser check in `docs/testing.md`. Test the successful path, the invalid or disconnected path, another room, refresh or reconnect when relevant, and the global room.

Report the changed contract, the evidence from completed checks, and any check that could not run. Update `knowledge.md` when a route, event, data shape, schema, limit, or deliberate constraint changes.
