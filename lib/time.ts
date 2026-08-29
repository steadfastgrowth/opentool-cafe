const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Short relative time for social rows. */
export function ago(input: Date | string | number) {
  const at = input instanceof Date ? input : new Date(input);
  const ms = Date.now() - at.getTime();
  if (!Number.isFinite(ms)) return "";
  const sec = Math.round(ms / 1000);
  if (sec < 45) return "just now";
  if (sec < 90) return "1m";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 7) return `${day}d`;
  const sameYear = at.getFullYear() === new Date().getFullYear();
  const stamp = `${MONTHS[at.getMonth()]} ${at.getDate()}`;
  return sameYear ? stamp : `${stamp}, ${at.getFullYear()}`;
}
