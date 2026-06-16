'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PropertyCardSlider } from '@/components/PropertyCardSlider'

const STORAGE_KEY = 'recentlyViewedProperties'

type Property = {
  id: string
  title: string
  slug: string
  price?: number
  featuredImage?: {
    url?: string
  }
  gallery?: {
    url?: string
  }[]
  region?: {
    name?: string
  }
  town?: {
    name?: string
  }
  bedrooms?: number
  bathrooms?: number
}

export function RecentlyViewedPreview() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecentlyViewed() {
      const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

      if (ids.length === 0) {
        setProperties([])
        setLoading(false)
        return
      }

      const res = await fetch('/api/saved-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ids.slice(0, 3) }),
      })

      const data = await res.json()

      setProperties(data.docs || [])
      setLoading(false)
    }

    loadRecentlyViewed()
  }, [])

  if (loading || properties.length === 0) return null

  return (
    <section className="mt-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            Continue Browsing
          </p>

          <h2 className="mt-2 text-3xl font-medium">Recently Viewed</h2>
        </div>

        <Link href="/recently-viewed" className="border px-4 py-2 text-sm">
          View All
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => {
          const image = property.featuredImage?.url || null

          const images = [
            ...(image ? [{ url: image, alt: property.title }] : []),
            ...(property.gallery || [])
              .filter((item) => item?.url && item.url !== image)
              .map((item) => ({
                url: item.url!,
                alt: property.title,
              })),
          ]

          return (
            <Link
              key={property.id}
              href={`/property/${property.slug}`}
              className="group block overflow-hidden border"
            >
              <PropertyCardSlider images={images} title={property.title} />

              <div className="space-y-2 px-1 pb-2 pt-4">
                <p className="text-xl font-medium">£{property.price?.toLocaleString('en-GB')}</p>

                {(property.region || property.town) && (
                  <p className="text-sm text-muted-foreground">
                    {property.town?.name ? `${property.town.name}, ` : ''}
                    {property.region?.name || ''}
                  </p>
                )}

                <h3 className="text-lg font-medium">{property.title}</h3>

                <p className="text-sm text-muted-foreground">
                  {property.bedrooms ? `${property.bedrooms} beds` : null}
                  {property.bathrooms ? ` · ${property.bathrooms} baths` : null}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
