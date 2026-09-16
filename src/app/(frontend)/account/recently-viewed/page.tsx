import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  RecentlyViewedEmptyState,
  RecentlyViewedGrid,
  type RecentlyViewedProperty,
} from '@/components/BuyerWorkspace/RecentlyViewed'

function getRelationshipId(value: unknown): string | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id
  }

  return null
}

type RecentlyViewedEntry = {
  property?: unknown
  viewedAt?: string | null
}

export default async function RecentlyViewedPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  if (!user || user.collection !== 'buyers') {
    redirect('/login')
  }

  const buyer = await payload.findByID({
    collection: 'buyers',
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })

  const recentlyViewedEntries = Array.isArray(buyer.recentlyViewed)
    ? (buyer.recentlyViewed as RecentlyViewedEntry[])
        .map((entry) => {
          const propertyId = getRelationshipId(entry.property)

          if (!propertyId || !entry.viewedAt) {
            return null
          }

          return {
            propertyId,
            viewedAt: entry.viewedAt,
          }
        })
        .filter(
          (
            entry,
          ): entry is {
            propertyId: string
            viewedAt: string
          } => Boolean(entry),
        )
    : []

  let properties: RecentlyViewedProperty[] = []

  if (recentlyViewedEntries.length > 0) {
    const result = await payload.find({
      collection: 'properties',
      depth: 2,
      limit: recentlyViewedEntries.length,
      overrideAccess: true,
      pagination: false,
      where: {
        or: recentlyViewedEntries.map((entry) => ({
          id: {
            equals: entry.propertyId,
          },
        })),
      },
    })

    const propertiesById = new Map(
      result.docs.map((property) => [String(property.id), property]),
    )

    properties = recentlyViewedEntries
      .map((entry) => {
        const property = propertiesById.get(entry.propertyId)

        if (!property) {
          return null
        }

        return {
          ...property,
          viewedAt: entry.viewedAt,
        } as unknown as RecentlyViewedProperty
      })
      .filter((property): property is RecentlyViewedProperty => Boolean(property))
  }

  return (
    <div className="space-y-10">
      <header className="border-b border-black/10 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          Browsing History
        </p>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
              Recently viewed
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
              Return to properties you have recently explored and continue building your
              shortlist.
            </p>
          </div>

          <p className="text-sm text-black/50">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>
      </header>

      {properties.length > 0 ? (
        <RecentlyViewedGrid properties={properties} />
      ) : (
        <RecentlyViewedEmptyState />
      )}
    </div>
  )
}
