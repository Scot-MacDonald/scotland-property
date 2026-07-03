'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm('Delete this property?')

    if (!confirmed) return

    setLoading(true)

    const res = await fetch('/api/delete-property', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: propertyId,
      }),
    })

    if (!res.ok) {
      alert('Could not delete property.')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="border border-red-200 px-3 py-2 text-sm text-red-600"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
