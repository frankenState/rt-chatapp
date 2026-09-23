# Project knowledge

## Purpose and user flow

Gather is a small local app for teaching agentic development on an existing codebase. A visitor chooses an alias or accepts a generated name. The browser stores a guest UUID and alias in local storage. The visitor enters the global chat or follows a `/rooms/:id` link. Anyone may create a named room and copy its URL. There are no passwords, owners, private-room permissions, or file uploads.

## Structure

```text
realtime-chatapp/
  frontend/src/
    App.tsx                Navigation and page composition
    components/            Alias gate, sidebar, messages, composer, room dialog
    hooks/useChat.ts       Socket connection and live chat state
    lib/                   Guest storage, URL and room API helpers
    types.ts               Browser-side data types
  backend/src/
    index.ts               Server startup and local configuration
    app.ts                 HTTP API and built frontend serving
    chat.ts                Socket.IO room, message, presence, typing events
    store.ts               SQLite schema and data access
    validation.ts          Backend input rules
    types.ts               Server-side data types
  backend/tests/           Integration tests
```

The root uses npm workspaces. In development Vite serves the frontend on port 5173 and proxies `/api` and `/socket.io` to Express on port 3001. After `npm run build`, Express serves `frontend/dist` on port 3001, including direct room URLs.

## Persistent data

SQLite lives at `backend/data/chat.sqlite` by default. `rooms` has `id`, `name`, and `created_at`. The seeded global room has ID `global`; other room IDs are UUIDs. `messages` has `id`, `room_id`, `client_id`, `alias`, `body`, and `created_at`. A foreign key ties each message to a room. New visitors receive the latest 50 messages for that room when they join. The browser holds up to 200 messages during a live session; older history has no pagination UI. It also stores metadata for rooms it creates or successfully visits under the versioned `gather-rooms-v1` local storage key, so those rooms remain available in the sidebar after navigation or refresh. This remembered list is a browser convenience, not access control.

Presence and typing are temporary Socket.IO state, not database rows. Online users are distinct guest IDs currently connected to a room. If the same guest opens multiple tabs, the online list shows one entry.

## HTTP contract

| Method and path | Result |
| --- | --- |
| `GET /api/health` | `{ status: "ok" }` |
| `GET /api/rooms/:id` | `{ room }` or 404 |
| `POST /api/rooms` with `{ name }` | `{ room }` with status 201 or validation error |

Room names are trimmed and must contain 2–50 characters. The API is used for creating rooms; joining and receiving history happen over Socket.IO.

## Socket.IO contract

| Direction | Event | Payload or result |
| --- | --- | --- |
| Client → server | `room:join` | `{ roomId, clientId, alias }`; acknowledgement returns `{ room, messages, onlineUsers }` or error |
| Client → server | `message:send` | Message text; acknowledgement returns the stored message or error |
| Client → server | `typing:set` | Boolean |
| Server → room | `message:new` | Stored message |
| Server → room | `presence:update` | Array of `{ clientId, alias }` |
| Server → room peers | `typing:update` | `{ clientId, alias, isTyping }` |

The server only accepts messages and typing events from a socket that joined a room. Alias length is 2–24 characters; message length is 1–1000 characters after trimming. A socket may send at most one message every 300 ms. React renders message bodies as plain text.

## Deliberate constraints

- The app is for local use. Room links are access links, not private invitations; anyone with one can read recent history.
- Guest IDs in local storage are for UI identity and presence, not authentication.
- File uploads, direct messages, moderation, and deployment are outside the baseline scope.
- Use Node.js 22.13 or newer because the backend uses `node:sqlite`.
