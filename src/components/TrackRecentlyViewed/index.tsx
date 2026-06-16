'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'recentlyViewedProperties'
const MAX_ITEMS = 12

type Props = {
  propertyId: string
}

export function TrackRecentlyViewed({ propertyId }: Props) {
  useEffect(() => {
    const current: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    const next = [propertyId, ...current.filter((id) => id !== propertyId)].slice(0, MAX_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [propertyId])

  return null
}
