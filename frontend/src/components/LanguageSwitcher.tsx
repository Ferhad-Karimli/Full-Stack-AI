'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { localeNames, localeShort, locales, type Locale } from '@/i18n/config';

export default function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() || `/${current}`;
  const search = useSearchParams()?.toString();

  const hrefFor = (locale: Locale) => {
    const parts = pathname.split('/');
    parts[1] = locale;
    return parts.join('/') + (search ? `?${search}` : '');
  };

  const remember = (locale: Locale) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <nav className="lang" aria-label={label}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={hrefFor(locale)}
          hrefLang={locale}
          lang={locale}
          title={localeNames[locale]}
          aria-current={locale === current ? 'true' : undefined}
          onClick={() => remember(locale)}
          scroll={false}
        >
          {localeShort[locale]}
        </Link>
      ))}
    </nav>
  );
}
