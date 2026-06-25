'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ValuationLeadNotesButton({
  leadId,
  currentNotes,
}: {
  leadId: string
  currentNotes?: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(currentNotes || '')
  const [loading, setLoading] = useState(false)

  async function saveNotes() {
    setLoading(true)

    const res = await fetch('/api/update-valuation-lead-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadId,
        notes,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      alert('Could not save notes.')
      return
    }

    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
        className="mt-2 border px-3 py-2 text-sm"
      >
        Notes
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[560px] bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-2xl font-medium">Internal Notes</h3>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={8}
              className="mt-5 w-full border p-3 text-sm"
              placeholder="Add call notes, valuation details or follow-up reminders..."
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveNotes}
                disabled={loading}
                className="bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
