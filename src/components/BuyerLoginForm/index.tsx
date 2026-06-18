'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BuyerLoginForm() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/buyers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      })

      if (!response.ok) {
        throw new Error('Invalid email or password')
      }

      router.push('/account')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-8">
      <h2 className="text-2xl font-medium">Buyer Login</h2>

      {error ? (
        <p className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}

      <input name="email" type="email" placeholder="Email" required className="w-full border p-3" />

      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="w-full border p-3"
      />

      <button type="submit" disabled={loading} className="bg-black px-6 py-3 text-white">
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
