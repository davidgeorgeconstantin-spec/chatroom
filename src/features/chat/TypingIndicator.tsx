import { AnimatePresence, motion } from 'motion/react';
import type { User } from '@/types';
import { useChat } from './chatStore';

const EMPTY: Record<string, User> = {};

export function TypingIndicator({ roomId }: { roomId: string }) {
  const typing = useChat((s) => s.typing[roomId] ?? EMPTY);
  const names = Object.values(typing).map((u) => u.name);
  const text = names.length === 0 ? '' : names.length === 1 ? `${names[0]} is typing` : names.length === 2 ? `${names[0]} and ${names[1]} are typing` : 'Several people are typing';

  return (
    <div className="h-6 px-5 text-xs text-slate-400" aria-live="polite">
      <AnimatePresence>
        {text && (
          <motion.span key="t" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="inline-flex items-center gap-2">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-400" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.12 }} />
              ))}
            </span>
            {text}…
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
