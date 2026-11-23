import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import type { Message } from '@/types';

/** Shared-element transition: the same layoutId as the thumbnail, so the image "grows" into place. */
export function ImageLightbox({ message, onClose }: { message: Message | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {message?.image && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-6 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.img layoutId={`img-${message.id}`} src={message.image} alt="Shared image, full size" className="max-h-full max-w-full rounded-2xl shadow-2xl" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
