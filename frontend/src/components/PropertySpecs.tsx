import type { Locale } from '@/i18n/config';
import { fmt, plural, type Dictionary } from '@/i18n';

interface Props {
  locale: Locale;
  dict: Dictionary;
  rooms: number;
  bathrooms?: number;
  area: number;
}

/** Rooms / baths / area as a short, evenly spaced row. */
export default function PropertySpecs({ locale, dict, rooms, bathrooms, area }: Props) {
  return (
    <ul className="specs">
      <li>{plural(locale, dict.property.rooms, rooms)}</li>
      {bathrooms != null && <li>{plural(locale, dict.property.bathrooms, bathrooms)}</li>}
      <li>{fmt(dict.property.area, { n: area })}</li>
    </ul>
  );
}
