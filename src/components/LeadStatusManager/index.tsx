'use client'

import { useState } from 'react'

type Props = {
  leadId: string
  currentStatus: string
  currentNotes?: string | null
}

export function LeadStatusManager({ leadId, currentStatus, currentNotes }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(currentNotes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    setSaved(false)

    const res = await fetch(`/api/agency-leads/${leadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        notes,
      }),
    })

    setSaving(false)

    if (res.ok) {
      setSaved(true)

      setTimeout(() => {
        setSaved(false)
      }, 3000)
    }
  }

  return (
    <div className="mt-6 border-t pt-6">
      <div className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Lead Status</label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border px-4 py-3"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="valuation-booked">Valuation Booked</option>
            <option value="instruction-won">Instruction Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Internal Notes</label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full border px-4 py-3"
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving} className="bg-black px-5 py-3 text-white">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {saved && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </div>
    </div>
  )
}
