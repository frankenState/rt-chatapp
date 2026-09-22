import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { Ack, ChatMessage, Guest, OnlineUser, Room } from '../types';

interface JoinData { room: Room; messages: ChatMessage[]; onlineUsers: OnlineUser[] }
type Status = 'connecting' | 'connected' | 'offline';

export function useChat(guest: Guest | null, roomId: string) {
  const socketRef = useRef<Socket | null>(null);
  const typingTimers = useRef<Map<string, number>>(new Map());
  const [status, setStatus] = useState<Status>('connecting');
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<OnlineUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRoom(null);
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    setError(null);
    if (!guest) return;

    setStatus('connecting');
    const socket = io({ autoConnect: false });
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('connecting');
      socket.emit('room:join', { roomId, clientId: guest.clientId, alias: guest.alias }, (result: Ack<JoinData>) => {
        if (!result.ok) {
          setError(result.error);
          setStatus('offline');
          return;
        }
        setRoom(result.data.room);
        setMessages(result.data.messages);
        setOnlineUsers(result.data.onlineUsers);
        setTypingUsers([]);
        setError(null);
        setStatus('connected');
      });
    });
    socket.on('connect_error', () => {
      setStatus('offline');
      setError('Could not reach the chat server. Retrying…');
    });
    socket.on('disconnect', () => {
      setStatus('offline');
      setTypingUsers([]);
    });
    socket.on('message:new', (message: ChatMessage) => {
      setMessages((current) => current.some((item) => item.id === message.id)
        ? current : [...current, message].slice(-200));
    });
    socket.on('presence:update', (users: OnlineUser[]) => setOnlineUsers(users));
    socket.on('typing:update', (user: OnlineUser & { isTyping: boolean }) => {
      const existingTimer = typingTimers.current.get(user.clientId);
      if (existingTimer) window.clearTimeout(existingTimer);
      setTypingUsers((current) => user.isTyping
        ? [...current.filter((item) => item.clientId !== user.clientId), user]
        : current.filter((item) => item.clientId !== user.clientId));
      if (user.isTyping) {
        const timer = window.setTimeout(() => {
          setTypingUsers((current) => current.filter((item) => item.clientId !== user.clientId));
          typingTimers.current.delete(user.clientId);
        }, 3000);
        typingTimers.current.set(user.clientId, timer);
      } else typingTimers.current.delete(user.clientId);
    });

    socket.connect();
    return () => {
      socket.disconnect();
      socketRef.current = null;
      for (const timer of typingTimers.current.values()) window.clearTimeout(timer);
      typingTimers.current.clear();
    };
  }, [guest?.clientId, guest?.alias, roomId]);

  const sendMessage = useCallback((body: string): Promise<void> => new Promise((resolve, reject) => {
    const socket = socketRef.current;
    if (!socket?.connected) return reject(new Error('You are offline. Please reconnect.'));
    let settled = false;
    const timer = window.setTimeout(() => {
      if (!settled) { settled = true; reject(new Error('Message timed out. Please try again.')); }
    }, 10000);
    socket.emit('message:send', body, (result: Ack<ChatMessage>) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (result.ok) resolve();
      else reject(new Error(result.error));
    });
  }), []);

  const setTyping = useCallback((value: boolean) => socketRef.current?.emit('typing:set', value), []);

  return { status, room, messages, onlineUsers, typingUsers, error, sendMessage, setTyping };
}
