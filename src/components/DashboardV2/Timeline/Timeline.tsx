import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { ActivityEntityType } from '@/lib/activity'

import { TimelineItem } from './TimelineItem'

type TimelineProps = {
  entityType: ActivityEntityType
  entityId: string
  limit?: number
}

function getDateGroup(value: string) {
  const date = new Date(value)
  const today = new Date()

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const activityStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const differenceInDays = Math.round(
    (todayStart.getTime() - activityStart.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (differenceInDays === 0) {
    return 'Today'
  }

  if (differenceInDays === 1) {
    return 'Yesterday'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getRelationshipName(
  value:
    | string
    | {
        id?: string | null
        name?: string | null
        email?: string | null
      }
    | null
    | undefined,
) {
  if (!value || typeof value === 'string') {
    return null
  }

  return value.name || value.email || null
}

export async function Timeline({ entityType, entityId, limit = 50 }: TimelineProps) {
  const payload = await getPayload({
    config: configPromise,
  })

  const result = await payload.find({
    collection: 'activities',
    depth: 1,
    limit,
    sort: '-createdAt',
    overrideAccess: true,
    where: {
      and: [
        {
          entityType: {
            equals: entityType,
          },
        },
        {
          entityId: {
            equals: entityId,
          },
        },
      ],
    },
  })

  if (result.docs.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white px-6 py-10 text-center">
        <p className="text-sm font-medium text-neutral-950">No activity yet</p>

        <p className="mt-1 text-sm text-neutral-500">Updates to this record will appear here.</p>
      </div>
    )
  }

  const groupedActivities = result.docs.reduce<Record<string, typeof result.docs>>(
    (groups, activity) => {
      const group = getDateGroup(activity.createdAt)

      groups[group] ||= []
      groups[group].push(activity)

      return groups
    },
    {},
  )

  return (
    <div className="space-y-8">
      {Object.entries(groupedActivities).map(([group, activities]) => (
        <section key={group}>
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            {group}
          </h2>

          <div>
            {activities.map((activity, index) => (
              <TimelineItem
                key={activity.id}
                title={activity.title}
                description={activity.description}
                createdAt={activity.createdAt}
                userName={getRelationshipName(activity.user)}
                isLast={index === activities.length - 1}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
