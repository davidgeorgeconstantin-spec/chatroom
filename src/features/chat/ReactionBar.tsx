import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/cn';

export function ReactionBar({ reactions, myId, onToggle }: { reactions: Record<string, string[]>; myId: string; onToggle: (emoji: string) => void }) {
  const entries = Object.entries(reactions).filter(([, u]) => u.length > 0);
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      <AnimatePresence initial={false}>
        {entries.map(([emoji, users]) => (
          <motion.button
            key={emoji}
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => onToggle(emoji)}
            className={cn('flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs', users.includes(myId) ? 'border-emerald-400/60 bg-emerald-400/15' : 'border-white/10 bg-white/5')}
          >
            {emoji}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={users.length} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="tabular-nums">
                {users.length}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
