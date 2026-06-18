'use client'

import { useState } from 'react'

export function BuyerSignupForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    setLoading(true)
    setError('')

    const savedProperties: string[] = JSON.parse(localStorage.getItem('savedProperties') || '[]')
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]')

    try {
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password'),
          savedProperties,
          savedSearches,
          alertsEnabled: formData.get('alertsEnabled') === 'on',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.errors?.[0]?.message || 'Registration failed')
      }

      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="border p-8">
        <h2 className="text-2xl font-medium">Thank you</h2>
        <p className="mt-3 text-muted-foreground">
          Your buyer account has been created. You can now log in.
        </p>
        <a href="/login" className="mt-6 inline-block bg-black px-6 py-3 text-white">
          Go to login
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-8">
      <h2 className="text-2xl font-medium">Create Buyer Account</h2>

      {error ? (
        <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      <input name="name" placeholder="Your name" required className="w-full border p-3" />

      <input
        name="email"
        type="email"
        placeholder="Your email"
        required
        className="w-full border p-3"
      />

      <input
        name="password"
        type="password"
        placeholder="Create a password"
        required
        minLength={8}
        className="w-full border p-3"
      />

      <label className="flex gap-3 text-sm">
        <input name="alertsEnabled" type="checkbox" defaultChecked />
        <span>Email me when new matching properties are listed.</span>
      </label>

      <button type="submit" disabled={loading} className="bg-black px-6 py-3 text-white">
        {loading ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  )
}
