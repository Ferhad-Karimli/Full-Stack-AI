import az, { type Dictionary } from './dictionaries/az';
import ru from './dictionaries/ru';
import en from './dictionaries/en';
import { intlLocale, type Locale } from './config';

const dictionaries: Record<Locale, Dictionary> = { az, ru, en };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
export type { Dictionary };

type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/** Replaces {key} placeholders. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? `{${k}}`));
}

/** Picks the right plural form for the locale (matters for Russian). */
export function plural(locale: Locale, forms: PluralForms, n: number): string {
  const rule = new Intl.PluralRules(intlLocale[locale]).select(n);
  return fmt(forms[rule] ?? forms.other, { n });
}
