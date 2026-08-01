import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import {
  BuyerActivityTimeline,
  type BuyerActivityPropertyMap,
} from '@/components/BuyerWorkspace/Activity'
import type { Activity } from '@/payload-types'

function getMetadataPropertyId(activity: Activity) {
  const metadata = activity.metadata

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const propertyId = (metadata as Record<string, unknown>).propertyId

  return typeof propertyId === 'string' ? propertyId : null
}

export default async function BuyerActivityPage() {
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
    collection: 'activities',
    depth: 0,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
    where: {
      buyer: {
        equals: String(user.id),
      },
    },
  })

  const activities = result.docs as Activity[]

  const propertyIds = Array.from(
    new Set(
      activities
        .map((activity) => getMetadataPropertyId(activity))
        .filter((propertyId): propertyId is string => Boolean(propertyId)),
    ),
  )

  const propertyMap: BuyerActivityPropertyMap = {}

  if (propertyIds.length > 0) {
    const properties = await payload.find({
      collection: 'properties',
      depth: 0,
      limit: propertyIds.length,
      pagination: false,
      overrideAccess: true,
      where: {
        id: {
          in: propertyIds,
        },
      },
    })

    for (const property of properties.docs) {
      propertyMap[String(property.id)] = {
        id: String(property.id),
        title: property.title?.trim() || property.reference?.trim() || 'Untitled property',
        slug: property.slug || null,
      }
    }
  }

  return (
    <div className="space-y-10">
      <header className="border-b border-black/10 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-black/40">Property Journey</p>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-medium tracking-tight md:text-6xl">Activity</h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
              Follow your recently viewed homes, saved properties and important account updates.
            </p>
          </div>

          <p className="text-sm text-black/50">
            {result.totalDocs} {result.totalDocs === 1 ? 'activity' : 'activities'}
          </p>
        </div>
      </header>

      <BuyerActivityTimeline activities={activities} propertyMap={propertyMap} />

      {result.totalDocs > activities.length ? (
        <p className="text-center text-sm text-black/45">
          Showing the latest {activities.length} of {result.totalDocs} activities.
        </p>
      ) : null}
    </div>
  )
}
