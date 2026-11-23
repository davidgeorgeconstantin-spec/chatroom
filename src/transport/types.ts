import type { ChatEvent, ConnectionStatus, HistoryPage, Message, User } from '@/types';

/**
 * The app talks to "a transport", not to a specific technology.
 * - BroadcastTransport: works on GitHub Pages, real-time between browser tabs (no server)
 * - SocketTransport:    real WebSocket server (Socket.io) in /server
 * Swapping one for the other needs no change in the UI. This is the "dependency inversion" idea.
 */
export interface ChatTransport {
  connect(user: User): void;
  disconnect(): void;
  join(roomId: string): void;
  send(message: Message): void;
  setTyping(roomId: string, isTyping: boolean): void;
  react(roomId: string, messageId: string, emoji: string): void;
  loadHistory(roomId: string, before?: number, limit?: number): Promise<HistoryPage>;
  onEvent(handler: (e: ChatEvent) => void): () => void;
  onStatus(handler: (s: ConnectionStatus) => void): () => void;
  /** Demo helper: simulate losing the connection. */
  setSimulatedOffline?(offline: boolean): void;
}
