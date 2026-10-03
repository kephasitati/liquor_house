/**
 * Money is always "KSh 4,800": the mark written by hand, only the digits formatted, so the
 * runtime's ICU data never turns it into "KES" or "Ksh". Medusa v2 prices are major units.
 */
export function amount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "";
  return new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function money(n: number | null | undefined): string {
  const a = amount(n);
  return a ? `KSh ${a}` : "";
}

export function percentOff(now: number | null, was: number | null): number {
  if (!now || !was || was <= now) return 0;
  return Math.round((1 - now / was) * 100);
}
