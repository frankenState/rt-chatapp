import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { ChatMessage, Room } from './types';

interface RoomRow { id: string; name: string; created_at: string }
interface MessageRow {
  id: string;
  room_id: string;
  client_id: string;
  alias: string;
  body: string;
  created_at: string;
}

const toRoom = (row: RoomRow): Room => ({ id: row.id, name: row.name, createdAt: row.created_at });
const toMessage = (row: MessageRow): ChatMessage => ({
  id: row.id,
  roomId: row.room_id,
  clientId: row.client_id,
  alias: row.alias,
  body: row.body,
  createdAt: row.created_at,
});

export class ChatStore {
  private db: DatabaseSync;

  constructor(filePath: string) {
    if (filePath !== ':memory:') mkdirSync(path.dirname(filePath), { recursive: true });
    this.db = new DatabaseSync(filePath);
    this.db.exec('PRAGMA foreign_keys = ON');
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL REFERENCES rooms(id),
        client_id TEXT NOT NULL,
        alias TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS messages_room_order ON messages(room_id, created_at DESC, id DESC);
    `);
    this.db.prepare('INSERT OR IGNORE INTO rooms (id, name, created_at) VALUES (?, ?, ?)')
      .run('global', 'Global chat', new Date().toISOString());
  }

  getRoom(id: string): Room | null {
    const row = this.db.prepare('SELECT id, name, created_at FROM rooms WHERE id = ?').get(id) as RoomRow | undefined;
    return row ? toRoom(row) : null;
  }

  createRoom(name: string): Room {
    const room: Room = { id: randomUUID(), name, createdAt: new Date().toISOString() };
    this.db.prepare('INSERT INTO rooms (id, name, created_at) VALUES (?, ?, ?)')
      .run(room.id, room.name, room.createdAt);
    return room;
  }

  recentMessages(roomId: string, limit = 50): ChatMessage[] {
    const rows = this.db.prepare(`
      SELECT id, room_id, client_id, alias, body, created_at
      FROM messages WHERE room_id = ? ORDER BY created_at DESC, id DESC LIMIT ?
    `).all(roomId, limit) as unknown as MessageRow[];
    return rows.reverse().map(toMessage);
  }

  addMessage(roomId: string, clientId: string, alias: string, body: string): ChatMessage {
    const message: ChatMessage = {
      id: randomUUID(), roomId, clientId, alias, body, createdAt: new Date().toISOString(),
    };
    this.db.prepare(`
      INSERT INTO messages (id, room_id, client_id, alias, body, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(message.id, roomId, clientId, alias, body, message.createdAt);
    return message;
  }

  close(): void { this.db.close(); }
}
