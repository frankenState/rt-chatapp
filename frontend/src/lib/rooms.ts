import type { Room } from '../types';

const savedRoomsKey = 'gather-rooms-v1';

function isRoom(value: unknown): value is Room {
  if (!value || typeof value !== 'object') return false;
  const room = value as Partial<Room>;
  return typeof room.id === 'string'
    && room.id !== 'global'
    && typeof room.name === 'string'
    && typeof room.createdAt === 'string';
}

export function roomIdFromPath(): string {
  const match = window.location.pathname.match(/^\/rooms\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : 'global';
}

export function roomPath(roomId: string): string {
  return roomId === 'global' ? '/' : `/rooms/${encodeURIComponent(roomId)}`;
}

export function getSavedRooms(): Room[] {
  try {
    const value = localStorage.getItem(savedRoomsKey);
    if (!value) return [];
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    const ids = new Set<string>();
    return parsed.filter((room): room is Room => {
      if (!isRoom(room) || ids.has(room.id)) return false;
      ids.add(room.id);
      return true;
    });
  } catch { return []; }
}

export function addSavedRoom(rooms: Room[], room: Room): Room[] {
  if (room.id === 'global') return rooms;
  return [room, ...rooms.filter((savedRoom) => savedRoom.id !== room.id)];
}

export function saveRooms(rooms: Room[]): void {
  try { localStorage.setItem(savedRoomsKey, JSON.stringify(rooms)); }
  catch { /* Keep the in-memory room list available when storage is blocked. */ }
}

export async function createRoom(name: string): Promise<Room> {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const result = await response.json() as { room?: Room; error?: string };
  if (!response.ok || !result.room) throw new Error(result.error || 'Could not create the room.');
  return result.room;
}
