import Link from 'next/link';
import { headers } from 'next/headers';
import { defaultLocale, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';

export default async function NotFound() {
  // not-found has no params; the proxy passes the locale in a header.
  const seg = (await headers()).get('x-locale') || '';
  const locale = isLocale(seg) ? seg : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="container page">
      <div className="state state--page">
        <h1>{dict.errors.notFoundTitle}</h1>
        <p>{dict.errors.notFoundText}</p>
        <Link href={`/${locale}`} className="btn btn--primary">
          {dict.errors.goHome}
        </Link>
      </div>
    </div>
  );
}
