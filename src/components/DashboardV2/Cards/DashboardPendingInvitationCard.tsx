'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { cancelTeamInvitationAction } from '@/app/(frontend)/dashboard/settings/team/actions'

function formatRole(role: string) {
  if (role === 'agency-admin') return 'Agency Admin'
  if (role === 'agency-staff') return 'Agency Staff'

  return role.replaceAll('-', ' ')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function DashboardPendingInvitationCard({
  id,
  name,
  email,
  role,
  status,
  expiresAt,
  canManage,
}: {
  id: string
  name: string
  email: string
  role: string
  status: string
  expiresAt: string
  canManage: boolean
}) {
  const router = useRouter()

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCancel() {
    if (isSubmitting) return

    setError('')
    setIsSubmitting(true)

    try {
      const result = await cancelTeamInvitationAction({
        invitationId: id,
      })

      if (!result.success) {
        setError(result.message)
        return
      }

      router.refresh()
    } catch {
      setError('Unable to cancel this invitation.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <article className="border border-black/10 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-black/40">{status}</p>

          <h3 className="mt-2 text-lg font-medium">{name}</h3>

          <p className="mt-1 text-sm text-black/55">{email}</p>
        </div>

        <span className="border border-black/10 px-2 py-1 text-xs uppercase tracking-[0.15em]">
          {formatRole(role)}
        </span>
      </div>

      <p className="mt-5 text-sm text-black/45">Expires {formatDate(expiresAt)}</p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {canManage && status === 'pending' && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="mt-5 text-sm text-red-600 underline underline-offset-4 disabled:opacity-50"
        >
          {isSubmitting ? 'Cancelling…' : 'Cancel invitation'}
        </button>
      )}
    </article>
  )
}
