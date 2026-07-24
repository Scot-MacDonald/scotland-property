import Link from 'next/link'

import { DashboardBadge } from '../Shared/DashboardBadge'

type DashboardOfferCardProps = {
  reference: string
  amount: string
  status: string
  confidence: string
  submittedAt: string
  property: string
  propertyHref?: string | null
  buyer: string
  buyerHref?: string | null
  agent: string
  href: string
}

function getStatusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'accepted') return 'success'

  if (status === 'submitted' || status === 'negotiating') {
    return 'warning'
  }

  if (status === 'rejected' || status === 'withdrawn') {
    return 'danger'
  }

  return 'neutral'
}

function getConfidenceClasses(confidence: string) {
  switch (confidence) {
    case 'high':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'low':
      return 'border-neutral-200 bg-neutral-50 text-neutral-500'

    default:
      return 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

function formatLabel(value: string) {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function DashboardOfferCard({
  reference,
  amount,
  status,
  confidence,
  submittedAt,
  property,
  propertyHref,
  buyer,
  buyerHref,
  agent,
  href,
}: DashboardOfferCardProps) {
  return (
    <article className="border border-black/10 bg-white p-6 transition hover:border-black/25 hover:shadow-sm lg:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <DashboardBadge tone={getStatusTone(status)}>{formatLabel(status)}</DashboardBadge>

            <span
              className={[
                'inline-flex border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
                getConfidenceClasses(confidence),
              ].join(' ')}
            >
              {formatLabel(confidence)} confidence
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                {reference}
              </p>

              <h2 className="mt-2 text-3xl font-medium tracking-tight">
                <Link href={href} className="underline-offset-4 hover:underline">
                  {amount}
                </Link>
              </h2>
            </div>

            <p className="text-sm text-black/50">{submittedAt}</p>
          </div>

          <div className="mt-6 grid gap-5 border-t border-black/10 pt-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                Property
              </p>

              {propertyHref ? (
                <Link
                  href={propertyHref}
                  className="mt-2 inline-block text-sm font-medium underline-offset-4 hover:underline"
                >
                  {property}
                </Link>
              ) : (
                <p className="mt-2 text-sm text-black/70">{property}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                Buyer
              </p>

              {buyerHref ? (
                <Link
                  href={buyerHref}
                  className="mt-2 inline-block text-sm font-medium underline-offset-4 hover:underline"
                >
                  {buyer}
                </Link>
              ) : (
                <p className="mt-2 text-sm text-black/70">{buyer}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                Assigned agent
              </p>

              <p className="mt-2 text-sm text-black/70">{agent}</p>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href={href}
            className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-sm text-white"
          >
            Open Offer
          </Link>
        </div>
      </div>
    </article>
  )
}
