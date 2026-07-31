import Link from 'next/link'

import { PropertyCardSlider } from '@/components/PropertyCardSlider'
import { formatRelativeViewedTime } from '@/lib/date/formatRelativeViewedTime'

import type {
  RecentlyViewedLocation,
  RecentlyViewedMedia,
  RecentlyViewedProperty,
} from './types'

type RecentlyViewedCardProps = {
  property: RecentlyViewedProperty
}

function getMedia(
  value: string | RecentlyViewedMedia | null | undefined,
): RecentlyViewedMedia | null {
  if (!value || typeof value === 'string') {
    return null
  }

  return value
}

function getLocationName(
  value: string | RecentlyViewedLocation | null | undefined,
): string | null {
  if (!value || typeof value === 'string') {
    return null
  }

  return value.name?.trim() || null
}

function formatPrice(price: number | null | undefined) {
  if (typeof price !== 'number') {
    return 'Price on application'
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(price)
}

function getStatusLabel(status: RecentlyViewedProperty['status']) {
  switch (status) {
    case 'reserved':
      return 'Under Offer'

    case 'sold':
      return 'Sold'

    default:
      return 'For Sale'
  }
}

export function RecentlyViewedCard({ property }: RecentlyViewedCardProps) {
  const title = property.title?.trim() || property.reference?.trim() || 'Untitled property'

  const featuredImage = getMedia(property.featuredImage)
  const gallery = Array.isArray(property.gallery)
    ? property.gallery
        .map((item) => getMedia(item))
        .filter((item): item is RecentlyViewedMedia => Boolean(item))
    : []

  const images = [
    ...(featuredImage?.url
      ? [
          {
            url: featuredImage.url,
            alt: featuredImage.alt?.trim() || title,
          },
        ]
      : []),

    ...gallery
      .filter((item) => Boolean(item.url) && item.url !== featuredImage?.url)
      .map((item) => ({
        url: item.url!,
        alt: item.alt?.trim() || title,
      })),
  ]

  const town = getLocationName(property.town)
  const region = getLocationName(property.region)
  const location = [town, region].filter(Boolean).join(', ')
  const href = property.slug ? `/property/${property.slug}` : '/properties'

  return (
    <article className="group flex h-full flex-col border border-black/10 bg-white">
      <div className="relative border-b border-black/10">
        <PropertyCardSlider images={images} title={title} />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {property.featured && (
            <span className="bg-black px-3 py-2 text-xs uppercase tracking-[0.18em] text-white">
              Featured
            </span>
          )}

          <span className="bg-white px-3 py-2 text-xs uppercase tracking-[0.18em] text-black">
            {getStatusLabel(property.status)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div>
          <p
            className="text-xs uppercase tracking-[0.2em] text-black/40"
            suppressHydrationWarning
          >
            {formatRelativeViewedTime(property.viewedAt)}
          </p>

          <p className="mt-4 text-2xl font-medium tracking-tight">
            {formatPrice(property.price)}
          </p>

          {location && <p className="mt-2 text-sm text-black/50">{location}</p>}

          <h2 className="mt-4 text-xl font-medium leading-snug">
            <Link href={href} className="underline-offset-4 hover:underline">
              {title}
            </Link>
          </h2>

          {(property.bedrooms || property.bathrooms || property.internalArea) && (
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-black/10 pt-4 text-sm text-black/55">
              {property.bedrooms ? (
                <span>
                  {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
                </span>
              ) : null}

              {property.bathrooms ? (
                <span>
                  {property.bathrooms} {property.bathrooms === 1 ? 'bathroom' : 'bathrooms'}
                </span>
              ) : null}

              {property.internalArea ? (
                <span>{property.internalArea.toLocaleString('en-GB')} sq ft</span>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-auto pt-8">
          <Link
            href={href}
            className="inline-block bg-black px-4 py-3 text-sm text-white transition hover:bg-black/80"
          >
            View listing
          </Link>
        </div>
      </div>
    </article>
  )
}
