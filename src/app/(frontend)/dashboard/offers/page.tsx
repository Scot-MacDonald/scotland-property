import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { DashboardOfferCard } from '@/components/DashboardV2/Cards/DashboardOfferCard'
import { DashboardCollection } from '@/components/DashboardV2/Collection/DashboardCollection'
import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { getDashboardContext } from '@/lib/dashboard/getDashboardContext'
import { getDashboardOffers } from '@/lib/dashboard/getDashboardOffers'

type OfferSearchParams = {
  q?: string
  status?: string
  confidence?: string
  page?: string
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatSubmittedDate(value: string | null) {
  if (!value) {
    return 'Not submitted'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Submission date unavailable'
  }

  return `Submitted ${new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)}`
}

function createPageHref({
  query,
  status,
  confidence,
  page,
}: {
  query: string
  status: string
  confidence: string
  page: number
}) {
  const params = new URLSearchParams()

  if (query) params.set('q', query)
  if (status) params.set('status', status)
  if (confidence) params.set('confidence', confidence)
  if (page > 1) params.set('page', String(page))

  const search = params.toString()

  return search ? `/dashboard/offers?${search}` : '/dashboard/offers'
}

export default async function DashboardOffersPage({
  searchParams,
}: {
  searchParams: Promise<OfferSearchParams>
}) {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { q = '', status = '', confidence = '', page: pageValue = '1' } = await searchParams

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const dashboardUser = user as any
  const parsedPage = Number.parseInt(pageValue, 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const [dashboard, offers] = await Promise.all([
    getDashboardContext({
      payload,
      user: dashboardUser,
    }),

    getDashboardOffers({
      payload,
      user: dashboardUser,
      limit: 12,
      page,
      query: q.trim(),
      status,
      confidence,
    }),
  ])

  const agencyName =
    dashboard.agency?.name ||
    (typeof dashboardUser.name === 'string' ? dashboardUser.name : null) ||
    'Your Agency'

  const filtersActive = Boolean(q || status || confidence)

  return (
    <DashboardLayout agencyName={agencyName} navigationCounts={dashboard.navigationCounts}>
      <DashboardHeader
        eyebrow="Sales Negotiation"
        title="Offers"
        description={`${offers.totalDocs} ${offers.totalDocs === 1 ? 'offer' : 'offers'} found.`}
        actions={[
          {
            label: 'Overview',
            href: '/dashboard',
            variant: 'secondary',
          },
        ]}
      />

      <DashboardWorkspace>
        <form
          method="GET"
          className="mb-8 grid gap-3 border border-black/10 bg-white p-4 lg:grid-cols-[minmax(240px,1fr)_repeat(2,minmax(160px,auto))_auto_auto]"
        >
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by reference, property or buyer..."
            className="min-h-11 border border-black/10 px-4 text-sm outline-none focus:border-black"
          />

          <select
            name="status"
            defaultValue={status}
            className="min-h-11 border border-black/10 bg-white px-4 text-sm outline-none focus:border-black"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="negotiating">Negotiating</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          <select
            name="confidence"
            defaultValue={confidence}
            className="min-h-11 border border-black/10 bg-white px-4 text-sm outline-none focus:border-black"
          >
            <option value="">All confidence levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button
            type="submit"
            className="min-h-11 bg-black px-6 text-sm uppercase tracking-[0.16em] text-white"
          >
            Filter
          </button>

          {filtersActive ? (
            <Link
              href="/dashboard/offers"
              className="inline-flex min-h-11 items-center justify-center border border-black/10 px-5 text-sm uppercase tracking-[0.16em]"
            >
              Clear
            </Link>
          ) : null}
        </form>

        <DashboardCollection
          empty={offers.docs.length === 0}
          emptyTitle="No offers found"
          emptyDescription={
            filtersActive
              ? 'Try changing your search terms or filters.'
              : 'Offers submitted for your agency properties will appear here.'
          }
          showPagination={false}
        >
          <div className="space-y-4">
            {offers.docs.map((offer) => (
              <DashboardOfferCard
                key={offer.id}
                reference={offer.reference}
                amount={formatCurrency(offer.amount, offer.currency)}
                status={offer.status}
                confidence={offer.confidence}
                submittedAt={formatSubmittedDate(offer.submittedAt)}
                property={offer.propertyTitle}
                propertyHref={offer.propertyId ? `/dashboard/properties/${offer.propertyId}` : null}
                buyer={offer.buyerName}
                buyerHref={offer.buyerId ? `/dashboard/buyers/${offer.buyerId}` : null}
                agent={offer.agentName}
                href={`/dashboard/offers/${offer.id}`}
              />
            ))}
          </div>
        </DashboardCollection>

        {offers.totalPages > 1 ? (
          <nav className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
            <p className="text-sm text-black/50">
              Page {offers.page} of {offers.totalPages}
            </p>

            <div className="flex gap-2">
              {offers.hasPrevPage ? (
                <Link
                  href={createPageHref({
                    query: q,
                    status,
                    confidence,
                    page: offers.page - 1,
                  })}
                  className="border border-black/10 px-4 py-2 text-sm hover:border-black"
                >
                  Previous
                </Link>
              ) : (
                <span className="border border-black/10 px-4 py-2 text-sm opacity-40">
                  Previous
                </span>
              )}

              {offers.hasNextPage ? (
                <Link
                  href={createPageHref({
                    query: q,
                    status,
                    confidence,
                    page: offers.page + 1,
                  })}
                  className="border border-black/10 px-4 py-2 text-sm hover:border-black"
                >
                  Next
                </Link>
              ) : (
                <span className="border border-black/10 px-4 py-2 text-sm opacity-40">Next</span>
              )}
            </div>
          </nav>
        ) : null}
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
