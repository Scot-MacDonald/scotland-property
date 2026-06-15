'use client'

import { useEffect, useState } from 'react'

type Props = {
  propertyId: string
}

const STORAGE_KEY = 'savedProperties'

export function SavePropertyButton({ propertyId }: Props) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedProperties = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setSaved(savedProperties.includes(propertyId))
  }, [propertyId])

  function toggleSaved(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    const savedProperties: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    const nextSavedProperties = savedProperties.includes(propertyId)
      ? savedProperties.filter((id) => id !== propertyId)
      : [...savedProperties, propertyId]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSavedProperties))
    setSaved(nextSavedProperties.includes(propertyId))
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      className="absolute right-3 top-3 z-10 bg-white/95 px-3 py-2 text-sm shadow-sm"
      aria-label={saved ? 'Remove saved property' : 'Save property'}
    >
      {saved ? '♥ Saved' : '♡ Save'}
    </button>
  )
}
