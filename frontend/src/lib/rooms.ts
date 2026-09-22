import type { Room } from '../types';

export function roomIdFromPath(): string {
  const match = window.location.pathname.match(/^\/rooms\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : 'global';
}

export function roomPath(roomId: string): string {
  return roomId === 'global' ? '/' : `/rooms/${encodeURIComponent(roomId)}`;
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
