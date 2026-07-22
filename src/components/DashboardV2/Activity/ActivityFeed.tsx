import type { ActivityFeedItem } from './ActivityCard'

import { ActivityCard } from './ActivityCard'

type ActivityFeedProps = {
  items: ActivityFeedItem[]
  emptyTitle?: string
  emptyDescription?: string
}

type ActivityGroup = {
  label: string
  dateKey: string
  items: ActivityFeedItem[]
}

function getDateKey(value: string) {
  const date = new Date(value)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function getDateGroupLabel(value: string) {
  const date = startOfDay(new Date(value))
  const today = startOfDay(new Date())

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

function groupItems(items: ActivityFeedItem[]): ActivityGroup[] {
  const groups = new Map<string, ActivityGroup>()

  for (const item of items) {
    const dateKey = getDateKey(item.activity.createdAt)
    const existingGroup = groups.get(dateKey)

    if (existingGroup) {
      existingGroup.items.push(item)
      continue
    }

    groups.set(dateKey, {
      dateKey,
      label: getDateGroupLabel(item.activity.createdAt),
      items: [item],
    })
  }

  return Array.from(groups.values())
}

export function ActivityFeed({
  items,
  emptyTitle = 'No activity yet',
  emptyDescription = 'New property and viewing activity will appear here.',
}: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
        <h2 className="font-medium text-neutral-950">{emptyTitle}</h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
          {emptyDescription}
        </p>
      </div>
    )
  }

  const groups = groupItems(items)

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.dateKey}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-semibold text-neutral-950">{group.label}</h2>

            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <div className="space-y-3">
            {group.items.map((item) => (
              <ActivityCard key={item.activity.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
