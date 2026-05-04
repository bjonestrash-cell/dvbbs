import { format, parseISO } from "date-fns";

const numberFormatters: Record<string, Intl.NumberFormat> = {};
function nf(currency: string) {
  if (!numberFormatters[currency]) {
    numberFormatters[currency] = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  }
  return numberFormatters[currency];
}

export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined = "USD",
): string {
  if (amount === null || amount === undefined) return ".";
  return nf(currency || "USD").format(amount);
}

export function formatCapacity(n: number | null | undefined): string {
  if (n === null || n === undefined) return ".";
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    return format(parseISO(iso), "EEE LLL d");
  } catch {
    return iso;
  }
}

export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    return format(parseISO(iso), "EEEE, LLLL d, yyyy");
  } catch {
    return iso;
  }
}

export function formatYear(iso: string | null | undefined): string {
  if (!iso) return ".";
  try {
    return format(parseISO(iso), "yyyy");
  } catch {
    return "";
  }
}

export function daysFromNow(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.round((t - Date.now()) / 86_400_000);
}
