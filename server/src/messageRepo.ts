import type { Message } from './types.js';

/** In-memory message history per room. Swap for PostgreSQL/Redis to survive restarts. */
export class MessageRepo {
  private rooms = new Map<string, Message[]>();
  constructor(private maxPerRoom = 1000) {}

  add(m: Message) {
    const list = this.rooms.get(m.roomId) ?? [];
    list.push(m);
    if (list.length > this.maxPerRoom) list.shift();
    this.rooms.set(m.roomId, list);
  }

  find(roomId: string, id: string) {
    return this.rooms.get(roomId)?.find((m) => m.id === id);
  }

  /** Cursor pagination: messages older than `before`, newest `limit` of them. */
  page(roomId: string, before = Infinity, limit = 25) {
    const older = (this.rooms.get(roomId) ?? []).filter((m) => m.createdAt < before);
    return { messages: older.slice(-limit), hasMore: older.length > limit };
  }
}
