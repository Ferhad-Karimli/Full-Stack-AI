import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, type Locale } from '@/i18n/config';
import { fmt, getDictionary, plural, type Dictionary } from '@/i18n';
import { getCities, getProperties } from '@/lib/api';
import { numParam, strParam } from '@/lib/format';
import { propertyTypes, sortOptions, type City, type PropertyFilters, type PropertyType, type SortOption } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import ApiErrorState from '@/components/ApiErrorState';

export async function generateMetadata({ params }: PageProps<'/[locale]/properties'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).listing.title };
}

const PAGE_SIZE = 9;

export default async function PropertiesPage({ params, searchParams }: PageProps<'/[locale]/properties'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const sp = await searchParams;

  const type = strParam(sp.type);
  const sort = strParam(sp.sort);
  const filters: PropertyFilters = {
    city: strParam(sp.city),
    type: propertyTypes.includes(type as PropertyType) ? (type as PropertyType) : undefined,
    minPrice: numParam(sp.minPrice),
    maxPrice: numParam(sp.maxPrice),
    rooms: numParam(sp.rooms),
    q: strParam(sp.q),
    sort: sortOptions.includes(sort as SortOption) ? (sort as SortOption) : 'newest',
    page: numParam(sp.page) || 1,
    limit: PAGE_SIZE,
  };

  let result: Awaited<ReturnType<typeof getProperties>> | null = null;
  let cities: City[] = [];
  try {
    [result, cities] = await Promise.all([getProperties(locale, filters), getCities(locale)]);
  } catch {
    result = null;
  }

  const baseHref = `/${locale}/properties`;
  const pageHref = (page: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, limit: undefined, page })) {
      if (v !== undefined && v !== '' && !(k === 'page' && v === 1) && !(k === 'sort' && v === 'newest')) qs.set(k, String(v));
    }
    const s = qs.toString();
    return s ? `${baseHref}?${s}` : baseHref;
  };

  return (
    <div className="container page">
      <header className="page__head">
        <h1 className="page__title">{dict.listing.title}</h1>
        {result && <p className="page__meta">{plural(locale, dict.listing.results, result.pagination.total)}</p>}
      </header>

      <div className="catalog">
        <Filters locale={locale} dict={dict} cities={cities} filters={filters} action={baseHref} />

        <section className="catalog__results" aria-live="polite">
          {!result ? (
            <ApiErrorState dict={dict} retryHref={pageHref(filters.page || 1)} />
          ) : result.data.length === 0 ? (
            <div className="state">
              <h2>{dict.listing.emptyTitle}</h2>
              <p>{dict.listing.emptyText}</p>
              <Link href={baseHref} className="btn btn--outline">
                {dict.listing.reset}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid--catalog">
                {result.data.map((p, i) => (
                  <PropertyCard key={p.slug} property={p} locale={locale} dict={dict} priority={i < 2} />
                ))}
              </div>

              {result.pagination.totalPages > 1 && (
                <nav className="pager" aria-label="Pagination">
                  {result.pagination.page > 1 ? (
                    <Link href={pageHref(result.pagination.page - 1)} className="btn btn--outline">
                      {dict.listing.prev}
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="pager__info">
                    {fmt(dict.listing.page, { page: result.pagination.page, total: result.pagination.totalPages })}
                  </span>
                  {result.pagination.page < result.pagination.totalPages ? (
                    <Link href={pageHref(result.pagination.page + 1)} className="btn btn--outline">
                      {dict.listing.next}
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Filters({
  locale,
  dict,
  cities,
  filters,
  action,
}: {
  locale: Locale;
  dict: Dictionary;
  cities: City[];
  filters: PropertyFilters;
  action: string;
}) {
  const t = dict.listing;
  // key forces the form to re-mount with fresh defaults after navigation
  const key = JSON.stringify(filters);

  return (
    <aside className="filters" aria-label={t.filters}>
      <form key={key} action={action} method="get" className="filters__form">
        <h2 className="filters__title">{t.filters}</h2>

        <label className="field">
          <span>{dict.search.query}</span>
          <input type="search" name="q" defaultValue={filters.q} placeholder={dict.search.queryPlaceholder} maxLength={100} />
        </label>

        <label className="field">
          <span>{dict.search.city}</span>
          <select name="city" defaultValue={filters.city ?? ''}>
            <option value="">{dict.search.anyCity}</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{dict.search.type}</span>
          <select name="type" defaultValue={filters.type ?? ''}>
            <option value="">{dict.search.anyType}</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {dict.types[type]}
              </option>
            ))}
          </select>
        </label>

        <div className="field-row">
          <label className="field">
            <span>{t.minPrice}, ₼</span>
            <input type="number" name="minPrice" min={0} step={50} inputMode="numeric" defaultValue={filters.minPrice} />
          </label>
          <label className="field">
            <span>{t.maxPrice}, ₼</span>
            <input type="number" name="maxPrice" min={0} step={50} inputMode="numeric" defaultValue={filters.maxPrice} />
          </label>
        </div>

        <fieldset className="field rooms">
          <legend>{t.rooms}</legend>
          <div className="rooms__options">
            {[0, 1, 2, 3, 4].map((n) => (
              <label key={n} className="chip">
                <input type="radio" name="rooms" value={n || ''} defaultChecked={(filters.rooms ?? 0) === n} />
                <span>{n === 0 ? t.anyRooms : fmt(t.roomsAtLeast, { n })}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>{t.sort}</span>
          <select name="sort" defaultValue={filters.sort}>
            {sortOptions.map((s) => (
              <option key={s} value={s}>
                {t.sortOptions[s]}
              </option>
            ))}
          </select>
        </label>

        <div className="filters__actions">
          <button type="submit" className="btn btn--primary btn--block">
            {t.apply}
          </button>
          <Link href={`/${locale}/properties`} className="text-link">
            {t.reset}
          </Link>
        </div>
      </form>
    </aside>
  );
}
