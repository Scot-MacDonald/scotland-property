import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'

import { validateInvitation } from '@/lib/invitations'

import { AcceptInvitationForm } from './AcceptInvitationForm'

function formatRole(role: string) {
  if (role === 'agency-admin') return 'Agency Admin'
  if (role === 'agency-staff') return 'Agency Staff'

  return role.replaceAll('-', ' ')
}

function formatExpiry(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{
    token: string
  }>
}) {
  const { token } = await params

  const payload = await getPayload({
    config: configPromise,
  })

  const result = await validateInvitation({
    payload,
    token,
  })

  if (!result.success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-6 py-16">
        <div className="w-full max-w-lg border border-black/10 bg-white p-8 sm:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            Scotland Luxury Estates
          </p>

          <h1 className="mt-5 text-4xl font-medium tracking-tight">Invitation unavailable</h1>

          <p className="mt-5 leading-7 text-black/55">{result.message}</p>

          <Link
            href="/login"
            className="mt-8 inline-flex min-h-11 items-center bg-black px-6 text-sm uppercase tracking-[0.18em] text-white"
          >
            Go to login
          </Link>
        </div>
      </main>
    )
  }

  const { invitation } = result

  return (
    <main className="grid min-h-screen bg-[#f7f4ef] lg:grid-cols-[1fr_560px]">
      <section className="hidden border-r border-black/10 bg-[#111] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Scotland</p>

          <p className="mt-2 text-3xl font-medium">Luxury Estates</p>
        </div>

        <div>
          <p className="max-w-xl text-5xl font-medium leading-tight">
            Join {invitation.agency.name}
          </p>

          <p className="mt-6 max-w-lg leading-7 text-white/55">
            Create your account to access your agency workspace, listings, seller leads and buyer
            enquiries.
          </p>
        </div>

        <p className="text-xs uppercase tracking-[0.2em] text-white/35">Secure team invitation</p>
      </section>

      <section className="flex items-center justify-center px-6 py-16 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <p className="text-sm uppercase tracking-[0.3em] text-black/45">Team invitation</p>

          <h1 className="mt-4 text-5xl font-medium tracking-tight">Welcome, {invitation.name}</h1>

          <p className="mt-4 leading-7 text-black/55">
            You have been invited to join{' '}
            <strong className="font-medium text-black">{invitation.agency.name}</strong> as{' '}
            {formatRole(invitation.role)}.
          </p>

          <div className="mt-6 border-y border-black/10 py-4 text-sm text-black/50">
            <p>{invitation.email}</p>
            <p className="mt-1">Invitation expires {formatExpiry(invitation.expiresAt)}</p>
          </div>

          <AcceptInvitationForm token={token} />
        </div>
      </section>
    </main>
  )
}
