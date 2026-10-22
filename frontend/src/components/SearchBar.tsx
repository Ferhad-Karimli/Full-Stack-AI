import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { City } from '@/lib/types';
import { propertyTypes } from '@/lib/types';

/** Plain GET form → /{locale}/properties?city=…  Works without JavaScript. */
export default function SearchBar({ locale, dict, cities }: { locale: Locale; dict: Dictionary; cities: City[] }) {
  return (
    <form action={`/${locale}/properties`} method="get" className="searchbar" role="search">
      <label className="searchbar__field">
        <span>{dict.search.city}</span>
        <select name="city" defaultValue="">
          <option value="">{dict.search.anyCity}</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="searchbar__field">
        <span>{dict.search.type}</span>
        <select name="type" defaultValue="">
          <option value="">{dict.search.anyType}</option>
          {propertyTypes.map((t) => (
            <option key={t} value={t}>
              {dict.types[t]}
            </option>
          ))}
        </select>
      </label>
      <label className="searchbar__field searchbar__field--grow">
        <span>{dict.search.query}</span>
        <input type="search" name="q" placeholder={dict.search.queryPlaceholder} maxLength={100} />
      </label>
      <button type="submit" className="btn btn--primary searchbar__submit">
        {dict.search.submit}
      </button>
    </form>
  );
}
