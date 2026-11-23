import type { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import { z } from 'zod';
import { MessageRepo } from './messageRepo.js';
import type { ChatEvent, User } from './types.js';

const ROOMS = ['general', 'react', 'jobs', 'random'] as const;
const userSchema = z.object({ id: z.string().min(1).max(64), name: z.string().trim().min(2).max(20), color: z.string().regex(/^#[0-9a-f]{6}$/i) });
const messageSchema = z.object({
  id: z.string().min(1).max(64),
  roomId: z.enum(ROOMS),
  text: z.string().max(2000),
  image: z.string().startsWith('data:image/').max(400_000).optional(), // ~300 KB max
  createdAt: z.number(),
});

/**
 * Socket.io server:
 * - presence: who is connected (a user can have several tabs → we count sockets per user)
 * - rooms: socket.join(roomId) so events only go to people in that room
 * - typing, reactions, history pagination (with acknowledgement callback)
 */
export function createChatServer(http: HttpServer, opts: { origin: string; repo?: MessageRepo; rateLimitPerMinute?: number }) {
  const io = new Server(http, { cors: { origin: opts.origin }, maxHttpBufferSize: 1e6 });
  const repo = opts.repo ?? new MessageRepo();
  const sockets = new Map<string, { user: User; count: number }>();
  const limit = opts.rateLimitPerMinute ?? 30;

  const broadcastPresence = () => io.emit('chat:event', { type: 'presence', users: [...sockets.values()].map((s) => s.user) } satisfies ChatEvent);

  // Authentication step: refuse connections without a valid user
  io.use((socket, next) => {
    const parsed = userSchema.safeParse(socket.handshake.auth?.user);
    if (!parsed.success) return next(new Error('invalid user'));
    socket.data.user = { ...parsed.data, isBot: false } satisfies User;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as User;
    const entry = sockets.get(user.id) ?? { user, count: 0 };
    entry.count++;
    sockets.set(user.id, entry);
    broadcastPresence();

    let sent: number[] = [];

    socket.on('room:join', (roomId: string) => {
      if (!ROOMS.includes(roomId as (typeof ROOMS)[number])) return;
      ROOMS.forEach((r) => r !== roomId && socket.leave(r));
      void socket.join(roomId);
    });

    socket.on('message:send', (raw: unknown) => {
      const parsed = messageSchema.safeParse(raw);
      if (!parsed.success) return socket.emit('chat:error', 'Invalid message');
      // simple sliding-window rate limit per socket
      const now = Date.now();
      sent = sent.filter((t) => now - t < 60_000);
      if (sent.length >= limit) return socket.emit('chat:error', 'Too many messages');
      sent.push(now);

      const message = { ...parsed.data, user, createdAt: now, reactions: {} }; // trust the server clock and identity, not the client
      repo.add(message);
      io.to(message.roomId).emit('chat:event', { type: 'message', message } satisfies ChatEvent);
    });

    socket.on('typing', ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
      socket.to(roomId).emit('chat:event', { type: 'typing', roomId, user, isTyping: !!isTyping } satisfies ChatEvent);
    });

    socket.on('reaction:toggle', ({ roomId, messageId, emoji }: { roomId: string; messageId: string; emoji: string }) => {
      const m = repo.find(roomId, messageId);
      if (!m || typeof emoji !== 'string' || emoji.length > 8) return;
      const users = m.reactions[emoji] ?? [];
      m.reactions[emoji] = users.includes(user.id) ? users.filter((u) => u !== user.id) : [...users, user.id];
      io.to(roomId).emit('chat:event', { type: 'reaction', roomId, messageId, emoji, userId: user.id } satisfies ChatEvent);
    });

    socket.on('history', ({ roomId, before, limit: n }: { roomId: string; before?: number; limit?: number }, ack: (p: unknown) => void) => {
      if (typeof ack === 'function') ack(repo.page(roomId, before, Math.min(n ?? 25, 100)));
    });

    socket.on('disconnect', () => {
      const e = sockets.get(user.id);
      if (e && --e.count <= 0) sockets.delete(user.id);
      broadcastPresence();
    });
  });

  return io;
}
