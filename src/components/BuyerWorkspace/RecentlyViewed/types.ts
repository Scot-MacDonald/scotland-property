export type RecentlyViewedMedia = {
  id?: string
  url?: string | null
  alt?: string | null
}

export type RecentlyViewedLocation = {
  id?: string
  name?: string | null
}

export type RecentlyViewedProperty = {
  id: string
  title?: string | null
  slug?: string | null
  reference?: string | null
  price?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  internalArea?: number | null
  status?: 'for-sale' | 'reserved' | 'sold' | null
  featured?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
  featuredImage?: string | RecentlyViewedMedia | null
  gallery?: Array<string | RecentlyViewedMedia> | null
  region?: string | RecentlyViewedLocation | null
  town?: string | RecentlyViewedLocation | null
  viewedAt: string
}
