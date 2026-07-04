'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LeadStatusForm({
  leadId,
  currentStatus,
}: {
  leadId: string
  currentStatus?: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus || 'new')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const res = await fetch('/api/update-lead-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadId,
        status,
      }),
    })

    if (!res.ok) {
      alert('Could not update lead status.')
      setLoading(false)
      return
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="border bg-white px-3 py-2 text-sm"
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="valuation-booked">Valuation booked</option>
        <option value="instruction-won">Instruction won</option>
        <option value="lost">Lost</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save status'}
      </button>
    </form>
  )
}
