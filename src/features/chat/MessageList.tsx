import { AnimatePresence, motion } from 'motion/react';
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { dayKey, formatDay } from '@/lib/time';
import type { Message } from '@/types';
import { MessageItem } from './MessageItem';

interface Props {
  messages: Message[];
  myId: string;
  hasMore: boolean;
  loaded: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
  onReact: (m: Message, emoji: string) => void;
  onOpenImage: (m: Message) => void;
}

export function MessageList({ messages, myId, hasMore, loaded, loadingOlder, onLoadOlder, onReact, onOpenImage }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const prevHeight = useRef(0);
  const prevFirst = useRef<string | undefined>(undefined);
  const [newCount, setNewCount] = useState(0);
  const last = messages.at(-1);

  // Keep the scroll position when older messages are added at the top
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const first = messages[0]?.id;
    if (prevFirst.current && first !== prevFirst.current) el.scrollTop += el.scrollHeight - prevHeight.current;
    prevFirst.current = first;
    prevHeight.current = el.scrollHeight;
  }, [messages]);

  // Auto-scroll for new messages only if the user is already at the bottom (or it's their own message)
  useEffect(() => {
    const el = ref.current;
    if (!el || !last) return;
    if (atBottom.current || last.user.id === myId) {
      el.scrollTo({ top: el.scrollHeight, behavior: loaded ? 'smooth' : 'auto' });
      setNewCount(0);
    } else setNewCount((n) => n + 1);
  }, [last?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function onScroll() {
    const el = ref.current!;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (atBottom.current) setNewCount(0);
    if (el.scrollTop < 60 && hasMore && !loadingOlder) onLoadOlder(); // infinite scroll upwards
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={ref} onScroll={onScroll} className="scroll-thin h-full overflow-y-auto pb-4">
        <div className="flex justify-center py-4 text-xs text-slate-500">
          {loadingOlder ? (
            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }}>Loading older messages…</motion.span>
          ) : hasMore ? (
            <button onClick={onLoadOlder} className="rounded-full border border-white/10 px-3 py-1 hover:bg-white/5">Load older messages</button>
          ) : loaded ? (
            <span>This is the beginning of the room ✨</span>
          ) : null}
        </div>
        {!loaded && (
          <div className="space-y-4 px-5">
            {[60, 40, 75, 50].map((w, i) => <div key={i} className="h-10 animate-pulse rounded-2xl bg-slate-800" style={{ width: `${w}%` }} />)}
          </div>
        )}
        <ul>
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
            const grouped = !!prev && !newDay && prev.user.id === m.user.id && m.createdAt - prev.createdAt < 5 * 60_000;
            return (
              <Fragment key={m.id}>
                {newDay && (
                  <li className="my-4 flex items-center gap-3 px-5 text-xs font-semibold text-slate-500">
                    <span className="h-px flex-1 bg-white/10" />{formatDay(m.createdAt)}<span className="h-px flex-1 bg-white/10" />
                  </li>
                )}
                <MessageItem message={m} mine={m.user.id === myId} grouped={grouped} myId={myId} onReact={(e) => onReact(m, e)} onOpenImage={onOpenImage} />
              </Fragment>
            );
          })}
        </ul>
      </div>

      <AnimatePresence>
        {newCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            onClick={() => ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg"
          >
            ↓ {newCount} new message{newCount > 1 ? 's' : ''}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
