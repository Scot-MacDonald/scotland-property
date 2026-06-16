'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'recentlyViewedProperties'

type Property = {
  id: string
  title: string
  slug: string
  price?: number
  featuredImage?: {
    url?: string
  }
  region?: {
    name?: string
  }
  town?: {
    name?: string
  }
  bedrooms?: number
  bathrooms?: number
}

export function RecentlyViewedList() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecentlyViewed() {
      try {
        const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

        if (ids.length === 0) {
          setProperties([])
          setLoading(false)
          return
        }

        const res = await fetch('/api/saved-properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids,
          }),
        })

        const data = await res.json()
        setProperties(data.docs || [])
      } catch (error) {
        console.error(error)
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    loadRecentlyViewed()
  }, [])

  if (loading) {
    return <p className="text-muted-foreground">Loading recently viewed properties...</p>
  }

  if (properties.length === 0) {
    return (
      <div className="border p-8">
        <h2 className="text-2xl font-medium">No recently viewed properties yet</h2>

        <p className="mt-3 text-muted-foreground">Open a property page and it will appear here.</p>

        <Link href="/properties" className="mt-6 inline-block bg-black px-6 py-3 text-white">
          Browse Properties
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => {
        const image = property.featuredImage?.url || null

        return (
          <Link
            key={property.id}
            href={`/property/${property.slug}`}
            className="block overflow-hidden border"
          >
            {image ? (
              <img src={image} alt={property.title} className="h-[320px] w-full object-cover" />
            ) : (
              <div className="flex h-[320px] items-center justify-center bg-muted text-muted-foreground">
                No image
              </div>
            )}

            <div className="space-y-2 p-6">
              <p className="text-xl font-medium">£{property.price?.toLocaleString('en-GB')}</p>

              {(property.region || property.town) && (
                <p className="text-sm text-muted-foreground">
                  {property.town?.name ? `${property.town.name}, ` : ''}
                  {property.region?.name || ''}
                </p>
              )}

              <h2 className="text-lg font-medium">{property.title}</h2>

              <p className="text-sm text-muted-foreground">
                {property.bedrooms ? `${property.bedrooms} beds` : null}
                {property.bathrooms ? ` · ${property.bathrooms} baths` : null}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
