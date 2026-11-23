import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { io as connect, type Socket } from 'socket.io-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createChatServer } from '../src/chatServer.js';
import { MessageRepo } from '../src/messageRepo.js';

let http: Server;
let url: string;
const clients: Socket[] = [];

const user = (id: string) => ({ id, name: `User ${id}`, color: '#10b981' });
function client(id: string): Promise<Socket> {
  const s = connect(url, { auth: { user: user(id) }, transports: ['websocket'], forceNew: true });
  clients.push(s);
  return new Promise((resolve, reject) => {
    s.on('connect', () => resolve(s));
    s.on('connect_error', reject);
  });
}
const nextEvent = (s: Socket, type: string) => new Promise<Record<string, unknown>>((resolve) => {
  const h = (e: { type: string }) => e.type === type && (s.off('chat:event', h), resolve(e as Record<string, unknown>));
  s.on('chat:event', h);
});
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

beforeEach(async () => {
  http = createServer();
  createChatServer(http, { origin: '*', rateLimitPerMinute: 3 });
  await new Promise<void>((r) => http.listen(0, r));
  url = `http://localhost:${(http.address() as AddressInfo).port}`;
});

afterEach(() => {
  clients.splice(0).forEach((c) => c.disconnect());
  http.close();
});

describe('chat server', () => {
  it('rejects connections without a valid user', async () => {
    const s = connect(url, { auth: { user: { id: 'x', name: 'A' } }, transports: ['websocket'], forceNew: true });
    clients.push(s);
    const err = await new Promise<Error>((r) => s.on('connect_error', r));
    expect(err.message).toBe('invalid user');
  });

  it('delivers messages to everyone in the room and stores history', async () => {
    const a = await client('a');
    const b = await client('b');
    a.emit('room:join', 'general');
    b.emit('room:join', 'general');
    await wait(50);
    const received = nextEvent(b, 'message');
    a.emit('message:send', { id: 'm1', roomId: 'general', text: 'hello', createdAt: 0 });
    const ev = (await received) as { message: { text: string; user: { id: string }; createdAt: number } };
    expect(ev.message.text).toBe('hello');
    expect(ev.message.user.id).toBe('a'); // identity comes from the server
    expect(ev.message.createdAt).toBeGreaterThan(0); // server clock

    const page = await new Promise<{ messages: unknown[] }>((r) => b.emit('history', { roomId: 'general' }, r));
    expect(page.messages).toHaveLength(1);
  });

  it('broadcasts typing to others, and presence on connect', async () => {
    const a = await client('a');
    const presence = nextEvent(a, 'presence');
    const b = await client('b');
    expect(((await presence) as { users: unknown[] }).users).toHaveLength(2);
    a.emit('room:join', 'react');
    b.emit('room:join', 'react');
    await wait(50);
    const typing = nextEvent(b, 'typing');
    a.emit('typing', { roomId: 'react', isTyping: true });
    expect(await typing).toMatchObject({ roomId: 'react', isTyping: true });
  });

  it('rate limits messages per socket', async () => {
    const a = await client('a');
    a.emit('room:join', 'random');
    const error = new Promise<string>((r) => a.on('chat:error', r));
    for (let i = 0; i < 4; i++) a.emit('message:send', { id: `m${i}`, roomId: 'random', text: 'spam', createdAt: 0 });
    expect(await error).toBe('Too many messages');
  });

  it('paginates history with a cursor', () => {
    const repo = new MessageRepo();
    for (let i = 1; i <= 30; i++) repo.add({ id: `${i}`, roomId: 'general', user: user('a'), text: '', createdAt: i, reactions: {} });
    const first = repo.page('general', undefined, 25);
    const second = repo.page('general', first.messages[0]!.createdAt, 25);
    expect(first.hasMore).toBe(true);
    expect(second.messages.map((m) => m.id)).toEqual(['1', '2', '3', '4', '5']);
    expect(second.hasMore).toBe(false);
  });
});
