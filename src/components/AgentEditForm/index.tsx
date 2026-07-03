'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AgentEditForm({ agent }: { agent: any }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)

    formData.append('id', agent.id)

    const res = await fetch('/api/update-agent', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data?.error || 'Could not update agent.')
      setLoading(false)
      return
    }

    router.push('/dashboard/agents')
    router.refresh()
  }

  const photo = typeof agent.photo === 'object' && agent.photo?.url ? agent.photo.url : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6">
      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {photo && (
        <div>
          <p className="mb-2 text-sm font-medium">Current photo</p>

          <img src={photo} alt={agent.name} className="h-32 w-32 object-cover" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Name</label>

        <input
          name="name"
          defaultValue={agent.name}
          required
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">New photo</label>

        <input
          name="photo"
          type="file"
          accept="image/*"
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Job title</label>

        <input
          name="jobTitle"
          defaultValue={agent.jobTitle || ''}
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>

        <input
          name="email"
          type="email"
          defaultValue={agent.email || ''}
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Phone</label>

        <input
          name="phone"
          defaultValue={agent.phone || ''}
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <button type="submit" disabled={loading} className="rounded-md bg-black px-5 py-3 text-white">
        {loading ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}
