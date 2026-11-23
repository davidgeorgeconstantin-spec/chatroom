// Same shapes as the frontend (src/types/index.ts)
export interface User { id: string; name: string; color: string; isBot?: boolean }
export interface Message { id: string; roomId: string; user: User; text: string; image?: string; createdAt: number; reactions: Record<string, string[]> }
export type ChatEvent =
  | { type: 'message'; message: Message }
  | { type: 'typing'; roomId: string; user: User; isTyping: boolean }
  | { type: 'presence'; users: User[] }
  | { type: 'reaction'; roomId: string; messageId: string; emoji: string; userId: string };
