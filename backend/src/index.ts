import { createServer } from 'node:http';
import path from 'node:path';
import { createApp } from './app';
import { attachChat } from './chat';
import { ChatStore } from './store';

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../data/chat.sqlite');
const port = Number(process.env.PORT || 3001);
const store = new ChatStore(dbPath);
const server = createServer(createApp(store));
const io = attachChat(server, store);

server.listen(port, process.env.HOST || '0.0.0.0', () => {
  console.log(`Chat server listening on http://localhost:${port}`);
});

function shutdown(): void {
  io.close();
  server.close(() => {
    store.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
