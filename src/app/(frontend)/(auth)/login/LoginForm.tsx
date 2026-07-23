'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { loginAction } from './actions'

export function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) return

    setError('')
    setIsSubmitting(true)

    try {
      const result = await loginAction({
        email,
        password,
      })

      if (!result.success) {
        setError(result.message)
        return
      }

      // Future 2FA challenge goes here before the final redirect.
      router.replace('/dashboard')

      router.refresh()
    } catch {
      setError('Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 grid gap-6">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs uppercase tracking-[0.2em] text-black/50"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isSubmitting}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 w-full border border-black/15 bg-white px-4 outline-none transition focus:border-black disabled:opacity-60"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="block text-xs uppercase tracking-[0.2em] text-black/50"
          >
            Password
          </label>

          <label
            htmlFor="password"
            className="block text-xs uppercase tracking-[0.2em] text-black/50"
          >
            Password
          </label>
        </div>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isSubmitting}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 w-full border border-black/15 bg-white px-4 outline-none transition focus:border-black disabled:opacity-60"
        />
      </div>

      {error && (
        <div role="alert" className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 bg-black px-6 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
