const dateFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
const longDateFmt = new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Oct 30, 2026" */
export function formatDate(iso: string | null | undefined): string {
  const date = parse(iso);
  return date ? dateFmt.format(date) : "—";
}

/** "October 30, 2026" */
export function formatLongDate(iso: string | null | undefined): string {
  const date = parse(iso);
  return date ? longDateFmt.format(date) : "—";
}

/** "Oct 30, 2026 · 4:12 PM" */
export function formatDateTime(iso: string | null | undefined): string {
  const date = parse(iso);
  return date ? `${dateFmt.format(date)} · ${timeFmt.format(date)}` : "—";
}

export function formatTime(iso: string | null | undefined): string {
  const date = parse(iso);
  return date ? timeFmt.format(date) : "—";
}

/** "Just now", "12 minutes ago", "3 days ago", else "Oct 30, 2026" */
export function relativeTime(iso: string | null | undefined): string {
  const date = parse(iso);
  if (!date) return "Never";
  const diff = Date.now() - date.getTime();
  if (diff < 0) return formatDateTime(iso);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(iso);
}

/** Day bucket key, e.g. "2026-10-30". */
export function dayKey(iso: string): string {
  const date = parse(iso);
  if (!date) return "unknown";
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export function withinDays(iso: string | null | undefined, days: number): boolean {
  const date = parse(iso);
  if (!date) return false;
  return Date.now() - date.getTime() <= days * 86_400_000;
}

const APP_LETTER = /[a-z0-9]/i;

export function initialOf(name: string, packageName: string): string {
  const source = name.trim() || packageName.trim();
  const match = source.match(APP_LETTER);
  return match ? match[0].toUpperCase() : "?";
}

/** Deterministic hue so a given package always gets the same fallback tile. */
export function hueFor(packageName: string): number {
  let hash = 0;
  for (let i = 0; i < packageName.length; i += 1) {
    hash = (hash * 31 + packageName.charCodeAt(i)) % 360;
  }
  return hash;
}
