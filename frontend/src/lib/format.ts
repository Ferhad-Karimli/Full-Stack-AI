import { intlLocale, type Locale } from '@/i18n/config';

const currencySymbol: Record<string, string> = { AZN: '₼', USD: '$', EUR: '€' };

/** "2 400 ₼" — number grouped per locale, symbol after (as is usual in Azerbaijan). */
export function formatPrice(value: number, currency: string, locale: Locale): string {
  const n = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 }).format(value);
  return `${n} ${currencySymbol[currency] ?? currency}`;
}

/** Reads a numeric search param, ignoring empty or invalid values. */
export function numParam(value: string | string[] | undefined): number | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function strParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v ? v.trim() || undefined : undefined;
}
