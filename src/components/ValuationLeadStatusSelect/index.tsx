'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const options = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Valuation Booked', value: 'valuation-booked' },
  { label: 'Instruction Won', value: 'instruction-won' },
  { label: 'Lost', value: 'lost' },
]

export function ValuationLeadStatusSelect({
  leadId,
  currentStatus,
}: {
  leadId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function updateStatus(nextStatus: string) {
    setStatus(nextStatus)
    setLoading(true)

    const res = await fetch('/api/update-valuation-lead-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadId,
        status: nextStatus,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      setStatus(currentStatus)
      alert('Could not update status.')
      return
    }

    router.refresh()
  }

  return (
    <select
      value={status}
      disabled={loading}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onChange={(event) => {
        event.stopPropagation()
        updateStatus(event.target.value)
      }}
      className="w-full border bg-white px-3 py-2 text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
