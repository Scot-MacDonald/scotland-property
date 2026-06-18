'use client'

import { useEffect, useState } from 'react'

type Props = {
  propertyId: string
}

const STORAGE_KEY = 'savedProperties'

export function SavePropertyButton({ propertyId }: Props) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkSaved() {
      try {
        const res = await fetch('/api/saved-properties', {
          method: 'GET',
          credentials: 'include',
        })

        const data = await res.json()

        if (data.ok && Array.isArray(data.savedProperties)) {
          const accountSavedIds = data.savedProperties.map((property: any) =>
            typeof property === 'object' ? property.id : property,
          )

          setSaved(accountSavedIds.includes(propertyId))
          return
        }
      } catch (error) {
        console.error(error)
      }

      const localSavedProperties = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setSaved(localSavedProperties.includes(propertyId))
    }

    checkSaved()
  }, [propertyId])

  async function toggleSaved(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    setLoading(true)

    try {
      const res = await fetch('/api/saved-properties', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          propertyId,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSaved(data.saved)
        return
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }

    const localSavedProperties: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    const nextSavedProperties = localSavedProperties.includes(propertyId)
      ? localSavedProperties.filter((id) => id !== propertyId)
      : [...localSavedProperties, propertyId]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSavedProperties))
    setSaved(nextSavedProperties.includes(propertyId))
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      disabled={loading}
      className="absolute right-3 top-3 z-10 bg-white/95 px-3 py-2 text-sm shadow-sm disabled:opacity-50"
      aria-label={saved ? 'Remove saved property' : 'Save property'}
    >
      {loading ? 'Saving...' : saved ? '♥ Saved' : '♡ Save'}
    </button>
  )
}
