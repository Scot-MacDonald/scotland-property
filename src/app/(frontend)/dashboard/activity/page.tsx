import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { ActivityFeed, type ActivityFeedItem } from '@/components/DashboardV2/Activity'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { getActivityRelationMap } from '@/lib/activity'
import type { Activity } from '@/payload-types'

function getRelationshipId(
  value:
    | string
    | number
    | {
        id?: string | number | null
      }
    | null
    | undefined,
) {
  if (!value) {
    return null
  }

  if (typeof value === 'object') {
    return value.id ? String(value.id) : null
  }

  return String(value)
}

function getRelationKey(activity: Activity) {
  return `${activity.entityType}:${activity.entityId}`
}

export default async function DashboardActivityPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user) {
    redirect('/agency/login')
  }

  const isSuperAdmin = user.collection === 'users' && user.role === 'super-admin'

  const agencyId = getRelationshipId(user.agency)

  if (!isSuperAdmin && !agencyId) {
    redirect('/agency/login')
  }

  const result = await payload.find({
    collection: 'activities',
    depth: 1,
    limit: 50,
    sort: '-createdAt',
    where: isSuperAdmin
      ? undefined
      : {
          agency: {
            equals: agencyId,
          },
        },
  })

  const activities = result.docs as Activity[]

  const relationMap = await getActivityRelationMap(payload, activities)

  const items: ActivityFeedItem[] = activities.map((activity) => ({
    activity,
    relation: relationMap[getRelationKey(activity)],
  }))

  return (
    <DashboardLayout>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-medium text-neutral-500">Agency activity</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            Activity
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            Review recent property, viewing and CRM activity across your agency.
          </p>
        </header>

        <ActivityFeed items={items} />

        {result.totalDocs > result.docs.length ? (
          <p className="mt-8 text-center text-sm text-neutral-500">
            Showing the latest {result.docs.length} of {result.totalDocs} activities.
          </p>
        ) : null}
      </main>
    </DashboardLayout>
  )
}
