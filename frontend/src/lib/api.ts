import type { Locale } from '@/i18n/config';
import type { City, Pagination, PropertyDetail, PropertyFilters, PropertySummary } from './types';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

// Pages are regenerated in the background at most once a minute.
// This keeps the site fast even when a free-tier backend is asleep.
const REVALIDATE_SECONDS = 60;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function get<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
  const url = new URL(`${API_URL}/api${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error?.message || res.statusText, res.status);
  }
  return res.json() as Promise<T>;
}

export async function getProperties(lang: Locale, filters: PropertyFilters = {}) {
  return get<{ data: PropertySummary[]; pagination: Pagination }>('/properties', { lang, ...filters });
}

export async function getProperty(lang: Locale, slug: string): Promise<PropertyDetail | null> {
  try {
    const res = await get<{ data: PropertyDetail }>(`/properties/${encodeURIComponent(slug)}`, { lang });
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
}

export async function getCities(lang: Locale) {
  const res = await get<{ data: City[] }>('/cities', { lang });
  return res.data;
}

export interface InquiryPayload {
  propertySlug: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  lang: Locale;
}

/** Client-side call (used by the inquiry form). */
export async function sendInquiry(payload: InquiryPayload): Promise<{ ok: true } | { ok: false; status: number }> {
  try {
    const res = await fetch(`${API_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok ? { ok: true } : { ok: false, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
