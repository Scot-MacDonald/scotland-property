import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { BuyerQuickActions, BuyerStatCard } from '@/components/BuyerWorkspace/Dashboard'
import {
  RecentlyViewedPreview,
  type RecentlyViewedProperty,
} from '@/components/BuyerWorkspace/RecentlyViewed'
import {
  BuyerWorkspacePanel,
  BuyerWorkspaceSectionTitle,
} from '@/components/BuyerWorkspace/Shared'
import { SavedPropertiesPreview } from '@/components/SavedPropertiesPreview'

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

export default async function AccountPage() {
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

  const savedPropertiesCount = Array.isArray(buyer.savedProperties)
    ? buyer.savedProperties.length
    : 0

  const savedSearchesCount = Array.isArray(buyer.savedSearches)
    ? buyer.savedSearches.length
    : 0

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
        .slice(0, 3)
    : []

  let recentlyViewedProperties: RecentlyViewedProperty[] = []

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

    recentlyViewedProperties = recentlyViewedEntries
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
    <div className="space-y-14">
      <header className="border-b border-black/10 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">
          My Property Hub
        </p>

        <h1 className="mt-4 max-w-4xl text-4xl font-medium tracking-tight md:text-6xl">
          Welcome back{buyer.name ? `, ${buyer.name}` : ''}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
          Keep track of the homes that interest you, manage searches and follow your property
          activity in one place.
        </p>
      </header>

      <section>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <BuyerStatCard
            eyebrow="Favourites"
            value={savedPropertiesCount}
            label="Saved properties"
            href="/account/saved-properties"
          />

          <BuyerStatCard
            eyebrow="Alerts"
            value={savedSearchesCount}
            label="Saved searches"
            href="/account/saved-searches"
          />

          <BuyerStatCard
            eyebrow="Appointments"
            value={0}
            label="Upcoming viewings"
            href="/account/viewings"
          />

          <BuyerStatCard
            eyebrow="Negotiations"
            value={0}
            label="Active offers"
            href="/account/offers"
          />
        </div>
      </section>

      <BuyerWorkspacePanel>
        <BuyerWorkspaceSectionTitle
          eyebrow="Favourites"
          title="Saved properties"
          description="Return to the homes you have shortlisted and compare your favourites."
          href="/account/saved-properties"
        />

        <div className="p-6">
          {savedPropertiesCount > 0 ? (
            <SavedPropertiesPreview />
          ) : (
            <div className="flex min-h-56 flex-col items-start justify-center border border-dashed border-black/20 p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-black/40">
                No saved properties
              </p>

              <h3 className="mt-3 text-2xl font-medium">Start building your shortlist</h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-black/55">
                Save properties while browsing and they will appear here for easy access.
              </p>

              <Link href="/properties" className="mt-6 bg-black px-5 py-3 text-sm text-white">
                Browse properties
              </Link>
            </div>
          )}
        </div>
      </BuyerWorkspacePanel>

      <BuyerQuickActions />

      <BuyerWorkspacePanel>
        <BuyerWorkspaceSectionTitle
          eyebrow="History"
          title="Recently viewed"
          description="Quickly return to properties you explored recently."
          href="/account/recently-viewed"
        />

        <div className="p-6">
          <RecentlyViewedPreview properties={recentlyViewedProperties} />
        </div>
      </BuyerWorkspacePanel>
    </div>
  )
}
