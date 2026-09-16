export type SavedPropertyMedia = {
  id?: string
  url?: string | null
  alt?: string | null
}

export type SavedPropertyLocation = {
  id?: string
  name?: string | null
}

export type SavedProperty = {
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
  featuredImage?: string | SavedPropertyMedia | null
  gallery?: Array<string | SavedPropertyMedia> | null
  region?: string | SavedPropertyLocation | null
  town?: string | SavedPropertyLocation | null
}
