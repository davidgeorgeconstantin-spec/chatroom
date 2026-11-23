import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { useTypingEmitter } from '@/hooks/useTypingEmitter';
import { resizeImage } from '@/lib/image';

const EMOJIS = ['😀', '😂', '😍', '🤔', '👍', '🙏', '🎉', '🔥', '❤️', '☕', '🚀', '✅'];

export function Composer({ roomId, onSend }: { roomId: string; onSend: (text: string, image?: string) => void }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const { onType, stop } = useTypingEmitter(roomId);
  const canSend = text.trim().length > 0 || !!image;

  function send() {
    if (!canSend) return;
    onSend(text.trim(), image);
    setText('');
    setImage(undefined);
    stop();
    areaRef.current?.focus();
  }

  async function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setError(null);
      setImage(await resizeImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read the image.');
    }
  }

  return (
    <div className="border-t border-white/5 px-4 pb-4 pt-2">
      <AnimatePresence>
        {image && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="relative mb-2 inline-block">
              <img src={image} alt="Preview" className="h-24 rounded-xl object-cover" />
              <button onClick={() => setImage(undefined)} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-slate-700 text-xs" aria-label="Remove image">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="mb-2 text-sm text-rose-400">{error}</p>}

      <div className="relative flex items-end gap-2 rounded-2xl bg-slate-800/80 p-2 ring-1 ring-white/5 focus-within:ring-emerald-400/60">
        <AnimatePresence>
          {emojiOpen && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} className="absolute bottom-full left-0 mb-2 grid origin-bottom-left grid-cols-6 gap-1 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-xl">
              {EMOJIS.map((e) => (
                <motion.button key={e} whileHover={{ scale: 1.3 }} onClick={() => (setText((t) => t + e), setEmojiOpen(false), areaRef.current?.focus())} className="h-9 w-9 rounded-lg text-xl hover:bg-white/5">{e}</motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setEmojiOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-xl text-xl hover:bg-white/5" aria-label="Emoji">😊</button>
        <button onClick={() => fileRef.current?.click()} className="grid h-10 w-10 place-items-center rounded-xl text-xl hover:bg-white/5" aria-label="Attach image">🖼️</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
        <textarea
          ref={areaRef}
          rows={1}
          value={text}
          placeholder={`Message #${roomId}`}
          aria-label="Message"
          onChange={(e) => {
            setText(e.target.value);
            onType();
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`; // auto-grow
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="max-h-36 flex-1 resize-none bg-transparent px-2 py-2 outline-none placeholder:text-slate-500"
        />
        <motion.button
          onClick={send}
          disabled={!canSend}
          animate={{ scale: canSend ? 1 : 0.85, rotate: canSend ? 0 : -20, opacity: canSend ? 1 : 0.4 }}
          whileTap={{ scale: 0.85 }}
          className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 font-bold text-slate-950"
          aria-label="Send"
        >
          ➤
        </motion.button>
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-slate-500">Enter to send · Shift+Enter for a new line</p>
    </div>
  );
}
