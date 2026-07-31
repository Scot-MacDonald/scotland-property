'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type RemoveSavedPropertyButtonProps = {
  propertyId: string
  propertyTitle: string
}

export function RemoveSavedPropertyButton({
  propertyId,
  propertyTitle,
}: RemoveSavedPropertyButtonProps) {
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRemove() {
    if (isRemoving) return

    const confirmed = window.confirm(`Remove "${propertyTitle}" from your saved properties?`)

    if (!confirmed) return

    setIsRemoving(true)
    setError(null)

    try {
      const response = await fetch('/api/saved-properties', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        saved?: boolean
        message?: string
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.message || 'Could not remove this property.')
      }

      if (result.saved) {
        throw new Error('The property could not be removed.')
      }

      router.refresh()
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Could not remove this property.',
      )
      setIsRemoving(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        className="border border-black px-4 py-3 text-sm transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRemoving ? 'Removing…' : 'Remove'}
      </button>

      {error && <p className="mt-2 max-w-xs text-xs leading-5 text-red-700">{error}</p>}
    </div>
  )
}
