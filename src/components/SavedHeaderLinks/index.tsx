'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'

type SavedCounts = {
  savedProperties: number
  savedSearches: number
}

let cachedPropertiesValue: string | null | undefined
let cachedSearchesValue: string | null | undefined
let cachedCounts: SavedCounts = {
  savedProperties: 0,
  savedSearches: 0,
}

function getStoredArrayLength(key: string): number {
  try {
    const storedValue = window.localStorage.getItem(key)
    const parsedValue: unknown = JSON.parse(storedValue || '[]')

    return Array.isArray(parsedValue) ? parsedValue.length : 0
  } catch {
    return 0
  }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener('storage', callback)
  }
}

function getSnapshot(): SavedCounts {
  const propertiesValue = window.localStorage.getItem('savedProperties')
  const searchesValue = window.localStorage.getItem('savedSearches')

  if (propertiesValue === cachedPropertiesValue && searchesValue === cachedSearchesValue) {
    return cachedCounts
  }

  cachedPropertiesValue = propertiesValue
  cachedSearchesValue = searchesValue
  cachedCounts = {
    savedProperties: getStoredArrayLength('savedProperties'),
    savedSearches: getStoredArrayLength('savedSearches'),
  }

  return cachedCounts
}

const serverSnapshot: SavedCounts = {
  savedProperties: 0,
  savedSearches: 0,
}

function getServerSnapshot(): SavedCounts {
  return serverSnapshot
}

export function SavedHeaderLinks() {
  const { savedProperties, savedSearches } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <Link href="/saved" className="border px-4 py-2">
        ♥ Saved Properties {savedProperties > 0 ? `(${savedProperties})` : ''}
      </Link>

      <Link href="/saved-searches" className="border px-4 py-2">
        🔔 Saved Searches {savedSearches > 0 ? `(${savedSearches})` : ''}
      </Link>
    </div>
  )
}
