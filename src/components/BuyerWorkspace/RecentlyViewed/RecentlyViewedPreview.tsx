import Link from 'next/link'

import { formatRelativeViewedTime } from '@/lib/date/formatRelativeViewedTime'

import type {
  RecentlyViewedLocation,
  RecentlyViewedMedia,
  RecentlyViewedProperty,
} from './types'

type RecentlyViewedPreviewProps = {
  properties: RecentlyViewedProperty[]
}

function getMediaUrl(
  value: string | RecentlyViewedMedia | null | undefined,
): string | null {
  if (!value || typeof value === 'string') {
    return null
  }

  return value.url || null
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

export function RecentlyViewedPreview({ properties }: RecentlyViewedPreviewProps) {
  if (properties.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-start justify-center border border-dashed border-black/20 p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-black/40">
          No recently viewed properties
        </p>

        <h3 className="mt-3 text-2xl font-medium">Continue exploring Scotland</h3>

        <p className="mt-3 max-w-xl text-sm leading-6 text-black/55">
          Properties you view while signed in will appear here for easy access.
        </p>

        <Link href="/properties" className="mt-6 bg-black px-5 py-3 text-sm text-white">
          Browse properties
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-black/10 border border-black/10 bg-white">
      {properties.map((property) => {
        const title =
          property.title?.trim() || property.reference?.trim() || 'Untitled property'

        const town = getLocationName(property.town)
        const region = getLocationName(property.region)
        const location = [town, region].filter(Boolean).join(', ')
        const imageUrl = getMediaUrl(property.featuredImage)
        const href = property.slug ? `/property/${property.slug}` : '/properties'

        return (
          <article
            key={`${property.id}-${property.viewedAt}`}
            className="grid gap-5 p-4 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center md:p-5"
          >
            <Link
              href={href}
              className="block aspect-[4/3] overflow-hidden bg-black/5 sm:aspect-[5/4]"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                />
              ) : (
                <span className="flex h-full items-center justify-center px-4 text-center text-xs uppercase tracking-[0.18em] text-black/35">
                  No image
                </span>
              )}
            </Link>

            <div className="min-w-0">
              <p
                className="text-xs uppercase tracking-[0.2em] text-black/40"
                suppressHydrationWarning
              >
                {formatRelativeViewedTime(property.viewedAt)}
              </p>

              <h3 className="mt-2 text-xl font-medium leading-snug">
                <Link href={href} className="underline-offset-4 hover:underline">
                  {title}
                </Link>
              </h3>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-black/50">
                <span>{formatPrice(property.price)}</span>

                {location && <span>{location}</span>}
              </div>
            </div>

            <Link
              href={href}
              className="justify-self-start border border-black px-4 py-3 text-sm transition hover:bg-black hover:text-white sm:justify-self-end"
            >
              View listing
            </Link>
          </article>
        )
      })}
    </div>
  )
}
