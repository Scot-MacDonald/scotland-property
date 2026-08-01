import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  BuyerOffersEmptyState,
  BuyerOffersList,
  type BuyerOffer,
} from '@/components/BuyerWorkspace/Offers'

function getRelationshipId(value: unknown): string | null {
  if (!value) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'object' && 'id' in value && value.id) {
    return String(value.id)
  }

  return null
}

function getProperty(value: unknown): BuyerOffer['property'] | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const id = getRelationshipId(value)

  if (!id) {
    return null
  }

  const property = value as {
    title?: string | null
    reference?: string | null
    slug?: string | null
  }

  return {
    id,
    title: property.title?.trim() || property.reference?.trim() || 'Untitled property',
    slug: property.slug || null,
  }
}

function getAgent(value: unknown): BuyerOffer['agent'] {
  if (!value || typeof value !== 'object') {
    return null
  }

  const id = getRelationshipId(value)

  if (!id) {
    return null
  }

  const agent = value as {
    name?: string | null
    email?: string | null
    phone?: string | null
    jobTitle?: string | null
  }

  return {
    id,
    name: agent.name?.trim() || agent.email?.trim() || 'Agent',
    email: agent.email,
    phone: agent.phone,
    jobTitle: agent.jobTitle,
  }
}

export default async function BuyerOffersPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    redirect('/login')
  }

  const result = await payload.find({
    collection: 'offers',
    depth: 2,
    limit: 100,
    pagination: false,
    sort: '-updatedAt',
    overrideAccess: true,
    where: {
      buyer: {
        equals: String(user.id),
      },
    },
  })

  const offers = result.docs
    .map((offer): BuyerOffer | null => {
      const property = getProperty(offer.property)

      if (!property) {
        return null
      }

      return {
        id: String(offer.id),
        reference: offer.reference || 'Offer',
        amount: typeof offer.amount === 'number' ? offer.amount : 0,
        currency: offer.currency || 'GBP',
        status: offer.status,
        submittedAt: offer.submittedAt,
        expiresAt: offer.expiresAt,
        conditions: offer.conditions,
        vendorResponse: offer.vendorResponse,
        buyerResponse: offer.buyerResponse,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        property,
        agent: getAgent(offer.agent),
      }
    })
    .filter((offer): offer is BuyerOffer => Boolean(offer))

  const activeStatuses = new Set(['draft', 'submitted', 'negotiating'])

  const activeOffers = offers.filter((offer) => activeStatuses.has(offer.status))
  const completedOffers = offers.filter((offer) => !activeStatuses.has(offer.status))

  return (
    <div className="space-y-12">
      <header className="border-b border-black/10 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">Sales Negotiation</p>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-medium tracking-tight md:text-6xl">Offers</h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
              Track submitted offers, negotiations and responses for properties you are pursuing.
            </p>
          </div>

          <p className="text-sm text-black/50">
            {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
          </p>
        </div>
      </header>

      {offers.length === 0 ? (
        <BuyerOffersEmptyState />
      ) : (
        <>
          <section>
            <div className="mb-5 flex items-center gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
                Active
              </h2>

              <span className="h-px flex-1 bg-black/10" />

              <span className="text-sm text-black/45">{activeOffers.length}</span>
            </div>

            {activeOffers.length > 0 ? (
              <BuyerOffersList offers={activeOffers} />
            ) : (
              <div className="border border-dashed border-black/20 bg-white p-8 text-sm text-black/50">
                You have no active offers.
              </div>
            )}
          </section>

          {completedOffers.length > 0 ? (
            <section>
              <div className="mb-5 flex items-center gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
                  Completed
                </h2>

                <span className="h-px flex-1 bg-black/10" />

                <span className="text-sm text-black/45">{completedOffers.length}</span>
              </div>

              <BuyerOffersList offers={completedOffers} />
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
