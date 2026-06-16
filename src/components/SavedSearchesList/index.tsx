'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'savedSearches'

type SavedSearch = {
  label: string
  queryString: string
  createdAt: string
}

function formatSearchLabel(queryString: string) {
  const params = new URLSearchParams(queryString)
  const parts: string[] = []

  const minPrice = params.get('minPrice')
  const maxPrice = params.get('maxPrice')
  const bedrooms = params.get('bedrooms')

  if (minPrice === '500000' && maxPrice === '1000000') {
    parts.push('£500k – £1m')
  } else if (minPrice === '1000000' && maxPrice === '2500000') {
    parts.push('£1m – £2.5m')
  } else if (minPrice === '2500000') {
    parts.push('£2.5m+')
  }

  if (bedrooms) {
    parts.push(`${bedrooms}+ Beds`)
  }

  if (params.get('region')) {
    parts.unshift('Selected region')
  }

  if (params.get('town')) {
    parts.unshift('Selected town')
  }

  if (params.get('type')) {
    parts.push('Selected type')
  }

  if (params.get('amenities')) {
    parts.push('Selected amenity')
  }

  return parts.length > 0 ? parts.join(' · ') : 'All properties'
}

export function SavedSearchesList() {
  const [searches, setSearches] = useState<SavedSearch[]>([])

  useEffect(() => {
    const savedSearches = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setSearches(savedSearches)
  }, [])

  function removeSearch(queryString: string) {
    const nextSearches = searches.filter((search) => search.queryString !== queryString)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSearches))
    setSearches(nextSearches)
  }

  if (searches.length === 0) {
    return (
      <div className="border p-8">
        <h2 className="text-2xl font-medium">No saved searches yet</h2>

        <p className="mt-3 text-muted-foreground">
          Save a search from the properties page to see it here.
        </p>

        <Link href="/properties" className="mt-6 inline-block bg-black px-6 py-3 text-white">
          Browse Properties
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y border">
      {searches.map((search) => (
        <div
          key={search.queryString}
          className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-lg font-medium"> {search.label}</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Saved {new Date(search.createdAt).toLocaleDateString('en-GB')}
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={`/properties?${search.queryString}`} className="border px-4 py-2 text-sm">
              View Search
            </Link>

            <button
              type="button"
              onClick={() => removeSearch(search.queryString)}
              className="border px-4 py-2 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
