import { createId } from '@/lib/id';
import { toggleReaction } from '@/lib/reactions';
import type { ChatEvent, ConnectionStatus, Message, User } from '@/types';
import { BOTS, botReply } from './bots';
import { pageRoom, readRoom, upsertMessage } from './messageStore';
import type { ChatTransport } from './types';

type Wire = ChatEvent | { type: 'ping'; user: User } | { type: 'bye'; userId: string };

const HEARTBEAT_MS = 2500;
const ONLINE_TIMEOUT_MS = 7000;

/**
 * Real-time between tabs of the same browser using the BroadcastChannel API.
 * Open the app in 2 tabs with 2 names to see messages, typing and presence live.
 * Bots are simulated in the tab that sent the message.
 */
export class BroadcastTransport implements ChatTransport {
  private channel: BroadcastChannel | null = null;
  private user: User | null = null;
  private handlers = new Set<(e: ChatEvent) => void>();
  private statusHandlers = new Set<(s: ConnectionStatus) => void>();
  private seen = new Map<string, { user: User; at: number }>();
  private timers: ReturnType<typeof setInterval>[] = [];
  private offline = false;
  private outbox: Wire[] = []; // messages sent while offline are queued and flushed on reconnect

  connect(user: User) {
    this.user = user;
    this.channel = new BroadcastChannel('chatroom');
    this.channel.onmessage = (e: MessageEvent<Wire>) => !this.offline && this.receive(e.data);
    this.setStatus('connecting');
    setTimeout(() => this.setStatus('online'), 600);
    const beat = () => {
      if (this.offline) return;
      this.post({ type: 'ping', user });
      this.seen.set(user.id, { user, at: Date.now() });
      this.emitPresence();
    };
    beat();
    this.timers.push(setInterval(beat, HEARTBEAT_MS));
    window.addEventListener('pagehide', this.bye);
  }

  disconnect() {
    this.bye();
    this.timers.forEach(clearInterval);
    this.timers = [];
    this.channel?.close();
    this.channel = null;
    window.removeEventListener('pagehide', this.bye);
  }

  private bye = () => this.user && this.post({ type: 'bye', userId: this.user.id });

  join() {
    /* every tab receives every room; the UI filters by room */
  }

  send(message: Message) {
    upsertMessage(message);
    this.emit({ type: 'message', message });
    this.post({ type: 'message', message });
    this.maybeBotReply(message);
  }

  setTyping(roomId: string, isTyping: boolean) {
    if (this.user) this.post({ type: 'typing', roomId, user: this.user, isTyping });
  }

  react(roomId: string, messageId: string, emoji: string) {
    if (!this.user) return;
    const m = readRoom(roomId).find((x) => x.id === messageId);
    if (m) upsertMessage(toggleReaction(m, emoji, this.user.id));
    const ev: ChatEvent = { type: 'reaction', roomId, messageId, emoji, userId: this.user.id };
    this.emit(ev);
    this.post(ev);
  }

  async loadHistory(roomId: string, before?: number, limit = 25) {
    await new Promise((r) => setTimeout(r, before ? 500 : 150)); // pretend network latency
    return pageRoom(roomId, before, limit);
  }

  onEvent(h: (e: ChatEvent) => void) {
    this.handlers.add(h);
    return () => void this.handlers.delete(h);
  }

  onStatus(h: (s: ConnectionStatus) => void) {
    this.statusHandlers.add(h);
    return () => void this.statusHandlers.delete(h);
  }

  setSimulatedOffline(offline: boolean) {
    this.offline = offline;
    if (offline) return this.setStatus('offline');
    this.setStatus('connecting');
    setTimeout(() => {
      const queued = this.outbox;
      this.outbox = [];
      queued.forEach((w) => this.channel?.postMessage(w));
      this.setStatus('online');
    }, 900);
  }

  // ---- internals ----
  private post(w: Wire) {
    if (this.offline) {
      if (w.type === 'message' || w.type === 'reaction') this.outbox.push(w);
      return;
    }
    this.channel?.postMessage(w);
  }

  private receive(w: Wire) {
    if (w.type === 'ping') {
      this.seen.set(w.user.id, { user: w.user, at: Date.now() });
      return this.emitPresence();
    }
    if (w.type === 'bye') {
      this.seen.delete(w.userId);
      return this.emitPresence();
    }
    this.emit(w);
  }

  private emitPresence() {
    const now = Date.now();
    for (const [id, s] of this.seen) if (now - s.at > ONLINE_TIMEOUT_MS) this.seen.delete(id);
    this.emit({ type: 'presence', users: [...[...this.seen.values()].map((s) => s.user), ...BOTS] });
  }

  private emit(e: ChatEvent) {
    this.handlers.forEach((h) => h(e));
  }

  private setStatus(s: ConnectionStatus) {
    this.statusHandlers.forEach((h) => h(s));
  }

  private maybeBotReply(m: Message) {
    if (m.user.isBot || Math.random() > 0.7) return;
    const { bot, text } = botReply(m.roomId, m.text);
    const typing = (isTyping: boolean) => {
      const ev: ChatEvent = { type: 'typing', roomId: m.roomId, user: bot, isTyping };
      this.emit(ev);
      this.post(ev);
    };
    setTimeout(() => typing(true), 700);
    setTimeout(() => {
      typing(false);
      this.send({ id: createId(), roomId: m.roomId, user: bot, text, createdAt: Date.now(), reactions: {} });
    }, 2200 + Math.random() * 1200);
  }
}
