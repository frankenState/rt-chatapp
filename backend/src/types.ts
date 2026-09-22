export interface Room {
  id: string;
  name: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  clientId: string;
  alias: string;
  body: string;
  createdAt: string;
}

export interface OnlineUser {
  clientId: string;
  alias: string;
}

export type Ack<T> = (result: { ok: true; data: T } | { ok: false; error: string }) => void;
