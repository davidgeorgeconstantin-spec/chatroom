import { createContext, useContext, useEffect, useState } from 'react';
import { createTransport, type ChatTransport } from '@/transport';
import { useSession } from '@/features/auth/sessionStore';
import { useChat } from './chatStore';

const Ctx = createContext<ChatTransport | null>(null);

/** Creates the transport once per user and pipes its events into the Zustand store. */
export function TransportProvider({ children }: { children: React.ReactNode }) {
  const user = useSession((s) => s.user);
  const [transport, setTransport] = useState<ChatTransport | null>(null);

  useEffect(() => {
    if (!user) return;
    const t = createTransport();
    const chat = useChat.getState();
    // safety net: if a "stopped typing" event is lost, clear the indicator after 4s
    const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
    const offEvent = t.onEvent((e) => {
      if (e.type === 'message') chat.addMessage(e.message, user.id);
      if (e.type === 'typing' && e.user.id !== user.id) {
        const key = `${e.roomId}:${e.user.id}`;
        clearTimeout(typingTimers.get(key));
        chat.setTyping(e.roomId, e.user, e.isTyping);
        if (e.isTyping) typingTimers.set(key, setTimeout(() => chat.setTyping(e.roomId, e.user, false), 4000));
      }
      if (e.type === 'presence') chat.setOnline(e.users);
      if (e.type === 'reaction') chat.applyReaction(e.roomId, e.messageId, e.emoji, e.userId);
    });
    const offStatus = t.onStatus(chat.setStatus);
    t.connect(user);
    setTransport(t);
    return () => {
      offEvent();
      offStatus();
      typingTimers.forEach(clearTimeout);
      t.disconnect();
      setTransport(null);
    };
  }, [user]);

  return <Ctx.Provider value={transport}>{children}</Ctx.Provider>;
}

export function useTransport() {
  return useContext(Ctx);
}
