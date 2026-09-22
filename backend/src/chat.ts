import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import { ChatStore } from './store';
import type { Ack, ChatMessage, OnlineUser, Room } from './types';
import { validAlias, validClientId, validMessage, validRoomId } from './validation';

interface JoinPayload { roomId: string; clientId: string; alias: string }
interface JoinResult { room: Room; messages: ChatMessage[]; onlineUsers: OnlineUser[] }

export function attachChat(httpServer: HttpServer, store: ChatStore): Server {
  const io = new Server(httpServer, { cors: { origin: true } });

  function onlineUsers(roomId: string): OnlineUser[] {
    const users = new Map<string, OnlineUser>();
    for (const socket of io.sockets.sockets.values()) {
      if (socket.connected && socket.data.roomId === roomId && socket.data.clientId && socket.data.alias) {
        users.set(socket.data.clientId, { clientId: socket.data.clientId, alias: socket.data.alias });
      }
    }
    return [...users.values()].sort((a, b) => a.alias.localeCompare(b.alias));
  }

  function broadcastPresence(roomId: string): void {
    io.to(roomId).emit('presence:update', onlineUsers(roomId));
  }

  io.on('connection', (socket) => {
    socket.on('room:join', (payload: JoinPayload, ack?: Ack<JoinResult>) => {
      if (!payload || !validRoomId(payload.roomId) || !validClientId(payload.clientId)) {
        ack?.({ ok: false, error: 'Invalid room or guest identity.' });
        return;
      }
      const alias = validAlias(payload.alias);
      const room = store.getRoom(payload.roomId);
      if (!alias || !room) {
        ack?.({ ok: false, error: !room ? 'Room not found.' : 'Alias must be 2–24 characters.' });
        return;
      }

      const previousRoom = socket.data.roomId as string | undefined;
      if (previousRoom && previousRoom !== room.id) {
        socket.leave(previousRoom);
        socket.to(previousRoom).emit('typing:update', { clientId: socket.data.clientId, alias: socket.data.alias, isTyping: false });
      }
      socket.data.roomId = room.id;
      socket.data.clientId = payload.clientId;
      socket.data.alias = alias;
      socket.join(room.id);

      ack?.({ ok: true, data: { room, messages: store.recentMessages(room.id), onlineUsers: onlineUsers(room.id) } });
      if (previousRoom && previousRoom !== room.id) broadcastPresence(previousRoom);
      broadcastPresence(room.id);
    });

    socket.on('message:send', (body: unknown, ack?: Ack<ChatMessage>) => {
      const roomId = socket.data.roomId as string | undefined;
      const clientId = socket.data.clientId as string | undefined;
      const alias = socket.data.alias as string | undefined;
      if (!roomId || !clientId || !alias) {
        ack?.({ ok: false, error: 'Join a room before sending messages.' });
        return;
      }
      const messageBody = validMessage(body);
      if (!messageBody) {
        ack?.({ ok: false, error: 'Message must be 1–1000 characters.' });
        return;
      }
      const now = Date.now();
      if (now - (socket.data.lastMessageAt || 0) < 300) {
        ack?.({ ok: false, error: 'Please wait before sending another message.' });
        return;
      }
      socket.data.lastMessageAt = now;
      const message = store.addMessage(roomId, clientId, alias, messageBody);
      io.to(roomId).emit('message:new', message);
      ack?.({ ok: true, data: message });
    });

    socket.on('typing:set', (isTyping: unknown) => {
      if (!socket.data.roomId || typeof isTyping !== 'boolean') return;
      socket.to(socket.data.roomId).emit('typing:update', {
        clientId: socket.data.clientId,
        alias: socket.data.alias,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      const roomId = socket.data.roomId as string | undefined;
      if (!roomId) return;
      socket.to(roomId).emit('typing:update', { clientId: socket.data.clientId, alias: socket.data.alias, isTyping: false });
      broadcastPresence(roomId);
    });
  });

  return io;
}
