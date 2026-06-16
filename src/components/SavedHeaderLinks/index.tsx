'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function SavedHeaderLinks() {
  const [savedPropertiesCount, setSavedPropertiesCount] = useState(0)
  const [savedSearchesCount, setSavedSearchesCount] = useState(0)

  useEffect(() => {
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]')
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]')

    setSavedPropertiesCount(savedProperties.length)
    setSavedSearchesCount(savedSearches.length)
  }, [])

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <Link href="/saved" className="border px-4 py-2">
        ♥ Saved Properties {savedPropertiesCount > 0 ? `(${savedPropertiesCount})` : ''}
      </Link>

      <Link href="/saved-searches" className="border px-4 py-2">
        🔔 Saved Searches {savedSearchesCount > 0 ? `(${savedSearchesCount})` : ''}
      </Link>
    </div>
  )
}
