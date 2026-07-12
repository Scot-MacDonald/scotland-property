'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { acceptInvitationAction } from './actions'

export function AcceptInvitationForm({ token }: { token: string }) {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) return

    setError('')
    setIsSubmitting(true)

    try {
      const result = await acceptInvitationAction({
        token,
        password,
        confirmPassword,
      })

      if (!result.success) {
        setError(result.message)
        return
      }

      router.replace('/dashboard-v2')
      router.refresh()
    } catch {
      setError('Unable to accept the invitation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 grid gap-6">
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-xs uppercase tracking-[0.2em] text-black/50"
        >
          Create password
        </label>

        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={isSubmitting}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 w-full border border-black/15 bg-white px-4 outline-none transition focus:border-black disabled:opacity-60"
        />

        <p className="mt-2 text-xs text-black/40">Use at least 8 characters.</p>
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="mb-2 block text-xs uppercase tracking-[0.2em] text-black/50"
        >
          Confirm password
        </label>

        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={isSubmitting}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
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
        {isSubmitting ? 'Creating account…' : 'Join agency'}
      </button>
    </form>
  )
}
