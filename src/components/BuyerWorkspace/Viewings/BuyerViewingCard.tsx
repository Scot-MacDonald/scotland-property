import Link from 'next/link'

import type { BuyerViewing } from './types'

type BuyerViewingCardProps = {
  viewing: BuyerViewing
}

function formatStatus(value: BuyerViewing['status']) {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getStatusClasses(status: BuyerViewing['status']) {
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
  }
}

function formatOutcome(value: BuyerViewing['viewingOutcome']) {
  switch (value) {
    case 'interested':
      return 'Interested'

    case 'second-viewing':
      return 'Second viewing requested'

    case 'considering-offer':
      return 'Considering an offer'

    case 'offer-expected':
      return 'Offer expected'

    case 'not-interested':
      return 'Not interested'

    default:
      return null
  }
}

function getGoogleMapsHref(viewing: BuyerViewing) {
  const latitude = viewing.property.latitude
  const longitude = viewing.property.longitude

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null
  }

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
}

export function BuyerViewingCard({ viewing }: BuyerViewingCardProps) {
  const date = new Date(viewing.dateTime)

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

  const formattedTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  const propertyHref = viewing.property.slug ? `/property/${viewing.property.slug}` : '/properties'

  const directionsHref = getGoogleMapsHref(viewing)
  const outcome = formatOutcome(viewing.viewingOutcome)

  return (
    <article className="border border-black/10 bg-white">
      <div className="grid gap-8 p-6 lg:grid-cols-[180px_minmax(0,1fr)_minmax(220px,0.8fr)] lg:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Appointment
          </p>

          <p className="mt-3 text-3xl font-medium tracking-tight">{formattedTime}</p>

          <p className="mt-3 text-sm font-medium text-black/70">{formattedDate}</p>

          <p className="mt-1 text-sm text-black/45">{viewing.durationMinutes} minutes</p>

          <span
            className={[
              'mt-5 inline-flex border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
              getStatusClasses(viewing.status),
            ].join(' ')}
          >
            {formatStatus(viewing.status)}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Property
          </p>

          <h2 className="mt-3 text-2xl font-medium leading-snug">
            <Link href={propertyHref} className="underline-offset-4 hover:underline">
              {viewing.property.title}
            </Link>
          </h2>

          {viewing.agent ? (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Assigned agent
              </p>

              <p className="mt-2 font-medium">{viewing.agent.name}</p>

              {viewing.agent.jobTitle ? (
                <p className="mt-1 text-sm text-black/50">{viewing.agent.jobTitle}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {viewing.agent.email ? (
                  <a
                    href={`mailto:${viewing.agent.email}`}
                    className="underline underline-offset-4"
                  >
                    Email agent
                  </a>
                ) : null}

                {viewing.agent.phone ? (
                  <a href={`tel:${viewing.agent.phone}`} className="underline underline-offset-4">
                    Call agent
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Viewing details
          </p>

          <div className="mt-3 space-y-3 text-sm text-black/60">
            <p>{viewing.contactName}</p>

            <a
              href={`mailto:${viewing.contactEmail}`}
              className="block break-all underline underline-offset-4"
            >
              {viewing.contactEmail}
            </a>

            {viewing.contactPhone ? (
              <a
                href={`tel:${viewing.contactPhone}`}
                className="block underline underline-offset-4"
              >
                {viewing.contactPhone}
              </a>
            ) : null}
          </div>

          {outcome ? (
            <div className="mt-6 border-t border-black/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Outcome
              </p>

              <p className="mt-2 text-sm font-medium">{outcome}</p>

              {viewing.viewerRating ? (
                <p className="mt-2 text-sm text-black/55">
                  Interest rating: {viewing.viewerRating}/5
                </p>
              ) : null}
            </div>
          ) : null}

          {viewing.feedback ? (
            <div className="mt-6 border-t border-black/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Your feedback
              </p>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-black/55">
                {viewing.feedback}
              </p>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={propertyHref}
              className="bg-black px-4 py-3 text-sm text-white transition hover:bg-black/80"
            >
              View Property
            </Link>

            {directionsHref ? (
              <a
                href={directionsHref}
                target="_blank"
                rel="noreferrer"
                className="border border-black px-4 py-3 text-sm transition hover:bg-black hover:text-white"
              >
                Directions
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
