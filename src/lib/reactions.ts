import type { Message } from '@/types';

export const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🤔', '🔥'];

/** Toggle: if the user already reacted with this emoji, remove it; otherwise add it. */
export function toggleReaction(m: Message, emoji: string, userId: string): Message {
  const users = m.reactions[emoji] ?? [];
  const next = users.includes(userId) ? users.filter((u) => u !== userId) : [...users, userId];
  const reactions = { ...m.reactions, [emoji]: next };
  if (next.length === 0) delete reactions[emoji];
  return { ...m, reactions };
}
