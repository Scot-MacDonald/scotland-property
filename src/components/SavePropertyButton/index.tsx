'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

type Props = {
  propertyId: string
}

const STORAGE_KEY = 'savedProperties'

export function SavePropertyButton({ propertyId }: Props) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  useEffect(() => {
    async function checkSaved() {
      try {
        const res = await fetch('/api/saved-properties', {
          method: 'GET',
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()

          if (data.ok && Array.isArray(data.savedProperties)) {
            const accountSavedIds = data.savedProperties.map((property: any) =>
              typeof property === 'object' ? property.id : property,
            )

            setSaved(accountSavedIds.includes(propertyId))
            return
          }
        }
      } catch {
        // Guest fallback below
      }

      const localSavedProperties = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setSaved(localSavedProperties.includes(propertyId))
    }

    checkSaved()
  }, [propertyId])

  function showSavedConfirmation(nextSaved: boolean) {
    if (!nextSaved) return

    setShowSavedMessage(true)
    setTimeout(() => setShowSavedMessage(false), 800)
  }

  function saveLocally() {
    const localSavedProperties: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    const nextSavedProperties = localSavedProperties.includes(propertyId)
      ? localSavedProperties.filter((id) => id !== propertyId)
      : [...localSavedProperties, propertyId]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSavedProperties))

    const nextSaved = nextSavedProperties.includes(propertyId)

    setSaved(nextSaved)
    showSavedConfirmation(nextSaved)
  }

  async function toggleSaved(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

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
        showSavedConfirmation(data.saved)
        return
      }

      if (res.status === 401) {
        saveLocally()
        return
      }
    } catch {
      saveLocally()
      return
    } finally {
      setLoading(false)
    }

    saveLocally()
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      disabled={loading}
      className="absolute right-4 top-4 z-20 flex h-10 min-w-10 items-center justify-center border border-white/80 bg-black/70 px-3 text-white backdrop-blur transition duration-300 hover:bg-black/90 disabled:opacity-50"
      aria-label={saved ? 'Remove saved property' : 'Save property'}
    >
      {loading || showSavedMessage ? (
        <span className="text-[11px] uppercase tracking-[0.25em]">
          {loading ? 'Saving' : '✓ Saved'}
        </span>
      ) : (
        <Heart
          className={`h-5 w-5 transition-all duration-300 ${
            saved ? 'scale-110 fill-white' : 'scale-100'
          }`}
        />
      )}
    </button>
  )
}
