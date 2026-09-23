# Testing guide

## Automated checks

Run these from the repository root after changing behavior:

```bash
npm run typecheck
npm test
npm run build
```

The integration tests start an in-memory SQLite database and a temporary HTTP/Socket.IO server. They check room creation validation, room-specific message persistence and history, and rejection of messages before a room is joined.

To check the built app, run `npm run start` after building and open `http://localhost:3001`. A direct room URL should serve the frontend as well.

## Two-browser live check

Use separate browser profiles or an ordinary and a private window so each gets a different guest ID.

1. Start `npm run dev`; open `http://localhost:5173` in both windows.
2. Enter different aliases. Confirm both appear in Global chat's online list.
3. Send a message in one window. Confirm it appears in both windows with the correct author and time.
4. Type without sending. Confirm the other window shows a typing indicator, then that it disappears.
5. Create a room and copy its link. Return to Global chat and confirm the room remains in the sidebar and can be reopened. Refresh and confirm it is still listed. Open the copied link in the second window and confirm both users appear online in that room.
6. Send a room message. Confirm it does not appear in Global chat or another room.
7. Refresh the room link. Confirm recent room messages return from SQLite and the alias is retained for that browser.
8. Stop and restart the server. Confirm saved messages remain. Confirm online counts reflect only current connections.

If checking from another device on the LAN, open the host's LAN IP instead of `localhost`. In development use port 5173; for the built app use port 3001. A firewall may need to allow the port.

## Change-specific checks

- UI-only change: inspect narrow and wide layouts, keyboard interaction, loading, empty, and error states.
- Socket change: use two browser windows and check reconnecting, room switching, and room isolation.
- Database change: run tests against a new database and an existing local database; avoid committing `backend/data/`.
- API change: check validation errors as well as the successful path.

Report exactly which checks ran. If a browser or environment is unavailable, state that limit instead of assuming the UI works.
