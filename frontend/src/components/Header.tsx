import Link from 'next/link';
import { Suspense } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href={`/${locale}`} className="wordmark" aria-label="Evim">
          evim
        </Link>
        <nav className="site-nav" aria-label="Main">
          <Link href={`/${locale}/properties`}>{dict.nav.properties}</Link>
        </nav>
        <Suspense fallback={<span className="lang" />}>
          <LanguageSwitcher current={locale} label={dict.nav.language} />
        </Suspense>
      </div>
    </header>
  );
}
