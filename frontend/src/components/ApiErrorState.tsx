import Link from 'next/link';
import type { Dictionary } from '@/i18n';

export default function ApiErrorState({ dict, retryHref }: { dict: Dictionary; retryHref: string }) {
  return (
    <div className="state">
      <h2>{dict.errors.apiTitle}</h2>
      <p>{dict.errors.apiText}</p>
      <Link href={retryHref} className="btn btn--outline">
        {dict.errors.retry}
      </Link>
    </div>
  );
}
