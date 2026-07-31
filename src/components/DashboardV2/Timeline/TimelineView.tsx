import type { Activity } from '@/payload-types'
import type { ActivityRelationMap } from '@/lib/activity'

import { TimelineItem } from './TimelineItem'

type TimelineViewProps = {
  activities: Activity[]
  relationMap: ActivityRelationMap
  compact?: boolean
  emptyTitle?: string
  emptyDescription?: string
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
    | number
    | {
        id?: string | number | null
        name?: string | null
        email?: string | null
      }
    | null
    | undefined,
) {
  if (!value || typeof value === 'string' || typeof value === 'number') {
    return null
  }

  return value.name || value.email || null
}

export function TimelineView({
  activities,
  relationMap,
  compact = false,
  emptyTitle = 'No activity yet',
  emptyDescription = 'Updates to this record will appear here.',
}: TimelineViewProps) {
  if (activities.length === 0) {
    return (
      <div
        className={
          compact ? 'py-6 text-center' : 'border border-neutral-200 bg-white px-6 py-10 text-center'
        }
      >
        <p className="text-sm font-medium text-neutral-950">{emptyTitle}</p>

        <p className="mt-1 text-sm text-neutral-500">{emptyDescription}</p>
      </div>
    )
  }

  const groupedActivities = activities.reduce<Record<string, Activity[]>>((groups, activity) => {
    const group = getDateGroup(activity.createdAt)

    groups[group] ||= []
    groups[group].push(activity)

    return groups
  }, {})

  return (
    <div className={compact ? 'space-y-6' : 'space-y-9'}>
      {Object.entries(groupedActivities).map(([group, groupActivities]) => (
        <section key={group}>
          <div className={compact ? 'mb-3 flex items-center gap-3' : 'mb-5'}>
            <h2 className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {group}
            </h2>

            {compact ? <span className="h-px flex-1 bg-neutral-200" /> : null}
          </div>

          <div>
            {groupActivities.map((activity, index) => {
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
                  isLast={index === groupActivities.length - 1}
                  compact={compact}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
