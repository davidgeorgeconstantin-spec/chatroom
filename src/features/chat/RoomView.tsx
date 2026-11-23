import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useSession } from '@/features/auth/sessionStore';
import { useRoom } from '@/hooks/useRoom';
import { createId } from '@/lib/id';
import { ROOMS } from '@/lib/rooms';
import { TRANSPORT_MODE } from '@/transport';
import type { Message } from '@/types';
import { useChat } from './chatStore';
import { Composer } from './Composer';
import { ConnectionBanner } from './ConnectionBanner';
import { ImageLightbox } from './ImageLightbox';
import { MessageList } from './MessageList';
import { useTransport } from './TransportContext';
import { TypingIndicator } from './TypingIndicator';

export function RoomView({ roomId, onOpenMenu }: { roomId: string; onOpenMenu: () => void }) {
  const user = useSession((s) => s.user)!;
  const transport = useTransport();
  const status = useChat((s) => s.status);
  const onlineCount = useChat((s) => s.online.length);
  const room = ROOMS.find((r) => r.id === roomId) ?? ROOMS[0]!;
  const { messages, hasMore, loaded, loadingOlder, loadOlder } = useRoom(room.id);
  const [lightbox, setLightbox] = useState<Message | null>(null);

  function send(text: string, image?: string) {
    transport?.send({ id: createId(), roomId: room.id, user, text, image, createdAt: Date.now(), reactions: {} });
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-white/5 px-5 py-3">
        <button onClick={onOpenMenu} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/5 md:hidden" aria-label="Open menu">☰</button>
        <AnimatePresence mode="wait">
          <motion.div key={room.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }} className="flex-1">
            <h1 className="font-bold">{room.emoji} # {room.name}</h1>
            <p className="text-xs text-slate-400">{room.description} · {onlineCount} online</p>
          </motion.div>
        </AnimatePresence>
        {TRANSPORT_MODE === 'demo' && (
          <button
            onClick={() => transport?.setSimulatedOffline?.(status !== 'offline')}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
            title="Demo: simulate losing the connection"
          >
            {status === 'offline' ? '🔌 Reconnect' : '📴 Go offline'}
          </button>
        )}
      </header>
      <ConnectionBanner />
      <AnimatePresence mode="wait">
        <motion.div key={room.id} className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <MessageList messages={messages} myId={user.id} hasMore={hasMore} loaded={loaded} loadingOlder={loadingOlder} onLoadOlder={loadOlder} onReact={(m, e) => transport?.react(room.id, m.id, e)} onOpenImage={setLightbox} />
        </motion.div>
      </AnimatePresence>
      <TypingIndicator roomId={room.id} />
      <Composer roomId={room.id} onSend={send} />
      <ImageLightbox message={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
