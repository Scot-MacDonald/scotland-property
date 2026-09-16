'use client'

import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

export function BuyerPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current)
      }
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSaving) return

    if (newPassword !== confirmPassword) {
      setMessage('')
      setError('The new passwords do not match.')
      return
    }

    setIsSaving(true)
    setMessage('')
    setError('')

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
      messageTimeoutRef.current = null
    }

    try {
      const response = await fetch('/api/change-buyer-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })

      const result = (await response.json()) as {
        ok?: boolean
        error?: string
        message?: string
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Your password could not be changed.')
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage('✓ Your password has been updated successfully.')

      messageTimeoutRef.current = setTimeout(() => {
        setMessage('')
        messageTimeoutRef.current = null
      }, 4000)
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Your password could not be changed.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="border border-black/10 bg-white">
      <div className="border-b border-black/10 px-6 py-5">
        <p className="text-xs uppercase tracking-[0.22em] text-black/40">Security</p>

        <h2 className="mt-2 text-2xl font-medium">Change password</h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
          Confirm your current password before choosing a new one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Current Password</span>

          <input
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value)
              setError('')
              setMessage('')
            }}
            className="min-h-12 w-full border border-black/15 px-4 text-sm outline-none focus:border-black"
          />
        </label>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">New Password</span>

            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value)
                setError('')
                setMessage('')
              }}
              className="min-h-12 w-full border border-black/15 px-4 text-sm outline-none focus:border-black"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Confirm New Password</span>

            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                setError('')
                setMessage('')
              }}
              className="min-h-12 w-full border border-black/15 px-4 text-sm outline-none focus:border-black"
            />
          </label>
        </div>

        <p className="text-sm text-black/50">Password must contain at least 8 characters.</p>

        {error ? (
          <p role="alert" className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {message ? (
          <p
            role="status"
            className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {message}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
            className="min-h-11 bg-black px-5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? 'Updating…' : 'Change Password'}
          </button>
        </div>
      </form>
    </section>
  )
}
