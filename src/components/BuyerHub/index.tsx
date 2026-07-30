'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'

import { RecentlyViewedPreview } from '../RecentlyViewedPreview'
import { SavedPropertiesPreview } from '../SavedPropertiesPreview'

type Props = {
  savedPropertiesCount: number
  savedSearchesCount: number
}

function subscribeToRecentlyViewed(callback: () => void) {
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener('storage', callback)
  }
}

function getRecentlyViewedCount() {
  try {
    const storedValue = window.localStorage.getItem('recentlyViewedProperties')
    const viewed: unknown = JSON.parse(storedValue || '[]')

    return Array.isArray(viewed) ? viewed.length : 0
  } catch {
    return 0
  }
}

function getServerRecentlyViewedCount() {
  return 0
}

export function BuyerHub({ savedPropertiesCount, savedSearchesCount }: Props) {
  const recentlyViewed = useSyncExternalStore(
    subscribeToRecentlyViewed,
    getRecentlyViewedCount,
    getServerRecentlyViewedCount,
  )

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <Link href="/saved" className="border p-8 transition hover:bg-gray-50">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Saved</p>
          <p className="mt-4 text-5xl font-medium">{savedPropertiesCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Saved Properties</p>
        </Link>

        <Link href="/saved-searches" className="border p-8 transition hover:bg-gray-50">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Alerts</p>
          <p className="mt-4 text-5xl font-medium">{savedSearchesCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Saved Searches</p>
        </Link>

        <Link href="/recently-viewed" className="border p-8 transition hover:bg-gray-50">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Viewed</p>
          <p className="mt-4 text-5xl font-medium">{recentlyViewed}</p>
          <p className="mt-2 text-sm text-muted-foreground">Recently Viewed</p>
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="mb-6 text-3xl font-medium">Quick Actions</h2>

        <div className="grid gap-3 md:grid-cols-3">
          <Link href="/properties" className="border p-6">
            Browse Properties →
          </Link>

          <Link href="/properties/map" className="border p-6">
            Browse Map →
          </Link>

          <Link href="/agencies" className="border p-6">
            Browse Agencies →
          </Link>
        </div>
      </section>

      <RecentlyViewedPreview />

      <SavedPropertiesPreview />
    </>
  )
}
