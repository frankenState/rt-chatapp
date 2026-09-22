import type { Guest } from '../types';

const key = 'gather-guest';

export function getSavedGuest(): Guest | null {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    const guest = JSON.parse(value) as Guest;
    return typeof guest.clientId === 'string' && typeof guest.alias === 'string' ? guest : null;
  } catch { return null; }
}

export function saveGuest(guest: Guest): void {
  localStorage.setItem(key, JSON.stringify(guest));
}

export function guestId(): string {
  return getSavedGuest()?.clientId || crypto.randomUUID();
}

export function generatedAlias(): string {
  return `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
}
