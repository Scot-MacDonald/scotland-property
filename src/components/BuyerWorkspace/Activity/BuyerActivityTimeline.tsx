import type { Activity } from '@/payload-types'

import { BuyerActivityCard } from './BuyerActivityCard'
import type { BuyerActivityPropertyMap } from './types'

type BuyerActivityTimelineProps = {
  activities: Activity[]
  propertyMap: BuyerActivityPropertyMap
}

type ActivityGroup = {
  key: string
  label: string
  activities: Activity[]
}

function getDateKey(value: string) {
  const date = new Date(value)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function getStartOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function getDateLabel(value: string) {
  const date = getStartOfDay(new Date(value))
  const today = getStartOfDay(new Date())
  const differenceInDays = Math.round((today.getTime() - date.getTime()) / 86_400_000)

  if (differenceInDays === 0) {
    return 'Today'
  }

  if (differenceInDays === 1) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })
}

function getPropertyId(activity: Activity) {
  const metadata = activity.metadata

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const propertyId = (metadata as Record<string, unknown>).propertyId

  return typeof propertyId === 'string' ? propertyId : null
}

function groupActivities(activities: Activity[]) {
  const groups = new Map<string, ActivityGroup>()

  for (const activity of activities) {
    const key = getDateKey(activity.createdAt)
    const existing = groups.get(key)

    if (existing) {
      existing.activities.push(activity)
      continue
    }

    groups.set(key, {
      key,
      label: getDateLabel(activity.createdAt),
      activities: [activity],
    })
  }

  return Array.from(groups.values())
}

export function BuyerActivityTimeline({ activities, propertyMap }: BuyerActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-start justify-center border border-dashed border-black/20 bg-white p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.25em] text-black/40">No activity yet</p>

        <h2 className="mt-4 max-w-xl text-3xl font-medium tracking-tight md:text-4xl">
          Your property journey will appear here
        </h2>

        <p className="mt-5 max-w-xl text-sm leading-7 text-black/55">
          Viewed and saved properties, profile updates, viewings and offers will appear as your
          activity grows.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-9">
      {groupActivities(activities).map((group) => (
        <section key={group.key}>
          <div className="mb-4 flex items-center gap-4">
            <h2 className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
              {group.label}
            </h2>

            <span className="h-px flex-1 bg-black/10" />
          </div>

          <div className="space-y-3">
            {group.activities.map((activity) => {
              const propertyId = getPropertyId(activity)

              return (
                <BuyerActivityCard
                  key={activity.id}
                  activity={activity}
                  property={propertyId ? propertyMap[propertyId] : undefined}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
