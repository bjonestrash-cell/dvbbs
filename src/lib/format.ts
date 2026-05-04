import { format, parseISO, differenceInSeconds } from "date-fns";

/** "FRI 18.05.26" club timetable format. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    return format(parseISO(iso), "EEE dd.MM.yy").toUpperCase();
  } catch {
    return iso;
  }
}

/** "FRIDAY 18 MAY 2026" full editorial date. */
export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    return format(parseISO(iso), "EEEE dd LLLL yyyy").toUpperCase();
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

/** "23:00" 24-hour HH:MM, accepts ISO times "23:00:00", or full ISO datetimes. */
export function formatTime(value: string | null | undefined): string {
  if (!value) return ".";
  // Time-only string from Postgres time column, e.g. "23:00:00"
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  try {
    return format(parseISO(value), "HH:mm");
  } catch {
    return value;
  }
}

/** "FRI 18.05.26 / 23:00" combined. */
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

/** "5,000 CAP" capacity with suffix. */
export function formatCapacity(n: number | null | undefined): string {
  if (n === null || n === undefined) return ".";
  return `${new Intl.NumberFormat("en-US").format(n)} CAP`;
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

/** Compute live "13D 04H 22M" countdown to a target ISO date+time. */
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
  return `${pad(days)}D ${pad(hours)}H ${pad(minutes)}M`;
}

/** Compact countdown "13D" with no hours/minutes. */
export function formatCountdownDays(
  isoDate: string | null | undefined,
): string {
  const d = daysFromNow(isoDate);
  if (d === null) return ".";
  if (d < 0) return `${Math.abs(d)}D AGO`;
  return `${d}D`;
}

/** Distance from now, e.g. "12M AGO", "3H AGO". For activity feeds. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    const seconds = differenceInSeconds(new Date(), parseISO(iso));
    if (seconds < 60) return "JUST NOW";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}M AGO`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}H AGO`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}D AGO`;
    return formatDateCompact(iso);
  } catch {
    return iso;
  }
}

/** Time of day greeting based on local hour. */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "LATE NIGHT";
  if (h < 12) return "GOOD MORNING";
  if (h < 17) return "GOOD AFTERNOON";
  if (h < 22) return "GOOD EVENING";
  return "LATE NIGHT";
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Build a Unicode block ASCII progress bar, e.g. "████░░░░░░ 40%". */
export function asciiProgress(
  done: number,
  total: number,
  segments = 20,
): string {
  if (total === 0) return "░".repeat(segments) + " 0%";
  const ratio = Math.min(1, Math.max(0, done / total));
  const filled = Math.round(ratio * segments);
  const empty = segments - filled;
  const pct = Math.round(ratio * 100);
  return "█".repeat(filled) + "░".repeat(empty) + ` ${pct}%`;
}

/** Legacy compatibility, used elsewhere in the codebase pre-overhaul. */
export const formatDateShort = formatDate;
