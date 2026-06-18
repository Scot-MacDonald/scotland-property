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
  const [loading, setLoading] = useState(false)

  const queryString = new URLSearchParams(
    Object.entries(searchParams).filter(([, value]) => Boolean(value)) as [string, string][],
  ).toString()

  const label = searchLabel || 'All properties'

  useEffect(() => {
    async function checkSaved() {
      try {
        const res = await fetch('/api/saved-searches', {
          method: 'GET',
          credentials: 'include',
        })

        const data = await res.json()

        if (data.ok && Array.isArray(data.savedSearches)) {
          setSaved(data.savedSearches.some((search: any) => search.queryString === queryString))
          return
        }
      } catch (error) {
        console.error(error)
      }

      const savedSearches = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setSaved(savedSearches.some((search: any) => search.queryString === queryString))
    }

    checkSaved()
  }, [queryString])

  async function saveSearch() {
    if (saved) return

    setLoading(true)

    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          label,
          queryString,
        }),
      })

      if (res.ok) {
        setSaved(true)
        return
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }

    const savedSearches = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    if (savedSearches.some((search: any) => search.queryString === queryString)) {
      setSaved(true)
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
    <button
      type="button"
      onClick={saveSearch}
      disabled={loading || saved}
      className="border px-4 py-2 text-sm disabled:opacity-60"
    >
      {loading ? 'Saving...' : saved ? '✓ Search Saved' : 'Save Search'}
    </button>
  )
}
