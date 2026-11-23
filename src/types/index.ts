export interface User {
  id: string;
  name: string;
  color: string; // avatar color
  isBot?: boolean;
}

export interface Message {
  id: string;
  roomId: string;
  user: User;
  text: string;
  image?: string; // data URL (resized in the browser)
  createdAt: number;
  reactions: Record<string, string[]>; // emoji → user ids
}

export interface Room {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export type ConnectionStatus = 'connecting' | 'online' | 'offline';

/** Everything the transport can tell the app. Same events are used by the Socket.io server. */
export type ChatEvent =
  | { type: 'message'; message: Message }
  | { type: 'typing'; roomId: string; user: User; isTyping: boolean }
  | { type: 'presence'; users: User[] }
  | { type: 'reaction'; roomId: string; messageId: string; emoji: string; userId: string };

export interface HistoryPage {
  messages: Message[];
  hasMore: boolean;
}
