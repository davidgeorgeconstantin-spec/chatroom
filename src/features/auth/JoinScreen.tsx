import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/cn';
import { AVATAR_COLORS, useSession } from './sessionStore';

const BUBBLES = Array.from({ length: 14 }, (_, i) => ({ left: (i * 37) % 100, size: 30 + ((i * 53) % 70), delay: (i * 0.9) % 8, dur: 10 + (i % 5) * 3 }));

export function JoinScreen() {
  const join = useSession((s) => s.join);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0]!);
  const valid = name.trim().length >= 2;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    join(name, color);
    navigate('/room/general');
  }

  return (
    <div className="relative grid min-h-full place-items-center overflow-hidden px-4">
      {/* floating chat bubbles in the background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {BUBBLES.map((b, i) => (
          <motion.span
            key={i}
            className="absolute bottom-[-120px] rounded-2xl rounded-bl-sm bg-emerald-400/10"
            style={{ left: `${b.left}%`, width: b.size * 1.6, height: b.size }}
            animate={{ y: [0, -1200], opacity: [0, 1, 1, 0] }}
            transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-2xl">💬</span>
          <div>
            <h1 className="text-2xl font-extrabold">ChatRoom</h1>
            <p className="text-sm text-slate-400">Real-time chat · learning project</p>
          </div>
        </div>

        <label className="block text-sm font-semibold text-slate-300" htmlFor="nick">Your nickname</label>
        <input id="nick" autoFocus value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="e.g. David" className="mt-2 w-full rounded-xl bg-white/5 px-4 py-3 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-emerald-400" />

        <p className="mt-5 text-sm font-semibold text-slate-300">Avatar color</p>
        <div className="mt-2 flex gap-2">
          {AVATAR_COLORS.map((c) => (
            <motion.button key={c} type="button" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setColor(c)} aria-label={`Color ${c}`} aria-pressed={color === c} className={cn('h-9 w-9 rounded-full ring-offset-2 ring-offset-slate-900', color === c && 'ring-2 ring-white')} style={{ background: c }} />
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} disabled={!valid} className="mt-7 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-40">
          Join the chat →
        </motion.button>
        <p className="mt-5 text-xs leading-relaxed text-slate-500">
          Demo mode: messages travel between <b>tabs of this browser</b> (BroadcastChannel). Open a second tab with another name to chat with yourself. Ana, Mihai and Ioana are <b>bots</b>. The <code>/server</code> folder has the Socket.io version.
        </p>
      </motion.form>
    </div>
  );
}
