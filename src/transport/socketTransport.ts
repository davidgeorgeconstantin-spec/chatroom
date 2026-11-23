import { io, type Socket } from 'socket.io-client';
import type { ChatEvent, ConnectionStatus, HistoryPage, Message, User } from '@/types';
import type { ChatTransport } from './types';

/** Real WebSocket transport for the Socket.io server in /server. Enabled with VITE_SOCKET_URL. */
export class SocketTransport implements ChatTransport {
  private socket: Socket | null = null;
  private handlers = new Set<(e: ChatEvent) => void>();
  private statusHandlers = new Set<(s: ConnectionStatus) => void>();

  constructor(private url: string) {}

  connect(user: User) {
    this.setStatus('connecting');
    // socket.io reconnects automatically with exponential backoff
    this.socket = io(this.url, { auth: { user }, transports: ['websocket'] });
    this.socket.on('connect', () => this.setStatus('online'));
    this.socket.on('disconnect', () => this.setStatus('offline'));
    this.socket.io.on('reconnect_attempt', () => this.setStatus('connecting'));
    this.socket.on('chat:event', (e: ChatEvent) => this.handlers.forEach((h) => h(e)));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  join(roomId: string) {
    this.socket?.emit('room:join', roomId);
  }

  send(message: Message) {
    this.socket?.emit('message:send', message);
  }

  setTyping(roomId: string, isTyping: boolean) {
    this.socket?.volatile.emit('typing', { roomId, isTyping }); // volatile: ok to drop if offline
  }

  react(roomId: string, messageId: string, emoji: string) {
    this.socket?.emit('reaction:toggle', { roomId, messageId, emoji });
  }

  loadHistory(roomId: string, before?: number, limit = 25): Promise<HistoryPage> {
    return new Promise((resolve) => this.socket?.emit('history', { roomId, before, limit }, resolve));
  }

  onEvent(h: (e: ChatEvent) => void) {
    this.handlers.add(h);
    return () => void this.handlers.delete(h);
  }

  onStatus(h: (s: ConnectionStatus) => void) {
    this.statusHandlers.add(h);
    return () => void this.statusHandlers.delete(h);
  }

  private setStatus(s: ConnectionStatus) {
    this.statusHandlers.forEach((h) => h(s));
  }
}
