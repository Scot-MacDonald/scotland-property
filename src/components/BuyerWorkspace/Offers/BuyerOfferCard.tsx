import Link from 'next/link'

import type { BuyerOffer } from './types'

type BuyerOfferCardProps = {
  offer: BuyerOffer
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value?: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatStatus(status: BuyerOffer['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusClasses(status: BuyerOffer['status']) {
  switch (status) {
    case 'draft':
      return 'border-neutral-300 bg-neutral-100 text-neutral-600'

    case 'submitted':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'negotiating':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'accepted':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'rejected':
      return 'border-red-200 bg-red-50 text-red-700'

    case 'withdrawn':
      return 'border-neutral-300 bg-neutral-100 text-neutral-600'
  }
}

export function BuyerOfferCard({ offer }: BuyerOfferCardProps) {
  const propertyHref = offer.property.slug ? `/property/${offer.property.slug}` : '/properties'

  const submittedDate = formatDate(offer.submittedAt)
  const expiryDate = formatDate(offer.expiresAt)

  return (
    <article className="border border-black/10 bg-white">
      <div className="grid gap-8 p-6 lg:grid-cols-[190px_minmax(0,1fr)_minmax(240px,0.85fr)] lg:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Offer Amount
          </p>

          <p className="mt-3 text-3xl font-medium tracking-tight">
            {formatCurrency(offer.amount, offer.currency)}
          </p>

          <p className="mt-3 text-sm text-black/45">{offer.reference}</p>

          <span
            className={[
              'mt-5 inline-flex border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
              getStatusClasses(offer.status),
            ].join(' ')}
          >
            {formatStatus(offer.status)}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Property
          </p>

          <h2 className="mt-3 text-2xl font-medium leading-snug">
            <Link href={propertyHref} className="underline-offset-4 hover:underline">
              {offer.property.title}
            </Link>
          </h2>

          <div className="mt-6 grid gap-4 border-t border-black/10 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-black/40">Submitted</p>

              <p className="mt-2 text-sm text-black/70">{submittedDate || 'Not yet submitted'}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-black/40">Expires</p>

              <p className="mt-2 text-sm text-black/70">{expiryDate || 'No expiry date'}</p>
            </div>
          </div>

          {offer.agent ? (
            <div className="mt-6 border-t border-black/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Your Agent
              </p>

              <p className="mt-2 font-medium">{offer.agent.name}</p>

              {offer.agent.jobTitle ? (
                <p className="mt-1 text-sm text-black/50">{offer.agent.jobTitle}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {offer.agent.email ? (
                  <a href={`mailto:${offer.agent.email}`} className="underline underline-offset-4">
                    Email agent
                  </a>
                ) : null}

                {offer.agent.phone ? (
                  <a href={`tel:${offer.agent.phone}`} className="underline underline-offset-4">
                    Call agent
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Offer Details
          </p>

          {offer.conditions ? (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-black/40">Conditions</p>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-black/60">
                {offer.conditions}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-black/45">No conditions recorded.</p>
          )}

          {offer.vendorResponse ? (
            <div className="mt-6 border-t border-black/10 pt-5">
              <p className="text-xs uppercase tracking-[0.16em] text-black/40">Vendor Response</p>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-black/60">
                {offer.vendorResponse}
              </p>
            </div>
          ) : null}

          {offer.buyerResponse ? (
            <div className="mt-6 border-t border-black/10 pt-5">
              <p className="text-xs uppercase tracking-[0.16em] text-black/40">Your Response</p>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-black/60">
                {offer.buyerResponse}
              </p>
            </div>
          ) : null}

          <div className="mt-7">
            <Link
              href={propertyHref}
              className="inline-flex bg-black px-4 py-3 text-sm text-white transition hover:bg-black/80"
            >
              View Property
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
