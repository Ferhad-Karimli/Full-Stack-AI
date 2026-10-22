import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { PropertySummary } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import SafeImage from './SafeImage';
import PropertySpecs from './PropertySpecs';

interface Props {
  property: PropertySummary;
  locale: Locale;
  dict: Dictionary;
  priority?: boolean;
}

export default function PropertyCard({ property: p, locale, dict, priority }: Props) {
  return (
    <article className="listing">
      <Link href={`/${locale}/properties/${p.slug}`} className="listing__link">
        <div className="listing__media">
          <SafeImage
            src={p.coverImage}
            alt={p.title}
            priority={priority}
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
          <span className="listing__type">{dict.types[p.type]}</span>
        </div>
        <div className="listing__body">
          <p className="listing__place">
            {p.district}, {p.city.name}
          </p>
          <h3 className="listing__title">{p.title}</h3>
          <PropertySpecs locale={locale} dict={dict} rooms={p.rooms} area={p.area} />
          <p className="listing__price">
            <strong>{formatPrice(p.price, p.currency, locale)}</strong>
            <span>{dict.property.perMonth}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
