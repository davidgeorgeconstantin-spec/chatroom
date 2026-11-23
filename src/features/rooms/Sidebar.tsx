import { AnimatePresence, motion } from 'motion/react';
import { NavLink } from 'react-router';
import { Avatar } from '@/components/ui/Avatar';
import { useSession } from '@/features/auth/sessionStore';
import { useChat } from '@/features/chat/chatStore';
import { cn } from '@/lib/cn';
import { ROOMS } from '@/lib/rooms';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const user = useSession((s) => s.user)!;
  const leave = useSession((s) => s.leave);
  const online = useChat((s) => s.online);
  const unread = useChat((s) => s.unread);
  const activeRoom = useChat((s) => s.activeRoom);
  const people = online.filter((u) => !u.isBot);
  const bots = online.filter((u) => u.isBot);

  return (
    <div className="flex h-full flex-col bg-slate-950/80">
      <div className="flex items-center gap-2 px-5 py-5 text-lg font-extrabold">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500 text-base">💬</span> ChatRoom
      </div>

      <p className="px-5 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Rooms</p>
      <nav className="space-y-0.5 px-3">
        {ROOMS.map((r) => (
          <NavLink key={r.id} to={`/room/${r.id}`} onClick={onNavigate} className={({ isActive }) => cn('relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium', isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200')}>
            {activeRoom === r.id && <motion.span layoutId="room-active" className="absolute inset-0 rounded-xl bg-white/10" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className="relative">{r.emoji}</span>
            <span className="relative flex-1"># {r.name}</span>
            <AnimatePresence>
              {(unread[r.id] ?? 0) > 0 && (
                <motion.span key={unread[r.id]} initial={{ scale: 0 }} animate={{ scale: [1.4, 1] }} exit={{ scale: 0 }} className="relative rounded-full bg-emerald-500 px-1.5 text-xs font-bold text-slate-950">
                  {unread[r.id]}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <p className="px-5 pb-2 pt-6 text-xs font-bold uppercase tracking-wider text-slate-500">Online — {online.length}</p>
      <ul className="scroll-thin flex-1 space-y-1 overflow-y-auto px-3">
        <AnimatePresence initial={false}>
          {[...people, ...bots].map((u) => (
            <motion.li key={u.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm">
              <Avatar user={u} size="sm" online />
              <span className="flex-1 truncate">{u.name}{u.id === user.id && <span className="text-slate-500"> (you)</span>}</span>
              {u.isBot && <span className="rounded bg-white/10 px-1.5 text-[10px] font-bold uppercase text-slate-400">bot</span>}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="flex items-center gap-3 border-t border-white/5 px-5 py-4">
        <Avatar user={user} />
        <span className="flex-1 truncate text-sm font-semibold">{user.name}</span>
        <button onClick={leave} className="text-xs text-slate-400 hover:text-rose-400">Leave</button>
      </div>
    </div>
  );
}
