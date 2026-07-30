import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { getActivityRelationMap, type ActivityEntityType } from '@/lib/activity'

import { TimelineItem } from './TimelineItem'

type TimelineEntity = {
  entityType: ActivityEntityType
  entityId: string
}

type TimelineProps =
  | {
      entityType: ActivityEntityType
      entityId: string
      entities?: never
      limit?: number
    }
  | {
      entityType?: never
      entityId?: never
      entities: TimelineEntity[]
      limit?: number
    }

function getStartOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function getDateGroup(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Earlier'
  }

  const today = new Date()
  const todayStart = getStartOfDay(today)
  const activityStart = getStartOfDay(date)

  const differenceInDays = Math.round(
    (todayStart.getTime() - activityStart.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (differenceInDays === 0) {
    return 'Today'
  }

  if (differenceInDays === 1) {
    return 'Yesterday'
  }

  const isCurrentYear = date.getFullYear() === today.getFullYear()

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(isCurrentYear ? {} : { year: 'numeric' as const }),
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

function createEntityCondition(entity: TimelineEntity): Where {
  return {
    and: [
      {
        entityType: {
          equals: entity.entityType,
        },
      },
      {
        entityId: {
          equals: entity.entityId,
        },
      },
    ],
  }
}

function getTimelineEntities(props: TimelineProps): TimelineEntity[] {
  const entities =
    'entities' in props && props.entities
      ? props.entities
      : [
          {
            entityType: props.entityType,
            entityId: props.entityId,
          },
        ]

  const uniqueEntities = new Map<string, TimelineEntity>()

  for (const entity of entities) {
    const key = `${entity.entityType}:${entity.entityId}`

    uniqueEntities.set(key, entity)
  }

  return Array.from(uniqueEntities.values())
}

export async function Timeline(props: TimelineProps) {
  const { limit = 50 } = props
  const entities = getTimelineEntities(props)

  if (entities.length === 0) {
    return (
      <div className="border border-neutral-200 bg-white px-6 py-10 text-center">
        <p className="text-sm font-medium text-neutral-950">No activity yet</p>

        <p className="mt-1 text-sm text-neutral-500">Updates to this record will appear here.</p>
      </div>
    )
  }

  const payload = await getPayload({
    config: configPromise,
  })

  const where: Where =
    entities.length === 1
      ? createEntityCondition(entities[0])
      : {
          or: entities.map(createEntityCondition),
        }

  const result = await payload.find({
    collection: 'activities',
    depth: 1,
    limit,
    sort: '-createdAt',
    overrideAccess: true,
    where,
  })

  if (result.docs.length === 0) {
    return (
      <div className="border border-neutral-200 bg-white px-6 py-10 text-center">
        <p className="text-sm font-medium text-neutral-950">No activity yet</p>

        <p className="mt-1 text-sm text-neutral-500">Updates to this record will appear here.</p>
      </div>
    )
  }

  const relationMap = await getActivityRelationMap(payload, result.docs)

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
    <div className="space-y-9">
      {Object.entries(groupedActivities).map(([group, activities]) => (
        <section key={group}>
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            {group}
          </h2>

          <div>
            {activities.map((activity, index) => {
              const relation = relationMap[`${activity.entityType}:${activity.entityId}`]

              return (
                <TimelineItem
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  createdAt={activity.createdAt}
                  userName={getRelationshipName(activity.user)}
                  entityType={activity.entityType}
                  relation={relation}
                  severity={activity.severity}
                  metadata={activity.metadata}
                  isLast={index === activities.length - 1}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
