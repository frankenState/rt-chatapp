import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ChatStore } from './store';
import { validRoomName } from './validation';

export function createApp(store: ChatStore) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.get('/api/rooms/:id', (req, res) => {
    const room = store.getRoom(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found.' });
    return res.json({ room });
  });

  app.post('/api/rooms', (req, res) => {
    const name = validRoomName(req.body?.name);
    if (!name) return res.status(400).json({ error: 'Room name must be 2–50 characters.' });
    const room = store.createRoom(name);
    return res.status(201).json({ room });
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  const indexHtml = path.join(frontendDist, 'index.html');
  if (existsSync(indexHtml)) {
    app.use(express.static(frontendDist));
    app.get('*', (_req, res) => res.sendFile(indexHtml));
  }

  return app;
}
