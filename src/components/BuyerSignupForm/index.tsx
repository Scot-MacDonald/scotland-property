'use client'

import { useState } from 'react'

export function BuyerSignupForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const savedProperties: string[] = JSON.parse(localStorage.getItem('savedProperties') || '[]')
  const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    setLoading(true)

    try {
      await fetch('/api/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          savedProperties,
          savedSearches,
          alertsEnabled: formData.get('alertsEnabled') === 'on',
        }),
      })

      setSuccess(true)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="border p-8">
        <h2 className="text-2xl font-medium">Thank you</h2>
        <p className="mt-3 text-muted-foreground">Your buyer profile has been created.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-8">
      <h2 className="text-2xl font-medium">Create Buyer Profile</h2>

      <input name="name" placeholder="Your name" required className="w-full border p-3" />

      <input
        name="email"
        type="email"
        placeholder="Your email"
        required
        className="w-full border p-3"
      />

      <label className="flex gap-3 text-sm">
        <input name="alertsEnabled" type="checkbox" defaultChecked />
        <span>Email me when new matching properties are listed.</span>
      </label>

      <button type="submit" disabled={loading} className="bg-black px-6 py-3 text-white">
        {loading ? 'Creating...' : 'Create Profile'}
      </button>
    </form>
  )
}
