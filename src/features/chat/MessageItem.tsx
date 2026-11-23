import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';
import { QUICK_REACTIONS } from '@/lib/reactions';
import { formatTime } from '@/lib/time';
import type { Message } from '@/types';
import { ReactionBar } from './ReactionBar';

interface Props {
  message: Message;
  mine: boolean;
  grouped: boolean; // same author as the previous message → hide avatar/name
  myId: string;
  onReact: (emoji: string) => void;
  onOpenImage: (m: Message) => void;
}

export function MessageItem({ message: m, mine, grouped, myId, onReact, onOpenImage }: Props) {
  const [picker, setPicker] = useState(false);

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className={cn('group flex gap-3 px-5', mine && 'flex-row-reverse', grouped ? 'mt-0.5' : 'mt-4')}
      onMouseLeave={() => setPicker(false)}
    >
      <span className="w-9">{!grouped && <Avatar user={m.user} />}</span>
      <div className={cn('flex max-w-[75%] flex-col', mine && 'items-end')}>
        {!grouped && (
          <p className="mb-1 text-xs text-slate-400">
            <b className="text-slate-200" style={{ color: mine ? undefined : m.user.color }}>{mine ? 'You' : m.user.name}</b>
            {m.user.isBot && <span className="ml-1 rounded bg-white/10 px-1 text-[10px] font-bold uppercase">bot</span>} · {formatTime(m.createdAt)}
          </p>
        )}
        <div className="relative">
          <div className={cn('overflow-hidden rounded-2xl text-[15px] leading-relaxed', mine ? 'rounded-tr-md bg-emerald-500 text-slate-950' : 'rounded-tl-md bg-slate-800')}>
            {m.image && (
              <motion.img layoutId={`img-${m.id}`} src={m.image} alt="Shared image" onClick={() => onOpenImage(m)} className="max-h-72 w-full cursor-zoom-in object-cover" />
            )}
            {m.text && <p className="whitespace-pre-wrap break-words px-4 py-2">{m.text}</p>}
          </div>

          {/* hover toolbar with quick reactions */}
          <div className={cn('absolute -top-4 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100', mine ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2')}>
            <button onClick={() => setPicker((p) => !p)} className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-slate-900 text-sm" aria-label="Add reaction">☺</button>
          </div>
          <AnimatePresence>
            {picker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: 8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className={cn('absolute -top-12 z-10 flex gap-1 rounded-full border border-white/10 bg-slate-900 p-1 shadow-xl', mine ? 'right-0 origin-bottom-right' : 'left-0 origin-bottom-left')}
              >
                {QUICK_REACTIONS.map((e, i) => (
                  <motion.button key={e} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.03 }} whileHover={{ scale: 1.35, y: -3 }} onClick={() => (onReact(e), setPicker(false))} className="h-8 w-8 rounded-full text-lg">
                    {e}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ReactionBar reactions={m.reactions} myId={myId} onToggle={onReact} />
      </div>
    </motion.li>
  );
}
