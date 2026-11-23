import { BroadcastTransport } from './broadcastTransport';
import { SocketTransport } from './socketTransport';
import type { ChatTransport } from './types';

const url = import.meta.env.VITE_SOCKET_URL as string | undefined;

/** Pick the transport at build time: Socket.io if VITE_SOCKET_URL is set, otherwise the in-browser demo. */
export function createTransport(): ChatTransport {
  return url ? new SocketTransport(url) : new BroadcastTransport();
}

export const TRANSPORT_MODE = url ? 'socket' : 'demo';
export type { ChatTransport };
