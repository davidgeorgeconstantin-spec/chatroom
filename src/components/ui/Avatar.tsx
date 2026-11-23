import { cn } from '@/lib/cn';
import type { User } from '@/types';

export function Avatar({ user, size = 'md', online }: { user: User; size?: 'sm' | 'md'; online?: boolean }) {
  return (
    <span className="relative inline-block shrink-0">
      <span
        className={cn('grid place-items-center rounded-full font-bold text-white', size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm')}
        style={{ background: user.color }}
        aria-hidden="true"
      >
        {user.isBot ? '🤖' : user.name.slice(0, 1).toUpperCase()}
      </span>
      {online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />}
    </span>
  );
}
