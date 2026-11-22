const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Indian Rupees with lakh grouping, e.g. 120000 -> "₹1,20,000". */
export function formatINR(amount: number): string {
  return inr.format(Math.round(amount));
}

/** Null-safe INR formatting for live backend fields that may be absent. */
export function formatOptionalINR(
  amount: number | null | undefined,
  fallback = "Not stated",
): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return fallback;
  return formatINR(amount);
}

/** Validates an ISO YYYY-MM-DD calendar date string. */
export function isValidISODate(iso: string | null | undefined): iso is string {
  if (!iso || typeof iso !== "string") return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return false;
  const [, yyyy, mm, dd] = m;
  const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  return (
    d.getUTCFullYear() === Number(yyyy) &&
    d.getUTCMonth() === Number(mm) - 1 &&
    d.getUTCDate() === Number(dd)
  );
}

function parseISO(iso: string): Date {
  const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** ISO yyyy-mm-dd -> DD/MM/YYYY */
export function formatDate(iso: string): string {
  const d = parseISO(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

/** Null-safe ISO date formatting so missing backend dates never render as 1900. */
export function formatOptionalDate(
  iso: string | null | undefined,
  fallback = "Not stated",
): string {
  return isValidISODate(iso) ? formatDate(iso) : fallback;
}

/** ISO -> "14 October 2026" for letters. */
export function formatLongDate(iso: string): string {
  return parseISO(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function addYears(iso: string, years: number): string {
  const d = parseISO(iso);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

/** Whole days from `fromIso` to `toIso` (negative if past). */
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseISO(toIso).getTime() - parseISO(fromIso).getTime()) / 86_400_000);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Validates DD/MM/YYYY as a real calendar date and returns ISO, or null. */
export function parseDDMMYYYY(value: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  if (
    d.getUTCFullYear() !== Number(yyyy) ||
    d.getUTCMonth() !== Number(mm) - 1 ||
    d.getUTCDate() !== Number(dd)
  )
    return null;
  return d.toISOString().slice(0, 10);
}

/** Auto-insert slashes while typing a DD/MM/YYYY date. */
export function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
