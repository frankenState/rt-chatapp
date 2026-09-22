import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import { io as clientIo, type Socket } from 'socket.io-client';
import request from 'supertest';
import { createApp } from '../src/app';
import { attachChat } from '../src/chat';
import { ChatStore } from '../src/store';
import type { Ack, ChatMessage, Room } from '../src/types';

const store = new ChatStore(':memory:');
const app = createApp(store);
const server = createServer(app);
const io = attachChat(server, store);
let baseUrl = '';
const clients: Socket[] = [];

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert(address && typeof address !== 'string');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  clients.forEach((client) => client.disconnect());
  await new Promise<void>((resolve) => io.close(() => resolve()));
  store.close();
});

async function connect(): Promise<Socket> {
  const socket = clientIo(baseUrl, { transports: ['websocket'], reconnection: false });
  clients.push(socket);
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });
  return socket;
}

function emitAck<T>(socket: Socket, event: string, value: unknown): Promise<Ack<T>> {
  return new Promise((resolve) => socket.emit(event, value, resolve));
}

test('creates rooms and rejects invalid names', async () => {
  const invalid = await request(app).post('/api/rooms').send({ name: 'x' });
  assert.equal(invalid.status, 400);
  const created = await request(app).post('/api/rooms').send({ name: '  Design team  ' });
  assert.equal(created.status, 201);
  assert.equal(created.body.room.name, 'Design team');
  const found = await request(app).get(`/api/rooms/${created.body.room.id}`);
  assert.equal(found.status, 200);
});

test('keeps messages in their room and returns saved history to link visitors', async () => {
  const roomA = store.createRoom('Room A');
  const roomB = store.createRoom('Room B');
  const alice = await connect();
  const bob = await connect();
  const aliceId = randomUUID();
  const bobId = randomUUID();
  const joinedA = await emitAck<{ room: Room; messages: ChatMessage[] }>(alice, 'room:join', { roomId: roomA.id, clientId: aliceId, alias: 'Alice' });
  const joinedB = await emitAck<{ room: Room; messages: ChatMessage[] }>(bob, 'room:join', { roomId: roomB.id, clientId: bobId, alias: 'Bob' });
  assert.equal(joinedA.ok, true);
  assert.equal(joinedB.ok, true);

  const sent = await emitAck<ChatMessage>(alice, 'message:send', 'Hello from A');
  assert.equal(sent.ok, true);
  assert.equal(store.recentMessages(roomA.id).length, 1);
  assert.equal(store.recentMessages(roomB.id).length, 0);

  const visitor = await connect();
  const joinedLater = await emitAck<{ room: Room; messages: ChatMessage[] }>(visitor, 'room:join', { roomId: roomA.id, clientId: randomUUID(), alias: 'Visitor' });
  assert.equal(joinedLater.ok, true);
  if (joinedLater.ok) assert.equal(joinedLater.data.messages[0].body, 'Hello from A');
});

test('requires joining a room before sending', async () => {
  const socket = await connect();
  const result = await emitAck<ChatMessage>(socket, 'message:send', 'No room');
  assert.equal(result.ok, false);
});
