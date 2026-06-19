'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  agencyId: string
}

export function RunImportButton({ agencyId }: Props) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function runImport() {
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/run-agency-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          agencyId,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Import failed')
      }

      setMessage(
        `Import complete: ${data.created} created, ${data.updated} updated, ${data.skipped} skipped.`,
      )

      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={runImport}
        disabled={loading}
        className="border px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? 'Importing...' : 'Run Import Now'}
      </button>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  )
}
