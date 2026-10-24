export const locales = ['az', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'az';

export const localeNames: Record<Locale, string> = {
  az: 'Azərbaycan',
  ru: 'Русский',
  en: 'English',
};

export const localeShort: Record<Locale, string> = { az: 'AZ', ru: 'RU', en: 'EN' };

// Used by Intl formatters (numbers, dates)
export const intlLocale: Record<Locale, string> = { az: 'az-Latn-AZ', ru: 'ru-RU', en: 'en-GB' };

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);
