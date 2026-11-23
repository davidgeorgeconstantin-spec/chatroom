import type { User } from '@/types';

/** Simulated users, clearly marked as bots in the UI. */
export const BOTS: User[] = [
  { id: 'bot-ana', name: 'Ana', color: '#f43f5e', isBot: true },
  { id: 'bot-mihai', name: 'Mihai', color: '#6366f1', isBot: true },
  { id: 'bot-ioana', name: 'Ioana', color: '#f59e0b', isBot: true },
];

const REPLIES: Record<string, string[]> = {
  general: ['Hey! Welcome 👋', 'Nice to see new people here!', 'How is everyone doing today?', 'Haha, true 😄', 'Good point!'],
  react: ['Have you tried useReducer for that?', 'Keep components small and focused 👌', 'Server components are interesting, but start with the basics.', 'Did you memoize that list?', 'Custom hooks make this much cleaner.'],
  jobs: ['Put your projects on GitHub with a good README!', 'A live demo link helps a lot in interviews.', 'Practice explaining your code out loud.', 'Apply even if you match 70% of the requirements.', 'Good luck! 🍀'],
  random: ['🎲', 'Coffee or tea? ☕', 'TIL: the first website is still online.', 'Weekend plans?', '🔥🔥🔥'],
};

export function botReply(roomId: string, text: string, rand = Math.random): { bot: User; text: string } {
  const bot = BOTS[Math.floor(rand() * BOTS.length)]!;
  const t = text.toLowerCase();
  if (/\b(hi|hello|hey|salut|buna)\b/.test(t)) return { bot, text: `Hi! 👋 I'm ${bot.name}, a demo bot.` };
  if (t.includes('?')) return { bot, text: 'Good question! I am just a demo bot, but someone in a real chat would answer 😉' };
  const list = REPLIES[roomId] ?? REPLIES.general!;
  return { bot, text: list[Math.floor(rand() * list.length)]! };
}
