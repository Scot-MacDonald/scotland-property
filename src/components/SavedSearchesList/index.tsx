'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'savedSearches'

type SavedSearch = {
  id?: string
  label: string
  queryString: string
  createdAt: string
}

export function SavedSearchesList() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSearches() {
      try {
        const res = await fetch('/api/saved-searches', {
          method: 'GET',
          credentials: 'include',
        })

        const data = await res.json()

        if (data.ok && Array.isArray(data.savedSearches)) {
          setSearches(data.savedSearches)
          setLoading(false)
          return
        }
      } catch (error) {
        console.error(error)
      }

      const localSavedSearches = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setSearches(localSavedSearches)
      setLoading(false)
    }

    loadSearches()
  }, [])

  async function removeSearch(queryString: string) {
    try {
      const res = await fetch('/api/saved-searches', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          queryString,
        }),
      })

      if (res.ok) {
        const data = await res.json()

        if (data.ok && Array.isArray(data.savedSearches)) {
          setSearches(data.savedSearches)
          return
        }
      }
    } catch (error) {
      console.error(error)
    }

    const nextSearches = searches.filter((search) => search.queryString !== queryString)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSearches))
    setSearches(nextSearches)
  }

  if (loading) {
    return <div className="border p-8">Loading saved searches...</div>
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
            <p className="text-lg font-medium">{search.label}</p>

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
