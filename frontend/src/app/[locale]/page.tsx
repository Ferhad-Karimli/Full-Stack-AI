import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { getDictionary, plural } from '@/i18n';
import { getCities, getProperties } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { City, PropertySummary } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import PropertySpecs from '@/components/PropertySpecs';
import SafeImage from '@/components/SafeImage';
import SearchBar from '@/components/SearchBar';
import ApiErrorState from '@/components/ApiErrorState';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  let cities: City[] = [];
  let featured: PropertySummary[] = [];
  let latest: PropertySummary[] = [];
  let failed = false;

  try {
    const [c, f, l] = await Promise.all([
      getCities(locale),
      getProperties(locale, { featured: true, limit: 5, sort: 'price_desc' }),
      getProperties(locale, { sort: 'newest', limit: 6 }),
    ]);
    cities = c;
    featured = f.data;
    latest = l.data;
  } catch {
    failed = true;
  }

  const [lead, ...restFeatured] = featured;

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <h1 className="hero__title">{dict.hero.title}</h1>
            <p className="hero__lead">{dict.hero.lead}</p>
          </div>
          {lead && (
            <Link href={`/${locale}/properties/${lead.slug}`} className="hero__photo" aria-label={lead.title}>
              <SafeImage src={lead.coverImage} alt={lead.title} priority />
              <span className="hero__caption">
                <span>{lead.title}</span>
                <strong>
                  {formatPrice(lead.price, lead.currency, locale)} {dict.property.perMonth}
                </strong>
              </span>
            </Link>
          )}
        </div>
        <div className="container">
          <SearchBar locale={locale} dict={dict} cities={cities} />
        </div>
      </section>

      {failed ? (
        <div className="container section">
          <ApiErrorState dict={dict} retryHref={`/${locale}`} />
        </div>
      ) : (
        <>
          {cities.length > 0 && (
            <section className="section container" aria-labelledby="cities-title">
              <div className="section__head">
                <h2 id="cities-title" className="section__title">
                  {dict.home.cities}
                </h2>
                <p className="section__lead">{dict.home.citiesLead}</p>
              </div>
              <ul className="city-index">
                {cities.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/${locale}/properties?city=${c.slug}`}>
                      <span className="city-index__name">{c.name}</span>
                      <span className="city-index__count" aria-label={plural(locale, dict.listing.results, c.propertyCount)}>
                        {c.propertyCount}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {restFeatured.length > 0 && (
            <section className="section container" aria-labelledby="featured-title">
              <div className="section__head">
                <h2 id="featured-title" className="section__title">
                  {dict.home.featured}
                </h2>
                <p className="section__lead">{dict.home.featuredLead}</p>
              </div>
              <div className="featured">
                {restFeatured.map((p, i) =>
                  i === 0 ? (
                    <Link key={p.slug} href={`/${locale}/properties/${p.slug}`} className="featured__wide">
                      <div className="featured__media">
                        <SafeImage src={p.coverImage} alt={p.title} sizes="(max-width: 900px) 100vw, 60vw" />
                      </div>
                      <div className="featured__body">
                        <p className="listing__place">
                          {p.district}, {p.city.name}
                        </p>
                        <h3 className="featured__title">{p.title}</h3>
                        <PropertySpecs locale={locale} dict={dict} rooms={p.rooms} bathrooms={p.bathrooms} area={p.area} />
                        <p className="listing__price listing__price--lg">
                          <strong>{formatPrice(p.price, p.currency, locale)}</strong>
                          <span>{dict.property.perMonth}</span>
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <PropertyCard key={p.slug} property={p} locale={locale} dict={dict} />
                  )
                )}
              </div>
            </section>
          )}

          <section className="section promise" aria-labelledby="promise-title">
            <div className="container">
              <h2 id="promise-title" className="section__title">
                {dict.home.promiseTitle}
              </h2>
              <div className="promise__grid">
                {dict.home.promise.map((item) => (
                  <div key={item.title} className="promise__item">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {latest.length > 0 && (
            <section className="section container" aria-labelledby="latest-title">
              <div className="section__head section__head--row">
                <h2 id="latest-title" className="section__title">
                  {dict.home.latest}
                </h2>
                <Link href={`/${locale}/properties`} className="text-link">
                  {dict.home.seeAll}
                </Link>
              </div>
              <div className="grid">
                {latest.map((p) => (
                  <PropertyCard key={p.slug} property={p} locale={locale} dict={dict} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
