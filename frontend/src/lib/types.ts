export type PropertyType = 'apartment' | 'house' | 'villa' | 'studio' | 'penthouse';
export const propertyTypes: PropertyType[] = ['apartment', 'house', 'villa', 'studio', 'penthouse'];

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'area_desc';
export const sortOptions: SortOption[] = ['newest', 'price_asc', 'price_desc', 'area_desc'];

export interface CityRef {
  slug: string;
  name: string;
}

export interface PropertySummary {
  id: number;
  slug: string;
  type: PropertyType;
  title: string;
  district: string;
  city: CityRef;
  price: number;
  currency: string;
  pricePeriod: string;
  rooms: number;
  bathrooms: number;
  area: number;
  coverImage: string | null;
  isFeatured: boolean;
  createdAt: string;
}

export interface PropertyDetail extends PropertySummary {
  description: string;
  address: string | null;
  floor: number | null;
  totalFloors: number | null;
  amenities: string[];
  images: string[];
  location: { lat: number; lng: number } | null;
  isAvailable: boolean;
  similar: PropertySummary[];
}

export interface City {
  slug: string;
  name: string;
  imageUrl: string | null;
  propertyCount: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PropertyFilters {
  city?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  q?: string;
  featured?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
}
