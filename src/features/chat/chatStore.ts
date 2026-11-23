import { create } from 'zustand';
import { toggleReaction } from '@/lib/reactions';
import type { ConnectionStatus, Message, User } from '@/types';

interface RoomState {
  messages: Message[];
  hasMore: boolean;
  loaded: boolean;
}

interface ChatState {
  rooms: Record<string, RoomState>;
  typing: Record<string, Record<string, User>>; // roomId → userId → user
  online: User[];
  status: ConnectionStatus;
  unread: Record<string, number>;
  activeRoom: string | null;

  setHistory: (roomId: string, messages: Message[], hasMore: boolean, prepend: boolean) => void;
  addMessage: (m: Message, myId: string | undefined) => void;
  applyReaction: (roomId: string, messageId: string, emoji: string, userId: string) => void;
  setTyping: (roomId: string, user: User, isTyping: boolean) => void;
  setOnline: (users: User[]) => void;
  setStatus: (s: ConnectionStatus) => void;
  setActiveRoom: (roomId: string) => void;
}

const empty: RoomState = { messages: [], hasMore: true, loaded: false };

export const useChat = create<ChatState>((set) => ({
  rooms: {},
  typing: {},
  online: [],
  status: 'connecting',
  unread: {},
  activeRoom: null,

  setHistory: (roomId, messages, hasMore, prepend) =>
    set((s) => {
      const room = s.rooms[roomId] ?? empty;
      const known = new Set(room.messages.map((m) => m.id));
      const fresh = messages.filter((m) => !known.has(m.id));
      return { rooms: { ...s.rooms, [roomId]: { messages: prepend ? [...fresh, ...room.messages] : [...room.messages, ...fresh], hasMore, loaded: true } } };
    }),

  addMessage: (m, myId) =>
    set((s) => {
      const room = s.rooms[m.roomId] ?? empty;
      if (room.messages.some((x) => x.id === m.id)) return s; // de-duplicate
      const typing = { ...s.typing, [m.roomId]: { ...s.typing[m.roomId] } };
      delete typing[m.roomId]![m.user.id]; // a sent message ends "typing…"
      const isUnread = m.roomId !== s.activeRoom && m.user.id !== myId;
      return {
        rooms: { ...s.rooms, [m.roomId]: { ...room, messages: [...room.messages, m] } },
        typing,
        unread: isUnread ? { ...s.unread, [m.roomId]: (s.unread[m.roomId] ?? 0) + 1 } : s.unread,
      };
    }),

  applyReaction: (roomId, messageId, emoji, userId) =>
    set((s) => {
      const room = s.rooms[roomId];
      if (!room) return s;
      return { rooms: { ...s.rooms, [roomId]: { ...room, messages: room.messages.map((m) => (m.id === messageId ? toggleReaction(m, emoji, userId) : m)) } } };
    }),

  setTyping: (roomId, user, isTyping) =>
    set((s) => {
      const room = { ...s.typing[roomId] };
      if (isTyping) room[user.id] = user;
      else delete room[user.id];
      return { typing: { ...s.typing, [roomId]: room } };
    }),

  setOnline: (online) => set({ online }),
  setStatus: (status) => set({ status }),
  setActiveRoom: (roomId) => set((s) => ({ activeRoom: roomId, unread: { ...s.unread, [roomId]: 0 } })),
}));
