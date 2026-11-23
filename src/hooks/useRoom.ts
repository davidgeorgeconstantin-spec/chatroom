import { useCallback, useEffect, useState } from 'react';
import { useChat } from '@/features/chat/chatStore';
import { useTransport } from '@/features/chat/TransportContext';

/** Joins a room, loads the latest page of history, and exposes `loadOlder` for pagination. */
export function useRoom(roomId: string) {
  const transport = useTransport();
  const room = useChat((s) => s.rooms[roomId]);
  const setHistory = useChat((s) => s.setHistory);
  const setActiveRoom = useChat((s) => s.setActiveRoom);
  const [loadingOlder, setLoadingOlder] = useState(false);

  useEffect(() => {
    setActiveRoom(roomId);
    if (!transport) return;
    transport.join(roomId);
    if (!useChat.getState().rooms[roomId]?.loaded) {
      void transport.loadHistory(roomId).then((p) => setHistory(roomId, p.messages, p.hasMore, false));
    }
  }, [roomId, transport, setActiveRoom, setHistory]);

  const loadOlder = useCallback(async () => {
    const r = useChat.getState().rooms[roomId];
    if (!transport || !r?.hasMore || loadingOlder) return;
    setLoadingOlder(true);
    const page = await transport.loadHistory(roomId, r.messages[0]?.createdAt);
    setHistory(roomId, page.messages, page.hasMore, true);
    setLoadingOlder(false);
  }, [roomId, transport, loadingOlder, setHistory]);

  return { messages: room?.messages ?? [], hasMore: room?.hasMore ?? true, loaded: room?.loaded ?? false, loadingOlder, loadOlder };
}
