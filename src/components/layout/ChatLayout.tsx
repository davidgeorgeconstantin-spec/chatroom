import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { RoomView } from '@/features/chat/RoomView';
import { Sidebar } from '@/features/rooms/Sidebar';

export function ChatLayout() {
  const { roomId = 'general' } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-full">
      <aside className="hidden w-72 shrink-0 border-r border-white/5 md:block">
        <Sidebar />
      </aside>
      {/* mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 md:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}>
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <RoomView roomId={roomId} onOpenMenu={() => setMenuOpen(true)} />
    </div>
  );
}
