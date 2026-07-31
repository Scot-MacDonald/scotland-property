import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { DashboardHeader } from '@/components/DashboardV2/Layout/DashboardHeader'
import { DashboardLayout } from '@/components/DashboardV2/Layout/DashboardLayout'
import { DashboardWorkspace } from '@/components/DashboardV2/Layout/DashboardWorkspace'
import { TimelineView } from '@/components/DashboardV2/Timeline/TimelineView'
import { getActivityRelationMap } from '@/lib/activity'
import { getDashboardContext } from '@/lib/dashboard/getDashboardContext'
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

export default async function DashboardActivityPage() {
  const payload = await getPayload({
    config: configPromise,
  })

  const requestHeaders = await headers()

  const { user } = await payload.auth({
    headers: requestHeaders,
  })

  if (!user || user.collection !== 'users') {
    redirect('/login')
  }

  const dashboardUser = user as any
  const isSuperAdmin = dashboardUser.role === 'super-admin'
  const agencyId = getRelationshipId(dashboardUser.agency)

  if (!isSuperAdmin && !agencyId) {
    redirect('/login')
  }

  const [dashboard, result] = await Promise.all([
    getDashboardContext({
      payload,
      user: dashboardUser,
    }),

    payload.find({
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
      overrideAccess: true,
    }),
  ])

  const activities = result.docs as Activity[]
  const relationMap = await getActivityRelationMap(payload, activities)

  const agencyName =
    dashboard.agency?.name ||
    (typeof dashboardUser.name === 'string' ? dashboardUser.name : null) ||
    'Your Agency'

  return (
    <DashboardLayout agencyName={agencyName} navigationCounts={dashboard.navigationCounts}>
      <DashboardHeader
        eyebrow="Agency timeline"
        title="Activity"
        description={`${result.totalDocs} ${
          result.totalDocs === 1 ? 'activity' : 'activities'
        } found.`}
        actions={[
          {
            label: 'Overview',
            href: '/dashboard',
            variant: 'secondary',
          },
        ]}
      />

      <DashboardWorkspace>
        <section className="border border-black/10 bg-white p-6 sm:p-8">
          <TimelineView
            activities={activities}
            relationMap={relationMap}
            emptyTitle="No agency activity yet"
            emptyDescription="Property, task, offer, viewing and CRM updates will appear here."
          />
        </section>

        {result.totalDocs > result.docs.length ? (
          <p className="mt-8 text-center text-sm text-black/50">
            Showing the latest {result.docs.length} of {result.totalDocs} activities.
          </p>
        ) : null}
      </DashboardWorkspace>
    </DashboardLayout>
  )
}
