import Link from 'next/link'

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
    case 'confirmed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'completed':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'cancelled':
      return 'border-neutral-300 bg-neutral-100 text-neutral-600'

    case 'no-show':
      return 'border-red-200 bg-red-50 text-red-700'

    default:
      return 'border-amber-200 bg-amber-50 text-amber-700'
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
  return (
    <article className="border border-black/10 bg-white">
      <div className="grid gap-6 p-5 lg:grid-cols-[160px_minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
            Appointment
          </p>

          <p className="mt-2 text-lg font-semibold text-black">{date}</p>

          <p className="mt-1 text-sm text-black/60">
            {time} · {duration}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
            Property
          </p>

          {propertyHref ? (
            <Link
              href={propertyHref}
              className="mt-2 block text-base font-semibold text-black hover:underline"
            >
              {property}
            </Link>
          ) : (
            <p className="mt-2 text-base font-semibold text-black">{property}</p>
          )}

          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
            Assigned agent
          </p>

          <p className="mt-1 text-sm text-black/70">{agent}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Contact</p>

          <p className="mt-2 font-semibold text-black">{contactName}</p>

          <a
            href={`mailto:${contactEmail}`}
            className="mt-1 block break-all text-sm text-black/60 hover:text-black"
          >
            {contactEmail}
          </a>

          {contactPhone ? (
            <a
              href={`tel:${contactPhone}`}
              className="mt-1 block text-sm text-black/60 hover:text-black"
            >
              {contactPhone}
            </a>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <span
            className={[
              'inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
              getStatusClasses(status),
            ].join(' ')}
          >
            {formatStatus(status)}
          </span>

          <Link
            href={href}
            className="inline-flex min-h-10 items-center justify-center bg-black px-4 text-sm font-semibold text-white"
          >
            Open viewing
          </Link>
        </div>
      </div>
    </article>
  )
}
