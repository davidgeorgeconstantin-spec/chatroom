const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export const formatTime = (ts: number) => timeFmt.format(ts);
export const dayKey = (ts: number) => new Date(ts).toDateString();
export function formatDay(ts: number) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const k = dayKey(ts);
  return k === today ? 'Today' : k === yesterday ? 'Yesterday' : dayFmt.format(ts);
}
