import { format, parseISO, differenceInSeconds } from "date-fns";

/** "Mon 18.05.26" club timetable, sentence case day abbrev. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    return format(parseISO(iso), "EEE dd.MM.yy");
  } catch {
    return iso;
  }
}

/** "Friday 18 May 2026" full editorial date, sentence case. */
export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    return format(parseISO(iso), "EEEE dd LLLL yyyy");
  } catch {
    return iso;
  }
}

/** "18.05.26" no day-of-week, for inline. */
export function formatDateCompact(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    return format(parseISO(iso), "dd.MM.yy");
  } catch {
    return iso;
  }
}

/** "2026" year only. */
export function formatYear(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    return format(parseISO(iso), "yyyy");
  } catch {
    return "";
  }
}

/** "23:00" 24-hour HH:MM. */
export function formatTime(value: string | null | undefined): string {
  if (!value) return ".";
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  try {
    return format(parseISO(value), "HH:mm");
  } catch {
    return value;
  }
}

/** "Mon 18.05.26 / 23:00" combined. */
export function formatDateTime(
  date: string | null | undefined,
  time: string | null | undefined,
): string {
  if (!date && !time) return ".";
  const d = date ? formatDate(date) : "";
  const t = time ? formatTime(time) : "";
  if (d && t) return `${d} / ${t}`;
  return d || t;
}

/** "USD 40,000" code prefix, no symbol, comma thousands, no decimals. */
export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined = "USD",
): string {
  if (amount === null || amount === undefined) return ".";
  const code = (currency || "USD").toUpperCase();
  const n = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${code} ${n}`;
}

/** "5,000 cap" capacity, lowercase suffix. */
export function formatCapacity(n: number | null | undefined): string {
  if (n === null || n === undefined) return ".";
  return `${new Intl.NumberFormat("en-US").format(n)} cap`;
}

/** Plain comma-separated number, e.g. "12,345". */
export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0";
  return new Intl.NumberFormat("en-US").format(n);
}

/** Days from now, signed integer (negative = past). */
export function daysFromNow(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.round((t - Date.now()) / 86_400_000);
}

/** "13d 04h 22m" live countdown. Lowercase units. */
export function formatCountdown(
  isoDate: string | null | undefined,
  isoTime: string | null | undefined = null,
  now: number = Date.now(),
): string {
  if (!isoDate) return ".";
  const t = (isoTime ?? "21:00").slice(0, 5);
  const target = new Date(`${isoDate}T${t}:00`).getTime();
  if (Number.isNaN(target)) return ".";
  const seconds = Math.max(0, Math.floor((target - now) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m`;
}

/** "13d" short countdown, or "21d ago". */
export function formatCountdownDays(
  isoDate: string | null | undefined,
): string {
  const d = daysFromNow(isoDate);
  if (d === null) return ".";
  if (d < 0) return `${Math.abs(d)}d ago`;
  return `${d}d`;
}

/** "12m ago" relative timestamp. Lowercase units. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    const seconds = differenceInSeconds(new Date(), parseISO(iso));
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDateCompact(iso);
  } catch {
    return iso;
  }
}

/** Time of day greeting, sentence case. */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Late night";
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Numeric progress, 0..1 ratio with rounded percent. Used by the new thin
 * progress bar UI in the asset checklist (replaces the ASCII block bar).
 */
export function progressRatio(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(1, Math.max(0, done / total));
}

/** Legacy ASCII helper kept for back-compat. Returns the percent only now. */
export function asciiProgress(done: number, total: number): string {
  const pct = Math.round(progressRatio(done, total) * 100);
  return `${pct}%`;
}

/** Legacy alias used by prior call sites. */
export const formatDateShort = formatDate;
