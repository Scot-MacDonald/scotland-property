'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { KeyboardEvent, MouseEvent } from 'react'

type DashboardViewingCardProps = {
  date: string
  time: string
  duration: string
  status: string
  property: string
  contactName: string
  contactEmail: string
  contactPhone?: string | null
  agent: string
  href: string
  propertyHref?: string | null
}

function getStatusClasses(status: string) {
  switch (status) {
    case 'requested':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'confirmed':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'cancelled':
      return 'border-neutral-300 bg-neutral-100 text-neutral-600'

    case 'no-show':
      return 'border-red-200 bg-red-50 text-red-700'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

function formatStatus(status: string) {
  return status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function DashboardViewingCard({
  date,
  time,
  duration,
  status,
  property,
  contactName,
  contactEmail,
  contactPhone,
  agent,
  href,
  propertyHref,
}: DashboardViewingCardProps) {
  const router = useRouter()

  function openViewing() {
    router.push(href)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openViewing()
    }
  }

  function preventCardNavigation(event: MouseEvent<HTMLElement>) {
    event.stopPropagation()
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open viewing for ${contactName}`}
      onClick={openViewing}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer border border-black/10 bg-white transition duration-150 hover:border-black/25 hover:shadow-sm focus:outline-none focus-visible:border-black focus-visible:ring-2 focus-visible:ring-black/10"
    >
      <div className="grid gap-8 p-7 lg:grid-cols-[170px_minmax(0,1.5fr)_minmax(0,1fr)_180px] lg:items-center lg:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
            Appointment
          </p>

          <p className="mt-3 text-3xl font-semibold leading-none tracking-tight text-black">
            {time}
          </p>

          <p className="mt-3 text-sm font-medium text-black/65">{date}</p>

          <p className="mt-1 text-sm text-black/40">{duration}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
            Property
          </p>

          {propertyHref ? (
            <Link
              href={propertyHref}
              onClick={preventCardNavigation}
              className="mt-3 inline-block text-lg font-semibold text-black underline-offset-4 hover:underline"
            >
              {property}
            </Link>
          ) : (
            <p className="mt-3 text-lg font-semibold text-black">{property}</p>
          )}

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
            Assigned agent
          </p>

          <p className="mt-2 text-sm text-black/70">{agent}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Contact</p>

          <p className="mt-3 text-lg font-semibold text-black">{contactName}</p>

          <div className="mt-3 space-y-1">
            <a
              href={`mailto:${contactEmail}`}
              onClick={preventCardNavigation}
              className="block break-all text-sm text-black/60 transition hover:text-black"
            >
              {contactEmail}
            </a>

            {contactPhone ? (
              <a
                href={`tel:${contactPhone}`}
                onClick={preventCardNavigation}
                className="block text-sm text-black/60 transition hover:text-black"
              >
                {contactPhone}
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex h-full flex-col items-start justify-between gap-8 lg:items-end">
          <span
            className={[
              'inline-flex border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
              getStatusClasses(status),
            ].join(' ')}
          >
            {formatStatus(status)}
          </span>

          <span className="text-sm font-semibold text-black/50 transition group-hover:text-black">
            Open viewing →
          </span>
        </div>
      </div>
    </article>
  )
}
