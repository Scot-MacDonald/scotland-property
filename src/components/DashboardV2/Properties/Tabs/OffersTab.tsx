import Link from 'next/link'

type PropertyOffer = {
  id: string
  reference: string
  amount: number
  currency: 'GBP'
  status: 'draft' | 'submitted' | 'negotiating' | 'accepted' | 'rejected' | 'withdrawn'
  confidence: 'low' | 'medium' | 'high'
  submittedAt?: string | null
  expiresAt?: string | null
  createdAt: string
  buyerName: string
  agentName: string
}

type OffersTabProps = {
  propertyId: string
  propertyTitle: string
  askingPrice?: number | null
  offers: PropertyOffer[]
}

const openStatuses: PropertyOffer['status'][] = ['draft', 'submitted', 'negotiating']

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not submitted'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return 'Not submitted'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatLabel(value: string) {
  return value
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function getStatusClasses(status: PropertyOffer['status']) {
  switch (status) {
    case 'accepted':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'

    case 'submitted':
      return 'border-blue-200 bg-blue-50 text-blue-700'

    case 'negotiating':
      return 'border-amber-200 bg-amber-50 text-amber-700'

    case 'rejected':
      return 'border-red-200 bg-red-50 text-red-700'

    case 'withdrawn':
      return 'border-neutral-300 bg-neutral-100 text-neutral-600'

    default:
      return 'border-neutral-200 bg-white text-neutral-600'
  }
}

function getConfidenceClasses(confidence: PropertyOffer['confidence']) {
  switch (confidence) {
    case 'high':
      return 'text-emerald-700'

    case 'low':
      return 'text-red-700'

    default:
      return 'text-amber-700'
  }
}

export function OffersTab({ propertyId, propertyTitle, askingPrice, offers }: OffersTabProps) {
  const sortedOffers = [...offers].sort((first, second) => {
    const firstDate = new Date(first.submittedAt || first.createdAt).getTime()
    const secondDate = new Date(second.submittedAt || second.createdAt).getTime()

    return secondDate - firstDate
  })

  const highestOffer =
    offers.length > 0
      ? offers.reduce((highest, offer) => (offer.amount > highest.amount ? offer : highest))
      : null

  const latestOffer = sortedOffers[0] || null

  const openOffers = offers.filter((offer) => openStatuses.includes(offer.status))

  const acceptedOffer = offers
    .filter((offer) => offer.status === 'accepted')
    .sort((first, second) => second.amount - first.amount)[0]

  const highestOfferDifference =
    highestOffer && typeof askingPrice === 'number' ? highestOffer.amount - askingPrice : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border border-black/10 bg-white p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/45">
            Sales negotiation
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-black">Offers</h2>

          <p className="mt-2 text-sm text-black/55">
            Review and manage offers received for {propertyTitle}.
          </p>
        </div>

        <Link
          href={`/dashboard/offers/new?property=${propertyId}`}
          className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/80"
        >
          New offer
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="border border-black/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-black/45">
            Highest offer
          </p>

          <p className="mt-3 text-2xl font-semibold text-black">
            {highestOffer
              ? formatCurrency(highestOffer.amount, highestOffer.currency)
              : 'No offers'}
          </p>

          <p className="mt-2 text-sm text-black/50">
            {highestOfferDifference === null
              ? 'No asking price comparison'
              : highestOfferDifference === 0
                ? 'Matches asking price'
                : `${formatCurrency(
                    Math.abs(highestOfferDifference),
                    'GBP',
                  )} ${highestOfferDifference > 0 ? 'above' : 'below'} asking`}
          </p>
        </div>

        <div className="border border-black/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-black/45">
            Latest offer
          </p>

          <p className="mt-3 text-2xl font-semibold text-black">
            {latestOffer ? formatCurrency(latestOffer.amount, latestOffer.currency) : 'No offers'}
          </p>

          <p className="mt-2 text-sm text-black/50">
            {latestOffer
              ? formatDate(latestOffer.submittedAt || latestOffer.createdAt)
              : 'Nothing received yet'}
          </p>
        </div>

        <div className="border border-black/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-black/45">
            Open offers
          </p>

          <p className="mt-3 text-2xl font-semibold text-black">{openOffers.length}</p>

          <p className="mt-2 text-sm text-black/50">Draft, submitted or negotiating</p>
        </div>

        <div className="border border-black/10 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-black/45">
            Accepted offer
          </p>

          <p className="mt-3 text-2xl font-semibold text-black">
            {acceptedOffer ? formatCurrency(acceptedOffer.amount, acceptedOffer.currency) : 'None'}
          </p>

          <p className="mt-2 text-sm text-black/50">
            {acceptedOffer ? acceptedOffer.buyerName : 'No offer accepted'}
          </p>
        </div>
      </div>

      {sortedOffers.length === 0 ? (
        <div className="border border-dashed border-black/15 bg-white px-6 py-14 text-center">
          <p className="text-lg font-semibold text-black">No offers received</p>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-black/50">
            Create the first offer when a buyer expresses formal interest in this property.
          </p>

          <Link
            href={`/dashboard/offers/new?property=${propertyId}`}
            className="mt-6 inline-flex min-h-11 items-center justify-center bg-black px-5 text-sm font-semibold text-white"
          >
            Create first offer
          </Link>
        </div>
      ) : (
        <div className="border border-black/10 bg-white">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/45">
                Offer history
              </p>

              <h3 className="mt-1 text-lg font-semibold text-black">
                {sortedOffers.length} {sortedOffers.length === 1 ? 'offer' : 'offers'}
              </h3>
            </div>

            <Link
              href={`/dashboard/offers?property=${propertyId}`}
              className="text-sm font-medium text-black underline decoration-black/25 underline-offset-4"
            >
              View all offers
            </Link>
          </div>

          <div className="divide-y divide-black/10">
            {sortedOffers.map((offer) => (
              <article
                key={offer.id}
                className="grid gap-5 px-6 py-5 transition hover:bg-black/[0.02] lg:grid-cols-[minmax(180px,1.2fr)_minmax(160px,1fr)_minmax(150px,0.8fr)_minmax(160px,0.8fr)_auto] lg:items-center"
              >
                <div>
                  <Link
                    href={`/dashboard/offers/${offer.id}`}
                    className="text-lg font-semibold text-black hover:underline"
                  >
                    {formatCurrency(offer.amount, offer.currency)}
                  </Link>

                  <p className="mt-1 text-sm text-black/50">{offer.reference}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/40">
                    Buyer
                  </p>

                  <p className="mt-1 text-sm font-medium text-black">{offer.buyerName}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/40">
                    Status
                  </p>

                  <span
                    className={[
                      'mt-2 inline-flex border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                      getStatusClasses(offer.status),
                    ].join(' ')}
                  >
                    {formatLabel(offer.status)}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/40">
                    Submitted
                  </p>

                  <p className="mt-1 text-sm text-black">{formatDateTime(offer.submittedAt)}</p>

                  <p
                    className={[
                      'mt-1 text-xs font-medium',
                      getConfidenceClasses(offer.confidence),
                    ].join(' ')}
                  >
                    {formatLabel(offer.confidence)} confidence
                  </p>
                </div>

                <div className="flex items-center gap-3 lg:justify-end">
                  <Link
                    href={`/dashboard/offers/${offer.id}`}
                    className="inline-flex min-h-10 items-center justify-center border border-black/15 px-4 text-sm font-semibold text-black transition hover:border-black"
                  >
                    Open workspace
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
