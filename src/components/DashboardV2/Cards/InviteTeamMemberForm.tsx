'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createTeamInvitationAction } from '@/app/(frontend)/dashboard/settings/team/actions'

export function InviteTeamMemberForm() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'agency-owner' | 'agency-staff'>('agency-staff')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [invitationUrl, setInvitationUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) return

    setError('')
    setMessage('')
    setInvitationUrl('')
    setIsSubmitting(true)

    try {
      const result = await createTeamInvitationAction({
        name,
        email,
        role,
      })

      if (!result.success) {
        setError(result.message)
        return
      }

      setMessage(result.message)
      setInvitationUrl(result.invitationUrl || '')
      setName('')
      setEmail('')
      setRole('agency-staff')

      router.refresh()
    } catch {
      setError('Unable to create the invitation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-black/10 bg-white p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-black/40">Invite team member</p>

        <h2 className="mt-2 text-2xl font-medium">Add someone to your agency</h2>
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label
            htmlFor="invite-name"
            className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45"
          >
            Name
          </label>

          <input
            id="invite-name"
            type="text"
            required
            disabled={isSubmitting}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-11 w-full border border-black/10 px-4 outline-none focus:border-black disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="invite-email"
            className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45"
          >
            Email
          </label>

          <input
            id="invite-email"
            type="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-11 w-full border border-black/10 px-4 outline-none focus:border-black disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="invite-role"
            className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45"
          >
            Role
          </label>

          <select
            id="invite-role"
            value={role}
            disabled={isSubmitting}
            onChange={(event) => setRole(event.target.value as 'agency-owner' | 'agency-staff')}
            className="min-h-11 w-full border border-black/10 bg-white px-4 outline-none focus:border-black disabled:opacity-60"
          >
            <option value="agency-staff">Agency Staff</option>
            <option value="agency-owner">Agency Owner</option>
          </select>
        </div>

        {error && (
          <div role="alert" className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <p>{message}</p>

            {invitationUrl && (
              <div className="mt-3">
                <p className="text-xs uppercase tracking-[0.15em] text-green-700/70">
                  Temporary testing link
                </p>

                <a
                  href={invitationUrl}
                  className="mt-1 block break-all underline underline-offset-4"
                >
                  {invitationUrl}
                </a>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 bg-black px-5 text-sm uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Creating invitation…' : 'Create invitation'}
        </button>
      </div>
    </form>
  )
}
