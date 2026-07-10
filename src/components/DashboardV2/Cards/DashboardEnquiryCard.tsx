import Link from 'next/link'

import { DashboardBadge } from '../Shared/DashboardBadge'

function getStatusTone(status: string) {
  if (status === 'new') return 'warning'
  if (status === 'contacted') return 'success'
  if (status === 'closed') return 'neutral'

  return 'neutral'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function DashboardEnquiryCard({
  id,
  name,
  email,
  phone,
  message,
  status,
  createdAt,
  property,
}: {
  id: string
  name: string
  email: string
  phone?: string | null
  message?: string | null
  status: string
  createdAt: string
  property?: {
    id: string
    title: string
    slug: string | null
  } | null
}) {
  return (
    <article className="border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <DashboardBadge tone={getStatusTone(status)}>
              {status.replaceAll('-', ' ')}
            </DashboardBadge>

            <time className="text-xs uppercase tracking-[0.18em] text-black/40">
              {formatDate(createdAt)}
            </time>
          </div>

          <h2 className="mt-4 text-2xl font-medium">{name}</h2>

          <div className="mt-3 grid gap-1 text-sm text-black/60">
            <a href={`mailto:${email}`} className="hover:text-black">
              {email}
            </a>

            {phone && (
              <a href={`tel:${phone}`} className="hover:text-black">
                {phone}
              </a>
            )}
          </div>

          {property && (
            <div className="mt-5 border-l-2 border-black/10 pl-4">
              <p className="text-xs uppercase tracking-[0.2em] text-black/40">Property</p>

              <p className="mt-1 font-medium">{property.title}</p>
            </div>
          )}

          {message && <p className="mt-5 max-w-3xl text-sm leading-6 text-black/60">{message}</p>}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">
          <Link
            href={`/dashboard/enquiries/${id}`}
            className="bg-black px-5 py-3 text-center text-sm text-white"
          >
            Open Enquiry
          </Link>

          {property?.slug && (
            <Link
              href={`/property/${property.slug}`}
              className="border border-black/10 px-5 py-3 text-center text-sm"
            >
              View Property
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
