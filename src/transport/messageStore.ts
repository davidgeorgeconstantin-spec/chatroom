import type { HistoryPage, Message } from '@/types';
import { seedRoom } from './seed';

const KEY = (roomId: string) => `chatroom:messages:${roomId}`;
const MAX = 400;

/** localStorage "database" shared by all tabs of the same browser. */
export function readRoom(roomId: string): Message[] {
  const raw = localStorage.getItem(KEY(roomId));
  if (raw) return JSON.parse(raw) as Message[];
  const seeded = seedRoom(roomId);
  writeRoom(roomId, seeded);
  return seeded;
}

export function writeRoom(roomId: string, messages: Message[]) {
  try {
    localStorage.setItem(KEY(roomId), JSON.stringify(messages.slice(-MAX)));
  } catch {
    // quota exceeded (too many images) → keep only the newest half
    localStorage.setItem(KEY(roomId), JSON.stringify(messages.slice(-MAX / 4)));
  }
}

export function upsertMessage(m: Message) {
  const all = readRoom(m.roomId);
  const i = all.findIndex((x) => x.id === m.id);
  if (i === -1) all.push(m);
  else all[i] = m;
  writeRoom(m.roomId, all);
}

/** Cursor pagination: "give me `limit` messages older than `before`". */
export function pageRoom(roomId: string, before = Infinity, limit = 25): HistoryPage {
  const older = readRoom(roomId).filter((m) => m.createdAt < before);
  return { messages: older.slice(-limit), hasMore: older.length > limit };
}
