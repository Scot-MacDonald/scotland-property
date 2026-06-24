'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AgencyLoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setStatus('loading')
    setError('')

    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setStatus('error')
      setError(data?.message || 'Login failed. Please check your details.')
      return
    }

    const role = data?.user?.role

    if (role !== 'agency-admin' && role !== 'agent' && role !== 'super-admin') {
      setStatus('error')
      setError('This login is only for agency users.')
      return
    }

    router.push('/agency/account')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border px-4 py-3"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-black px-6 py-3 text-white disabled:opacity-60"
      >
        {status === 'loading' ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
