'use client'

import { useEffect } from 'react'

type TrackRecentlyViewedProps = {
  propertyId: string
}

export function TrackRecentlyViewed({ propertyId }: TrackRecentlyViewedProps) {
  useEffect(() => {
    const controller = new AbortController()

    async function trackPropertyView() {
      try {
        await fetch('/api/recently-viewed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            propertyId,
          }),
          signal: controller.signal,
        })
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        console.error('Could not track recently viewed property:', error)
      }
    }

    void trackPropertyView()

    return () => {
      controller.abort()
    }
  }, [propertyId])

  return null
}
