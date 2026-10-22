import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { fmt, getDictionary, plural } from '@/i18n';
import { getProperty } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import Gallery from '@/components/Gallery';
import InquiryForm from '@/components/InquiryForm';
import PropertyCard from '@/components/PropertyCard';
import PropertySpecs from '@/components/PropertySpecs';
import ApiErrorState from '@/components/ApiErrorState';

type Props = PageProps<'/[locale]/properties/[slug]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  try {
    const p = await getProperty(locale, slug);
    if (!p) return {};
    return {
      title: p.title,
      description: p.description.slice(0, 160),
      openGraph: { title: p.title, description: p.description.slice(0, 160), images: p.images.slice(0, 1) },
    };
  } catch {
    return {};
  }
}

export default async function PropertyPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.property;

  let property;
  try {
    property = await getProperty(locale, slug);
  } catch {
    return (
      <div className="container page">
        <ApiErrorState dict={dict} retryHref={`/${locale}/properties/${slug}`} />
      </div>
    );
  }
  if (!property) notFound();
  const p = property;

  const mapHref = p.location
    ? `https://www.google.com/maps/search/?api=1&query=${p.location.lat},${p.location.lng}`
    : null;

  const details: [string, string][] = [
    [dict.search.type, dict.types[p.type]],
    [dict.listing.rooms, String(p.rooms)],
    [t.bathroomsLabel, String(p.bathrooms)],
    [t.areaLabel, fmt(t.area, { n: p.area })],
  ];
  if (p.floor != null && p.totalFloors != null) {
    details.push([t.floor, fmt(t.floorValue, { floor: p.floor, total: p.totalFloors })]);
  } else if (p.totalFloors != null) {
    details.push([t.floor, plural(locale, t.floors, p.totalFloors)]);
  }

  return (
    <article className="container page property">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href={`/${locale}/properties`} className="text-link text-link--back">
          {t.back}
        </Link>
      </nav>

      <header className="property__head">
        <div>
          <p className="listing__place">
            {p.district}, {p.city.name}
          </p>
          <h1 className="property__title">{p.title}</h1>
          <PropertySpecs locale={locale} dict={dict} rooms={p.rooms} bathrooms={p.bathrooms} area={p.area} />
        </div>
        <p className="property__price">
          <strong>{formatPrice(p.price, p.currency, locale)}</strong>
          <span>{t.perMonth}</span>
        </p>
      </header>

      <Gallery
        images={p.images}
        title={p.title}
        labels={{ photo: t.photo, allPhotos: t.allPhotos, close: t.close, prev: dict.listing.prev, next: dict.listing.next }}
      />

      <div className="property__layout">
        <div className="property__main">
          <section className="property__section">
            <h2>{t.about}</h2>
            <p className="property__desc">{p.description}</p>
          </section>

          <section className="property__section">
            <h2>{t.details}</h2>
            <dl className="details">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {p.amenities.length > 0 && (
            <section className="property__section">
              <h2>{t.amenities}</h2>
              <ul className="amenities">
                {p.amenities.map((a) => (
                  <li key={a}>{dict.amenities[a as keyof typeof dict.amenities] ?? a}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="property__section">
            <h2>{t.location}</h2>
            <p className="property__address">
              {p.address && <>{p.address}, </>}
              {p.district}, {p.city.name}
            </p>
            {mapHref && (
              <a href={mapHref} target="_blank" rel="noopener noreferrer" className="text-link">
                {t.openMap}
              </a>
            )}
          </section>
        </div>

        <aside className="property__aside">
          <InquiryForm propertySlug={p.slug} locale={locale} t={dict.inquiry} />
        </aside>
      </div>

      {p.similar.length > 0 && (
        <section className="section" aria-labelledby="similar-title">
          <h2 id="similar-title" className="section__title">
            {t.similar}
          </h2>
          <div className="grid">
            {p.similar.map((s) => (
              <PropertyCard key={s.slug} property={s} locale={locale} dict={dict} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
