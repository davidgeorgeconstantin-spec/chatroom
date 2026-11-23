import type { Message } from '@/types';
import { BOTS } from './bots';

const LINES = [
  'Morning everyone ☀️', 'Did anyone try the new React compiler?', 'I finally deployed my portfolio!', 'Congrats! 🎉', 'Link?', 'Working on a Kanban app this week',
  'dnd-kit is great for drag and drop', 'Anyone using Supabase?', 'Yes, the free tier is enough for side projects', 'TypeScript saved me again today 😅', 'What do you use for forms?',
  'react-hook-form + zod', 'Same here', 'Lunch break 🍕', 'Back!', 'Tip: write the README before you forget how it works', 'So true', 'How do you test hooks?',
  'Vitest + Testing Library', 'Thanks!', 'Np 👍', 'Coffee number 3 ☕', 'Who is going to the meetup?', 'Me!', 'Count me in',
];

/** Older demo history (40 messages) so "load older messages" has something to load. */
export function seedRoom(roomId: string): Message[] {
  const now = Date.now();
  const count = roomId === 'general' ? 40 : 12;
  return Array.from({ length: count }, (_, i) => {
    const user = BOTS[(i * 7 + roomId.length) % BOTS.length]!;
    return {
      id: `seed-${roomId}-${i}`,
      roomId,
      user,
      text: LINES[(i + roomId.length * 3) % LINES.length]!,
      createdAt: now - (count - i) * 11 * 60_000 - 3600_000,
      reactions: (i % 6 === 2 ? { '👍': ['bot-ana'], '🎉': ['bot-mihai', 'bot-ioana'] } : {}) as Record<string, string[]>,
    };
  });
}
