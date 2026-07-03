'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AgentCreateForm() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')

    const formData = new FormData(event.currentTarget)

    const res = await fetch('/api/create-agent', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data?.error || 'Could not create agent.')
      setLoading(false)
      return
    }

    router.push('/dashboard/agents')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6">
      {error ? <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          name="name"
          required
          className="mt-2 w-full rounded-md border px-3 py-2"
          placeholder="Jane Smith"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Photo</label>
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
          className="mt-2 w-full rounded-md border px-3 py-2"
          placeholder="Senior Property Consultant"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          className="mt-2 w-full rounded-md border px-3 py-2"
          placeholder="jane@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          name="phone"
          className="mt-2 w-full rounded-md border px-3 py-2"
          placeholder="+44..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-black px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create agent'}
      </button>
    </form>
  )
}
