'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteAgentButton({ agentId }: { agentId: string }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm('Are you sure you want to delete this agent?')

    if (!confirmed) return

    setLoading(true)

    const res = await fetch('/api/delete-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: agentId,
      }),
    })

    if (!res.ok) {
      alert('Could not delete agent.')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="border border-red-200 px-3 py-2 text-sm text-red-600 disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}
