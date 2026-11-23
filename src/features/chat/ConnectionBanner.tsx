import { AnimatePresence, motion } from 'motion/react';
import { useChat } from './chatStore';

export function ConnectionBanner() {
  const status = useChat((s) => s.status);
  return (
    <AnimatePresence>
      {status !== 'online' && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className={status === 'offline' ? 'bg-rose-500/90 px-4 py-2 text-center text-sm font-semibold' : 'bg-amber-500/90 px-4 py-2 text-center text-sm font-semibold text-slate-950'} role="status">
            {status === 'offline' ? '⚠ You are offline. Messages will be sent when you reconnect.' : (
              <span className="inline-flex items-center gap-2">
                <motion.span className="h-3 w-3 rounded-full border-2 border-slate-950 border-t-transparent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
                Connecting…
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
