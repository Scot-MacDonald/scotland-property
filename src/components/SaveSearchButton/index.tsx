'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'savedSearches'

type Props = {
  searchParams: {
    q?: string
    region?: string
    town?: string
    type?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
    amenities?: string
  }
  searchLabel: string
}

export function SaveSearchButton({ searchParams, searchLabel }: Props) {
  const [saved, setSaved] = useState(false)

  const queryString = new URLSearchParams(
    Object.entries(searchParams).filter(([, value]) => Boolean(value)) as [string, string][],
  ).toString()

  const label = searchLabel || 'All properties'

  useEffect(() => {
    const savedSearches = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setSaved(savedSearches.some((search: any) => search.queryString === queryString))
  }, [queryString])

  function saveSearch() {
    const savedSearches = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    if (savedSearches.some((search: any) => search.queryString === queryString)) {
      return
    }

    const nextSavedSearches = [
      ...savedSearches,
      {
        label,
        queryString,
        createdAt: new Date().toISOString(),
      },
    ]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSavedSearches))
    setSaved(true)
  }

  return (
    <button type="button" onClick={saveSearch} className="border px-4 py-2 text-sm">
      {saved ? '✓ Search Saved' : 'Save Search'}
    </button>
  )
}
