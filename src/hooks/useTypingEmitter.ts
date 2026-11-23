import { useCallback, useEffect, useRef } from 'react';
import { useTransport } from '@/features/chat/TransportContext';

/**
 * Sends "typing: true" at most every 2s while the user types, and "typing: false"
 * after 2.5s of silence (throttle + debounce). Keeps network traffic low.
 */
export function useTypingEmitter(roomId: string) {
  const transport = useTransport();
  const lastSent = useRef(0);
  const stopTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const stop = useCallback(() => {
    clearTimeout(stopTimer.current);
    if (lastSent.current) transport?.setTyping(roomId, false);
    lastSent.current = 0;
  }, [roomId, transport]);

  const onType = useCallback(() => {
    const now = Date.now();
    if (now - lastSent.current > 2000) {
      transport?.setTyping(roomId, true);
      lastSent.current = now;
    }
    clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(stop, 2500);
  }, [roomId, transport, stop]);

  useEffect(() => stop, [stop]); // leaving the room = stop typing
  return { onType, stop };
}
