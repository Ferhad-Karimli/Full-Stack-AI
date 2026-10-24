'use client';

import { useParams } from 'next/navigation';
import { defaultLocale, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale && isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="container page">
      <div className="state state--page">
        <h1>{dict.errors.apiTitle}</h1>
        <p>{dict.errors.apiText}</p>
        <button type="button" className="btn btn--primary" onClick={reset}>
          {dict.errors.retry}
        </button>
      </div>
    </div>
  );
}
