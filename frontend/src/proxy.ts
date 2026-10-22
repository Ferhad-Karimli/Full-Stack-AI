import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales, type Locale } from './i18n/config';

const COOKIE = 'NEXT_LOCALE';

function detectLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(COOKIE)?.value;
  if (saved && (locales as readonly string[]).includes(saved)) return saved as Locale;

  // Pick the first supported language from Accept-Language, by quality.
  const header = request.headers.get('accept-language') || '';
  const preferred = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of preferred) {
    if ((locales as readonly string[]).includes(lang)) return lang as Locale;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const current = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (current) {
    // Expose the locale to server components that have no params (e.g. not-found).
    const headers = new Headers(request.headers);
    headers.set('x-locale', current);
    return NextResponse.next({ request: { headers } });
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${detectLocale(request)}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (favicon, images).
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
